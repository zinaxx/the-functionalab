"use client";

import { useState } from "react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function PricingClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/pricing";
          return;
        }
        toast({ variant: "destructive", title: "Error", description: data.error });
        return;
      }

      window.location.href = data.url;
    } catch {
      toast({ variant: "destructive", title: "Something went wrong", description: "Please try again." });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0A0A0A]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-body text-xs uppercase tracking-widest text-[#fd5227] mb-3">
            Simple, transparent pricing
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-white mb-4">
            Choose your plan
          </h1>
          <div className="mx-auto w-16 h-px bg-[#fd5227]/40 mb-6" />
          <p className="font-body text-stone-400 max-w-md mx-auto text-sm leading-relaxed">
            All plans include access to every class style, all levels, and every coach. No hidden fees.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
                plan.popular
                  ? "border-[#fd5227] bg-[#141414] shadow-lg shadow-[#fd5227]/10"
                  : "border-[#2A2A2A] bg-[#141414] hover:border-[#3A3A3A] hover:shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fd5227] px-3 py-1 text-xs font-medium text-white font-body shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h2 className="font-display text-xl font-medium text-white mb-1">
                  {plan.name}
                </h2>
                <div className="flex items-end gap-1">
                  <span className="font-display text-4xl font-light text-white">
                    ${plan.price}
                  </span>
                  {plan.type === "subscription" && (
                    <span className="font-body text-sm text-stone-500 mb-1.5">/mo</span>
                  )}
                </div>
                <p className="font-body text-sm text-stone-500 mt-1">
                  {plan.credits === null
                    ? "Unlimited classes"
                    : `${plan.credits} class credits`}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm font-body">
                    <Check className="h-4 w-4 text-[#fd5227] mt-0.5 shrink-0" />
                    <span className="text-stone-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-[#fd5227] hover:bg-[#e04420] text-white"
                    : "bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A]"
                }`}
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : plan.type === "subscription" ? (
                  "Start monthly plan"
                ) : (
                  "Buy now"
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 text-center">
          <h3 className="font-display text-lg font-medium text-white mb-2">
            First time at The FunctionaLab?
          </h3>
          <p className="font-body text-sm text-stone-500 mb-4">
            Come in and train — no commitment needed. Credits never expire within their validity period.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-body text-stone-500">
            {[
              "All equipment included",
              "Cancel 12h in advance",
              "Secure checkout via Stripe",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#fd5227]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
