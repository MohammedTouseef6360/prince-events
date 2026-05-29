import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Gallery } from "@/lib/models";
import { localDb } from "@/lib/local-db";

export async function GET() {
  try {
    await dbConnect();
    const images = await Gallery.find().sort({ createdAt: -1 });
    return NextResponse.json(images);
  } catch {
    return NextResponse.json(localDb.gallery.find());
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  try {
    await dbConnect();
    const image = await Gallery.create(data);
    return NextResponse.json(image, { status: 201 });
  } catch {
    const image = localDb.gallery.create(data);
    return NextResponse.json(image, { status: 201 });
  }
}
