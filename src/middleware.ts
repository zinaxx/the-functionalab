import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard"];

// Routes that require admin role
const ADMIN_ROUTES = ["/admin"];

// Routes only accessible when NOT authenticated
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh the Supabase session and get current user
  const { user, supabaseResponse } = await updateSession(request);

  // ── Auth routes: redirect logged-in users to dashboard ──
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ── Protected routes: redirect unauthenticated users to login ──
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // ── Admin routes: require auth + admin role ──
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Check admin role via user metadata or email
    // In Phase 3 we'll sync this with the DB role; for now check email
    const isAdmin = user.email === process.env.ADMIN_EMAIL;
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
