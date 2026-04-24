import React, { useState, useEffect } from 'react';
import { analytics } from '../../services/api';
import {
  TrendingUp, TrendingDown, Activity, Users, ShoppingCart,
  DollarSign, Package, Calendar, RefreshCw, ArrowUpRight,
  BarChart3, ShieldCheck, Zap
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart as RechartsBarChart, Bar
} from 'recharts';

const FALLBACK = {
  revenue: 0,
  orders: 0,
  users: 0,
  conversion: 0,
  salesData: [
    { name: 'Week 1', total: 0 },
    { name: 'Week 2', total: 0 },
    { name: 'Week 3', total: 0 },
    { name: 'Week 4', total: 0 },
  ],
};

export default function AnalyticsManagement() {
  const [stats, setStats] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await analytics.getKpis(period);
      const d = res.data || {};
      setStats({
        revenue: d.revenue ?? d.totalRevenue ?? d.grossRevenue ?? 0,
        orders: d.orders ?? d.totalOrders ?? 0,
        users: d.users ?? d.totalUsers ?? d.activeUsers ?? 0,
        conversion: d.conversion ?? d.conversionRate ?? 0,
        salesData: Array.isArray(d.salesData) ? d.salesData
          : Array.isArray(d.dailyRevenue) ? d.dailyRevenue.map(x => ({ name: x.date || x.name, total: x.revenue || x.total || 0 }))
          : FALLBACK.salesData,
      });
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Could not load analytics data. Showing cached data.');
      // Keep existing stats on error
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => {
    const num = Number(n) || 0;
    if (num >= 100000) return '\u20b9' + (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return '\u20b9' + (num / 1000).toFixed(1) + 'K';
    return '\u20b9' + num.toFixed(2);
  };

  const fmtNum = (n) => {
    const num = Number(n) || 0;
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
  };

  const kpis = [
    { label: 'Gross Revenue', value: fmt(stats.revenue), icon: DollarSign, color: 'emerald', sub: `Last ${period} days` },
    { label: 'Total Orders', value: fmtNum(stats.orders), icon: ShoppingCart, color: 'blue', sub: `Last ${period} days` },
    { label: 'Active Users', value: fmtNum(stats.users), icon: Users, color: 'purple', sub: `Last ${period} days` },
    { label: 'Conv. Rate', value: (Number(stats.conversion) || 0).toFixed(1) + '%', icon: TrendingUp, color: 'amber', sub: 'Orders / Visits' },
  ];

  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Data Science</h2>
          <p className="text-slate-500 font-medium mt-1">Analytics & KPI Intelligence Command</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 365 days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-700 text-sm font-medium">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(({ label, value, icon: Icon, color, sub }) => {
          const c = colorMap[color];
          return (
            <div key={label} className={`bg-white p-6 rounded-3xl shadow-sm border ${c.border} flex items-center justify-between`}>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 mb-1">{label}</p>
                <h3 className="text-2xl font-black text-slate-900">{loading ? '...' : value}</h3>
                <p className="text-xs font-bold text-slate-400 mt-2">{sub}</p>
              </div>
              <div className={`w-12 h-12 ${c.bg} rounded-2xl flex items-center justify-center ${c.text}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-lg mb-6 uppercase tracking-tight">Revenue Trend</h3>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => '\u20b9' + (v >= 1000 ? (v/1000).toFixed(0) + 'K' : v)} />
              <Tooltip formatter={(v) => ['\u20b9' + Number(v).toLocaleString('en-IN'), 'Revenue']} />
              <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 col-span-1 md:col-span-3">
          <h3 className="font-black text-slate-900 text-lg mb-4 uppercase tracking-tight">Performance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-2xl">
              <div className="text-xl font-black text-slate-900">{loading ? '...' : fmt(stats.revenue)}</div>
              <div className="text-xs text-slate-400 font-bold mt-1 uppercase">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-2xl">
              <div className="text-xl font-black text-slate-900">{loading ? '...' : fmtNum(stats.orders)}</div>
              <div className="text-xs text-slate-400 font-bold mt-1 uppercase">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-2xl">
              <div className="text-xl font-black text-slate-900">{loading ? '...' : fmtNum(stats.users)}</div>
              <div className="text-xs text-slate-400 font-bold mt-1 uppercase">Active Users</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-2xl">
              <div className="text-xl font-black text-slate-900">{loading ? '...' : (Number(stats.conversion) || 0).toFixed(1) + '%'}</div>
              <div className="text-xs text-slate-400 font-bold mt-1 uppercase">Conversion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
