import { NextRequest, NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const order = localDb.orders.findByIdAndUpdate(params.id, data);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = localDb.orders.findByIdAndDelete(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
