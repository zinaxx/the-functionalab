import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { isCancellable } from "@/lib/utils";
import { sendLateCancelEmail, sendBookingConfirmedEmail } from "@/lib/emails";

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
        yogaClass: { include: { instructor: true } },
        user: true,
      },
    });

    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (booking.userId !== dbUser.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (booking.status !== "CONFIRMED") return NextResponse.json({ error: "Booking is not active" }, { status: 400 });

    const settings = await prisma.studioSettings.findUnique({ where: { id: "default" } });
    const windowHours = settings?.cancellationWindowHours ?? 12;

    const canRefund = isCancellable(booking.yogaClass.startsAt, windowHours);
    const newStatus = canRefund ? "CANCELLED" : "LATE_CANCELLED";

    // Cancel booking + handle refund + promote waitlist
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: newStatus,
          cancelledAt: new Date(),
        },
      });

      // Refund credits if eligible
      if (canRefund && booking.creditsUsed > 0) {
        await tx.user.update({
          where: { id: dbUser.id },
          data: { creditBalance: { increment: booking.creditsUsed } },
        });
      }

      // Promote first waitlist entry
      const firstWaiting = await tx.waitlistEntry.findFirst({
        where: { classId: booking.classId },
        orderBy: { position: "asc" },
        include: { user: true },
      });

      if (firstWaiting) {
        const hasActiveMembership = await tx.membership.findFirst({
          where: { userId: firstWaiting.userId, status: "ACTIVE" },
        });

        const waitingUser = firstWaiting.user;
        const creditCost = hasActiveMembership ? 0 : booking.yogaClass.creditCost;

        // Create booking for waitlist user
        await tx.booking.create({
          data: {
            userId: firstWaiting.userId,
            classId: booking.classId,
            status: "CONFIRMED",
            creditsUsed: creditCost,
          },
        });

        // Deduct credits
        if (!hasActiveMembership && creditCost > 0) {
          await tx.user.update({
            where: { id: firstWaiting.userId },
            data: { creditBalance: { decrement: creditCost } },
          });
        }

        // Remove from waitlist
        await tx.waitlistEntry.delete({ where: { id: firstWaiting.id } });

        // Recalculate positions
        const remaining = await tx.waitlistEntry.findMany({
          where: { classId: booking.classId },
          orderBy: { position: "asc" },
        });
        for (let i = 0; i < remaining.length; i++) {
          await tx.waitlistEntry.update({
            where: { id: remaining[i].id },
            data: { position: i + 1 },
          });
        }

        // Notify waitlist user (non-blocking, outside tx)
        setImmediate(() => {
          sendBookingConfirmedEmail({
            userName: waitingUser.name ?? "",
            userEmail: waitingUser.email,
            className: booking.yogaClass.title,
            instructorName: booking.yogaClass.instructor.name,
            startsAt: booking.yogaClass.startsAt,
            endsAt: booking.yogaClass.endsAt,
            room: booking.yogaClass.room ?? "",
          }).catch(console.error);
        });
      }
    });

    // Send late cancel email if applicable
    if (!canRefund) {
      sendLateCancelEmail({
        userName: dbUser.name ?? "",
        userEmail: dbUser.email,
        className: booking.yogaClass.title,
        instructorName: booking.yogaClass.instructor.name,
        startsAt: booking.yogaClass.startsAt,
        endsAt: booking.yogaClass.endsAt,
        room: booking.yogaClass.room ?? "",
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
