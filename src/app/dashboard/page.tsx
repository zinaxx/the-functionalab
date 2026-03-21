export const dynamic = 'force-dynamic';
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Calendar, CreditCard, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { Button } from "@/components/ui/button";
import { formatClassTime, CLASS_STYLE_LABELS, CLASS_STYLE_COLORS } from "@/lib/utils";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await getOrCreateDbUser(user);

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      userId: dbUser.id,
      status: "CONFIRMED",
      yogaClass: { startsAt: { gte: new Date() } },
    },
    include: { yogaClass: { include: { instructor: true } } },
    orderBy: { yogaClass: { startsAt: "asc" } },
    take: 5,
  });

  const membership = await prisma.membership.findUnique({
    where: { userId: dbUser.id },
  });

  const totalBookings = await prisma.booking.count({
    where: { userId: dbUser.id, status: { in: ["CONFIRMED"] } },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-light text-stone-800">
          Welcome back{dbUser.name ? `, ${dbUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="font-body text-stone-500 mt-1">Here&apos;s your practice at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-sage-500" />
            <span className="text-xs font-body text-stone-400 uppercase tracking-wide">Credits</span>
          </div>
          <p className="font-display text-3xl font-light text-stone-800">{dbUser.creditBalance}</p>
          <Link href="/pricing" className="text-xs text-sage-600 hover:text-sage-700 font-body mt-1 inline-block">
            Buy more →
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-sage-500" />
            <span className="text-xs font-body text-stone-400 uppercase tracking-wide">Upcoming</span>
          </div>
          <p className="font-display text-3xl font-light text-stone-800">{upcomingBookings.length}</p>
          <span className="text-xs text-stone-400 font-body">class{upcomingBookings.length !== 1 ? "es" : ""} booked</span>
        </div>

        <div className="rounded-2xl bg-white border border-stone-200 p-5 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-sage-500" />
            <span className="text-xs font-body text-stone-400 uppercase tracking-wide">Membership</span>
          </div>
          {membership?.status === "ACTIVE" ? (
            <>
              <p className="font-display text-lg font-medium text-sage-700">Unlimited Monthly</p>
              {membership.currentPeriodEnd && (
                <p className="text-xs text-stone-400 font-body mt-1">
                  Renews {format(membership.currentPeriodEnd, "MMM d")}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-display text-lg text-stone-500">No active plan</p>
              <Link href="/pricing" className="text-xs text-sage-600 hover:text-sage-700 font-body mt-1 inline-block">
                View plans →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Upcoming bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-light text-stone-800">Upcoming classes</h2>
          <Link href="/dashboard/bookings">
            <Button variant="ghost" size="sm" className="gap-1 text-stone-500">
              All bookings <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="rounded-2xl bg-white border border-stone-200 p-10 text-center">
            <Calendar className="h-10 w-10 text-stone-200 mx-auto mb-3" />
            <p className="font-display text-xl text-stone-400 mb-1">No upcoming classes</p>
            <p className="font-body text-sm text-stone-400 mb-4">Browse the schedule to find your next class.</p>
            <Link href="/schedule">
              <Button>Browse schedule</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/classes/${booking.classId}`}
                className="block rounded-2xl bg-white border border-stone-200 p-4 hover:border-sage-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium font-body ${CLASS_STYLE_COLORS[booking.yogaClass.style]}`}
                      >
                        {CLASS_STYLE_LABELS[booking.yogaClass.style]}
                      </span>
                    </div>
                    <h3 className="font-body font-medium text-stone-800 group-hover:text-sage-700 transition-colors">
                      {booking.yogaClass.title}
                    </h3>
                    <p className="font-body text-sm text-stone-500 mt-0.5">
                      {booking.yogaClass.instructor.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-body text-sm font-medium text-stone-700">
                      {formatClassTime(booking.yogaClass.startsAt, booking.yogaClass.endsAt)}
                    </p>
                    {booking.yogaClass.room && (
                      <p className="font-body text-xs text-stone-400 mt-0.5">{booking.yogaClass.room}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/schedule">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-sage-300 transition-colors group cursor-pointer">
            <Calendar className="h-5 w-5 text-sage-400 mb-2" />
            <p className="font-body text-sm font-medium text-stone-800 group-hover:text-sage-700">Browse schedule</p>
          </div>
        </Link>
        <Link href="/pricing">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-sage-300 transition-colors group cursor-pointer">
            <CreditCard className="h-5 w-5 text-sage-400 mb-2" />
            <p className="font-body text-sm font-medium text-stone-800 group-hover:text-sage-700">Buy credits</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
