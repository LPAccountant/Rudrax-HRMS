import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId, newPassword } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: { OR: [{ id: employeeId }, { employeeId: employeeId }] },
      include: { user: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const password = newPassword || "Welcome@123";
    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedPassword, mustChangePassword: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET",
        entity: "User",
        entityId: employee.userId,
        details: `Password reset for ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
      },
    });

    return NextResponse.json({ success: true, message: `Password reset for ${employee.firstName} ${employee.lastName}` });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
