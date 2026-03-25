# THE FUNCTIONALAB — COMPREHENSIVE TECHNICAL & FUNCTIONAL SPECIFICATION

**Version 1.0** | **March 2026** | **Professional Fitness Studio Management & Booking Platform**

---

## 1. PROJECT OVERVIEW

### 1.1 About The FunctionaLab

The FunctionaLab is a premier functional fitness studio located in Jounieh, Lebanon. The platform serves as a comprehensive digital ecosystem for class booking, membership management, and studio administration.

**Key Tagline:** "Train For Life"

**Studio Focus:** Functional fitness programming with emphasis on certified coaching, progressive overload, and inclusive skill levels.

**Target Audience:**
- Primary: Athletes and fitness enthusiasts of all experience levels in Jounieh and surrounding areas
- Secondary: Members seeking commitment-free drop-in classes or unlimited monthly memberships

**Business Model:**
- Pay-per-class credit packs (8, 16, or 32 sessions)
- Monthly unlimited subscription
- Walk-in cash registrations (managed by admin)

---

## 2. TECHNOLOGY STACK

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | Next.js 14 (App Router) |
| **UI Library** | React 18 (client + server components) |
| **Styling** | Tailwind CSS v3 with custom dark theme |
| **Component Library** | shadcn/ui (form, dialog, button, input, select, avatar, etc.) |
| **Hosting & Deployment** | Vercel (serverless, cron support) |
| **Database** | PostgreSQL via Supabase |
| **ORM** | Prisma v5 |
| **Authentication** | Supabase Auth (email/password, JWT) |
| **Payments** | Stripe (one-time purchases + subscriptions) |
| **Email** | Resend (transactional HTML emails) |
| **Fonts** | Barlow Condensed (display) + Barlow (body) |

---

## 3. DATABASE SCHEMA

### User
The primary member profile.

| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| supabaseId | String | Unique, links to Supabase auth |
| email | String | Unique |
| name | String? | Optional |
| avatarUrl | String? | Profile image |
| phone | String? | Contact number |
| healthNotes | String? | Medical/health info |
| role | Enum | USER or ADMIN |
| creditBalance | Int | Available class credits |
| stripeCustomerId | String? | Stripe customer ID |
| createdAt | DateTime | Auto |

**Relations:** bookings, waitlistEntries, membership, payments

---

### Instructor
Fitness coaches who lead classes.

| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| name | String | Full name |
| bio | String? | Professional bio |
| avatarUrl | String? | Profile photo |
| specialties | ClassStyle[] | Taught class styles |
| instagram | String? | Instagram handle (no @) |
| active | Boolean | Currently teaching? |

**Relations:** classes

---

### YogaClass
Individual fitness class sessions.

| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| title | String | Class name |
| description | String? | Optional details |
| style | ClassStyle | Required enum |
| level | ClassLevel | Default: ALL_LEVELS |
| durationMins | Int | Default: 60 |
| capacity | Int | Max participants, default: 20 |
| startsAt | DateTime | Indexed |
| endsAt | DateTime | Calculated from duration |
| room | String? | Room/location |
| creditCost | Int | Credits to book, default: 1 |
| status | ClassStatus | SCHEDULED / CANCELLED / COMPLETED |

**Relations:** instructor, bookings, waitlist

---

### Booking
User registration for a specific class.

| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| status | BookingStatus | CONFIRMED / CANCELLED / LATE_CANCELLED / NO_SHOW |
| checkedIn | Boolean | Attended the class |
| creditsUsed | Int | Credits deducted (0 if membership holder) |
| cancelledAt | DateTime? | When cancelled |
| cancelReason | String? | Reason for cancellation |

**Constraints:** UNIQUE(userId, classId) — one booking per user per class
**Cascade:** Deleted when parent user is deleted

---

### WaitlistEntry
Queue for full classes.

| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| position | Int | Queue position (1-indexed) |
| notified | Boolean | Promotion email sent |

**Constraints:** UNIQUE(userId, classId)
**Cascade:** Deleted when parent user is deleted

