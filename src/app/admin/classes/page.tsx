export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { AdminClassesClient } from "./classes-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Classes" };

export default async function AdminClassesPage() {
  const [classes, instructors] = await Promise.all([
    prisma.yogaClass.findMany({
      include: {
        instructor: true,
        _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
      },
      orderBy: { startsAt: "desc" },
      take: 100,
    }).catch(() => []),
    prisma.instructor.findMany({ where: { active: true }, orderBy: { name: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-light text-stone-800">Classes</h1>
      <AdminClassesClient classes={classes} instructors={instructors} />
    </div>
  );
}
