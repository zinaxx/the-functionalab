import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

// GET /api/admin/classes/[id]/waitlist
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const entries = await prisma.waitlistEntry.findMany({
      where: { classId: params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/classes/[id]/waitlist?entryId=xxx — remove from waitlist
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("entryId");
    if (!entryId) return NextResponse.json({ error: "entryId required" }, { status: 400 });

    await prisma.waitlistEntry.delete({ where: { id: entryId } });

    // Recalculate positions
    const remaining = await prisma.waitlistEntry.findMany({
      where: { classId: params.id },
      orderBy: { position: "asc" },
    });
    for (let i = 0; i < remaining.length; i++) {
      await prisma.waitlistEntry.update({
        where: { id: remaining[i].id },
        data: { position: i + 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
