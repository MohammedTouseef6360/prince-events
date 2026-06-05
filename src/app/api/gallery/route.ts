import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 3000;

export async function GET() {
  try {
    const now = Date.now();
    if (cache && now - cache.ts < CACHE_TTL) return NextResponse.json(cache.data);
    const items = await firebaseDb.gallery.find();
    cache = { data: items, ts: Date.now() };
    return NextResponse.json(items);
  } catch { return NextResponse.json([], { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await firebaseDb.gallery.create(data);
    cache = null;
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
