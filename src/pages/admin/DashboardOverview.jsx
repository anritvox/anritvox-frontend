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
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Package,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingCart,
  Shield,
  MessageSquare,
  Tag,
} from "lucide-react";

// Added onClick prop and attached it to the root div of the card
const StatCard = ({ title, count, icon: Icon, trend, trendValue, subtitle, color = "text-[#232f3e]", onClick }) => (
  <div onClick={onClick} className="bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-[0_2px_5px_0_rgba(213,217,217,.5)] hover:shadow-md transition-all group cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-[#f0f2f2] transition-colors">
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-[#007600]' : 'text-[#af2a2a]'}`}>
          {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-3xl font-bold text-[#111] tracking-tight">{count}</p>
      <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{subtitle}</p>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[#007185] group-hover:text-[#c45500]">
      <span className="text-xs font-bold">View details</span>
      <ArrowRight className="h-3 w-3" />
    </div>
  </div>
);

export default function DashboardOverview({ token, isRealTimeSync, setSection }) {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    warranties: 0,
    contacts: 0,
    users: 0,
    orders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      // Use dashboard endpoint for fast summary stats + individual endpoints for detailed data
      const [dashRes, wData, cData, pData, contactsData, usersData, ordersData] = await Promise.allSettled([
        fetchAdminDashboard(),
        fetchWarrantyAdmin(token),
        fetchCategories(token),
        fetchProductsAdmin(token),
        fetchContactsAdmin(token),
        fetchAdminUsers(token),
        fetchAdminOrders(token),
      ]);

      // Use dashboard API stats if available (more accurate - direct DB queries)
      const dashStats = dashRes.status === 'fulfilled' ? dashRes.value : null;

      const warranties = wData.status === 'fulfilled' ? (Array.isArray(wData.value) ? wData.value : (wData.value?.warranties || [])) : [];
      const categories = cData.status === 'fulfilled' ? (Array.isArray(cData.value) ? cData.value : (cData.value?.categories || [])) : [];
      const products = pData.status === 'fulfilled' ? (Array.isArray(pData.value) ? pData.value : (pData.value?.products || [])) : [];
      const contacts = contactsData.status === 'fulfilled' ? (Array.isArray(contactsData.value) ? contactsData.value : (contactsData.value?.contacts || contactsData.value?.messages || [])) : [];
      const users = usersData.status === 'fulfilled' ? (Array.isArray(usersData.value) ? usersData.value : []) : [];
      const orders = ordersData.status === 'fulfilled' ? (Array.isArray(ordersData.value) ? ordersData.value : []) : [];
      const pendingOrders = orders.filter(o => o.status === 'pending').length;

      setStats({
        warranties: warranties.length,
        categories: dashStats?.totalProducts !== undefined ? categories.length : categories.length,
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#232f3e]" />
        <span className="ml-3 text-gray-600">Analyzing dashboard metrics...</span>
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" count={stats.products} icon={Package} subtitle="IN CATALOG" color="text-purple-600" onClick={() => setSection("products")} />
        <StatCard title="Categories" count={stats.categories} icon={Tag} subtitle="ACTIVE" color="text-pink-600" onClick={() => setSection("categories")} />
        <StatCard title="Total Users" count={stats.users} icon={Users} subtitle="REGISTERED" color="text-teal-600" onClick={() => setSection("users")} />
        <StatCard title="Total Orders" count={stats.orders} icon={ShoppingCart} subtitle="ALL TIME" color="text-blue-600" onClick={() => setSection("orders")} />
        <StatCard title="Pending Orders" count={stats.pendingOrders} icon={Clock} subtitle="NEEDS ACTION" color="text-orange-600" trend={stats.pendingOrders > 0 ? 'up' : undefined} trendValue={stats.pendingOrders > 0 ? `${stats.pendingOrders} new` : ''} onClick={() => setSection("orders")} />
        <StatCard title="Total Revenue" count={`₹${parseFloat(stats.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`} icon={Activity} subtitle="EXCL. CANCELLED" color="text-green-600" onClick={() => setSection("orders")} />
        <StatCard title="Warranties" count={stats.warranties} icon={Shield} subtitle="REGISTERED" color="text-emerald-600" onClick={() => setSection("ewarranty")} />
        <StatCard title="Messages" count={stats.contacts} icon={MessageSquare} subtitle="RECEIVED" color="text-yellow-600" onClick={() => setSection("contacts")} />
      </div>

      <div className="bg-white rounded-lg border border-[#d5d9d9] shadow-[0_2px_5px_0_rgba(213,217,217,.5)] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-[#0f1111]">Recent Communications</h3>
          <button onClick={() => loadStats(false)} className="p-1.5 hover:bg-gray-200 rounded-md transition-all" >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f3f3f3] border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Message</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentContacts.map((contact, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-[#f8f8f8]">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#0f1111]">{contact.name}</div>
                    <div className="text-xs text-gray-500">{contact.email}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{contact.message}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{contact.created_at ? new Date(contact.created_at).toLocaleDateString('en-IN') : 'Today'}</td>
                  <td className="px-5 py-3"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">Pending</span></td>
                </tr>
              ))}
              {stats.recentContacts.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No recent messages found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 text-right">
          <a href="#" onClick={(e) => { e.preventDefault(); setSection("contacts"); }} className="text-sm text-[#007185] hover:text-[#c45500] font-bold">View all communications</a>
        </div>
      </div>
    </div>
  );
}
