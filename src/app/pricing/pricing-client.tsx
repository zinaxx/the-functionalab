"use client";

import { Check } from "lucide-react";

const sections = [
  {
    title: "Classes Packages",
    note: "Includes all classes except Sculpt and Boxing",
    plans: [
      {
        name: "Monthly Membership",
        price: null as number | null,
        priceLabel: "Contact us",
        features: ["1 month unlimited access", "All classes except Sculpt & Boxing"],
        popular: true,
      },
      {
        name: "Single Class",
        price: 10 as number | null,
        priceLabel: undefined as string | undefined,
        features: ["Drop-in access", "All classes except Sculpt & Boxing"],
        popular: false,
      },
    ],
  },
  {
    title: "Kids Classes",
    plans: [
      { name: "Package of 4", price: 50 as number | null, priceLabel: undefined as string | undefined, features: ["4 class credits", "Kids programme"], popular: false },
      { name: "Single Class", price: 15 as number | null, priceLabel: undefined as string | undefined, features: ["Drop-in access", "Kids programme"], popular: false },
    ],
  },
  {
    title: "Boxing Class",
    plans: [
      { name: "Package of 4", price: 50 as number | null, priceLabel: undefined as string | undefined, features: ["4 class credits", "Boxing programme"], popular: false },
      { name: "Single Class", price: 15 as number | null, priceLabel: undefined as string | undefined, features: ["Drop-in access", "Boxing programme"], popular: false },
    ],
  },
  {
    title: "Sculpt Class",
    footnote:
      "The purchase of any Sculpt class package includes unlimited access to all other classes (except Boxing).",
    plans: [
      { name: "Package of 8", price: 90 as number | null, priceLabel: undefined as string | undefined, features: ["8 Sculpt credits", "Unlimited access to all other classes (excl. Boxing)"], popular: true },
      { name: "Package of 8 + Gym", price: 150 as number | null, priceLabel: undefined as string | undefined, features: ["8 Sculpt credits", "Gym membership included", "Unlimited access to all other classes (excl. Boxing)"], popular: false },
      { name: "Package of 12", price: 120 as number | null, priceLabel: undefined as string | undefined, features: ["12 Sculpt credits", "Unlimited access to all other classes (excl. Boxing)"], popular: false },
      { name: "Package of 12 + Gym", price: 160 as number | null, priceLabel: undefined as string | undefined, features: ["12 Sculpt credits", "Gym membership included", "Unlimited access to all other classes (excl. Boxing)"], popular: false },
      { name: "Single Class", price: 15 as number | null, priceLabel: undefined as string | undefined, features: ["Drop-in access", "Sculpt programme"], popular: false },
    ],
  },
];

export function PricingClient() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-[#0A0A0A]">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-body text-xs uppercase tracking-widest text-[#fd5227] mb-3">
            Simple, transparent pricing
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-light text-white mb-4">
            Our packages
          </h1>
          <div className="mx-auto w-16 h-px bg-[#fd5227]/40 mb-6" />
          <p className="font-body text-stone-400 max-w-md mx-auto text-sm leading-relaxed">
            Choose the package that fits your training goals. Drop in or commit — we have options for every level.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-14">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-4 mb-5">
                <h2 className="font-display text-2xl font-light text-white whitespace-nowrap">
                  {section.title}
                </h2>
                <div className="h-px flex-1 bg-[#2A2A2A]" />
              </div>
              {section.note && (
                <p className="font-body text-xs text-stone-500 uppercase tracking-wide mb-4">
                  {section.note}
                </p>
              )}

              <div className={`grid gap-4 ${
                section.plans.length === 2
                  ? "sm:grid-cols-2"
                  : section.plans.length === 3
                  ? "sm:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-3"
              }`}>
                {section.plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col rounded-2xl border p-5 ${
                      plan.popular
                        ? "border-[#fd5227] bg-[#141414] shadow-lg shadow-[#fd5227]/10"
                        : "border-[#2A2A2A] bg-[#141414]"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fd5227] px-3 py-1 text-xs font-medium text-white font-body shadow-sm">
                          Best value
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="font-display text-lg font-medium text-white mb-1">
                        {plan.name}
                      </h3>
                      <div className="flex items-end gap-1">
                        {plan.price !== null && plan.price !== undefined ? (
                          <>
                            <span className="font-display text-3xl font-light text-white">
                              ${plan.price}
                            </span>
                          </>
                        ) : (
                          <span className="font-body text-sm text-stone-400">
                            {plan.priceLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm font-body">
                          <Check className="h-4 w-4 text-[#fd5227] mt-0.5 shrink-0" />
                          <span className="text-stone-400">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {section.footnote && (
                <p className="mt-4 font-body text-xs text-stone-500 leading-relaxed uppercase tracking-wide">
                  {section.footnote}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-14 rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 text-center">
          <h3 className="font-display text-lg font-medium text-white mb-2">
            Ready to start?
          </h3>
          <p className="font-body text-sm text-stone-500 mb-4">
            Visit us at the studio to sign up for a package. Cancel classes up to 12 hours in advance.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-body text-stone-500">
            {[
              "All equipment included",
              "Cancel 12h in advance",
              "No commitment required",
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
