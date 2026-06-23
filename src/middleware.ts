import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/notes", "/reminders", "/notifications"];

// Deliberately does NOT import from "@/lib/auth" — that file pulls in
// Prisma, pg, and bcrypt, none of which are supported in the Edge runtime
// that middleware runs on by default. getToken() only reads/verifies the
// JWT cookie, so it stays Edge-safe.
export default async function middleware(req: NextRequest) {
  const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/reminders/:path*", "/notifications/:path*"],
};
