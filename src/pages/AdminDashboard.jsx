import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LogOut, LayoutDashboard, Package, Grid, Users, Settings, 
  ShoppingBag, Menu, X, Shield, RefreshCw, Tag, 
  Archive, Image as ImageIcon, Star, Activity, Mail
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

// Local Error Boundary to prevent white screen of death in Admin panel
class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Admin Tab Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-bold mb-2">Failed to load this module</h3>
          <p className="text-sm font-mono bg-red-100 dark:bg-red-950 p-3 rounded mb-4 overflow-x-auto">
            {this.state.error?.message || "An unexpected rendering error occurred."}
          </p>
          <button 
            onClick={() => this.setState({hasError: false, error: null})} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Module
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
  
  // Safely access contexts to prevent 'f is not a function' crashes
  const auth = useAuth() || {};
  const user = auth.user;
  const logout = auth.logout;
  
  const toast = useToast() || {};
  const showToast = toast.showToast;

  // Extract token to pass down to subcomponents
  const token = localStorage.getItem('token') || localStorage.getItem('ms_token');

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      if (typeof showToast === 'function') {
        showToast('Access denied. Admin privileges required.', 'error');
      }
      navigate('/');
    }
  }, [user, navigate, showToast]);

  // Automatically route invalid tabs to overview
  const validTabs = ['overview', 'analytics', 'products', 'inventory', 'categories', 'orders', 'returns', 'coupons', 'ewarranty', 'contacts', 'users', 'reviews', 'banners', 'settings'];
  
  useEffect(() => {
    if (!tab || !validTabs.includes(tab)) {
      navigate('/admin/dashboard/overview', { replace: true });
    }
  }, [tab, navigate]);

  const activeTab = validTabs.includes(tab) ? tab : 'overview';

  const handleLogout = async () => {
    try {
      if (typeof logout === 'function') {
        await logout();
      }
      navigate('/admin/login');
      if (typeof showToast === 'function') {
        showToast('Logged out successfully', 'success');
      }
    } catch (error) {
      if (typeof showToast === 'function') {
        showToast('Failed to log out', 'error');
      }
    }
  };

  const tabsList = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Archive },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'returns', label: 'Returns', icon: RefreshCw },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'ewarranty', label: 'E-Warranty', icon: Shield },
    { id: 'contacts', label: 'Contacts', icon: Mail },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    // Pass token and a valid setSection navigation function to prevent fatal crashes
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xl">
          <Shield className="w-6 h-6" />
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
          <Shield className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <nav className="space-y-1 px-3">
            {tabsList.map((tabItem) => {
              const Icon = tabItem.icon;
              return (
                <button
                  key={tabItem.id}
                  onClick={() => {
                    navigate(`/admin/dashboard/${tabItem.id}`);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${activeTab === tabItem.id 
                      ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  `}
                >
                  <Icon size={20} />
                  {tabItem.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="mb-4 px-4 text-sm text-gray-500 dark:text-gray-400 truncate">
            Logged in as: <br/>
            <span className="font-medium text-gray-800 dark:text-gray-200">{user?.email || 'Admin'}</span>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 relative z-10">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 p-4 md:p-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
