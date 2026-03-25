import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendAdminRemovedEmail, sendBookingConfirmedEmail } from "@/lib/emails";
import { getClassCategory, getCreditField } from "@/lib/utils";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

// DELETE /api/admin/bookings/[id] — admin removes a booking, refunds credits
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        fitnessClass: { include: { instructor: true } },
      },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.status !== "CONFIRMED") return NextResponse.json({ error: "Booking is not active" }, { status: 400 });

    const category = getClassCategory(booking.fitnessClass.style);
    const creditField = getCreditField(category);

    let promotedUser: { name: string | null; email: string } | null = null;

    // Cancel the booking
    await prisma.booking.update({
      where: { id: params.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });

    // Refund credits to the correct pool
    if (booking.creditsUsed > 0) {
      await prisma.user.update({
        where: { id: booking.userId },
        data: { [creditField]: { increment: booking.creditsUsed } },
      });
    }

    // Promote #1 on the waitlist
    const firstWaiting = await prisma.waitlistEntry.findFirst({
      where: { classId: booking.classId },
      orderBy: { position: "asc" },
      include: { user: { include: { membership: true } } },
    });

    if (firstWaiting) {
      const hasActiveMembership = firstWaiting.user.membership?.status === "ACTIVE";
      const isFreeWithMembership = category === "REGULAR" && hasActiveMembership;
      const creditCost = isFreeWithMembership ? 0 : 1;

      await prisma.booking.upsert({
        where: { userId_classId: { userId: firstWaiting.userId, classId: booking.classId } },
        update: { status: "CONFIRMED", creditsUsed: creditCost, cancelledAt: null },
        create: {
          userId: firstWaiting.userId,
          classId: booking.classId,
          status: "CONFIRMED",
          creditsUsed: creditCost,
        },
      });

      if (!isFreeWithMembership && creditCost > 0) {
        await prisma.user.update({
          where: { id: firstWaiting.userId },
          data: { [creditField]: { decrement: creditCost } },
        });
      }

      await prisma.waitlistEntry.delete({ where: { id: firstWaiting.id } });

      // Recalculate positions
      const remaining = await prisma.waitlistEntry.findMany({
        where: { classId: booking.classId },
        orderBy: { position: "asc" },
      });
      for (let i = 0; i < remaining.length; i++) {
        await prisma.waitlistEntry.update({
          where: { id: remaining[i].id },
          data: { position: i + 1 },
        });
      }

      promotedUser = { name: firstWaiting.user.name, email: firstWaiting.user.email };
    }

    // Notify the removed member
    sendAdminRemovedEmail({
      userName: booking.user.name ?? "",
      userEmail: booking.user.email,
      className: booking.fitnessClass.title,
      instructorName: booking.fitnessClass.instructor.name,
      startsAt: booking.fitnessClass.startsAt,
      endsAt: booking.fitnessClass.endsAt,
      room: booking.fitnessClass.room ?? "",
    }).catch(console.error);

    // Notify the promoted waitlist member
    if (promotedUser) {
      sendBookingConfirmedEmail({
        userName: promotedUser.name ?? "",
        userEmail: promotedUser.email,
        className: booking.fitnessClass.title,
        instructorName: booking.fitnessClass.instructor.name,
        startsAt: booking.fitnessClass.startsAt,
        endsAt: booking.fitnessClass.endsAt,
        room: booking.fitnessClass.room ?? "",
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, promoted: !!promotedUser });
  } catch (error) {
    console.error("Admin remove booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
