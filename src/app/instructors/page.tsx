export const dynamic = 'force-dynamic';
import { Instagram, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CLASS_STYLE_LABELS, CLASS_STYLE_COLORS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Coaches",
  description: "Meet the world-class coaches behind The FunctionaLab's training.",
};

export default async function InstructorsPage() {
  let instructors: Awaited<ReturnType<typeof prisma.instructor.findMany<{
    include: { _count: { select: { classes: true } } }
  }>>> = [];

  try {
    instructors = await prisma.instructor.findMany({
      where: { active: true },
      include: {
        _count: { select: { classes: { where: { status: "SCHEDULED" } } } },
      },
      orderBy: { name: "asc" },
    });
  } catch {
    // DB not available — render empty state
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0A0A0A]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <p className="font-body text-xs uppercase tracking-widest text-[#fd5227] mb-3">
            The people behind the training
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-white">
            Our Coaches
          </h1>
          <div className="mt-5 mx-auto w-16 h-px bg-[#fd5227]/40" />
        </div>

        {instructors.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-[#2A2A2A] bg-[#141414]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fd5227]/10 mb-5">
              <Zap className="h-7 w-7 text-[#fd5227]" />
            </div>
            <p className="font-display text-3xl font-light text-stone-400 mb-2">Coming soon</p>
            <p className="font-body text-sm text-stone-500">Our coaches will be introduced here once the gym is set up.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {instructors.map((instructor, i) => (
              <div
                key={instructor.id}
                className={`flex flex-col md:flex-row gap-8 rounded-2xl bg-[#141414] border border-[#2A2A2A] p-8 ${
                  i % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex justify-center md:justify-start">
                  <Avatar className="h-40 w-40 md:h-48 md:w-48">
                    <AvatarImage src={instructor.avatarUrl ?? undefined} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-[#fd5227]/20 text-[#fd5227]">{instructor.name[0]}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="font-display text-3xl font-light text-white mb-1">
                        {instructor.name}
                      </h2>
                      <p className="font-body text-sm text-stone-500">
                        {instructor._count.classes} upcoming class
                        {instructor._count.classes !== 1 ? "es" : ""}
                      </p>
                    </div>
                    {instructor.instagram && (
                      <a
                        href={`https://instagram.com/${instructor.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#fd5227] transition-colors font-body"
                      >
                        <Instagram className="h-4 w-4" />
                        {instructor.instagram}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {instructor.specialties.map((style) => (
                      <span
                        key={style}
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${CLASS_STYLE_COLORS[style]}`}
                      >
                        {CLASS_STYLE_LABELS[style]}
                      </span>
                    ))}
                  </div>

                  {instructor.bio && (
                    <p className="font-body text-stone-400 leading-relaxed text-sm">
                      {instructor.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
