import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) return NextResponse.json({ error: "Employee ID required" }, { status: 400 });

    if (user.role === "EMPLOYEE" && user.employee?.id !== employeeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const structure = await prisma.salaryStructure.findUnique({ where: { employeeId } });
    return NextResponse.json(structure);
  } catch (error) {
    console.error("Get salary structure error:", error);
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
    const { employeeId, basicSalary, hra, conveyance, medicalAllowance, specialAllowance, otherAllowance, pfContribution, esiContribution, professionalTax, tds, otherDeduction } = body;

    if (!employeeId) return NextResponse.json({ error: "Employee ID required" }, { status: 400 });

    const gross = (basicSalary || 0) + (hra || 0) + (conveyance || 0) + (medicalAllowance || 0) + (specialAllowance || 0) + (otherAllowance || 0);
    const deductions = (pfContribution || 0) + (esiContribution || 0) + (professionalTax || 0) + (tds || 0) + (otherDeduction || 0);
    const net = gross - deductions;

    const structure = await prisma.salaryStructure.upsert({
      where: { employeeId },
      update: {
        basicSalary: basicSalary || 0, hra: hra || 0, conveyance: conveyance || 0,
        medicalAllowance: medicalAllowance || 0, specialAllowance: specialAllowance || 0,
        otherAllowance: otherAllowance || 0, pfContribution: pfContribution || 0,
        esiContribution: esiContribution || 0, professionalTax: professionalTax || 0,
        tds: tds || 0, otherDeduction: otherDeduction || 0,
        grossSalary: gross, netSalary: net, ctc: gross * 12,
      },
      create: {
        employeeId, basicSalary: basicSalary || 0, hra: hra || 0, conveyance: conveyance || 0,
        medicalAllowance: medicalAllowance || 0, specialAllowance: specialAllowance || 0,
        otherAllowance: otherAllowance || 0, pfContribution: pfContribution || 0,
        esiContribution: esiContribution || 0, professionalTax: professionalTax || 0,
        tds: tds || 0, otherDeduction: otherDeduction || 0,
        grossSalary: gross, netSalary: net, ctc: gross * 12,
      },
    });

    return NextResponse.json(structure);
  } catch (error) {
    console.error("Save salary structure error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
