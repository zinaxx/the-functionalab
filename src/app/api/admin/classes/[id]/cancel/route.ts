import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendClassCancelledEmail } from "@/lib/emails";
import { getClassCategory, getCreditField } from "@/lib/utils";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const fitnessClass = await prisma.fitnessClass.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          include: { user: true },
        },
      },
    });

    if (!fitnessClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    if (fitnessClass.status === "CANCELLED") return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

    const category = getClassCategory(fitnessClass.style);
    const creditField = getCreditField(category);

    // Cancel class
    await prisma.fitnessClass.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    // Refund credits for all confirmed bookings
    for (const booking of fitnessClass.bookings) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: "Class cancelled by studio" },
      });

      if (booking.creditsUsed > 0) {
        await prisma.user.update({
          where: { id: booking.userId },
          data: { [creditField]: { increment: booking.creditsUsed } },
        });
      }
    }

    // Notify all affected students
    for (const booking of fitnessClass.bookings) {
      sendClassCancelledEmail({
        userName: booking.user.name ?? "",
        userEmail: booking.user.email,
        className: fitnessClass.title,
        startsAt: fitnessClass.startsAt,
        creditsRefunded: booking.creditsUsed,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, notified: fitnessClass.bookings.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
