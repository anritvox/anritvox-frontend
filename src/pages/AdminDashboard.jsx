import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardOverview from "./admin/DashboardOverview";
import EWarrantyManagement from "./admin/EWarrantyManagement";
import CategoryManagement from "./admin/CategoryManagement";
import ProductManagement from "./admin/ProductManagement";

import {
  FiHome,
  FiFileText,
  FiFolder,
  FiBox,
  FiLogOut,
  FiMenu,
  FiX,
  FiKey,
  FiActivity,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [isRealTimeSync, setIsRealTimeSync] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("ms_token");

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  // Real-time sync monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isRealTimeSync) {
        triggerSync();
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Real-time sync every 30 seconds when online
    const syncInterval = setInterval(() => {
      if (navigator.onLine && isRealTimeSync) {
        triggerSync();
      }
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(syncInterval);
    };
  }, [isRealTimeSync]);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setLastSync(new Date());
      setIsSyncing(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("ms_token");
    navigate("/admin/login");
  };

  const handleSectionChange = (sec) => {
    setSection(sec);
    setMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return (
          <DashboardOverview token={token} isRealTimeSync={isRealTimeSync} />
        );
      case "ewarranty":
        return <EWarrantyManagement token={token} />;
      case "categories":
        return <CategoryManagement token={token} />;
      case "products":
        return <ProductManagement token={token} />;
      default:
        return (
          <DashboardOverview token={token} isRealTimeSync={isRealTimeSync} />
        );
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: FiHome },
    { id: "ewarranty", label: "E-Warranty", icon: FiFileText },
    { id: "categories", label: "Categories", icon: FiFolder },
    { id: "products", label: "Products", icon: FiBox },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-lime-50/30 to-green-50/30 text-gray-900 font-inter antialiased">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-sm sm:hidden transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Enhanced Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-lime-200/50 flex flex-col
                  transform transition-all duration-500 ease-in-out
                  ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                  sm:relative sm:translate-x-0 sm:flex
                  ${sidebarCollapsed ? "sm:w-20" : "sm:w-72"}`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-center mb-8">
            <div
              className={`transition-all duration-300 ${
                sidebarCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
              }`}
            >
              <h2 className="text-2xl font-black bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                Anritvox
              </h2>
              <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
            </div>

            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden sm:block text-gray-400 hover:text-lime-600 transition-colors duration-200 p-2 hover:bg-lime-50 rounded-lg"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="sm:hidden text-gray-600 hover:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600 rounded-md p-1"
              aria-label="Close menu"
            >
              <FiX className="h-7 w-7" />
            </button>
          </div>

          {/* Real-time Status */}
          <div
            className={`mb-6 transition-all duration-300 ${
              sidebarCollapsed
                ? "opacity-0 h-0 overflow-hidden"
                : "opacity-100 h-auto"
            }`}
          >
            <div className="bg-gradient-to-r from-green-50 to-lime-50 p-3 rounded-xl border border-lime-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <FiWifi className="h-4 w-4 text-green-600" />
                  ) : (
                    <FiWifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs font-medium text-gray-600">
                    {isOnline ? "Connected" : "Offline"}
                  </span>
                </div>
                <button
                  onClick={triggerSync}
                  disabled={!isOnline || isSyncing}
                  className="p-1 hover:bg-white/50 rounded transition-colors duration-200"
                >
                  <FiRefreshCw
                    className={`h-3 w-3 text-gray-400 ${
                      isSyncing ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Real-time Sync</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRealTimeSync}
                    onChange={(e) => setIsRealTimeSync(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                      isRealTimeSync ? "bg-lime-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
                        isRealTimeSync ? "translate-x-4" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Last sync: {lastSync.toLocaleTimeString()}
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`group flex items-center w-full text-left rounded-xl transition-all duration-300 ease-in-out font-medium
                  ${
                    sidebarCollapsed
                      ? "px-3 py-3 justify-center"
                      : "px-4 py-3 gap-3"
                  }
                  ${
                    section === item.id
                      ? "bg-gradient-to-r from-lime-600 to-green-600 text-white shadow-lg shadow-lime-200 transform scale-105"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-50 hover:text-lime-700 hover:shadow-md"
                  }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <item.icon
                  className={`${
                    sidebarCollapsed ? "h-6 w-6" : "h-5 w-5"
                  } transition-all duration-200`}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
              </button>
            ))}

            {/* External Tools */}
            <div
              className={`border-t border-gray-200 pt-4 mt-4 ${
                sidebarCollapsed
                  ? "opacity-0 h-0 overflow-hidden"
                  : "opacity-100"
              }`}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                External Tools
              </p>
              <button
                onClick={() => {
                  window.open(
                    "https://pranavkumar2601.github.io/serial-number-genrator/",
                    "_blank"
                  );
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ease-in-out font-medium text-gray-700 hover:bg-gradient-to-r hover:from-lime-50 hover:to-green-100 hover:text-lime-700"
              >
                <FiKey className="h-5 w-5" />
                <span>Serial Generator</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Enhanced Logout Button - Fixed for mobile visibility */}
        <div className="p-6 mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out relative overflow-hidden group
              ${sidebarCollapsed ? "px-3 py-4" : "px-6 py-4 gap-2"}`}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

            <FiLogOut
              className={`${
                sidebarCollapsed ? "h-6 w-6" : "h-5 w-5"
              } relative z-10`}
            />
            {!sidebarCollapsed && <span className="relative z-10">Logout</span>}

            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
          </button>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-lime-200/50 p-4 sm:p-6 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Mobile menu button - Enhanced visibility */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden bg-lime-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
              aria-label="Open menu"
            >
              <FiMenu className="h-5 w-5" />
            </button>

            {/* Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {section === "dashboard"
                  ? "Dashboard Overview"
                  : section.replace("-", " ")}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome to Anritvox Admin Dashboard - Real-time business
                insights
              </p>
            </div>

            {/* Real-time Status Indicator */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                <FiActivity
                  className={`h-4 w-4 text-green-600 ${
                    isRealTimeSync && isOnline ? "animate-pulse" : ""
                  }`}
                />
                <span className="text-sm font-medium text-green-700">
                  {isRealTimeSync && isOnline ? "Live" : "Paused"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8 relative min-h-screen">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-lime-400/10 to-green-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-lime-400/10 to-lime-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="animate-fade-in-up">{renderSection()}</div>
          </div>
        </div>
      </main>

      {/* Enhanced Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.2);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.8);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 15s infinite cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #84cc16;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #65a30d;
        }
      `}</style>
    </div>
  );
}
