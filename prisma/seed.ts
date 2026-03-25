import { PrismaClient, ClassStyle, ClassLevel } from "@prisma/client";
import { addDays, setHours, setMinutes, addMinutes } from "date-fns";

const prisma = new PrismaClient();

// ─── Coaches ────────────────────────────────────────────────

const instructors = [
  {
    name: "Rayan",
    bio: "Rayan is The FunctionaLab's head HIIT and conditioning coach. Known for his high-energy classes and relentless push to get the best out of every member.",
    avatarUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.HIIT, ClassStyle.GLUTES, ClassStyle.ABS_EXPRESS, ClassStyle.CORE_STRETCHING] as ClassStyle[],
    instagram: "@rayan_tfl",
  },
  {
    name: "Ziad",
    bio: "Ziad specialises in FIIT training and boxing conditioning. A certified coach with a competitive background, his sessions combine technique with intensity.",
    avatarUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.FIIT, ClassStyle.BOXING, ClassStyle.SPINNING, ClassStyle.KIDS] as ClassStyle[],
    instagram: "@ziad_tfl",
  },
  {
    name: "Carla",
    bio: "Carla is the energy of The FunctionaLab. From Spinning to Full Body Blast, her classes are a non-stop party that will leave you dripping and coming back for more.",
    avatarUrl: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.SPINNING, ClassStyle.FULL_BODY_BLAST, ClassStyle.STEP, ClassStyle.POWER_JUMP] as ClassStyle[],
    instagram: "@carla_tfl",
  },
  {
    name: "Yasmina",
    bio: "Yasmina's Sculpt classes are legendary at The FunctionaLab. With a background in dance fitness and strength training, she sculpts bodies and builds confidence.",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.SCULPT, ClassStyle.GLUTES] as ClassStyle[],
    instagram: "@yasmina_tfl",
  },
  {
    name: "Erika",
    bio: "Erika is The FunctionaLab's Kangoo Jump specialist, bringing a unique cardio experience that is as fun as it is effective. Her sessions are always fully booked.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.KANGOO_JUMP] as ClassStyle[],
    instagram: "@erika_tfl",
  },
];

// ─── Class Templates ────────────────────────────────────────

type ClassTemplate = {
  title: string;
  description: string;
  style: ClassStyle;
  level: ClassLevel;
  durationMins: number;
  capacity: number;
  room: string;
  creditCost: number;
  instructorIndex: number;
};

