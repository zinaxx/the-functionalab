import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendClassCancelledEmail } from "@/lib/emails";

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
    const yogaClass = await prisma.yogaClass.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: { status: "CONFIRMED" },
          include: { user: true },
        },
      },
    });

    if (!yogaClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    if (yogaClass.status === "CANCELLED") return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

    // Cancel class + refund credits for all confirmed bookings
    await prisma.$transaction(async (tx) => {
      await tx.yogaClass.update({
        where: { id: params.id },
        data: { status: "CANCELLED" },
      });

      for (const booking of yogaClass.bookings) {
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: "Class cancelled by studio" },
        });

        if (booking.creditsUsed > 0) {
          await tx.user.update({
            where: { id: booking.userId },
            data: { creditBalance: { increment: booking.creditsUsed } },
          });
        }
      }
    });

    // Notify all affected students
    for (const booking of yogaClass.bookings) {
      sendClassCancelledEmail({
        userName: booking.user.name ?? "",
        userEmail: booking.user.email,
        className: yogaClass.title,
        startsAt: yogaClass.startsAt,
        creditsRefunded: booking.creditsUsed,
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, notified: yogaClass.bookings.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
