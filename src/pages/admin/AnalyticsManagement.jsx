import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, DollarSign, ShoppingCart, TrendingUp, TrendingDown, 
  Download, Calendar, BrainCircuit, Target, Package, Zap
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AnalyticsManagement() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // '7', '30', '90', '365'
  const { showToast } = useToast() || {};

  useEffect(() => {
    const fetchTelemetry = async () => {
      setLoading(true);
      try {
        const [orderRes, prodRes] = await Promise.all([
          api.get('/orders').catch(() => api.get('/admin/orders')),
          api.get('/products')
        ]);
        setOrders(orderRes.data?.orders || orderRes.data?.data || orderRes.data || []);
        setProducts(prodRes.data?.products || prodRes.data?.data || prodRes.data || []);
      } catch (err) {
        showToast?.('Data Science pipeline synchronization failed.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, []);

  // --- DATA SCIENCE ENGINE (IN-BROWSER CRUNCHING) ---
  const analyticsData = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - parseInt(timeframe));

    // 1. Filter active temporal window
    const validOrders = orders.filter(o => 
      o.status !== 'cancelled' && 
      o.status !== 'returned' && 
      new Date(o.created_at) >= cutoffDate
    );

    // Previous window for velocity comparison
    const previousCutoff = new Date(cutoffDate);
    previousCutoff.setDate(cutoffDate.getDate() - parseInt(timeframe));
    const previousOrders = orders.filter(o => 
      o.status !== 'cancelled' && 
      new Date(o.created_at) >= previousCutoff && 
      new Date(o.created_at) < cutoffDate
    );

    // 2. Core KPIs
    const totalRevenue = validOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || o.total || 0), 0);
    const prevRevenue = previousOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || o.total || 0), 0);
    const revenueVelocity = prevRevenue ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const totalOrders = validOrders.length;
    const prevOrdersCount = previousOrders.length;
    const orderVelocity = prevOrdersCount ? ((totalOrders - prevOrdersCount) / prevOrdersCount) * 100 : 0;

    const aov = totalOrders ? totalRevenue / totalOrders : 0;
    const prevAov = prevOrdersCount ? prevRevenue / prevOrdersCount : 0;
    const aovVelocity = prevAov ? ((aov - prevAov) / prevAov) * 100 : 0;

    // 3. Time-Series Generation (Area Chart)
    const timeSeriesMap = {};
    validOrders.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!timeSeriesMap[dateStr]) timeSeriesMap[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
      timeSeriesMap[dateStr].revenue += parseFloat(o.total_amount || o.total || 0);
      timeSeriesMap[dateStr].orders += 1;
    });
    const timeSeriesData = Object.values(timeSeriesMap);

    // 4. Product Matrix Analysis (Bar Chart & Top Sellers)
    const productFrequency = {};
    validOrders.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach(item => {
          const name = item.name || item.product?.name || 'Unknown Node';
          if (!productFrequency[name]) productFrequency[name] = { name, revenue: 0, units: 0 };
          productFrequency[name].revenue += parseFloat(item.price * item.quantity);
          productFrequency[name].units += parseInt(item.quantity);
        });
      }
    });
    
    const topProducts = Object.values(productFrequency)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 5. Algorithmic Insights Generator
    const insights = [];
    if (revenueVelocity > 15) insights.push({ type: 'positive', text: `Revenue velocity is up ${revenueVelocity.toFixed(1)}%. Current marketing vectors are highly effective.` });
    else if (revenueVelocity < -10) insights.push({ type: 'negative', text: `Revenue contraction of ${Math.abs(revenueVelocity).toFixed(1)}% detected. Analyze recent traffic sources.` });
    
    if (aovVelocity > 5) insights.push({ type: 'positive', text: `Average Order Value climbed ${aovVelocity.toFixed(1)}%. Cross-selling strategies are yielding results.` });
    
    if (topProducts.length > 0) {
      insights.push({ type: 'neutral', text: `Hardware node '${topProducts[0].name}' accounts for the highest revenue density in this temporal window.` });
    }

    // Identify slow movers from full product list
    const activeProductNames = Object.keys(productFrequency);
    const slowMovers = products.filter(p => !activeProductNames.includes(p.name)).length;
    if (slowMovers > 0) {
      insights.push({ type: 'warning', text: `${slowMovers} hardware nodes generated zero volume in this timeframe. Consider flash sales or taxonomy repositioning.` });
    }

    return { totalRevenue, revenueVelocity, totalOrders, orderVelocity, aov, aovVelocity, timeSeriesData, topProducts, insights };
  }, [orders, products, timeframe]);

  // --- EXPORT PROTOCOL ---
  const exportAnalytics = () => {
    const ws1 = XLSX.utils.json_to_sheet([{ 
      'Timeframe (Days)': timeframe, 
      'Total Revenue (₹)': analyticsData.totalRevenue, 
      'Total Volume': analyticsData.totalOrders, 
      'AOV (₹)': analyticsData.aov.toFixed(2),
      'Revenue Velocity (%)': analyticsData.revenueVelocity.toFixed(2)
    }]);
    
    const ws2 = XLSX.utils.json_to_sheet(analyticsData.timeSeriesData);
    const ws3 = XLSX.utils.json_to_sheet(analyticsData.topProducts);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, ws1, "Macro Overview");
    XLSX.utils.book_append_sheet(workbook, ws2, "Time-Series Data");
    XLSX.utils.book_append_sheet(workbook, ws3, "Node Performance");
    
    XLSX.writeFile(workbook, `Anritvox_DataScience_Report_${timeframe}D_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast?.('Data Science Ledger Extracted', 'success');
  };

  const MetricCard = ({ title, value, velocity, icon: Icon, color, prefix = '' }) => (
    <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 blur-3xl -mr-10 -mt-10 group-hover:bg-${color}-500/10 transition-all`}></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{title}</p>
          <h4 className="text-3xl font-black text-white tracking-tighter mt-2">{prefix}{value}</h4>
          <div className="flex items-center gap-2 mt-3">
            <span className={`flex items-center gap-1 text-[10px] font-black ${velocity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {velocity >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
              {Math.abs(velocity).toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">vs previous {timeframe}d</span>
          </div>
        </div>
        <div className={`p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-${color}-500`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <BrainCircuit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Compiling Neural Analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Data <span className="text-purple-500">Science</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <Activity size={12} className="text-purple-500" /> Advanced Telemetry & Prediction Engine
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {[{v:'7', l:'7D'}, {v:'30', l:'30D'}, {v:'90', l:'3M'}, {v:'365', l:'1Y'}].map(t => (
              <button 
                key={t.v} onClick={() => setTimeframe(t.v)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeframe === t.v ? 'bg-purple-500/10 text-purple-400 shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                {t.l}
              </button>
            ))}
          </div>
          <button onClick={exportAnalytics} className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <Download size={14} /> Extract Ledger
          </button>
        </div>
      </div>

      {/* MACRO KPI METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Gross Revenue Volume" value={analyticsData.totalRevenue.toLocaleString()} velocity={analyticsData.revenueVelocity} icon={DollarSign} color="emerald" prefix="₹" />
        <MetricCard title="Transaction Volume" value={analyticsData.totalOrders.toLocaleString()} velocity={analyticsData.orderVelocity} icon={ShoppingCart} color="blue" />
        <MetricCard title="Average Node Value (AOV)" value={analyticsData.aov.toFixed(0).toLocaleString()} velocity={analyticsData.aovVelocity} icon={Target} color="purple" prefix="₹" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TIME SERIES VISUALIZATION */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <TrendingUp size={14} className="text-purple-500" /> Revenue Trajectory
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.timeSeriesData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#a855f7' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ALGORITHMIC INSIGHTS */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] p-6 shadow-2xl flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <BrainCircuit size={14} className="text-blue-500" /> Algorithmic Insights
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {analyticsData.insights.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-bold text-xs uppercase tracking-widest">Awaiting Data Vectors</div>
            ) : analyticsData.insights.map((insight, i) => {
              let config = { bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-slate-300', icon: Activity };
              if (insight.type === 'positive') config = { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: TrendingUp };
              if (insight.type === 'negative') config = { bg: 'bg-rose-500/5', border: 'border-rose-500/20', text: 'text-rose-400', icon: TrendingDown };
              if (insight.type === 'warning') config = { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', icon: Zap };
              
              const Icon = config.icon;
              return (
                <div key={i} className={`p-4 rounded-2xl border ${config.bg} ${config.border} flex items-start gap-3`}>
                  <Icon size={16} className={`mt-0.5 ${config.text} shrink-0`} />
                  <p className="text-xs font-bold leading-relaxed text-slate-300">{insight.text}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* HARDWARE PERFORMANCE MATRIX */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] p-6 shadow-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 flex items-center gap-2">
          <Package size={14} className="text-emerald-500" /> Node Performance Matrix (Top 5)
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={150} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#0f172a' }}
                contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
