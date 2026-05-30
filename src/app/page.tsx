"use client";

import { useState, useEffect, useRef } from "react";
import { useRealtime } from "@/lib/use-realtime";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/lib/useSettings";
import ItemTile from "@/components/ItemTile";
import FeaturedSlideshow from "@/components/FeaturedSlideshow";
import { HiStar, HiBadgeCheck, HiArrowDown, HiSparkles, HiHeart, HiPhone, HiCamera, HiEmojiHappy } from "react-icons/hi";

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
  image: string;
  featured: boolean;
  inStock: boolean;
  hasFlavors?: boolean;
  flavors?: Flavor[];
}

interface Feedback {
  _id: string;
  name: string;
  message: string;
  rating: number;
}

export default function HomePage() {
  const { t, lang } = useLanguage();
  const { settings } = useSettings();
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [fbName, setFbName] = useState("");
  const [fbMessage, setFbMessage] = useState("");
  const [fbRating, setFbRating] = useState(5);
  const [fbSubmitted, setFbSubmitted] = useState(false);
  const [fbSending, setFbSending] = useState(false);
  const [fbError, setFbError] = useState("");
  const [pageError, setPageError] = useState("");
  const realMenu = useRealtime<MenuItem>("menu");
  const realFeedback = useRealtime<Feedback>("testimonials");

  useEffect(() => {
    if (realMenu.length > 0) setFeaturedItems(realMenu.filter((i) => i.featured));
  }, [realMenu]);

  useEffect(() => {
    if (realFeedback.length > 0) setFeedbacks(realFeedback);
  }, [realFeedback]);

  const fbAbortRef = useRef<AbortController | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPageError("");
    Promise.all([
      fetch("/api/menu?featured=true").then((res) => {
        if (!res.ok) throw new Error("Failed to load featured menu");
        return res.json();
      }),
      fetch("/api/testimonials").then((res) => {
        if (!res.ok) throw new Error("Failed to load testimonials");
        return res.json();
      }),
    ])
      .then(([menuData, fbData]) => {
        setFeaturedItems(menuData);
        setFeedbacks(fbData);
      })
      .catch((err) => setPageError(err?.message || "Something went wrong"))
      .finally(() => setLoading(false));

    return () => {
      fbAbortRef.current?.abort();
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbName || !fbMessage) return;
    setFbSending(true);
    setFbError("");
    const controller = new AbortController();
    fbAbortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fbName, message: fbMessage, rating: fbRating }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      setFbSubmitted(true);
      setFbName("");
      setFbMessage("");
      setFbRating(5);
      successTimeoutRef.current = setTimeout(() => setFbSubmitted(false), 5000);
      const res2 = await fetch("/api/testimonials", { signal: controller.signal });
      if (!res2.ok) throw new Error("Failed to refresh");
      const data = await res2.json();
      setFeedbacks(data);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setFbError(err?.message || "Something went wrong. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      if (fbAbortRef.current === controller) fbAbortRef.current = null;
      setFbSending(false);
    }
  };

  const scrollToMenu = () => {
    const el = document.getElementById("featured-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length)
    : 0;

  return (
    <div className="animate-fade-in">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-royal-maroon via-royal-maroon-dark to-royal-burgundy text-white">
        <div className="absolute inset-0 opacity-[0.08] ornament" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,253,208,0.06),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm border border-royal-gold/20 rounded-full px-5 py-2">
              <HiSparkles className="text-royal-gold" size={16} />
              <span className="text-royal-gold text-sm font-medium tracking-wide">
                {settings.address}
              </span>
            </div>

            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-bold mb-4 text-royal-gold leading-tight">
              {settings.heroTitle || t("home.hero_title")}
            </h1>
            <p className="text-xl sm:text-2xl text-royal-gold-light font-heading italic mb-4 tracking-wide">
              &ldquo;{settings.heroSubtitle || t("home.hero_subtitle")}&rdquo;
            </p>
            <p className="text-lg sm:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              {lang === "kn" && settings.heroDescKN ? settings.heroDescKN : lang === "hi" && settings.heroDescHI ? settings.heroDescHI : settings.heroDesc || t("home.hero_desc")}
            </p>

            {/* Elegant scroll indicator */}
            <button
              onClick={scrollToMenu}
              className="group inline-flex flex-col items-center gap-2 text-white/50 hover:text-royal-gold transition-all duration-500"
            >
              <span className="text-sm tracking-widest uppercase font-medium">
                Scroll to Menu
              </span>
              <span className="animate-bounce">
                <HiArrowDown size={24} className="group-hover:translate-y-1 transition-transform" />
              </span>
            </button>
          </div>

          {/* Featured Slideshow */}
          {featuredItems.length > 0 && (
            <FeaturedSlideshow items={featuredItems} />
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-royal-cream dark:from-gray-950 to-transparent" />
      </section>

      {/* ─── Featured Items ─── */}
      {loading ? (
        <section id="featured-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="skeleton h-10 w-72 mx-auto mb-4 rounded-lg" />
            <div className="skeleton h-1 w-40 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="royal-card overflow-hidden">
                <div className="skeleton h-52 w-full" />
                <div className="p-5 space-y-3">
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
        </section>
      ) : featuredItems.length > 0 && (
        <section id="featured-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-3">
              <HiSparkles className="text-royal-gold" size={28} />
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold">
                {t("home.featured")}
              </h2>
              <HiSparkles className="text-royal-gold" size={28} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
              Carefully crafted selections for your special celebration
            </p>
            <div className="gold-divider max-w-xs mx-auto mt-6" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.slice(0, 6).map((item, i) => (
              <div key={item._id} className={`animate-card-enter stagger-${i + 1}`}>
                <ItemTile item={item} />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/menu" className="royal-btn-gold inline-flex items-center gap-2 px-8 py-3 text-lg group">
              <span>View Full Menu</span>
              <HiArrowDown className="group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* ─── Error Banner ─── */}
      {!loading && pageError && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">{pageError}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please try refreshing the page</p>
          </div>
        </section>
      )}

      {/* ─── Feedback Section ─── */}
      <section className="bg-gradient-to-b from-royal-maroon/[0.03] to-royal-maroon/[0.07] dark:from-gray-900/50 dark:to-gray-950/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-3">
              <HiHeart className="text-red-400" size={24} />
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold">
                {t("home.testimonials")}
              </h2>
              <HiHeart className="text-red-400" size={24} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Voices of couples who trusted us with their special day
            </p>
            <div className="gold-divider max-w-xs mx-auto mt-6" />
          </div>

          {/* Overall Rating */}
          {feedbacks.length > 0 && (
            <div className="flex items-center justify-center gap-4 mb-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-5 max-w-md mx-auto shadow-lg border border-royal-gold/10">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HiStar
                    key={star}
                    className={star <= Math.round(avgRating) ? "text-royal-gold fill-current" : "text-gray-300 dark:text-gray-600"}
                    size={28}
                  />
                ))}
              </div>
              <div className="h-8 w-px bg-royal-gold/20" />
              <div className="text-left">
                <span className="text-2xl font-bold text-royal-maroon dark:text-royal-gold">
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  ({feedbacks.length})
                </span>
              </div>
              <HiBadgeCheck className="text-green-500" size={22} />
            </div>
          )}

          {/* Feedback Form */}
          <div className="max-w-lg mx-auto mb-14">
            <div className="royal-card p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-royal-gold/15 flex items-center justify-center">
                  <HiEmojiHappy className="text-royal-gold" size={20} />
                </div>
                <h3 className="font-heading text-lg font-bold text-royal-maroon dark:text-royal-gold">
                  {t("home.feedback_title")}
                </h3>
              </div>
              {fbSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <HiBadgeCheck className="text-green-500" size={32} />
                  </div>
                  <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                    {t("home.feedback_thanks")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <input
                    type="text"
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    placeholder={t("home.feedback_name")}
                    className="royal-input"
                    required
                  />
                  <textarea
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder={t("home.feedback_placeholder")}
                    className="royal-input h-24 resize-none"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFbRating(star)}
                        className="text-2xl transition hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        <HiStar
                          className={
                            star <= fbRating
                              ? "text-royal-gold fill-current"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      </button>
                    ))}
                  </div>
                  {fbError && (
                    <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
                      {fbError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={fbSending}
                    className="royal-btn w-full flex items-center justify-center gap-2"
                  >
                    {fbSending ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>{t("home.feedback_submit")}</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Feedback Display */}
          {feedbacks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="royal-card p-6 text-center hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-royal-gold/10 flex items-center justify-center mx-auto mb-4">
                    <HiHeart className="text-royal-gold" size={24} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic mb-4 leading-relaxed text-sm">
                    &ldquo;{fb.message}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-1 text-royal-gold mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <HiStar
                        key={i}
                        className={
                          i < fb.rating
                            ? "text-royal-gold fill-current"
                            : "text-gray-300 dark:text-gray-600"
                        }
                        size={16}
                      />
                    ))}
                  </div>
                  <p className="font-bold text-royal-maroon dark:text-royal-gold text-sm">
                    - {fb.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Contact CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-royal-maroon to-royal-maroon-dark p-8 sm:p-14 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-[0.06] ornament" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_60%)]" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-full bg-royal-gold/15 flex items-center justify-center mx-auto mb-5">
              <HiPhone className="text-royal-gold" size={28} />
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-royal-gold mb-3">
              {t("home.contact_us")}
            </h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto leading-relaxed">
              {t("about.content")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:+${settings.phone.replace(/\D/g, "")}`}
                className="bg-royal-gold text-royal-maroon font-bold py-3 px-8 rounded-xl hover:bg-royal-gold-light hover:-translate-y-0.5 transition-all shadow-lg flex items-center gap-3"
              >
                <HiPhone size={20} />
                {settings.phone}
              </a>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                className="border-2 border-royal-gold/50 text-royal-gold font-bold py-3 px-8 rounded-xl hover:bg-royal-gold hover:text-royal-maroon hover:-translate-y-0.5 transition-all flex items-center gap-3"
              >
                <HiCamera size={20} />
                @{settings.instagram}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}