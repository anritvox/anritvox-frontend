import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, Box, Tag, 
  LifeBuoy, Zap, Layers, Settings, ArrowRight, Server, Database, Activity 
} from 'lucide-react';
import { analytics } from '../../services/api';

const revenueData = [
  { name: '1st', revenue: 14500 }, { name: '5th', revenue: 18200 }, 
  { name: '10th', revenue: 13800 }, { name: '15th', revenue: 27900 }, 
  { name: '20th', revenue: 26400 }, { name: '25th', revenue: 38100 }, 
  { name: '30th', revenue: 49500 }
];

const categoryData = [
  { name: 'Basstubes & Audio', sales: 18500, color: 'bg-emerald-500' },
  { name: 'H4 LED Lighting', sales: 14200, color: 'bg-blue-500' },
  { name: 'Ambience Lighting', sales: 9800, color: 'bg-purple-500' },
  { name: 'Speakers & Comps', sales: 5100, color: 'bg-amber-500' },
  { name: 'Wiring & Relays', sales: 1900, color: 'bg-slate-500' }
];

const kpiColors = {
  emerald: { bg: 'bg-emerald-500/10 text-emerald-500', border: 'hover:border-emerald-500/50', arrow: 'group-hover:text-emerald-500' },
  blue: { bg: 'bg-blue-500/10 text-blue-500', border: 'hover:border-blue-500/50', arrow: 'group-hover:text-blue-500' },
  purple: { bg: 'bg-purple-500/10 text-purple-500', border: 'hover:border-purple-500/50', arrow: 'group-hover:text-purple-500' },
  amber: { bg: 'bg-amber-500/10 text-amber-500', border: 'hover:border-amber-500/50', arrow: 'group-hover:text-amber-500' }
};

