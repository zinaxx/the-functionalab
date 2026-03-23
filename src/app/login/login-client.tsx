"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ variant: "destructive", title: "Sign in failed", description: error.message });
      } else {
        window.location.href = redirect;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-6 relative overflow-hidden bg-[#0A0A0A]">
      {/* Decorative */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fd5227 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-8 pointer-events-none" style={{ background: "radial-gradient(circle, #fd5227 0%, transparent 70%)" }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <img
              src="/Logo without background.png"
              alt="The FunctionaLab"
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-2xl font-bold text-white">
              The <span className="text-[#fd5227]">FunctionaLab</span>
            </span>
          </div>
          <h1 className="font-display text-3xl font-light text-white mb-1">Welcome back</h1>
          <p className="font-body text-sm text-stone-400">Sign in to your account</p>
        </div>

        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-8 shadow-lg shadow-black/20">
          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-stone-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-stone-600"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-stone-300">Password</Label>
                <Link href="/forgot-password" className="text-xs text-[#fd5227] hover:text-[#fd5227]/80 font-body">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-stone-600"
              />
            </div>
            <Button className="w-full bg-[#fd5227] hover:bg-[#e04420] text-white" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500 font-body">
          Don&apos;t have an account?{" "}
          <Link href={`/signup?redirect=${redirect}`} className="text-[#fd5227] font-medium hover:text-[#fd5227]/80">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
