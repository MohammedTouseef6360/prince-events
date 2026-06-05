import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await firebaseDb.menu.findById(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch { return NextResponse.json({ error: "Not found" }, { status: 404 }); }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const item = await firebaseDb.menu.findByIdAndUpdate(params.id, data);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    (globalThis as any).__menuCache = null;
    return NextResponse.json(item);
  } catch { return NextResponse.json({ error: "Update failed" }, { status: 500 }); }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await firebaseDb.menu.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    (globalThis as any).__menuCache = null;
    return NextResponse.json({ message: "Deleted" });
  } catch { return NextResponse.json({ error: "Delete failed" }, { status: 500 }); }
}
