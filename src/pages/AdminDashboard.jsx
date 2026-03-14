import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import DashboardOverview from "./admin/DashboardOverview";
import EWarrantyManagement from "./admin/EWarrantyManagement";
import CategoryManagement from "./admin/CategoryManagement";
import ProductManagement from "./admin/ProductManagement";
import ContactManagement from "./admin/ContactManagement";
import OrderManagement from "./admin/OrderManagement";
import BannerManagement from "./admin/BannerManagement";
import UserManagement from "./admin/UserManagement";
import {
  FiHome, FiFileText, FiFolder, FiBox, FiLogOut,
  FiMenu, FiX, FiWifi, FiWifiOff, FiRefreshCw,
  FiMoon, FiSun, FiExternalLink, FiChevronLeft, FiChevronRight, FiMail,
  FiShoppingCart, FiLayout, FiSettings, FiUsers
} from "react-icons/fi";

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [isRealTimeSync, setIsRealTimeSync] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("ms_token");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); if (isRealTimeSync) triggerSync(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const syncInterval = setInterval(() => {
      if (navigator.onLine && isRealTimeSync) triggerSync();
    }, 30000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(syncInterval);
    };
  }, [isRealTimeSync]);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => { setLastSync(new Date()); setIsSyncing(false); }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("ms_token");
    navigate("/admin/login");
  };

  const menuItems = [
    { id: "dashboard", label: "Overview", icon: FiHome, color: "text-cyan-400" },
    { id: "products", label: "Inventory", icon: FiBox, color: "text-purple-400" },
    { id: "categories", label: "Categories", icon: FiFolder, color: "text-pink-400" },
    { id: "orders", label: "Orders", icon: FiShoppingCart, color: "text-blue-400" },
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
      case "ewarranty": return <EWarrantyManagement token={token} />;
      case "categories": return <CategoryManagement token={token} />;
      case "products": return <ProductManagement token={token} />;
      case "contacts": return <ContactManagement token={token} />;
      case "orders": return <OrderManagement token={token} />;
      case "banners": return <BannerManagement token={token} />;
      case "users": return <UserManagement token={token} />;
      case "settings": return (
        <div className="p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2"><FiSettings /> System Settings</h2>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">Site Information</h3>
              <p className="text-sm text-gray-400">Site Name: <span className="text-white">Anritvox</span></p>
              <p className="text-sm text-gray-400 mt-1">Domain: <span className="text-white">anritvox.com</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">Order Settings</h3>
              <p className="text-sm text-gray-400">Payment Method: <span className="text-white">Cash on Delivery (COD)</span></p>
              <p className="text-sm text-gray-400 mt-1">Delivery Types: <span className="text-white">Standard, Express</span></p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">Admin Controls</h3>
              <button onClick={triggerSync} className="flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-lg text-sm hover:bg-cyan-500/20">
                <FiRefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> Sync Data
              </button>
            </div>
          </div>
        </div>
      );
      default: return <DashboardOverview {...props} />;
    }
  };

  if (!token) return <Navigate to="/admin/login" replace />;

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-[#080a0f] text-white" : "bg-gray-50 text-gray-900"}`}>
      <header className={`h-14 border-b ${darkMode ? "border-white/5 bg-[#0d0f14]" : "border-gray-200 bg-white"} flex items-center justify-between px-4 shrink-0 z-20`}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg"
        >
          {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
        </button>
        <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">A</div>
          <span className={`font-bold text-sm tracking-widest ${darkMode ? "text-white" : "text-gray-900"}`}>Anritvox <span className="text-cyan-400">OS</span></span>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? <FiWifi size={14} className="text-emerald-400" /> : <FiWifiOff size={14} className="text-red-400" />}
          <span className={`text-xs hidden sm:inline ${isOnline ? "text-emerald-400" : "text-red-400"}`}>{isOnline ? "Online" : "Offline"}</span>
          <button
            onClick={() => setIsRealTimeSync(!isRealTimeSync)}
            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
              isRealTimeSync ? "bg-cyan-500/10 text-cyan-400" : "bg-gray-500/10 text-gray-400"
            }`}
          >
            {isRealTimeSync ? "Live" : "Manual"}
          </button>
          <span className="text-xs text-gray-600 hidden sm:inline">Synced {lastSync.toLocaleTimeString()}</span>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors">
            {darkMode ? <FiSun size={14} /> : <FiMoon size={14} />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 hover:bg-red-500/10 rounded-lg transition-all">
            <FiLogOut size={13} /> Exit
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className={`
          hidden sm:flex flex-col
          ${sidebarCollapsed ? "w-16" : "w-52"}
          ${darkMode ? "bg-[#0d0f14] border-r border-white/5" : "bg-white border-r border-gray-200"}
          shrink-0 transition-all duration-300 p-3
        `}>
          <button
            onClick={() => { setSidebarCollapsed(!sidebarCollapsed); setMobileMenuOpen(false); }}
            className="flex items-center justify-end mb-4 pr-1 text-gray-500 hover:text-white"
          >
            {sidebarCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            {!sidebarCollapsed && <span className="text-xs uppercase tracking-widest text-gray-600 mr-auto ml-1">Core Modules</span>}
          </button>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${
                section === item.id
                  ? "bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border border-cyan-500/20"
                  : `${darkMode ? "text-gray-500 hover:text-gray-200 hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`
              }`}
            >
              <item.icon size={16} className={section === item.id ? "text-cyan-400" : item.color} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
          <div className="mt-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-cyan-400 hover:bg-white/5 transition-all"
            >
              <FiExternalLink size={13} />
              {!sidebarCollapsed && <span>View Store</span>}
            </a>
          </div>
        </aside>
        {mobileMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-30">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <div className={`absolute left-0 top-14 bottom-0 w-56 ${darkMode ? "bg-[#0d0f14]" : "bg-white"} p-3 z-40`}>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${
                    section === item.id
                      ? "bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border border-cyan-500/20"
                      : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <item.icon size={16} className={item.color} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