---

### Membership
Monthly unlimited subscription.

| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| type | MembershipType | MONTHLY_UNLIMITED |
| status | MembershipStatus | ACTIVE / CANCELLED / PAST_DUE / EXPIRED |
| stripeSubscriptionId | String? | Stripe subscription ID |
| currentPeriodStart | DateTime? | Billing period start |
| currentPeriodEnd | DateTime? | Billing period end |
| cancelAtPeriodEnd | Boolean | User requested cancellation |

**Cascade:** Deleted when parent user is deleted

---

### Payment
Transaction records.

| Field | Type | Notes |
|-------|------|-------|
| id | String (CUID) | Primary key |
| stripePaymentId | String? | Stripe payment ID |
| amount | Int | Amount in cents |
| currency | String | Default: "eur" |
| status | PaymentStatus | PENDING / SUCCEEDED / FAILED / REFUNDED |
| type | PaymentType | CLASS_PACK / MEMBERSHIP / DROP_IN |
| creditsAdded | Int | Credits granted (CLASS_PACK) |
| description | String? | Plan name or notes |

**Cascade:** Deleted when parent user is deleted

---

### StudioSettings
Global studio configuration (singleton, id = "default").

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| cancellationWindowHours | Int | 12 | Hours before class for free cancellation |
| maxWaitlistSize | Int | 10 | Max waitlist entries per class |
| lateCancelPenalty | Boolean | true | Penalise late cancellations |
| bookingOpenDaysInAdvance | Int | 14 | Days ahead users can book |

---

### Enums

**ClassStyle:** HIIT, FIIT, SPINNING, GLUTES, SCULPT, ABS_EXPRESS, KANGOO_JUMP, POWER_JUMP, BOXING, KIDS, CORE_STRETCHING, FULL_BODY_BLAST, STEP

**ClassLevel:** ALL_LEVELS, BEGINNER, INTERMEDIATE, ADVANCED

**ClassStatus:** SCHEDULED, CANCELLED, COMPLETED

**BookingStatus:** CONFIRMED, CANCELLED, LATE_CANCELLED, NO_SHOW

**MembershipStatus:** ACTIVE, CANCELLED, PAST_DUE, EXPIRED

**PaymentType:** CLASS_PACK, MEMBERSHIP, DROP_IN

---

## 4. USER ROLES & PERMISSIONS

### Member (USER Role)

**Can:**
- Browse public pages without logging in
- Sign up and create an account
- Browse 14 days of upcoming classes with filters
- Book classes (if credits available or active membership)
- Join the waitlist for full classes
- Cancel bookings (full refund if >12h before class)
- View dashboard (credit balance, upcoming classes, membership)
- View booking history
- Purchase credit packs via Stripe
- Subscribe to monthly unlimited membership
- Cancel subscription (effective at period end)
- Receive automated email notifications

**Cannot:**
- Book if insufficient credits (unless membership)
- Book cancelled or past classes
- Cancel within 12h without credit penalty
- Join waitlist if already booked or on waitlist
- Access admin pages

---

### Admin (ADMIN Role)

**Access requirement:** Email must match `ADMIN_EMAIL` environment variable.

**Can do everything a member can, plus:**

**Classes:**
- Create, edit, and cancel classes
- Cancel entire class (auto-refund all bookings, notify members)
- View full roster and waitlist for any class
- Manually register any member to a class (walk-in, no credit deduction)
- Remove any member from a class (with refund + waitlist promotion)
- Remove anyone from the waitlist

**Members:**
- View all member accounts with stats (credits, bookings, membership)
- Manually add/remove credits
- Search and filter members

**Revenue:**
- View revenue dashboard (monthly, weekly breakdowns)
- View payment history

---

## 5. PAGES & FEATURES

### Public Pages (No Login Required)

#### Home Page (`/`)
- Hero section with tagline "Train For Life"
- 6 upcoming classes shown as cards (next 3 days)
- Studio feature highlights (coaches, all levels, results)
- Member testimonials
- Call-to-action to schedule and pricing
- Studio statistics

