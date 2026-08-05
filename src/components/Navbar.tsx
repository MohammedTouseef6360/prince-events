"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { useSettings, extractPhoneDigits } from "@/lib/useSettings";
import { useDialog } from "@/hooks/useDialog";
import { HiMenu, HiX, HiShoppingCart, HiSun, HiMoon, HiArrowLeft, HiHome, HiPhotograph, HiChat, HiMail, HiLocationMarker, HiPhone, HiClipboardList, HiViewGrid } from "react-icons/hi";

const languages = [
  { code: "en", label: "EN" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "hi", label: "हिन्दी" },
];

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { uniqueCount } = useCart();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { settings } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen: sidebarOpen, close: closeSidebar, open: openSidebar, dialogRef: sidebarRef } = useDialog();
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showBackButton = pathname !== "/" && !pathname.startsWith("/admin");

  useEffect(() => {
    const routes = ["/menu", "/gallery", "/cart", "/my-orders"];
    routes.forEach((r) => router.prefetch(r));
    const t = setTimeout(() => {
      fetch("/api/menu").catch(() => {});
      fetch("/api/testimonials").catch(() => {});
    }, 100);
    return () => clearTimeout(t);
  }, [router]);

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-40 bg-royal-maroon shadow-lg border-b-2 border-royal-gold">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-16" />
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-royal-maroon dark:bg-gray-900 border-b-2 border-royal-gold">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              {showBackButton && (
                <button
                  onClick={() => router.back()}
                  className="text-royal-gold hover:text-royal-gold-light p-3 rounded-lg hover:bg-white/10 transition min-h-[48px] min-w-[48px] flex items-center justify-center"
                  title={t("nav.back")}
                >
                  <HiArrowLeft size={24} />
                </button>
              )}
              <button
                onClick={openSidebar}
                className="text-royal-gold hover:text-royal-gold-light p-3 rounded-lg hover:bg-white/10 active:scale-110 transition-all min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Toggle menu"
                aria-expanded={sidebarOpen}
                aria-controls="mobile-sidebar"
              >
                <HiMenu size={28} />
              </button>
            </div>

            <Link href="/" className="flex items-center gap-2 min-w-0">
              <span className="font-heading text-xl sm:text-2xl font-bold text-royal-gold tracking-wide truncate">
                {settings.businessName}
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 text-royal-gold hover:text-royal-gold-light px-2 py-1 text-xs rounded hover:bg-white/10 transition font-bold"
                  aria-expanded={langOpen}
                  aria-haspopup="menu"
                >
                  {lang.toUpperCase()}
                  <svg className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-royal-gold/30 z-50 min-w-[120px]">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code as any); setLangOpen(false); }}
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

              <button
                onClick={toggleDarkMode}
                className="text-royal-gold hover:text-royal-gold-light p-3 rounded-lg hover:bg-white/10 min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <HiSun size={22} /> : <HiMoon size={22} />}
              </button>

              <Link
                href="/cart"
                className="relative text-royal-gold hover:text-royal-gold-light p-3 rounded-lg hover:bg-white/10 min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="View cart"
              >
                <HiShoppingCart size={24} />
                {uniqueCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {uniqueCount}
                  </span>
                )}
              </Link>

              <Link
                href="/menu"
                className="hidden sm:inline-flex bg-royal-gold hover:bg-royal-gold-light text-royal-maroon font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-95 min-h-[40px] items-center gap-1.5"
              >
                Order Now
              </Link>

              <div className="sm:hidden relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="text-royal-gold hover:text-royal-gold-light px-2 py-1 rounded hover:bg-white/10 text-sm font-bold"
                  aria-label="Change language"
                  aria-expanded={langOpen}
                  aria-haspopup="menu"
                >
                  {lang.toUpperCase()}
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-royal-gold/30 z-50">
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
          className="fixed inset-0 bg-black/60 z-50"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.menu")}
        tabIndex={-1}
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white to-royal-cream dark:from-gray-900 dark:to-gray-950 z-50 transform transition-all duration-300 ease-out border-r-2 border-royal-gold/30 ${
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
              onClick={() => closeSidebar()}
              className="text-royal-gold hover:text-royal-gold-light p-3 rounded-full hover:bg-white/10 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <HiX size={22} />
            </button>
          </div>
          <div className="absolute -bottom-3 left-6 right-6 h-0.5 bg-gradient-to-r from-royal-gold via-royal-gold-light to-transparent rounded-full" />
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="overflow-y-auto h-[calc(100%-8rem)]">
          <div className="p-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-royal-gold/60 dark:text-royal-gold/40 px-3 py-2">
              {t("sidebar.quick_links")}
            </p>

            <Link
              href="/"
              onClick={() => closeSidebar()}
              className={`sidebar-link group ${pathname === "/" ? "font-bold text-royal-gold underline underline-offset-4" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiHome className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("nav.home")}</span>
            </Link>

            <Link
              href="/menu"
              onClick={() => closeSidebar()}
              className={`sidebar-link group ${pathname === "/menu" ? "font-bold text-royal-gold underline underline-offset-4" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiViewGrid className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("nav.menu")}</span>
            </Link>

            <Link
              href="/gallery"
              onClick={() => closeSidebar()}
              className={`sidebar-link group ${pathname === "/gallery" ? "font-bold text-royal-gold underline underline-offset-4" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiPhotograph className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>Our Gallery</span>
            </Link>

            <Link
              href="/my-orders"
              onClick={() => closeSidebar()}
              className={`sidebar-link group ${pathname === "/my-orders" ? "font-bold text-royal-gold underline underline-offset-4" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiClipboardList className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("my_orders.title")}</span>
            </Link>

            <Link
              href="/cart"
              onClick={() => closeSidebar()}
              className={`sidebar-link group ${pathname === "/cart" ? "font-bold text-royal-gold underline underline-offset-4" : ""}`}
            >
              <div className="w-9 h-9 rounded-lg bg-royal-maroon/10 dark:bg-royal-gold/10 flex items-center justify-center group-hover:bg-royal-maroon/20 dark:group-hover:bg-royal-gold/20 transition">
                <HiShoppingCart className="text-royal-maroon dark:text-royal-gold" size={18} />
              </div>
              <span>{t("nav.cart")}</span>
              {uniqueCount > 0 && (
                <span className="ml-auto bg-royal-maroon dark:bg-royal-gold dark:text-royal-maroon text-white text-xs px-2 py-0.5 rounded-full">
                  {uniqueCount}
                </span>
              )}
            </Link>
          </div>

            <div className="px-4 pt-2">
              <Link
                href="/menu"
                onClick={() => closeSidebar()}
                className="w-full bg-royal-gold hover:bg-royal-gold-light text-royal-maroon font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 min-h-[48px]"
              >
                Order Now
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
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
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
                className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-royal-gold/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <HiPhone className="text-green-600 dark:text-green-400" size={16} />
                </div>
                <span>{settings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${extractPhoneDigits(settings.phone)}`}
                target="_blank"
                className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-royal-gold/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <HiChat className="text-green-600 dark:text-green-400" size={16} />
                </div>
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 hover:bg-royal-gold/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <HiMail className="text-pink-600 dark:text-pink-400" size={16} />
                </div>
                <span>@{settings.instagram}</span>
              </a>
              <div className="flex items-center gap-3 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200">
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
