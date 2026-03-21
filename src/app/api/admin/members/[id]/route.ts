import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { creditAdjustment } = await request.json();

    if (typeof creditAdjustment !== "number") {
      return NextResponse.json({ error: "Invalid creditAdjustment" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { creditBalance: { increment: creditAdjustment } },
      select: { id: true, creditBalance: true, name: true, email: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
