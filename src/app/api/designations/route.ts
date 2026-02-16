import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const designations = await prisma.designation.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { level: "desc" },
    });

    return NextResponse.json(designations);
  } catch (error) {
    console.error("Get designations error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