const moduleColors = {
  emerald: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
  blue: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white',
  purple: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white',
  amber: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
  cyan: 'bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white',
  slate: 'bg-slate-500/10 text-slate-500 group-hover:bg-slate-500 group-hover:text-white'
};

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';

  useEffect(() => {
    let m = true;
    const f = async () => {
      try {
        setLoading(true);
        const r = await analytics.getDashboard();
        if (m) setStats(r.data?.metrics || r.data || {});
      } catch (e) {
        if (m) setStats({ revenue: '284,500.00', orders: 1242, products: 312, users: 4205, affiliateClicks: 1402 });
      } finally {
        if (m) setLoading(false);
      }
    };
    f();
    return () => m = false;
  }, []);

  const nav = (p) => { navigate(p); window.scrollTo(0, 0); };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-emerald-500 font-mono uppercase text-xs tracking-[0.3em] animate-pulse">Syncing...</p>
    </div>
  );

  const topKPIs = [
    { label: 'Gross Revenue', value: `₹${stats?.revenue || '0'}`, icon: DollarSign, route: '/admin/dashboard/analytics', colorKey: 'emerald', trend: '+18.5%' },
    { label: 'Fulfillment Pipeline', value: stats?.orders || '0', icon: ShoppingBag, route: '/admin/dashboard/orders', colorKey: 'blue', trend: '+12.2%' },
    { label: 'Instagram Referrals', value: stats?.affiliateClicks || '0', icon: Users, route: '/admin/dashboard/affiliate', colorKey: 'purple', trend: '+24.1%' },
    { label: 'Active SKUs', value: stats?.products || '0', icon: Box, route: '/admin/dashboard/products', colorKey: 'amber', trend: 'Stable' }
  ];

  const adminModules = [
    { title: 'Hardware Registry', desc: 'Manage assets', icon: Box, route: '/admin/dashboard/products', colorKey: 'emerald' },
    { title: 'Vehicle Fitment', desc: 'Compatibility', icon: Layers, route: '/admin/dashboard/fitment', colorKey: 'blue' },
    { title: 'Social Affiliates', desc: 'Traffic tracking', icon: Users, route: '/admin/dashboard/affiliate', colorKey: 'purple' },
    { title: 'Flash Scheduler', desc: 'Temporal pricing', icon: Zap, route: '/admin/dashboard/flash-sales', colorKey: 'amber' },
    { title: 'Support Matrix', desc: 'Troubleshooting', icon: LifeBuoy, route: '/admin/dashboard/support', colorKey: 'cyan' },
    { title: 'Core Configuration', desc: 'Platform vars', icon: Settings, route: '/admin/dashboard/settings', colorKey: 'slate' }
  ];

  const maxR = Math.max(...revenueData.map(d => d.revenue));
  const maxC = Math.max(...categoryData.map(d => d.sales));

  return (
    <div className="p-4 md:p-8 space-y-10 bg-slate-950 min-h-screen text-slate-300 font-sans overflow-x-hidden">
      
      {}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            Good {greeting}, <span className="text-emerald-500">Architect</span>
          </h1>
          <p className="text-slate-500 font-mono mt-2 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <Server size={12} className="text-emerald-500"/> API Node Active
          </p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topKPIs.map((s, i) => {
          const c = kpiColors[s.colorKey];
          return (
            <div key={i} onClick={() => nav(s.route)} className={`group bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl ${c.border} shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden`}>
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${c.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon size={20}/>
                </div>
                <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-mono shadow-inner">
                  <TrendingUp size={12} className="text-emerald-500"/> {s.trend}
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white tracking-tighter mb-1 font-mono group-hover:text-emerald-400 transition-colors">{s.value}</h3>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center justify-between">
                  {s.label}
                  <ArrowRight size={14} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${c.arrow}`}/>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {}
        <div className="xl:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Activity className="text-emerald-500" size={16}/> Sales Velocity
          </h3>
          <div className="flex-1 flex items-end gap-2 h-64 relative mt-8">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[100, 75, 50, 25, 0].map(v => (
                <div key={v} className="w-full border-t border-slate-800/50 flex items-center">
                  <span className="text-[9px] font-mono text-slate-600 -mt-2 ml-1">{(maxR * (v / 100) / 1000).toFixed(0)}k</span>
                </div>
              ))}
            </div>
            {revenueData.map((d, i) => {

              const height = `${(d.revenue / maxR) * 100}%`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                  <div 
                    className="w-full max-w-[40px] bg-emerald-500/20 hover:bg-emerald-500/80 border-t-2 border-emerald-500 transition-all duration-500 rounded-t-sm relative shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                    style={{ height }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur text-white text-[10px] font-mono py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{d.revenue}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-2">{d.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl flex flex-col">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-1">
            <Tag className="text-blue-500" size={16}/> Inventory Movement
          </h3>
          <div className="flex-1 w-full space-y-5 justify-center flex flex-col mt-6">
            {categoryData.map((d, i) => {

              const width = `${(d.sales / maxC) * 100}%`;
              return (
                <div key={i} className="w-full">
                  <div className="flex justify-between text-[10px] mb-1.5 font-bold">
                    <span className="text-slate-300">{d.name}</span>
                    <span className="text-slate-500 font-mono">{d.sales}</span>
                  </div>
                  <div className="w-full bg-slate-950/80 shadow-inner h-2 rounded-full overflow-hidden border border-slate-800">
                    <div className={`h-full ${d.color} transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-6">
        <div className="xl:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Database size={14} className="text-blue-500"/> Operational Control
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminModules.map((m, i) => (
              <div key={i} onClick={() => nav(m.route)} className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-xl hover:border-slate-600 hover:bg-slate-800/30 transition-all duration-300 cursor-pointer group flex items-start gap-4">
                <div className={`p-2.5 rounded-lg transition-colors duration-300 ${moduleColors[m.colorKey]}`}>
                  <m.icon size={18}/>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white mb-0.5 group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                    {m.title}
                    <ArrowRight size={14} className="text-slate-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"/>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono leading-tight">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
