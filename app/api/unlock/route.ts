import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = process.env.SITE_GATE_COOKIE || "site_gate";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get("password") || "");
  const next = req.nextUrl.searchParams.get("next") || "/";

  if (!process.env.SITE_PASSWORD) {
    return new NextResponse("SITE_PASSWORD is not set", { status: 500 });
  }

  if (password !== process.env.SITE_PASSWORD) {
    return NextResponse.redirect(new URL(`/password?next=${encodeURIComponent(next)}&error=1`, req.url));
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
