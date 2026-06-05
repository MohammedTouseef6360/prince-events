"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import ItemTile from "@/components/ItemTile";
import { HiSearch, HiMenu, HiEmojiSad } from "react-icons/hi";

interface Flavor {
  name: string;
  price: number;
}

interface MenuItem {
  _id: string;
  name: string;
  nameKN: string;
  nameHI: string;
  description: string;
  descriptionKN: string;
  descriptionHI: string;
  price: number;
  pricingType: string;
  pricingLabel: string;
  pricingLabelKN: string;
  pricingLabelHI: string;
  category: string;
  categoryKN: string;
  categoryHI: string;
  image: string;
  featured: boolean;
  inStock: boolean;
  hasFlavors?: boolean;
  flavors?: Flavor[];
}

export default function MenuPage() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const categories = Array.from(new Set(items.map((i) => i.category)));

  useEffect(() => {
    const minTimer = setTimeout(() => setLoading(false), 3000);
    fetch("/api/menu").then(r => r.json()).then(d => {
      if (Array.isArray(d)) setItems(d);
      setLoading(false); clearTimeout(minTimer);
    }).catch(() => setLoading(false));
    return () => clearTimeout(minTimer);
  }, []);

  const filtered = items.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch =
      search === "" ||
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.nameKN || "").includes(search) ||
      (item.nameHI || "").includes(search);
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold flex items-center justify-center gap-3">
          <HiMenu size={32} />
          {t("menu.title")}
        </h1>
        <div className="gold-divider max-w-xs mx-auto" />
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("menu.search")}
            className="royal-input pl-10"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === "all"
              ? "bg-royal-maroon text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-royal-maroon/10"
          }`}
        >
          {t("menu.all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-royal-maroon text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-royal-maroon/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-royal-gold/20 border-t-royal-gold rounded-full animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce-food">🍽️</span>
          </div>
          <div className="flex gap-3 text-3xl mb-4">
            <span className="animate-float-delay-1">🍕</span>
            <span className="animate-float-delay-2">🍔</span>
            <span className="animate-float-delay-3">🌮</span>
            <span className="animate-float-delay-4">🥗</span>
            <span className="animate-float-delay-5">🍰</span>
          </div>
          <p className="text-royal-maroon dark:text-royal-gold font-bold text-lg animate-pulse">Loading Menu...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <HiEmojiSad className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={60} />
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t("menu.no_items")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filtered.map((item, i) => (
            <div key={item._id} className="animate-scale-in" style={{ animationDelay: `${(i % 8) * 50}ms` }}>
              <ItemTile item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
