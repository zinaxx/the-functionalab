import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { isCancellable } from "@/lib/utils";
import { sendLateCancelEmail, sendBookingConfirmedEmail } from "@/lib/emails";
import { getClassCategory, getCreditField } from "@/lib/utils";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await getOrCreateDbUser(user);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        fitnessClass: { include: { instructor: true } },
        user: true,
      },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (booking.status !== "CONFIRMED") return NextResponse.json({ error: "Booking is not active" }, { status: 400 });

    const settings = await prisma.studioSettings.findUnique({ where: { id: "default" } });
    const windowHours = settings?.cancellationWindowHours ?? 12;

    const canRefund = isCancellable(booking.fitnessClass.startsAt, windowHours);
    const newStatus = canRefund ? "CANCELLED" : "LATE_CANCELLED";

    // Cancel booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: newStatus, cancelledAt: new Date() },
    });

    // Refund credits to the correct pool if eligible
    if (canRefund && booking.creditsUsed > 0) {
      const category = getClassCategory(booking.fitnessClass.style);
      const creditField = getCreditField(category);
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { [creditField]: { increment: booking.creditsUsed } },
      });
    }

    // Promote first waitlist entry
    const firstWaiting = await prisma.waitlistEntry.findFirst({
      where: { classId: booking.classId },
      orderBy: { position: "asc" },
      include: { user: { include: { membership: true } } },
    });

    if (firstWaiting) {
      const category = getClassCategory(booking.fitnessClass.style);
      const creditField = getCreditField(category);
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

      sendBookingConfirmedEmail({
        userName: firstWaiting.user.name ?? "",
        userEmail: firstWaiting.user.email,
        className: booking.fitnessClass.title,
        instructorName: booking.fitnessClass.instructor.name,
        startsAt: booking.fitnessClass.startsAt,
        endsAt: booking.fitnessClass.endsAt,
        room: booking.fitnessClass.room ?? "",
      }).catch(console.error);
    }

    // Send late cancel email if applicable
    if (!canRefund) {
      sendLateCancelEmail({
        userName: dbUser.name ?? "",
        userEmail: dbUser.email,
        className: booking.fitnessClass.title,
        instructorName: booking.fitnessClass.instructor.name,
        startsAt: booking.fitnessClass.startsAt,
        endsAt: booking.fitnessClass.endsAt,
        room: booking.fitnessClass.room ?? "",
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      data: { creditsRefunded: canRefund ? booking.creditsUsed : 0 },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
