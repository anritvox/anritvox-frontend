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

  // Real-time sync monitoring
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
    { id: \"dashboard\", label: \"Dashboard Overview\", icon: FiHome },
    { id: \"products\", label: \"Product Management\", icon: FiBox },
    { id: \"categories\", label: \"Category Management\", icon: FiFolder },
    { id: \"ewarranty\", label: \"E-Warranty Database\", icon: FiFileText },
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
    <div className=\"min-h-screen bg-[#f3f3f3] font-sans antialiased flex flex-col\">
      {/* Top Navbar - Amazon Style */}
      <header className=\"bg-[#131921] text-white h-16 flex items-center px-4 sticky top-0 z-50\">
        <div className=\"flex items-center gap-4 w-full\">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className=\"sm:hidden p-2 hover:border border-white rounded-sm\"
          >
            <FiMenu className=\"h-6 w-6\" />
          </button>

          <div 
            onClick={() => navigate(\"/\")}
            className=\"flex items-center cursor-pointer p-2 hover:border border-white rounded-sm\"
          >
            <h1 className=\"text-xl font-bold tracking-tight\">anritvox</h1>
            <span className=\"text-[#febd69] text-xs ml-1 pt-1 font-bold\">admin</span>
          </div>

          <div className=\"hidden md:flex flex-1 max-w-2xl ml-4\">
            <div className=\"flex w-full group\">
              <input 
                type=\"text\" 
                placeholder=\"Search admin dashboard...\" 
                className=\"flex-1 p-2 rounded-l-md text-black focus:outline-none focus:ring-2 focus:ring-[#f3a847]\"
              />
              <button className=\"bg-[#febd69] hover:bg-[#f3a847] p-2 rounded-r-md transition-colors\">
                <FiSearch className=\"h-5 w-5 text-[#131921]\" />
              </button>
            </div>
          </div>

          <div className=\"flex items-center gap-2 ml-auto\">
            <div className=\"hidden lg:flex items-center gap-2 px-3 py-1 border border-white/20 rounded-md bg-white/5\">
              <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className=\"text-xs font-medium\">{isOnline ? 'Live' : 'Offline'}</span>
            </div>
            
            <div className=\"hidden sm:flex flex-col px-3 py-1 hover:border border-white rounded-sm cursor-pointer border border-transparent\">
              <span className=\"text-[10px] text-gray-400 leading-none\">Hello, Admin</span>
              <span className=\"text-sm font-bold leading-none mt-1 text-[#febd69]\">Systems Control</span>
            </div>

            <button 
              onClick={handleLogout}
              className=\"flex items-center gap-1 px-3 py-2 border border-transparent hover:border-white rounded-sm text-sm font-bold transition-all\"
            >
              <FiLogOut className=\"h-4 w-4\" />
              <span className=\"hidden md:inline\">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className=\"flex flex-1 relative overflow-x-hidden\">
        {/* Amazon Sidebar - Dark Blue Style */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          sm:relative sm:translate-x-0 border-r border-gray-200
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className=\"h-full flex flex-col\">
            <div className=\"p-4 bg-[#232f3e] text-white flex items-center justify-between\">
              <div className=\"flex items-center gap-2\">
                <div className=\"p-1.5 bg-white/10 rounded-md\">
                  <FiSettings className=\"h-5 w-5 text-[#febd69]\" />
                </div>
                <span className=\"font-bold\">Admin Portal</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className=\"sm:hidden text-white hover:text-[#febd69]\">
                <FiX className=\"h-6 w-6\" />
              </button>
            </div>

            <nav className=\"flex-1 p-2 space-y-0.5 overflow-y-auto\">
              <p className=\"px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2\">Core Features</p>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all
                    ${section === item.id 
                      ? 'bg-gray-100 text-[#c45500] shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-black'}
                  `}
                >
                  <item.icon className={`h-5 w-5 ${section === item.id ? 'text-[#c45500]' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              ))}

              <p className=\"px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6\">System Status</p>
              <div className=\"mx-2 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3\">
                <div className=\"flex items-center justify-between\">
                  <div className=\"flex items-center gap-2\">
                    {isOnline ? <FiWifi className=\"h-4 w-4 text-green-500\" /> : <FiWifiOff className=\"h-4 w-4 text-red-500\" />}
                    <span className=\"text-xs font-semibold\">{isOnline ? 'Active' : 'Offline'}</span>
                  </div>
                  <button onClick={triggerSync} disabled={!isOnline || isSyncing} className=\"p-1 hover:bg-white rounded shadow-sm transition-all active:scale-95\">
                    <FiRefreshCw className={`h-3.5 w-3.5 text-gray-400 ${isSyncing ? 'animate-spin text-[#c45500]' : ''}`} />
                  </button>
                </div>
                <div className=\"flex items-center justify-between pt-2 border-t border-gray-200\">
                  <span className=\"text-[10px] font-medium text-gray-500\">Auto-Sync</span>
                  <label className=\"relative inline-flex items-center cursor-pointer scale-90\">
                    <input type=\"checkbox\" checked={isRealTimeSync} onChange={(e) => setIsRealTimeSync(e.target.checked)} className=\"sr-only peer\" />
                    <div className=\"w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c45500]\"></div>
                  </label>
                </div>
              </div>

              <p className=\"px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6\">External</p>
              <button 
                onClick={() => window.open(\"https://pranavkumar2601.github.io/serial-number-genrator/\", \"_blank\")}
                className=\"w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-all\"
              >
                <FiExternalLink className=\"h-5 w-5 text-gray-400\" />
                <span>Serial Generator</span>
              </button>
            </nav>

            <div className=\"p-4 border-t bg-gray-50\">
              <div className=\"flex items-center gap-3 px-2 py-2\">
                <div className=\"h-8 w-8 rounded-full bg-[#131921] flex items-center justify-center text-[#febd69] font-bold text-xs\">A</div>
                <div className=\"flex flex-col overflow-hidden\">
                  <span className=\"text-xs font-bold truncate\">System Admin</span>
                  <span className=\"text-[10px] text-gray-500 truncate\">Last sync: {lastSync.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className=\"flex-1 p-4 md:p-6 lg:p-10 overflow-y-auto\">
          <div className=\"max-w-7xl mx-auto\">
            {/* Page Header */}
            <div className=\"mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4\">
              <div>
                <nav className=\"flex text-xs text-gray-500 mb-2 font-medium\">
                  <span className=\"hover:text-[#c45500] cursor-pointer\">Admin Dashboard</span>
                  <span className=\"mx-1 text-gray-400\">›</span>
                  <span className=\"text-gray-900 font-bold capitalize\">{section}</span>
                </nav>
                <h1 className=\"text-3xl font-bold text-[#111] capitalize\">
                  {section === \"dashboard\" ? \"Dashboard Overview\" : section.replace(\"-\", \" \")}
                </h1>
                <p className=\"text-sm text-gray-500 mt-1\">Manage your storefront data and system settings in real-time.</p>
              </div>
              <div className=\"flex items-center gap-2\">
                <button 
                  onClick={triggerSync}
                  className=\"px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2\"
                >
                  <FiRefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Component Render Wrapper - Amazon Card Style */}
            <div className=\"bg-white rounded-lg shadow-[0_2px_5px_0_rgba(213,217,217,.5)] border border-[#d5d9d9] min-h-[600px] overflow-hidden\">
              <div className=\"p-6\">
                {renderSection()}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mini Footer - Amazon Style */}
      <footer className=\"bg-[#131921] text-white py-10 mt-auto border-t-8 border-[#232f3e]\">
        <div className=\"max-w-7xl mx-auto px-4 text-center\">
          <div className=\"flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6 text-sm font-medium\">
            <span className=\"hover:underline cursor-pointer\">Conditions of Use</span>
            <span className=\"hover:underline cursor-pointer\">Privacy Notice</span>
            <span className=\"hover:underline cursor-pointer\">System Help</span>
            <span className=\"hover:underline cursor-pointer\">Contact Support</span>
          </div>
          <p className=\"text-xs text-gray-400\">© 2026 Anritvox Admin Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
