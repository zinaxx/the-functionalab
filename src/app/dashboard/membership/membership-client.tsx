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
        <Loader2 className="h-6 w-6 animate-spin text-stone-600" />
      </div>
    );
  }

  const hasActiveMembership = data?.membership?.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl font-light text-white">Membership</h1>

      {/* Current status */}
      <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6">
        <h2 className="font-display text-xl font-medium text-white mb-4">Current plan</h2>

        {hasActiveMembership ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[#fd5227]/10 border border-[#fd5227]/30 rounded-xl">
              <CheckCircle2 className="h-5 w-5 text-[#fd5227] mt-0.5 shrink-0" />
              <div>
                <p className="font-body font-medium text-[#fd5227]">Unlimited Monthly — Active</p>
                {data?.membership?.currentPeriodEnd && (
                  <p className="font-body text-sm text-[#fd5227]/70 mt-0.5">
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
                className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel subscription"}
              </Button>
            ) : (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400 font-body">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                Your subscription is set to cancel at the end of this billing period.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl">
              <CreditCard className="h-5 w-5 text-stone-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-body font-medium text-stone-300">Pay-as-you-go</p>
                <p className="font-body text-sm text-stone-500 mt-0.5">
                  {data?.creditBalance ?? 0} credit{(data?.creditBalance ?? 0) !== 1 ? "s" : ""} remaining
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="bg-[#fd5227] hover:bg-[#e04420] text-white">Upgrade to Unlimited Monthly</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Credits & packs */}
      {!hasActiveMembership && (
        <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6">
          <h2 className="font-display text-xl font-medium text-white mb-2">Buy class credits</h2>
          <p className="font-body text-sm text-stone-500 mb-5">Credits are deducted when you book a class.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PRICING_PLANS.filter((p) => p.type === "one-time").map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-4 ${plan.popular ? "border-[#fd5227] bg-[#fd5227]/5" : "border-[#2A2A2A] bg-[#1A1A1A]"}`}
              >
                <p className="font-display text-lg font-medium text-white">{plan.name}</p>
                <p className="font-display text-2xl font-light text-white mt-1">${plan.price}</p>
                <p className="font-body text-sm text-stone-500 mt-0.5">{plan.credits} credits</p>
                <Button
                  className={`w-full mt-3 ${plan.popular ? "bg-[#fd5227] hover:bg-[#e04420] text-white" : "bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white border-0"}`}
                  size="sm"
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
        <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] p-6">
          <h2 className="font-display text-xl font-medium text-white mb-4">Payment history</h2>
          <div className="space-y-2">
            {data.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-[#2A2A2A] last:border-0">
                <div>
                  <p className="font-body text-sm font-medium text-stone-300">
                    {payment.description ?? payment.type}
                  </p>
                  <p className="font-body text-xs text-stone-500">
                    {format(new Date(payment.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <p className="font-body text-sm font-medium text-white">
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
