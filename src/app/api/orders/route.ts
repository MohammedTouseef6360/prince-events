import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 3000;

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone");
    const now = Date.now();
    if (cache && now - cache.ts < CACHE_TTL) {
      const filtered = phone ? cache.data.filter((o: any) => o.phone === phone) : cache.data;
      return NextResponse.json(filtered);
    }
    const orders = await firebaseDb.orders.find();
    cache = { data: orders, ts: Date.now() };
    const filtered = phone ? orders.filter((o: any) => o.phone === phone) : orders;
    return NextResponse.json(filtered);
  } catch { return NextResponse.json([], { status: 200 }); }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const order = await firebaseDb.orders.create(data);
    cache = null;
    return NextResponse.json(order, { status: 201 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
