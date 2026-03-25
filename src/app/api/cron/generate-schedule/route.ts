import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClassStyle, ClassLevel } from "@prisma/client";
import { addDays, addMinutes, setHours, setMinutes, startOfDay, nextMonday } from "date-fns";

// Called by Vercel Cron: every Monday at 6am UTC
// vercel.json: { "path": "/api/cron/generate-schedule", "schedule": "0 6 * * 1" }

// ─── Weekly template (mirrors the JPEG schedule) ──────────────────────────────
// [style, instructorName, dayOffset (0=Mon…5=Sat), hour, minute, durationMins]
type Slot = {
  style: ClassStyle;
  instructorName: string;
  dayOffset: number;
  hour: number;
  minute: number;
  durationMins: number;
};

const WEEKLY_TEMPLATE: Slot[] = [
  // Monday
  { style: ClassStyle.HIIT,            instructorName: "Rayan",   dayOffset: 0, hour:  9, minute:  0, durationMins: 60 },
  { style: ClassStyle.KANGOO_JUMP,     instructorName: "Erika",   dayOffset: 0, hour: 10, minute:  0, durationMins: 60 },
  { style: ClassStyle.GLUTES,          instructorName: "Rayan",   dayOffset: 0, hour: 18, minute: 30, durationMins: 60 },
  { style: ClassStyle.ABS_EXPRESS,     instructorName: "Rayan",   dayOffset: 0, hour: 19, minute: 30, durationMins: 30 },
  { style: ClassStyle.POWER_JUMP,      instructorName: "Carla",   dayOffset: 0, hour: 20, minute:  0, durationMins: 60 },

  // Tuesday
  { style: ClassStyle.SPINNING,        instructorName: "Ziad",    dayOffset: 1, hour:  9, minute:  0, durationMins: 60 },
  { style: ClassStyle.GLUTES,          instructorName: "Yasmina", dayOffset: 1, hour: 10, minute:  0, durationMins: 60 },
  { style: ClassStyle.SCULPT,          instructorName: "Yasmina", dayOffset: 1, hour: 11, minute:  0, durationMins: 60 },
  { style: ClassStyle.KIDS,            instructorName: "Rayan",   dayOffset: 1, hour: 18, minute:  0, durationMins: 60 },
  { style: ClassStyle.BOXING,          instructorName: "Ziad",    dayOffset: 1, hour: 19, minute:  0, durationMins: 60 },

  // Wednesday
  { style: ClassStyle.FIIT,            instructorName: "Ziad",    dayOffset: 2, hour:  9, minute:  0, durationMins: 60 },
  { style: ClassStyle.CORE_STRETCHING, instructorName: "Rayan",   dayOffset: 2, hour: 10, minute:  0, durationMins: 60 },
  { style: ClassStyle.SCULPT,          instructorName: "Yasmina", dayOffset: 2, hour: 11, minute:  0, durationMins: 60 },
  { style: ClassStyle.FULL_BODY_BLAST, instructorName: "Carla",   dayOffset: 2, hour: 18, minute:  0, durationMins: 60 },
  { style: ClassStyle.SPINNING,        instructorName: "Carla",   dayOffset: 2, hour: 19, minute:  0, durationMins: 60 },

  // Thursday
  { style: ClassStyle.HIIT,            instructorName: "Rayan",   dayOffset: 3, hour:  9, minute:  0, durationMins: 60 },
  { style: ClassStyle.ABS_EXPRESS,     instructorName: "Rayan",   dayOffset: 3, hour: 10, minute:  0, durationMins: 30 },
  { style: ClassStyle.SCULPT,          instructorName: "Yasmina", dayOffset: 3, hour: 12, minute:  0, durationMins: 60 },
  { style: ClassStyle.HIIT,            instructorName: "Rayan",   dayOffset: 3, hour: 18, minute:  0, durationMins: 60 },
  { style: ClassStyle.CORE_STRETCHING, instructorName: "Rayan",   dayOffset: 3, hour: 19, minute:  0, durationMins: 60 },

  // Friday
  { style: ClassStyle.FIIT,            instructorName: "Ziad",    dayOffset: 4, hour:  9, minute:  0, durationMins: 60 },
  { style: ClassStyle.SPINNING,        instructorName: "Ziad",    dayOffset: 4, hour: 10, minute:  0, durationMins: 60 },
  { style: ClassStyle.STEP,            instructorName: "Carla",   dayOffset: 4, hour: 18, minute:  0, durationMins: 60 },
  { style: ClassStyle.SPINNING,        instructorName: "Carla",   dayOffset: 4, hour: 19, minute:  0, durationMins: 60 },

  // Saturday
  { style: ClassStyle.SPINNING,        instructorName: "Ziad",    dayOffset: 5, hour: 11, minute:  0, durationMins: 60 },
];

