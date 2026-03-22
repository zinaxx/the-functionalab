"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, Plus, Minus, Loader2 } from "lucide-react";
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
import type { AdminMemberView } from "@/types";

interface Props {
  members: AdminMemberView[];
}

export function AdminMembersClient({ members }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<AdminMemberView | null>(null);
  const [creditAdjust, setCreditAdjust] = useState(0);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const filtered = members.filter(
    (m) =>
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustCredits = async () => {
    if (!selectedMember || creditAdjust === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/members/${selectedMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creditAdjustment: creditAdjust }),
      });
      if (res.ok) {
        toast({ title: "Credits adjusted", description: `${creditAdjust > 0 ? "+" : ""}${creditAdjust} credits for ${selectedMember.name ?? selectedMember.email}` });
        setSelectedMember(null);
        setCreditAdjust(0);
        router.refresh();
      } else {
        const d = await res.json();
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setSaving(false);
    }
  };

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
                <td className="px-5 py-3 text-stone-300 hidden md:table-cell font-medium">
                  {member.creditBalance}
                </td>
                <td className="px-5 py-3 hidden md:table-cell">
                  {member.membership?.status === "ACTIVE" ? (
                    <Badge variant="outline" className="text-[#fd5227] border-[#fd5227]/30 bg-[#fd5227]/10">Unlimited</Badge>
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
                    onClick={() => { setSelectedMember(member); setCreditAdjust(0); }}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedMember.avatarUrl ?? undefined} />
                  <AvatarFallback>{(selectedMember.name ?? selectedMember.email)[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-body font-medium text-white">{selectedMember.name ?? "—"}</p>
                  <p className="font-body text-sm text-stone-500">{selectedMember.email}</p>
                </div>
              </div>

              <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-4">
                <p className="font-body text-xs text-stone-500 uppercase tracking-wide mb-1">Current balance</p>
                <p className="font-display text-2xl font-light text-white">{selectedMember.creditBalance} credits</p>
              </div>

              <div className="space-y-2">
                <Label>Adjust credits</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCreditAdjust((c) => c - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center font-display text-2xl font-light text-white">
                    {creditAdjust > 0 ? `+${creditAdjust}` : creditAdjust}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCreditAdjust((c) => c + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-body text-xs text-stone-400 text-center">
                  New balance: {selectedMember.creditBalance + creditAdjust} credits
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMember(null)}>Cancel</Button>
            <Button onClick={handleAdjustCredits} disabled={saving || creditAdjust === 0}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
