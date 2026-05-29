"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import PDFDownload from "@/components/PDFDownload";
import {
  HiCheck, HiCog, HiSearch, HiFilter, HiX,
  HiClock, HiShoppingBag, HiPhone, HiLocationMarker,
  HiCalendar, HiArrowLeft, HiChevronDown, HiTrash, HiSortAscending,
  HiPhotograph, HiEye,
} from "react-icons/hi";

interface OrderItem {
  itemName: string;
  qty: number;
  price: number;
  pricingType: string;
}

interface Order {
  _id: string;
  customerName: string;
  phone: string;
  date: string;
  venue: string;
  time: string;
  mealType?: string;
  items: OrderItem[];
  travelCharge: number;
  subtotal: number;
  total: number;
  status: string;
  invoiceImage?: string;
  createdAt: string;
}

const STATUS_TABS = ["all", "pending", "confirmed", "preparing", "delivered"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  preparing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "name-asc" | "name-desc";

function AdminOrdersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("date-desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("prince-events-admin");
    if (!isAdmin) router.push("/admin/login");
    fetchOrders();
  }, [router]);

  useEffect(() => {
    const d = searchParams.get("date");
    if (d) setDateFilter(d);
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setOrders(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch orders");
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingStatus(id);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(res.statusText);
      fetchOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status update failed");
    }
    setUpdatingStatus(null);
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm("Delete this order permanently?")) return;
    setDeletingOrder(id);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(res.statusText);
      fetchOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
    setDeletingOrder(null);
  };

  const handleInvoiceUpload = async (id: string, file: File) => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      if (!uploadData.url) throw new Error("No URL returned");
      const saveRes = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceImage: uploadData.url }),
      });
      if (!saveRes.ok) throw new Error("Save failed");
      setUploadTarget(null);
      fetchOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invoice upload failed");
    }
  };

  const sortOrders = useCallback((list: Order[]) => {
    const sorted = [...list];
    switch (sortBy) {
      case "date-desc": return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "date-asc": return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "amount-desc": return sorted.sort((a, b) => b.total - a.total);
      case "amount-asc": return sorted.sort((a, b) => a.total - b.total);
      case "name-asc": return sorted.sort((a, b) => a.customerName.localeCompare(b.customerName));
      case "name-desc": return sorted.sort((a, b) => b.customerName.localeCompare(a.customerName));
      default: return sorted;
    }
  }, [sortBy]);

  const filteredOrders = sortOrders(orders.filter((order) => {
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      order.customerName.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      order.venue.toLowerCase().includes(q);
    const matchDate = !dateFilter || order.date === dateFilter;
    return matchStatus && matchSearch && matchDate;
  }));

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "date-desc", label: "Newest First" },
    { key: "date-asc", label: "Oldest First" },
    { key: "amount-desc", label: "Highest Amount" },
    { key: "amount-asc", label: "Lowest Amount" },
    { key: "name-asc", label: "Name A-Z" },
    { key: "name-desc", label: "Name Z-A" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" },
    { value: "confirmed", label: "Confirmed", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
    { value: "preparing", label: "Preparing", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
    { value: "delivered", label: "Delivered", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white px-6 py-5 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/dashboard")} className="text-royal-gold hover:text-royal-gold-light p-1.5 rounded-lg hover:bg-white/10 transition">
            <HiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-royal-gold tracking-wide flex items-center gap-3">
              <HiShoppingBag size={24} />
              {t("admin.orders")}
            </h1>
            <p className="text-royal-gold/60 text-xs mt-0.5">{orders.length} total orders</p>
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
        {/* Search, Sort, Date Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone or venue..."
              className="royal-input pl-10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <HiX size={16} />
              </button>
            )}
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="royal-input w-auto"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter("")} className="text-red-500 text-sm hover:underline">
              Clear Date
            </button>
          )}
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              aria-label="Sort orders"
              className="royal-card px-4 py-2.5 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <HiSortAscending size={16} />
              {sortOptions.find((o) => o.key === sortBy)?.label}
              <HiChevronDown size={12} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-royal-gold/20 z-20 min-w-[170px] overflow-hidden animate-fade-in">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                      sortBy === opt.key ? "text-royal-maroon dark:text-royal-gold font-bold" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUS_TABS.map((status) => {
            const count = status === "all" ? orders.length : orders.filter((o) => o.status === status).length;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                aria-label={`Filter by ${status}`}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-royal-maroon text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-royal-maroon/10 border border-royal-gold/10"
                }`}
              >
                {status === "all" ? <HiFilter size={14} /> : <HiClock size={14} />}
                <span className="capitalize">{status}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Date filter notice */}
        {dateFilter && (
          <div className="bg-royal-gold/10 border border-royal-gold/30 rounded-xl px-4 py-2 mb-4 flex items-center gap-2 text-sm">
            <HiCalendar size={14} className="text-royal-gold" />
            <span className="text-gray-700 dark:text-gray-300">
              Showing orders for <strong>{dateFilter}</strong>
            </span>
            <button onClick={() => setDateFilter("")} className="ml-auto text-royal-maroon hover:underline text-xs font-bold">
              Clear Filter
            </button>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="royal-card p-6">
                <div className="flex gap-4">
                  <div className="skeleton h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="skeleton h-5 w-48" />
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <HiShoppingBag size={60} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              {searchQuery ? "No orders match your search" : dateFilter ? "No orders on this date" : "No orders yet"}
            </p>
            {(searchQuery || dateFilter) && (
              <button onClick={() => { setSearchQuery(""); setDateFilter(""); }} className="text-royal-gold text-sm mt-2 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrder === order._id;
              const ddOpen = statusDropdown === order._id;

              return (
                <div key={order._id} className="royal-card overflow-hidden transition-all duration-300">
                  {/* Order Header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                          order.status === "delivered" ? "bg-green-500" :
                          order.status === "preparing" ? "bg-purple-500" :
                          order.status === "confirmed" ? "bg-blue-500" : "bg-yellow-500"
                        }`}>
                          {order.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 truncate">
                              {order.customerName}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors[order.status]}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <HiPhone size={12} />
                              {order.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <HiCalendar size={12} />
                              {order.date}
                            </span>
                            <span className="font-bold text-royal-maroon dark:text-royal-gold">
                              ₹{order.total}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setStatusDropdown(ddOpen ? null : order._id);
                            }}
                            disabled={updatingStatus === order._id}
                            className="bg-white dark:bg-gray-800 border border-royal-gold/20 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-2 rounded-xl hover:border-royal-gold/50 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === order._id ? (
                              <div className="w-4 h-4 border-2 border-royal-gold border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <HiCog size={14} />
                            )}
                            {updatingStatus === order._id ? "Updating..." : "Update Status"}
                            <HiChevronDown size={12} />
                          </button>
                          {ddOpen && (
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-royal-gold/20 z-20 min-w-[160px] overflow-hidden animate-fade-in">
                              {statusOptions.map((opt) => {
                                if (opt.value === order.status) return null;
                                return (
                                  <button
                                    key={opt.value}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(order._id, opt.value);
                                      setStatusDropdown(null);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 ${opt.color}`}
                                  >
                                    <HiCheck size={12} />
                                    Mark as {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOrder(order._id);
                          }}
                          disabled={deletingOrder === order._id}
                          className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-500 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingOrder === order._id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <HiTrash size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 animate-slide-up border-t border-royal-gold/10">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <HiCalendar size={12} /> Event Date
                          </p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{order.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <HiClock size={12} /> Time
                          </p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{order.time} {order.mealType ? `· ${order.mealType}` : ""}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <HiLocationMarker size={12} /> Venue
                          </p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{order.venue}</p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800">
                              <th className="text-left px-4 py-2.5 text-xs text-gray-500 uppercase tracking-wider">Item</th>
                              <th className="text-center px-4 py-2.5 text-xs text-gray-500 uppercase tracking-wider">Qty</th>
                              <th className="text-right px-4 py-2.5 text-xs text-gray-500 uppercase tracking-wider">Rate</th>
                              <th className="text-right px-4 py-2.5 text-xs text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, i) => (
                              <tr key={i} className="border-t border-gray-100 dark:border-gray-700/50">
                                <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{item.itemName}</td>
                                <td className="text-center px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.qty}</td>
                                <td className="text-right px-4 py-2.5 text-gray-600 dark:text-gray-400">
                                  ₹{item.price}/{item.pricingType === "per_time" ? "time" : item.pricingType === "per_plate" ? "plate" : "pc"}
                                </td>
                                <td className="text-right px-4 py-2.5 font-bold text-gray-800 dark:text-gray-200">₹{item.price * item.qty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Travel + Total */}
                      <div className="flex flex-col items-end mt-2 space-y-1">
                        {order.travelCharge > 0 && (
                          <div className="text-sm text-gray-500">Travel Charge: +₹{order.travelCharge}</div>
                        )}
                        <div className="text-lg font-bold">
                          <span className="text-royal-maroon dark:text-royal-gold">Total: ₹{order.total}</span>
                        </div>
                      </div>

                      {/* Invoice Section */}
                      <div className="mt-4 pt-4 border-t border-royal-gold/10">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-bold">Invoice</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <PDFDownload
                            order={{
                              customerName: order.customerName,
                              phone: order.phone,
                              date: order.date,
                              venue: order.venue,
                              time: order.time,
                              items: order.items.map((i) => ({ name: i.itemName, qty: i.qty, price: i.price, pricingLabel: i.pricingType })),
                              subtotal: order.subtotal,
                              travelCharge: order.travelCharge,
                              total: order.total,
                            }}
                            invoiceImageUrl={order.invoiceImage}
                          />
                          {order.invoiceImage ? (
                            <a
                              href={order.invoiceImage}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold px-3 py-2 rounded-xl hover:bg-purple-100 transition flex items-center gap-1.5"
                            >
                              <HiEye size={14} /> View Uploaded Invoice
                            </a>
                          ) : (
                            <button
                              onClick={() => setUploadTarget(uploadTarget === order._id ? null : order._id)}
                              className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold px-3 py-2 rounded-xl hover:bg-amber-100 transition flex items-center gap-1.5"
                            >
                              <HiPhotograph size={14} /> Upload Invoice Image
                            </button>
                          )}
                        </div>
                        {uploadTarget === order._id && (
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleInvoiceUpload(order._id, file);
                              }}
                              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-royal-gold file:text-royal-maroon hover:file:bg-royal-gold-light"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-gray-900">
        <div className="animate-spin w-10 h-10 border-4 border-royal-gold border-t-transparent rounded-full" />
      </div>
    }>
      <AdminOrdersPage />
    </Suspense>
  );
}
