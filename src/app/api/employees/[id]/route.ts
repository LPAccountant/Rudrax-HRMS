import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        designation: true,
        manager: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
        user: { select: { email: true, role: true, isActive: true } },
        salaryStructure: true,
        leaveBalances: { include: { leaveType: true } },
      },
    });

    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    if (user.role === "EMPLOYEE" && employee.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Get employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, gender, dateOfBirth, departmentId, designationId, managerId, employmentType, status, bankName, bankAccount, ifscCode, panNumber, aadharNumber, address, city, state, country, zipCode } = body;

    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(departmentId !== undefined && { departmentId: departmentId || null }),
        ...(designationId !== undefined && { designationId: designationId || null }),
        ...(managerId !== undefined && { managerId: managerId || null }),
        ...(employmentType && { employmentType }),
        ...(status && { status }),
        ...(bankName !== undefined && { bankName }),
        ...(bankAccount !== undefined && { bankAccount }),
        ...(ifscCode !== undefined && { ifscCode }),
        ...(panNumber !== undefined && { panNumber }),
        ...(aadharNumber !== undefined && { aadharNumber }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(zipCode !== undefined && { zipCode }),
      },
      include: { department: true, designation: true },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "UPDATE", entity: "Employee", entityId: employee.id, details: `Updated employee ${employee.firstName} ${employee.lastName}` },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({ where: { id: params.id } });
    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    await prisma.user.update({ where: { id: employee.userId }, data: { isActive: false } });
    await prisma.employee.update({ where: { id: params.id }, data: { status: "INACTIVE" } });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "DEACTIVATE", entity: "Employee", entityId: params.id, details: `Deactivated employee ${employee.firstName} ${employee.lastName}` },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
