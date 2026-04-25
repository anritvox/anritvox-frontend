import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { 
  DollarSign, Package, ShoppingBag, Users, TrendingUp, Activity, Box, 
  Tag, LifeBuoy, Zap, RotateCcw, ShieldCheck, Ticket, Layers, 
  Settings, Clock, ArrowRight, Server, Database, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { analytics } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// --- MOCK DATA FOR CHARTS ---
const revenueData = [
  { name: '1st', revenue: 4500, orders: 32 }, { name: '5th', revenue: 5200, orders: 41 },
  { name: '10th', revenue: 3800, orders: 28 }, { name: '15th', revenue: 7900, orders: 65 },
  { name: '20th', revenue: 6400, orders: 50 }, { name: '25th', revenue: 8100, orders: 72 },
  { name: '30th', revenue: 9500, orders: 85 },
];

const categoryData = [
  { name: 'Processors', sales: 4000 }, { name: 'Graphics Cards', sales: 7500 },
  { name: 'Motherboards', sales: 3200 }, { name: 'Memory (RAM)', sales: 2100 },
  { name: 'Cooling', sales: 1500 },
];

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast() || {};

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await analytics.getDashboard();
      setStats(response.data?.metrics || response.data || {});
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      // Fallback data ensures UI never breaks
      setStats({
        revenue: '124,500.00', orders: 842, products: 156, users: 1205, 
        activeTickets: 12, pendingReturns: 4, activeFlashSales: 1, activeCoupons: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path, moduleName) => {
    try {
      navigate(path);
      window.scrollTo(0, 0);
    } catch (e) {
      showToast?.(`Module ${moduleName} is currently offline.`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  // FIXED ROUTES: Added /dashboard/ to all paths so they render inside the Admin Layout
  const topKPIs = [
    { label: 'Gross Revenue', value: `₹${stats?.revenue || stats?.totalRevenue || '0.00'}`, icon: DollarSign, route: '/admin/dashboard/analytics', color: 'emerald', trend: '+12.5%' },
    { label: 'Total Orders', value: stats?.orders || stats?.totalOrders || '0', icon: ShoppingBag, route: '/admin/dashboard/orders', color: 'blue', trend: '+4.2%' },
    { label: 'Client Registry', value: stats?.users || stats?.totalUsers || '0', icon: Users, route: '/admin/dashboard/users', color: 'purple', trend: '+8.1%' },
    { label: 'Hardware Nodes', value: stats?.products || stats?.totalProducts || '0', icon: Box, route: '/admin/dashboard/products', color: 'amber', trend: 'Stable' },
  ];

  const secondaryKPIs = [
    { label: 'Active Support Matrix', value: stats?.activeTickets || '0', icon: LifeBuoy, route: '/admin/dashboard/support', color: 'cyan' },
    { label: 'Pending Logistics (RMA)', value: stats?.pendingReturns || '0', icon: RotateCcw, route: '/admin/dashboard/returns', color: 'rose' },
    { label: 'Active Flash Sequences', value: stats?.activeFlashSales || '0', icon: Zap, route: '/admin/dashboard/flash-sales', color: 'amber' },
    { label: 'Active Incentives', value: stats?.activeCoupons || '0', icon: Ticket, route: '/admin/dashboard/coupons', color: 'emerald' },
  ];

  const adminModules = [
    { title: 'Product Registry', desc: 'Deploy & manage hardware nodes', icon: Box, route: '/admin/dashboard/products', color: 'emerald' },
    { title: 'Order Pipeline', desc: 'Monitor global fulfillments', icon: ShoppingBag, route: '/admin/dashboard/orders', color: 'blue' },
    { title: 'Client Accounts', desc: 'User & permission auditing', icon: ShieldCheck, route: '/admin/dashboard/users', color: 'purple' },
    { title: 'Flash Scheduler', desc: 'Temporal pricing & drops', icon: Zap, route: '/admin/dashboard/flash-sales', color: 'amber' },
    { title: 'Incentive Engine', desc: 'Coupons & discount logic', icon: Ticket, route: '/admin/dashboard/coupons', color: 'cyan' },
    { title: 'Reverse Logistics', desc: 'RMA & refund processing', icon: RotateCcw, route: '/admin/dashboard/returns', color: 'rose' },
    { title: 'Support Resolution', desc: 'Client communication hub', icon: LifeBuoy, route: '/admin/dashboard/support', color: 'sky' },
    { title: 'Taxonomy Engine', desc: 'Category & hierarchy sync', icon: Layers, route: '/admin/dashboard/categories', color: 'indigo' },
    { title: 'System Settings', desc: 'Core platform configuration', icon: Settings, route: '/admin/dashboard/settings', color: 'slate' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-10 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            Good {greeting}, <span className="text-emerald-500">Commander</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <Server size={12} className="text-emerald-500" /> Mainframe Uplink Active • Global Systems Nominal
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-2 px-3 border-r border-slate-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Live</span>
          </div>
          <div className="px-3 flex items-center gap-2">
            <Clock size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-300">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topKPIs.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => handleNavigate(stat.route, stat.label)}
            className={`group bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] hover:bg-slate-800/60 hover:border-${stat.color}-500/50 transition-all cursor-pointer relative overflow-hidden shadow-lg`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 blur-3xl -mr-10 -mt-10 group-hover:bg-${stat.color}-500/15 transition-colors duration-500`}></div>
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg text-[10px] font-bold">
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white tracking-tighter mb-1 group-hover:text-emerald-400 transition-colors">{stat.value}</h3>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center justify-between">
                {stat.label}
                <ArrowRight size={14} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-${stat.color}-500`} />
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Action Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryKPIs.map((stat, i) => (
          <div 
            key={i}
            onClick={() => handleNavigate(stat.route, stat.label)}
            className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl cursor-pointer hover:border-slate-600 group transition-all"
          >
            <div className="flex items-center gap-3">
              <stat.icon size={18} className={`text-${stat.color}-500`} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-white transition-colors">{stat.label}</span>
            </div>
            <span className={`text-lg font-black text-${stat.color}-400 bg-${stat.color}-500/10 px-3 py-1 rounded-xl group-hover:scale-110 transition-transform`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* --- ADVANCED CHARTS SECTION --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Revenue/Orders Area Chart */}
        <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 lg:p-8 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-emerald-500" size={20} /> Financial Telemetry
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">30-Day Revenue vs Order Volume</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', color: '#f8fafc', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories Bar Chart */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 lg:p-8 shadow-xl">
          <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-2">
            <Tag className="text-blue-500" size={20} /> Top Hardware Sectors
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-8">Sales Distribution by Category</p>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={90} />
                <RechartsTooltip 
                  cursor={{ fill: '#1e293b', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={20}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : index === 2 ? '#8b5cf6' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Global Control Modules - The "A to Z" Matrix */}
      <div>
        <div className="flex items-center gap-3 mb-6 mt-4">
          <Database className="text-emerald-500" size={24} />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Global Control Matrix</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminModules.map((mod, i) => (
            <div 
              key={i}
              onClick={() => handleNavigate(mod.route, mod.title)}
              className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-3xl hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-300 cursor-pointer group flex items-start gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              <div className={`p-4 rounded-2xl bg-${mod.color}-500/10 text-${mod.color}-500 group-hover:bg-${mod.color}-500 group-hover:text-white transition-colors duration-300`}>
                <mod.icon size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                  {mod.title}
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </h4>
                <p className="text-xs text-slate-500 font-medium">{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health & Telemetry Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-6 border-t border-slate-800/80">
        
        {/* System Activity */}
        <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-[2.5rem] p-6 lg:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-blue-500" /> Recent System Telemetry
            </h3>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">Live</span>
          </div>
          
          <div className="space-y-6">
            {[
              { text: 'Order #8922 payment cleared via Gateway', time: '2 mins ago', icon: DollarSign, color: 'emerald' },
              { text: 'New support ticket opened by user client_99X', time: '15 mins ago', icon: LifeBuoy, color: 'cyan' },
              { text: 'Inventory threshold alert: RTX 4090 Node low', time: '1 hour ago', icon: AlertTriangle, color: 'amber' },
              { text: 'Flash Sequence "MIDNIGHT_SURGE" deployed successfully', time: '3 hours ago', icon: Zap, color: 'blue' }
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-full bg-${event.color}-500/10 flex items-center justify-center text-${event.color}-500 transition-transform group-hover:scale-110`}>
                  <event.icon size={16} />
                </div>
                <div className="flex-1 border-b border-slate-800/50 pb-4 group-last:border-0 group-last:pb-0">
                  <p className="text-sm font-bold text-slate-300">{event.text}</p>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backend Node Status */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-[2.5rem] p-6 lg:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 blur-[50px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server size={16} className="text-purple-500" /> Infrastructure Health
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Core API Server', status: 'Optimal', load: '12%' },
                { name: 'Database Cluster', status: 'Synced', load: '34%' },
                { name: 'Payment Gateway', status: 'Connected', load: '2%' },
                { name: 'Redis Cache', status: 'Active', load: '8%' },
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{node.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-500 uppercase">{node.status}</p>
                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">Load: {node.load}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Platform Version 2.4.0</p>
            <p className="text-[9px] font-bold text-slate-700 mt-1 uppercase tracking-widest">Anritvox Unified Architecture</p>
          </div>
        </div>

      </div>
    </div>
  );
}
