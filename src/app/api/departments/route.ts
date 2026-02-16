import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const departments = await prisma.department.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Get departments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, code, description } = await request.json();

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: { name, code: code.toUpperCase(), description: description || "" },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "CREATE", entity: "Department", entityId: department.id, details: `Created department ${name}` },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Create department error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
