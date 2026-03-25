"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, Plus, Minus, Loader2, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PRICING_PLANS } from "@/lib/utils";
import type { AdminMemberView } from "@/types";
import type { CreditType } from "@/lib/utils";

interface Props {
  members: AdminMemberView[];
}

const CREDIT_TYPES: { value: CreditType; label: string }[] = [
  { value: "regular", label: "Regular" },
  { value: "sculpt", label: "Sculpt" },
  { value: "boxing", label: "Boxing" },
  { value: "kids", label: "Kids" },
];

const CREDIT_FIELDS: Record<CreditType, "regularCredits" | "sculptCredits" | "boxingCredits" | "kidsCredits"> = {
  regular: "regularCredits",
  sculpt: "sculptCredits",
  boxing: "boxingCredits",
  kids: "kidsCredits",
};

// Group packages for display
const PACKAGE_SECTIONS = [
  {
    label: "Monthly Membership",
    plans: PRICING_PLANS.filter((p) => p.type === "subscription"),
  },
  {
    label: "Classes",
    plans: PRICING_PLANS.filter((p) => p.type === "one-time" && p.creditType === "regular"),
  },
  {
    label: "Kids",
    plans: PRICING_PLANS.filter((p) => p.creditType === "kids"),
  },
  {
    label: "Boxing",
    plans: PRICING_PLANS.filter((p) => p.creditType === "boxing"),
  },
  {
    label: "Sculpt",
    plans: PRICING_PLANS.filter((p) => p.creditType === "sculpt"),
  },
];

type Tab = "package" | "credits";

