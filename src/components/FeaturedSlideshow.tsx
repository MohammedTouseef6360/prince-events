"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface FeaturedItem {
  _id: string;
  name: string;
  nameKN: string;
  nameHI: string;
  description: string;
  price: number;
  pricingLabel: string;
  image: string;
}

export default function FeaturedSlideshow({ items }: { items: FeaturedItem[] }) {
  const { lang } = useLanguage();
  const [paused, setPaused] = useState(false);

  if (items.length === 0) return null;

  const getName = (item: FeaturedItem) =>
    lang === "kn" && item.nameKN ? item.nameKN :
    lang === "hi" && item.nameHI ? item.nameHI :
    item.name;

  const doubled = [...items, ...items];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-royal-maroon/[0.02] to-transparent dark:from-gray-900/30 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-royal-maroon dark:text-royal-gold tracking-wider uppercase">
            Today&rsquo;s Special
          </h2>
          <div className="gold-divider max-w-xs mx-auto" />
        </div>
        <div className="relative overflow-hidden">
          <div
            className={`marquee-track flex gap-8${paused ? " marquee-paused" : ""}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {doubled.map((item, i) => (
              <div
                key={`${item._id}-${i}`}
                className="flex-shrink-0 w-[300px] sm:w-[340px] md:w-[380px] bg-white dark:bg-gray-800 rounded-2xl border border-royal-gold/20 overflow-hidden transition-shadow duration-300"
              >
                <div className="h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={getName(item)}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl sm:text-7xl font-bold text-royal-gold/20">PE</span>
                    </div>
                  )}
                </div>
                <div className="p-5 sm:p-6 text-center">
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-royal-maroon dark:text-royal-gold truncate">
                    {getName(item)}
                  </h3>
                  <p className="text-royal-gold font-bold text-xl sm:text-2xl mt-2">
                    ₹{item.price} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/{item.pricingLabel}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="absolute top-3 right-3 z-10 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-white/85 dark:bg-gray-800/85 border border-royal-gold/30 text-royal-maroon dark:text-royal-gold flex items-center justify-center shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            {paused ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            )}
          </button>
        </div>

        <style>{`
.marquee-track{animation:ms 70s linear infinite;width:max-content}
.marquee-track:hover{animation-play-state:paused}
.marquee-paused{animation-play-state:paused}
@media (prefers-reduced-motion: reduce){.marquee-track{animation:none}}
@keyframes ms{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
`}</style>
      </div>
    </section>
  );
}
