export const dynamic = 'force-dynamic';
import Link from "next/link";
import { ArrowRight, Clock, Users, Star, Zap, Dumbbell, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatTime, CLASS_STYLE_LABELS, CLASS_STYLE_COLORS } from "@/lib/utils";
import { addDays } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The FunctionaLab — Train For Life",
};

async function getUpcomingClasses() {
  try {
    return await prisma.yogaClass.findMany({
      where: {
        startsAt: { gte: new Date(), lte: addDays(new Date(), 3) },
        status: "SCHEDULED",
      },
      include: { instructor: true },
      orderBy: { startsAt: "asc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

const testimonials = [
  {
    name: "Joe B.",
    text: "The FunctionaLab changed how I train completely. The coaches push you to your limits every single time.",
    stars: 5,
  },
  {
    name: "Nadia M.",
    text: "Best gym in Jounieh by far. The programming is smart, the community is real.",
    stars: 5,
  },
  {
    name: "Charbel R.",
    text: "I've trained at gyms across Lebanon. Nothing comes close to the level of coaching here.",
    stars: 5,
  },
];

const features = [
  {
    icon: Dumbbell,
    title: "World-Class Coaches",
    description: "Our certified coaches have competed and trained at the highest levels. They bring that expertise to every single session.",
  },
  {
    icon: Zap,
    title: "Every Level Welcome",
    description: "Whether you're stepping into a gym for the first time or training for competition, we have a class for you.",
  },
  {
    icon: Target,
    title: "Real Results",
    description: "Our programming is built around functional movement and progressive overload — the science-backed approach that actually works.",
  },
];

export default async function HomePage() {
  const upcomingClasses = await getUpcomingClasses();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #141414 60%, #0F0F0F 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fd5227 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] rounded-full opacity-8 pointer-events-none" style={{ background: "radial-gradient(circle, #fd5227 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle, #fd5227 0%, transparent 60%)" }} />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-body mb-8" style={{ background: "rgba(253,82,39,0.1)", borderColor: "rgba(253,82,39,0.3)", color: "#fd5227" }}>
            <Zap className="h-3.5 w-3.5" />
            Jounieh · Est. 2025
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] tracking-tight mb-6 text-white">
            Train For
            <br />
            <span className="italic" style={{ color: "#fd5227" }}>Life</span>
          </h1>
          <p className="mx-auto max-w-xl font-body text-lg leading-relaxed mb-10" style={{ color: "#A3A3A3" }}>
            Jounieh&apos;s premier functional fitness gym. Thoughtfully programmed classes for every athlete, coached by world-class trainers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule">
              <Button size="lg" className="gap-2 shadow-md bg-[#fd5227] hover:bg-[#e04420] text-white">
                View schedule
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-[#2A2A2A] text-stone-300 hover:bg-white/5 hover:text-white bg-transparent">
                See pricing
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 inline-flex items-center divide-x divide-[#2A2A2A] rounded-2xl border border-[#2A2A2A] bg-[#141414]/80 backdrop-blur-sm px-2 shadow-sm">
            {[
              { value: "6+", label: "Training styles" },
              { value: "3", label: "Expert coaches" },
              { value: "200+", label: "Active members" },
            ].map((stat) => (
              <div key={stat.label} className="px-8 py-5 text-center">
                <p className="font-display text-3xl font-semibold text-white">{stat.value}</p>
                <p className="font-body text-xs text-stone-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #0A0A0A)" }} />
      </section>

      {/* Upcoming classes strip */}
      {upcomingClasses.length > 0 && (
        <section className="py-20 bg-[#0A0A0A] border-t border-[#2A2A2A]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-body text-xs uppercase tracking-widest text-[#fd5227] mb-2">
                  On the floor this week
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-light text-white">
                  Upcoming classes
                </h2>
              </div>
              <Link href="/schedule" className="hidden sm:flex items-center gap-1.5 text-sm text-[#fd5227] hover:text-[#fd5227]/80 font-body font-medium bg-[#fd5227]/10 hover:bg-[#fd5227]/20 rounded-xl px-4 py-2 transition-colors">
                Full schedule <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingClasses.map((cls) => (
                <Link key={cls.id} href={`/classes/${cls.id}`} className="group">
                  <div className="rounded-2xl border border-[#2A2A2A] p-5 bg-[#141414] hover:border-[#fd5227]/40 hover:bg-[#1A1A1A] transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${CLASS_STYLE_COLORS[cls.style]}`}
                      >
                        {CLASS_STYLE_LABELS[cls.style]}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-stone-500 font-body">
                        <Clock className="h-3 w-3" />
                        {cls.durationMins}m
                      </div>
                    </div>
                    <h3 className="font-display text-lg font-medium text-white mb-1 group-hover:text-[#fd5227] transition-colors">
                      {cls.title}
                    </h3>
                    <p className="font-body text-sm text-stone-500 mb-3">
                      {cls.instructor.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-medium text-stone-300">
                        {formatTime(cls.startsAt)} –{" "}
                        {formatTime(cls.endsAt)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-stone-500 font-body">
                        <Users className="h-3 w-3" />
                        {cls.capacity} spots
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/schedule">
                <Button variant="outline" className="border-[#2A2A2A] text-stone-300 hover:text-white hover:bg-white/5">View full schedule</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #2A2A2A 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.4 }} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="font-body text-xs uppercase tracking-widest text-[#fd5227] mb-3">
              Why The FunctionaLab
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white">
              Train with purpose
            </h2>
            <div className="mt-4 mx-auto w-16 h-px bg-[#fd5227]/40" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="relative rounded-2xl border border-[#2A2A2A] bg-[#141414] p-8 hover:border-[#fd5227]/30 hover:shadow-md transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#fd5227]/10 mb-5">
                  <feature.icon className="h-5 w-5 text-[#fd5227]" />
                </div>
                <h3 className="font-display text-xl font-medium text-white mb-3">
                  {feature.title}
                </h3>
                <p className="font-body text-stone-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#fd5227]/20 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="font-body text-xs uppercase tracking-widest text-[#fd5227] mb-3">
              Member stories
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white">
              What our members say
            </h2>
            <div className="mt-4 mx-auto w-16 h-px bg-[#fd5227]/40" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#fd5227] text-[#fd5227]" />
                  ))}
                </div>
                <p className="font-display text-xl font-light text-stone-300 leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-[#fd5227]/40" />
                  <p className="font-body text-sm font-medium text-stone-400">
                    {t.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #1A0A00 50%, #0A0A0A 100%)" }}>
        {/* Decorative */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fd5227 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fd5227 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#fd5227]/30 bg-[#fd5227]/10 px-4 py-1.5 text-sm text-[#fd5227] font-body mb-8">
            <Zap className="h-3.5 w-3.5" />
            Join our community
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
            Start Training
          </h2>
          <p className="font-body text-stone-400 text-lg mb-10 leading-relaxed">
            Join hundreds of athletes training smart in Jounieh. Your first class is just a booking away.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule">
              <Button size="lg" className="bg-[#fd5227] hover:bg-[#e04420] text-white shadow-lg gap-2 font-medium">
                Book your first class
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-[#2A2A2A] text-stone-300 hover:bg-white/5 hover:text-white hover:border-[#3A3A3A] bg-transparent">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
