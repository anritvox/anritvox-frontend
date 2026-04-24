import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LogOut, LayoutDashboard, Package, Grid, Users, Settings,
  ShoppingBag, Menu, X, Shield, RefreshCw, Tag,
  Archive, Star, Activity, Mail, Terminal, Bell, Search,
  Zap, Gift, Share2, Headphones, ShieldCheck, BarChart3
} from 'lucide-react';

// Real admin subcomponent imports
import DashboardOverview from './admin/DashboardOverview';
import ProductManagement from './admin/ProductManagement';
import CategoryManagement from './admin/CategoryManagement';
import OrderManagement from './admin/OrderManagement';
import UserManagement from './admin/UserManagement';
import EWarrantyManagement from './admin/EWarrantyManagement';
import AnalyticsManagement from './admin/AnalyticsManagement';
import InventoryManagement from './admin/InventoryManagement';
import CouponManagement from './admin/CouponManagement';
import ReviewManagement from './admin/ReviewManagement';
import BannerManagement from './admin/BannerManagement';
import ContactManagement from './admin/ContactManagement';
import ReturnManagement from './admin/ReturnManagement';
import AdminSettings from './admin/AdminSettings';
import SupportManagement from './admin/SupportManagement';
import FlashSalesManagement from './admin/FlashSalesManagement';
import LoyaltyManagement from './admin/LoyaltyManagement';
import AffiliateManagement from './admin/AffiliateManagement';

// Tab to component mapping
const TAB_COMPONENTS = {
  overview: DashboardOverview,
  products: ProductManagement,
  categories: CategoryManagement,
  inventory: InventoryManagement,
  orders: OrderManaement,
  returns: ReturnManagement,
  'flash-sales': FlashSalesManagement,
  coupons: CouponManagement,
  users: UserManagement,
  support: SupportManagement,
  reviews: ReviewManagement,
  loyalty: LoyaltyManagement,
  affiliate: AffiliateManagement,
  ewarranty: EWarrantyManagement,
  analytics: AnalyticsManagement,
  banners: BannerManagement,
  contact: ContactManagement,
  settings: AdminSettings,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || 'overview';
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuSections = [
    {
      title: 'Inventory Control',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Product Audit', icon: Package },
        { id: 'inventory', label: 'Stock Levels', icon: Archive },
        { id: 'categories', label: 'Taxonomy', icon: Grid },
        { id: 'banners', label: 'Banners', icon: Activity },
      ]
    },
    {
      title: 'Global Logistics',
      items: [
        { id: 'orders', label: 'Order Pipeline', icon: ShoppingBag },
        { id: 'returns', label: 'Returns/Exchanges', icon: RefreshCw },
        { id: 'flash-sales', label: 'Flash Scheduler', icon: Zap },
        { id: 'coupons', label: 'Growth/Coupons', icon: Tag },
      ]
    },
    {
      title: 'Relationship Mgr',
      items: [
        { id: 'users', label: 'Client Accounts', icon: Users },
        { id: 'support', label: 'Support Tickets', icon: Headphones },
        { id: 'reviews', label: 'Sentiments/Reviews', icon: Star },
        { id: 'loyalty', label: 'Loyalty Config', icon: Gift },
        { id: 'affiliate', label: 'Affiliate Network', icon: Share2 },
        { id: 'contact', label: 'Contact Inbox', icon: Mail },
      ]
    },
    {
      title: 'System Hub',
      items: [
        { id: 'ewarranty', label: 'Warranty Vault', icon: ShieldCheck },
        { id: 'analytics', label: 'Data Science', icon: BarChart3 },
        { id: 'settings', label: 'Core Config', icon: Settings },
      ]
    }
  ];

  const ActiveComponent = TAB_COMPONENTS[activeTab] || DashboardOverview;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'w-72' : 'w-16'
      } bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-slate-900 text-sm flex-shrink-0">A</div>
          {isSidebarOpen && <span className="text-sm font-black text-white uppercase tracking-widest">Anritvox Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              {isSidebarOpen && (
                <div className="px-4 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {section.title}
                </div>
              )}
              {section.items.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(`/admin/dashboard/${id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all border-r-2 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                        : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {isSidebarOpen && <span className="text-sm font-semibold truncate">{label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm font-bold">Terminate Session</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <Search size={16} className="text-slate-500" />
              <input placeholder="Search records..." className="bg-transparent outline-none text-sm w-48 text-slate-300 placeholder-slate-600" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={18} className="text-slate-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-emerald-400">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-black text-white">{user?.name || 'ADMIN'}</div>
                <div className="text-[10px] text-emerald-500">Superuser</div>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-6 py-2 bg-slate-950 border-b border-slate-800/50 flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
          <Terminal size={12} /> / Admin / {activeTab}
        </div>

        {/* Tab Content */}
        <section className="flex-1 overflow-y-auto bg-slate-950">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <ActiveComponent />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
