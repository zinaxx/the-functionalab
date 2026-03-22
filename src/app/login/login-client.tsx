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
  const [googleLoading, setGoogleLoading] = useState(false);
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
    if (error) {
      toast({ variant: "destructive", title: "Google sign in failed", description: error.message });
      setGoogleLoading(false);
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
              src="/Logo functionallab.jpeg"
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
          {/* Google */}
          <Button
            variant="outline"
            className="w-full gap-2 mb-6 border-[#2A2A2A] bg-[#1A1A1A] text-stone-300 hover:bg-white/5 hover:text-white"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2A2A2A]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#141414] px-3 text-stone-500 font-body">or continue with email</span>
            </div>
          </div>

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
