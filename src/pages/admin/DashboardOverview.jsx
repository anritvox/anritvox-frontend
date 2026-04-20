import React, { useState, useEffect, useCallback } from "react";
import {
  fetchWarrantyAdmin,
  fetchCategories,
  fetchProductsAdmin,
  fetchContactsAdmin,
  fetchAdminUsers,
  fetchAdminOrders,
  fetchAdminDashboard,
} from "../../services/api";
import {
  Loader2, TrendingUp, TrendingDown, Activity, Users, Package, 
  Clock, ArrowRight, RefreshCw, ShoppingCart, Shield, MessageSquare, Tag,
} from "lucide-react";

const StatCard = ({ title, count, icon: Icon, trend, trendValue, subtitle, color = "text-purple-400", onClick }) => (
  <div onClick={onClick} className="bg-[#0a0c10] p-6 rounded-3xl border border-white/5 shadow-2xl hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-300 group cursor-pointer relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110" />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="p-3 bg-black/40 rounded-xl group-hover:bg-purple-500/10 transition-colors border border-white/5">
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="space-y-1 relative z-10">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{title}</h3>
      <p className="text-4xl font-black text-white tracking-tight">{count}</p>
      <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{subtitle}</p>
    </div>
    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-gray-500 group-hover:text-purple-400 relative z-10 transition-colors">
      <span className="text-[10px] font-bold uppercase tracking-widest">Access Ledger</span>
      <ArrowRight className="h-4 w-4" />
    </div>
  </div>
);

// FIXED: Added setActiveTab to map to the global routing logic of AdminDashboard.jsx
export default function DashboardOverview({ token, isRealTimeSync, setActiveTab, setSection }) {
  const [stats, setStats] = useState({
    products: 0, categories: 0, warranties: 0, contacts: 0,
    users: 0, orders: 0, pendingOrders: 0, totalRevenue: 0,
    recentContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Route Handler to support both prop names
  const handleNavigation = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    else if (setSection) setSection(tab);
  };

  const extractData = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    return res.data || res.categories || res.products || res.warranties || res.contacts || res.messages || [];
  };

  const loadStats = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const [dashRes, wData, cData, pData, contactsData, usersData, ordersData] = await Promise.allSettled([
        fetchAdminDashboard(), fetchWarrantyAdmin(token), fetchCategories(token),
        fetchProductsAdmin(token), fetchContactsAdmin(token), fetchAdminUsers(token), fetchAdminOrders(token),
      ]);

      const dashStats = dashRes.status === 'fulfilled' ? (dashRes.value?.data || dashRes.value) : null;
      const warranties = wData.status === 'fulfilled' ? extractData(wData.value) : [];
      const categories = cData.status === 'fulfilled' ? extractData(cData.value) : [];
      const products = pData.status === 'fulfilled' ? extractData(pData.value) : [];
      const contacts = contactsData.status === 'fulfilled' ? extractData(contactsData.value) : [];
      const users = usersData.status === 'fulfilled' ? extractData(usersData.value) : [];
      const orders = ordersData.status === 'fulfilled' ? extractData(ordersData.value) : [];
      
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        warranties: warranties.length,
        categories: categories.length,
        products: dashStats?.totalProducts ?? products.length,
        contacts: contacts.length,
        users: dashStats?.totalUsers ?? users.length,
        orders: dashStats?.totalOrders ?? orders.length,
        pendingOrders: dashStats?.pendingOrders ?? pendingOrders,
        totalRevenue: dashStats?.totalRevenue ?? 0,
        recentContacts: contacts.slice(0, 5),
      });
    } catch (err) {
      console.error("Dashboard load error:", err);
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
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            SYSTEM <span className="text-purple-500">OVERVIEW</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">Real-time telemetry and infrastructure status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" count={stats.products} icon={Package} subtitle="IN CATALOG" color="text-emerald-400" onClick={() => handleNavigation("products")} />
        <StatCard title="Total Users" count={stats.users} icon={Users} subtitle="REGISTERED" color="text-blue-400" onClick={() => handleNavigation("users")} />
        <StatCard title="Total Orders" count={stats.orders} icon={ShoppingCart} subtitle="ALL TIME" color="text-cyan-400" onClick={() => handleNavigation("orders")} />
        <StatCard title="Total Revenue" count={`₹${parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`} icon={Activity} subtitle="EXCL. CANCELLED" color="text-purple-400" onClick={() => handleNavigation("orders")} />
        
        <StatCard title="Pending Orders" count={stats.pendingOrders} icon={Clock} subtitle="NEEDS ACTION" color="text-amber-400" trend={stats.pendingOrders > 0 ? 'up' : undefined} trendValue={stats.pendingOrders > 0 ? `${stats.pendingOrders} NEW` : ''} onClick={() => handleNavigation("orders")} />
        <StatCard title="Warranties" count={stats.warranties} icon={Shield} subtitle="REGISTERED" color="text-green-400" onClick={() => handleNavigation("ewarranty")} />
        <StatCard title="Categories" count={stats.categories} icon={Tag} subtitle="ACTIVE" color="text-pink-400" onClick={() => handleNavigation("categories")} />
        <StatCard title="Messages" count={stats.contacts} icon={MessageSquare} subtitle="RECEIVED" color="text-rose-400" onClick={() => handleNavigation("contacts")} />
      </div>

      <div className="bg-[#0a0c10] rounded-[30px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">Recent Communications</h3>
          <button onClick={() => loadStats(false)} className="p-2 hover:bg-white/5 text-gray-500 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10" >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 border-b border-white/5">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Transmission Source</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Data Packet</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recentContacts.map((contact, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-white text-sm">{contact.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">{contact.email}</div>
                  </td>
                  <td className="px-8 py-5 text-gray-400 text-sm max-w-xs truncate">{contact.message}</td>
                  <td className="px-8 py-5 text-gray-500 font-mono text-xs">{contact.created_at ? new Date(contact.created_at).toLocaleDateString('en-IN') : 'Today'}</td>
                  <td className="px-8 py-5">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Pending</span>
                  </td>
                </tr>
              ))}
              {stats.recentContacts.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500 text-xs font-bold uppercase tracking-widest">No recent communications detected.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 border-t border-white/5 flex justify-end bg-black/20">
          <button onClick={() => handleNavigation("contacts")} className="text-[10px] text-purple-400 hover:text-purple-300 font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
            View All Communications <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
