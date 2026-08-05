import { NextRequest, NextResponse } from "next/server";
import { signSession, verifyAdminPassword, setSessionCookie } from "@/lib/auth";
import { isRateLimited, resetRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const { password } = await request.json();
    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    resetRateLimit(ip);
    const token = await signSession();
    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
