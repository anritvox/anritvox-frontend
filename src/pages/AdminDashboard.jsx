import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardOverview   from "./admin/DashboardOverview";
import EWarrantyManagement from "./admin/EWarrantyManagement";
import CategoryManagement  from "./admin/CategoryManagement";
import ProductManagement   from "./admin/ProductManagement";
import {
  FiHome, FiFileText, FiFolder, FiBox, FiLogOut,
  FiMenu, FiX, FiWifi, FiWifiOff, FiRefreshCw,
  FiMoon, FiSun, FiExternalLink,
} from "react-icons/fi";

export default function AdminDashboard() {
  const [section, setSection]             = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline]           = useState(navigator.onLine);
  const [lastSync, setLastSync]           = useState(new Date());
  const [isRealTimeSync, setIsRealTimeSync] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing]         = useState(false);
  const [darkMode, setDarkMode]           = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("ms_token");

  // ✅ FIXED: proper auth guard
  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  if (isRealTimeSync) triggerSync(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    const syncInterval = setInterval(() => {
      if (navigator.onLine && isRealTimeSync) triggerSync();
    }, 30000);
    return () => {
      window.removeEventListener("online",  handleOnline);
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
    { id: "dashboard",  label: "Overview",   icon: FiHome,     color: "text-cyan-400"   },
    { id: "products",   label: "Inventory",  icon: FiBox,      color: "text-purple-400" },
    { id: "categories", label: "Categories", icon: FiFolder,   color: "text-pink-400"   },
    { id: "ewarranty",  label: "Warranty",   icon: FiFileText, color: "text-emerald-400"},
  ];

  // ✅ FIXED: actually pass props to each component
  const renderSection = () => {
    const props = { token, isRealTimeSync };
    switch (section) {
      case "dashboard":  return <DashboardOverview   {...props} />;
      case "ewarranty":  return <EWarrantyManagement {...props} />;
      case "categories": return <CategoryManagement  {...props} />;
      case "products":   return <ProductManagement   {...props} />;
      default:           return <DashboardOverview   {...props} />;
    }
  };

  if (!token) return null; // prevent flash before redirect

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white font-sans overflow-hidden flex flex-col">
      {/* Scanline effect */}
      <div className="scanline pointer-events-none" />

      {/* Glow blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0d1117]/90 border-b border-white/5 backdrop-blur-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="sm:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg">
            <FiMenu size={20} />
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-black font-black text-sm">A</div>
            <span className="font-black text-lg tracking-tight">
              Anritvox<span className="text-cyan-400">OS</span>
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          {/* Online status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isOnline
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}>
            {isOnline ? <FiWifi size={12} /> : <FiWifiOff size={12} />}
            {isOnline ? "Online" : "Offline"}
          </div>

          <button onClick={triggerSync} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-cyan-400 transition-colors">
            <FiRefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
          </button>

          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors">
            {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all">
            <FiLogOut size={14} /> Exit
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          sm:translate-x-0
          fixed sm:static z-40 h-full
          ${sidebarCollapsed ? "w-16" : "w-64"}
          bg-[#0d1117]/95 border-r border-white/5 backdrop-blur-xl
          flex flex-col transition-all duration-300
        `}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
            {!sidebarCollapsed && <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Core Modules</span>}
            <button onClick={() => { setSidebarCollapsed(!sidebarCollapsed); setMobileMenuOpen(false); }} className="text-gray-500 hover:text-white p-1">
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  section === item.id
                    ? "bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400 border border-cyan-500/20"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <item.icon size={18} className={section === item.id ? "text-cyan-400" : item.color} />
                {!sidebarCollapsed && item.label}
              </button>
            ))}
          </nav>

          {/* Serial Key link */}
          <div className="p-3 border-
