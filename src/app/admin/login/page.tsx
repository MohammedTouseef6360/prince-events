"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { HiLockClosed, HiShieldCheck } from "react-icons/hi";

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error === "Invalid password" ? "Invalid password" : "Login failed");
      }
    } catch {
      setError("Network error — could not reach server");
    }
    setLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-royal-maroon to-royal-burgundy p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-900 p-8 sm:p-10 w-full max-w-md rounded-2xl border border-royal-gold/20 animate-fade-in"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-royal-gold/15 flex items-center justify-center mx-auto mb-4">
            <HiShieldCheck className="text-royal-gold" size={32} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-royal-maroon dark:text-royal-gold">
            {t("admin.login")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            PRINCE EVENTS — Admin Panel
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl flex items-center justify-center gap-2">
            <HiLockClosed size={16} />
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="sr-only">
              {t("admin.password")}
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder={t("admin.password")}
              className="royal-input text-lg text-center tracking-widest"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white font-bold py-3.5 px-6 rounded-xl hover:from-royal-maroon-light hover:to-royal-maroon transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loggingIn ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiLockClosed size={18} />
            )}
            {loggingIn ? "Logging in..." : t("admin.login_btn")}
          </button>
        </div>
      </form>
    </div>
  );
}
