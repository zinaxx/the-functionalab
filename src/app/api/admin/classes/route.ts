import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

export async function POST(request: Request) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, description, style, level, instructorId, startsAt, endsAt, durationMins, capacity, room, creditCost } = body;

    const cls = await prisma.fitnessClass.create({
      data: {
        title,
        description,
        style,
        level,
        instructorId,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        durationMins: Number(durationMins),
        capacity: Number(capacity),
        room,
        creditCost: Number(creditCost),
      },
    });

    return NextResponse.json({ success: true, data: cls });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
