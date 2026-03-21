export const dynamic = 'force-dynamic';
import Link from "next/link";
import { ArrowRight, Clock, Users, Star, Leaf, Wind, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatTime, CLASS_STYLE_LABELS, CLASS_STYLE_COLORS } from "@/lib/utils";
import { addDays } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zen Studio — Yoga in the Heart of Paris",
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
    name: "Sophie M.",
    text: "Zen Studio completely changed my relationship with yoga. Camille's Hatha classes are meditative perfection.",
    stars: 5,
  },
  {
    name: "Thomas R.",
    text: "Lucas's Power Yoga is brutal in the best possible way. I've never felt stronger. The space is stunning.",
    stars: 5,
  },
  {
    name: "Amélie K.",
    text: "Amara's prenatal classes were a lifeline during my pregnancy. Safe, nurturing, and beautifully taught.",
    stars: 5,
  },
];

const features = [
  {
    icon: Leaf,
    title: "Expert Instructors",
    description: "Trained at leading schools worldwide, our teachers bring depth, warmth, and expertise to every class.",
  },
  {
    icon: Wind,
    title: "All Styles & Levels",
    description: "From beginner Hatha to advanced Ashtanga — find the practice that fits where you are today.",
  },
  {
    icon: Heart,
    title: "Intimate Classes",
    description: "Small group sizes mean personalised attention and a genuine sense of community.",
  },
];

export default async function HomePage() {
  const upcomingClasses = await getUpcomingClasses();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16" style={{ background: "linear-gradient(135deg, #FDFBF8 0%, #FAF6EF 40%, #f4f7f3 100%)" }}>
        {/* Decorative blobs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, #cddbc9 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle, #e6ede4 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #5a8754 0%, transparent 60%)" }} />

        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-body mb-8" style={{ background: "rgba(230,237,228,0.8)", borderColor: "#cddbc9", color: "#466c41" }}>
            <Leaf className="h-3.5 w-3.5" />
            Paris · Est. 2018
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-[1.05] tracking-tight mb-6" style={{ color: "#292524" }}>
            Find your
            <br />
            <span className="italic" style={{ color: "#5a8754" }}>balance</span>
          </h1>
          <p className="mx-auto max-w-xl font-body text-lg leading-relaxed mb-10" style={{ color: "#78716C" }}>
            A boutique yoga studio in the heart of Paris. Thoughtfully designed
            classes for every body, taught by world-class instructors.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule">
              <Button size="lg" className="gap-2 shadow-md">
                View schedule
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="bg-white/60 backdrop-blur-sm">
                See pricing
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 inline-flex items-center divide-x divide-stone-200 rounded-2xl border border-stone-200 bg-white/70 backdrop-blur-sm px-2 shadow-sm">
            {[
              { value: "9+", label: "Yoga styles" },
              { value: "3", label: "Expert teachers" },
              { value: "500+", label: "Happy students" },
            ].map((stat) => (
              <div key={stat.label} className="px-8 py-5 text-center">
                <p className="font-display text-3xl font-semibold text-stone-800">{stat.value}</p>
                <p className="font-body text-xs text-stone-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #FDFBF8)" }} />
      </section>

      {/* Upcoming classes strip */}
      {upcomingClasses.length > 0 && (
        <section className="py-20 bg-white border-t border-stone-100">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-body text-xs uppercase tracking-widest text-sage-600 mb-2">
                  On the mat this week
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-light text-stone-800">
                  Upcoming classes
                </h2>
              </div>
              <Link href="/schedule" className="hidden sm:flex items-center gap-1.5 text-sm text-sage-600 hover:text-sage-700 font-body font-medium bg-sage-50 hover:bg-sage-100 rounded-xl px-4 py-2 transition-colors">
                Full schedule <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingClasses.map((cls) => (
                <Link key={cls.id} href={`/classes/${cls.id}`} className="group">
                  <div className="rounded-2xl border border-stone-200 p-5 bg-cream-50 hover:border-sage-300 hover:bg-white transition-all duration-200 hover:shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${CLASS_STYLE_COLORS[cls.style]}`}
                      >
                        {CLASS_STYLE_LABELS[cls.style]}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-stone-400 font-body">
                        <Clock className="h-3 w-3" />
                        {cls.durationMins}m
                      </div>
                    </div>
                    <h3 className="font-display text-lg font-medium text-stone-800 mb-1 group-hover:text-sage-700 transition-colors">
                      {cls.title}
                    </h3>
                    <p className="font-body text-sm text-stone-500 mb-3">
                      {cls.instructor.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-medium text-stone-700">
                        {formatTime(cls.startsAt)} –{" "}
                        {formatTime(cls.endsAt)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-stone-400 font-body">
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
                <Button variant="outline">View full schedule</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why us */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e7e5e4 1px, transparent 0)", backgroundSize: "32px 32px", opacity: 0.5 }} />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="font-body text-xs uppercase tracking-widest text-sage-600 mb-3">
              Why Zen Studio
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-stone-800">
              Practice with intention
            </h2>
            <div className="mt-4 mx-auto w-16 h-px bg-sage-300" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <div key={feature.title} className="relative rounded-2xl border border-stone-100 bg-cream-50 p-8 hover:border-sage-200 hover:shadow-md transition-all duration-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sage-100 mb-5">
                  <feature.icon className="h-5 w-5 text-sage-600" />
                </div>
                <h3 className="font-display text-xl font-medium text-stone-800 mb-3">
                  {feature.title}
                </h3>
                <p className="font-body text-stone-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-sage-200 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-cream-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <p className="font-body text-xs uppercase tracking-widest text-sage-600 mb-3">
              Student stories
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-stone-800">
              What our students say
            </h2>
            <div className="mt-4 mx-auto w-16 h-px bg-sage-300" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-sage-400 text-sage-400" />
                  ))}
                </div>
                <p className="font-display text-xl font-light text-stone-600 leading-relaxed mb-6 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-sage-300" />
                  <p className="font-body text-sm font-medium text-stone-700">
                    {t.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #466c41 0%, #5a8754 50%, #7da375 100%)" }}>
        {/* Decorative */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm text-sage-100 font-body mb-8">
            <Leaf className="h-3.5 w-3.5" />
            Join our community
          </div>
          <h2 className="font-display text-5xl md:text-6xl font-light text-white mb-6 leading-tight">
            Start your practice
          </h2>
          <p className="font-body text-sage-100 text-lg mb-10 leading-relaxed">
            Join our community of students finding balance, strength, and stillness in the heart of Paris.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/schedule">
              <Button size="lg" className="bg-white text-sage-700 hover:bg-cream-50 shadow-lg gap-2 font-medium">
                Book your first class
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
