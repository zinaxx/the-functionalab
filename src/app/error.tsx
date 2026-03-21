"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDbError =
    error.message?.includes("database") ||
    error.message?.includes("prisma") ||
    error.message?.includes("connect") ||
    error.message?.includes("ECONNREFUSED");

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center pt-16 px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 mb-6">
          <AlertCircle className="h-6 w-6 text-amber-600" />
        </div>
        {isDbError ? (
          <>
            <h1 className="font-display text-2xl font-light text-stone-800 mb-2">
              Database not connected
            </h1>
            <p className="font-body text-stone-500 text-sm leading-relaxed mb-6">
              This page needs a live database. Add your Supabase credentials to{" "}
              <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">.env.local</code>{" "}
              and run{" "}
              <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">npm run db:push && npm run db:seed</code>.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-light text-stone-800 mb-2">
              Something went wrong
            </h1>
            <p className="font-body text-stone-500 text-sm mb-6">{error.message}</p>
          </>
        )}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reset}>Try again</Button>
          <Link href="/"><Button>Go home</Button></Link>
        </div>
      </div>
    </div>
  );
}
