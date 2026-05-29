"use client";

import { useState, useEffect } from "react";

interface Settings {
  businessName: string;
  tagline: string;
  phone: string;
  instagram: string;
  address: string;
  aboutUs: string;
  aboutUsKN: string;
  aboutUsHI: string;
  freeRadius: number;
  travelChargePerKm: number;
  adminPassword: string;
}

const defaults: Settings = {
  businessName: "PRINCE EVENTS",
  tagline: "We Serve You Smile",
  phone: "+91 8618648069",
  instagram: "prince_events_001",
  address: "Bengaluru, Karnataka",
  aboutUs: "",
  aboutUsKN: "",
  aboutUsHI: "",
  freeRadius: 10,
  travelChargePerKm: 10,
  adminPassword: "prince@123",
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data) {
          setSettings({ ...defaults, ...data });
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  return { settings, loaded };
}

export function extractPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}
