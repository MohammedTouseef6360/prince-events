import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";

const DEFAULT_SETTINGS = {
  businessName: "PRINCE EVENTS",
  tagline: "We Serve You Smile",
  phone: "+91 8618648069",
  instagram: "prince_events_001",
  aboutUs: "",
  aboutUsKN: "",
  aboutUsHI: "",
  address: "Bengaluru, Karnataka",
  freeRadius: 10,
  travelChargePerKm: 10,
  adminPassword: "prince@123",
  currency: "₹",
};

export async function GET() {
  let settings = await firebaseDb.settings.findOne();
  if (!settings) {
    settings = DEFAULT_SETTINGS;
    await firebaseDb.settings.save(DEFAULT_SETTINGS);
  }
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const saved = await firebaseDb.settings.save(data);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
