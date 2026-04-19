import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LogOut, LayoutDashboard, Package, Grid, Users, Settings, 
  ShoppingBag, Menu, X, Shield, RefreshCw, Tag, 
  Archive, Image as ImageIcon, Star, Activity, Mail, Terminal,
  Bell, Search
} from 'lucide-react';

// Subcomponents
import DashboardOverview from './admin/DashboardOverview';
import ProductManagement from './admin/ProductManagement';
import CategoryManagement from './admin/CategoryManagement';
import OrderManagement from './admin/OrderManagement';
import UserManagement from './admin/UserManagement';
import AdminSettings from './admin/AdminSettings';
import ReturnManagement from './admin/ReturnManagement';
import CouponManagement from './admin/CouponManagement';
import InventoryManagement from './admin/InventoryManagement';
import BannerManagement from './admin/BannerManagement';
import ReviewManagement from './admin/ReviewManagement';
import AnalyticsManagement from './admin/AnalyticsManagement';
import EWarrantyManagement from './admin/EWarrantyManagement';
import ContactManagement from './admin/ContactManagement';

// Hacker-Themed Error Boundary
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 font-mono">
          <div className="max-w-2xl w-full bg-red-500/5 border border-red-500/20 rounded-3xl p-12 space-y-6 text-center">
            <Terminal className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
            <h1 className="text-3xl font-black text-white tracking-tighter">KERNEL_PANIC: RENDER_FAILURE</h1>
            <p className="text-red-400/70 text-sm">A critical error occurred in the administrative interface. System integrity maintained.</p>
            <div className="bg-black/50 p-4 rounded-xl text-left text-xs text-red-300 overflow-auto">
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminDashboard() {
  const { user, logout, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { tab } = useParams();
  
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  const handleLogout = () => {
    logout();
    showToast("Session Terminated. Goodbye, Admin.", "success");
    navigate('/admin/login');
  };

  // SECURITY FIX: Centralized routing handler to prevent "t is not a function" crashes
  const handleRouting = (targetTab) => {
    setActiveTab(targetTab);
    navigate(`/admin/${targetTab}`);
    if (isMobile) setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
    { id: 'analytics', label: 'Analytics', icon: Activity, color: 'text-purple-400' },
    { type: 'divider', label: 'Inventory Control' },
    { id: 'products', label: 'Products', icon: Package, color: 'text-emerald-400' },
    { id: 'inventory', label: 'Stock Audit', icon: Archive, color: 'text-amber-400' },
    { id: 'categories', label: 'Taxonomy', icon: Grid, color: 'text-pink-400' },
    { type: 'divider', label: 'Global Logistics' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, color: 'text-cyan-400' },
    { id: 'returns', label: 'Returns', icon: RefreshCw, color: 'text-red-400' },
    { id: 'coupons', label: 'Growth/Coupons', icon: Tag, color: 'text-orange-400' },
    { type: 'divider', label: 'Relationship Mgr' },
    { id: 'users', label: 'Accounts', icon: Users, color: 'text-indigo-400' },
    { id: 'reviews', label: 'Sentiments', icon: Star, color: 'text-yellow-400' },
    { id: 'contacts', label: 'Inquiries', icon: Mail, color: 'text-teal-400' },
    { type: 'divider', label: 'System Hub' },
    { id: 'banners', label: 'Visual Ops', icon: ImageIcon, color: 'text-fuchsia-400' },
    { id: 'ewarranty', label: 'Security/E-Warr', icon: Shield, color: 'text-green-400' },
    { id: 'settings', label: 'Core Config', icon: Settings, color: 'text-gray-400' },
  ];

  const renderTabContent = () => {
    // Inject all possible navigation props so child buttons never crash
    const commonProps = {
      token,
      setActiveTab: handleRouting,
      onViewDetails: handleRouting,
      onNavigate: handleRouting,
      navigate
    };

    switch (activeTab) {
      case 'overview': return <DashboardOverview {...commonProps} />;
      case 'analytics': return <AnalyticsManagement {...commonProps} />;
      case 'products': return <ProductManagement {...commonProps} />;
      case 'inventory': return <InventoryManagement {...commonProps} />;
      case 'categories': return <CategoryManagement {...commonProps} />;
      case 'orders': return <OrderManagement {...commonProps} />;
      case 'returns': return <ReturnManagement {...commonProps} />;
      case 'coupons': return <CouponManagement {...commonProps} />;
      case 'users': return <UserManagement {...commonProps} />;
      case 'reviews': return <ReviewManagement {...commonProps} />;
      case 'banners': return <BannerManagement {...commonProps} />;
      case 'settings': return <AdminSettings {...commonProps} />;
      case 'ewarranty': return <EWarrantyManagement {...commonProps} />;
      case 'contacts': return <ContactManagement {...commonProps} />;
      default: return <DashboardOverview {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-400 flex font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0a0c10] border-r border-white/5 transform transition-all duration-500 ease-out flex flex-col shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-20'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-20"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="leading-tight">
                <span className="text-white font-black tracking-tighter text-lg block">ANRITVOX</span>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">By Akash Prasad</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item, idx) => (
            item.type === 'divider' ? (
              isSidebarOpen && (
                <div key={idx} className="px-4 pt-6 pb-2">
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.2em]">{item.label}</span>
                </div>
              )
            ) : (
              <button
                key={item.id}
                onClick={() => handleRouting(item.id)}
                className={`w-full group flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative overflow-hidden ${
                  activeTab === item.id 
                    ? 'bg-purple-500/10 text-white border border-purple-500/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]' 
                    : 'hover:bg-white/[0.03] text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className={`transition-colors ${activeTab === item.id ? item.color : 'group-hover:text-gray-300'}`}>
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`} />
                </div>
                {isSidebarOpen && (
                  <span className={`text-sm font-bold tracking-tight ${activeTab === item.id ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                )}
                {activeTab === item.id && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-l-full shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                )}
              </button>
            )
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          {isSidebarOpen && (
            <div className="bg-gradient-to-br from-purple-500/5 to-transparent p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center border border-white/10">
                    <Users className="w-4 h-4 text-purple-400" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Systems Admin'}</p>
                    <p className="text-[10px] text-gray-500 truncate">Lvl 5 Privilege</p>
                 </div>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm font-bold tracking-tight">Terminate Link</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#050505]">
        <header className="h-20 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-30 shrink-0">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5 group focus-within:border-purple-500/50 transition-all">
              <Search className="w-4 h-4 text-gray-500 group-focus-within:text-purple-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-gray-600 w-64"
              />
              <span className="text-[10px] font-mono text-gray-700">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                Live Uplink
              </div>
              <div className="text-[9px] text-gray-600 uppercase font-bold mt-0.5">Core v2.4.1</div>
            </div>
            
            <div className="h-8 w-px bg-white/5 mx-2" />
            
            <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors group">
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
            </button>
            
            <button className="w-10 h-10 rounded-full border-2 border-purple-500/20 p-0.5 hover:border-purple-500/50 transition-all">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=9333ea&color=fff`} 
                alt="Profile" 
                className="w-full h-full rounded-full"
              />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <AdminErrorBoundary key={activeTab}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {renderTabContent()}
            </div>
          </AdminErrorBoundary>
          
          <footer className="mt-12 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
            <div className="flex items-center gap-4">
               <span className="hover:text-gray-500 cursor-help transition-colors">Documentation</span>
               <span className="hover:text-gray-500 cursor-help transition-colors">Security Audit</span>
               <span className="hover:text-gray-500 cursor-help transition-colors">API Status</span>
            </div>
            <p>© 2026 ANRITVOX - PROPERTY OF ANRITVOX</p>
          </footer>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.2); }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}} />
    </div>
  );
}
