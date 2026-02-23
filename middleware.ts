import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = process.env.SITE_GATE_COOKIE || "site_gate";

export function middleware(req: NextRequest) {
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

  const hasGate = req.cookies.get(COOKIE_NAME)?.value === "1";
  if (hasGate) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/password";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!.*\\.).*)"], // all paths except static files with extensions
};
