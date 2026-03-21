import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendClassReminderEmail } from "@/lib/emails";
import { addHours } from "date-fns";

// Called by Vercel Cron: every day at 9am
// vercel.json: { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 9 * * *" }] }
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in24h = addHours(now, 24);
  const in25h = addHours(now, 25);

  // Find all confirmed bookings for classes starting in ~24h
  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      yogaClass: {
        startsAt: { gte: in24h, lte: in25h },
        status: "SCHEDULED",
      },
    },
    include: {
      user: true,
      yogaClass: { include: { instructor: true } },
    },
  });

  let sent = 0;
  for (const booking of bookings) {
    try {
      await sendClassReminderEmail({
        userName: booking.user.name ?? "",
        userEmail: booking.user.email,
        className: booking.yogaClass.title,
        instructorName: booking.yogaClass.instructor.name,
        startsAt: booking.yogaClass.startsAt,
        endsAt: booking.yogaClass.endsAt,
        room: booking.yogaClass.room ?? "",
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder for booking ${booking.id}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent, total: bookings.length });
}
