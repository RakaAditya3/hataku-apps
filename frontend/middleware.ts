import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes — accessible without auth
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/menu") ||
    pathname.startsWith("/login") ||
    pathname === "/splash" ||
    pathname === "/offline" ||
    pathname === "/complete-profile" ||
    pathname.startsWith("/admin") ||       // admin has its own Sanctum auth
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/workbox-") ||
    pathname.startsWith("/icons/");

  if (isPublic) return NextResponse.next();

  // Everything below requires NextAuth session
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in but no phone → redirect to complete-profile
  // (complete-profile is public so no infinite redirect)
  if (!token.phone) {
    return NextResponse.redirect(new URL("/complete-profile", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
