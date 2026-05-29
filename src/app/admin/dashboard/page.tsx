"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import EventCalendar from "@/components/EventCalendar";
import {
  HiMenu, HiPhotograph, HiStar, HiCog, HiClipboardList,
  HiTrendingUp, HiClock, HiBadgeCheck, HiTruck, HiShoppingBag,
  HiArrowRight, HiCurrencyRupee, HiChartBar, HiCalendar,
  HiFire, HiCash, HiUserGroup,
} from "react-icons/hi";

interface Order {
  _id: string; customerName: string; phone: string; date: string;
  venue: string; time: string; items: { itemName: string; qty: number; price: number }[];
  travelCharge: number; subtotal: number; total: number; status: string; createdAt: string;
}

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, confirmed: 0, preparing: 0, delivered: 0, totalItems: 0, revenue: 0 });
  const [calendarData, setCalendarData] = useState<{ date: string; count: number; total: number }[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("prince-events-admin");
      if (!isAdmin) router.push("/admin/login");
    }
    const checkRes = async (r: Response) => {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    };
    Promise.all([
      fetch("/api/orders").then(checkRes),
      fetch("/api/menu").then(checkRes),
    ]).then(([ordersData, menuItems]) => {
      setOrders(ordersData);
      const revenue = ordersData.reduce((s: number, o: any) => s + (o.total || 0), 0);
      setStats({
        totalOrders: ordersData.length,
        pending: ordersData.filter((o: any) => o.status === "pending").length,
        confirmed: ordersData.filter((o: any) => o.status === "confirmed").length,
        preparing: ordersData.filter((o: any) => o.status === "preparing").length,
        delivered: ordersData.filter((o: any) => o.status === "delivered").length,
        totalItems: menuItems.length,
        revenue,
      });
      const calMap: Record<string, { count: number; total: number }> = {};
      ordersData.forEach((o: any) => {
        if (o.date) {
          if (!calMap[o.date]) calMap[o.date] = { count: 0, total: 0 };
          calMap[o.date].count++;
          calMap[o.date].total += o.total || 0;
        }
      });
      setCalendarData(Object.entries(calMap).map(([date, d]) => ({ date, ...d })));
      setDashboardError("");
      setPageLoading(false);
    }).catch((e) => {
      setDashboardError(e instanceof Error ? e.message : "Failed to load dashboard data");
      setPageLoading(false);
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("prince-events-admin");
    router.push("/admin/login");
  };

  const adminLinks = [
    { href: "/admin/orders", label: t("admin.orders"), icon: HiClipboardList, desc: "View & manage orders", color: "from-blue-500 to-blue-600" },
    { href: "/admin/menu", label: t("admin.manage_menu"), icon: HiMenu, desc: "Add/edit menu items", color: "from-royal-maroon to-royal-maroon-light" },
    { href: "/admin/gallery", label: t("admin.gallery"), icon: HiPhotograph, desc: "Manage photos", color: "from-purple-500 to-purple-600" },
    { href: "/admin/testimonials", label: t("admin.testimonials"), icon: HiStar, desc: "Customer feedback", color: "from-yellow-500 to-yellow-600" },
    { href: "/admin/settings", label: t("admin.settings"), icon: HiCog, desc: "Business settings", color: "from-gray-600 to-gray-700" },
  ];

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: HiShoppingBag, color: "bg-royal-maroon" },
    { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: HiCurrencyRupee, color: "bg-green-600" },
    { label: "Pending", value: stats.pending, icon: HiClock, color: "bg-yellow-500" },
    { label: "Confirmed", value: stats.confirmed, icon: HiBadgeCheck, color: "bg-blue-500" },
    { label: "Preparing", value: stats.preparing, icon: HiTrendingUp, color: "bg-purple-500" },
    { label: "Delivered", value: stats.delivered, icon: HiTruck, color: "bg-green-500" },
  ];

  const statusDistribution = [
    { label: "Pending", value: stats.pending, color: "bg-yellow-500", percent: stats.totalOrders ? (stats.pending / stats.totalOrders) * 100 : 0 },
    { label: "Confirmed", value: stats.confirmed, color: "bg-blue-500", percent: stats.totalOrders ? (stats.confirmed / stats.totalOrders) * 100 : 0 },
    { label: "Preparing", value: stats.preparing, color: "bg-purple-500", percent: stats.totalOrders ? (stats.preparing / stats.totalOrders) * 100 : 0 },
    { label: "Delivered", value: stats.delivered, color: "bg-green-500", percent: stats.totalOrders ? (stats.delivered / stats.totalOrders) * 100 : 0 },
  ];

  const topItems: Record<string, { qty: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      if (!topItems[item.itemName]) topItems[item.itemName] = { qty: 0, revenue: 0 };
      topItems[item.itemName].qty += item.qty;
      topItems[item.itemName].revenue += item.price * item.qty;
    });
  });
  const sortedItems = Object.entries(topItems).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
  const maxQty = sortedItems.length ? sortedItems[0][1].qty : 1;

  const avgOrderValue = stats.totalOrders ? stats.revenue / stats.totalOrders : 0;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getDate()} ${date.toLocaleString("en", { month: "short" })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-royal-maroon to-royal-maroon-dark text-white px-6 py-5 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="font-heading text-2xl font-bold text-royal-gold tracking-wide">
            Admin Dashboard
          </h1>
          <p className="text-royal-gold/60 text-xs mt-0.5">
            PRINCE EVENTS — Business Analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white/70 hover:text-royal-gold text-sm transition">
            View Site
          </Link>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-2 border border-white/10">
            <HiCog size={14} /> {t("admin.logout")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardError && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>Error: {dashboardError}</span>
            <button onClick={() => setDashboardError("")} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
          </div>
        )}
        {pageLoading ? (
          <div className="space-y-6">
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="royal-card p-4 text-center">
                  <div className="skeleton w-12 h-12 rounded-xl mx-auto mb-3" />
                  <div className="skeleton h-6 w-16 mx-auto mb-1" />
                  <div className="skeleton h-3 w-20 mx-auto" />
                </div>
              ))}
            </div>
            {/* Analytics skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-8">
                {[1, 2].map((i) => (
                  <div key={i} className="royal-card p-6">
                    <div className="skeleton h-5 w-40 mb-4" />
                    <div className="skeleton h-20 w-full" />
                  </div>
                ))}
              </div>
              <div className="lg:col-span-2 space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="royal-card p-5">
                    <div className="skeleton h-5 w-32 mb-3" />
                    <div className="skeleton h-16 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="royal-card p-4 text-center hover:-translate-y-1 transition-all duration-300">
                <div className={`${stat.color} text-white rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-royal-maroon dark:text-royal-gold">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Main content: Quick Actions left, Analytics right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Quick Actions + Calendar */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold mb-4 flex items-center gap-2">
                <HiShoppingBag size={22} /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href} className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-royal-gold/10 hover:border-royal-gold/40 hover:shadow-xl transition-all duration-300">
                      <div className={`bg-gradient-to-br ${link.color} text-white p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-royal-maroon dark:text-royal-gold">{link.label}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{link.desc}</p>
                      </div>
                      <HiArrowRight className="text-gray-300 group-hover:text-royal-gold group-hover:translate-x-1 transition-all" size={20} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Event Calendar */}
            <div>
              <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold mb-4 flex items-center gap-2">
                <HiCalendar size={22} /> Event Calendar
              </h2>
              <EventCalendar
                orders={calendarData}
                onDateClick={(date, count) => {
                  router.push(`/admin/orders?date=${date}`);
                }}
              />
            </div>
          </div>

          {/* Right: Analytics Panel */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-heading text-xl font-bold text-royal-maroon dark:text-royal-gold mb-4 flex items-center gap-2">
              <HiChartBar size={22} /> Analytics
            </h2>

            {/* Avg Order Value */}
            <div className="royal-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-royal-gold/15 flex items-center justify-center">
                  <HiCash className="text-royal-gold" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average Order Value</p>
                  <p className="text-2xl font-bold text-royal-maroon dark:text-royal-gold">₹{avgOrderValue.toFixed(0)}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Total Revenue: ₹{stats.revenue.toLocaleString()}</span>
                <span>{stats.totalOrders} orders</span>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="royal-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <HiChartBar className="text-royal-gold" size={18} />
                <h3 className="font-bold text-sm text-royal-maroon dark:text-royal-gold">Order Status Distribution</h3>
              </div>
              <div className="space-y-3">
                {statusDistribution.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{s.label}</span>
                      <span className="font-bold text-royal-maroon dark:text-royal-gold">{s.value}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${s.color}`} style={{ width: `${s.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              {stats.totalOrders === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
              )}
            </div>

            {/* Top Items */}
            <div className="royal-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <HiFire className="text-royal-gold" size={18} />
                <h3 className="font-bold text-sm text-royal-maroon dark:text-royal-gold">Top Selling Items</h3>
              </div>
              {sortedItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No sales data yet</p>
              ) : (
                <div className="space-y-2">
                  {sortedItems.map(([name, data]) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{name}</p>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-royal-gold to-royal-gold-light rounded-full" style={{ width: `${(data.qty / maxQty) * 100}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-royal-maroon dark:text-royal-gold">x{data.qty}</p>
                        <p className="text-[10px] text-gray-400">₹{data.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Stats */}
            <div className="royal-card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <HiUserGroup className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Unique Customers</p>
                  <p className="text-2xl font-bold text-royal-maroon dark:text-royal-gold">
                    {new Set(orders.map((o) => o.phone)).size}
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="royal-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <HiCalendar className="text-royal-gold" size={18} />
                <h3 className="font-bold text-sm text-royal-maroon dark:text-royal-gold">Upcoming Events</h3>
              </div>
              {orders.filter((o) => o.status !== "delivered").slice(0, 4).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">All orders delivered</p>
              ) : (
                <div className="space-y-2">
                  {orders.filter((o) => o.status !== "delivered").slice(0, 4).map((o) => (
                    <div key={o._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{o.customerName}</p>
                        <p className="text-[10px] text-gray-500">{formatDate(o.date)} · {o.venue?.slice(0, 15)}...</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        o.status === "confirmed" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </>
      )}
      </div>
    </div>
  );
}