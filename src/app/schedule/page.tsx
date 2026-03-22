export const dynamic = 'force-dynamic';
import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ScheduleClient } from "./schedule-client";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, startOfDay } from "date-fns";
import { ClassStyle, ClassLevel } from "@prisma/client";

export const metadata: Metadata = {
  title: "Class Schedule",
  description: "Browse and book upcoming training classes at The FunctionaLab.",
};

export const revalidate = 60;

async function getClasses() {
  try {
    const classes = await prisma.yogaClass.findMany({
      where: {
        startsAt: { gte: startOfDay(new Date()), lte: addDays(new Date(), 14) },
        status: "SCHEDULED",
      },
      include: {
        instructor: true,
        _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
      },
      orderBy: { startsAt: "asc" },
    });

    return classes.map((cls) => ({
      ...cls,
      spotsLeft: cls.capacity - cls._count.bookings,
    }));
  } catch {
    return [];
  }
}

async function getInstructors() {
  try {
    return await prisma.instructor.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

function ScheduleSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[#2A2A2A] p-5 bg-[#141414]">
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

export default async function SchedulePage() {
  const [classes, instructors] = await Promise.all([getClasses(), getInstructors()]);

  const styles = Object.values(ClassStyle);
  const levels = Object.values(ClassLevel);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0A0A0A]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12">
          <p className="font-body text-xs uppercase tracking-widest text-[#fd5227] mb-3">
            Next 14 days
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-white">
            Class schedule
          </h1>
          <div className="mt-4 w-16 h-px bg-[#fd5227]/40" />
        </div>
        <Suspense fallback={<ScheduleSkeleton />}>
          <ScheduleClient
            classes={classes}
            instructors={instructors}
            styles={styles}
            levels={levels}
          />
        </Suspense>
      </div>
    </div>
  );
}
