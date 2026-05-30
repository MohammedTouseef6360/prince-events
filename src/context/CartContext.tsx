"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  key: string;
  name: string;
  price: number;
  qty: number;
  pricingType: string;
  pricingLabel: string;
  image: string;
  flavor?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("prince-events-cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((item: any) => ({
          ...item,
          key: item.key || item.id,
        }));
        setItems(migrated);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("prince-events-cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) =>
          i.key === item.key ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQty = (key: string, qty: number) => {
    if (qty <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("prince-events-cart");
  };

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (typeof window === "undefined") {
    return { items: [], addItem: () => {}, removeItem: () => {}, updateQty: () => {}, clearCart: () => {}, totalItems: 0, subtotal: 0 };
  }
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
