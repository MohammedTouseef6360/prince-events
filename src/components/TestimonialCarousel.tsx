"use client";

import { useState, useEffect, useCallback } from "react";
import { HiStar, HiChevronLeft, HiChevronRight, HiX } from "react-icons/hi";

interface Testimonial {
  _id: string;
  name: string;
  message: string;
  rating: number;
  photo?: string;
  eventType?: string;
}

const EVENT_COLORS: Record<string, string> = {
  Wedding: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Birthday: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Corporate: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Engagement: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const PersonIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full text-royal-gold p-3" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="32" cy="22" r="12" />
    <path d="M12 56c0-12 8-20 20-20s20 8 20 20" strokeLinecap="round" />
  </svg>
);

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedFb, setSelectedFb] = useState<Testimonial | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
    setFadeKey((k) => k + 1);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % testimonials.length);
  }, [current, testimonials.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + testimonials.length) % testimonials.length);
  }, [current, testimonials.length, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const openPanel = (fb: Testimonial) => {
    setSelectedFb(fb);
    setPanelOpen(true);
  };

  if (!testimonials.length) return null;

  const fb = testimonials[current];

  return (
    <>
      <div className="relative max-w-2xl mx-auto">
        <div key={fadeKey} className="royal-card p-8 text-center animate-fade-in">
          <div
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto mb-4 overflow-hidden bg-royal-gold/10 flex items-center justify-center border-2 border-royal-gold/30 cursor-pointer hover:border-royal-gold transition-all"
            onClick={() => openPanel(fb)}
          >
            {fb.photo ? (
              <img
                src={fb.photo}
                alt={fb.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <PersonIcon />
            )}
          </div>
          <p
            className="text-gray-600 dark:text-gray-400 italic mb-5 leading-relaxed text-base min-h-[4rem] flex items-center justify-center cursor-pointer hover:text-royal-maroon dark:hover:text-royal-gold transition-colors"
            onClick={() => openPanel(fb)}
          >
            &ldquo;{fb.message.length > 100 ? fb.message.slice(0, 100) + "..." : fb.message}&rdquo;
          </p>
          {fb.message.length > 100 && (
            <button
              onClick={() => openPanel(fb)}
              className="text-royal-gold text-xs font-semibold hover:underline mb-2"
            >
              Read full review &rarr;
            </button>
          )}
          <div className="flex items-center justify-center gap-1 text-royal-gold mb-3">
            {Array.from({ length: 5 }, (_, si) => (
              <HiStar
                key={si}
                className={
                  si < fb.rating
                    ? "text-royal-gold fill-current"
                    : "text-gray-300 dark:text-gray-600"
                }
                size={18}
              />
            ))}
          </div>
          <p className="font-bold text-royal-maroon dark:text-royal-gold text-base">
            - {fb.name}
          </p>
          {fb.eventType && (
            <span
              className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                EVENT_COLORS[fb.eventType] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {fb.eventType}
            </span>
          )}
        </div>

        {testimonials.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-royal-gold/20 flex items-center justify-center text-royal-maroon dark:text-royal-gold hover:bg-royal-gold hover:text-white transition-all z-10"
              aria-label="Previous testimonial"
            >
              <HiChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-royal-gold/20 flex items-center justify-center text-royal-maroon dark:text-royal-gold hover:bg-royal-gold hover:text-white transition-all z-10"
              aria-label="Next testimonial"
            >
              <HiChevronRight size={20} />
            </button>

            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-8 bg-royal-gold"
                      : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-royal-gold/50"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Feedback Detail Panel */}
      {panelOpen && selectedFb && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPanelOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-royal-gold/20 animate-scale-in p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold">
                Feedback Detail
              </h3>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <HiX size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-royal-gold/10 flex items-center justify-center border-2 border-royal-gold/30 shrink-0">
                {selectedFb.photo ? (
                  <img src={selectedFb.photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <PersonIcon />
                )}
              </div>
              <div>
                <p className="font-bold text-lg text-royal-maroon dark:text-royal-gold">
                  {selectedFb.name}
                </p>
                {selectedFb.eventType && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${EVENT_COLORS[selectedFb.eventType] || "bg-gray-100 text-gray-700"}`}>
                    {selectedFb.eventType}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }, (_, si) => (
                <HiStar
                  key={si}
                  className={si < selectedFb.rating ? "text-royal-gold fill-current" : "text-gray-300"}
                  size={20}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">({selectedFb.rating}/5)</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-wrap">
              &ldquo;{selectedFb.message}&rdquo;
            </p>
          </div>
        </div>
      )}
    </>
  );
}
