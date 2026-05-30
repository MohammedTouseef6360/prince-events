"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/lib/useSettings";
import PDFDownload from "@/components/PDFDownload";
import { HiSearch, HiBadgeCheck, HiClock, HiCog, HiTruck, HiHome, HiArrowLeft, HiDocumentDownload, HiEmojiSad, HiClipboardList, HiChat } from "react-icons/hi";

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
  status: "pending" | "confirmed" | "preparing" | "delivered";
  invoiceImage?: string;
  createdAt: string;
}

const statusSteps = [
  { key: "pending", icon: HiClock, label: "pending" },
  { key: "confirmed", icon: HiBadgeCheck, label: "confirmed" },
  { key: "preparing", icon: HiCog, label: "preparing" },
  { key: "delivered", icon: HiTruck, label: "delivered" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  delivered: "bg-green-500",
};

function OrderTracker({ status }: { status: string }) {
  const { t } = useLanguage();
  const currentIdx = statusSteps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {statusSteps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx <= currentIdx;
        const isLast = idx === statusSteps.length - 1;
        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2 flex-1">
            <div className={`flex flex-col items-center`}>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive ? statusColors[step.key] + " text-white shadow-lg scale-110" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                }`}
              >
                <Icon size={18} />
              </div>
              <span className={`text-[10px] sm:text-xs mt-1 font-medium text-center ${
                isActive ? "text-royal-maroon dark:text-royal-gold" : "text-gray-400"
              }`}>
                {t(`my_orders.${step.key}`)}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 flex-1 mt-[-1.5rem] sm:mt-[-1.75rem] ${
                idx < currentIdx ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MyOrdersPage() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPhone = localStorage.getItem("prince-events-order-phone");
    if (savedPhone) {
      setPhone(savedPhone);
      fetchOrders(savedPhone);
    }
  }, []);

  useEffect(() => {
    if (!phone) return;
    const interval = setInterval(() => fetchOrders(phone, true), 3000);
    return () => clearInterval(interval);
  }, [phone]);

  const fetchOrders = async (p: string, silent = false) => {
    if (!p) return;
    if (!silent) setLoading(true);
    setSearched(true);
    setError("");
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(p)}`);
      if (!res.ok) throw new Error("Failed to fetch orders. Please try again.");
      const data = await res.json();
      setOrders(data);
    } catch {
      if (!silent) setError("Network error. Please check your connection.");
    }
    if (!silent) setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("prince-events-order-phone", phone);
    fetchOrders(phone);
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold text-center mb-8 flex items-center justify-center gap-3">
        <HiClipboardList size={32} /> {t("my_orders.title")}
      </h1>
      <div className="gold-divider max-w-xs mx-auto" />

      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("my_orders.enter_phone")}
            className="royal-input flex-1"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="royal-btn flex items-center gap-2"
          >
            <HiSearch size={20} />
            {t("my_orders.lookup")}
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-10 h-10 border-4 border-royal-gold border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Searching orders...</p>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-md mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-5 py-4 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      {!loading && searched && orders.length === 0 && !error && (
        <div className="text-center py-12">
          <HiEmojiSad className="mx-auto mb-4 text-gray-300 dark:text-gray-600" size={60} />
          <p className="text-xl font-bold text-royal-maroon dark:text-royal-gold mb-2">
            {t("my_orders.empty")}
          </p>
          <Link href="/menu" className="royal-btn inline-flex items-center gap-2">
            <HiClipboardList size={18} /> {t("my_orders.browse_menu")}
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="royal-card overflow-hidden">
              <div className={`px-4 sm:px-6 py-3 flex items-center justify-between text-white ${statusColors[order.status]}`}>
                <span className="font-bold text-sm sm:text-base">
                  #{order._id.slice(-6)}
                </span>
                <span className="text-xs sm:text-sm opacity-90">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <OrderTracker status={order.status} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t("my_orders.customer")}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t("my_orders.phone")}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{order.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t("my_orders.date")}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t("my_orders.time")}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{order.time}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t("my_orders.venue")}</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{order.venue}</p>
                  </div>
                </div>

                <div className="gold-divider" />

                <div>
                  <p className="text-sm font-bold text-royal-maroon dark:text-royal-gold mb-2">
                    {t("my_orders.items")}
                  </p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.itemName} × {item.qty}
                        </span>
                        <span className="font-medium">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                  {order.travelCharge > 0 && (
                    <div className="flex justify-between text-sm mt-2 text-gray-500">
                      <span>Travel Charge</span>
                      <span>+ ₹{order.travelCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-royal-gold/20">
                    <span className="text-royal-maroon dark:text-royal-gold">{t("my_orders.total")}</span>
                    <span className="text-royal-maroon dark:text-royal-gold">₹{order.total}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-royal-gold/10 flex flex-wrap gap-2">
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
                    <button
                      onClick={() => {
                        const num = settings.phone.replace(/\D/g, "");
                        const msg = encodeURIComponent(`Hi, I have an order #${order._id.slice(-6)}`);
                        window.location.href = `https://wa.me/${num}?text=${msg}`;
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      <HiChat size={16} /> Chat on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link href="/" className="text-royal-maroon dark:text-royal-gold hover:underline inline-flex items-center gap-2">
          <HiArrowLeft size={18} />
          {t("my_orders.back_home")}
        </Link>
      </div>
    </div>
  );
}