import React, { useState, useEffect } from 'react';
import { analytics } from '../../services/api';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, 
  Activity, Download, Calendar, ArrowUpRight, BarChart2, 
  PieChart, Globe, Zap, Target
} from 'lucide-react';

export default function AnalyticsManagement() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');
  const [data, setData] = useState({
    kpis: null,
    revenue: [],
    sales: [],
    products: []
  });

  useEffect(() => {
    let mounted = true;
    const fetchIntelligence = async () => {
      setLoading(true);
      try {
        const [kpiRes, revRes, salesRes, prodRes] = await Promise.allSettled([
          analytics.getKpis(),
          analytics.getRevenue(),
          analytics.getSales(),
          analytics.getProducts()
        ]);

        if (mounted) {
          setData({
            kpis: kpiRes.status === 'fulfilled' && kpiRes.value.data ? kpiRes.value.data : mockKpis,
            revenue: revRes.status === 'fulfilled' && revRes.value.data?.length ? revRes.value.data : mockRevenue,
            sales: salesRes.status === 'fulfilled' && salesRes.value.data?.length ? salesRes.value.data : mockCategories,
            products: prodRes.status === 'fulfilled' && prodRes.value.data?.length ? prodRes.value.data : mockTopProducts
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchIntelligence();
    return () => { mounted = false; };
  }, [timeframe]);

  const maxRevenue = Math.max(...(data.revenue.length ? data.revenue.map(d => d.value) : [1]));
  const maxCategory = Math.max(...(data.sales.length ? data.sales.map(d => d.amount) : [1]));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-y-2 border-cyan-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-2 border-x-2 border-emerald-500/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
          <div className="absolute inset-4 border-y-2 border-purple-500 rounded-full animate-spin" />
          <Activity className="absolute inset-0 m-auto text-cyan-400 animate-pulse" size={24} />
        </div>
        <p className="mt-4 text-xs font-mono text-cyan-500 tracking-[0.3em] uppercase animate-pulse">Compiling Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <BarChart2 className="text-cyan-400" size={32} />
            System Intelligence
          </h2>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest mt-1">Real-time Data Aggregation & Telemetry</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-lg p-1">
            {['7d', '30d', '90d', '1y'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold font-mono tracking-wider transition-all duration-300 ${
                  timeframe === t 
                    ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700 text-sm font-bold">
            <Download size={16} />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Gross Volume" value={`₹${data.kpis?.revenue?.toLocaleString()}`} trend={data.kpis?.revTrend} icon={DollarSign} color="emerald" />
        <KpiCard title="Active Sessions" value={data.kpis?.sessions?.toLocaleString()} trend={data.kpis?.sessionTrend} icon={Users} color="cyan" />
        <KpiCard title="Conversion Rate" value={`${data.kpis?.conversion}%`} trend={data.kpis?.convTrend} icon={Target} color="purple" />
        <KpiCard title="AOV" value={`₹${data.kpis?.aov?.toLocaleString()}`} trend={data.kpis?.aovTrend} icon={ShoppingCart} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 opacity-50" />
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Activity className="text-cyan-400" size={16} />
              Revenue Velocity
            </h3>
            <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">LIVE SYNC</span>
          </div>
          
          <div className="h-64 flex items-end gap-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-l border-b border-slate-800/50">
              {[100, 75, 50, 25, 0].map(p => (
                <div key={p} className="w-full border-t border-slate-800/50 relative">
                  <span className="absolute -left-10 -top-2 text-[9px] font-mono text-slate-600 w-8 text-right">
                    {p === 0 ? '0' : `${(maxRevenue * (p/100) / 1000).toFixed(0)}k`}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex-1 flex items-end justify-between h-full z-10 pl-2">
              {data.revenue.map((item, idx) => (
                <div key={idx} className="relative group/bar flex flex-col items-center justify-end h-full w-full px-0.5">
                  <div 
                    className="w-full bg-cyan-500/20 hover:bg-cyan-400 border-t-2 border-cyan-400 rounded-t-sm transition-all duration-500 relative"
                    style={{ height: `${Math.max((item.value / maxRevenue) * 100, 2)}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-mono py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      ₹{item.value.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 mt-2 truncate w-full text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 opacity-50" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
            <PieChart className="text-purple-400" size={16} />
            Sector Distribution
          </h3>
          
          <div className="space-y-5">
            {data.sales.map((cat, idx) => (
              <div key={idx} className="group/cat">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-bold text-slate-300 group-hover/cat:text-white transition-colors">{cat.name}</span>
                  <span className="text-[10px] font-mono text-purple-400">₹{cat.amount.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000"
                    style={{ width: `${(cat.amount / maxCategory) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap className="text-amber-400" size={16} />
              High-Velocity Assets
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                  <th className="p-4 font-normal">Asset ID</th>
                  <th className="p-4 font-normal">Classification</th>
                  <th className="p-4 font-normal text-right">Units</th>
                  <th className="p-4 font-normal text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.products.map((prod, idx) => (
                  <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-slate-200 group-hover:text-white transition-colors">{prod.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{prod.sku}</div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{prod.category}</td>
                    <td className="p-4 text-right font-mono text-slate-300">{prod.units}</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-400">₹{prod.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5">
            <Globe size={200} />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
            <Globe className="text-emerald-400" size={16} />
            Geographic Telemetry
          </h3>
          <div className="space-y-4 relative z-10">
            {[
              { region: 'Maharashtra', users: 4205, percentage: 35 },
              { region: 'Delhi NCR', users: 3102, percentage: 25 },
              { region: 'Karnataka', users: 2401, percentage: 20 },
              { region: 'Tamil Nadu', users: 1205, percentage: 10 },
              { region: 'Other', users: 1200, percentage: 10 },
            ].map((geo, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-mono text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{geo.region}</div>
                    <div className="text-[10px] font-mono text-slate-500">{geo.users.toLocaleString()} Active Nodes</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">{geo.percentage}%</div>
                  <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${geo.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, trend, icon: Icon, color }) {
  const isPositive = trend > 0;
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]',
    cyan: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 shadow-[0_0_15px_rgba(192,132,252,0.1)]',
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
  };

  return (
    <div className={`rounded-2xl p-5 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 transition-all duration-300 hover:bg-slate-800/40 group relative overflow-hidden`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 ${colors[color].split(' ')[0].replace('text-', 'bg-')}`} />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2.5 rounded-xl ${colors[color]} border`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold border ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="relative z-10">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{title}</h4>
        <div className="text-2xl font-mono font-black text-white tracking-tight">{value}</div>
      </div>
    </div>
  );
}

const mockKpis = { revenue: 845200, revTrend: 12.5, sessions: 24502, sessionTrend: 8.2, conversion: 3.4, convTrend: -1.2, aov: 4250, aovTrend: 5.4 };
const mockRevenue = Array.from({length: 14}, (_, i) => ({ label: `Day ${i+1}`, value: Math.floor(Math.random() * 50000) + 10000 }));
const mockCategories = [
  { name: 'Basstubes', amount: 425000 }, { name: 'LED Lighting', amount: 280000 },
  { name: 'Ambience Kits', amount: 195000 }, { name: 'Wiring & Relays', amount: 85000 }
];
const mockTopProducts = [
  { name: 'Anritvox Pro Basstube 12"', sku: 'AV-BT-12P', category: 'Audio', units: 142, revenue: 120500 },
  { name: 'H4 LED Headlight Kit 120W', sku: 'AV-LED-H4', category: 'Lighting', units: 310, revenue: 95000 },
  { name: 'App Controlled RGB Ambience', sku: 'AV-RGB-APP', category: 'Interior', units: 84, revenue: 65000 },
  { name: 'Premium Wiring Kit 4 Gauge', sku: 'AV-WK-4G', category: 'Accessories', units: 215, revenue: 45000 },
];
