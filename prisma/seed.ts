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
  // ABS_EXPRESS — Rayan (0)
  {
    title: "ABS Express",
    description:
      "A focused core session targeting abs, obliques, and lower back. Short, sharp, and effective — the perfect add-on to any training week.",
    style: ClassStyle.ABS_EXPRESS,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
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
];

// ─── Schedule helpers ───────────────────────────────────────

/**
 * Weekly time slots: [templateIndex, dayOffset (0=Mon), hour, minute]
 * dayOffset: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
 */
const weeklySchedule: [number, number, number, number][] = [
  // Monday
  [0, 0, 6, 30],   // HIIT (Rayan) — Mon 6:30
  [2, 0, 9, 0],    // Spinning (Carla) — Mon 9:00
  [4, 0, 11, 0],   // Glutes (Rayan) — Mon 11:00
  [10, 0, 18, 0],  // Boxing (Ziad) — Mon 18:00
  [14, 0, 19, 0],  // Full Body Blast (Carla) — Mon 19:00
  [12, 0, 20, 0],  // Core & Stretching (Rayan) — Mon 20:00

  // Tuesday
  [1, 1, 7, 0],    // FIIT (Ziad) — Tue 7:00
  [6, 1, 10, 0],   // Sculpt (Yasmina) — Tue 10:00
  [7, 1, 12, 0],   // ABS Express (Rayan) — Tue 12:00
  [8, 1, 18, 0],   // Kangoo Jump (Erika) — Tue 18:00
  [0, 1, 19, 0],   // HIIT (Rayan) — Tue 19:00
  [15, 1, 20, 0],  // Step (Carla) — Tue 20:00

  // Wednesday
  [3, 2, 6, 30],   // Spinning (Ziad) — Wed 6:30
  [5, 2, 9, 0],    // Glutes (Yasmina) — Wed 9:00
  [9, 2, 11, 0],   // Power Jump (Carla) — Wed 11:00
  [1, 2, 18, 0],   // FIIT (Ziad) — Wed 18:00
  [14, 2, 19, 0],  // Full Body Blast (Carla) — Wed 19:00
  [11, 2, 17, 0],  // Kids (Ziad) — Wed 17:00

  // Thursday
  [0, 3, 7, 0],    // HIIT (Rayan) — Thu 7:00
  [6, 3, 10, 0],   // Sculpt (Yasmina) — Thu 10:00
  [13, 3, 12, 0],  // Core & Stretching (Carla) — Thu 12:00
  [10, 3, 18, 0],  // Boxing (Ziad) — Thu 18:00
  [8, 3, 19, 0],   // Kangoo Jump (Erika) — Thu 19:00

  // Friday
  [1, 4, 6, 30],   // FIIT (Ziad) — Fri 6:30
  [4, 4, 9, 0],    // Glutes (Rayan) — Fri 9:00
  [7, 4, 12, 0],   // ABS Express (Rayan) — Fri 12:00
  [2, 4, 18, 0],   // Spinning (Carla) — Fri 18:00
  [15, 4, 19, 0],  // Step (Carla) — Fri 19:00
  [12, 4, 20, 0],  // Core & Stretching (Rayan) — Fri 20:00

  // Saturday
  [0, 5, 8, 0],    // HIIT (Rayan) — Sat 8:00
  [2, 5, 9, 0],    // Spinning (Carla) — Sat 9:00
  [6, 5, 10, 0],   // Sculpt (Yasmina) — Sat 10:00
  [9, 5, 11, 0],   // Power Jump (Carla) — Sat 11:00
  [14, 5, 12, 0],  // Full Body Blast (Carla) — Sat 12:00

  // Sunday
  [1, 6, 10, 0],   // FIIT (Ziad) — Sun 10:00
  [8, 6, 11, 0],   // Kangoo Jump (Erika) — Sun 11:00
  [13, 6, 12, 0],  // Core & Stretching (Carla) — Sun 12:00
  [10, 6, 16, 0],  // Boxing (Ziad) — Sun 16:00
  [11, 6, 15, 0],  // Kids (Ziad) — Sun 15:00
];

async function main() {
  console.log("Seeding The FunctionaLab database...\n");

  // ── Clear existing data ──
  await prisma.waitlistEntry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.yogaClass.deleteMany();
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

      await prisma.yogaClass.create({
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
