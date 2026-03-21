import { PrismaClient, ClassStyle, ClassLevel } from "@prisma/client";
import { addDays, setHours, setMinutes, addMinutes } from "date-fns";

const prisma = new PrismaClient();

// ─── Instructors ────────────────────────────────────────────

const instructors = [
  {
    name: "Camille Lefèvre",
    bio: "Camille discovered yoga during a transformative trip to Rishikesh in 2012. With over a decade of teaching experience, she blends traditional Hatha practice with modern movement science. Her classes are known for their meditative quality and precise alignment cues.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.HATHA, ClassStyle.YIN, ClassStyle.MEDITATION] as ClassStyle[],
    instagram: "@camille_zen",
  },
  {
    name: "Lucas Moreau",
    bio: "A former professional dancer, Lucas brings fluidity and grace to his Vinyasa and Power classes. He trained at Jivamukti NYC and believes yoga should be both challenging and joyful. Expect playlists, sweat, and the occasional handstand tutorial.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.VINYASA, ClassStyle.POWER, ClassStyle.ASHTANGA] as ClassStyle[],
    instagram: "@lucas_flow",
  },
  {
    name: "Amara Singh",
    bio: "Amara is a certified prenatal yoga teacher and Kundalini practitioner with a background in Ayurvedic medicine. She creates deeply nurturing spaces where students can explore breath, energy, and self-compassion. Her restorative sessions are legendary.",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    specialties: [ClassStyle.KUNDALINI, ClassStyle.RESTORATIVE, ClassStyle.PRENATAL] as ClassStyle[],
    instagram: "@amara_breathe",
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
  instructorIndex: number; // index into instructors array
};

const classTemplates: ClassTemplate[] = [
  {
    title: "Morning Hatha Flow",
    description:
      "Start your day with a grounding Hatha practice. We'll move through classic postures with mindful breath, building strength and flexibility at a gentle pace. Perfect for all levels.",
    style: ClassStyle.HATHA,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 20,
    room: "Salle Lotus",
    creditCost: 1,
    instructorIndex: 0,
  },
  {
    title: "Dynamic Vinyasa",
    description:
      "A vigorous, music-driven flow linking breath to movement. Build heat, develop core strength, and explore creative transitions. Some yoga experience recommended.",
    style: ClassStyle.VINYASA,
    level: ClassLevel.INTERMEDIATE,
    durationMins: 75,
    capacity: 18,
    room: "Salle Bambou",
    creditCost: 1,
    instructorIndex: 1,
  },
  {
    title: "Yin & Release",
    description:
      "Slow down and surrender into deep stretches held for 3–5 minutes. This meditative practice targets connective tissue and is the perfect complement to more active styles.",
    style: ClassStyle.YIN,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 75,
    capacity: 22,
    room: "Salle Lotus",
    creditCost: 1,
    instructorIndex: 0,
  },
  {
    title: "Power Yoga",
    description:
      "An athletic, sweat-inducing practice inspired by Ashtanga. Expect arm balances, inversions, and a strong core focus. Bring water and a towel!",
    style: ClassStyle.POWER,
    level: ClassLevel.ADVANCED,
    durationMins: 60,
    capacity: 16,
    room: "Salle Bambou",
    creditCost: 1,
    instructorIndex: 1,
  },
  {
    title: "Restorative Bliss",
    description:
      "Completely supported by bolsters and blankets, this deeply restful practice activates the parasympathetic nervous system. Leave feeling like you've had the best nap of your life.",
    style: ClassStyle.RESTORATIVE,
    level: ClassLevel.BEGINNER,
    durationMins: 75,
    capacity: 15,
    room: "Salle Lotus",
    creditCost: 1,
    instructorIndex: 2,
  },
  {
    title: "Kundalini Awakening",
    description:
      "Explore breathwork (pranayama), mantra, and dynamic kriyas to move energy through the chakras. A transformative practice that works on body, mind, and spirit.",
    style: ClassStyle.KUNDALINI,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 18,
    room: "Salle Bambou",
    creditCost: 1,
    instructorIndex: 2,
  },
  {
    title: "Guided Meditation",
    description:
      "A seated meditation session blending body scan, breath awareness, and loving-kindness techniques. No experience necessary — just an open mind.",
    style: ClassStyle.MEDITATION,
    level: ClassLevel.BEGINNER,
    durationMins: 45,
    capacity: 25,
    room: "Salle Lotus",
    creditCost: 1,
    instructorIndex: 0,
  },
  {
    title: "Ashtanga Primary Series",
    description:
      "The traditional Ashtanga Primary Series (Yoga Chikitsa) taught in a led format. A structured, challenging practice that builds discipline and stamina over time.",
    style: ClassStyle.ASHTANGA,
    level: ClassLevel.INTERMEDIATE,
    durationMins: 90,
    capacity: 14,
    room: "Salle Bambou",
    creditCost: 1,
    instructorIndex: 1,
  },
  {
    title: "Prenatal Yoga",
    description:
      "A gentle, supportive practice designed for expecting mothers at any trimester. We focus on breath, pelvic floor awareness, and preparing body and mind for birth.",
    style: ClassStyle.PRENATAL,
    level: ClassLevel.ALL_LEVELS,
    durationMins: 60,
    capacity: 12,
    room: "Salle Lotus",
    creditCost: 1,
    instructorIndex: 2,
  },
];

// ─── Schedule helpers ───────────────────────────────────────

/** Weekly time slots: [dayOfWeek (0=Mon), hour, minute] */
const weeklySchedule: [number, number, number, number][] = [
  // [templateIndex, dayOffset (0=Mon), hour, minute]
  [0, 0, 7, 30],   // Morning Hatha — Monday 7:30
  [1, 0, 12, 0],   // Dynamic Vinyasa — Monday 12:00
  [6, 0, 18, 30],  // Meditation — Monday 18:30
  [2, 1, 9, 0],    // Yin — Tuesday 9:00
  [3, 1, 17, 30],  // Power Yoga — Tuesday 17:30
  [5, 1, 19, 0],   // Kundalini — Tuesday 19:00
  [0, 2, 7, 30],   // Morning Hatha — Wednesday 7:30
  [7, 2, 12, 0],   // Ashtanga — Wednesday 12:00
  [4, 2, 18, 0],   // Restorative — Wednesday 18:00
  [1, 3, 9, 0],    // Vinyasa — Thursday 9:00
  [8, 3, 11, 0],   // Prenatal — Thursday 11:00
  [6, 3, 18, 30],  // Meditation — Thursday 18:30
  [3, 4, 7, 30],   // Power Yoga — Friday 7:30
  [2, 4, 12, 0],   // Yin — Friday 12:00
  [5, 4, 17, 0],   // Kundalini — Friday 17:00
  [0, 5, 9, 0],    // Morning Hatha — Saturday 9:00
  [1, 5, 11, 0],   // Dynamic Vinyasa — Saturday 11:00
  [4, 5, 14, 0],   // Restorative — Saturday 14:00
  [7, 6, 10, 0],   // Ashtanga — Sunday 10:00
  [6, 6, 16, 0],   // Meditation — Sunday 16:00
];

async function main() {
  console.log("🌿 Seeding Zen Studio database...\n");

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
  console.log("✅ Studio settings created");

  // ── Create Instructors ──
  const createdInstructors = await Promise.all(
    instructors.map((instructor) =>
      prisma.instructor.create({ data: instructor })
    )
  );
  console.log(`✅ ${createdInstructors.length} instructors created`);

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

  console.log(`✅ ${classCount} classes created (2 weeks)`);
  console.log("\n🧘 Seeding complete! Namaste.");
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
