import { NextRequest, NextResponse } from "next/server";
import { localDb } from "@/lib/local-db";

const defaultSettings = {
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
  let settings = localDb.settings.findOne();
  if (!settings) {
    settings = defaultSettings;
    localDb.settings.save(defaultSettings);
  }
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const existing = localDb.settings.findOne() || {};
    const merged = { ...existing, ...data };
    const saved = localDb.settings.save(merged);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
