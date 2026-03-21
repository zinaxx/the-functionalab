export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { AdminMembersClient } from "./members-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Members" };

export default async function AdminMembersPage() {
  const members = await prisma.user.findMany({
    include: {
      membership: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-light text-stone-800">Members</h1>
      <AdminMembersClient members={members} />
    </div>
  );
}
