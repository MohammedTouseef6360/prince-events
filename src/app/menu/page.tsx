"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRealtime } from "@/lib/use-realtime";
import ItemTile from "@/components/ItemTile";
import { HiSearch, HiMenu, HiEmojiSad } from "react-icons/hi";

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
}

export default function MenuPage() {
  const { t, lang } = useLanguage();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const realItems = useRealtime<MenuItem>("menu");

  useEffect(() => {
    if (realItems.length > 0) {
      setItems(realItems);
      const cats = Array.from(new Set(realItems.map((i) => i.category))) as string[];
      setCategories(cats);
      setLoading(false);
    }
  }, [realItems]);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load menu");
        return res.json();
      })
      .then((data) => {
        setItems(data);
        const cats = Array.from(new Set(data.map((i: MenuItem) => i.category)));
        setCategories(cats as string[]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Something went wrong");
        setLoading(false);
      });
  }, []);

  const filtered = items.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.nameKN.includes(search) ||
      item.nameHI.includes(search);
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold flex items-center justify-center gap-3">
          <HiMenu size={32} />
          {t("menu.title")}
        </h1>
        <div className="gold-divider max-w-xs mx-auto" />
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
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
      <div className="flex flex-wrap justify-center gap-2 mb-8">
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

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-20">
          <HiEmojiSad className="mx-auto mb-4 text-red-400" size={60} />
          <p className="text-red-500 dark:text-red-400 text-lg font-medium">{error}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please try refreshing the page</p>
        </div>
      )}

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="royal-card overflow-hidden">
              <div className="skeleton h-48 w-full" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-6 w-3/4" />
                <div className="skeleton h-4 w-full" />
                <div className="flex justify-between">
                  <div className="skeleton h-6 w-20" />
                  <div className="skeleton h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <HiEmojiSad className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={60} />
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t("menu.no_items")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div key={item._id} className="animate-fade-in">
              <ItemTile item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