export function AdminMembersClient({ members }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<AdminMemberView | null>(null);
  const [tab, setTab] = useState<Tab>("package");

  // Package tab
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Credits tab
  const [creditType, setCreditType] = useState<CreditType>("regular");
  const [amount, setAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const filtered = members.filter(
    (m) =>
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssignPackage = async () => {
    if (!selectedMember || !selectedPlanId) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/members/${selectedMember.id}/assign-package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlanId }),
      });
      const d = await res.json();
      if (res.ok) {
        const plan = PRICING_PLANS.find((p) => p.id === selectedPlanId);
        toast({ title: "Package assigned", description: `${plan?.name} assigned to ${selectedMember.name ?? selectedMember.email}` });
        setSelectedMember(null);
        setSelectedPlanId(null);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!selectedMember || amount === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditType, amount }),
      });
      if (res.ok) {
        toast({
          title: "Credits adjusted",
          description: `${amount > 0 ? "+" : ""}${amount} ${creditType} credits for ${selectedMember.name ?? selectedMember.email}`,
        });
        setSelectedMember(null);
        setAmount(0);
        router.refresh();
      } else {
        const d = await res.json();
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setSaving(false);
    }
  };

  const currentBalance = selectedMember ? selectedMember[CREDIT_FIELDS[creditType]] : 0;

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Member</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Credits</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Membership</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden lg:table-cell">Bookings</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {filtered.map((member) => (
              <tr key={member.id} className="hover:bg-[#1A1A1A] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-xs bg-[#fd5227]/20 text-[#fd5227]">
                        {(member.name ?? member.email)[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{member.name ?? "—"}</p>
                      <p className="text-xs text-stone-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <div className="text-xs font-body space-y-0.5">
                    {member.regularCredits > 0 && <div className="text-stone-300">{member.regularCredits} regular</div>}
                    {member.sculptCredits > 0 && <div className="text-stone-300">{member.sculptCredits} sculpt</div>}
                    {member.boxingCredits > 0 && <div className="text-stone-300">{member.boxingCredits} boxing</div>}
                    {member.kidsCredits > 0 && <div className="text-stone-300">{member.kidsCredits} kids</div>}
                    {!member.regularCredits && !member.sculptCredits && !member.boxingCredits && !member.kidsCredits && (
                      <span className="text-stone-500">—</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  {member.membership?.status === "ACTIVE" ? (
                    <Badge variant="outline" className="text-[#fd5227] border-[#fd5227]/30 bg-[#fd5227]/10">
                      {member.membership.type === "SCULPT_PACKAGE" ? "Sculpt Pkg" : "Unlimited"}
                    </Badge>
                  ) : (
                    <span className="text-stone-500">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-stone-300 hidden lg:table-cell">{member._count.bookings}</td>
                <td className="px-5 py-3 text-stone-500 hidden lg:table-cell">
                  {format(new Date(member.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-5 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setTab("package");
                      setSelectedPlanId(null);
                      setAmount(0);
                      setCreditType("regular");
                    }}
                  >
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-body text-stone-500">No members found</p>
          </div>
        )}
      </div>

      {/* Member modal */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-1">
              {/* Member info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMember.avatarUrl ?? undefined} />
                  <AvatarFallback>{(selectedMember.name ?? selectedMember.email)[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-body font-medium text-white">{selectedMember.name ?? "—"}</p>
                  <p className="font-body text-sm text-stone-500">{selectedMember.email}</p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex rounded-xl border border-[#2A2A2A] p-1 gap-1">
                <button
                  onClick={() => setTab("package")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-body font-medium transition-colors ${
                    tab === "package" ? "bg-[#fd5227] text-white" : "text-stone-400 hover:text-white"
                  }`}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Assign package
                </button>
                <button
                  onClick={() => setTab("credits")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-body font-medium transition-colors ${
                    tab === "credits" ? "bg-[#fd5227] text-white" : "text-stone-400 hover:text-white"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adjust credits
                </button>
              </div>

              {/* ── Package assignment tab ── */}
              {tab === "package" && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {PACKAGE_SECTIONS.filter((s) => s.plans.length > 0).map((section) => (
                    <div key={section.label}>
                      <p className="text-xs font-body font-semibold text-stone-500 uppercase tracking-wide mb-1.5">{section.label}</p>
                      <div className="space-y-1">
                        {section.plans.map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-body transition-colors ${
                              selectedPlanId === plan.id
                                ? "border-[#fd5227] bg-[#fd5227]/10 text-white"
                                : "border-[#2A2A2A] text-stone-300 hover:border-[#3A3A3A] hover:text-white"
                            }`}
                          >
                            <span>{plan.name}</span>
                            <span className="text-stone-500 text-xs">
                              {plan.credits ? `${plan.credits} credits` : "Unlimited"}
                              {plan.price > 0 ? ` · $${plan.price}` : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Credit adjustment tab ── */}
              {tab === "credits" && (
                <div className="space-y-4">
                  {/* Current balances */}
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-3 grid grid-cols-2 gap-2">
                    {CREDIT_TYPES.map(({ value, label }) => (
                      <div key={value}>
                        <p className="font-body text-xs text-stone-500">{label}</p>
                        <p className="font-display text-xl font-light text-white">{selectedMember[CREDIT_FIELDS[value]]}</p>
                      </div>
                    ))}
                  </div>

                  {/* Credit type selector */}
                  <div className="space-y-2">
                    <Label>Credit type</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {CREDIT_TYPES.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => { setCreditType(value); setAmount(0); }}
                          className={`rounded-lg border px-2 py-2 text-xs font-body transition-colors ${
                            creditType === value
                              ? "border-[#fd5227] bg-[#fd5227]/10 text-[#fd5227]"
                              : "border-[#2A2A2A] text-stone-400 hover:border-[#3A3A3A]"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount adjuster */}
                  <div className="space-y-2">
                    <Label>Adjust {creditType} credits</Label>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" onClick={() => setAmount((c) => c - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center font-display text-2xl font-light text-white">
                        {amount > 0 ? `+${amount}` : amount}
                      </div>
                      <Button variant="outline" size="icon" onClick={() => setAmount((c) => c + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-body text-xs text-stone-400 text-center">
                      New balance: {currentBalance + amount} {creditType} credits
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMember(null)}>Cancel</Button>
            {tab === "package" ? (
              <Button onClick={handleAssignPackage} disabled={assigning || !selectedPlanId}>
                {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign package"}
              </Button>
            ) : (
              <Button onClick={handleAdjustCredits} disabled={saving || amount === 0}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply adjustment"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