const classTemplates: ClassTemplate[] = [
  // HIIT — Rayan (0)
  {
    title: "HIIT",
    description:
      "High-intensity interval training designed to torch calories, build cardiovascular fitness, and push you beyond your limits. Structured intervals combining bodyweight and functional movements for maximum results.",
    style: ClassStyle.HIIT,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 0,
  },
  // FIIT — Ziad (1)
  {
    title: "FIIT",
    description:
      "Functional Interval Intensity Training — a precision workout combining functional movement patterns with high-intensity intervals. Ziad's signature style: technique meets intensity.",
    style: ClassStyle.FIIT,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 1,
  },
  // SPINNING — Carla (2)
  {
    title: "Spinning",
    description:
      "A high-energy cycling session with pumping music and a coach who will push you every pedal stroke. Perfect for cardiovascular fitness and leg strength. All levels welcome.",
    style: ClassStyle.SPINNING,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 45,
    capacity: 20,
    room: "Spin Room",
    creditCost: 1,
    instructorIndex: 2,
  },
  // SPINNING — Ziad (1)
  {
    title: "Spinning",
    description:
      "A high-energy cycling session with pumping music and a coach who will push you every pedal stroke. Perfect for cardiovascular fitness and leg strength. All levels welcome.",
    style: ClassStyle.SPINNING,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 45,
    capacity: 20,
    room: "Spin Room",
    creditCost: 1,
    instructorIndex: 1,
  },
  // GLUTES — Rayan (0)
  {
    title: "Glutes",
    description:
      "A targeted lower-body session dedicated to building and shaping the glutes. Progressive loading with bands, barbells, and bodyweight movements. Come in, work hard, leave better.",
    style: ClassStyle.GLUTES,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 0,
  },
  // GLUTES — Yasmina (3)
  {
    title: "Glutes",
    description:
      "A targeted lower-body session dedicated to building and shaping the glutes. Progressive loading with bands, barbells, and bodyweight movements. Come in, work hard, leave better.",
    style: ClassStyle.GLUTES,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 3,
  },
  // SCULPT — Yasmina (3)
  {
    title: "Sculpt",
    description:
      "Yasmina's legendary Sculpt class blends dance fitness with strength training. Light weights, high reps, and non-stop movement to tone every muscle and build lasting confidence.",
    style: ClassStyle.SCULPT,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 3,
  },
  // ABS_EXPRESS — Rayan (0)  [30-min express class]
  {
    title: "ABS Express",
    description:
      "A focused core session targeting abs, obliques, and lower back. Short, sharp, and effective — the perfect add-on to any training week.",
    style: ClassStyle.ABS_EXPRESS,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 30,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 0,
  },
  // KANGOO_JUMP — Erika (4)
  {
    title: "Kangoo Jump",
    description:
      "The most fun cardio workout you will ever do. Bouncing shoes, high energy, and Erika's infectious enthusiasm make this a class you'll keep coming back to. Low impact, high results.",
    style: ClassStyle.KANGOO_JUMP,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 4,
  },
  // POWER_JUMP — Carla (2)
  {
    title: "Power Jump",
    description:
      "Plyometric training meets cardio. Explosive jump patterns, agility drills, and conditioning circuits designed to build power and burn serious calories.",
    style: ClassStyle.POWER_JUMP,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 2,
  },
  // BOXING — Ziad (1)
  {
    title: "Boxing",
    description:
      "Pad work, bag work, and boxing conditioning with Ziad. A competitive coaching background meets real technique — fast-paced rounds that build power, coordination, and mental toughness.",
    style: ClassStyle.BOXING,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 15,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 1,
  },
  // KIDS — Ziad (1)
  {
    title: "Kids",
    description:
      "A fun and structured fitness class designed for kids. Movement games, basic coordination drills, and positive coaching to build healthy habits from day one.",
    style: ClassStyle.KIDS,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 45,
    capacity: 10,
    room: "Kids Room",
    creditCost: 1,
    instructorIndex: 1,
  },
  // CORE_STRETCHING — Rayan (0)
  {
    title: "Core & Stretching",
    description:
      "A dedicated session combining deep core activation with full-body stretching and mobility work. The perfect recovery and maintenance class to keep you training at your best.",
    style: ClassStyle.CORE_STRETCHING,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 20,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 0,
  },
  // CORE_STRETCHING — Carla (2)
  {
    title: "Core & Stretching",
    description:
      "A dedicated session combining deep core activation with full-body stretching and mobility work. The perfect recovery and maintenance class to keep you training at your best.",
    style: ClassStyle.CORE_STRETCHING,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 20,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 2,
  },
  // FULL_BODY_BLAST — Carla (2)
  {
    title: "Full Body Blast",
    description:
      "Carla's Full Body Blast is exactly what it sounds like — every muscle group, every energy system, every minute. High intensity from start to finish. You won't leave anything in the tank.",
    style: ClassStyle.FULL_BODY_BLAST,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 20,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 2,
  },
  // STEP — Carla (2)
  {
    title: "Step",
    description:
      "Classic step aerobics reimagined with modern choreography and Carla's signature energy. A full cardio workout that's fun, rhythmic, and seriously effective.",
    style: ClassStyle.STEP,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 20,
    room: "Studio 1",
    creditCost: 1,
    instructorIndex: 2,
  },
  // KIDS — Rayan (0)  [index 16]
  {
    title: "Kids",
    description:
      "A fun and structured fitness class designed for kids. Movement games, basic coordination drills, and positive coaching to build healthy habits from day one.",
    style: ClassStyle.KIDS,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 10,
    room: "Kids Room",
    creditCost: 1,
    instructorIndex: 0,
  },
];

// ─── Schedule helpers ───────────────────────────────────────

/**
 * Weekly time slots matching the JPEG schedule exactly.
 * [templateIndex, dayOffset (0=Mon…5=Sat), hour, minute]
 *
 * Template index reference:
 *  0 = HIIT (Rayan)          7 = ABS Express (Rayan, 30 min)
 *  1 = FIIT (Ziad)           8 = Kangoo Jump (Erika)
 *  2 = Spinning (Carla)      9 = Power Jump (Carla)
 *  3 = Spinning (Ziad)      10 = Boxing (Ziad)
 *  4 = Glutes (Rayan)       11 = Kids (Ziad)
 *  5 = Glutes (Yasmina)     12 = Core & Stretching (Rayan)
 *  6 = Sculpt (Yasmina)     13 = Core & Stretching (Carla)
 *                           14 = Full Body Blast (Carla)
 *                           15 = Step (Carla)
 *                           16 = Kids (Rayan)
 */
