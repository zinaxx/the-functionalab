import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { sendBookingConfirmedEmail } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await request.json();
    if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

    const dbUser = await getOrCreateDbUser(user);

    // Get class with booking count
    const fitnessClass = await prisma.fitnessClass.findUnique({
      where: { id: classId },
      include: {
        instructor: true,
        _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
      },
    });

    if (!fitnessClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    if (fitnessClass.status === "CANCELLED") return NextResponse.json({ error: "Class is cancelled" }, { status: 400 });
    if (new Date(fitnessClass.startsAt) < new Date()) return NextResponse.json({ error: "Class has already started" }, { status: 400 });

    // Check for existing booking
    const existing = await prisma.booking.findUnique({
      where: { userId_classId: { userId: dbUser.id, classId } },
    });
    if (existing) return NextResponse.json({ error: "Already booked" }, { status: 409 });

    // Check capacity
    const spotsLeft = fitnessClass.capacity - fitnessClass._count.bookings;
    if (spotsLeft <= 0) return NextResponse.json({ error: "Class is full" }, { status: 400 });

    // Check credits / membership
    const hasActiveMembership = dbUser.membership?.status === "ACTIVE";
    if (!hasActiveMembership && dbUser.creditBalance < fitnessClass.creditCost) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }

    // Create booking + deduct credits
    const booking = await prisma.booking.create({
      data: {
        userId: dbUser.id,
        classId,
        creditsUsed: hasActiveMembership ? 0 : fitnessClass.creditCost,
        status: "CONFIRMED",
      },
    });

    if (!hasActiveMembership) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { creditBalance: { decrement: fitnessClass.creditCost } },
      });
    }

    // Send confirmation email (non-blocking)
    sendBookingConfirmedEmail({
      userName: dbUser.name ?? "",
      userEmail: dbUser.email,
      className: fitnessClass.title,
      instructorName: fitnessClass.instructor.name,
      startsAt: fitnessClass.startsAt,
      endsAt: fitnessClass.endsAt,
      room: fitnessClass.room ?? "",
    }).catch(console.error);

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
