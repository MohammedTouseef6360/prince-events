import { NextRequest, NextResponse } from "next/server";
import { firebaseDb } from "@/lib/firebase-db";
import { isAuthorizedWrite } from "@/lib/session";
import { settingsSchema } from "@/lib/validation";

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
  currency: "₹",
  gstin: "",
  fssai: "",
  registeredAddress: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  upiId: "",
};

export async function GET() {
  let settings = await firebaseDb.settings.findOne();
  if (!settings) {
    settings = DEFAULT_SETTINGS;
    await firebaseDb.settings.save(DEFAULT_SETTINGS);
  }
  const { adminPassword, ...publicSettings } = settings;
  return NextResponse.json(publicSettings, { headers: { 'Cache-Control': 'public, max-age=60' } });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorizedWrite(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const { adminPassword, ...raw } = data;
    const parsed = settingsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 });
    }
    const saved = await firebaseDb.settings.save(parsed.data);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
