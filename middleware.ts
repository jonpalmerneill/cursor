import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const cookieName = process.env.SITE_GATE_COOKIE || "site_gate";
  const { pathname } = req.nextUrl;

  // Allow these through
  if (
    pathname.startsWith("/password") ||
    pathname.startsWith("/api/unlock") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml")
  ) {
    return NextResponse.next();
  }

  const hasGate = req.cookies.get(cookieName)?.value === "1";
  if (hasGate) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/password";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Standard Next.js pattern: run on all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
