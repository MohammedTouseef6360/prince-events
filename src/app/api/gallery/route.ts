import { NextRequest, NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

export async function GET() {
  return NextResponse.json(localDb.gallery.find());
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const image = localDb.gallery.create(data);
  return NextResponse.json(image, { status: 201 });
}
