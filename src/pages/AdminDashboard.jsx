import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Logout, LayoutDashboard, Package, Grid, Users, Settings,
  ShoppingBag, Menu, X, Shield, RefreshCw, Tag,
  Archive, Star, Activity, Mail, Terminal, Bell, Search,
  Zap, Gift, Share2, Headphones, ShieldCheck, BarChart3,
  Truck, Database, FileText, Cpu, Eye, CheckCircle, AlertTriangle,
  Clock, Download, Upload, Percent, Layers, MousePointer2
} from 'lucide-react';

// Advanced Sub-Modules (Mocked for visual/logical framework)
const LiveActivityStream = () => (
  <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-6">
    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center">
      <Eye size={20} className="mr-2 text-emerald-500" /> Real-time Node Activity
    </h3>
    <div className="space-y-4 font-mono text-[10px]">
      {[
        'User #2940 added H4 LED to cart - 2s ago',
        'Guest #8812 viewing Fitment Engine - 5s ago',
        'Order #V8812 completed via Wallet - 12s ago',
        'Bulk CSV Import: 450 items synced - 1m ago'
      ].map((log, i) => (
        <div key={i} className="flex items-center space-x-2 text-slate-500">
          <span className="text-emerald-500">▶</span> <span>{log}</span>
        </div>
      ))}
    </div>
  </div>
);

