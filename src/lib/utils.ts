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
  HATHA: "Hatha",
  VINYASA: "Vinyasa",
  YIN: "Yin",
  ASHTANGA: "Ashtanga",
  RESTORATIVE: "Restorative",
  KUNDALINI: "Kundalini",
  POWER: "Power",
  PRENATAL: "Prenatal",
  MEDITATION: "Meditation",
};

/** Tailwind bg + text classes for each style badge */
export const CLASS_STYLE_COLORS: Record<ClassStyle, string> = {
  HATHA: "bg-green-100 text-green-800",
  VINYASA: "bg-blue-100 text-blue-800",
  YIN: "bg-purple-100 text-purple-800",
  ASHTANGA: "bg-orange-100 text-orange-800",
  RESTORATIVE: "bg-pink-100 text-pink-800",
  KUNDALINI: "bg-amber-100 text-amber-800",
  POWER: "bg-red-100 text-red-800",
  PRENATAL: "bg-rose-100 text-rose-800",
  MEDITATION: "bg-indigo-100 text-indigo-800",
};

export const LEVEL_LABELS: Record<ClassLevel, string> = {
  ALL_LEVELS: "All Levels",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const LEVEL_COLORS: Record<ClassLevel, string> = {
  ALL_LEVELS: "bg-stone-100 text-stone-600",
  BEGINNER: "bg-emerald-100 text-emerald-700",
  INTERMEDIATE: "bg-sky-100 text-sky-700",
  ADVANCED: "bg-violet-100 text-violet-700",
};

// ─── Pricing ────────────────────────────────────────────────

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 75,
    credits: 5,
    type: "one-time" as const,
    stripePriceEnv: "STRIPE_PRICE_5_CLASSES",
    features: [
      "5 class credits",
      "Valid for 3 months",
      "All class styles",
      "Book up to 14 days ahead",
    ],
  },
  {
    id: "regular",
    name: "Regular Pack",
    price: 130,
    credits: 10,
    type: "one-time" as const,
    stripePriceEnv: "STRIPE_PRICE_10_CLASSES",
    popular: true,
    features: [
      "10 class credits",
      "Valid for 3 months",
      "All class styles",
      "Book up to 14 days ahead",
      "Best value per class",
    ],
  },
  {
    id: "committed",
    name: "Committed Pack",
    price: 240,
    credits: 20,
    type: "one-time" as const,
    stripePriceEnv: "STRIPE_PRICE_20_CLASSES",
    features: [
      "20 class credits",
      "Valid for 6 months",
      "All class styles",
      "Book up to 14 days ahead",
      "Priority waitlist",
    ],
  },
  {
    id: "unlimited",
    name: "Unlimited Monthly",
    price: 89,
    credits: null,
    type: "subscription" as const,
    stripePriceEnv: "STRIPE_PRICE_MONTHLY",
    features: [
      "Unlimited classes",
      "All class styles",
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
