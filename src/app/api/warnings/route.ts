import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || "";

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (user.role === "EMPLOYEE" && user.employee) where.employeeId = user.employee.id;

    const warnings = await prisma.warning.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(warnings);
  } catch (error) {
    console.error("Get warnings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR", "MANAGER"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId, type, subject, description } = await request.json();

    if (!employeeId || !subject) {
      return NextResponse.json({ error: "Employee and subject are required" }, { status: 400 });
    }

    const warning = await prisma.warning.create({
      data: {
        employeeId,
        type: type || "WARNING",
        subject,
        description: description || "",
        issuedBy: user.id,
      },
      include: { employee: true },
    });

    await prisma.notification.create({
      data: {
        userId: warning.employee.userId,
        title: `${type || "Warning"} Issued`,
        message: subject,
        type: "WARNING",
        link: "/dashboard/warnings",
      },
    });

    return NextResponse.json(warning, { status: 201 });
  } catch (error) {
    console.error("Create warning error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
