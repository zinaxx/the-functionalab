import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";
import { PRICING_PLANS } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId } = await request.json();
    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const dbUser = await getOrCreateDbUser(user);

    // Get or create Stripe customer
    let customerId = dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name ?? undefined,
        metadata: { userId: dbUser.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = process.env[plan.stripePriceEnv];
    if (!priceId) {
      return NextResponse.json({ error: `Price not configured: ${plan.stripePriceEnv}` }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: plan.type === "subscription" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/membership?success=1`,
      cancel_url: `${appUrl}/pricing?cancelled=1`,
      metadata: {
        userId: dbUser.id,
        planId: plan.id,
        credits: plan.credits?.toString() ?? "unlimited",
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
