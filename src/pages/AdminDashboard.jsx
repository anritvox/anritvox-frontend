import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LogOut, LayoutDashboard, Package, Grid, Users, Settings, 
  ShoppingBag, Menu, X, Shield, RefreshCw, Tag, 
  Archive, Image as ImageIcon, Star, Activity, Mail, Terminal
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
  componentDidCatch(error, info) {
    console.error("SYS_ERR:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-black border border-red-500/50 text-red-500 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.15)] font-mono mt-8">
          <h3 className="text-xl font-black mb-2 tracking-widest flex items-center gap-2">
            <span className="animate-pulse">_</span> SYSTEM FAULT DETECTED
          </h3>
          <div className="bg-[#0a0000] p-4 border border-red-900 rounded mb-4 overflow-x-auto text-xs text-red-400">
            <p className="text-red-600 mb-2">// ERROR_TRACE</p>
            {this.state.error?.message || "Segmentation fault (core dumped)"}
          </div>
          <button 
            onClick={() => this.setState({hasError: false, error: null})} 
            className="px-6 py-2 bg-red-600/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black font-bold uppercase tracking-widest transition-all"
          >
            Execute Retry Sequence
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const auth = useAuth() || {};
  const user = auth.user;
  const logout = auth.logout;
  
  const toast = useToast() || {};
  const showToast = toast.showToast;

  const token = localStorage.getItem('token') || localStorage.getItem('ms_token');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      if (typeof showToast === 'function') showToast('Access denied. Admin privileges required.', 'error');
      navigate('/');
    }
  }, [user, navigate, showToast]);

  const validTabs = ['overview', 'analytics', 'products', 'inventory', 'categories', 'orders', 'returns', 'coupons', 'ewarranty', 'contacts', 'users', 'reviews', 'banners', 'settings'];
  
  useEffect(() => {
    if (!tab || !validTabs.includes(tab)) {
      navigate('/admin/dashboard/overview', { replace: true });
    }
  }, [tab, navigate]);

  const activeTab = validTabs.includes(tab) ? tab : 'overview';

  const handleLogout = async () => {
    try {
      if (typeof logout === 'function') await logout();
      navigate('/admin/login');
      if (typeof showToast === 'function') showToast('Session Terminated.', 'success');
    } catch (error) {
      if (typeof showToast === 'function') showToast('Termination Failed.', 'error');
    }
  };

  const tabsList = [
    { id: 'overview', label: 'SYS.OVERVIEW', icon: LayoutDashboard },
    { id: 'analytics', label: 'DATA.STREAM', icon: Activity },
    { id: 'products', label: 'CORE.PRODUCTS', icon: Package },
    { id: 'inventory', label: 'STOCK.MATRIX', icon: Archive },
    { id: 'categories', label: 'CLASSIFICATION', icon: Grid },
    { id: 'orders', label: 'TRANSACTIONS', icon: ShoppingBag },
    { id: 'returns', label: 'REVERSE.LOGIS', icon: RefreshCw },
    { id: 'coupons', label: 'PROMO.CODES', icon: Tag },
    { id: 'ewarranty', label: 'SECURE.WARRANTY', icon: Shield },
    { id: 'contacts', label: 'COMMS.LINK', icon: Mail },
    { id: 'users', label: 'USER.ACCOUNTS', icon: Users },
    { id: 'reviews', label: 'PUBLIC.FEEDBACK', icon: Star },
    { id: 'banners', label: 'UI.BANNERS', icon: ImageIcon },
    { id: 'settings', label: 'SYS.CONFIG', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview token={token} setSection={(section) => navigate(`/admin/dashboard/${section}`)} />;
      case 'analytics': return <AnalyticsManagement token={token} />;
      case 'products': return <ProductManagement token={token} />;
      case 'inventory': return <InventoryManagement token={token} />;
      case 'categories': return <CategoryManagement token={token} />;
      case 'orders': return <OrderManagement token={token} />;
      case 'returns': return <ReturnManagement token={token} />;
      case 'coupons': return <CouponManagement token={token} />;
      case 'ewarranty': return <EWarrantyManagement token={token} />;
      case 'contacts': return <ContactManagement token={token} />;
      case 'users': return <UserManagement token={token} />;
      case 'reviews': return <ReviewManagement token={token} />;
      case 'banners': return <BannerManagement token={token} />;
      case 'settings': return <AdminSettings token={token} />;
      default: return <DashboardOverview token={token} setSection={(section) => navigate(`/admin/dashboard/${section}`)} />;
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#050505] text-green-500 font-mono flex flex-col md:flex-row selection:bg-green-500 selection:text-black">
      
      <style>{`
        .hacker-scrollbar::-webkit-scrollbar { width: 4px; }
        .hacker-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .hacker-scrollbar::-webkit-scrollbar-thumb { background: rgba(34, 197, 94, 0.2); }
        .hacker-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.6); }
      `}</style>

      {/* Mobile Header */}
      <div className="md:hidden bg-[#0a0c10] border-b border-green-500/20 p-4 flex justify-between items-center z-20 relative shadow-[0_0_15px_rgba(34,197,94,0.1)]">
        <div className="flex items-center gap-2 text-green-400 font-black tracking-widest text-xl">
          <Terminal className="w-5 h-5" />
          <span>ROOT_ACCESS</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-green-500 hover:text-green-300">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64
        bg-[#0a0c10] border-r border-green-500/20 shadow-[2px_0_20px_rgba(34,197,94,0.05)] transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
      `}>
        <div className="p-6 border-b border-green-500/20 hidden md:flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 blur-2xl rounded-full pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-5 h-5 text-green-400" />
            <h1 className="text-xl font-black text-green-400 tracking-widest">NEXUS<span className="text-green-500/40">_OS</span></h1>
          </div>
          <p className="text-[10px] text-green-500/60 uppercase tracking-[0.2em]">Authorized Personnel Only</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4 hacker-scrollbar">
          <div className="px-4 text-[10px] text-green-500/40 font-bold mb-2 uppercase tracking-widest">// Command Directory</div>
          <nav className="space-y-1 px-3">
            {tabsList.map((tabItem) => {
              const Icon = tabItem.icon;
              const isActive = activeTab === tabItem.id;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => {
                    navigate(`/admin/dashboard/${tabItem.id}`);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-all text-xs tracking-wider uppercase
                    ${isActive 
                      ? 'bg-green-500/10 text-green-400 border-l-2 border-green-400 shadow-[inset_2px_0_10px_rgba(34,197,94,0.1)]' 
                      : 'text-green-500/50 hover:bg-green-500/5 hover:text-green-400 border-l-2 border-transparent'}
                  `}
                >
                  <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
                  {tabItem.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-green-500/20 bg-[#0a0c10]">
          <div className="mb-4 px-2 text-[10px] text-green-500/50 uppercase tracking-widest truncate">
            &gt; Active_Session: <br/>
            <span className="text-green-400 font-bold text-xs">{user?.email || 'Admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/30 hover:bg-red-900 border border-red-900 hover:border-red-500 text-red-500 hover:text-black py-3 rounded-none transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.1)]"
          >
            <LogOut size={16} />
            Kill Process
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#050505] relative z-10">
        <header className="bg-[#0a0c10] border-b border-green-500/20 p-4 md:p-6 flex-shrink-0 flex items-center justify-between">
          <div className="text-sm md:text-lg font-bold text-green-400 flex items-center gap-2">
            <span className="text-green-500/40">root@nexus:~#</span> ./exec {activeTab}.sh <span className="animate-pulse w-2 h-4 bg-green-500 inline-block ml-1"></span>
          </div>
          <div className="text-[10px] text-green-500/30 uppercase tracking-[0.3em] hidden md:block">
            Sys.Status: <span className="text-green-500/80">ONLINE</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 hacker-scrollbar relative">
          {/* Subtle Grid Background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10"></div>
          
          <div className="max-w-7xl mx-auto h-full">
            <AdminErrorBoundary>
              {renderTabContent()}
            </AdminErrorBoundary>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
