import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { CreditType } from "@/lib/utils";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

const CREDIT_FIELD_MAP: Record<CreditType, string> = {
  regular: "regularCredits",
  kids: "kidsCredits",
  boxing: "boxingCredits",
  sculpt: "sculptCredits",
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { creditType, amount } = await request.json();

    if (!creditType || !CREDIT_FIELD_MAP[creditType as CreditType]) {
      return NextResponse.json({ error: "Invalid creditType. Must be: regular, kids, boxing, or sculpt" }, { status: 400 });
    }
    if (typeof amount !== "number") {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const field = CREDIT_FIELD_MAP[creditType as CreditType];

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { [field]: { increment: amount } },
      select: {
        id: true,
        name: true,
        email: true,
        regularCredits: true,
        kidsCredits: true,
        boxingCredits: true,
        sculptCredits: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
