import React, { useState, useEffect } from \"react\";
import { useNavigate } from \"react-router-dom\";
import DashboardOverview from \"./admin/DashboardOverview\";
import EWarrantyManagement from \"./admin/EWarrantyManagement\";
import CategoryManagement from \"./admin/CategoryManagement\";
import ProductManagement from \"./admin/ProductManagement\";
import {
  FiHome,
  FiFileText,
  FiFolder,
  FiBox,
  FiLogOut,
  FiMenu,
  FiX,
  FiSearch,
  FiSettings,
  FiWifi,
  FiWifiOff,
  FiRefreshCw,
  FiExternalLink,
  FiMoon,
  FiSun,
} from \"react-icons/fi\";

export default function AdminDashboard() {
  const [section, setSection] = useState(\"dashboard\");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const [isRealTimeSync, setIsRealTimeSync] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem(\"ms_token\");

  useEffect(() => {
    if (!token) navigate(\"/admin/login\");
  }, [token, navigate]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isRealTimeSync) triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener(\"online\", handleOnline);
    window.addEventListener(\"offline\", handleOffline);

    const syncInterval = setInterval(() => {
      if (navigator.onLine && isRealTimeSync) triggerSync();
    }, 30000);

    return () => {
      window.removeEventListener(\"online\", handleOnline);
      window.removeEventListener(\"offline\", handleOffline);
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
    localStorage.removeItem(\"ms_token\");
    navigate(\"/admin/login\");
  };

  const menuItems = [
    { id: \"dashboard\", label: \"Overview\", icon: FiHome, color: \"text-cyan-400\" },
    { id: \"products\", label: \"Inventory\", icon: FiBox, color: \"text-purple-400\" },
    { id: \"categories\", label: \"Categories\", icon: FiFolder, color: \"text-pink-400\" },
    { id: \"ewarranty\", label: \"Security\", icon: FiFileText, color: \"text-emerald-400\" },
  ];

  const renderSection = () => {
    const props = { token, isRealTimeSync };
    switch (section) {
      case \"dashboard\": return <DashboardOverview {...props} />;
      case \"ewarranty\": return <EWarrantyManagement {...props} />;
      case \"categories\": return <CategoryManagement {...props} />;
      case \"products\": return <ProductManagement {...props} />;
      default: return <DashboardOverview {...props} />;
    }
  };

  return (
    <div className=\"min-h-screen bg-[#0a0b10] text-gray-100 font-sans antialiased flex flex-col overflow-hidden\">
      {/* Glow Effects */}
      <div className=\"fixed top-0 left-0 w-full h-full pointer-events-none z-0\">
        <div className=\"absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full\" />
        <div className=\"absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full\" />
      </div>

      {/* Top Navbar - Neon Glassmorphism */}
      <header className=\"bg-[#0f111a]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-6 sticky top-0 z-50\">
        <div className=\"flex items-center gap-4 w-full\">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className=\"sm:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors\"
          >
            <FiMenu className=\"h-6 w-6\" />
          </button>
          
          <div 
            onClick={() => navigate(\"/\")}
            className=\"flex items-center cursor-pointer group\"
          >
            <div className=\"h-8 w-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all\">
              <span className=\"text-black font-black text-lg\">A</span>
            </div>
            <div className=\"ml-3 hidden sm:block\">
              <h1 className=\"text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400\">
                Anritvox<span className=\"text-cyan-400 font-black ml-1\">OS</span>
              </h1>
            </div>
          </div>

          <div className=\"hidden md:flex flex-1 max-w-xl ml-10\">
            <div className=\"relative w-full group\">
              <FiSearch className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors\" />
              <input 
                type=\"text\" 
                placeholder=\"Search command center...\" 
                className=\"w-full bg-[#161b22]/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm\"
              />
            </div>
          </div>

          <div className=\"flex items-center gap-4 ml-auto\">
            <div className=\"hidden lg:flex items-center gap-3 px-3 py-1.5 bg-[#161b22]/50 border border-white/5 rounded-full backdrop-blur-sm\">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
              <span className=\"text-[10px] font-bold uppercase tracking-widest text-gray-400\">
                {isOnline ? 'System Online' : 'Offline Mode'}
              </span>
            </div>
            
            <button className=\"p-2 text-gray-400 hover:text-cyan-400 transition-colors\">
              <FiSettings className=\"h-5 w-5\" />
            </button>
            <div className=\"h-8 w-[1px] bg-white/5 mx-1\" />
            <button 
              onClick={handleLogout}
              className=\"flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-bold border border-red-500/20 transition-all active:scale-95\"
            >
              <FiLogOut className=\"h-4 w-4\" />
              <span className=\"hidden md:inline\">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className=\"flex flex-1 relative overflow-hidden z-10\">
        {/* Sidebar - Modern Neon */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0b10]/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out
          sm:relative sm:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className=\"h-full flex flex-col p-4\">
            <div className=\"flex items-center justify-between mb-8 px-2\">
              <span className=\"text-xs font-black uppercase tracking-[0.2em] text-gray-500\">Core Modules</span>
              <button onClick={() => setMobileMenuOpen(false)} className=\"sm:hidden text-gray-400 hover:text-white\">
                <FiX className=\"h-6 w-6\" />
              </button>
            </div>

            <nav className=\"flex-1 space-y-2\">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group
                    ${section === item.id 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-2 border-cyan-400' 
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}
                  `}
                >
                  <item.icon className={`h-5 w-5 ${section === item.id ? 'text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]' : 'group-hover:text-cyan-400'} transition-colors`} />
                  {item.label}
                </button>
              ))}

              <div className=\"pt-8 px-2\">
                <span className=\"text-xs font-black uppercase tracking-[0.2em] text-gray-500\">Utilities</span>
              </div>
              
              <button 
                onClick={() => window.open(\"https://pranavkumar2601.github.io/serial-number-genrator/\", \"_blank\")}
                className=\"w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all group\"
              >
                <FiExternalLink className=\"h-5 w-5 group-hover:text-purple-400\" />
                Serial Key Gen
              </button>
            </nav>

            <div className=\"mt-auto p-4 bg-[#161b22]/50 border border-white/5 rounded-2xl backdrop-blur-sm\">
              <div className=\"flex items-center gap-3\">
                <div className=\"h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-black\">
                  PK
                </div>
                <div className=\"flex flex-col overflow-hidden\">
                  <span className=\"text-sm font-bold text-white truncate\">Pranav Kumar</span>
                  <span className=\"text-[10px] text-cyan-400/70 font-mono uppercase tracking-tighter\">Master Administrator</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className=\"flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 custom-scrollbar\">
          <div className=\"max-w-7xl mx-auto\">
            {/* Header */}
            <div className=\"mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6\">
              <div>
                <div className=\"flex items-center gap-2 text-[10px] font-bold text-cyan-400/50 uppercase tracking-[0.3em] mb-2\">
                  <FiSettings className=\"h-3 w-3\" />
                  Terminal / {section}
                </div>
                <h1 className=\"text-4xl font-black text-white tracking-tight\">
                  {section === \"dashboard\" ? \"System Monitor\" : section.charAt(0).toUpperCase() + section.slice(1)}
                </h1>
                <p className=\"text-gray-500 mt-2 text-sm font-medium\">Real-time analytical data and system management portal.</p>
              </div>

              <div className=\"flex items-center gap-3\">
                <div className=\"px-4 py-2 bg-[#161b22]/50 border border-white/5 rounded-xl flex items-center gap-3 backdrop-blur-sm\">
                  <span className=\"text-[10px] font-bold text-gray-500 uppercase\">Last Update:</span>
                  <span className=\"text-xs font-mono text-cyan-400\">{lastSync.toLocaleTimeString()}</span>
                </div>
                <button 
                  onClick={triggerSync}
                  className=\"p-3 bg-cyan-400 text-black rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] hover:scale-105 active:scale-95 transition-all\"
                >
                  <FiRefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className=\"relative\">
              <div className=\"absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full\" />
              <div className=\"relative bg-[#0f111a]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] min-h-[600px] shadow-2xl overflow-hidden\">
                <div className=\"p-1\">
                  <div className=\"p-8\">
                    {renderSection()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.2); }
        
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .scanline {
          position: fixed; top: 0; left: 0; width: 100%; height: 2px;
          background: rgba(34,211,238,0.02);
          animation: scanline 8s linear infinite;
          pointer-events: none; z-index: 100;
        }
      `}</style>
      <div className=\"scanline\" />
    </div>
  );
}
