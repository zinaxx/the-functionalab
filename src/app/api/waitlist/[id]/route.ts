import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/get-or-create-user";

// id here is classId
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await getOrCreateDbUser(user);
    const classId = params.id;

    const entry = await prisma.waitlistEntry.findUnique({
      where: { userId_classId: { userId: dbUser.id, classId } },
    });

    if (!entry) return NextResponse.json({ error: "Not on waitlist" }, { status: 404 });

    await prisma.waitlistEntry.delete({ where: { id: entry.id } });

    const remaining = await prisma.waitlistEntry.findMany({
      where: { classId },
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
    console.error("Leave waitlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
