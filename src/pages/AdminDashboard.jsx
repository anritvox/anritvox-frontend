import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LogOut, LayoutDashboard, Package, Grid, Users, Settings, 
  ShoppingBag, Menu, X, ShieldAlert, ArrowLeftRight, Tag, 
  Archive, Image as ImageIcon, Star, BarChart3
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      showToast('Access denied. Admin privileges required.', 'error');
      navigate('/');
    }
  }, [user, navigate, showToast]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      showToast('Failed to log out', 'error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Archive },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'returns', label: 'Returns', icon: ArrowLeftRight },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'analytics': return <AnalyticsManagement />;
      case 'products': return <ProductManagement />;
      case 'inventory': return <InventoryManagement />;
      case 'categories': return <CategoryManagement />;
      case 'orders': return <OrderManagement />;
      case 'returns': return <ReturnManagement />;
      case 'coupons': return <CouponManagement />;
      case 'users': return <UserManagement />;
      case 'reviews': return <ReviewManagement />;
      case 'banners': return <BannerManagement />;
      case 'settings': return <AdminSettings />;
      default: return <DashboardOverview />;
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl">
          <ShieldAlert className="w-6 h-6" />
          <span>Admin Panel</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 dark:text-gray-300">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64
        bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen
      `}>
        <div className="p-6 border-b dark:border-gray-700 hidden md:flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  `}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <div className="mb-4 px-4 text-sm text-gray-500 dark:text-gray-400 truncate">
            Logged in as: <br/>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 py-2 rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 p-4 md:p-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
