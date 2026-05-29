import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const item = await firebaseDb.testimonials.findByIdAndDelete(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
