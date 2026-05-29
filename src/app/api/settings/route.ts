import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Settings } from "@/lib/models";
import { localDb } from "@/lib/local-db";

const defaultSettings = {
  businessName: "PRINCE EVENT'S",
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
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create(defaultSettings);
    return NextResponse.json(settings);
  } catch {
    let settings = localDb.settings.findOne();
    if (!settings) {
      settings = defaultSettings;
      localDb.settings.save(defaultSettings);
    }
    return NextResponse.json(settings);
  }
}

export async function PUT(request: NextRequest) {
  const data = await request.json();
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    if (settings) {
      Object.assign(settings, data);
      await settings.save();
    } else {
      settings = await Settings.create({ ...defaultSettings, ...data });
    }
    return NextResponse.json(settings);
  } catch {
    const saved = localDb.settings.save({ ...defaultSettings, ...data });
    return NextResponse.json(saved);
  }
}
