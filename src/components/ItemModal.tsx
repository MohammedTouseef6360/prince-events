"use client";

import { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { HiX, HiPlus, HiMinus, HiShoppingCart } from "react-icons/hi";

interface ItemModalProps {
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
    inStock: boolean;
  };
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

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

  const handleAddToCart = () => {
    addItem({
      id: item._id,
      name: displayName,
      price: item.price,
      qty,
      pricingType: item.pricingType,
      pricingLabel: displayPricingLabel,
      image: item.image,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="royal-modal-overlay" onClick={onClose}>
      <div className="royal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition"
            aria-label="Close"
          >
            <HiX size={20} />
          </button>
          <div className="relative h-64 rounded-t-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {item.image && !imgError ? (
              <Image
                src={item.image}
                alt={displayName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <HiShoppingCart className="text-gray-300" size={48} />
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-heading text-2xl font-bold text-royal-maroon dark:text-royal-gold mb-2">
            {displayName}
          </h2>

          {displayDesc && (
            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {displayDesc}
            </p>
          )}

          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl font-bold text-royal-maroon dark:text-royal-gold">
              ₹{item.price}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {displayPricingLabel}
            </span>
          </div>

          <div className="gold-divider" />

          <div className="flex items-center justify-between mb-6">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {t("cart.qty")}:
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2 rounded-full border border-royal-gold/30 hover:bg-royal-gold/10 transition"
                aria-label="Decrease quantity"
              >
                <HiMinus size={18} />
              </button>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setQty(Math.max(1, v));
                }}
                className="w-16 text-center text-xl font-bold bg-transparent border border-royal-gold/30 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-royal-gold"
              />
              <button
                onClick={() => setQty(qty + 1)}
                className="p-2 rounded-full border border-royal-gold/30 hover:bg-royal-gold/10 transition"
                aria-label="Increase quantity"
              >
                <HiPlus size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-700 dark:text-gray-300">
              {t("cart.total")}:
            </span>
            <span className="text-2xl font-bold text-royal-maroon dark:text-royal-gold">
              ₹{item.price * qty}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!item.inStock}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
              added
                ? "bg-green-500 text-white"
                : "royal-btn"
            }`}
          >
            {added ? "✓ Added!" : <span className="flex items-center gap-2"><HiShoppingCart size={20} />{t("menu.add_to_cart")}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
