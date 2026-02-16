import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, checkRole } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: "Omega Tv Media Pvt Ltd",
          tagline: "News India 24x7",
          email: "info@newsindia.tv",
          address: "247/3, First Floor, D Block, Sector 63, Noida, UP 201301",
          logoUrl: "/company-logo.jpeg",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !checkRole(user.role, ["ADMIN"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const existing = await prisma.companySettings.findFirst();

    if (!existing) {
      const settings = await prisma.companySettings.create({ data: body });
      return NextResponse.json(settings);
    }

    const settings = await prisma.companySettings.update({
      where: { id: existing.id },
      data: {
        ...(body.companyName !== undefined && { companyName: body.companyName }),
        ...(body.tagline !== undefined && { tagline: body.tagline }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.workingDaysPerMonth !== undefined && { workingDaysPerMonth: body.workingDaysPerMonth }),
        ...(body.workingHoursPerDay !== undefined && { workingHoursPerDay: body.workingHoursPerDay }),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entity: "CompanySettings",
        entityId: settings.id,
        details: "Updated company settings",
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
