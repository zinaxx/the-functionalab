import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendBookingConfirmedEmail, sendWaitlistPromotedEmail } from "@/lib/emails";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

// POST /api/admin/classes/[id]/register
// Registers a member to a class as a cash walk-in (no credit check)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const yogaClass = await prisma.yogaClass.findUnique({
      where: { id: params.id },
      include: {
        instructor: true,
        _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
      },
    });

    if (!yogaClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    if (yogaClass.status === "CANCELLED") return NextResponse.json({ error: "Class is cancelled" }, { status: 400 });

    const existingBooking = await prisma.booking.findUnique({
      where: { userId_classId: { userId, classId: params.id } },
    });
    if (existingBooking?.status === "CONFIRMED") return NextResponse.json({ error: "Member already booked" }, { status: 409 });

    const existingWaitlist = await prisma.waitlistEntry.findUnique({
      where: { userId_classId: { userId, classId: params.id } },
    });
    if (existingWaitlist) return NextResponse.json({ error: "Member already on waitlist" }, { status: 409 });

    const member = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const spotsLeft = yogaClass.capacity - yogaClass._count.bookings;

    if (spotsLeft <= 0) {
      // Class is full — add to waitlist
      const lastEntry = await prisma.waitlistEntry.findFirst({
        where: { classId: params.id },
        orderBy: { position: "desc" },
        select: { position: true },
      });
      const position = (lastEntry?.position ?? 0) + 1;

      await prisma.waitlistEntry.create({
        data: { userId, classId: params.id, position },
      });

      return NextResponse.json({ success: true, action: "waitlisted", position });
    }

    // Create booking — cash walk-in, no credit deduction
    const booking = await prisma.booking.upsert({
      where: { userId_classId: { userId, classId: params.id } },
      update: { status: "CONFIRMED", creditsUsed: 0 },
      create: { userId, classId: params.id, status: "CONFIRMED", creditsUsed: 0 },
    });

    // Send confirmation email (non-blocking)
    if (member) {
      sendBookingConfirmedEmail({
        userName: member.name ?? "",
        userEmail: member.email,
        className: yogaClass.title,
        instructorName: yogaClass.instructor.name,
        startsAt: yogaClass.startsAt,
        endsAt: yogaClass.endsAt,
        room: yogaClass.room ?? "",
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, action: "booked", data: booking });
  } catch (error) {
    console.error("Admin register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
