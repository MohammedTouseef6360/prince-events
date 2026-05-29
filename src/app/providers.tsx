"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { DarkModeProvider } from "@/context/DarkModeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DarkModeProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </DarkModeProvider>
    </LanguageProvider>
  );
}
