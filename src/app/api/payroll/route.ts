import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const employeeId = searchParams.get("employeeId") || "";

    const where: Record<string, unknown> = { month, year };
    if (employeeId) {
      where.employeeId = employeeId;
    } else if (user.role === "EMPLOYEE" && user.employee) {
      where.employeeId = user.employee.id;
    }

    const records = await prisma.payrollRecord.findMany({
      where,
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true, department: true } } },
      orderBy: { employee: { firstName: "asc" } },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Get payroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { month, year } = await request.json();

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
    }

    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: { salaryStructure: true },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    let totalDaysInMonth = 0;
    const current = new Date(startDate);
    while (current <= endDate) {
      if (current.getDay() !== 0 && current.getDay() !== 6) totalDaysInMonth++;
      current.setDate(current.getDate() + 1);
    }

    const results = [];

    for (const emp of employees) {
      if (!emp.salaryStructure) continue;

      const attendance = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: { gte: startDate, lte: endDate },
          status: "PRESENT",
        },
      });

      const leaves = await prisma.leaveRequest.findMany({
        where: {
          employeeId: emp.id,
          status: "APPROVED",
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      });

      const presentDays = attendance.length;
      const leaveDays = leaves.reduce((sum, l) => sum + l.days, 0);
      const ss = emp.salaryStructure;

      const dailyRate = ss.grossSalary / totalDaysInMonth;
      const effectiveDays = Math.min(presentDays + leaveDays, totalDaysInMonth);
      const ratio = effectiveDays / totalDaysInMonth;

      const basicSalary = Math.round(ss.basicSalary * ratio);
      const hra = Math.round(ss.hra * ratio);
      const conveyance = Math.round(ss.conveyance * ratio);
      const medicalAllowance = Math.round(ss.medicalAllowance * ratio);
      const specialAllowance = Math.round(ss.specialAllowance * ratio);
      const otherAllowance = Math.round(ss.otherAllowance * ratio);
      const grossEarnings = basicSalary + hra + conveyance + medicalAllowance + specialAllowance + otherAllowance;

      const pfDeduction = Math.round(ss.pfContribution * ratio);
      const esiDeduction = Math.round(ss.esiContribution * ratio);
      const professionalTax = ss.professionalTax;
      const tds = Math.round(ss.tds * ratio);
      const otherDeduction = Math.round(ss.otherDeduction * ratio);
      const totalDeductions = pfDeduction + esiDeduction + professionalTax + tds + otherDeduction;

      const netSalary = grossEarnings - totalDeductions;

      const record = await prisma.payrollRecord.upsert({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
        update: {
          workingDays: totalDaysInMonth, presentDays, leaveDays, basicSalary, hra, conveyance,
          medicalAllowance, specialAllowance, otherAllowance, grossEarnings, pfDeduction,
          esiDeduction, professionalTax, tds, otherDeduction, totalDeductions, netSalary,
          status: "DRAFT",
        },
        create: {
          employeeId: emp.id, month, year, workingDays: totalDaysInMonth, presentDays, leaveDays,
          basicSalary, hra, conveyance, medicalAllowance, specialAllowance, otherAllowance,
          grossEarnings, pfDeduction, esiDeduction, professionalTax, tds, otherDeduction,
          totalDeductions, netSalary, status: "DRAFT",
        },
        include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
      });

      results.push(record);
    }

    await prisma.auditLog.create({
      data: { userId: user.id, action: "GENERATE_PAYROLL", entity: "Payroll", details: `Generated payroll for ${month}/${year}` },
    });

    return NextResponse.json({ records: results, total: results.length }, { status: 201 });
  } catch (error) {
    console.error("Generate payroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
