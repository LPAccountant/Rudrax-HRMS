import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

const COMPANY = {
  name: "Omega Tv Media Pvt Ltd",
  channel: "News India 24x7",
  address: "247/3, First Floor, D Block, Sector 63, Noida, UP 201301",
  email: "info@newsindia.tv",
  hrEmail: "hr@newsindia.tv",
  logoUrl: "/company-logo.jpeg",
};

function generateOfferLetter(employee: { firstName: string; lastName: string; employeeId: string; designation?: { title: string } | null; department?: { name: string } | null; salaryStructure?: { grossSalary: number; basicSalary: number; hra: number } | null; dateOfJoining: Date }) {
  const name = `${employee.firstName} ${employee.lastName}`;
  const desig = employee.designation?.title || "Employee";
  const dept = employee.department?.name || "";
  const salary = employee.salaryStructure?.grossSalary || 0;
  const doj = employee.dateOfJoining.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return `OFFER LETTER

Date: ${today}
Ref No: ${COMPANY.channel}/HR/OFFER/${employee.employeeId}

To,
${name}

Subject: Offer of Employment

Dear ${name},

We are pleased to offer you the position of ${desig} in the ${dept} department at ${COMPANY.name} (${COMPANY.channel}).

Your employment details are as follows:

Position: ${desig}
Department: ${dept}
Date of Joining: ${doj}
Monthly CTC: Rs. ${salary.toLocaleString("en-IN")}/-

This offer is subject to the following terms and conditions:
1. You will be on probation for a period of 6 months from the date of joining.
2. During the probation period, either party may terminate the employment with 15 days notice.
3. After confirmation, a notice period of 30 days will apply.
4. You will be governed by the company's policies, rules, and regulations.
5. You are expected to maintain confidentiality of all company information.

Please confirm your acceptance of this offer by signing and returning a copy of this letter.

We look forward to having you as part of our team.

Warm Regards,

HR Department
${COMPANY.name}
${COMPANY.channel}
${COMPANY.address}
Email: ${COMPANY.hrEmail}`;
}

function generateAppointmentLetter(employee: { firstName: string; lastName: string; employeeId: string; designation?: { title: string } | null; department?: { name: string } | null; salaryStructure?: { grossSalary: number; basicSalary: number; hra: number; conveyance: number; medicalAllowance: number; specialAllowance: number; pfContribution: number; esiContribution: number; professionalTax: number } | null; dateOfJoining: Date }) {
  const name = `${employee.firstName} ${employee.lastName}`;
  const desig = employee.designation?.title || "Employee";
  const dept = employee.department?.name || "";
  const ss = employee.salaryStructure;
  const doj = employee.dateOfJoining.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  let salaryBreakdown = "";
  if (ss) {
    salaryBreakdown = `
Salary Structure (Monthly):
--------------------------------------------
Basic Salary:        Rs. ${ss.basicSalary.toLocaleString("en-IN")}/-
HRA:                 Rs. ${ss.hra.toLocaleString("en-IN")}/-
Conveyance:          Rs. ${ss.conveyance.toLocaleString("en-IN")}/-
Medical Allowance:   Rs. ${ss.medicalAllowance.toLocaleString("en-IN")}/-
Special Allowance:   Rs. ${ss.specialAllowance.toLocaleString("en-IN")}/-
--------------------------------------------
Gross Salary:        Rs. ${ss.grossSalary.toLocaleString("en-IN")}/-

Deductions:
PF Contribution:     Rs. ${ss.pfContribution.toLocaleString("en-IN")}/-
ESI Contribution:    Rs. ${ss.esiContribution.toLocaleString("en-IN")}/-
Professional Tax:    Rs. ${ss.professionalTax.toLocaleString("en-IN")}/-
--------------------------------------------`;
  }

  return `APPOINTMENT LETTER

Date: ${today}
Ref No: ${COMPANY.channel}/HR/APPT/${employee.employeeId}

To,
${name}
Employee ID: ${employee.employeeId}

Subject: Letter of Appointment

Dear ${name},

With reference to your application and subsequent interview, we are pleased to appoint you as ${desig} in the ${dept} department at ${COMPANY.name} (${COMPANY.channel}).

Your date of joining is ${doj}.
${salaryBreakdown}

Terms & Conditions:

1. PROBATION: You will be on probation for 6 months. During this period, your services may be terminated with 15 days written notice from either side.

2. CONFIRMATION: Upon successful completion of probation, you will be confirmed in writing.

3. WORKING HOURS: Standard working hours are 9:00 AM to 6:00 PM, Monday to Saturday. Management may require additional hours as per business needs.

4. LEAVE POLICY: You are entitled to leaves as per the company leave policy.

5. NOTICE PERIOD: After confirmation, a notice period of 30 days is required from either side for termination of employment.

6. CONFIDENTIALITY: You shall not disclose any confidential information of the company during or after your employment.

7. CODE OF CONDUCT: You are expected to follow the company code of conduct and all applicable policies.

Please sign and return a copy of this letter as acceptance of the above terms.

For ${COMPANY.name}

Authorized Signatory
HR Department
${COMPANY.address}
Email: ${COMPANY.hrEmail}`;
}