const LowStockDashboard = () => (
  <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-6">
     <h3 className="text-xl font-black uppercase tracking-tighter flex items-center">
      <AlertTriangle size={20} className="mr-2 text-amber-500" /> Critical Inventory Alerts
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { name: 'Anritvox Pro LED V2', stock: 4, thresh: 10 },
        { name: 'Underglow App Kit', stock: 2, thresh: 5 },
        { name: 'H7 Replacement', stock: 0, thresh: 20 },
        { name: 'T10 Park Lights', stock: 8, thresh: 15 }
      ].map((item, i) => (
        <div key={i} className="p-4 bg-black/40 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-xs font-black uppercase text-white">{item.name}</div>
            <div className="text-[10px] text-slate-500">Stock: {item.stock} / Min: {item.thresh}</div>
          </div>
          <button className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-lg">Restock</button>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast() || {};
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuSections = [
    {
      title: 'Operations',
      items: [
        { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory (Low Stock)', icon: Package },
        { id: 'orders', label: 'Order Pipeline', icon: ShoppingBag },
        { id: 'fitment', label: 'Fitment Engine Data', icon: Cpu },
      ]
    },
    {
      title: 'Marketing & CRM',
      items: [
        { id: 'coupons', label: 'Complex Promotions', icon: Percent },
        { id: 'rewards', label: 'Loyalty Tiers', icon: Gift },
        { id: 'reviews', label: 'Moderation Queue', icon: Star },
        { id: 'banners', label: 'Dynamic Scheduler', icon: Layers },
      ]
    },
    {
      title: 'System & Logs',
      items: [
        { id: 'analytics', label: 'Intelligence Lab', icon: BarChart3 },
        { id: 'activity', label: 'Live Stream', icon: Activity },
        { id: 'csv', label: 'Bulk CSV Tool', icon: Upload },
        { id: 'settings', label: 'System Toggles', icon: Settings },
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans">
      {/* 1. SIDEBAR (Role-Based View) */}
      <aside className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-20'} flex flex-col`}>
        <div className="p-8 flex items-center space-x-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black">A</div>
          {isSidebarOpen && <span className="text-xl font-black tracking-tighter italic uppercase">Admin v4.2</span>}
        </div>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {menuSections.map((sec, i) => (
            <div key={i}>
              {isSidebarOpen && <h4 className="text-[10px] font-black uppercase text-slate-600 mb-4 px-4 tracking-[0.3em]">{sec.title}</h4>}
              <div className="space-y-1">
                {sec.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all ${
                      activeTab === item.id ? 'bg-emerald-500 text-black font-black' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon size={20} />
                    {isSidebarOpen && <span className="text-xs uppercase tracking-widest">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center space-x-4 px-4 py-3 text-rose-500 font-black uppercase text-xs">
             <Logout size={20} />
             {isSidebarOpen && <span>Secure Logout</span>}
           </button>
        </div>
      </aside>

      {/* 2. MAIN CONSOLE */}
      <main className="flex-1 overflow-y-auto p-12 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-900 rounded-xl hover:bg-emerald-500 hover:text-black transition-all">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text" 
                placeholder="Search Orders, SKUs, or Users..." 
                className="bg-slate-900 border-none rounded-2xl pl-12 pr-6 py-3 text-xs font-bold w-96 focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Sync Active</span>
            </div>
            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center relative">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-[#050505] rounded-full" />
            </div>
          </div>
        </div>

        {/* DYNAMIC CONTENT */}
        <div className="space-y-12">
          
          {activeTab === 'overview' && (
            <>
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none">Command <br /> <span className="text-emerald-500">Center</span></h2>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black tracking-tighter text-white font-mono">₹ 14,50,230</div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Monthly Recurring Volume</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <LiveActivityStream />
                <LowStockDashboard />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                   { label: 'Pending RMA', val: '12', icon: <RefreshCw />, color: 'amber' },
                   { label: 'Active Promotions', val: '04', icon: <Tag />, color: 'emerald' },
                   { label: 'New Reviews', val: '28', icon: <Star />, color: 'cyan' }
                ].map((stat, i) => (
                  <div key={i} className="p-8 bg-slate-900/30 border border-slate-800 rounded-3xl group hover:border-emerald-500/30 transition-all">
                    <div className={`text-${stat.color}-500 mb-4`}>{stat.icon}</div>
                    <div className="text-3xl font-black">{stat.val}</div>
                    <div className="text-xs font-black uppercase text-slate-600 tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'inventory' && (
             <div className="space-y-8">
                <h2 className="text-5xl font-black uppercase tracking-tighter">Inventory Node</h2>
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                  <div className="flex justify-between mb-8">
                    <h3 className="font-black uppercase text-slate-500 text-sm">SKU Master Control</h3>
                    <div className="flex space-x-4">
                      <button className="px-6 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase flex items-center hover:bg-emerald-500 hover:text-black transition-all">
                        <Upload size={14} className="mr-2" /> Bulk CSV Import
                      </button>
                      <button className="px-6 py-2 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase">Add New SKU</button>
                    </div>
                  </div>
                  <LowStockDashboard />
                </div>
             </div>
          )}

          {activeTab === 'fitment' && (
             <div className="space-y-8">
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Fitment Engine Lab</h2>
                <div className="p-12 bg-slate-900/50 rounded-[3rem] border border-slate-800 text-center space-y-8">
                   <Cpu size={64} className="mx-auto text-emerald-500" />
                   <p className="max-w-xl mx-auto text-slate-400 font-bold uppercase tracking-widest text-sm leading-relaxed">
                     Configure Year/Make/Model mapping for the "My Garage" frontend widget. 
                     Syncing 4,500+ automotive configurations.
                   </p>
                   <button className="bg-white text-black px-12 py-5 font-black uppercase tracking-tighter hover:bg-emerald-500 transition-all text-xl">
                     Initialize Mapping Matrix
                   </button>
                </div>
             </div>
          )}

          {activeTab === 'coupons' && (
             <div className="space-y-8">
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Complex Promotions</h2>
                <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Advanced Logic Rule</label>
                        <select className="w-full bg-black border-slate-800 rounded-2xl p-4 font-bold text-xs">
                          <option>Buy X Get Y Free (Multi-SKU)</option>
                          <option>Threshold Based Percentage (JSON Logic)</option>
                          <option>Category Specific Bundle Discount</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Promotion Code</label>
                        <input type="text" placeholder="e.g. MONSTER_BASS_15" className="w-full bg-black border-slate-800 rounded-2xl p-4 font-bold text-xs" />
                      </div>
                   </div>
                   <button className="mt-10 bg-emerald-500 text-black w-full py-6 rounded-2xl font-black uppercase tracking-tighter text-xl shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                     Activate Promotion
                   </button>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}
