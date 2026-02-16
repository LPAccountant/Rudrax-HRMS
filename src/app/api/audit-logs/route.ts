import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
