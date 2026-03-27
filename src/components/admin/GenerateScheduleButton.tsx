"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

export default function GenerateScheduleButton() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/cron/generate-schedule", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      if (data.created === 0) {
        setMessage("Schedule already up to date.");
      } else {
        setMessage(`${data.created} classes generated for week of ${data.week}.`);
      }
      setState("success");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleGenerate}
        disabled={state === "loading"}
        className="flex items-center gap-2 rounded-xl bg-[#fd5227] px-4 py-2.5 text-sm font-body font-medium text-white transition hover:bg-[#e04820] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CalendarPlus className="h-4 w-4" />
        {state === "loading" ? "Generating…" : "Generate Next Week"}
      </button>
      {message && (
        <p className={`text-xs font-body ${state === "error" ? "text-red-400" : "text-stone-400"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