const weeklySchedule: [number, number, number, number][] = [
  // ── Monday ──────────────────────────────────────────
  [0,  0,  9,  0],  // HIIT — Rayan       09:00–10:00
  [8,  0, 10,  0],  // Kangoo Jump — Erika 10:00–11:00
  [4,  0, 18, 30],  // Glutes — Rayan     18:30–19:30
  [7,  0, 19, 30],  // ABS Express — Rayan 19:30–20:00 (30 min)
  [9,  0, 20,  0],  // Power Jump — Carla  20:00–21:00

  // ── Tuesday ─────────────────────────────────────────
  [3,  1,  9,  0],  // Spinning — Ziad    09:00–10:00
  [5,  1, 10,  0],  // Glutes — Yasmina   10:00–11:00
  [6,  1, 11,  0],  // Sculpt — Yasmina   11:00–12:00
  [16, 1, 18,  0],  // Kids — Rayan       18:00–19:00
  [10, 1, 19,  0],  // Boxing — Ziad      19:00–20:00

  // ── Wednesday ───────────────────────────────────────
  [1,  2,  9,  0],  // FIIT — Ziad              09:00–10:00
  [12, 2, 10,  0],  // Core & Stretching — Rayan 10:00–11:00
  [6,  2, 11,  0],  // Sculpt — Yasmina          11:00–12:00
  [14, 2, 18,  0],  // Full Body Blast — Carla   18:00–19:00
  [2,  2, 19,  0],  // Spinning — Carla          19:00–20:00

  // ── Thursday ────────────────────────────────────────
  [0,  3,  9,  0],  // HIIT — Rayan              09:00–10:00
  [7,  3, 10,  0],  // ABS Express — Rayan       10:00–10:30 (30 min)
  [6,  3, 12,  0],  // Sculpt — Yasmina          12:00–13:00
  [0,  3, 18,  0],  // HIIT — Rayan              18:00–19:00
  [12, 3, 19,  0],  // Core & Stretching — Rayan 19:00–20:00

  // ── Friday ──────────────────────────────────────────
  [1,  4,  9,  0],  // FIIT — Ziad      09:00–10:00
  [3,  4, 10,  0],  // Spinning — Ziad  10:00–11:00
  [15, 4, 18,  0],  // Step — Carla     18:00–19:00
  [2,  4, 19,  0],  // Spinning — Carla 19:00–20:00

  // ── Saturday ────────────────────────────────────────
  [3,  5, 11,  0],  // Spinning — Ziad  11:00–12:00
];

async function main() {
  console.log("Seeding The FunctionaLab database...\n");

  // ── Clear existing data ──
  await prisma.waitlistEntry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.fitnessClass.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.studioSettings.deleteMany();

  // ── Create Studio Settings ──
  await prisma.studioSettings.create({
    data: {
      id: "default",
      cancellationWindowHours: 12,
      maxWaitlistSize: 10,
      lateCancelPenalty: true,
      bookingOpenDaysInAdvance: 14,
    },
  });
  console.log("Studio settings created");

  // ── Create Coaches ──
  const createdInstructors = await Promise.all(
    instructors.map((instructor) =>
      prisma.instructor.create({ data: instructor })
    )
  );
  console.log(`${createdInstructors.length} coaches created`);

  // ── Create 2 weeks of classes ──
  const today = new Date();
  // Start from the most recent Monday
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = addDays(today, mondayOffset);
  thisMonday.setHours(0, 0, 0, 0);

  let classCount = 0;

  for (let week = 0; week < 2; week++) {
    const weekStart = addDays(thisMonday, week * 7);

    for (const [templateIndex, dayOffset, hour, minute] of weeklySchedule) {
      const template = classTemplates[templateIndex];
      const startsAt = setMinutes(
        setHours(addDays(weekStart, dayOffset), hour),
        minute
      );
      const endsAt = addMinutes(startsAt, template.durationMins);

      await prisma.fitnessClass.create({
        data: {
          title: template.title,
          description: template.description,
          style: template.style,
          level: template.level,
          durationMins: template.durationMins,
          capacity: template.capacity,
          startsAt,
          endsAt,
          room: template.room,
          creditCost: template.creditCost,
          instructorId: createdInstructors[template.instructorIndex].id,
        },
      });
      classCount++;
    }
  }

  console.log(`${classCount} classes created (2 weeks)`);
  console.log("\nThe FunctionaLab seeding complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
