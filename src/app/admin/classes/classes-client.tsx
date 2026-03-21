"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Pencil, X, Copy, AlertTriangle, Loader2 } from "lucide-react";
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

interface Props {
  classes: ClassWithDetails[];
  instructors: Instructor[];
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
  style: ClassStyle.HATHA,
  level: ClassLevel.ALL_LEVELS,
  instructorId: "",
  startsAt: "",
  durationMins: 60,
  capacity: 20,
  room: "",
  creditCost: 1,
};

export function AdminClassesClient({ classes, instructors }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClassFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

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

      <div className="rounded-2xl bg-white border border-stone-200 overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Class</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">When</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden lg:table-cell">Bookings</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3">
                  <div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium mr-2 ${CLASS_STYLE_COLORS[cls.style]}`}>
                      {CLASS_STYLE_LABELS[cls.style]}
                    </span>
                    <span className="font-medium text-stone-800">{cls.title}</span>
                    <p className="text-xs text-stone-400 mt-0.5">{cls.instructor.name}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-stone-600 hidden md:table-cell">
                  {format(new Date(cls.startsAt), "EEE, MMM d · HH:mm")}
                </td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <span className={`${cls._count.bookings >= cls.capacity ? "text-red-600" : "text-stone-600"}`}>
                    {cls._count.bookings}/{cls.capacity}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant="outline"
                    className={
                      cls.status === "SCHEDULED"
                        ? "text-sage-700 border-sage-200 bg-sage-50"
                        : cls.status === "CANCELLED"
                        ? "text-red-700 border-red-200 bg-red-50"
                        : "text-stone-500 border-stone-200"
                    }
                  >
                    {cls.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cls)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDuplicate(cls)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {cls.status === "SCHEDULED" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
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
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Morning Hatha Flow" />
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
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Duration (mins)</Label>
                <Input
                  type="number"
                  value={form.durationMins}
                  onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
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
              <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Salle Lotus" />
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
    </>
  );
}
