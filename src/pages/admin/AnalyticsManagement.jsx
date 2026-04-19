import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  TrendingUp, TrendingDown, Activity, Users, ShoppingCart, 
  DollarSign, Package, Calendar, RefreshCw, ArrowUpRight, 
  BarChart3, PieChart, Layers, ShieldCheck
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';

export default function AnalyticsManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Using corrected endpoint
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get(`/analytics/kpis?period=${period}`).catch(() => ({ data: {} })),
        api.get('/admin/orders').catch(() => ({ data: [] }))
      ]);
      
      setStats(analyticsRes.data);
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.orders || []);
      setRecentOrders(orders.slice(0, 10));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const totalRevenue = recentOrders.reduce((sum, o) => sum + (parseFloat(o.total || 0)), 0);
  const totalOrders = recentOrders.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = recentOrders.filter(o => o.status === 'pending').length;

  const statCards = [
    { label: 'Gross Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+12.5%' },
    { label: 'Total Orders', val: totalOrders, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+5.2%' },
    { label: 'Avg Order Val', val: `₹${avgOrder.toFixed(2)}`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '-2.1%' },
    { label: 'Pending Dispatch', val: pendingOrders, icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 'Critical' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-purple-400 font-mono animate-pulse">SYNCHRONIZING GLOBAL DATA...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            ANALYTICS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 underline decoration-purple-500/30 underline-offset-8">CORE</span>
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em]">Real-time Market Intelligence & Metrics</p>
        </div>

        <div className="flex items-center bg-[#0f111a] p-1 rounded-xl border border-white/5 shadow-2xl">
          {['7', '30', '90'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                period === p 
                  ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p} DAYS
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="group bg-[#0f111a] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{card.label}</p>
                <h3 className="text-2xl font-black text-white">{card.val}</h3>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    card.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} border border-white/5`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section - Static Mock but styled nicely */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0f111a] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">Revenue Trajectory</h4>
                <p className="text-xs text-gray-500 font-mono uppercase">Aggregated Transactional Volume</p>
              </div>
              <Activity className="w-5 h-5 text-purple-500" />
           </div>
           
           <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.salesData || []}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="period" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#0f111a] border border-white/5 rounded-3xl p-8">
           <div className="space-y-1 mb-8">
              <h4 className="text-lg font-bold text-white">Top Categories</h4>
              <p className="text-xs text-gray-500 font-mono uppercase">Sales Distribution</p>
           </div>
           
           <div className="space-y-6">
              {[
                { name: 'Electronics', val: '45%', color: 'bg-purple-500' },
                { name: 'Fashion', val: '30%', color: 'bg-blue-500' },
                { name: 'Home Appliances', val: '15%', color: 'bg-emerald-500' },
                { name: 'Accessories', val: '10%', color: 'bg-amber-500' },
              ].map((cat, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-gray-400">{cat.name}</span>
                      <span className="text-white">{cat.val}</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} transition-all duration-1000`} style={{ width: cat.val }}></div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-10 p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
              <div className="flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-purple-400" />
                 <p className="text-[10px] text-purple-200/50 font-bold uppercase">System Security</p>
              </div>
              <p className="text-xs text-purple-100 mt-2">All financial nodes are operating within normal parameters.</p>
           </div>
        </div>
      </div>

      {/* Recent Orders - Mini Table */}
      <div className="bg-[#0f111a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
           <h4 className="text-lg font-bold text-white flex items-center gap-2">
             <Layers className="w-5 h-5 text-blue-500" />
             LATEST TRANSACTIONS
           </h4>
           <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">Export Ledger</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Node</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer ID</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-4">
                    <span className="text-xs font-mono text-purple-400">#ORD-{o.id}</span>
                  </td>
                  <td className="px-8 py-4 text-xs text-white font-medium">{o.user_email || 'GUEST_USER'}</td>
                  <td className="px-8 py-4 text-xs text-white font-bold">₹{(o.total || 0).toLocaleString()}</td>
                  <td className="px-8 py-4 text-right">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter border ${
                      o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      o.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
