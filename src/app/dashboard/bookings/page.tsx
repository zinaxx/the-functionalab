export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { BookingsClient } from "./bookings-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Bookings" };

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getOrCreateDbUser(user);

  const bookings = await prisma.booking.findMany({
    where: { userId: dbUser.id },
    include: { fitnessClass: { include: { instructor: true } } },
    orderBy: { fitnessClass: { startsAt: "desc" } },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-light text-stone-800">My bookings</h1>
      <BookingsClient bookings={bookings} />
    </div>
  );
}
