"use client";

import { useState, useEffect, useCallback } from "react";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

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
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  if (items.length === 0) return null;

  const item = items[current];
  const displayName =
    lang === "kn" && item.nameKN ? item.nameKN :
    lang === "hi" && item.nameHI ? item.nameHI :
    item.name;

  return (
    <div className="relative max-w-4xl mx-auto mt-8 mb-4">
      <div className="royal-card overflow-hidden">
        <div className={`relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-royal-maroon/10 to-royal-gold/10 transition-opacity duration-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
          {item.image ? (
            <Image
              src={item.image}
              alt={displayName}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 800px"
              priority={current === 0}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl sm:text-7xl opacity-20 font-bold text-royal-gold">PE</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-1">
              {displayName}
            </h3>
            <p className="text-royal-gold-light font-bold text-xl">
              ₹{item.price} <span className="text-sm font-normal text-white/70">/{item.pricingLabel}</span>
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition z-10"
      >
        <HiChevronLeft size={24} className="text-royal-maroon dark:text-royal-gold" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition z-10"
      >
        <HiChevronRight size={24} className="text-royal-maroon dark:text-royal-gold" />
      </button>

      <div className="flex items-center justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current
                ? "bg-royal-gold w-6"
                : "bg-royal-gold/30 hover:bg-royal-gold/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
