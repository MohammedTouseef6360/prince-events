import { NextRequest, NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

export async function GET() {
  return NextResponse.json(localDb.testimonials.find());
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const testimonial = localDb.testimonials.create(data);
  return NextResponse.json(testimonial, { status: 201 });
}