function generateTerminationLetter(employee: { firstName: string; lastName: string; employeeId: string; designation?: { title: string } | null; department?: { name: string } | null; dateOfJoining: Date }, reason: string) {
  const name = `${employee.firstName} ${employee.lastName}`;
  const desig = employee.designation?.title || "Employee";
  const dept = employee.department?.name || "";
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const lastDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return `TERMINATION LETTER

Date: ${today}
Ref No: ${COMPANY.channel}/HR/TERM/${employee.employeeId}

CONFIDENTIAL

To,
${name}
Employee ID: ${employee.employeeId}
Designation: ${desig}
Department: ${dept}

Subject: Termination of Employment

Dear ${name},

This letter is to formally notify you that your employment with ${COMPANY.name} (${COMPANY.channel}) is being terminated effective ${lastDate}.

Reason for Termination:
${reason || "As discussed in the meeting with HR department."}

Please note the following:

1. Your last working day will be ${lastDate}.
2. All company property including ID card, laptop, and any other assets must be returned before your last working day.
3. Your full and final settlement will be processed within 45 days of your last working day.
4. You will receive your experience letter and relieving letter upon completion of all clearance formalities.
5. The confidentiality obligations as per your appointment letter will continue to apply even after termination.

We wish you all the best for your future endeavors.

For ${COMPANY.name}

Authorized Signatory
HR Department
${COMPANY.address}
Email: ${COMPANY.hrEmail}`;
}

function generateWarningLetter(employee: { firstName: string; lastName: string; employeeId: string; designation?: { title: string } | null; department?: { name: string } | null }, subject: string, description: string) {
  const name = `${employee.firstName} ${employee.lastName}`;
  const desig = employee.designation?.title || "Employee";
  const dept = employee.department?.name || "";
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return `WARNING LETTER

Date: ${today}
Ref No: ${COMPANY.channel}/HR/WARN/${employee.employeeId}

To,
${name}
Employee ID: ${employee.employeeId}
Designation: ${desig}
Department: ${dept}

Subject: ${subject || "Warning Notice"}

Dear ${name},

This letter serves as a formal warning regarding the following:

${description || "Violation of company policies as discussed."}

This is a serious matter and we expect immediate improvement. Please note:

1. Any further occurrence may lead to stricter disciplinary action, including termination of employment.
2. This warning letter will be placed in your personnel file.
3. You are required to submit a written explanation within 48 hours of receiving this letter.

We expect you to take this matter seriously and ensure that such incidents do not recur.

For ${COMPANY.name}

Authorized Signatory
HR Department
${COMPANY.address}
Email: ${COMPANY.hrEmail}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: Record<string, unknown> = { isTemplate: true };
    if (type) where.type = type;

    const templates = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Get letters error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { employeeId, letterType, reason, subject, description } = await request.json();

    if (!employeeId || !letterType) {
      return NextResponse.json({ error: "Employee and letter type are required" }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({
      where: { OR: [{ id: employeeId }, { employeeId: employeeId }] },
      include: { department: true, designation: true, salaryStructure: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    let content = "";
    let docName = "";
    let category = "";

    switch (letterType) {
      case "OFFER":
        content = generateOfferLetter(employee);
        docName = `Offer Letter - ${employee.firstName} ${employee.lastName}`;
        category = "OFFER_LETTER";
        break;
      case "APPOINTMENT":
        content = generateAppointmentLetter(employee);
        docName = `Appointment Letter - ${employee.firstName} ${employee.lastName}`;
        category = "APPOINTMENT";
        break;
      case "TERMINATION":
        content = generateTerminationLetter(employee, reason || "");
        docName = `Termination Letter - ${employee.firstName} ${employee.lastName}`;
        category = "TERMINATION";
        break;
      case "WARNING":
        content = generateWarningLetter(employee, subject || "", description || "");
        docName = `Warning Letter - ${employee.firstName} ${employee.lastName}`;
        category = "WARNING";
        break;
      default:
        return NextResponse.json({ error: "Invalid letter type" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        name: docName,
        type: letterType,
        category,
        content,
        employeeId: employee.id,
        uploadedBy: user.id,
        isTemplate: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "CREATE",
        entity: "Letter",
        entityId: document.id,
        details: `Generated ${letterType} letter for ${employee.firstName} ${employee.lastName}`,
      },
    });

    return NextResponse.json({ document, content });
  } catch (error) {
    console.error("Generate letter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
