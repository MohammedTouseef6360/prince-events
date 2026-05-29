"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/lib/useSettings";
import { HiPhone, HiCamera, HiLocationMarker } from "react-icons/hi";

export default function Footer() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  return (
    <footer className="bg-royal-maroon dark:bg-gray-900 text-royal-gold border-t-2 border-royal-gold/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-3">{settings.businessName}</h3>
            <p className="text-royal-gold/80 text-sm leading-relaxed">
              &ldquo;{settings.tagline}&rdquo;
            </p>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="text-royal-gold/80 hover:text-royal-gold-light">
                  {t("nav.menu")}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-royal-gold/80 hover:text-royal-gold-light">
                  {t("nav.gallery")}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-royal-gold/80 hover:text-royal-gold-light">
                  {t("nav.cart")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold mb-3">{t("sidebar.contact")}</h3>
            <ul className="space-y-2 text-sm text-royal-gold/80">
              <li className="flex items-center gap-2"><HiPhone size={14} /> {settings.phone}</li>
              <li className="flex items-center gap-2"><HiCamera size={14} /> @{settings.instagram}</li>
              <li className="flex items-center gap-2"><HiLocationMarker size={14} /> {settings.address}</li>
            </ul>
          </div>
        </div>
        <div className="gold-divider my-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-royal-gold/70">
            &copy; {new Date().getFullYear()} PRINCE EVENTS. {t("footer.rights")}
          </p>
          <Link
            href="/admin/login"
            className="text-xs text-royal-gold/50 hover:text-royal-gold-light transition-colors"
          >
            {t("nav.admin")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
