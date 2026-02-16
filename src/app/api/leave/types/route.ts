import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const leaveTypes = await prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(leaveTypes);
  } catch (error) {
    console.error("Get leave types error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
