import { NextRequest, NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = localDb.testimonials.findByIdAndDelete(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
