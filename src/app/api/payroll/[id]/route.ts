import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN", "HR"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["APPROVED", "PAID"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const record = await prisma.payrollRecord.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === "PAID" && { paidAt: new Date() }),
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Update payroll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