#### Schedule Page (`/schedule`)
- 14 days of upcoming classes
- Filters: by style, level, instructor
- Class cards showing: style badge, title, instructor, time, availability, room
- Availability indicators (red = full, amber = 1–3 spots left, green = available)
- Responsive grid layout

#### Class Detail Page (`/classes/[id]`)
- Full class info: title, style, level, instructor, date/time, duration, room
- Instructor bio and Instagram
- Booking sidebar with credit cost
- Smart booking button (adjusts based on auth/credits/capacity/waitlist status)
- 12-hour cancellation policy notice

#### Pricing Page (`/pricing`)
- 4 plans displayed as cards:
  - 8 Sessions
  - 16 Sessions *(Most Popular)*
  - 32 Sessions
  - Monthly Unlimited
- Stripe checkout integration

#### Instructors Page (`/instructors`)
- All active coaches with photo, bio, specialties, and Instagram

#### Login Page (`/login`)
- Email + password sign-in
- Redirect support

#### Sign-up Page (`/signup`)
- Name, email, password registration
- No email confirmation required (disabled for ease of onboarding)

---

### Member Pages (Login Required)

#### Dashboard (`/dashboard`)
- Personalized greeting
- Stats: credit balance, upcoming classes count, membership status
- Next 5 upcoming classes
- Quick links to schedule and pricing

#### All Bookings (`/dashboard/bookings`)
- Full booking history (past and future)
- Cancel button on eligible upcoming bookings

#### Membership (`/dashboard/membership`)
- Current subscription status
- Renewal date
- Cancel subscription option

---

### Admin Pages (`/admin/*`)

#### Overview (`/admin`)
- Total members and active memberships
- Classes this week
- Bookings this month
- Revenue this month
- Recent bookings feed

#### Classes (`/admin/classes`)
- Full class list with status, capacity, bookings count
- Create / edit / duplicate / cancel class
- View class roster (registered members + waitlist)
- Add walk-in member to class or waitlist

#### Members (`/admin/members`)
- Search and view all members
- Credit balance, membership status, booking count
- Manual credit adjustments

#### Revenue (`/admin/revenue`)
- Revenue broken down by period and payment type

---

## 6. BOOKING SYSTEM

### Standard Booking Flow

1. User clicks "Book now" on a class
2. Backend validates: auth, class exists, not cancelled, not in past, not full, sufficient credits or active membership
3. Booking created with status `CONFIRMED`
4. Credits deducted (unless membership holder — always 0 credits)
5. Confirmation email sent immediately

### Waitlist Flow

