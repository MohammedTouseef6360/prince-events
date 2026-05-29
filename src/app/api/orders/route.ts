import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  const orders = await firebaseDb.orders.find();
  const filtered = phone
    ? orders.filter((o: any) => o.phone === phone)
    : orders;
  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const order = await firebaseDb.orders.create(data);
  return NextResponse.json(order, { status: 201 });
}
