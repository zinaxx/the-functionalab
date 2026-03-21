"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Leaf, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/schedule", label: "Schedule" },
  { href: "/instructors", label: "Instructors" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsAdmin(data.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = user?.user_metadata?.name
    ? user.user_metadata.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() ?? "U";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Leaf className="h-5 w-5 text-sage-500 transition-transform group-hover:rotate-12" />
          <span className="font-display text-xl font-semibold text-stone-800 tracking-tight">
            Zen Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-body font-medium rounded-xl transition-colors",
                pathname === link.href
                  ? "text-sage-700 bg-sage-50"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-2xl px-3 py-1.5 hover:bg-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-400 focus:ring-offset-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium font-body text-stone-700 max-w-[120px] truncate">
                    {user.user_metadata?.name ?? user.email}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/schedule">
                <Button size="sm">Book a class</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex items-center gap-2 mb-8">
              <Leaf className="h-5 w-5 text-sage-500" />
              <span className="font-display text-xl font-semibold text-stone-800">Zen Studio</span>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "px-4 py-3 text-base font-body font-medium rounded-xl transition-colors",
                      pathname === link.href
                        ? "text-sage-700 bg-sage-50"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                    )}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-stone-100 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {user.user_metadata?.name ?? "My Account"}
                      </p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Link href="/dashboard">
                      <Button variant="secondary" className="w-full justify-start gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  </SheetClose>
                  {isAdmin && (
                    <SheetClose asChild>
                      <Link href="/admin">
                        <Button variant="secondary" className="w-full justify-start gap-2">
                          <Settings className="h-4 w-4" />
                          Admin
                        </Button>
                      </Link>
                    </SheetClose>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <SheetClose asChild>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">Sign in</Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link href="/schedule">
                      <Button className="w-full">Book a class</Button>
                    </Link>
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
