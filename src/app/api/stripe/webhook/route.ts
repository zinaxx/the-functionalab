import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmedEmail } from "@/lib/emails";
import { PRICING_PLANS } from "@/lib/utils";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (!userId || !planId) break;

        const plan = PRICING_PLANS.find((p) => p.id === planId);
        if (!plan) break;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) break;

        if (plan.type === "one-time" && plan.credits) {
          // Add credits
          await prisma.$transaction([
            prisma.user.update({
              where: { id: userId },
              data: { creditBalance: { increment: plan.credits } },
            }),
            prisma.payment.create({
              data: {
                userId,
                stripePaymentId: session.payment_intent as string,
                amount: session.amount_total ?? plan.price * 100,
                currency: session.currency ?? "eur",
                status: "SUCCEEDED",
                type: "CLASS_PACK",
                creditsAdded: plan.credits,
                description: plan.name,
              },
            }),
          ]);

          sendPaymentConfirmedEmail({
            userName: user.name ?? "",
            userEmail: user.email,
            description: plan.name,
            amount: session.amount_total ?? plan.price * 100,
            creditsAdded: plan.credits,
          }).catch(console.error);
        }

        if (plan.type === "subscription") {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);

          await prisma.$transaction([
            prisma.membership.upsert({
              where: { userId },
              create: {
                userId,
                type: "MONTHLY_UNLIMITED",
                status: "ACTIVE",
                stripeSubscriptionId: subscriptionId,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
              update: {
                status: "ACTIVE",
                stripeSubscriptionId: subscriptionId,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: false,
              },
            }),
            prisma.payment.create({
              data: {
                userId,
                stripePaymentId: subscriptionId,
                amount: session.amount_total ?? plan.price * 100,
                currency: session.currency ?? "eur",
                status: "SUCCEEDED",
                type: "MEMBERSHIP",
                description: "Monthly Unlimited membership",
              },
            }),
          ]);

          sendPaymentConfirmedEmail({
            userName: user.name ?? "",
            userEmail: user.email,
            description: "Monthly Unlimited membership",
            amount: session.amount_total ?? plan.price * 100,
            creditsAdded: 0,
          }).catch(console.error);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const membership = await prisma.membership.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!membership) break;

        await prisma.membership.update({
          where: { id: membership.id },
          data: {
            status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "CANCELLED",
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const membership = await prisma.membership.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });
        if (!membership) break;

        await prisma.membership.update({
          where: { id: membership.id },
          data: { status: "CANCELLED" },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const membership = await prisma.membership.findUnique({
          where: { stripeSubscriptionId: invoice.subscription as string },
        });
        if (!membership) break;

        await prisma.membership.update({
          where: { id: membership.id },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
