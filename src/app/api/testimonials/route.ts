import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Testimonial } from "@/lib/models";
import { localDb } from "@/lib/local-db";

export async function GET() {
  try {
    await dbConnect();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json(localDb.testimonials.find());
  }
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  try {
    await dbConnect();
    const testimonial = await Testimonial.create(data);
    return NextResponse.json(testimonial, { status: 201 });
  } catch {
    const testimonial = localDb.testimonials.create(data);
    return NextResponse.json(testimonial, { status: 201 });
  }
}
