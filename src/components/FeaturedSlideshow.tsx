"use client";

import { useLanguage } from "@/context/LanguageContext";
import { HiSparkles } from "react-icons/hi";

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
          <div className="inline-flex items-center gap-3 mb-2">
            <HiSparkles className="text-royal-gold" size={22} />
            <span className="font-heading text-2xl sm:text-3xl font-bold text-royal-maroon dark:text-royal-gold tracking-wider uppercase">
              Today&rsquo;s Special
            </span>
            <HiSparkles className="text-royal-gold" size={22} />
          </div>
          <div className="gold-divider max-w-xs mx-auto" />
        </div>
        <div className="relative overflow-hidden">
          <div className="marquee-track flex gap-8">
            {doubled.map((item, i) => (
              <div
                key={`${item._id}-${i}`}
                className="flex-shrink-0 w-[300px] sm:w-[340px] md:w-[380px] bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-royal-gold/20 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
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
        </div>

        <style>{`
.marquee-track{animation:ms 70s linear infinite;width:max-content}
.marquee-track:hover{animation-play-state:paused}
@keyframes ms{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
`}</style>
      </div>
    </section>
  );
}
