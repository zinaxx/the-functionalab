import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { classId } = await request.json();
    if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

    const dbUser = await getOrCreateDbUser(user);

    const fitnessClass = await prisma.fitnessClass.findUnique({
      where: { id: classId },
      include: {
        _count: {
          select: {
            bookings: { where: { status: "CONFIRMED" } },
            waitlist: true,
          },
        },
      },
    });

    if (!fitnessClass) return NextResponse.json({ error: "Class not found" }, { status: 404 });
    if (fitnessClass.status === "CANCELLED") return NextResponse.json({ error: "Class is cancelled" }, { status: 400 });
    if (new Date(fitnessClass.startsAt) < new Date()) return NextResponse.json({ error: "Class has already started" }, { status: 400 });

    // Check there's actually no spot left
    const spotsLeft = fitnessClass.capacity - fitnessClass._count.bookings;
    if (spotsLeft > 0) return NextResponse.json({ error: "Class still has spots — book directly" }, { status: 400 });

    // Check not already on waitlist
    const existing = await prisma.waitlistEntry.findUnique({
      where: { userId_classId: { userId: dbUser.id, classId } },
    });
    if (existing) return NextResponse.json({ error: "Already on waitlist" }, { status: 409 });

    // Check waitlist max size
    const settings = await prisma.studioSettings.findUnique({ where: { id: "default" } });
    const maxSize = settings?.maxWaitlistSize ?? 10;
    if (fitnessClass._count.waitlist >= maxSize) {
      return NextResponse.json({ error: "Waitlist is full" }, { status: 400 });
    }

    const entry = await prisma.waitlistEntry.create({
      data: {
        userId: dbUser.id,
        classId,
        position: fitnessClass._count.waitlist + 1,
      },
    });

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
