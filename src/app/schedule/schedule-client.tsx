"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { Clock, Users, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CLASS_STYLE_LABELS,
  CLASS_STYLE_COLORS,
  LEVEL_LABELS,
  LEVEL_COLORS,
  formatTime,
  spotsLabel,
} from "@/lib/utils";
import type { ClassStyle, ClassLevel } from "@prisma/client";
import type { FitnessClassWithDetails } from "@/types";

interface Props {
  classes: FitnessClassWithDetails[];
  instructors: { id: string; name: string }[];
  styles: ClassStyle[];
  levels: ClassLevel[];
}

export function ScheduleClient({ classes, instructors, styles, levels }: Props) {
  const [styleFilter, setStyleFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [instructorFilter, setInstructorFilter] = useState<string>("all");

  const hasFilters =
    styleFilter !== "all" || levelFilter !== "all" || instructorFilter !== "all";

  const filtered = useMemo(
    () =>
      classes.filter((cls) => {
        if (styleFilter !== "all" && cls.style !== styleFilter) return false;
        if (levelFilter !== "all" && cls.level !== levelFilter) return false;
        if (instructorFilter !== "all" && cls.instructorId !== instructorFilter) return false;
        return true;
      }),
    [classes, styleFilter, levelFilter, instructorFilter]
  );

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, FitnessClassWithDetails[]>();
    for (const cls of filtered) {
      const key = format(cls.startsAt, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cls);
    }
    return map;
  }, [filtered]);

  const clearFilters = () => {
    setStyleFilter("all");
    setLevelFilter("all");
    setInstructorFilter("all");
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-sm text-stone-500 font-body mr-1">
          <Filter className="h-4 w-4" />
          Filter:
        </div>

        <Select value={styleFilter} onValueChange={setStyleFilter}>
          <SelectTrigger className="w-40 h-9 text-sm bg-[#141414] border-[#2A2A2A] text-stone-200 hover:border-[#fd5227]/40 focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#2A2A2A] text-stone-200">
            <SelectItem value="all" className="focus:bg-[#2A2A2A] focus:text-white">All styles</SelectItem>
            {styles.map((s) => (
              <SelectItem key={s} value={s} className="focus:bg-[#2A2A2A] focus:text-white">
                {CLASS_STYLE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-40 h-9 text-sm bg-[#141414] border-[#2A2A2A] text-stone-200 hover:border-[#fd5227]/40 focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#2A2A2A] text-stone-200">
            <SelectItem value="all" className="focus:bg-[#2A2A2A] focus:text-white">All levels</SelectItem>
            {levels.map((l) => (
              <SelectItem key={l} value={l} className="focus:bg-[#2A2A2A] focus:text-white">
                {LEVEL_LABELS[l]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={instructorFilter} onValueChange={setInstructorFilter}>
          <SelectTrigger className="w-44 h-9 text-sm bg-[#141414] border-[#2A2A2A] text-stone-200 hover:border-[#fd5227]/40 focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Instructor" />
          </SelectTrigger>
          <SelectContent className="bg-[#141414] border-[#2A2A2A] text-stone-200">
            <SelectItem value="all" className="focus:bg-[#2A2A2A] focus:text-white">All instructors</SelectItem>
            {instructors.map((i) => (
              <SelectItem key={i.id} value={i.id} className="focus:bg-[#2A2A2A] focus:text-white">
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1.5 text-stone-500"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <span className="ml-auto text-sm text-stone-400 font-body">
          {filtered.length} class{filtered.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-24 text-center rounded-2xl border border-[#2A2A2A] bg-[#141414]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1A1A1A] mb-5">
            <Filter className="h-6 w-6 text-stone-500" />
          </div>
          <p className="font-display text-2xl font-light text-stone-400 mb-2">No classes found</p>
          <p className="font-body text-stone-400 text-sm mb-6 max-w-xs mx-auto">
            {hasFilters ? "Try adjusting your filters to see more classes." : "No classes scheduled for the next 14 days. Check back soon!"}
          </p>
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-1.5">
              <X className="h-3.5 w-3.5" />
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Grouped by day */}
      <div className="space-y-10">
        {Array.from(grouped.entries()).map(([dateKey, dayClasses]) => {
          const date = new Date(dateKey + "T12:00:00");
          const isToday = isSameDay(date, new Date());

          return (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-medium text-white">
                    {isToday ? "Today" : format(date, "EEEE")}
                  </span>
                  <span className="font-body text-sm text-stone-500">
                    {format(date, "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex-1 h-px bg-[#2A2A2A] mt-1" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dayClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClassCard({ cls }: { cls: FitnessClassWithDetails }) {
  const isFull = cls.spotsLeft <= 0;
  const isAlmostFull = cls.spotsLeft > 0 && cls.spotsLeft <= 3;

  return (
    <Link href={`/classes/${cls.id}`} className="group block">
      <div className="h-full rounded-2xl border border-[#2A2A2A] bg-[#141414] p-5 hover:border-[#fd5227]/40 hover:bg-[#1A1A1A] hover:shadow-sm transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${CLASS_STYLE_COLORS[cls.style]}`}
          >
            {CLASS_STYLE_LABELS[cls.style]}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-body ${LEVEL_COLORS[cls.level]}`}
          >
            {LEVEL_LABELS[cls.level]}
          </span>
        </div>

        <h3 className="font-display text-lg font-medium text-white mb-1 group-hover:text-[#fd5227] transition-colors">
          {cls.title}
        </h3>
        <p className="font-body text-sm text-stone-500 mb-4">{cls.instructor.name}</p>

        <div className="flex items-center justify-between text-sm font-body">
          <div className="flex items-center gap-3 text-stone-300">
            <span className="font-medium">
              {formatTime(cls.startsAt)} – {formatTime(cls.endsAt)}
            </span>
            <span className="flex items-center gap-1 text-stone-400">
              <Clock className="h-3 w-3" />
              {cls.durationMins}m
            </span>
          </div>
          <span
            className={`flex items-center gap-1 text-xs font-medium ${
              isFull
                ? "text-red-500"
                : isAlmostFull
                ? "text-amber-400"
                : "text-stone-400"
            }`}
          >
            <Users className="h-3 w-3" />
            {spotsLabel(cls)}
          </span>
        </div>

        {cls.room && (
          <p className="mt-2 text-xs text-stone-500 font-body">{cls.room}</p>
        )}
      </div>
    </Link>
  );
}
