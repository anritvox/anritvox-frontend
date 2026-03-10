import React, { useState, useEffect, useCallback } from "react";
import {
  fetchWarrantyAdmin,
  fetchCategories,
  fetchProductsAdmin,
  fetchContactsAdmin,
} from "../../services/api";
import {
  Loader2, TrendingUp, TrendingDown, Activity,
  Users, Package, FileText, Calendar, Clock,
  ArrowRight, RefreshCw, MessageSquare, ShieldCheck,
  Layers, AlertCircle,
} from "lucide-react";

const StatCard = ({ title, count, icon: Icon, color, bg, onClick, subtitle }) => (
  <div
    onClick={onClick}
    className={`${bg} border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-white/15 transition-all group`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-xl ${bg}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <ArrowRight className="h-4 w-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
    </div>
    <p className="text-3xl font-bold text-white">{count}</p>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
    {subtitle && <p className="text-xs text-gray-700 mt-0.5">{subtitle}</p>}
  </div>
);

export default function DashboardOverview({ token, isRealTimeSync, setSection }) {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    warranties: 0,
    contacts: 0,
    recentContacts: [],
    activeWarranties: 0,
    pendingWarranties: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [w, c, p, contacts] = await Promise.all([
        fetchWarrantyAdmin(token),
        fetchCategories(token),
        fetchProductsAdmin(token),
        fetchContactsAdmin(token),
      ]);
      setStats({
        warranties: w.length,
        categories: c.length,
        products: p.length,
        contacts: contacts.length,
        recentContacts: contacts.slice(0, 5),
        activeWarranties: w.filter(x => x.status === 'active').length,
        pendingWarranties: w.filter(x => x.status === 'pending').length,
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadStats();
    if (isRealTimeSync) {
      const interval = setInterval(() => loadStats(false), 30000);
      return () => clearInterval(interval);
    }
  }, [loadStats, isRealTimeSync]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="animate-spin text-cyan-400" size={32} />
      <span className="text-gray-500 text-sm font-mono">Analyzing dashboard metrics...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 p-6">
      <AlertCircle className="text-red-400" size={32} />
      <p className="text-red-400 text-sm font-mono text-center">{error}</p>
      <button
        onClick={() => loadStats()}
        className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm hover:bg-cyan-500/30 transition-all flex items-center gap-2"
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  const statCards = [
    {
      title: "Total Products",
      count: stats.products,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/5",
      section: "products",
      subtitle: "Inventory items",
    },
    {
      title: "Categories",
      count: stats.categories,
      icon: Layers,
      color: "text-pink-400",
      bg: "bg-pink-500/5",
      section: "categories",
      subtitle: "Product groups",
    },
    {
      title: "Warranty Records",
      count: stats.warranties,
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/5",
      section: "ewarranty",
      subtitle: `${stats.activeWarranties} active · ${stats.pendingWarranties} pending`,
    },
    {
      title: "Contact Messages",
      count: stats.contacts,
      icon: MessageSquare,
      color: "text-amber-400",
      bg: "bg-amber-500/5",
      section: "contacts",
      subtitle: "Customer inquiries",
    },
  ];

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard <span className="text-cyan-400">Overview</span></h1>
          <p className="text-gray-500 text-sm mt-1">Real-time store analytics</p>
        </div>
        <button
          onClick={() => loadStats(false)}
          disabled={refreshing}
          className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-cyan-400 transition-all"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats Grid - clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <StatCard
            key={i}
            {...card}
            onClick={() => setSection && setSection(card.section)}
          />
        ))}
      </div>

      {/* Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Recent Messages</h2>
            <button
              onClick={() => loadStats(false)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-gray-600 hover:text-cyan-400 transition-all"
            >
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="border border-white/5 rounded-2xl overflow-hidden">
            {stats.recentContacts.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider hidden sm:table-cell">Message</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-600 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentContacts.map((contact, i) => (
                    <tr key={contact.id || i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-white">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-xs text-gray-500 truncate max-w-xs">{contact.message}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {stats.recentContacts.length > 0 && (
            <button
              onClick={() => setSection && setSection("contacts")}
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              View all messages <ArrowRight size={12} />
            </button>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Manage Inventory",   section: "products",   icon: Package,        color: "text-purple-400", bg: "bg-purple-500/5" },
              { label: "Manage Categories",  section: "categories", icon: Layers,         color: "text-pink-400",   bg: "bg-pink-500/5" },
              { label: "Warranty Records",   section: "ewarranty",  icon: ShieldCheck,    color: "text-emerald-400", bg: "bg-emerald-500/5" },
              { label: "Customer Messages",  section: "contacts",   icon: MessageSquare,  color: "text-amber-400",  bg: "bg-amber-500/5" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setSection && setSection(item.section)}
                className={`w-full flex items-center gap-3 px-4 py-3 ${item.bg} border border-white/5 rounded-xl hover:border-white/15 transition-all group`}
              >
                <item.icon size={16} className={item.color} />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{item.label}</span>
                <ArrowRight size={13} className="ml-auto text-gray-700 group-hover:text-gray-400" />
              </button>
            ))}
          </div>

          {/* Store link */}
          <a
            href="https://www.anritvox.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center gap-3 px-4 py-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/10 transition-all group"
          >
            <Activity size={16} className="text-cyan-400" />
            <span className="text-sm text-cyan-400">View Live Store</span>
            <ArrowRight size={13} className="ml-auto text-cyan-600 group-hover:text-cyan-400" />
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
