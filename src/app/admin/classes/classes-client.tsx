"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Pencil, X, Copy, Loader2, UserPlus, Search, Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CLASS_STYLE_LABELS, CLASS_STYLE_COLORS, LEVEL_LABELS } from "@/lib/utils";
import { ClassStyle, ClassLevel } from "@prisma/client";
import type { Instructor } from "@prisma/client";

interface ClassWithDetails {
  id: string;
  title: string;
  style: ClassStyle;
  level: ClassLevel;
  status: string;
  startsAt: Date;
  endsAt: Date;
  durationMins: number;
  capacity: number;
  room: string | null;
  creditCost: number;
  description: string | null;
  instructorId: string;
  instructor: Instructor;
  _count: { bookings: number };
}

interface Member {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  classes: ClassWithDetails[];
  instructors: Instructor[];
  members: Member[];
}

interface ClassFormData {
  title: string;
  description: string;
  style: ClassStyle;
  level: ClassLevel;
  instructorId: string;
  startsAt: string;
  durationMins: number;
  capacity: number;
  room: string;
  creditCost: number;
}

const defaultForm: ClassFormData = {
  title: "",
  description: "",
  style: ClassStyle.HIIT,
  level: ClassLevel.ALL_LEVELS,
  instructorId: "",
  startsAt: "",
  durationMins: 60,
  capacity: 20,
  room: "",
  creditCost: 1,
};

