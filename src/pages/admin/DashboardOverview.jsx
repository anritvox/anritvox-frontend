import React, { useState, useEffect, useCallback } from "react";
import {
  fetchWarrantyAdmin,
  fetchCategories,
  fetchProductsAdmin,
  fetchContactsAdmin,
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
} from "lucide-react";

const StatCard = ({ title, count, icon: Icon, trend, trendValue, subtitle }) => (
  <div className="bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-[0_2px_5px_0_rgba(213,217,217,.5)] hover:shadow-md transition-all group cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-gray-50 rounded-lg group-hover:bg-[#f0f2f2] transition-colors">
        <Icon className="h-6 w-6 text-[#232f3e]" />
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

export default function DashboardOverview({ token, isRealTimeSync }) {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    warranties: 0,
    contacts: 0,
    recentContacts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [wData, cData, pData, contactsData] = await Promise.all([
        fetchWarrantyAdmin(token),
        fetchCategories(token),
        fetchProductsAdmin(token),
        fetchContactsAdmin(token),
      ]);

      // Normalize data as API might return { warranties: [...] } or direct array
      const warranties = Array.isArray(wData) ? wData : (wData.warranties || []);
      const categories = Array.isArray(cData) ? cData : (cData.categories || []);
      const products = Array.isArray(pData) ? pData : (pData.products || []);
      const contacts = Array.isArray(contactsData) ? contactsData : (contactsData.contacts || contactsData.messages || []);

      setStats({
        warranties: warranties.length,
        categories: categories.length,
        products: products.length,
        contacts: contacts.length,
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
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-10 w-10 text-[#c45500] animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Analyzing dashboard metrics...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in p-2">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          count={stats.products} 
          icon={Package} 
          subtitle="Inventory items" 
          trend="up" 
          trendValue="+4.2%" 
        />
        <StatCard 
          title="Categories" 
          count={stats.categories} 
          icon={Activity} 
          subtitle="Store departments" 
        />
        <StatCard 
          title="Active Warranties" 
          count={stats.warranties} 
          icon={FileText} 
          subtitle="Customer registrations" 
          trend="up" 
          trendValue="+12%" 
        />
        <StatCard 
          title="Customer Enquiries" 
          count={stats.contacts} 
          icon={Users} 
          subtitle="Unresolved messages" 
          trend="down" 
          trendValue="-2.5%" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Messages Table */}
        <div className="xl:col-span-2 bg-white border border-[#d5d9d9] rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="font-bold text-[#111]">Recent Communications</h3>
            <button 
              onClick={() => loadStats(false)} 
              className="p-1.5 hover:bg-gray-200 rounded-md transition-all"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f0f2f2] text-gray-600 font-bold border-b border-[#e7e9ec]">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentContacts.map((contact, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#007185] group-hover:text-[#c45500]">{contact.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{contact.email}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-600">{contact.message}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Today
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold border border-yellow-200 uppercase">Pending</span>
                    </td>
                  </tr>
                ))}
                {stats.recentContacts.length === 0 && (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">No recent messages found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <button className="text-xs font-bold text-[#007185] hover:underline">View all communications</button>
          </div>
        </div>

        {/* System Activity Sidebar */}
        <div className="bg-white border border-[#d5d9d9] rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#111] mb-6 flex items-center gap-2 pb-4 border-b">
            <Clock className="h-5 w-5 text-[#c45500]" /> System Activity
          </h3>
          <div className="space-y-6">
            {[
              { time: "2 min ago", desc: "Category 'Electronics' updated", type: "system" },
              { time: "45 min ago", desc: "New product 'RT-100' added", type: "product" },
              { time: "2 hours ago", desc: "Database backup completed", type: "backup" },
              { time: "5 hours ago", desc: "Admin login from IP 192.168.1.1", type: "security" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                {i !== 3 && <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-100" />}
                <div className={`h-4 w-4 rounded-full mt-1 border-2 border-white shadow-sm flex-shrink-0 ${
                  activity.type === 'security' ? 'bg-red-500' : 'bg-[#c45500]'
                }`} />
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-tight">{activity.desc}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tighter">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
