import { prisma } from "@/lib/prisma";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Gets the DB user for a Supabase user, creating it if it doesn't exist yet.
 * Called on first API access after signup.
 */
export async function getOrCreateDbUser(supabaseUser: SupabaseUser) {
  const existing = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: { membership: true },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.name ?? null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
    },
    include: { membership: true },
  });
}
