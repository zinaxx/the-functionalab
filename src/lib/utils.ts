import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInHours, isPast } from "date-fns";
import type { ClassStyle, ClassLevel, YogaClassWithDetails } from "@/types";

// ─── Tailwind class helper (shadcn/ui) ──────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date / Time Formatting ─────────────────────────────────

/** e.g. "Mon, Jan 15 · 9:00 AM – 10:00 AM" */
export function formatClassTime(startsAt: Date, endsAt: Date): string {
  const day = format(startsAt, "EEE, MMM d");
  const start = format(startsAt, "h:mm a");
  const end = format(endsAt, "h:mm a");
  return `${day} · ${start} – ${end}`;
}

/** e.g. "9:00 AM" */
export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

/** e.g. "January 15, 2026" */
export function formatDate(date: Date): string {
  return format(date, "MMMM d, yyyy");
}

/** e.g. "Mon, Jan 15" */
export function formatShortDate(date: Date): string {
  return format(date, "EEE, MMM d");
}

// ─── Booking Helpers ────────────────────────────────────────

/**
 * Returns true if the class can still be cancelled for a full refund
 * (i.e. more than `windowHours` hours before class starts).
 */
export function isCancellable(
  startsAt: Date,
  windowHours: number = 12
): boolean {
  if (isPast(startsAt)) return false;
  return differenceInHours(startsAt, new Date()) > windowHours;
}

/**
 * Returns true if the class is in the late cancellation window
 * (within `windowHours` hours but not yet past).
 */
export function isLateCancelWindow(
  startsAt: Date,
  windowHours: number = 12
): boolean {
  if (isPast(startsAt)) return false;
  const hoursUntil = differenceInHours(startsAt, new Date());
  return hoursUntil <= windowHours && hoursUntil > 0;
}

/** Returns a human-readable spots label */
export function spotsLabel(yogaClass: YogaClassWithDetails): string {
  const { spotsLeft, capacity } = yogaClass;
  if (spotsLeft <= 0) return "Full";
  if (spotsLeft <= 3) return `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`;
  return `${spotsLeft}/${capacity} spots`;
}

// ─── Class Style Labels & Colors ────────────────────────────

export const CLASS_STYLE_LABELS: Record<ClassStyle, string> = {
  HIIT: "HIIT",
  FIIT: "FIIT",
  SPINNING: "Spinning",
  GLUTES: "Glutes",
  SCULPT: "Sculpt",
  ABS_EXPRESS: "ABS Express",
  KANGOO_JUMP: "Kangoo Jump",
  POWER_JUMP: "Power Jump",
  BOXING: "Boxing",
  KIDS: "Kids",
  CORE_STRETCHING: "Core & Stretching",
  FULL_BODY_BLAST: "Full Body Blast",
  STEP: "Step",
};

/** Tailwind bg + text classes for each style badge */
export const CLASS_STYLE_COLORS: Record<ClassStyle, string> = {
  HIIT: "bg-[#fd5227]/20 text-[#fd5227]",
  FIIT: "bg-[#fd5227]/20 text-[#fd5227]",
  SPINNING: "bg-white/10 text-white",
  GLUTES: "bg-[#fd5227]/20 text-[#fd5227]",
  SCULPT: "bg-white/10 text-white",
  ABS_EXPRESS: "bg-[#fd5227]/20 text-[#fd5227]",
  KANGOO_JUMP: "bg-white/10 text-white",
  POWER_JUMP: "bg-[#fd5227]/20 text-[#fd5227]",
  BOXING: "bg-white/10 text-white",
  KIDS: "bg-white/10 text-white",
  CORE_STRETCHING: "bg-[#fd5227]/20 text-[#fd5227]",
  FULL_BODY_BLAST: "bg-[#fd5227]/20 text-[#fd5227]",
  STEP: "bg-white/10 text-white",
};

export const LEVEL_LABELS: Record<ClassLevel, string> = {
  ALL_LEVELS: "All Levels",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const LEVEL_COLORS: Record<ClassLevel, string> = {
  ALL_LEVELS: "bg-stone-500/20 text-stone-400",
  BEGINNER: "bg-emerald-500/20 text-emerald-400",
  INTERMEDIATE: "bg-sky-500/20 text-sky-400",
  ADVANCED: "bg-violet-500/20 text-violet-400",
};

// ─── Pricing ────────────────────────────────────────────────

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "8 Sessions",
    price: 80,
    credits: 8,
    type: "one-time" as const,
    stripePriceEnv: "STRIPE_PRICE_5_CLASSES",
    features: [
      "8 class credits",
      "Valid for 3 months",
      "All training styles",
      "Book up to 14 days ahead",
    ],
  },
  {
    id: "regular",
    name: "16 Sessions",
    price: 140,
    credits: 16,
    type: "one-time" as const,
    stripePriceEnv: "STRIPE_PRICE_10_CLASSES",
    popular: true,
    features: [
      "16 class credits",
      "Valid for 3 months",
      "All training styles",
      "Book up to 14 days ahead",
      "Best value per session",
    ],
  },
  {
    id: "committed",
    name: "32 Sessions",
    price: 240,
    credits: 32,
    type: "one-time" as const,
    stripePriceEnv: "STRIPE_PRICE_20_CLASSES",
    features: [
      "32 class credits",
      "Valid for 6 months",
      "All training styles",
      "Book up to 14 days ahead",
      "Priority waitlist",
    ],
  },
  {
    id: "unlimited",
    name: "Monthly Unlimited",
    price: 120,
    credits: null,
    type: "subscription" as const,
    stripePriceEnv: "STRIPE_PRICE_MONTHLY",
    features: [
      "Unlimited classes",
      "All training styles",
      "Book up to 14 days ahead",
      "Priority waitlist",
      "Cancel anytime",
    ],
  },
];

// ─── Currency Formatting ────────────────────────────────────

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatEuroFromUnit(euros: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(euros);
}
