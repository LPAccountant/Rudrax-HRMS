import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Rudrax@12345", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "lalittheonly@gmail.com" },
    update: {},
    create: {
      email: "lalittheonly@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      mustChangePassword: true,
    },
  });

  const departments = [
    { name: "Human Resources", code: "HR", description: "Human Resources Department" },
    { name: "Engineering", code: "ENG", description: "Software Engineering Department" },
    { name: "Finance", code: "FIN", description: "Finance & Accounts Department" },
    { name: "Marketing", code: "MKT", description: "Marketing Department" },
    { name: "Operations", code: "OPS", description: "Operations Department" },
    { name: "Sales", code: "SAL", description: "Sales Department" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }

  const designations = [
    { title: "CEO", level: 10, description: "Chief Executive Officer" },
    { title: "CTO", level: 9, description: "Chief Technology Officer" },
    { title: "VP", level: 8, description: "Vice President" },
    { title: "Director", level: 7, description: "Director" },
    { title: "Senior Manager", level: 6, description: "Senior Manager" },
    { title: "Manager", level: 5, description: "Manager" },
    { title: "Team Lead", level: 4, description: "Team Lead" },
    { title: "Senior Executive", level: 3, description: "Senior Executive" },
    { title: "Executive", level: 2, description: "Executive" },
    { title: "Trainee", level: 1, description: "Trainee" },
  ];

  for (const des of designations) {
    await prisma.designation.upsert({
      where: { title: des.title },
      update: {},
      create: des,
    });
  }

  const leaveTypes = [
    { name: "Casual Leave", code: "CL", daysPerYear: 12, carryForward: false, isPaid: true },
    { name: "Sick Leave", code: "SL", daysPerYear: 12, carryForward: true, maxCarryForward: 6, isPaid: true },
    { name: "Earned Leave", code: "EL", daysPerYear: 15, carryForward: true, maxCarryForward: 30, isPaid: true },
    { name: "Maternity Leave", code: "ML", daysPerYear: 180, carryForward: false, isPaid: true },
    { name: "Paternity Leave", code: "PL", daysPerYear: 15, carryForward: false, isPaid: true },
    { name: "Compensatory Off", code: "CO", daysPerYear: 0, carryForward: false, isPaid: true },
    { name: "Leave Without Pay", code: "LWP", daysPerYear: 0, carryForward: false, isPaid: false },
  ];

  for (const lt of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { code: lt.code },
      update: {},
      create: lt,
    });
  }

  const hrDept = await prisma.department.findUnique({ where: { code: "HR" } });
  const engDept = await prisma.department.findUnique({ where: { code: "ENG" } });
  const managerDesig = await prisma.designation.findUnique({ where: { title: "Manager" } });
  const ceoDesig = await prisma.designation.findUnique({ where: { title: "CEO" } });
  const execDesig = await prisma.designation.findUnique({ where: { title: "Executive" } });

  const adminEmployee = await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      employeeId: "RDX0001",
      userId: adminUser.id,
      firstName: "Lalit",
      lastName: "Pandit",
      email: "lalittheonly@gmail.com",
      phone: "+91-9999999999",
      gender: "Male",
      departmentId: hrDept?.id,
      designationId: ceoDesig?.id,
      dateOfJoining: new Date("2024-01-01"),
      employmentType: "FULL_TIME",
      status: "ACTIVE",
    },
  });

  const hrUserPassword = await bcrypt.hash("HrUser@123", 12);
  const hrUser = await prisma.user.upsert({
    where: { email: "hr@rudrax.com" },
    update: {},
    create: {
      email: "hr@rudrax.com",
      password: hrUserPassword,
      role: "HR",
      mustChangePassword: false,
    },
  });

  await prisma.employee.upsert({
    where: { userId: hrUser.id },
    update: {},
    create: {
      employeeId: "RDX0002",
      userId: hrUser.id,
      firstName: "Priya",
      lastName: "Sharma",
      email: "hr@rudrax.com",
      phone: "+91-9888888888",
      gender: "Female",
      departmentId: hrDept?.id,
      designationId: managerDesig?.id,
      dateOfJoining: new Date("2024-02-01"),
      employmentType: "FULL_TIME",
      status: "ACTIVE",
    },
  });

  const empPassword = await bcrypt.hash("Employee@123", 12);
  const empUser = await prisma.user.upsert({
    where: { email: "employee@rudrax.com" },
    update: {},
    create: {
      email: "employee@rudrax.com",
      password: empPassword,
      role: "EMPLOYEE",
      mustChangePassword: false,
    },
  });

  await prisma.employee.upsert({
    where: { userId: empUser.id },
    update: {},
    create: {
      employeeId: "RDX0003",
      userId: empUser.id,
      firstName: "Rahul",
      lastName: "Kumar",
      email: "employee@rudrax.com",
      phone: "+91-9777777777",
      gender: "Male",
      departmentId: engDept?.id,
      designationId: execDesig?.id,
      managerId: adminEmployee.id,
      dateOfJoining: new Date("2024-03-15"),
      employmentType: "FULL_TIME",
      status: "ACTIVE",
    },
  });

  const allEmployees = await prisma.employee.findMany();
  const allLeaveTypes = await prisma.leaveType.findMany();
  const currentYear = new Date().getFullYear();

  for (const emp of allEmployees) {
    for (const lt of allLeaveTypes) {
      if (lt.daysPerYear > 0) {
        await prisma.leaveBalance.upsert({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: emp.id,
              leaveTypeId: lt.id,
              year: currentYear,
            },
          },
          update: {},
          create: {
            employeeId: emp.id,
            leaveTypeId: lt.id,
            year: currentYear,
            allocated: lt.daysPerYear,
            used: 0,
            remaining: lt.daysPerYear,
          },
        });
      }
    }

    await prisma.salaryStructure.upsert({
      where: { employeeId: emp.id },
      update: {},
      create: {
        employeeId: emp.id,
        basicSalary: 30000,
        hra: 15000,
        conveyance: 3000,
        medicalAllowance: 2500,
        specialAllowance: 5000,
        otherAllowance: 2000,
        pfContribution: 3600,
        esiContribution: 0,
        professionalTax: 200,
        tds: 2000,
        otherDeduction: 0,
        grossSalary: 57500,
        netSalary: 51700,
        ctc: 720000,
      },
    });
  }

  await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "RudraX HRMS",
      tagline: "A Product by Lalit Pandit",
      email: "lalittheonly@gmail.com",
      website: "https://newsindia24x7.co",
      primaryColor: "#7c3aed",
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
