import React, { useState } from 'react';
import { 
  FiHome, FiBox, FiDatabase, FiFolder, FiShoppingCart, 
  FiRefreshCcw, FiTag, FiUsers, FiLayout, FiFileText, 
  FiMail, FiSettings 
} from 'react-icons/fi';

// ─── IMPORTANT: CHECK FILENAMES IN YOUR FOLDER ───────────────────
// If your file is "dashboardOverview.jsx", change the import to match!
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
  const token = localStorage.getItem('adminToken');

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
    const props = { token, setSection };
    
    // Safety check: If a component is missing during development, 
    // it will throw an error here.
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
      default: return <DashboardOverview {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-6 font-bold text-xl border-b border-gray-700 text-cyan-400">
          Admin Panel
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center w-full p-3 rounded-lg transition ${
                section === item.id ? 'bg-gray-700 ring-1 ring-cyan-500' : 'hover:bg-gray-700'
              }`}
            >
              <item.icon className={`mr-3 ${item.color}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminDashboard;
