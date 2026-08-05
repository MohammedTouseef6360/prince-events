import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";
import { isAuthorizedWrite } from "@/lib/session";
import { menuItemSchema } from "@/lib/validation";

const CACHE_TTL = 3000;

function getCache() {
  return (globalThis as any).__menuCache as { data: any; ts: number } | null;
}
function setCache(data: any) {
  (globalThis as any).__menuCache = { data, ts: Date.now() };
}
function bustCache() {
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
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const parsed = menuItemSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid menu item data" }, { status: 400 });
    }
    const item = await firebaseDb.menu.create(parsed.data);
    bustCache();
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
