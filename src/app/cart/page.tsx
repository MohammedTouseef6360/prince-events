"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { HiTrash, HiMinus, HiPlus, HiBadgeCheck, HiClipboardList, HiMenu, HiShoppingCart, HiSun, HiMoon, HiChat, HiPencil } from "react-icons/hi";
import dynamic from "next/dynamic";
const PDFDownload = dynamic(() => import("@/components/PDFDownload"), { ssr: false });

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
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [waNumber, setWaNumber] = useState("918618648069");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const venueRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const formStartRef = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

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
    msg += `Time: ${time}\n`;
    msg += `Meal: ${mealType}\n`;
    if (note.trim()) msg += `Note: ${note}\n`;
    msg += `\nOrder Summary:\n`;
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
    const newErrors: { [key: string]: string } = {};
    if (!customerName.trim()) newErrors.customerName = "Please enter your name.";
    if (!phone.trim()) newErrors.phone = "Please enter your phone number.";
    else if (!/^[6-9]\d{9}$/.test(phone)) newErrors.phone = "Please enter a valid 10-digit Indian phone number starting with 6-9.";
    if (!date) newErrors.date = "Please select your wedding date.";
    if (!venue.trim()) newErrors.venue = "Please enter the venue.";
    if (!time) newErrors.time = "Please select the event time.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstField = ["customerName", "phone", "date", "venue", "time"].find((k) => newErrors[k]);
      if (firstField === "customerName") nameRef.current?.focus();
      else if (firstField === "phone") phoneRef.current?.focus();
      else if (firstField === "date") dateRef.current?.focus();
      else if (firstField === "venue") venueRef.current?.focus();
      else if (firstField === "time") timeRef.current?.focus();
      return;
    }
    setErrors({});
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
        time: `${time}`,
        mealType,
          note: note.trim() || undefined,
          items: items.map((i) => ({
            itemName: i.name,
            qty: i.qty,
            price: i.price,
            pricingType: i.pricingType,
          })),
          travelCharge,
          subtotal,
          total,
          website: honeypotRef.current?.value || "",
          formMs: Date.now() - formStartRef.current,
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
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
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
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 text-center animate-fade-in">
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
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-royal-maroon dark:text-royal-gold text-center mb-4">
        {t("cart.title")}
      </h1>
      <div className="gold-divider max-w-xs mx-auto mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customer Info */}
        <div className="royal-card p-6 animate-slide-up">
          <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
            {t("cart.customer_info")}
          </h2>
          <div className="space-y-4">
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website-field">Website</label>
              <input
                id="website-field"
                type="text"
                ref={honeypotRef}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("cart.name")}
              </label>
              <input
                id="customer-name"
                ref={nameRef}
                type="text"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); clearError("customerName"); }}
                placeholder={t("cart.name")}
                aria-invalid={!!errors.customerName}
                className={`royal-input ${errors.customerName ? "border-red-500" : ""}`}
              />
              {errors.customerName && <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("cart.phone")}
              </label>
              <input
                id="customer-phone"
                ref={phoneRef}
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                placeholder={t("cart.phone")}
                aria-invalid={!!errors.phone}
                className={`royal-input ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("cart.date")}
              </label>
              <input
                id="event-date"
                ref={dateRef}
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); clearError("date"); }}
                aria-invalid={!!errors.date}
                className={`royal-input ${errors.date ? "border-red-500" : ""}`}
              />
              {errors.date && <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label htmlFor="event-venue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("cart.venue")}
              </label>
              <input
                id="event-venue"
                ref={venueRef}
                type="text"
                value={venue}
                onChange={(e) => { setVenue(e.target.value); clearError("venue"); }}
                placeholder={t("cart.venue")}
                aria-invalid={!!errors.venue}
                className={`royal-input ${errors.venue ? "border-red-500" : ""}`}
              />
              {errors.venue && <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.venue}</p>}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t("cart.time")}
                </label>
                <input
                  id="event-time"
                  ref={timeRef}
                  type="time"
                  value={time}
                  onChange={(e) => { setTime(e.target.value); clearError("time"); }}
                  aria-invalid={!!errors.time}
                  className={`royal-input w-full ${errors.time ? "border-red-500" : ""}`}
                />
                {errors.time && <p role="alert" className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.time}</p>}
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">AM / PM</span>
                <div className="flex rounded-xl border border-royal-gold/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAmPm("AM")}
                    aria-label="Select AM"
                    aria-pressed={amPm === "AM"}
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
                    aria-pressed={amPm === "PM"}
                    className={`px-3 py-2 text-xs font-bold transition ${
                      amPm === "PM" ? "bg-royal-maroon text-white" : "bg-royal-cream dark:bg-gray-800 text-gray-600"
                    }`}
                  >
                    <HiSun size={14} className="inline mr-1" />PM
                  </button>
                </div>
              </div>
            </div>

            {/* Meal Type */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Meal Type</legend>
              <div className="flex gap-2">
                {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setMealType(meal)}
                    aria-label={meal}
                    aria-pressed={mealType === meal}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      mealType === meal
                        ? "bg-royal-gold text-royal-maroon"
                        : "bg-royal-cream dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-royal-gold/20"
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Add Note */}
            <div className="border border-royal-gold/20 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setNoteOpen(!noteOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-royal-gold/5 transition"
              >
                <span className="flex items-center gap-2">
                  <HiPencil className="text-royal-gold" size={16} />
                  {note ? "Edit Note" : "Add a Note"}
                </span>
                <svg className={`w-4 h-4 transition-transform ${noteOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {noteOpen && (
                <div className="px-4 pb-4 animate-slide-up">
                  <label htmlFor="order-note" className="sr-only">
                    {note ? "Edit Note" : "Add a Note"}
                  </label>
                  <textarea
                    id="order-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any special requests or additional information..."
                    className="royal-input h-20 resize-none text-sm"
                  />
                </div>
              )}
            </div>
            {note && !noteOpen && (
              <p className="text-xs text-royal-gold italic truncate px-1">
                Note: {note}
              </p>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="royal-card p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold mb-4">
            {t("cart.order_summary")}
          </h2>
          <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-scale-in"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    ₹{item.price} / {item.pricingLabel}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => updateQty(item.key, item.qty - 1)}
                    className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600"
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
                    className="w-14 text-center text-sm font-bold bg-transparent border border-gray-200 dark:border-gray-600 rounded py-2"
                  />
                  <button
                    onClick={() => updateQty(item.key, item.qty + 1)}
                    className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <HiPlus size={16} />
                  </button>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
                <div className="w-20 text-right font-bold text-royal-maroon dark:text-royal-gold">
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
              <span className="text-royal-maroon dark:text-royal-gold text-2xl">
                ₹{total}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSendWhatsApp}
              disabled={sending}
              className="royal-btn-accent mobile-full-cta flex-1"
            >
              <HiChat size={18} /> {t("cart.confirm_whatsapp")}
            </button>
            <PDFDownload
              order={{
                customerName,
                phone,
                date,
                venue,
                time: `${time}`,
                mealType,
                note: note.trim() || undefined,
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
