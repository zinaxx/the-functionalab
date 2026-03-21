"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, AlertCircle, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MembershipData {
  creditBalance: number;
  membership: {
    id: string;
    status: string;
    type: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  payments: {
    id: string;
    description: string | null;
    amount: number;
    createdAt: string;
    status: string;
    type: string;
  }[];
}

export function MembershipClient() {
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/user/membership").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const d = await res.json();
      if (res.ok) window.location.href = d.url;
      else toast({ variant: "destructive", title: "Error", description: d.error });
    } catch {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/user/membership", { method: "DELETE" });
      const d = await res.json();
      if (res.ok) {
        toast({ title: "Subscription cancelled", description: "Access continues until the end of your billing period." });
        setData((prev) =>
          prev
            ? { ...prev, membership: prev.membership ? { ...prev.membership, cancelAtPeriodEnd: true } : null }
            : prev
        );
      } else {
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } catch {
      toast({ variant: "destructive", title: "Something went wrong" });
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-stone-300" />
      </div>
    );
  }

  const hasActiveMembership = data?.membership?.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl font-light text-stone-800">Membership</h1>

      {/* Current status */}
      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <h2 className="font-display text-xl font-medium text-stone-800 mb-4">Current plan</h2>

        {hasActiveMembership ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-sage-50 border border-sage-200 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-sage-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-body font-medium text-sage-800">Unlimited Monthly — Active</p>
                {data?.membership?.currentPeriodEnd && (
                  <p className="font-body text-sm text-sage-600 mt-0.5">
                    {data.membership.cancelAtPeriodEnd
                      ? `Cancels on ${format(new Date(data.membership.currentPeriodEnd), "MMMM d, yyyy")}`
                      : `Renews on ${format(new Date(data.membership.currentPeriodEnd), "MMMM d, yyyy")}`}
                  </p>
                )}
              </div>
            </div>

            {!data?.membership?.cancelAtPeriodEnd ? (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel subscription"}
              </Button>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-body">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                Your subscription is set to cancel at the end of this billing period.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <CreditCard className="h-5 w-5 text-stone-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-body font-medium text-stone-700">Pay-as-you-go</p>
                <p className="font-body text-sm text-stone-500 mt-0.5">
                  {data?.creditBalance ?? 0} credit{(data?.creditBalance ?? 0) !== 1 ? "s" : ""} remaining
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button>Upgrade to Unlimited Monthly</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Credits & packs */}
      {!hasActiveMembership && (
        <div className="rounded-2xl bg-white border border-stone-200 p-6">
          <h2 className="font-display text-xl font-medium text-stone-800 mb-2">Buy class credits</h2>
          <p className="font-body text-sm text-stone-500 mb-5">Credits are deducted when you book a class.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PRICING_PLANS.filter((p) => p.type === "one-time").map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-4 ${plan.popular ? "border-sage-400 bg-sage-50" : "border-stone-200 bg-white"}`}
              >
                <p className="font-display text-lg font-medium text-stone-800">{plan.name}</p>
                <p className="font-display text-2xl font-light text-stone-800 mt-1">€{plan.price}</p>
                <p className="font-body text-sm text-stone-500 mt-0.5">{plan.credits} credits</p>
                <Button
                  className="w-full mt-3"
                  size="sm"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(plan.id)}
                  disabled={checkoutLoading === plan.id}
                >
                  {checkoutLoading === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Buy"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      {data?.payments && data.payments.length > 0 && (
        <div className="rounded-2xl bg-white border border-stone-200 p-6">
          <h2 className="font-display text-xl font-medium text-stone-800 mb-4">Payment history</h2>
          <div className="space-y-2">
            {data.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div>
                  <p className="font-body text-sm font-medium text-stone-700">
                    {payment.description ?? payment.type}
                  </p>
                  <p className="font-body text-xs text-stone-400">
                    {format(new Date(payment.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <p className="font-body text-sm font-medium text-stone-800">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(payment.amount / 100)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
