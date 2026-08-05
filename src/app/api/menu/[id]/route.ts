import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";
import { isAuthorizedWrite } from "@/lib/session";
import { menuItemSchema } from "@/lib/validation";

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
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const parsed = menuItemSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid menu item data" }, { status: 400 });
    }
    const item = await firebaseDb.menu.findByIdAndUpdate(params.id, parsed.data);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    (globalThis as any).__menuCache = null;
    return NextResponse.json(item);
  } catch { return NextResponse.json({ error: "Update failed" }, { status: 500 }); }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const item = await firebaseDb.menu.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    (globalThis as any).__menuCache = null;
    return NextResponse.json({ message: "Deleted" });
  } catch { return NextResponse.json({ error: "Delete failed" }, { status: 500 }); }
}
