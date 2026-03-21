"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BookingStatus } from "@prisma/client";
import { isCancellable, isLateCancelWindow } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  classId: string;
  isAuthenticated: boolean;
  isCancelled: boolean;
  isFull: boolean;
  existingBookingId: string | null;
  existingBookingStatus: BookingStatus | null;
  onWaitlist: boolean;
  creditBalance: number;
  creditCost: number;
  hasActiveMembership: boolean;
  startsAt: Date;
}

export function BookButton({
  classId,
  isAuthenticated,
  isCancelled,
  isFull,
  existingBookingId,
  existingBookingStatus,
  onWaitlist,
  creditBalance,
  creditCost,
  hasActiveMembership,
  startsAt,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const isBooked = existingBookingStatus === "CONFIRMED";
  const canAfford = hasActiveMembership || creditBalance >= creditCost;
  const isLateCancel = isLateCancelWindow(new Date(startsAt));

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Booking failed", description: data.error });
      } else {
        toast({ variant: "success" as any, title: "You're booked in!", description: "Check your email for confirmation." });
        router.refresh();
      }
    } catch {
      toast({ variant: "destructive", title: "Something went wrong", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Couldn't join waitlist", description: data.error });
      } else {
        toast({ title: "Added to waitlist", description: "We'll notify you if a spot opens up." });
        router.refresh();
      }
    } catch {
      toast({ variant: "destructive", title: "Something went wrong", description: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!existingBookingId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${existingBookingId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Cancellation failed", description: data.error });
      } else {
        const refunded = data.data?.creditsRefunded;
        toast({
          title: "Booking cancelled",
          description: refunded
            ? `${refunded} credit${refunded > 1 ? "s" : ""} returned to your account.`
            : "No credits were refunded (late cancellation).",
        });
        router.refresh();
      }
    } catch {
      toast({ variant: "destructive", title: "Something went wrong", description: "Please try again." });
    } finally {
      setLoading(false);
      setShowCancelModal(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/waitlist/${classId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Left waitlist" });
        router.refresh();
      }
    } catch {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <Link href={`/login?redirect=/classes/${classId}`} className="block">
          <Button className="w-full" size="lg">Sign in to book</Button>
        </Link>
        <Link href={`/signup?redirect=/classes/${classId}`} className="block">
          <Button variant="outline" className="w-full" size="lg">Create account</Button>
        </Link>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <Button disabled className="w-full" size="lg">Class cancelled</Button>
    );
  }

  if (isBooked) {
    return (
      <>
        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full bg-sage-50 text-sage-700 border border-sage-200 hover:bg-sage-100 cursor-default"
            size="lg"
            disabled
          >
            ✓ Booked
          </Button>
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            size="lg"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel booking
          </Button>
        </div>

        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel your booking?</DialogTitle>
              <DialogDescription>
                {isLateCancel ? (
                  <span className="flex items-start gap-2 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    This is a <strong>late cancellation</strong> — within 12 hours of class. Your credit will <strong>not</strong> be refunded.
                  </span>
                ) : (
                  "You'll get your credit back since you're cancelling more than 12 hours before class."
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                Keep booking
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
              >
                {loading ? "Cancelling..." : "Yes, cancel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (onWaitlist) {
    return (
      <div className="space-y-3">
        <Button
          variant="secondary"
          className="w-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-default"
          size="lg"
          disabled
        >
          On waitlist
        </Button>
        <Button
          variant="ghost"
          className="w-full text-stone-500"
          size="sm"
          onClick={handleLeaveWaitlist}
          disabled={loading}
        >
          {loading ? "Leaving..." : "Leave waitlist"}
        </Button>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={handleJoinWaitlist} disabled={loading}>
          {loading ? "Joining..." : "Join waitlist"}
        </Button>
        <p className="text-center text-xs text-stone-400 font-body">
          We&apos;ll email you if a spot opens up
        </p>
      </div>
    );
  }

  if (!canAfford) {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800 font-body">
            You need {creditCost} credit{creditCost > 1 ? "s" : ""} to book. You have {creditBalance}.
          </p>
        </div>
        <Link href="/pricing">
          <Button className="w-full" size="lg">Buy credits</Button>
        </Link>
      </div>
    );
  }

  return (
    <Button className="w-full" size="lg" onClick={handleBook} disabled={loading}>
      {loading ? "Booking..." : `Book now · ${creditCost} credit${creditCost > 1 ? "s" : ""}`}
    </Button>
  );
}
