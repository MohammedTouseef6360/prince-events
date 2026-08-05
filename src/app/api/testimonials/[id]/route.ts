import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";
import { isAuthorizedWrite } from "@/lib/session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const item = await firebaseDb.testimonials.findByIdAndDelete(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
