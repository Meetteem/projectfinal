import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/notes", "/reminders", "/notifications"];

export default auth((req) => {
  const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/reminders/:path*", "/notifications/:path*"],
};
