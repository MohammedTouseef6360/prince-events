import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";
import { isAuthorizedWrite } from "@/lib/session";
import { galleryItemSchema } from "@/lib/validation";

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
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const parsed = galleryItemSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid gallery item data" }, { status: 400 });
    }
    const item = await firebaseDb.gallery.create(parsed.data);
    cache = null;
    return NextResponse.json(item, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
