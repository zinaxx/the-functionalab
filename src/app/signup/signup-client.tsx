"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function SignupClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Minimum 8 characters." });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
        },
      });

      if (error) {
        toast({ variant: "destructive", title: "Sign up failed", description: error.message });
      } else {
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-16 px-6">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fd5227]/10 mb-6">
            <img
              src="/Logo without background.png"
              alt="The FunctionaLab"
              className="h-10 w-10 object-contain"
            />
          </div>
          <h1 className="font-display text-3xl font-light text-white mb-2">Check your inbox</h1>
          <p className="font-body text-stone-400 text-sm leading-relaxed mb-6">
            We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full border-[#2A2A2A] text-stone-300 hover:text-white hover:bg-white/5">Back to sign in</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center pt-16 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img
              src="/Logo without background.png"
              alt="The FunctionaLab"
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-2xl font-bold text-white">
              The <span className="text-[#fd5227]">FunctionaLab</span>
            </span>
          </div>
          <h1 className="font-display text-3xl font-light text-white mb-1">Create account</h1>
          <p className="font-body text-sm text-stone-400">Start training today</p>
        </div>

        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-8 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-stone-300">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-stone-600"
              />
            </div>
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
              <Label htmlFor="password" className="text-stone-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-stone-600"
              />
            </div>
            <Button className="w-full bg-[#fd5227] hover:bg-[#e04420] text-white" type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500 font-body">
          Already have an account?{" "}
          <Link href={`/login?redirect=${redirect}`} className="text-[#fd5227] font-medium hover:text-[#fd5227]/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
