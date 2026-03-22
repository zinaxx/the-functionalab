export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { Users, Calendar, TrendingUp, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Overview" };

export default async function AdminPage() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalMembers,
    activeMembers,
    classesThisWeek,
    bookingsThisMonth,
    revenueThisMonth,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }).catch((e) => { console.error("admin error:", e.message); return 0; }),
    prisma.membership.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.yogaClass.count({
      where: { startsAt: { gte: weekStart, lte: weekEnd }, status: "SCHEDULED" },
    }).catch(() => 0),
    prisma.booking.count({
      where: { status: "CONFIRMED", createdAt: { gte: monthStart, lte: monthEnd } },
    }).catch(() => 0),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCEEDED", createdAt: { gte: monthStart, lte: monthEnd } },
    }).catch(() => ({ _sum: { amount: null } })),
    prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      include: {
        user: true,
        yogaClass: { include: { instructor: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }).catch(() => []),
  ]);

  const revenueAmount = revenueThisMonth._sum.amount ?? 0;

  const stats = [
    { label: "Total members", value: totalMembers, icon: Users, sub: `${activeMembers} with active membership` },
    { label: "Classes this week", value: classesThisWeek, icon: Calendar, sub: "Scheduled" },
    { label: "Bookings this month", value: bookingsThisMonth, icon: TrendingUp, sub: "Confirmed" },
    {
      label: "Revenue this month",
      value: new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(revenueAmount / 100),
      icon: CreditCard,
      sub: "From payments",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl font-light text-white">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-5">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-[#fd5227]" />
              <span className="text-xs font-body text-stone-500 uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className="font-display text-3xl font-light text-white">{stat.value}</p>
            <p className="font-body text-xs text-stone-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6">
        <h2 className="font-display text-xl font-medium text-white mb-4">Recent bookings</h2>
        {recentBookings.length === 0 ? (
          <p className="font-body text-sm text-stone-500">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between py-2.5 border-b border-[#2A2A2A] last:border-0 text-sm font-body"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate">{booking.user.name ?? booking.user.email}</p>
                  <p className="text-stone-500 text-xs truncate">{booking.yogaClass.title}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-stone-300">{booking.yogaClass.instructor.name}</p>
                  <p className="text-xs text-stone-500">
                    {new Date(booking.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
