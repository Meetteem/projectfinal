import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/notes", "/reminders", "/notifications"];

// Next.js 16 renamed the "middleware" file convention to "proxy". Unlike
// middleware, proxy always runs on the regular Node.js runtime (not Edge),
// so it's safe to use the full auth() helper here, including its Prisma +
// bcrypt dependencies.
export default auth((req) => {
  const isProtected = PROTECTED.some((p) => req.nextUrl.pathname.startsWith(p));
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/notes/:path*", "/reminders/:path*", "/notifications/:path*"],
};
