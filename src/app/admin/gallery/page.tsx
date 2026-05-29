"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { HiPlus, HiTrash, HiPhotograph, HiArrowLeft } from "react-icons/hi";

export default function AdminGalleryPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<any[]>([]);
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("prince-events-admin");
      if (!isAdmin) router.push("/admin/login");
    }
    fetchImages();
  }, [router]);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setImages(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch images");
    }
    setLoading(false);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    setError("");
    try {
      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        if (!uploadData.url) throw new Error("No URL returned from upload");
        const saveRes = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: uploadData.url, caption }),
        });
        if (!saveRes.ok) throw new Error("Save failed");
        setUploading(false);
      } else if (imageUrl) {
        const saveRes = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageUrl, caption }),
        });
        if (!saveRes.ok) throw new Error("Save failed");
      }
      setCaption("");
      setImageUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchImages();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this gallery image permanently?")) return;
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.statusText);
      fetchImages();
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
              <HiPhotograph size={24} />
              {t("admin.gallery")}
            </h1>
            <p className="text-royal-gold/60 text-xs mt-0.5">{images.length} photos</p>
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
            Add Image
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="flex-1 royal-input"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste image URL"
              className="flex-1 royal-input"
            />
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption"
              className="flex-1 royal-input"
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="royal-btn flex items-center gap-2"
            >
              <HiPlus size={20} />
              {uploading ? "Uploading..." : "Add"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img: any) => (
            <div key={img._id} className="royal-card overflow-hidden group">
              <div className="relative h-48">
                <Image
                  src={img.image}
                  alt={img.caption || "Gallery"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <button
                  onClick={() => handleDelete(img._id)}
                  disabled={deleting === img._id}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg disabled:opacity-100"
                >
                  {deleting === img._id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiTrash size={16} />}
                </button>
              </div>
              {img.caption && (
                <div className="p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No images yet. Upload your first event photo!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
