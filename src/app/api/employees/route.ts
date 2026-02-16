import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, checkRole } from "@/lib/auth";
import { generateEmployeeId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
      ];
    }
    if (department) where.departmentId = department;
    if (status) where.status = status;

    if (user.role === "EMPLOYEE") {
      where.userId = user.id;
    } else if (user.role === "MANAGER" && user.employee) {
      where.OR = [{ managerId: user.employee.id }, { id: user.employee.id }];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: { department: true, designation: true, user: { select: { email: true, role: true, isActive: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({ employees, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, gender, dateOfBirth, departmentId, designationId, managerId, dateOfJoining, employmentType, bankName, bankAccount, ifscCode, panNumber, aadharNumber, role } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const defaultPassword = "Welcome@123";
    const hashedPassword = await hashPassword(defaultPassword);
    const employeeId = generateEmployeeId();

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, role: role || "EMPLOYEE", mustChangePassword: true },
    });

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        userId: newUser.id,
        firstName,
        lastName,
        email,
        phone: phone || "",
        gender: gender || "",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        departmentId: departmentId || null,
        designationId: designationId || null,
        managerId: managerId || null,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
        employmentType: employmentType || "FULL_TIME",
        bankName: bankName || "",
        bankAccount: bankAccount || "",
        ifscCode: ifscCode || "",
        panNumber: panNumber || "",
        aadharNumber: aadharNumber || "",
      },
      include: { department: true, designation: true },
    });

    const leaveTypes = await prisma.leaveType.findMany({ where: { isActive: true } });
    const currentYear = new Date().getFullYear();
    for (const lt of leaveTypes) {
      if (lt.daysPerYear > 0) {
        await prisma.leaveBalance.create({
          data: { employeeId: employee.id, leaveTypeId: lt.id, year: currentYear, allocated: lt.daysPerYear, used: 0, remaining: lt.daysPerYear },
        });
      }
    }

    await prisma.auditLog.create({
      data: { userId: user.id, action: "CREATE", entity: "Employee", entityId: employee.id, details: `Created employee ${firstName} ${lastName}` },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
