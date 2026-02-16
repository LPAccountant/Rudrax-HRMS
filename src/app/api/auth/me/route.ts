import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      employee: user.employee
        ? {
            id: user.employee.id,
            employeeId: user.employee.employeeId,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            departmentId: user.employee.departmentId,
            designationId: user.employee.designationId,
          }
        : null,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
