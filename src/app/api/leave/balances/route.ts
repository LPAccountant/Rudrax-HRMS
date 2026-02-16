import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId") || user.employee?.id;
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    if (!employeeId) return NextResponse.json({ error: "Employee not found" }, { status: 404 });

    const balances = await prisma.leaveBalance.findMany({
      where: { employeeId, year },
      include: { leaveType: true },
      orderBy: { leaveType: { name: "asc" } },
    });

    return NextResponse.json(balances);
  } catch (error) {
    console.error("Get leave balances error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