1. Class is full → user sees "Join waitlist"
2. WaitlistEntry created with queue position (e.g. #3)
3. Position shown on class page

### Automatic Promotion

When any booking is cancelled (by user or admin):
1. Backend checks for first waitlist entry
2. Creates booking for waitlist user (upserts to handle prior cancelled bookings)
3. Deducts credits if not a membership holder
4. Deletes waitlist entry
5. Recalculates positions for remaining entries
6. Sends "You're in!" confirmation email to promoted user

### Cancellation Policy

| Scenario | Credits Refunded | Status Set To |
|----------|-----------------|---------------|
| Cancel >12h before class | Yes (full refund) | CANCELLED |
| Cancel <12h before class | No | LATE_CANCELLED |
| Admin removes member | Yes (full refund) | CANCELLED |
| Admin cancels entire class | Yes (all members) | CANCELLED |

---

## 7. PAYMENT SYSTEM

### Pricing Plans

| Plan | Price | Credits | Validity |
|------|-------|---------|---------|
| 8 Sessions | $80 | 8 | 3 months |
| 16 Sessions | $140 | 16 | 3 months |
| 32 Sessions | $240 | 32 | 6 months |
| Monthly Unlimited | $120/month | Unlimited | Monthly (auto-renew) |

### Checkout Flow

1. User clicks "Buy now"
2. App creates Stripe checkout session
3. User completes payment on Stripe's hosted page
4. Stripe fires webhook to `/api/stripe/webhook`
5. Backend adds credits (one-time) or creates membership (subscription)
6. Payment confirmation email sent

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Add credits or create membership |
| `customer.subscription.updated` | Update membership status |
| `customer.subscription.deleted` | Set membership to CANCELLED |
| `invoice.payment_failed` | Set membership to PAST_DUE |

---

## 8. EMAIL NOTIFICATIONS

### Email Types

| Email | Trigger | Content |
|-------|---------|---------|
| Booking Confirmed | On booking | Class details, time, instructor, location, cancellation policy |
| Class Reminder | 24h before (daily cron 9 AM) | Tomorrow's class info |
| Waitlist Promoted | When spot opens | "You're in!" + class details |
| Late Cancellation | Cancel <12h before | Credits not refunded notice |
| Payment Confirmed | After Stripe payment | Receipt with credits added |
| Admin Removed | Admin removes booking | Notification + credits refunded |
| Class Cancelled | Admin cancels class | Cancellation notice + credits refunded |

### Email Design
- Dark-themed HTML template matching the website
- Barlow Condensed branding
- Orange accent (#fd5227) for CTAs
- Non-blocking (failures don't interrupt core operations)

---

## 9. API ENDPOINTS

### Member Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bookings` | POST | Book a class |
| `/api/bookings/[id]` | DELETE | Cancel booking |
| `/api/waitlist` | POST | Join waitlist |
| `/api/waitlist/[id]` | DELETE | Leave waitlist |
| `/api/stripe/checkout` | POST | Start Stripe checkout |
| `/api/stripe/webhook` | POST | Stripe event handler |
| `/api/user/membership` | GET | Get membership status |
| `/api/user/membership` | POST | Cancel membership |

### Admin Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/classes` | GET / POST | List or create classes |
| `/api/admin/classes/[id]` | PUT / DELETE | Edit or delete class |
| `/api/admin/classes/[id]/cancel` | POST | Cancel class (refund all) |
| `/api/admin/classes/[id]/bookings` | GET | View class roster |
| `/api/admin/classes/[id]/register` | POST | Walk-in registration |
| `/api/admin/classes/[id]/waitlist` | GET / DELETE | View or manage waitlist |
| `/api/admin/bookings/[id]` | DELETE | Remove member from class |
| `/api/admin/members/[id]` | GET / PATCH / DELETE | View or manage member |

### Cron Endpoints

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/reminders` | Daily 9 AM UTC | Send 24h class reminders |
| `/api/cron/generate-schedule` | Monday 6 AM UTC | Auto-generate weekly classes |

All cron endpoints protected by `Authorization: Bearer ${CRON_SECRET}`.

---

## 10. AUTHENTICATION

- **Provider:** Supabase Auth
- **Method:** Email + password (Google OAuth removed)
- **Sessions:** Stored as httpOnly cookies (secure)
- **Email confirmation:** Disabled for easy onboarding
- **Admin detection:** `user.email === process.env.ADMIN_EMAIL`
- **Protected routes:** Middleware redirects unauthenticated users to `/login`
- **User creation:** DB record created on first API access via `getOrCreateDbUser()`

---

## 11. CRON JOBS

**Platform:** Vercel Cron (configured in `vercel.json`)

### Daily Reminder (9 AM UTC every day)
- Finds all confirmed bookings for classes starting in ~24 hours
- Sends reminder email to each member
- Secured with CRON_SECRET

### Weekly Schedule Generator (6 AM UTC every Monday)
- Checks if less than 2 weeks of classes are scheduled
- Auto-generates next week from a predefined weekly template
- Template based on the official gym schedule (25 slots/week)
- Secured with CRON_SECRET

---

## 12. CLASS SCHEDULE (Weekly Template)

| Day | Time | Class | Instructor |
|-----|------|-------|-----------|
| Monday | 9:00 | HIIT | Rayan |
| Monday | 10:00 | Kangoo Jump | Erika |
| Monday | 18:30 | Glutes | Rayan |
| Monday | 19:30 | ABS Express | Rayan |
| Monday | 20:00 | Power Jump | Carla |
| Tuesday | 9:00 | Spinning | Ziad |
| Tuesday | 10:00 | Glutes | Yasmina |
| Tuesday | 11:00 | Sculpt | Yasmina |
| Tuesday | 18:00 | Kids | Rayan |
| Tuesday | 19:00 | Boxing | Ziad |
| Wednesday | 9:00 | FIIT | Ziad |
| Wednesday | 10:00 | Core & Stretching | Rayan |
| Wednesday | 11:00 | Sculpt | Yasmina |
| Wednesday | 18:00 | Full Body Blast | Carla |
| Wednesday | 19:00 | Spinning | Carla |
| Thursday | 9:00 | HIIT | Rayan |
| Thursday | 10:00 | ABS Express | Rayan |
| Thursday | 12:00 | Sculpt | Yasmina |
| Thursday | 18:00 | HIIT | Rayan |
| Thursday | 19:00 | Core & Stretching | Rayan |
| Friday | 9:00 | FIIT | Ziad |
| Friday | 10:00 | Spinning | Ziad |
| Friday | 18:00 | Step | Carla |
| Friday | 19:00 | Spinning | Carla |
| Saturday | 11:00 | Spinning | Ziad |

---

## 13. DEPLOYMENT

### Live Environment
- **URL:** https://the-functionalab.vercel.app
- **Platform:** Vercel
- **Database:** Supabase (AWS eu-west-1, Ireland)
- **GitHub Repo:** github.com/zinaxx/the-functionalab

### Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key |
| `DATABASE_URL` | Prisma connection (PgBouncer pooler) |
| `DIRECT_URL` | Prisma direct connection (migrations) |
| `STRIPE_SECRET_KEY` | Stripe backend key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe frontend key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `STRIPE_PRICE_5_CLASSES` | Stripe price ID (8 sessions) |
| `STRIPE_PRICE_10_CLASSES` | Stripe price ID (16 sessions) |
| `STRIPE_PRICE_20_CLASSES` | Stripe price ID (32 sessions) |
| `STRIPE_PRICE_MONTHLY` | Stripe price ID (monthly) |
| `RESEND_API_KEY` | Email service key |
| `RESEND_FROM_EMAIL` | Sender email address |
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `ADMIN_EMAIL` | Admin account email (server-side) |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Admin account email (client-side) |
| `CRON_SECRET` | Cron job authentication token |

### Deployment Workflow
1. Make changes locally (`npm run dev`)
2. Commit and push to GitHub (`git push`)
3. Deploy to Vercel (`vercel --prod`)

---

## 14. KNOWN TECHNICAL NOTES

- **PgBouncer compatibility:** All Prisma operations use sequential calls instead of `$transaction(async)` — required because the `DATABASE_URL` uses PgBouncer transaction pooler which does not support interactive transactions.
- **Cascade deletes:** Deleting a user automatically removes their bookings, waitlist entries, membership, and payments.
- **Upsert on promotion:** Waitlist promotion uses `upsert` (not `create`) to handle cases where a user previously had a cancelled booking on the same class.
- **Walk-in registration:** Admin can register any user with 0 credits deducted. If class is full, user is added to waitlist instead.

---

## 15. FUTURE ENHANCEMENT OPPORTUNITIES

- Custom domain (e.g. thefunctionalab.com)
- Stripe live mode (currently test mode)
- Verified sender domain for Resend emails
- Mobile app (iOS/Android)
- Progress tracking (check-in history, stats)
- Class ratings and reviews
- SMS reminders
- Instructor commission tracking
- Member health intake forms and waivers
- Private and group class bookings
- Advanced revenue reporting and CSV export
- Referral program (invite friends, earn credits)

---

*Specification prepared March 2026 — The FunctionaLab, Jounieh, Lebanon*
