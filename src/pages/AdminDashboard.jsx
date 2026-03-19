import React, { useState, useEffect } from 'react';
import { 
  FiHome, FiBox, FiDatabase, FiFolder, FiShoppingCart, 
  FiRefreshCcw, FiTag, FiUsers, FiLayout, FiFileText, 
  FiMail, FiSettings, FiLogOut, FiMenu, FiX 
} from 'react-icons/fi';

// Import Section Components
import DashboardOverview from '../components/admin/DashboardOverview';
import ProductManagement from '../components/admin/ProductManagement';
import InventoryManagement from '../components/admin/InventoryManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import OrderManagement from '../components/admin/OrderManagement';
import ReturnManagement from '../components/admin/ReturnManagement';
import CouponManagement from '../components/admin/CouponManagement';
import UserManagement from '../components/admin/UserManagement';
import BannerManagement from '../components/admin/BannerManagement';
import EWarrantyManagement from '../components/admin/EWarrantyManagement';
import ContactManagement from '../components/admin/ContactManagement';
import AdminSettings from '../components/admin/AdminSettings';

const AdminDashboard = () => {
  const [section, setSection] = useState("dashboard");
  const [token] = useState(localStorage.getItem('adminToken'));
  const [isRealTimeSync] = useState(true);

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: FiHome, color: "text-cyan-400" },
    { id: "products", label: "Inventory", icon: FiBox, color: "text-purple-400" },
    { id: "inventory", label: "Stock Control", icon: FiDatabase, color: "text-indigo-400" },
    { id: "categories", label: "Categories", icon: FiFolder, color: "text-pink-400" },
    { id: "orders", label: "Orders", icon: FiShoppingCart, color: "text-blue-400" },
    { id: "returns", label: "Returns", icon: FiRefreshCcw, color: "text-rose-400" },
    { id: "coupons", label: "Coupons", icon: FiTag, color: "text-yellow-400" },
    { id: "users", label: "Users", icon: FiUsers, color: "text-teal-400" },
    { id: "banners", label: "Banners", icon: FiLayout, color: "text-orange-400" },
    { id: "ewarranty", label: "Warranty", icon: FiFileText, color: "text-emerald-400" },
    { id: "contacts", label: "Messages", icon: FiMail, color: "text-yellow-400" },
    { id: "settings", label: "Settings", icon: FiSettings, color: "text-gray-400" },
  ];

  const renderSection = () => {
    const props = { token, isRealTimeSync, setSection };
    switch (section) {
      case "dashboard": return <DashboardOverview {...props} />;
      case "inventory": return <InventoryManagement token={token} />;
      case "returns": return <ReturnManagement token={token} />;
      case "coupons": return <CouponManagement token={token} />;
      case "products": return <ProductManagement token={token} />;
      case "ewarranty": return <EWarrantyManagement token={token} />;
      case "categories": return <CategoryManagement token={token} />;
      case "contacts": return <ContactManagement token={token} />;
      case "orders": return <OrderManagement token={token} />;
      case "banners": return <BannerManagement token={token} />;
      case "users": return <UserManagement token={token} />;
      case "settings": return <AdminSettings token={token} />;
      default: return <DashboardOverview {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex-shrink-0 border-r border-gray-700 hidden md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ANRITVOX Admin
          </h1>
        </div>
        <nav className="mt-4 px-4 space-y-1 overflow-y-auto h-[calc(100vh-120px)]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                section === item.id 
                ? 'bg-gray-700 shadow-lg' 
                : 'hover:bg-gray-700/50'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${item.color}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard;
