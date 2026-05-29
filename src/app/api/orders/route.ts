import { NextRequest, NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  const orders = phone
    ? localDb.orders.find().filter((o: any) => o.phone === phone)
    : localDb.orders.find();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const order = localDb.orders.create(data);
  return NextResponse.json(order, { status: 201 });
}
