"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "kn" | "hi";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const defaultTranslations: Record<string, any> = {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [translations, setTranslations] = useState<Record<string, any>>(defaultTranslations);

  useEffect(() => {
    import(`@/i18n/${lang}.json`).then((mod) => {
      setTranslations(mod.default);
    });
  }, [lang]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key.split(".").pop() || key;
      }
    }
    return typeof value === "string" ? value : key.split(".").pop() || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (typeof window === "undefined") {
    return { lang: "en" as Language, setLang: () => {}, t: (key: string) => key.split(".").pop() || key };
  }
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
