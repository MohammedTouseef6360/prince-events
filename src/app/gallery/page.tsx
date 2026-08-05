"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useDialog } from "@/hooks/useDialog";
import { HiX, HiPhotograph, HiSearch, HiCalendar, HiLocationMarker, HiStar, HiRefresh } from "react-icons/hi";

interface GalleryItem {
  _id: string;
  image: string;
  caption: string;
  captionKN: string;
  captionHI: string;
  eventType?: string;
  eventDate?: string;
  venue?: string;
}

const EVENT_TABS = ["All", "Wedding", "Corporate", "Birthday", "Engagement"];

const EVENT_COLORS: Record<string, string> = {
  Wedding: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Corporate: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Birthday: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Engagement: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function GalleryPage() {
  const { t, lang } = useLanguage();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [tick, setTick] = useState(0);
  const { setIsOpen: setLightboxOpen, dialogRef } = useDialog({ initialOpen: false });

  useEffect(() => {
    setLightboxOpen(!!selected);
  }, [selected, setLightboxOpen]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 8000);
    fetch("/api/gallery", { signal: c.signal }).then(r => { clearTimeout(t); if (!r.ok) throw new Error("Failed to load gallery"); return r.json(); }).then(d => {
      if (Array.isArray(d)) setImages(d);
      setLoading(false);
    }).catch((err: any) => { clearTimeout(t); setError(err?.name === "AbortError" ? "Loading timed out" : "Failed to load gallery"); setLoading(false); });
    return () => { clearTimeout(t); c.abort(); };
  }, [tick]);

  const filtered = activeTab === "All" ? images : images.filter(img => img.eventType === activeTab);

  const getCaption = (img: GalleryItem) =>
    lang === "kn" && img.captionKN
      ? img.captionKN
      : lang === "hi" && img.captionHI
      ? img.captionHI
      : img.caption;

  const formatDate = (d: string) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px w-8 bg-royal-gold/40" />
          <HiStar className="text-royal-gold" size={20} />
          <div className="h-px w-8 bg-royal-gold/40" />
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-royal-maroon dark:text-royal-gold">
          {t("gallery.title")}
        </h1>
        <div className="gold-divider max-w-xs mx-auto" />
      </div>

      {!loading && error && (
        <div className="text-center py-20">
          <HiPhotograph className="mx-auto mb-4 text-red-400" size={60} />
          <p className="text-red-500 dark:text-red-400 text-lg font-medium">{error}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Please try refreshing the page</p>
          <button
            onClick={() => setTick((t) => t + 1)}
            className="mt-4 royal-btn inline-flex items-center gap-2 text-sm py-2 px-4"
          >
            <HiRefresh size={16} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 border-4 border-royal-gold/20 border-t-royal-gold rounded-full animate-spin" />
          </div>
          <p className="text-royal-maroon dark:text-royal-gold font-bold text-lg animate-pulse">Loading Gallery...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <HiPhotograph className="mx-auto text-6xl mb-4 text-royal-gold" />
          <p className="text-gray-600 dark:text-gray-400">Gallery coming soon...</p>
        </div>
      ) : (
        <>
          {/* Event Type Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {EVENT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-royal-maroon text-white dark:bg-royal-gold dark:text-royal-maroon"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-royal-gold/20 hover:text-royal-maroon dark:hover:text-royal-gold"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((img, i) => {
              const caption = getCaption(img);
              return (
                <div
                  key={img._id}
                  role="button"
                  tabIndex={0}
                  aria-label={caption || "View gallery image"}
                  onClick={() => setSelected(img)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(img);
                    }
                  }}
                  className="royal-card overflow-hidden cursor-pointer group animate-scale-in hover:-translate-y-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal-gold"
                  style={{ animationDelay: `${(i % 9) * 60}ms` }}
                >
                  <div className="relative h-56 sm:h-64 overflow-hidden">
                    <Image
                      src={img.image}
                      alt={caption || "Gallery Image"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      {caption && (
                        <p className="text-white font-semibold text-sm truncate">{caption}</p>
                      )}
                      {img.eventType && (
                        <span className="inline-block mt-1 text-xs text-royal-gold font-medium">{img.eventType}</span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3 bg-royal-gold/90 text-royal-maroon p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                      <HiSearch size={18} />
                    </div>
                    {img.eventType && (
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        EVENT_COLORS[img.eventType] || "bg-gray-100 text-gray-700"
                      }`}>
                        {img.eventType}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <HiPhotograph className="mx-auto text-5xl mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No {activeTab.toLowerCase()} photos yet</p>
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={getCaption(selected) || "Gallery image"}
          tabIndex={-1}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-royal-gold/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 bg-black/40 hover:bg-royal-gold text-white hover:text-royal-maroon p-3 rounded-full transition-all flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Close lightbox"
            >
              <HiX size={24} />
            </button>

            <div className="relative w-full lg:w-3/5 min-h-[40vh] lg:min-h-[70vh] bg-gray-900">
              <Image
                src={selected.image}
                alt={getCaption(selected) || "Gallery image"}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>

            <div className="w-full lg:w-2/5 p-6 lg:p-8 flex flex-col justify-center bg-white dark:bg-gray-900 overflow-y-auto">
              {selected.eventType && (
                <span
                  className={`inline-block self-start mb-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    EVENT_COLORS[selected.eventType] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {selected.eventType}
                </span>
              )}
              {getCaption(selected) && (
                <h2 className="font-heading text-2xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
                  {getCaption(selected)}
                </h2>
              )}
              {selected.eventDate && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-3">
                  <HiCalendar className="text-royal-gold" size={18} />
                  <span>{formatDate(selected.eventDate)}</span>
                </div>
              )}
              {selected.venue && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
                  <HiLocationMarker className="text-royal-gold" size={18} />
                  <span>{selected.venue}</span>
                </div>
              )}
              {!selected.eventType && !getCaption(selected) && !selected.eventDate && !selected.venue && (
                <p className="text-gray-400 italic">No additional details available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
