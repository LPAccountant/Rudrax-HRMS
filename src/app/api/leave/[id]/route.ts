import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR", "MANAGER"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, remarks } = await request.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: params.id },
      include: { employee: true, leaveType: true },
    });

    if (!leaveRequest) return NextResponse.json({ error: "Leave request not found" }, { status: 404 });

    const updated = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status,
        approvedBy: user.id,
        approvedAt: new Date(),
        remarks: remarks || "",
      },
    });

    if (status === "APPROVED") {
      const currentYear = new Date().getFullYear();
      await prisma.leaveBalance.update({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: leaveRequest.employeeId,
            leaveTypeId: leaveRequest.leaveTypeId,
            year: currentYear,
          },
        },
        data: {
          used: { increment: leaveRequest.days },
          remaining: { decrement: leaveRequest.days },
        },
      });
    }

    await prisma.notification.create({
      data: {
        userId: leaveRequest.employee.userId,
        title: `Leave ${status === "APPROVED" ? "Approved" : "Rejected"}`,
        message: `Your ${leaveRequest.leaveType.name} request has been ${status.toLowerCase()}.`,
        type: status === "APPROVED" ? "INFO" : "WARNING",
        link: "/dashboard/leave",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update leave request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
