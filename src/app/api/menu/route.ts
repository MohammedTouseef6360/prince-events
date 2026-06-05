import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

const CACHE_TTL = 3000;

function getCache() {
  return (globalThis as any).__menuCache as { data: any; ts: number } | null;
}
function setCache(data: any) {
  (globalThis as any).__menuCache = { data, ts: Date.now() };
}
export function bustMenuCache() {
  (globalThis as any).__menuCache = null;
}

export async function GET(request: NextRequest) {
  try {
    const cached = getCache();
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      let items = cached.data;
      const featured = new URL(request.url).searchParams.get("featured");
      if (featured === "true") items = items.filter((i: any) => i.featured);
      return NextResponse.json(items);
    }
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    let items = await firebaseDb.menu.find();
    setCache(items);
    if (featured === "true") items = items.filter((i: any) => i.featured);
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await firebaseDb.menu.create(data);
    bustMenuCache();
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
