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

export async function PUT(request: NextRequest) {
  const data = await request.json();
  const existing = localDb.settings.findOne() || {};
  const saved = localDb.settings.save({ ...existing, ...data });
  return NextResponse.json(saved);
}
