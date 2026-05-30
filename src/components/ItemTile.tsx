"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { HiStar, HiCollection } from "react-icons/hi";
import ItemModal from "./ItemModal";

interface Flavor {
  name: string;
  price: number;
}

interface ItemTileProps {
  item: {
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
    image: string;
    featured: boolean;
    inStock: boolean;
    hasFlavors?: boolean;
    flavors?: Flavor[];
  };
}

export default function ItemTile({ item }: ItemTileProps) {
  const { lang, t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const displayName =
    lang === "kn" && item.nameKN ? item.nameKN :
    lang === "hi" && item.nameHI ? item.nameHI :
    item.name;

  const displayDesc =
    lang === "kn" && item.descriptionKN ? item.descriptionKN :
    lang === "hi" && item.descriptionHI ? item.descriptionHI :
    item.description;

  const displayPricingLabel =
    lang === "kn" && item.pricingLabelKN ? item.pricingLabelKN :
    lang === "hi" && item.pricingLabelHI ? item.pricingLabelHI :
    item.pricingLabel;

  const flavorPrices = item.hasFlavors && item.flavors?.length ? item.flavors.map((f) => f.price) : [];
  const minPrice = flavorPrices.length ? Math.min(...flavorPrices) : item.price;
  const maxPrice = flavorPrices.length ? Math.max(...flavorPrices) : item.price;
  const showRange = item.hasFlavors && flavorPrices.length > 0;

  return (
    <>
      <div
        onClick={() => item.inStock && setModalOpen(true)}
        className={`royal-card overflow-hidden group cursor-pointer h-full flex flex-col ${
          !item.inStock ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        <div className="relative h-52 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800">
          {item.image && !imgError ? (
            <Image
              src={item.image}
              alt={displayName}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiCollection className="w-16 h-16 text-gray-300 dark:text-gray-600" />
            </div>
          )}
          {item.featured && (
            <span className="absolute top-2 left-2 bg-royal-gold text-royal-maroon text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
              <HiStar size={12} /> Featured
            </span>
          )}
          {!item.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-lg">
                {t("menu.out_of_stock")}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-heading text-lg font-bold text-royal-maroon dark:text-royal-gold mb-1 group-hover:text-royal-gold-dark transition-colors">
            {displayName}
          </h3>
          {displayDesc && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {displayDesc}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-royal-maroon dark:text-royal-gold font-bold text-lg">
              {showRange ? `₹${minPrice} - ₹${maxPrice}` : `₹${item.price}`}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {displayPricingLabel}
            </span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <ItemModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
