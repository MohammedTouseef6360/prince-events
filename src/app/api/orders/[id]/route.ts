import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";
import { isAuthorizedWrite } from "@/lib/session";
import { orderUpdateSchema } from "@/lib/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();
  const parsed = orderUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
  const order = await firebaseDb.orders.findByIdAndUpdate(params.id, parsed.data);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const order = await firebaseDb.orders.findByIdAndDelete(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
