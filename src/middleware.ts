import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Middleware – protects /api/admin/* routes
// Only users with `role: "admin"` in their Supabase `app_metadata` may access
// these endpoints. All other requests pass through unchanged.
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Extract the Bearer token from the Authorization header.
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export async function middleware(request: NextRequest) {
  // Only guard routes under /api/admin/*
  if (!request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // 1. Extract JWT from Authorization header
  const token = extractBearerToken(request);

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized – missing or invalid Authorization header" },
      { status: 401 }
    );
  }

  // 2. Verify the token with Supabase and retrieve the user
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized – invalid or expired token" },
      { status: 401 }
    );
  }

  // 3. Check for admin role in app_metadata
  const role = user.app_metadata?.role;

  if (role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden – admin access required" },
      { status: 403 }
    );
  }

  // 4. Attach user info to request headers so Route Handlers can use it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email ?? "");
  requestHeaders.set("x-user-role", role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// ---------------------------------------------------------------------------
// Matcher – only run this middleware on /api/admin routes
// ---------------------------------------------------------------------------
export const config = {
  matcher: "/api/admin/:path*",
};
