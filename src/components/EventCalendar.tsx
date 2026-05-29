"use client";

import { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface CalendarOrder {
  date: string;
  count: number;
  total: number;
}

interface EventCalendarProps {
  orders: CalendarOrder[];
  onDateClick?: (date: string, count: number) => void;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EventCalendar({ orders, onDateClick }: EventCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const orderMap: Record<string, CalendarOrder> = {};
  orders.forEach((o) => {
    orderMap[o.date] = o;
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else { setMonth(month - 1); }
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else { setMonth(month + 1); }
  };

  const totalOrdersThisMonth = orders.reduce((s, o) => {
    const [y, m] = o.date.split("-");
    return parseInt(y) === year && parseInt(m) === month + 1 ? s + o.count : s;
  }, 0);

  const revenueThisMonth = orders.reduce((s, o) => {
    const [y, m] = o.date.split("-");
    return parseInt(y) === year && parseInt(m) === month + 1 ? s + o.total : s;
  }, 0);

  const cells: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, isCurrentMonth: false });
  }

  const dateKey = (day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-royal-gold/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-maroon to-royal-maroon-dark px-5 py-4">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="text-royal-gold hover:text-royal-gold-light p-1.5 rounded-lg hover:bg-white/10 transition">
            <HiChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h3 className="font-heading text-lg font-bold text-royal-gold">
              {MONTHS[month]} {year}
            </h3>
            <p className="text-royal-gold/60 text-xs">
              {totalOrdersThisMonth} events · ₹{revenueThisMonth.toLocaleString()}
            </p>
          </div>
          <button onClick={nextMonth} className="text-royal-gold hover:text-royal-gold-light p-1.5 rounded-lg hover:bg-white/10 transition">
            <HiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-3 pb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-3 pb-3">
        {cells.map((cell, i) => {
          const key = dateKey(cell.day);
          const order = orderMap[key];
          const isToday =
            cell.day === now.getDate() &&
            month === now.getMonth() &&
            year === now.getFullYear() &&
            cell.isCurrentMonth;

          return (
            <button
              key={i}
              aria-label={`${key}${order ? ` - ${order.count} orders` : ''}`}
              onClick={() => {
                if (cell.isCurrentMonth && order) {
                  onDateClick?.(key, order.count);
                }
              }}
              disabled={!cell.isCurrentMonth || !order}
              className={`relative flex flex-col items-center justify-center py-2 rounded-xl text-sm transition-all duration-200 ${
                !cell.isCurrentMonth
                  ? "text-gray-300 dark:text-gray-700"
                  : order
                    ? "hover:bg-royal-gold/10 cursor-pointer"
                    : "text-gray-400 dark:text-gray-600"
              } ${isToday ? "ring-2 ring-royal-gold" : ""}`}
            >
              <span className={`text-sm font-medium ${
                order ? "text-gray-800 dark:text-gray-200 font-bold" : ""
              }`}>
                {cell.day}
              </span>
              {order && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-royal-gold" />
                  <span className="text-[9px] font-bold text-royal-maroon dark:text-royal-gold">
                    {order.count}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4 text-[10px] text-gray-500 border-t border-royal-gold/10 pt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-royal-gold" /> Orders
        </span>
        <span>·</span>
        <span>Click date to view</span>
      </div>
    </div>
  );
}