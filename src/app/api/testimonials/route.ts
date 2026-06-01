import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

export async function GET() {
  const items = await firebaseDb.testimonials.find();
  return NextResponse.json(items, { headers: { 'Cache-Control': 'public, max-age=60' } });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const item = await firebaseDb.testimonials.create(data);
  return NextResponse.json(item, { status: 201 });
}
