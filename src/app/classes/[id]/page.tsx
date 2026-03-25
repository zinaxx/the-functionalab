export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Users, MapPin, Instagram } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  formatClassTime,
  CLASS_STYLE_LABELS,
  CLASS_STYLE_COLORS,
  LEVEL_LABELS,
  LEVEL_COLORS,
} from "@/lib/utils";
import { BookButton } from "@/components/classes/book-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

async function getClass(id: string) {
  return prisma.fitnessClass.findUnique({
    where: { id },
    include: {
      instructor: true,
      _count: { select: { bookings: { where: { status: "CONFIRMED" } } } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cls = await getClass(params.id);
  if (!cls) return { title: "Class not found" };
  return {
    title: cls.title,
    description: cls.description ?? undefined,
  };
}

export default async function ClassDetailPage({ params }: Props) {
  const [cls, supabase] = await Promise.all([
    getClass(params.id),
    createClient(),
  ]);

  if (!cls) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser = null;
  let existingBooking = null;
  let onWaitlist = false;
  let hasActiveMembership = false;

  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { membership: true },
    });

    if (dbUser) {
      existingBooking = await prisma.booking.findUnique({
        where: { userId_classId: { userId: dbUser.id, classId: cls.id } },
      });

      const waitlistEntry = await prisma.waitlistEntry.findUnique({
        where: { userId_classId: { userId: dbUser.id, classId: cls.id } },
      });
      onWaitlist = !!waitlistEntry;

      hasActiveMembership =
        (dbUser.membership?.status === "ACTIVE") === true;
    }
  }

  const spotsLeft = cls.capacity - cls._count.bookings;
  const isFull = spotsLeft <= 0;
  const isCancelled = cls.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Back */}
        <Link
          href="/schedule"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-300 font-body mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to schedule
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-body ${CLASS_STYLE_COLORS[cls.style]}`}
                >
                  {CLASS_STYLE_LABELS[cls.style]}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-body ${LEVEL_COLORS[cls.level]}`}
                >
                  {LEVEL_LABELS[cls.level]}
                </span>
                {isCancelled && (
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 font-body">
                    Cancelled
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl font-light text-white mb-2">
                {cls.title}
              </h1>
              <p className="font-body text-stone-400">
                with {cls.instructor.name}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-[#141414] border border-[#2A2A2A] p-5">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#fd5227] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-stone-500 font-body mb-0.5">When</p>
                  <p className="text-sm font-medium text-white font-body">
                    {formatClassTime(cls.startsAt, cls.endsAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-[#fd5227] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-stone-500 font-body mb-0.5">Availability</p>
                  <p
                    className={`text-sm font-medium font-body ${
                      isFull ? "text-red-500" : spotsLeft <= 3 ? "text-amber-500" : "text-white"
                    }`}
                  >
                    {isFull ? "Class full" : `${spotsLeft} of ${cls.capacity} spots left`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#fd5227] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-stone-500 font-body mb-0.5">Duration</p>
                  <p className="text-sm font-medium text-white font-body">
                    {cls.durationMins} minutes
                  </p>
                </div>
              </div>
              {cls.room && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#fd5227] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-stone-500 font-body mb-0.5">Room</p>
                    <p className="text-sm font-medium text-white font-body">{cls.room}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {cls.description && (
              <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6">
                <h2 className="font-display text-xl font-medium text-white mb-3">
                  About this class
                </h2>
                <p className="font-body text-stone-400 leading-relaxed text-sm">
                  {cls.description}
                </p>
              </div>
            )}

            {/* Coach card */}
            <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6">
              <h2 className="font-display text-xl font-medium text-white mb-4">
                Your coach
              </h2>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={cls.instructor.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-lg bg-[#fd5227]/20 text-[#fd5227]">
                    {cls.instructor.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-medium text-white">
                      {cls.instructor.name}
                    </h3>
                    {cls.instructor.instagram && (
                      <a
                        href={`https://instagram.com/${cls.instructor.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-500 hover:text-[#fd5227] transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cls.instructor.specialties.map((s) => (
                      <span
                        key={s}
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-body ${CLASS_STYLE_COLORS[s]}`}
                      >
                        {CLASS_STYLE_LABELS[s]}
                      </span>
                    ))}
                  </div>
                  {cls.instructor.bio && (
                    <p className="font-body text-sm text-stone-400 leading-relaxed">
                      {cls.instructor.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6">
              <div className="mb-4">
                <p className="font-display text-3xl font-light text-white">
                  {cls.creditCost === 1 ? "1 credit" : `${cls.creditCost} credits`}
                </p>
                <p className="font-body text-sm text-stone-500 mt-1">per person</p>
              </div>

              <BookButton
                classId={cls.id}
                isAuthenticated={!!user}
                isCancelled={isCancelled}
                isFull={isFull}
                existingBookingId={existingBooking?.id ?? null}
                existingBookingStatus={existingBooking?.status ?? null}
                onWaitlist={onWaitlist}
                creditBalance={dbUser?.creditBalance ?? 0}
                creditCost={cls.creditCost}
                hasActiveMembership={hasActiveMembership}
                startsAt={cls.startsAt}
              />

              <p className="mt-4 text-center text-xs text-stone-500 font-body">
                Free cancellation up to 12h before class
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
