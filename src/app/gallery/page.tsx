"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { HiX, HiPhotograph, HiSearch } from "react-icons/hi";

interface GalleryItem {
  _id: string;
  image: string;
  caption: string;
  captionKN: string;
  captionHI: string;
}

export default function GalleryPage() {
  const { t, lang } = useLanguage();
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load gallery");
        return res.json();
      })
      .then((data) => {
        setImages(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Something went wrong");
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold flex items-center justify-center gap-3">
          <HiPhotograph size={32} />
          {t("gallery.title")}
        </h1>
        <div className="gold-divider max-w-xs mx-auto" />
      </div>

      {!loading && error && (
        <div className="text-center py-20">
          <HiPhotograph className="mx-auto mb-4 text-red-400" size={60} />
          <p className="text-red-500 dark:text-red-400 text-lg font-medium">{error}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please try refreshing the page</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="royal-card overflow-hidden">
              <div className="skeleton h-64 w-full" />
              <div className="p-3">
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <HiPhotograph className="mx-auto text-6xl mb-4 text-royal-gold" />
          <p className="text-gray-500 dark:text-gray-400">Gallery coming soon...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => {
            const displayCaption =
              lang === "kn" && img.captionKN
                ? img.captionKN
                : lang === "hi" && img.captionHI
                ? img.captionHI
                : img.caption;

            return (
              <div
                key={img._id}
                onClick={() => setSelected(img)}
                className={`royal-card overflow-hidden cursor-pointer group animate-card-enter stagger-${(i % 6) + 1}`}
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={img.image}
                    alt={displayCaption || "Gallery Image"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <HiSearch className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                {displayCaption && (
                  <div className="p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {displayCaption}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 text-white hover:text-royal-gold p-2 hover:scale-110 transition-all z-10"
            aria-label="Close lightbox"
          >
            <HiX size={32} />
          </button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full" style={{ minHeight: "50vh" }}>
              <Image
                src={selected.image}
                alt={selected.caption || "Gallery image"}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] mx-auto rounded-lg shadow-2xl"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            {selected.caption && (
              <p className="text-white/90 text-center mt-4 text-lg font-heading italic">
                &ldquo;{selected.caption}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
