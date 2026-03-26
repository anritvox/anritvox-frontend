import React, { useState } from 'react';
import {
  FiHome, FiBox, FiDatabase, FiFolder, FiShoppingCart,
  FiRefreshCcw, FiTag, FiUsers, FiLayout, FiFileText,
  FiMail, FiSettings
} from 'react-icons/fi';

import DashboardOverview from './admin/DashboardOverview';
import ProductManagement from './admin/ProductManagement';
import InventoryManagement from './admin/InventoryManagement';
import CategoryManagement from './admin/CategoryManagement';
import OrderManagement from './admin/OrderManagement';
import ReturnManagement from './admin/ReturnManagement';
import CouponManagement from './admin/CouponManagement';
import UserManagement from './admin/UserManagement';
import BannerManagement from './admin/BannerManagement';
import EWarrantyManagement from './admin/EWarrantyManagement';
import ContactManagement from './admin/ContactManagement';
import AdminSettings from './admin/AdminSettings';
import AnalyticsManagement from './admin/AnalyticsManagement';
import ReviewManagement from './admin/ReviewManagement';

const AdminDashboard = () => {
  const [section, setSection] = useState("dashboard");
    const token = localStorage.getItem('ms_token') || localStorage.getItem('token');

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
        { id: "analytics", label: "Analytics", icon: FiDatabase, color: "text-green-400" },
    { id: "reviews", label: "Reviews", icon: FiTag, color: "text-orange-400" },
  ];

  const renderSection = () => {
    const props = { token, setSection };
    switch (section) {
      case "dashboard": return <DashboardOverview {...props} />;
      case "inventory": return <InventoryManagement {...props} />;
      case "returns": return <ReturnManagement {...props} />;
      case "coupons": return <CouponManagement {...props} />;
      case "products": return <ProductManagement {...props} />;
      case "ewarranty": return <EWarrantyManagement {...props} />;
      case "categories": return <CategoryManagement {...props} />;
      case "contacts": return <ContactManagement {...props} />;
      case "orders": return <OrderManagement {...props} />;
      case "banners": return <BannerManagement {...props} />;
      case "users": return <UserManagement {...props} />;
      case "settings": return <AdminSettings {...props} />;
              case "analytics": return <AnalyticsManagement {...props} />;
      case "reviews": return <ReviewManagement {...props} />;
      default: return <DashboardOverview {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col gap-2 overflow-y-auto">
        <h1 className="text-xl font-bold text-cyan-400 mb-4">Admin Panel</h1>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`flex items-center w-full p-3 rounded-lg transition ${
              section === item.id
                ? 'bg-gray-700 ring-1 ring-cyan-500'
                : 'hover:bg-gray-700'
            }`}
          >
            <item.icon className={`mr-3 ${item.color}`} />
            {item.label}
          </button>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard;
