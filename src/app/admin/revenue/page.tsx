export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";
import { TrendingUp, CreditCard, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Revenue" };

export default async function AdminRevenuePage() {
  // Last 6 months of revenue
  const months = Array.from({ length: 6 }, (_, i) => {
    const start = startOfMonth(subMonths(new Date(), 5 - i));
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
    return { start, end, label: format(start, "MMM yyyy") };
  });

  const monthlyData = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const agg = await prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: "SUCCEEDED", createdAt: { gte: start, lte: end } },
      });
      return {
        label,
        revenue: agg._sum.amount ?? 0,
        payments: agg._count.id,
      };
    })
  );

  const styleDistribution = await prisma.booking.groupBy({
    by: ["classId"],
    where: { status: "CONFIRMED" },
    _count: { classId: true },
  });

  const styleBookings = await prisma.yogaClass.findMany({
    where: { id: { in: styleDistribution.map((s) => s.classId) } },
    select: { id: true, style: true },
  });

  const styleMap: Record<string, number> = {};
  for (const item of styleDistribution) {
    const cls = styleBookings.find((c) => c.id === item.classId);
    if (cls) {
      styleMap[cls.style] = (styleMap[cls.style] ?? 0) + item._count.classId;
    }
  }
  const totalStyleBookings = Object.values(styleMap).reduce((a, b) => a + b, 0);

  const recentPayments = await prisma.payment.findMany({
    where: { status: "SUCCEEDED" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const formatEuro = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  const totalRevenue = monthlyData.reduce((a, m) => a + m.revenue, 0);
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl font-light text-stone-800">Revenue</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-sage-500" />
            <span className="text-xs font-body text-stone-400 uppercase tracking-wide">6-mo revenue</span>
          </div>
          <p className="font-display text-3xl font-light text-stone-800">{formatEuro(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-sage-500" />
            <span className="text-xs font-body text-stone-400 uppercase tracking-wide">This month</span>
          </div>
          <p className="font-display text-3xl font-light text-stone-800">
            {formatEuro(monthlyData[monthlyData.length - 1]?.revenue ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-sage-500" />
            <span className="text-xs font-body text-stone-400 uppercase tracking-wide">Transactions</span>
          </div>
          <p className="font-display text-3xl font-light text-stone-800">
            {monthlyData.reduce((a, m) => a + m.payments, 0)}
          </p>
        </div>
      </div>

      {/* Revenue bar chart */}
      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <h2 className="font-display text-xl font-medium text-stone-800 mb-6">Monthly revenue</h2>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full flex items-end justify-center" style={{ height: "100px" }}>
                <div
                  className="w-full bg-sage-200 rounded-t-lg transition-all hover:bg-sage-400"
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}px` }}
                  title={formatEuro(m.revenue)}
                />
              </div>
              <span className="font-body text-xs text-stone-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Style distribution */}
      {totalStyleBookings > 0 && (
        <div className="rounded-2xl bg-white border border-stone-200 p-6">
          <h2 className="font-display text-xl font-medium text-stone-800 mb-4">Bookings by style</h2>
          <div className="space-y-3">
            {Object.entries(styleMap)
              .sort((a, b) => b[1] - a[1])
              .map(([style, count]) => (
                <div key={style} className="flex items-center gap-3 text-sm font-body">
                  <span className="w-28 text-stone-600">{style}</span>
                  <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-sage-400 rounded-full"
                      style={{ width: `${(count / totalStyleBookings) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-stone-400">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent payments table */}
      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <h2 className="font-display text-xl font-medium text-stone-800 mb-4">Recent payments</h2>
        <div className="space-y-2">
          {recentPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0 text-sm font-body"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-stone-800 truncate">
                  {payment.user.name ?? payment.user.email}
                </p>
                <p className="text-xs text-stone-400">{payment.description ?? payment.type}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-medium text-stone-800">{formatEuro(payment.amount)}</p>
                <p className="text-xs text-stone-400">
                  {format(new Date(payment.createdAt), "d MMM yyyy")}
                </p>
              </div>
            </div>
          ))}
          {recentPayments.length === 0 && (
            <p className="font-body text-stone-400 text-center py-6">No payments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
