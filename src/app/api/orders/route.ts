import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Order } from "@/lib/models";
import { localDb } from "@/lib/local-db";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  try {
    await dbConnect();
    let orders: any[];
    if (phone) {
      orders = await Order.find({ phone }).sort({ createdAt: -1 });
    } else {
      orders = await Order.find().sort({ createdAt: -1 });
    }
    return NextResponse.json(orders);
  } catch {
    let orders: any[];
    if (phone) {
      orders = localDb.orders.find().filter((o: any) => o.phone === phone);
    } else {
      orders = localDb.orders.find();
    }
    return NextResponse.json(orders);
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  try {
    await dbConnect();
    const order = await Order.create(data);
    return NextResponse.json(order, { status: 201 });
  } catch {
    const order = localDb.orders.create(data);
    return NextResponse.json(order, { status: 201 });
  }
}