const CLASS_TITLES: Record<ClassStyle, string> = {
  HIIT:             "HIIT",
  FIIT:             "FIIT",
  SPINNING:         "Spinning",
  GLUTES:           "Glutes",
  SCULPT:           "Sculpt",
  ABS_EXPRESS:      "ABS Express",
  KANGOO_JUMP:      "Kangoo Jump",
  POWER_JUMP:       "Power Jump",
  BOXING:           "Boxing",
  KIDS:             "Kids",
  CORE_STRETCHING:  "Core & Stretching",
  FULL_BODY_BLAST:  "Full Body Blast",
  STEP:             "Step",
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the furthest-ahead scheduled class
  const lastClass = await prisma.fitnessClass.findFirst({
    where: { status: "SCHEDULED" },
    orderBy: { startsAt: "desc" },
    select: { startsAt: true },
  });

  // We always want at least 2 weeks ahead from today
  const today = startOfDay(new Date());
  const twoWeeksOut = addDays(today, 14);

  // The week to generate starts on the Monday after the last class (or next Monday if nothing scheduled)
  const lastDate = lastClass ? startOfDay(lastClass.startsAt) : today;
  const generateFrom: Date = lastDate < twoWeeksOut
    ? nextMonday(lastDate)   // extend one more week beyond current last class
    : nextMonday(twoWeeksOut);

  // Check we're not about to duplicate — skip if that Monday's classes already exist
  const weekMonday = startOfDay(generateFrom);
  const weekSunday = addDays(weekMonday, 7);
  const existing = await prisma.fitnessClass.count({
    where: { startsAt: { gte: weekMonday, lt: weekSunday }, status: "SCHEDULED" },
  });

  if (existing > 0) {
    return NextResponse.json({ success: true, created: 0, message: "Week already exists" });
  }

  // Load instructors once
  const instructors = await prisma.instructor.findMany({ where: { active: true } });
  const byName = Object.fromEntries(instructors.map((i) => [i.name, i]));

  let created = 0;
  for (const slot of WEEKLY_TEMPLATE) {
    const instructor = byName[slot.instructorName];
    if (!instructor) continue;

    const startsAt = setMinutes(
      setHours(addDays(weekMonday, slot.dayOffset), slot.hour),
      slot.minute
    );
    const endsAt = addMinutes(startsAt, slot.durationMins);

    await prisma.fitnessClass.create({
      data: {
        title:        CLASS_TITLES[slot.style],
        style:        slot.style,
        level:        ClassLevel.ALL_LEVELS,
        durationMins: slot.durationMins,
        capacity:     slot.style === ClassStyle.KIDS ? 10 : slot.style === ClassStyle.SPINNING ? 20 : 15,
        startsAt,
        endsAt,
        room:         slot.style === ClassStyle.KIDS ? "Kids Room" : slot.style === ClassStyle.SPINNING ? "Spin Room" : "Studio 1",
        creditCost:   1,
        instructorId: instructor.id,
      },
    });
    created++;
  }

  return NextResponse.json({
    success: true,
    created,
    week: weekMonday.toISOString().split("T")[0],
  });
}