export function AdminClassesClient({ classes, instructors, members }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Register walk-in state
  const [registerClass, setRegisterClass] = useState<ClassWithDetails | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  // Roster state
  type BookingEntry = { id: string; user: { id: string; name: string | null; email: string }; createdAt: string };
  type WaitlistEntry = { id: string; position: number; user: { id: string; name: string | null; email: string } };
  const [rosterClass, setRosterClass] = useState<ClassWithDetails | null>(null);
  const [rosterTab, setRosterTab] = useState<"roster" | "waitlist">("roster");
  const [roster, setRoster] = useState<BookingEntry[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const openRoster = async (cls: ClassWithDetails) => {
    setRosterClass(cls);
    setRosterTab("roster");
    setRosterLoading(true);
    try {
      const [bookingsRes, waitlistRes] = await Promise.all([
        fetch(`/api/admin/classes/${cls.id}/bookings`),
        fetch(`/api/admin/classes/${cls.id}/waitlist`),
      ]);
      const [bookingsData, waitlistData] = await Promise.all([bookingsRes.json(), waitlistRes.json()]);
      setRoster(bookingsData.data ?? []);
      setWaitlist(waitlistData.data ?? []);
    } finally {
      setRosterLoading(false);
    }
  };

  const refreshRoster = async (classId: string) => {
    const [bookingsRes, waitlistRes] = await Promise.all([
      fetch(`/api/admin/classes/${classId}/bookings`),
      fetch(`/api/admin/classes/${classId}/waitlist`),
    ]);
    const [bookingsData, waitlistData] = await Promise.all([bookingsRes.json(), waitlistRes.json()]);
    setRoster(bookingsData.data ?? []);
    setWaitlist(waitlistData.data ?? []);
  };

  const handleRemoveBooking = async (bookingId: string) => {
    if (!rosterClass) return;
    setRemovingId(bookingId);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, { method: "DELETE" });
      const d = await res.json();
      if (res.ok) {
        const desc = d.promoted
          ? "Member removed and #1 on the waitlist has been confirmed."
          : "Member has been removed from the class.";
        toast({ title: "Booking removed", description: desc });
        await refreshRoster(rosterClass.id);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveWaitlist = async (entryId: string) => {
    if (!rosterClass) return;
    setRemovingId(entryId);
    try {
      const res = await fetch(`/api/admin/classes/${rosterClass.id}/waitlist?entryId=${entryId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Removed from waitlist" });
        await refreshRoster(rosterClass.id);
      } else {
        const d = await res.json();
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setRemovingId(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });

  const handleRegister = async () => {
    if (!registerClass || !selectedMemberId) return;
    setRegistering(true);
    try {
      const res = await fetch(`/api/admin/classes/${registerClass.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedMemberId }),
      });
      const d = await res.json();
      if (res.ok) {
        if (d.action === "waitlisted") {
          toast({ title: "Added to waitlist", description: `Member is #${d.position} on the waitlist.` });
        } else {
          toast({ title: "Member registered", description: "Walk-in booking confirmed." });
        }
        setRegisterClass(null);
        setSelectedMemberId(null);
        setMemberSearch("");
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setRegistering(false);
    }
  };

  const registerClassIsFull = registerClass
    ? registerClass._count.bookings >= registerClass.capacity
    : false;

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, instructorId: instructors[0]?.id ?? "" });
    setShowModal(true);
  };

  const openEdit = (cls: ClassWithDetails) => {
    setEditingId(cls.id);
    setForm({
      title: cls.title,
      description: cls.description ?? "",
      style: cls.style,
      level: cls.level,
      instructorId: cls.instructorId,
      startsAt: format(new Date(cls.startsAt), "yyyy-MM-dd'T'HH:mm"),
      durationMins: cls.durationMins,
      capacity: cls.capacity,
      room: cls.room ?? "",
      creditCost: cls.creditCost,
    });
    setShowModal(true);
  };

  const openDuplicate = (cls: ClassWithDetails) => {
    setEditingId(null);
    setForm({
      title: `${cls.title} (copy)`,
      description: cls.description ?? "",
      style: cls.style,
      level: cls.level,
      instructorId: cls.instructorId,
      startsAt: "",
      durationMins: cls.durationMins,
      capacity: cls.capacity,
      room: cls.room ?? "",
      creditCost: cls.creditCost,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.startsAt || !form.instructorId) {
      toast({ variant: "destructive", title: "Missing required fields" });
      return;
    }

    setSaving(true);
    try {
      const startsAt = new Date(form.startsAt);
      const endsAt = new Date(startsAt.getTime() + form.durationMins * 60000);

      const body = { ...form, startsAt, endsAt };
      const url = editingId ? `/api/admin/classes/${editingId}` : "/api/admin/classes";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast({ title: editingId ? "Class updated" : "Class created" });
        setShowModal(false);
        router.refresh();
      } else {
        const d = await res.json();
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (classId: string) => {
    setCancellingId(classId);
    try {
      const res = await fetch(`/api/admin/classes/${classId}/cancel`, { method: "POST" });
      if (res.ok) {
        toast({ title: "Class cancelled", description: "All students have been notified." });
        router.refresh();
      } else {
        const d = await res.json();
        toast({ variant: "destructive", title: "Error", description: d.error });
      }
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add class
        </Button>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-[#2A2A2A] overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-[#2A2A2A] bg-[#1A1A1A]">
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Class</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">When</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden lg:table-cell">Bookings</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A]">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-[#1A1A1A] transition-colors">
                <td className="px-5 py-3">
                  <div>
                    <p className="font-medium text-white">{cls.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{cls.instructor.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-stone-300 hidden md:table-cell">
                  {format(new Date(cls.startsAt), "EEE, MMM d · HH:mm")}
                </td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <span className={`${cls._count.bookings >= cls.capacity ? "text-red-400" : "text-stone-300"}`}>
                    {cls._count.bookings}/{cls.capacity}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant="outline"
                    className={
                      cls.status === "SCHEDULED"
                        ? "text-[#fd5227] border-[#fd5227]/30 bg-[#fd5227]/10"
                        : cls.status === "CANCELLED"
                        ? "text-red-400 border-red-500/30 bg-red-500/10"
                        : "text-stone-400 border-[#2A2A2A]"
                    }
                  >
                    {cls.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-stone-400 hover:text-white"
                      title="View roster"
                      onClick={() => openRoster(cls)}
                    >
                      <Users className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white" onClick={() => openEdit(cls)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-stone-400 hover:text-white" onClick={() => openDuplicate(cls)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {cls.status === "SCHEDULED" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleCancel(cls.id)}
                        disabled={cancellingId === cls.id}
                      >
                        {cancellingId === cls.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit class" : "New class"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Morning CrossFit WOD" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Style</Label>
                <Select value={form.style} onValueChange={(v) => setForm({ ...form, style: v as ClassStyle })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ClassStyle).map((s) => (
                      <SelectItem key={s} value={s}>{CLASS_STYLE_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v as ClassLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ClassLevel).map((l) => (
                      <SelectItem key={l} value={l}>{LEVEL_LABELS[l]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Instructor</Label>
              <Select value={form.instructorId} onValueChange={(v) => setForm({ ...form, instructorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select instructor" /></SelectTrigger>
                <SelectContent>
                  {instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Start date & time</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="[color-scheme:dark]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Duration (mins)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.durationMins}
                  onChange={(e) => setForm({ ...form, durationMins: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={form.creditCost}
                  onChange={(e) => setForm({ ...form, creditCost: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Room</Label>
              <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Main Floor" />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Save changes" : "Create class"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roster modal */}
      <Dialog open={!!rosterClass} onOpenChange={(open) => { if (!open) setRosterClass(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Class roster</DialogTitle>
            {rosterClass && (
              <p className="text-sm text-stone-500 pt-1">
                {rosterClass.title} · {format(new Date(rosterClass.startsAt), "EEE d MMM · HH:mm")}
              </p>
            )}
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#1A1A1A] rounded-xl p-1">
            <button
              onClick={() => setRosterTab("roster")}
              className={`flex-1 py-1.5 text-sm font-body rounded-lg transition-colors ${rosterTab === "roster" ? "bg-[#fd5227] text-white" : "text-stone-400 hover:text-white"}`}
            >
              Registered ({roster.length}{rosterClass ? `/${rosterClass.capacity}` : ""})
            </button>
            <button
              onClick={() => setRosterTab("waitlist")}
              className={`flex-1 py-1.5 text-sm font-body rounded-lg transition-colors ${rosterTab === "waitlist" ? "bg-[#fd5227] text-white" : "text-stone-400 hover:text-white"}`}
            >
              Waitlist ({waitlist.length})
            </button>
          </div>

          <div>
            {rosterLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-stone-500" />
              </div>
            ) : rosterTab === "roster" ? (
              roster.length === 0 ? (
                <p className="text-center text-sm text-stone-500 py-10">No one registered yet</p>
              ) : (
                <div className="divide-y divide-[#2A2A2A] rounded-xl border border-[#2A2A2A] overflow-hidden">
                  {roster.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between px-4 py-3 bg-[#0F0F0F]">
                      <div>
                        <p className="text-sm font-medium text-white">{booking.user.name ?? "—"}</p>
                        <p className="text-xs text-stone-500">{booking.user.email}</p>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                        onClick={() => handleRemoveBooking(booking.id)}
                        disabled={removingId === booking.id}
                      >
                        {removingId === booking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              waitlist.length === 0 ? (
                <p className="text-center text-sm text-stone-500 py-10">Waitlist is empty</p>
              ) : (
                <div className="divide-y divide-[#2A2A2A] rounded-xl border border-[#2A2A2A] overflow-hidden">
                  {waitlist.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between px-4 py-3 bg-[#0F0F0F]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#fd5227] w-5">#{entry.position}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{entry.user.name ?? "—"}</p>
                          <p className="text-xs text-stone-500">{entry.user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost" size="icon"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                        onClick={() => handleRemoveWaitlist(entry.id)}
                        disabled={removingId === entry.id}
                      >
                        {removingId === entry.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRosterClass(null)}>Close</Button>
            {rosterClass?.status === "SCHEDULED" && (
              <Button
                className="bg-[#fd5227] hover:bg-[#e04420] text-white gap-2"
                onClick={() => { setRosterClass(null); setRegisterClass(rosterClass); setSelectedMemberId(null); setMemberSearch(""); }}
              >
                <UserPlus className="h-4 w-4" />
                Add walk-in
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Walk-in register modal */}
      <Dialog open={!!registerClass} onOpenChange={(open) => { if (!open) setRegisterClass(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register walk-in</DialogTitle>
            {registerClass && (
              <p className="text-sm text-stone-500 pt-1">
                {registerClass.title} · {format(new Date(registerClass.startsAt), "EEE d MMM · HH:mm")}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-3 py-2">
            {registerClassIsFull && (
              <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
                This class is full — the member will be added to the waitlist.
              </p>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 pointer-events-none" />
              <Input
                placeholder="Search by name or email…"
                value={memberSearch}
                onChange={(e) => { setMemberSearch(e.target.value); setSelectedMemberId(null); }}
                className="pl-9"
              />
            </div>

            <div className="h-64 overflow-y-auto rounded-xl border border-[#2A2A2A]">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-sm text-stone-500 py-8">No members found</p>
              ) : (
                <div className="divide-y divide-[#2A2A2A]">
                  {filteredMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMemberId(m.id)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-[#1A1A1A] ${
                        selectedMemberId === m.id ? "bg-[#fd5227]/10 border-l-2 border-[#fd5227]" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-white">{m.name ?? "—"}</p>
                      <p className="text-xs text-stone-500">{m.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterClass(null)}>Cancel</Button>
            <Button
              onClick={handleRegister}
              disabled={!selectedMemberId || registering}
              className="bg-[#fd5227] hover:bg-[#e04420] text-white"
            >
              {registering
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : registerClassIsFull ? "Add to waitlist" : "Confirm walk-in"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
