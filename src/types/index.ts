import type {
  User,
  Instructor,
  FitnessClass,
  Booking,
  WaitlistEntry,
  Membership,
  Payment,
  StudioSettings,
  ClassStyle,
  ClassLevel,
  ClassStatus,
  BookingStatus,
  MembershipStatus,
  PaymentType,
  Role,
} from "@prisma/client";

// ─── Re-exports for convenience ─────────────────────────────
export type {
  User,
  Instructor,
  FitnessClass,
  Booking,
  WaitlistEntry,
  Membership,
  Payment,
  StudioSettings,
};

export {
  ClassStyle,
  ClassLevel,
  ClassStatus,
  BookingStatus,
  MembershipStatus,
  PaymentType,
  Role,
};

// ─── Derived / Composite Types ──────────────────────────────

/** FitnessClass with its instructor loaded */
export type FitnessClassWithInstructor = FitnessClass & {
  instructor: Instructor;
};

/** FitnessClass with instructor + booking count (for schedule display) */
export type FitnessClassWithDetails = FitnessClassWithInstructor & {
  _count: {
    bookings: number;
  };
  spotsLeft: number;
};

/** Booking with the fitness class + instructor (for user dashboard) */
export type BookingWithClass = Booking & {
  fitnessClass: FitnessClassWithInstructor;
};

/** User with their active membership (if any) */
export type UserWithMembership = User & {
  membership: Membership | null;
};

/** Full user profile for dashboard */
export type UserProfile = User & {
  membership: Membership | null;
  bookings: BookingWithClass[];
};

/** WaitlistEntry with class info */
export type WaitlistEntryWithClass = WaitlistEntry & {
  fitnessClass: FitnessClassWithInstructor;
};

/** Admin view of a member */
export type AdminMemberView = User & {
  membership: Membership | null;
  _count: {
    bookings: number;
  };
};

/** Revenue analytics data point */
export type RevenueDataPoint = {
  month: string;
  revenue: number;
  bookings: number;
};

/** Class style distribution for analytics */
export type StyleDistribution = {
  style: ClassStyle;
  count: number;
  percentage: number;
};

// ─── API Response Types ─────────────────────────────────────

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type BookingResponse = ApiResponse<Booking>;
export type WaitlistResponse = ApiResponse<WaitlistEntry>;

// ─── Pricing ────────────────────────────────────────────────

export type PricingPlan = {
  id: string;
  name: string;
  price: number; // in USD
  credits: number | null; // null for unlimited
  type: "one-time" | "subscription";
  stripePriceId: string;
  features: string[];
  popular?: boolean;
};
