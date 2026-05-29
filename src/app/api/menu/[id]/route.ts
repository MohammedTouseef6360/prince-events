import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { MenuItem } from "@/lib/models";
import { localDb } from "@/lib/local-db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const item = await MenuItem.findById(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    const item = localDb.menu.findById(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  try {
    await dbConnect();
    const item = await MenuItem.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    const item = localDb.menu.findByIdAndUpdate(params.id, data);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const item = await MenuItem.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    const item = localDb.menu.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  }
}
