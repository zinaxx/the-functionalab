"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isPast } from "date-fns";
import { Calendar, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  formatClassTime,
  CLASS_STYLE_LABELS,
  CLASS_STYLE_COLORS,
  isLateCancelWindow,
} from "@/lib/utils";
import type { BookingWithClass } from "@/types";

interface Props {
  bookings: BookingWithClass[];
}

export function BookingsClient({ bookings }: Props) {
  const now = new Date();
  const upcoming = bookings.filter(
    (b) => b.status === "CONFIRMED" && !isPast(new Date(b.yogaClass.startsAt))
  );
  const past = bookings.filter(
    (b) => isPast(new Date(b.yogaClass.startsAt)) || b.status !== "CONFIRMED"
  );

  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">
          Upcoming {upcoming.length > 0 && `(${upcoming.length})`}
        </TabsTrigger>
        <TabsTrigger value="past">History</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming classes"
            description="Book a class to see it here."
            action={{ href: "/schedule", label: "Browse schedule" }}
          />
        ) : (
          <div className="space-y-3 mt-4">
            {upcoming.map((booking) => (
              <UpcomingBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {past.length === 0 ? (
          <EmptyState title="No booking history" description="Your past classes will appear here." />
        ) : (
          <div className="space-y-3 mt-4">
            {past.map((booking) => (
              <PastBookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function UpcomingBookingCard({ booking }: { booking: BookingWithClass }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isLate = isLateCancelWindow(new Date(booking.yogaClass.startsAt));

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Cancellation failed", description: data.error });
      } else {
        const refunded = data.data?.creditsRefunded;
        toast({
          title: "Booking cancelled",
          description: refunded
            ? `${refunded} credit${refunded > 1 ? "s" : ""} returned.`
            : "No credits refunded (late cancellation).",
        });
        router.refresh();
      }
    } catch {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-white border border-stone-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium font-body ${CLASS_STYLE_COLORS[booking.yogaClass.style]}`}>
                {CLASS_STYLE_LABELS[booking.yogaClass.style]}
              </span>
              <Badge variant="outline" className="text-xs text-sage-700 border-sage-200 bg-sage-50">
                Confirmed
              </Badge>
            </div>
            <Link href={`/classes/${booking.classId}`} className="block">
              <h3 className="font-body font-medium text-stone-800 hover:text-sage-700 transition-colors">
                {booking.yogaClass.title}
              </h3>
            </Link>
            <p className="font-body text-sm text-stone-500 mt-0.5">
              {booking.yogaClass.instructor.name}
            </p>
            <p className="font-body text-sm text-stone-600 mt-1">
              {formatClassTime(new Date(booking.yogaClass.startsAt), new Date(booking.yogaClass.endsAt))}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-stone-400 hover:text-red-600 shrink-0"
            onClick={() => setShowModal(true)}
          >
            Cancel
          </Button>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel booking?</DialogTitle>
            <DialogDescription asChild>
              <div>
                <p className="mb-3">You&apos;re about to cancel <strong>{booking.yogaClass.title}</strong>.</p>
                {isLate && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>This is within 12 hours of the class — your credit <strong>will not be refunded</strong>.</span>
                  </div>
                )}
                {!isLate && (
                  <p className="text-sm text-stone-500">
                    Your {booking.creditsUsed} credit{booking.creditsUsed !== 1 ? "s" : ""} will be returned.
                  </p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Keep it</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? "Cancelling..." : "Cancel booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PastBookingCard({ booking }: { booking: BookingWithClass }) {
  const statusConfig: Record<string, { label: string; class: string }> = {
    CONFIRMED: { label: "Attended", class: "text-sage-700 border-sage-200 bg-sage-50" },
    CANCELLED: { label: "Cancelled", class: "text-stone-500 border-stone-200 bg-stone-50" },
    LATE_CANCELLED: { label: "Late cancel", class: "text-amber-700 border-amber-200 bg-amber-50" },
    NO_SHOW: { label: "No show", class: "text-red-700 border-red-200 bg-red-50" },
  };
  const config = statusConfig[booking.status] ?? statusConfig.CONFIRMED;

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 opacity-80">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium font-body ${CLASS_STYLE_COLORS[booking.yogaClass.style]}`}>
              {CLASS_STYLE_LABELS[booking.yogaClass.style]}
            </span>
            <Badge variant="outline" className={`text-xs ${config.class}`}>
              {config.label}
            </Badge>
          </div>
          <h3 className="font-body font-medium text-stone-700">{booking.yogaClass.title}</h3>
          <p className="font-body text-sm text-stone-400 mt-0.5">{booking.yogaClass.instructor.name}</p>
          <p className="font-body text-sm text-stone-500 mt-1">
            {formatClassTime(new Date(booking.yogaClass.startsAt), new Date(booking.yogaClass.endsAt))}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mt-4 rounded-2xl bg-white border border-stone-200 p-10 text-center">
      <Calendar className="h-10 w-10 text-stone-200 mx-auto mb-3" />
      <p className="font-display text-xl text-stone-400 mb-1">{title}</p>
      <p className="font-body text-sm text-stone-400 mb-4">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      )}
    </div>
  );
}
