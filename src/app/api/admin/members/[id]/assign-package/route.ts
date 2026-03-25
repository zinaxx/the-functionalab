import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PRICING_PLANS } from "@/lib/utils";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

const CREDIT_FIELD_MAP: Record<string, string> = {
  regular: "regularCredits",
  kids: "kidsCredits",
  boxing: "boxingCredits",
  sculpt: "sculptCredits",
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { planId } = await request.json();

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    // ── One-time credit pack ──────────────────────────────────
    if (plan.type === "one-time" && plan.credits && plan.creditType) {
      const creditField = CREDIT_FIELD_MAP[plan.creditType];

      await prisma.user.update({
        where: { id: params.id },
        data: { [creditField]: { increment: plan.credits } },
      });

      await prisma.payment.create({
        data: {
          userId: params.id,
          amount: plan.price * 100, // store in cents for consistency
          currency: "usd",
          status: "SUCCEEDED",
          type: "CLASS_PACK",
          creditsAdded: plan.credits,
          description: `${plan.name} (cash)`,
        },
      });

      // Sculpt packages also grant free regular class access
      if (plan.givesSculptPackage) {
        await prisma.membership.upsert({
          where: { userId: params.id },
          create: {
            userId: params.id,
            type: "SCULPT_PACKAGE",
            status: "ACTIVE",
          },
          update: {
            type: "SCULPT_PACKAGE",
            status: "ACTIVE",
          },
        });
      }

      return NextResponse.json({
        success: true,
        creditsAdded: plan.credits,
        creditType: plan.creditType,
        membershipGranted: plan.givesSculptPackage ? "SCULPT_PACKAGE" : null,
      });
    }

    // ── Monthly membership ────────────────────────────────────
    if (plan.type === "subscription") {
      await prisma.membership.upsert({
        where: { userId: params.id },
        create: {
          userId: params.id,
          type: "MONTHLY_UNLIMITED",
          status: "ACTIVE",
        },
        update: {
          type: "MONTHLY_UNLIMITED",
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
        },
      });

      await prisma.payment.create({
        data: {
          userId: params.id,
          amount: plan.price * 100,
          currency: "usd",
          status: "SUCCEEDED",
          type: "MEMBERSHIP",
          description: "Monthly Unlimited membership (cash)",
        },
      });

      return NextResponse.json({ success: true, membershipGranted: "MONTHLY_UNLIMITED" });
    }

    return NextResponse.json({ error: "Unhandled plan type" }, { status: 400 });
  } catch (error) {
    console.error("Assign package error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
