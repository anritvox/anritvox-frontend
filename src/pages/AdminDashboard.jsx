import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardOverview from "./admin/DashboardOverview";
import EWarrantyManagement from "./admin/EWarrantyManagement";
import CategoryManagement from "./admin/CategoryManagement";
import ProductManagement from "./admin/ProductManagement";
import {
  FiHome, FiFileText, FiFolder, FiBox, FiLogOut,
  FiMenu, FiX, FiWifi, FiWifiOff, FiRefreshCw,
  FiMoon, FiSun, FiExternalLink, FiChevronLeft, FiChevronRight,
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
    { id: "dashboard",  label: "Overview",   icon: FiHome,     color: "text-cyan-400" },
    { id: "products",   label: "Inventory",  icon: FiBox,      color: "text-purple-400" },
    { id: "categories", label: "Categories", icon: FiFolder,   color: "text-pink-400" },
    { id: "ewarranty",  label: "Warranty",   icon: FiFileText, color: "text-emerald-400" },
  ];

  const renderSection = () => {
    const props = { token, isRealTimeSync };
    switch (section) {
      case "dashboard":  return <DashboardOverview  {...props} />;
      case "ewarranty":  return <EWarrantyManagement {...props} />;
      case "categories": return <CategoryManagement  {...props} />;
      case "products":   return <ProductManagement   {...props} />;
      default:           return <DashboardOverview  {...props} />;
    }
  };

  if (!token) return null;

  return (
    <div className={`min-h-screen font-sans ${darkMode ? "bg-[#0a0a0f] text-white" : "bg-gray-100 text-gray-900"} flex flex-col`}>

      {/* Top Navbar */}
      <header className={`flex items-center justify-between px-4 py-3 border-b ${
        darkMode ? "bg-[#0d1117] border-cyan-500/20" : "bg-white border-gray-200"
      } sticky top-0 z-50 shadow-lg`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg">
            <FiMenu className="h-5 w-5" />
          </button>
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-black text-black text-sm">A</div>
            <span className="font-bold text-lg tracking-tight">
              Anritvox<span className="text-cyan-400">OS</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isOnline ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          }`}>
            {isOnline ? <FiWifi className="h-3 w-3" /> : <FiWifiOff className="h-3 w-3" />}
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>
          <button onClick={() => setIsRealTimeSync(!isRealTimeSync)} className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
            isRealTimeSync ? "bg-cyan-500/10 text-cyan-400" : "bg-gray-500/10 text-gray-400"
          }`}>
            <FiRefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
            {isRealTimeSync ? "Live" : "Manual"}
          </button>
          <span className="text-xs text-gray-500 hidden md:block">
            Synced {lastSync.toLocaleTimeString()}
          </span>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors">
            {darkMode ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
            <FiLogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${
          mobileMenuOpen ? "flex" : "hidden sm:flex"
        } flex-col ${
          sidebarCollapsed ? "w-16" : "w-56"
        } transition-all duration-300 ${
          darkMode ? "bg-[#0d1117] border-r border-cyan-500/10" : "bg-white border-r border-gray-200"
        } p-3 gap-1 fixed sm:relative inset-y-0 left-0 top-16 z-40 pt-4`}>

          <button
            onClick={() => { setSidebarCollapsed(!sidebarCollapsed); setMobileMenuOpen(false); }}
            className="hidden sm:flex items-center justify-end mb-4 pr-1 text-gray-500 hover:text-white"
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          {!sidebarCollapsed && (
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">Core Modules</p>
          )}

          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                section === item.id
                  ? "bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border border-cyan-500/20"
                  : `${darkMode ? "text-gray-500 hover:text-gray-200 hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${section === item.id ? "text-cyan-400" : item.color}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}

          <div className="mt-auto">
            <a
              href="https://anritvox-frontend.vercel.app"
              target="_blank"
              rel="noreferrer"
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                darkMode ? "text-gray-500 hover:text-gray-200 hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <FiExternalLink className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>View Store</span>}
            </a>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
