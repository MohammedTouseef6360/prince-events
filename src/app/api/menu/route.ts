import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");
  let items = await firebaseDb.menu.find();
  if (featured === "true") items = items.filter((i: any) => i.featured);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const item = await firebaseDb.menu.create(data);
  return NextResponse.json(item, { status: 201 });
}
