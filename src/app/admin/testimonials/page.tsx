"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { HiPlus, HiTrash, HiStar, HiHeart, HiEmojiHappy, HiArrowLeft } from "react-icons/hi";

export default function AdminTestimonialsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("prince-events-admin");
      if (!isAdmin) router.push("/admin/login");
    }
    fetchTestimonials();
  }, [router]);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setTestimonials(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch testimonials");
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!name || !message) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, rating }),
      });
      if (!res.ok) throw new Error(res.statusText);
      setName("");
      setMessage("");
      setRating(5);
      fetchTestimonials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add testimonial");
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this testimonial permanently?")) return;
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.statusText);
      fetchTestimonials();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-royal-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white px-6 py-5 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/dashboard")} className="text-royal-gold hover:text-royal-gold-light p-1.5 rounded-lg hover:bg-white/10 transition">
            <HiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-royal-gold tracking-wide flex items-center gap-3">
              <HiHeart size={24} />
              {t("admin.testimonials")}
            </h1>
            <p className="text-royal-gold/60 text-xs mt-0.5">{testimonials.length} reviews</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>Error: {error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
          </div>
        )}
        <div className="royal-card p-6 mb-6">
          <h2 className="font-heading text-lg font-bold text-royal-maroon dark:text-royal-gold mb-4 flex items-center gap-2">
            <HiPlus size={18} />
            Add Testimonial
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Name"
              className="royal-input"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Testimonial Message"
              className="royal-input h-24 resize-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition hover:scale-110 ${
                    star <= rating ? "text-royal-gold" : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  <HiStar className={star <= rating ? "fill-current" : ""} />
                </button>
              ))}
            </div>
            <button onClick={handleAdd} disabled={adding} className="royal-btn flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiPlus size={20} />}
              {adding ? "Adding..." : "Add Testimonial"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {testimonials.map((t: any) => (
            <div key={t._id} className="royal-card p-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-royal-gold/10 flex items-center justify-center">
                    <HiEmojiHappy className="text-royal-gold" size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-royal-maroon dark:text-royal-gold">
                      {t.name}
                    </span>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <HiStar
                          key={i}
                          className={i < t.rating ? "text-royal-gold fill-current" : "text-gray-300 dark:text-gray-600"}
                          size={14}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 ml-13">
                  &ldquo;{t.message}&rdquo;
                </p>
              </div>
              <button
                onClick={() => handleDelete(t._id)}
                disabled={deleting === t._id}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === t._id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <HiTrash size={16} />}
              </button>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <HiHeart size={40} className="mx-auto mb-2 text-gray-300" />
              No testimonials yet. Add your first review!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
