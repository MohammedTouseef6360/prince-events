"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { HiTrash, HiMinus, HiPlus, HiBadgeCheck, HiClipboardList, HiMenu, HiShoppingCart, HiSun, HiMoon, HiChat } from "react-icons/hi";
import PDFDownload from "@/components/PDFDownload";

export default function CartPage() {
  const { t } = useLanguage();
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");
  const [amPm, setAmPm] = useState("AM");
  const [mealType, setMealType] = useState("Dinner");
  const [travelCharge, setTravelCharge] = useState(0);
  const [sending, setSending] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [waNumber, setWaNumber] = useState("918618648069");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d?.phone) setWaNumber(d.phone.replace(/\D/g, ""));
    }).catch(() => {});
  }, []);

  const total = subtotal + travelCharge;

  const formatOrderMessage = () => {
    let msg = `*New Order - PRINCE EVENTS*\n\n`;
    msg += `Name: ${customerName}\n`;
    msg += `Phone: ${phone}\n`;
    msg += `Wedding Date: ${date}\n`;
    msg += `Venue: ${venue}\n`;
    msg += `Time: ${time} ${amPm}\n`;
    msg += `Meal: ${mealType}\n\n`;
    msg += `Order Summary:\n`;
    msg += `─────────────────\n`;

    items.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} x${item.qty} = ₹${item.price * item.qty} (${item.pricingLabel})\n`;
    });

    msg += `─────────────────\n`;
    msg += `Subtotal: ₹${subtotal}\n`;
    if (travelCharge > 0) {
      msg += `Travel Charge: ₹${travelCharge}\n`;
    }
    msg += `Total: ₹${total}\n\n`;
    msg += `Thank you! We Serve You Smile!`;

    return encodeURIComponent(msg);
  };

  const handleSendWhatsApp = async () => {
    if (!customerName || !phone || !date || !venue || !time) {
      alert("Please fill in all customer information fields.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian phone number starting with 6-9.");
      return;
    }
    setSending(true);
    const message = formatOrderMessage();
    const url = `https://wa.me/${waNumber}?text=${message}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          date,
          venue,
          time: `${time} ${amPm}`,
          mealType,
          items: items.map((i) => ({
            itemName: i.name,
            qty: i.qty,
            price: i.price,
            pricingType: i.pricingType,
          })),
          travelCharge,
          subtotal,
          total,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to save order on server");
      }
      const order = await res.json();
      if (order._id) {
        localStorage.setItem("prince-events-last-order", order._id);
      }
    } catch (err: any) {
      setSubmitError(err?.message || "Something went wrong. Order saved locally but may not be on server.");
    }

    localStorage.setItem("prince-events-order-phone", phone);
    window.location.href = url;
    clearCart();
    localStorage.removeItem("prince-events-cart");
    setOrderPlaced(true);
    setSending(false);
  };

  if (orderPlaced) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
        <div className="max-w-lg mx-auto royal-card p-8 sm:p-12">
          {submitError && (
            <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
              {submitError}
            </div>
          )}
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <HiBadgeCheck className="text-green-500" size={36} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
            {t("my_orders.order_placed_success")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("my_orders.we_will_contact")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/my-orders"
              className="royal-btn-gold inline-flex items-center gap-2 px-8 py-3 text-lg"
            >
              <HiClipboardList size={20} />
              {t("my_orders.view_my_orders")}
            </Link>
            <Link
              href="/menu"
              className="royal-btn inline-flex items-center gap-2"
            >
              <HiMenu size={20} />
              {t("cart.browse_menu")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-royal-gold/10 flex items-center justify-center mx-auto mb-4">
          <HiShoppingCart className="text-royal-gold" size={40} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
          {t("cart.empty")}
        </h2>
        <Link href="/menu" className="royal-btn inline-flex items-center gap-2">
          <HiMenu size={18} />
          {t("cart.browse_menu")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold text-center mb-4 flex items-center justify-center gap-3">
        <HiShoppingCart size={32} />
        {t("cart.title")}
      </h1>
      <div className="gold-divider max-w-xs mx-auto mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Info */}
        <div className="royal-card p-6">
          <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
            {t("cart.customer_info")}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t("cart.name")}
              className="royal-input"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("cart.phone")}
              className="royal-input"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="royal-input"
            />
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder={t("cart.venue")}
              className="royal-input"
            />
            <div className="flex gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="royal-input flex-1"
              />
              <div className="flex rounded-xl border border-royal-gold/30 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setAmPm("AM")}
                  aria-label="Select AM"
                  className={`px-3 py-2 text-xs font-bold transition ${
                    amPm === "AM" ? "bg-royal-maroon text-white" : "bg-royal-cream dark:bg-gray-800 text-gray-600"
                  }`}
                >
                  <HiMoon size={14} className="inline mr-1" />AM
                </button>
                <button
                  type="button"
                  onClick={() => setAmPm("PM")}
                  aria-label="Select PM"
                  className={`px-3 py-2 text-xs font-bold transition ${
                    amPm === "PM" ? "bg-royal-maroon text-white" : "bg-royal-cream dark:bg-gray-800 text-gray-600"
                  }`}
                >
                  <HiSun size={14} className="inline mr-1" />PM
                </button>
              </div>
            </div>

            {/* Meal Type */}
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 -mb-2">Meal Type</p>
            <div className="flex gap-2">
              {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setMealType(meal)}
                  aria-label={meal}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mealType === meal
                      ? "bg-royal-gold text-royal-maroon shadow-md"
                      : "bg-royal-cream dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-royal-gold/20"
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="royal-card p-6">
          <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
            {t("cart.order_summary")}
          </h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{item.price} / {item.pricingLabel}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.key, item.qty - 1)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <HiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 1;
                      updateQty(item.key, Math.max(1, v));
                    }}
                    className="w-12 text-center text-sm font-bold bg-transparent border border-gray-200 dark:border-gray-600 rounded py-1"
                  />
                  <button
                    onClick={() => updateQty(item.key, item.qty + 1)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <HiPlus size={16} />
                  </button>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
                <div className="w-20 text-right font-bold">
                  ₹{item.price * item.qty}
                </div>
              </div>
            ))}
          </div>

          <div className="gold-divider" />

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>{t("cart.travel_charge")}:</span>
              <span>+ ₹{travelCharge}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>{t("cart.subtotal")}:</span>
              <span className="text-royal-maroon dark:text-royal-gold">
                ₹{subtotal}
              </span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>{t("cart.total")}:</span>
              <span className="text-royal-maroon dark:text-royal-gold">
                ₹{total}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSendWhatsApp}
              disabled={sending}
              className="flex-1 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <HiChat size={18} /> {t("cart.confirm_whatsapp")}
            </button>
            <PDFDownload
              order={{
                customerName,
                phone,
                date,
                venue,
                time: `${time} ${amPm}`,
                mealType,
                items: items.map((i) => ({
                  name: i.name,
                  qty: i.qty,
                  price: i.price,
                  pricingLabel: i.pricingLabel,
                })),
                subtotal,
                travelCharge,
                total,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
