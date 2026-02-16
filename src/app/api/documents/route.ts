import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || "";
    const category = searchParams.get("category") || "";
    const isTemplate = searchParams.get("isTemplate") === "true";

    const where: Record<string, unknown> = {};
    if (isTemplate) {
      where.isTemplate = true;
    } else if (employeeId) {
      where.employeeId = employeeId;
    } else if (user.role === "EMPLOYEE" && user.employee) {
      where.employeeId = user.employee.id;
    }
    if (category) where.category = category;

    const documents = await prisma.document.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, type, category, content, employeeId, isTemplate } = body;

    if (!name) return NextResponse.json({ error: "Document name is required" }, { status: 400 });

    const targetEmployeeId = employeeId || user.employee?.id || null;

    if (!checkRole(user.role, ["ADMIN", "HR"]) && !isTemplate && targetEmployeeId !== user.employee?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const document = await prisma.document.create({
      data: {
        name,
        type: type || "GENERAL",
        category: category || "OTHER",
        content: content || "",
        employeeId: isTemplate ? null : targetEmployeeId,
        isTemplate: isTemplate || false,
        uploadedBy: user.id,
      },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "CREATE", entity: "Document", entityId: document.id, details: `Created document ${name}` },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
