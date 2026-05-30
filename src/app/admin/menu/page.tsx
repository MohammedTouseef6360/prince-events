"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { HiPlus, HiPencil, HiTrash, HiX, HiCheck, HiStar, HiMenu, HiPhotograph, HiArrowLeft } from "react-icons/hi";

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
  categoryKN: string;
  categoryHI: string;
  image: string;
  featured: boolean;
  inStock: boolean;
  hasFlavors?: boolean;
  flavors?: Flavor[];
}

export default function AdminMenuPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    nameKN: "",
    nameHI: "",
    description: "",
    descriptionKN: "",
    descriptionHI: "",
    price: 0,
    pricingType: "per_piece",
    pricingLabel: "Per Piece",
    pricingLabelKN: "ಪ್ರತಿ ತುಂಡಿಗೆ",
    pricingLabelHI: "प्रति टुकड़ा",
    category: "Beverages",
    categoryKN: "",
    categoryHI: "",
    image: "",
    featured: false,
    inStock: true,
    hasFlavors: false,
    flavors: [] as { name: string; price: number }[],
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("prince-events-admin");
    if (!isAdmin) router.push("/admin/login");
    fetchItems();
  }, [router]);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/menu");
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setItems(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch items");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      name: "", nameKN: "", nameHI: "",
      description: "", descriptionKN: "", descriptionHI: "",
      price: 0,
      pricingType: "per_piece",
      pricingLabel: "Per Piece",
      pricingLabelKN: "ಪ್ರತಿ ತುಂಡಿಗೆ",
      pricingLabelHI: "प्रति टुकड़ा",
      category: "Beverages",
      categoryKN: "", categoryHI: "",
      image: "",
      featured: false,
      inStock: true,
      hasFlavors: false,
      flavors: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name) {
      alert("Name is required");
      return;
    }
    if (!form.hasFlavors && !form.price) {
      alert("Price is required");
      return;
    }
    if (form.hasFlavors && form.flavors.length === 0) {
      alert("Add at least one flavor");
      return;
    }

    setSaving(true);
    setError("");
    const payload = {
      ...form,
      price: form.hasFlavors && form.flavors.length > 0
        ? Math.min(...form.flavors.map((f) => f.price))
        : form.price,
    };
    try {
      if (editingId) {
        const res = await fetch(`/api/menu/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(res.statusText);
      } else {
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(res.statusText);
      }
      resetForm();
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
    setSaving(false);
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      nameKN: item.nameKN || "",
      nameHI: item.nameHI || "",
      description: item.description || "",
      descriptionKN: item.descriptionKN || "",
      descriptionHI: item.descriptionHI || "",
      price: item.price,
      pricingType: item.pricingType,
      pricingLabel: item.pricingLabel,
      pricingLabelKN: item.pricingLabelKN || "",
      pricingLabelHI: item.pricingLabelHI || "",
      category: item.category,
      categoryKN: item.categoryKN || "",
      categoryHI: item.categoryHI || "",
      image: item.image || "",
      featured: item.featured,
      inStock: item.inStock,
      hasFlavors: item.hasFlavors || false,
      flavors: item.flavors || [],
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this menu item permanently?")) return;
    setDeleting(id);
    setError("");
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.statusText);
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
    setDeleting(null);
  };

  const handleQuickToggle = async (id: string, field: string, value: boolean) => {
    setToggling(id);
    setError("");
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(res.statusText);
      fetchItems();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toggle failed");
    }
    setToggling(null);
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
              <HiMenu size={24} />
              {t("admin.manage_menu")}
            </h1>
            <p className="text-royal-gold/60 text-xs mt-0.5">{items.length} menu items</p>
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
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="royal-btn flex items-center gap-2 mb-6"
        >
          <HiPlus size={20} />
          {t("admin.add_item")}
        </button>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="royal-card p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold flex items-center gap-2">
                {editingId ? <><HiPencil size={20} /> Edit Item</> : <><HiPlus size={20} /> Add New Item</>}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <HiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Name (English)*"
                className="royal-input"
              />
              <input
                type="text"
                value={form.nameKN}
                onChange={(e) => setForm((f) => ({ ...f, nameKN: e.target.value }))}
                placeholder="ಹೆಸರು (Kannada)"
                className="royal-input"
              />
              <input
                type="text"
                value={form.nameHI}
                onChange={(e) => setForm((f) => ({ ...f, nameHI: e.target.value }))}
                placeholder="नाम (Hindi)"
                className="royal-input"
              />
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (English)"
                className="royal-input"
              />
              <input
                type="text"
                value={form.descriptionKN}
                onChange={(e) => setForm((f) => ({ ...f, descriptionKN: e.target.value }))}
                placeholder="ವಿವರಣೆ (Kannada)"
                className="royal-input"
              />
              <input
                type="text"
                value={form.descriptionHI}
                onChange={(e) => setForm((f) => ({ ...f, descriptionHI: e.target.value }))}
                placeholder="विवरण (Hindi)"
                className="royal-input"
              />
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                placeholder="Price (₹)*"
                className="royal-input"
              />
              <select
                value={form.pricingType}
                onChange={(e) => setForm((f) => ({ ...f, pricingType: e.target.value }))}
                className="royal-input"
              >
                <option value="per_piece">Per Piece</option>
                <option value="per_plate">Per Plate</option>
                <option value="per_time">Per Time/Duration</option>
              </select>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Category"
                className="royal-input"
              />
              <input
                type="text"
                value={form.pricingLabel}
                onChange={(e) => setForm((f) => ({ ...f, pricingLabel: e.target.value }))}
                placeholder='Pricing label (e.g. "Per Plate")'
                className="royal-input"
              />
              <input
                type="text"
                value={form.pricingLabelKN}
                onChange={(e) => setForm((f) => ({ ...f, pricingLabelKN: e.target.value }))}
                placeholder="Pricing label (Kannada)"
                className="royal-input"
              />
              <input
                type="text"
                value={form.pricingLabelHI}
                onChange={(e) => setForm((f) => ({ ...f, pricingLabelHI: e.target.value }))}
                placeholder="Pricing label (Hindi)"
                className="royal-input"
              />

              <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasFlavors}
                    onChange={(e) => setForm((f) => ({ ...f, hasFlavors: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-royal-gold rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-gold"></div>
                </label>
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Enable Flavors / Variants</span>
              </div>

              {form.hasFlavors && (
                <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flavors & Prices</p>
                  {form.flavors.map((f, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={f.name}
                        onChange={(e) => {
                          const updated = [...form.flavors];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setForm((prev) => ({ ...prev, flavors: updated }));
                        }}
                        placeholder="Flavor name"
                        className="royal-input flex-1"
                      />
                      <input
                        type="number"
                        value={f.price}
                        onChange={(e) => {
                          const updated = [...form.flavors];
                          updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                          setForm((prev) => ({ ...prev, flavors: updated }));
                        }}
                        placeholder="Price"
                        className="royal-input w-24"
                      />
                      <button
                        onClick={() => setForm((prev) => ({ ...prev, flavors: prev.flavors.filter((_, i) => i !== idx) }))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <HiX size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setForm((prev) => ({ ...prev, flavors: [...prev.flavors, { name: "", price: 0 }] }))}
                    className="flex items-center gap-1 text-sm text-royal-gold font-bold hover:underline"
                  >
                    <HiPlus size={16} /> Add Flavor
                  </button>
                </div>
              )}

              {/* Image Upload */}
              <div className="sm:col-span-2 lg:col-span-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm flex items-center gap-2"
                  >
                    <HiPhotograph size={16} />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="Or paste image URL"
                    className="royal-input flex-1"
                  />
                  {form.image && (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image
                        src={form.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="w-5 h-5 accent-royal-gold"
                  />
                  <span className="text-sm flex items-center gap-1"><HiStar size={14} className="text-royal-gold" /> Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
                    className="w-5 h-5 accent-royal-gold"
                  />
                  <span className="text-sm flex items-center gap-1"><HiCheck size={14} className="text-green-500" /> In Stock</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="royal-btn flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <HiCheck size={20} />}
                {saving ? "Saving..." : t("admin.save")}
              </button>
              <button onClick={resetForm} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                {t("admin.cancel")}
              </button>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="royal-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-royal-maroon text-white">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-center">Featured</th>
                  <th className="p-3 text-center">Stock</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
                  >
                    <td className="p-3">
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiMenu className="text-gray-400" size={18} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-gray-500">{item.category}</td>
                    <td className="p-3 font-bold">₹{item.price}</td>
                    <td className="p-3 text-xs text-gray-500">{item.pricingLabel}</td>
                    <td className="p-3 text-center">
                        <button
                          onClick={() => handleQuickToggle(item._id, "featured", !item.featured)}
                          disabled={toggling === item._id}
                          className={`p-1.5 rounded-lg transition ${item.featured ? "text-royal-gold bg-royal-gold/10" : "text-gray-300 hover:text-royal-gold"} ${toggling === item._id ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {toggling === item._id ? <div className="w-4 h-4 border-2 border-royal-gold border-t-transparent rounded-full animate-spin" /> : <HiStar size={18} />}
                        </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleQuickToggle(item._id, "inStock", !item.inStock)}
                        disabled={toggling === item._id}
                        className={`text-sm px-2 py-1 rounded-full font-medium ${toggling === item._id ? "opacity-50 cursor-not-allowed" : ""} ${
                          item.inStock
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {toggling === item._id ? "..." : item.inStock ? "In Stock" : "Out"}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        >
                          <HiPencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deleting === item._id}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === item._id ? <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : <HiTrash size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No menu items yet. Click "Add Item" to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
