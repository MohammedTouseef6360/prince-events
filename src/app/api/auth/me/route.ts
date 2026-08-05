import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authed = await getSession(request);
  if (!authed) return NextResponse.json({ authed: false }, { status: 401 });
  return NextResponse.json({ authed: true });
}
