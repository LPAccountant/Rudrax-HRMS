import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const [
      totalEmployees,
      activeEmployees,
      todayPresent,
      pendingLeaves,
      departments,
      recentHires,
      monthlyAttendance,
      leavesByType,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.department.findMany({ include: { _count: { select: { employees: true } } } }),
      prisma.employee.findMany({
        where: { status: "ACTIVE" },
        orderBy: { dateOfJoining: "desc" },
        take: 5,
        select: { firstName: true, lastName: true, employeeId: true, dateOfJoining: true, department: { select: { name: true } } },
      }),
      prisma.attendance.groupBy({
        by: ["status"],
        where: { date: { gte: new Date(currentYear, currentMonth - 1, 1), lte: new Date(currentYear, currentMonth, 0) } },
        _count: true,
      }),
      prisma.leaveRequest.groupBy({
        by: ["status"],
        _count: true,
        where: { createdAt: { gte: new Date(currentYear, 0, 1) } },
      }),
    ]);

    const payrollData = await prisma.payrollRecord.aggregate({
      where: { month: currentMonth, year: currentYear },
      _sum: { netSalary: true, grossEarnings: true, totalDeductions: true },
      _count: true,
    });

    const departmentStats = departments.map((d) => ({
      name: d.name,
      employees: d._count.employees,
    }));

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const attendanceTrend = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(currentYear, currentMonth - 1 - i, 1);
      const mEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      const count = await prisma.attendance.count({
        where: { date: { gte: m, lte: mEnd }, status: "PRESENT" },
      });
      attendanceTrend.push({ month: monthNames[m.getMonth()], present: count });
    }

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      todayPresent,
      pendingLeaves,
      departmentStats,
      recentHires,
      monthlyAttendance,
      leavesByType,
      payrollSummary: {
        totalNetSalary: payrollData._sum.netSalary || 0,
        totalGross: payrollData._sum.grossEarnings || 0,
        totalDeductions: payrollData._sum.totalDeductions || 0,
        processedCount: payrollData._count,
      },
      attendanceTrend,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
