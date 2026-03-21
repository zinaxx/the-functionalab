import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await getOrCreateDbUser(user);

    const [membership, payments] = await Promise.all([
      prisma.membership.findUnique({ where: { userId: dbUser.id } }),
      prisma.payment.findMany({
        where: { userId: dbUser.id, status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      creditBalance: dbUser.creditBalance,
      membership,
      payments,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await getOrCreateDbUser(user);
    const membership = await prisma.membership.findUnique({ where: { userId: dbUser.id } });

    if (!membership || !membership.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    await stripe.subscriptions.update(membership.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.membership.update({
      where: { id: membership.id },
      data: { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
