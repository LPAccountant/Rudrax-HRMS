import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || "";
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const where: Record<string, unknown> = {
      date: { gte: startDate, lte: endDate },
    };

    if (employeeId) {
      where.employeeId = employeeId;
    } else if (user.role === "EMPLOYEE" && user.employee) {
      where.employeeId = user.employee.id;
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.attendance.count({ where }),
    ]);

    return NextResponse.json({ records, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { employeeId, date, checkIn, checkOut, status, notes, source, location } = body;

    const targetEmployeeId = employeeId || user.employee?.id;
    if (!targetEmployeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    if (!checkRole(user.role, ["ADMIN", "HR"]) && targetEmployeeId !== user.employee?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    let workHours = 0;
    let lateMinutes = 0;
    const checkInTime = checkIn ? new Date(checkIn) : new Date();
    const checkOutTime = checkOut ? new Date(checkOut) : null;

    if (checkInTime && checkOutTime) {
      workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    }

    const expectedStart = new Date(attendanceDate);
    expectedStart.setHours(9, 0, 0, 0);
    if (checkInTime > expectedStart) {
      lateMinutes = Math.floor((checkInTime.getTime() - expectedStart.getTime()) / (1000 * 60));
    }

    const record = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: targetEmployeeId, date: attendanceDate } },
      update: {
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: status || "PRESENT",
        workHours: Math.round(workHours * 100) / 100,
        lateMinutes,
        notes: notes || "",
        source: source || "MANUAL",
        location: location || "",
      },
      create: {
        employeeId: targetEmployeeId,
        date: attendanceDate,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: status || "PRESENT",
        workHours: Math.round(workHours * 100) / 100,
        lateMinutes,
        notes: notes || "",
        source: source || "MANUAL",
        location: location || "",
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Create attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
