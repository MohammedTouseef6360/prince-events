"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { useSettings, extractPhoneDigits } from "@/lib/useSettings";
import { HiMenu, HiX, HiShoppingCart, HiSun, HiMoon, HiArrowLeft, HiHome, HiFire, HiPhotograph, HiChat, HiMail, HiLocationMarker, HiPhone, HiClipboardList } from "react-icons/hi";

const languages = [
  { code: "en", label: "EN" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिन्दी" },
];

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { totalItems } = useCart();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { settings } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showBackButton = pathname !== "/" && !pathname.startsWith("/admin");

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-40 bg-royal-maroon shadow-lg border-b-2 border-royal-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16" />
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-royal-maroon dark:bg-gray-900 shadow-lg border-b-2 border-royal-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="text-royal-gold hover:text-royal-gold-light p-2 rounded-lg hover:bg-white/10 transition"
                  title={t("nav.back")}
                >
                  <HiArrowLeft size={24} />
                </button>
              )}
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-royal-gold hover:text-royal-gold-light p-2 rounded-lg hover:bg-white/10"
                aria-label="Toggle menu"
              >
                <HiMenu size={28} />
              </button>
            </div>

            <Link href="/" className="flex items-center gap-2">
              <span className="font-heading text-xl sm:text-2xl font-bold text-royal-gold tracking-wide">
                {settings.businessName}
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-1">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code as any)}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      lang === l.code
                        ? "bg-royal-gold text-royal-maroon font-bold"
                        : "text-royal-gold/70 hover:text-royal-gold"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleDarkMode}
                className="text-royal-gold hover:text-royal-gold-light p-2 rounded-lg hover:bg-white/10"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <HiSun size={22} /> : <HiMoon size={22} />}
              </button>

              <Link
                href="/cart"
                className="relative text-royal-gold hover:text-royal-gold-light p-2 rounded-lg hover:bg-white/10"
                aria-label="View cart"
              >
                <HiShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {totalItems}
                  </span>
                )}
              </Link>

              <div className="sm:hidden relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="text-royal-gold hover:text-royal-gold-light px-2 py-1 rounded hover:bg-white/10 text-sm font-bold"
                  aria-label="Change language"
                >
                  {lang.toUpperCase()}
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-royal-gold/30 z-50">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code as any);
                          setLangOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-royal-gold/10 ${
                          lang === l.code
                            ? "text-royal-maroon dark:text-royal-gold font-bold"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white to-royal-cream dark:from-gray-900 dark:to-gray-950 shadow-2xl z-50 transform transition-all duration-300 ease-out border-r-2 border-royal-gold/30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="relative bg-gradient-to-r from-royal-maroon to-royal-maroon-dark p-6 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-royal-gold tracking-wide">
                {settings.businessName}
              </h2>
              <p className="text-royal-gold/60 text-xs italic mt-0.5 font-light">
                &ldquo;{t("home.hero_subtitle")}&rdquo;
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-royal-gold hover:text-royal-gold-light p-2 rounded-full hover:bg-white/10 transition"
              aria-label="Close menu"
            >
              <HiX size={22} />
            </button>
          </div>
          <div className="absolute -bottom-3 left-6 right-6 h-0.5 bg-gradient-to-r from-royal-gold via-royal-gold-light to-transparent rounded-full" />
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="overflow-y-auto h-[calc(100%-8rem)] scrollbar-thin">
          <div className="p-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-royal-gold/60 dark:text-royal-gold/40 px-3 py-2">
              {t("sidebar.quick_links")}
            </p>

            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="sidebar-link group"
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiHome className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("nav.home")}</span>
            </Link>

            <Link
              href="/menu"
              onClick={() => setSidebarOpen(false)}
              className="sidebar-link group"
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiFire className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("nav.menu")}</span>
            </Link>

            <Link
              href="/gallery"
              onClick={() => setSidebarOpen(false)}
              className="sidebar-link group"
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiPhotograph className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("sidebar.gallery")}</span>
            </Link>

            <Link
              href="/my-orders"
              onClick={() => setSidebarOpen(false)}
              className="sidebar-link group"
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiClipboardList className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("my_orders.title")}</span>
            </Link>

            <Link
              href="/cart"
              onClick={() => setSidebarOpen(false)}
              className="sidebar-link group"
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiShoppingCart className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("nav.cart")}</span>
              {totalItems > 0 && (
                <span className="ml-auto bg-royal-maroon text-white text-xs px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          <div className="px-4 py-2">
            <div className="gold-divider my-2" />
          </div>

          {/* About Section */}
          <div className="px-6 pb-2">
            <h3 className="font-heading text-sm font-bold text-royal-maroon dark:text-royal-gold mb-2 uppercase tracking-wider">
              {t("sidebar.about")}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t("about.content")}
            </p>
          </div>

          <div className="px-4 py-2">
            <div className="gold-divider my-2" />
          </div>

          {/* Contact Section */}
          <div className="px-6 pb-6">
            <h3 className="font-heading text-sm font-bold text-royal-maroon dark:text-royal-gold mb-3 uppercase tracking-wider">
              {t("sidebar.get_in_touch")}
            </h3>
            <div className="space-y-2">
              <a
                href={`tel:+${extractPhoneDigits(settings.phone)}`}
                className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-royal-gold/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <HiPhone className="text-green-600 dark:text-green-400" size={16} />
                </div>
                <span>{settings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${extractPhoneDigits(settings.phone)}`}
                target="_blank"
                className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-royal-gold/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <HiChat className="text-green-600 dark:text-green-400" size={16} />
                </div>
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-royal-gold/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <HiMail className="text-pink-600 dark:text-pink-400" size={16} />
                </div>
                <span>@{settings.instagram}</span>
              </a>
              <div className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <HiLocationMarker className="text-blue-600 dark:text-blue-400" size={16} />
                </div>
                <span>{settings.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
