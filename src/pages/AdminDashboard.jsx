import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Upgraded to Lucide-React for a sharper, futuristic vector style
import {
  Home,
  FileText,
  Folder,
  Box,
  LogOut,
  Menu,
  X,
  Key,
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  User,
  Search,
  Bell,
  Cpu,
  TrendingUp,
  AlertCircle,
  Users,
  CheckCircle,
  Clock
} from "lucide-react";

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [isRealTimeSync, setIsRealTimeSync] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  // Mock token for preview
  const token = localStorage.getItem("ms_token") || "preview-token";

  useEffect(() => {
    // In a real app, strict check. Here we allow preview-token
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
        return <DashboardOverview token={token} isRealTimeSync={isRealTimeSync} />;
      case "ewarranty":
        return <EWarrantyManagement token={token} />;
      case "categories":
        return <CategoryManagement token={token} />;
      case "products":
        return <ProductManagement token={token} />;
      default:
        return <DashboardOverview token={token} isRealTimeSync={isRealTimeSync} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "ewarranty", label: "E-Warranty", icon: FileText },
    { id: "categories", label: "Categories", icon: Folder },
    { id: "products", label: "Products", icon: Box },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F4EF] font-inter text-stone-800 antialiased overflow-hidden selection:bg-lime-500/30">
      
      {/* --- Ambient Background Effects --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-lime-300/20 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#808000]/10 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
        <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-white rounded-full blur-[100px] opacity-60 animate-blob animation-delay-2000" />
        {/* Noise Texture for 'Futuristic' grit */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      {/* --- Mobile Overlay --- */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-md sm:hidden transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* --- Glass Sidebar --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white/60 backdrop-blur-2xl border-r border-white/50 shadow-[4px_0_30px_rgba(0,0,0,0.02)]
          transform transition-all duration-500 cubic-bezier(0.25, 0.8, 0.25, 1)
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          sm:relative sm:translate-x-0 sm:flex
          ${sidebarCollapsed ? "sm:w-24" : "sm:w-80"}`}
      >
        {/* Header */}
        <div className="p-8 flex-shrink-0 flex items-center justify-between">
          <div className={`flex items-center gap-3 transition-all duration-500 ${sidebarCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-700 to-lime-900 flex items-center justify-center text-white shadow-lg shadow-lime-900/20 relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
               <span className="font-bold text-lg relative z-10">A</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800 tracking-tight leading-none">Anritvox</h2>
              <p className="text-[10px] font-bold text-lime-700 uppercase tracking-[0.2em] mt-1.5">Admin</p>
            </div>
          </div>
          
          {/* Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-stone-400 hover:text-lime-800 hover:bg-lime-50 transition-all"
          >
             <Menu className="w-5 h-5" />
          </button>
           <button
             onClick={() => setMobileMenuOpen(false)}
             className="sm:hidden text-stone-500"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* User Card */}
        <div className={`px-6 mb-8 transition-all duration-300 ${sidebarCollapsed ? "items-center px-4" : ""}`}>
           <div className={`flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-white/80 to-white/40 border border-white/60 shadow-sm backdrop-blur-sm ${sidebarCollapsed ? "justify-center" : ""}`}>
             <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                <User className="w-5 h-5 text-stone-400" />
             </div>
             {!sidebarCollapsed && (
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-stone-800 truncate">Administrator</p>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse"></span>
                    <p className="text-xs text-stone-500 truncate">System Online</p>
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {!sidebarCollapsed && <p className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 ml-1">Overview</p>}
          
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSectionChange(item.id)}
              className={`group flex items-center w-full relative rounded-2xl transition-all duration-300
                ${sidebarCollapsed ? "justify-center py-4" : "px-5 py-4 gap-4"}
                ${section === item.id 
                  ? "bg-stone-800 text-white shadow-xl shadow-stone-800/10" 
                  : "text-stone-500 hover:bg-white/50 hover:text-lime-900"
                }
              `}
            >
              <item.icon 
                className={`
                  ${sidebarCollapsed ? "w-6 h-6" : "w-5 h-5"} 
                  ${section === item.id ? "text-lime-400" : "text-stone-400 group-hover:text-lime-700"} 
                  transition-colors duration-300
                `} 
              />
              
              {!sidebarCollapsed && (
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              )}

              {/* Glowing Indicator for Active State */}
              {section === item.id && (
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-lime-400 rounded-l-full shadow-[0_0_15px_rgba(163,230,53,0.5)] ${sidebarCollapsed ? 'hidden' : ''}`} />
              )}
            </button>
          ))}

          {/* Tools Divider */}
          <div className={`my-6 border-t border-stone-200/50 mx-4 ${sidebarCollapsed ? "opacity-0" : "opacity-100"}`}></div>

          <button
            onClick={() => window.open("https://pranavkumar2601.github.io/serial-number-genrator/", "_blank")}
            className={`group flex items-center w-full rounded-2xl transition-all duration-300 text-stone-500 hover:bg-white/50 hover:text-lime-900
              ${sidebarCollapsed ? "justify-center py-4" : "px-5 py-4 gap-4"}`}
          >
            <Key className={`${sidebarCollapsed ? "w-6 h-6" : "w-5 h-5"} text-stone-400 group-hover:text-lime-700`} />
            {!sidebarCollapsed && <span className="font-medium text-sm">Serial Gen</span>}
          </button>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-2xl transition-all duration-300 group overflow-hidden relative
              ${sidebarCollapsed 
                ? "justify-center h-14 bg-red-50 text-red-500" 
                : "px-5 py-4 gap-3 bg-white/40 border border-white/50 text-stone-600 hover:text-white"
              }`}
          >
            <div className={`absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${sidebarCollapsed ? 'hidden' : ''}`}></div>
            
            <LogOut className={`w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1 ${sidebarCollapsed ? "" : "text-stone-400 group-hover:text-white"}`} />
            {!sidebarCollapsed && <span className="font-medium text-sm relative z-10">Logout</span>}
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden z-10">
        
        {/* Glass Top Bar */}
        <header className="h-24 px-8 flex items-center justify-between bg-white/30 backdrop-blur-md border-b border-white/40 sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-xl bg-white/60 text-stone-600 shadow-sm border border-white/60"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden md:block">
               <div className="flex items-center gap-2 mb-1">
                 <span className="px-2 py-0.5 rounded-md bg-lime-100 text-[10px] font-bold text-lime-800 tracking-wider uppercase">Beta v2.0</span>
               </div>
               <h1 className="text-2xl font-bold text-stone-800 tracking-tight capitalize">
                 {section === "dashboard" ? "Overview" : section.replace("-", " ")}
               </h1>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Search (Futuristic Pill) */}
            <div className="hidden lg:flex items-center px-2 py-2 bg-white/40 border border-white/60 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-lime-500/20 focus-within:bg-white/80 transition-all w-72 group">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-stone-400 group-focus-within:text-lime-600 transition-colors">
                 <Search className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                placeholder="Type to search..." 
                className="bg-transparent border-none outline-none text-sm ml-3 w-full text-stone-600 placeholder:text-stone-400/80" 
              />
              <div className="pr-3">
                 <kbd className="hidden group-focus-within:inline-block px-1.5 py-0.5 text-[10px] font-bold text-stone-400 bg-stone-100 rounded border border-stone-200">ESC</kbd>
              </div>
            </div>

            <button className="relative p-3 rounded-full bg-white/40 hover:bg-white border border-white/60 text-stone-500 hover:text-lime-700 transition-all shadow-sm group">
              <Bell className="w-5 h-5 group-hover:animate-swing" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Sync Status (Advanced Pill) */}
            <div className="flex items-center gap-1 bg-white/40 backdrop-blur-md pl-4 pr-1.5 py-1.5 rounded-full border border-white/60 shadow-sm">
               <div className="flex flex-col items-end mr-3">
                  <div className="flex items-center gap-1.5">
                     <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-lime-500 shadow-[0_0_10px_rgba(132,204,22,0.8)] animate-pulse' : 'bg-red-500'}`}></span>
                     <span className="text-[10px] font-bold text-stone-700 uppercase tracking-widest">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                  </div>
                  <span className="text-[9px] text-stone-400 font-mono tracking-tight">SYNC: {lastSync.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
               </div>
               
               <button 
                 onClick={triggerSync}
                 disabled={!isOnline || isSyncing}
                 className={`w-9 h-9 flex items-center justify-center rounded-full bg-stone-800 text-lime-400 hover:bg-lime-500 hover:text-white transition-all shadow-lg ${isSyncing ? 'animate-spin' : ''}`}
               >
                 <RefreshCw className="w-4 h-4" />
               </button>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto min-h-full">
             <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-8 h-full animate-fade-in-up">
                {renderSection()}
             </div>
          </div>
        </div>
      </main>

      {/* Global CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        /* Futuristic Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d6d3d1;
          border-radius: 100vh;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #84cc16;
          border: 0;
        }

        /* Ambient Blob Animation */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        /* Bell Swing */
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          80% { transform: rotate(-5deg); }
        }
        .group:hover .animate-swing {
          animation: swing 0.5s ease-in-out;
        }

        /* Fade In Up */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}

// =========================================================================
// PLACEHOLDER COMPONENTS (Usually separate files, merged here for preview)
// =========================================================================

function DashboardOverview({ isRealTimeSync }) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: "₹4,23,000", change: "+12.5%", trend: "up", icon: TrendingUp, color: "text-lime-600", bg: "bg-lime-50" },
          { label: "Active Orders", value: "86", change: "+5%", trend: "up", icon: Box, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "New Customers", value: "128", change: "+18%", trend: "up", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Pending Issues", value: "3", change: "-2%", trend: "down", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="relative group bg-white/60 p-6 rounded-3xl border border-white/60 shadow-sm hover:shadow-xl transition-all duration-300">
             <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
             </div>
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-sm font-medium text-stone-500 mb-1">{stat.label}</p>
                   <h3 className="text-3xl font-bold text-stone-800 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {stat.change}
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Glass Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/50 p-8 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden group">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-stone-700">Revenue Analytics</h3>
              <select className="bg-white/50 border border-stone-200 text-stone-600 text-xs rounded-lg px-3 py-1 outline-none">
                 <option>This Week</option>
                 <option>This Month</option>
              </select>
           </div>
           
           {/* Mock Chart Lines */}
           <div className="h-64 flex items-end justify-between gap-2 px-4 relative z-10">
              {[40, 60, 45, 70, 50, 80, 65, 85, 90, 75, 60, 95].map((h, i) => (
                 <div key={i} className="w-full bg-gradient-to-t from-lime-500/10 to-lime-500 rounded-t-lg transition-all duration-500 group-hover:to-lime-400" style={{ height: `${h}%` }}></div>
              ))}
           </div>
           
           {/* Chart Grid Lines */}
           <div className="absolute inset-0 top-20 px-8 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full h-px bg-stone-400 border-dashed border-t"></div>
              <div className="w-full h-px bg-stone-400 border-dashed border-t"></div>
              <div className="w-full h-px bg-stone-400 border-dashed border-t"></div>
              <div className="w-full h-px bg-stone-400 border-dashed border-t"></div>
           </div>
        </div>

        <div className="bg-stone-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/20 rounded-full blur-3xl"></div>
           <h3 className="text-lg font-bold mb-6 relative z-10">System Health</h3>
           <div className="space-y-6 relative z-10">
              <div>
                 <div className="flex justify-between text-xs mb-2 text-stone-400">
                    <span>Server Load</span>
                    <span>32%</span>
                 </div>
                 <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-lime-500 h-full rounded-full w-[32%] shadow-[0_0_10px_rgba(132,204,22,0.5)]"></div>
                 </div>
              </div>
              <div>
                 <div className="flex justify-between text-xs mb-2 text-stone-400">
                    <span>Database</span>
                    <span>Safe</span>
                 </div>
                 <div className="w-full bg-stone-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full w-[85%]"></div>
                 </div>
              </div>
              <div className="pt-4 mt-4 border-t border-stone-700">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-stone-700 rounded-lg">
                       <Cpu className="w-5 h-5 text-lime-400" />
                    </div>
                    <div>
                       <p className="text-sm font-bold">All Systems Operational</p>
                       <p className="text-xs text-stone-500">{isRealTimeSync ? "Live Monitoring" : "Paused"}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function EWarrantyManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h3 className="text-xl font-bold text-stone-800">E-Warranty Claims</h3>
           <p className="text-sm text-stone-500">Manage customer warranty requests</p>
        </div>
        <button className="bg-stone-800 hover:bg-stone-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-stone-800/20 transition-all font-medium flex items-center gap-2">
           <span>+ New Claim</span>
        </button>
      </div>

      <div className="bg-white/60 rounded-3xl border border-white/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-stone-100/50 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="p-6 font-semibold">Claim ID</th>
                    <th className="p-6 font-semibold">Product</th>
                    <th className="p-6 font-semibold">Customer</th>
                    <th className="p-6 font-semibold">Status</th>
                    <th className="p-6 font-semibold">Date</th>
                    <th className="p-6 font-semibold text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                 {[101, 102, 103, 104].map((id, idx) => (
                    <tr key={id} className="hover:bg-white/50 transition-colors">
                       <td className="p-6 font-mono text-sm text-stone-600">#WR-{2024}-{id}</td>
                       <td className="p-6 font-medium text-stone-800">Android Stereo X{idx}</td>
                       <td className="p-6 text-stone-600 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                          John Doe
                       </td>
                       <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${idx % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                             {idx % 2 === 0 ? 'Approved' : 'Pending'}
                          </span>
                       </td>
                       <td className="p-6 text-stone-500 text-sm">Oct {10+idx}, 2024</td>
                       <td className="p-6 text-right">
                          <button className="text-stone-400 hover:text-lime-600 transition-colors">View</button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

function CategoryManagement() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
       <div className="w-24 h-24 bg-lime-100 rounded-full flex items-center justify-center mb-6 animate-blob">
          <Folder className="w-10 h-10 text-lime-600" />
       </div>
       <h3 className="text-2xl font-bold text-stone-800 mb-2">Category Management</h3>
       <p className="text-stone-500 max-w-md mx-auto mb-8">Organize your product catalog efficiently. Create, edit, and delete categories and sub-categories here.</p>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {['Electronics', 'Audio', 'Accessories'].map((cat) => (
             <div key={cat} className="bg-white/60 p-6 rounded-2xl border border-white/60 hover:border-lime-300 transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                   <Folder className="w-6 h-6 text-stone-400 group-hover:text-lime-600 transition-colors" />
                   <span className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded">12 items</span>
                </div>
                <h4 className="font-bold text-left">{cat}</h4>
             </div>
          ))}
       </div>
    </div>
  );
}

function ProductManagement() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-stone-800">Inventory</h3>
          <div className="flex gap-2">
             <button className="p-2 bg-white/60 rounded-lg border border-white/60 text-stone-500 hover:text-stone-800"><Search className="w-5 h-5"/></button>
             <button className="bg-lime-500 hover:bg-lime-400 text-white px-4 py-2 rounded-lg shadow-lg shadow-lime-500/20 font-medium">Add Product</button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
             <div key={item} className="bg-white/60 rounded-3xl border border-white/60 p-4 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="h-40 bg-stone-100 rounded-2xl mb-4 relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                      <Box className="w-12 h-12" />
                   </div>
                   <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-stone-600">
                      In Stock
                   </div>
                </div>
                <h4 className="font-bold text-stone-800 mb-1">Premium Car Stereo Z{item}</h4>
                <p className="text-xs text-stone-500 mb-4">SKU: AN-2024-00{item}</p>
                <div className="flex justify-between items-center">
                   <span className="font-mono font-bold text-lime-700">₹12,999</span>
                   <button className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors">
                      <Menu className="w-4 h-4" />
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
