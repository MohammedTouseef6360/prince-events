"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { HiSave, HiCog, HiBadgeCheck, HiArrowLeft } from "react-icons/hi";

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState({
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
    heroTitle: "PRINCE EVENTS",
    heroSubtitle: "We Serve You Smile",
    heroDesc: "",
    heroDescKN: "",
    heroDescHI: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("prince-events-admin");
      if (!isAdmin) router.push("/admin/login");
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (data) setForm(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setForm((f) => ({ ...f, ...data }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white px-6 py-5 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/dashboard")} className="text-royal-gold hover:text-royal-gold-light p-1.5 rounded-lg hover:bg-white/10 transition">
            <HiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-royal-gold tracking-wide flex items-center gap-3">
              <HiCog size={24} />
              {t("admin.settings")}
            </h1>
            <p className="text-royal-gold/60 text-xs mt-0.5">Business configuration</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>Error: {error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
          </div>
        )}
        <div className="royal-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-royal-gold/10">
            <div className="w-10 h-10 rounded-full bg-royal-gold/10 flex items-center justify-center">
              <HiCog className="text-royal-gold" size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold">
                Business Settings
              </h2>
              <p className="text-xs text-gray-500">Configure your business information</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business Name</label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                  className="royal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  className="royal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="royal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instagram Handle</label>
                <input
                  type="text"
                  value={form.instagram}
                  onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                  className="royal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="royal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Admin Password</label>
                <input
                  type="text"
                  value={form.adminPassword}
                  onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
                  className="royal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Free Delivery Radius (km)</label>
                <input
                  type="number"
                  value={form.freeRadius}
                  onChange={(e) => setForm((f) => ({ ...f, freeRadius: Number(e.target.value) }))}
                  className="royal-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Travel Charge (₹/km beyond radius)</label>
                <input
                  type="number"
                  value={form.travelChargePerKm}
                  onChange={(e) => setForm((f) => ({ ...f, travelChargePerKm: Number(e.target.value) }))}
                  className="royal-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hero Title</label>
              <input
                type="text"
                value={form.heroTitle}
                onChange={(e) => setForm((f) => ({ ...f, heroTitle: e.target.value }))}
                className="royal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hero Subtitle</label>
              <input
                type="text"
                value={form.heroSubtitle}
                onChange={(e) => setForm((f) => ({ ...f, heroSubtitle: e.target.value }))}
                className="royal-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hero Description (English)</label>
              <textarea
                value={form.heroDesc}
                onChange={(e) => setForm((f) => ({ ...f, heroDesc: e.target.value }))}
                className="royal-input h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hero Description (Kannada)</label>
              <textarea
                value={form.heroDescKN}
                onChange={(e) => setForm((f) => ({ ...f, heroDescKN: e.target.value }))}
                className="royal-input h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hero Description (Hindi)</label>
              <textarea
                value={form.heroDescHI}
                onChange={(e) => setForm((f) => ({ ...f, heroDescHI: e.target.value }))}
                className="royal-input h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">About Us (English)</label>
              <textarea
                value={form.aboutUs}
                onChange={(e) => setForm((f) => ({ ...f, aboutUs: e.target.value }))}
                className="royal-input h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">About Us (Kannada)</label>
              <textarea
                value={form.aboutUsKN}
                onChange={(e) => setForm((f) => ({ ...f, aboutUsKN: e.target.value }))}
                className="royal-input h-24 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">About Us (Hindi)</label>
              <textarea
                value={form.aboutUsHI}
                onChange={(e) => setForm((f) => ({ ...f, aboutUsHI: e.target.value }))}
                className="royal-input h-24 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`mt-6 font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed ${
              saved
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white hover:from-royal-maroon-light hover:to-royal-maroon hover:shadow-lg"
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <HiBadgeCheck size={20} />
            ) : (
              <HiSave size={20} />
            )}
            {saving ? "Saving..." : saved ? "Saved Successfully!" : t("admin.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
