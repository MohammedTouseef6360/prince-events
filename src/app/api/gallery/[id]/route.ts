import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Gallery } from "@/lib/models";
import { localDb } from "@/lib/local-db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const item = await Gallery.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  } catch {
    const item = localDb.gallery.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted" });
  }
}
