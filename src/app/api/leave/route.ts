import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const employeeId = searchParams.get("employeeId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    if (employeeId) {
      where.employeeId = employeeId;
    } else if (user.role === "EMPLOYEE" && user.employee) {
      where.employeeId = user.employee.id;
    }

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          employee: { select: { firstName: true, lastName: true, employeeId: true } },
          leaveType: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return NextResponse.json({ requests, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get leave requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.employee) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { leaveTypeId, startDate, endDate, reason } = await request.json();

    if (!leaveTypeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Leave type, start date, and end date are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) days++;
      current.setDate(current.getDate() + 1);
    }

    const currentYear = new Date().getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: user.employee.id,
          leaveTypeId,
          year: currentYear,
        },
      },
    });

    if (balance && balance.remaining < days) {
      return NextResponse.json({ error: `Insufficient leave balance. Available: ${balance.remaining} days` }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: user.employee.id,
        leaveTypeId,
        startDate: start,
        endDate: end,
        days,
        reason: reason || "",
        status: "PENDING",
      },
      include: { leaveType: true },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Leave Request Submitted",
        message: `Your ${leaveRequest.leaveType.name} request for ${days} day(s) has been submitted.`,
        type: "INFO",
        link: "/dashboard/leave",
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error("Create leave request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
