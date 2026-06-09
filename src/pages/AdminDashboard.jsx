import React, { useState, Suspense, Component } from 'react'; 
import { useNavigate, useParams } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import { 
  LogOut, LayoutDashboard, Package, Grid, Users, Settings, ShoppingBag, Menu, X, 
  ShieldCheck, RefreshCw, Tag, Archive, Star, Activity, Mail, Terminal, Bell, Search, 
  Zap, Gift, Share2, Headphones, BarChart3, Wrench, Wallet, Smartphone, Store, 
  Globe, Shield, Database, Cpu, HardDrive, Layers, Box, Truck, CreditCard, 
  FileText, MessageSquare, AlertCircle, TrendingUp, Clock, Monitor, Download, CheckCircle, XCircle 
} from 'lucide-react'; 


import DashboardOverview from './admin/DashboardOverview'; 
import ProductManagement from './admin/ProductManagement'; 
import CategoryManagement from './admin/CategoryManagement'; 
import OrderManagement from './admin/OrderManagement'; 
import UserManagement from './admin/UserManagement'; 
import EWarrantyManagement from './admin/EWarrantyManagement'; 
import AnalyticsManagement from './admin/AnalyticsManagement'; 
import InventoryManagement from './admin/InventoryManagement'; 
import CouponManagement from './admin/CouponManagement'; 
import ReviewManagement from './admin/ReviewManagement'; 
import BannerManagement from './admin/BannerManagement'; 
import ContactManagement from './admin/ContactManagement'; 
import ReturnManagement from './admin/ReturnManagement'; 
import AdminSettings from './admin/AdminSettings'; 
import SupportManagement from './admin/SupportManagement'; 
import FlashSalesManagement from './admin/FlashSalesManagement'; 
import LoyaltyManagement from './admin/LoyaltyManagement'; 
import AffiliateManagement from './admin/AffiliateManagement'; 
import WalletManagement from './admin/WalletManagement'; 
import NotificationManagement from './admin/NotificationManagement'; 
import ShippingManagement from './admin/ShippingManagement'; 
import TaxManagement from './admin/TaxManagement'; 
import SystemLogs from './admin/SystemLogs'; 
import CMSManagement from './admin/CMSManagement'; 
import EmailTemplates from './admin/EmailTemplates'; 
import FitmentMatrix from './admin/FitmentMatrix'; 
import WarehouseManagement from './admin/WarehouseManagement'; 


import FinancialLedger from './admin/FinancialLedger';
import AwaitingDeployment from './admin/AwaitingDeployment';

class ErrorBoundary extends Component { 
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  componentDidCatch(error, info) { 
    console.error("Kernel intercepted module exception:", error, info); 
  }
  render() { 
    if (this.state.hasError) { 
      return ( 
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-slate-950/50 backdrop-blur-md rounded-2xl border border-rose-500/20"> 
          <AlertCircle size={48} className="text-rose-400 mb-4 animate-pulse" /> 
          <h2 className="text-xl font-bold text-white mb-2 tracking-wide">Kernel Panic Intercepted</h2> 
          <p className="text-slate-400 mb-6 max-w-md text-sm font-mono">{this.state.error?.message || 'Module execution halted.'}</p> 
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300" 
          > 
            Hot Reboot Module 
          </button> 
        </div> 
      ); 
    } 
    return this.props.children; 
  }
}


const TAB_COMPONENTS = { 
  overview: DashboardOverview, 
  products: ProductManagement, 
  categories: CategoryManagement, 
  inventory: InventoryManagement, 
  orders: OrderManagement, 
  returns: ReturnManagement, 
  'flash-sales': FlashSalesManagement, 
  coupons: CouponManagement, 
  users: UserManagement, 
  support: SupportManagement, 
  reviews: ReviewManagement, 
  loyalty: LoyaltyManagement, 
  affiliate: AffiliateManagement, 
  ewarranty: EWarrantyManagement, 
  analytics: AnalyticsManagement, 
  banners: BannerManagement, 
  contact: ContactManagement, 
  settings: AdminSettings, 
  wallet: WalletManagement, 
  notifications: NotificationManagement, 
  shipping: ShippingManagement, 
  tax: TaxManagement, 
  logs: SystemLogs, 
  cms: CMSManagement, 
  email: EmailTemplates, 
  fitment: FitmentMatrix, 
  warehouse: WarehouseManagement, 
  reports: FinancialLedger,
  mobile: () => <AwaitingDeployment moduleName="OTP Gateway Route Routing" systemSubsystem="CELLULAR_GATEWAY_NODE" />, 
  seo: () => <AwaitingDeployment moduleName="Search Engine Spider Matrix" systemSubsystem="SEO_METADATA_CRAWLER" />, 
  database: () => <AwaitingDeployment moduleName="Distributed Database Cluster" systemSubsystem="MYSQL_REPLICATION_POOL" />, 
  api: () => <AwaitingDeployment moduleName="Asynchronous Webhook Pipelines" systemSubsystem="WEBHOOK_INGRESS_MATRIX" />, 
  security: () => <AwaitingDeployment moduleName="Web Application Firewall (WAF)" systemSubsystem="EDGE_ARMOR_FILTRATION" />, 
  backups: () => <AwaitingDeployment moduleName="Disaster Recovery Snapshot Vault" systemSubsystem="HOT_CLOUD_BLOB_BACKUP" />, 
  translations: () => <AwaitingDeployment moduleName="Global Translation Matrix (i18n)" systemSubsystem="LOCALIZATION_ENGINE" />, 
  ads: () => <AwaitingDeployment moduleName="Ad Network Pixel Core" systemSubsystem="MARKETING_PIXEL_AGGREGATOR" />, 
  performance: () => <AwaitingDeployment moduleName="Server Vitals Telemetry Hub" systemSubsystem="NODE_TELEMETRY_DAEMON" />, 
  terminal: () => <AwaitingDeployment moduleName="Root Superuser Terminal Shell" systemSubsystem="BASH_CORE_INTERCEPT" />
}; 

export default function AdminDashboard() { 
  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
  const { tab } = useParams(); 
  const activeTab = tab || 'overview'; 
  const [isSidebarOpen, setSidebarOpen] = useState(true); 

  const menuSections = [ 
    { 
      title: 'Command', items: [ 
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard }, 
        { id: 'analytics', label: 'Intelligence', icon: BarChart3 }, 
        { id: 'notifications', label: 'Alerts', icon: Bell }, 
        { id: 'logs', label: 'Telemetry', icon: Terminal } 
      ] 
    }, 
    { 
      title: 'Commerce', items: [ 
        { id: 'orders', label: 'Fulfillment', icon: ShoppingBag }, 
        { id: 'wallet', label: 'Vault', icon: Wallet }, 
        { id: 'tax', label: 'Taxation', icon: CreditCard }, 
        { id: 'reports', label: 'Ledger', icon: FileText } 
      ] 
    }, 
    { 
      title: 'Matrix', items: [ 
        { id: 'products', label: 'Registry', icon: Package }, 
        { id: 'categories', label: 'Taxonomy', icon: Grid }, 
        { id: 'fitment', label: 'Compatibility', icon: Wrench }, 
        { id: 'inventory', label: 'Stock', icon: Archive }, 
        { id: 'warehouse', label: 'Warehouse', icon: Store } 
      ] 
    }, 
    { 
      title: 'Growth', items: [ 
        { id: 'loyalty', label: 'Loyalty', icon: Gift }, 
        { id: 'affiliate', label: 'Syndicate', icon: Share2 }, 
        { id: 'coupons', label: 'Logic Gates', icon: Tag }, 
        { id: 'flash-sales', label: 'Temporal Sales', icon: Zap }, 
        { id: 'reviews', label: 'Feedback', icon: Star } 
      ] 
    }, 
    { 
      title: 'Interface', items: [ 
        { id: 'cms', label: 'Frontend Node', icon: Monitor }, 
        { id: 'banners', label: 'Visuals', icon: Activity }, 
        { id: 'seo', label: 'SEO Protocol', icon: Search }, 
        { id: 'email', label: 'SMTP Routes', icon: Mail } 
      ] 
    }, 
    { 
      title: 'Relations', items: [ 
        { id: 'support', label: 'Helpdesk', icon: Headphones }, 
        { id: 'returns', label: 'Reversal', icon: RefreshCw }, 
        { id: 'contact', label: 'Comms', icon: MessageSquare }, 
        { id: 'ewarranty', label: 'Shield', icon: ShieldCheck } 
      ] 
    }, 
    { 
      title: 'Core', items: [ 
        { id: 'mobile', label: 'Gateway', icon: Smartphone }, 
        { id: 'security', label: 'WAF', icon: Shield }, 
        { id: 'database', label: 'Cluster', icon: Database }, 
        { id: 'api', label: 'Webhooks', icon: Cpu }, 
        { id: 'shipping', label: 'Logistics', icon: Truck }, 
        { id: 'settings', label: 'Variables', icon: Settings } 
      ] 
    } 
  ]; 

  const ActiveComponent = TAB_COMPONENTS[activeTab] || DashboardOverview; 

  return ( 
    <> 
      <style>{` 
        .sidebar-scroll::-webkit-scrollbar, 
        .content-scroll::-webkit-scrollbar { 
          width: 8px; 
        } 
        .sidebar-scroll::-webkit-scrollbar-track, 
        .content-scroll::-webkit-scrollbar-track { 
          background: #0a0b10; 
        } 
        .sidebar-scroll::-webkit-scrollbar-thumb, 
        .content-scroll::-webkit-scrollbar-thumb { 
          background-color: rgba(16, 185, 129, 0.4); 
          border-radius: 4px; 
        } 
        .sidebar-scroll::-webkit-scrollbar-thumb:hover, 
        .content-scroll::-webkit-scrollbar-thumb:hover { 
          background-color: rgba(16, 185, 129, 0.7); 
        } 
        .sidebar-scroll, 
        .content-scroll { 
          scrollbar-width: thin; 
          scrollbar-color: rgba(16, 185, 129, 0.4) #0a0b10; 
        } 
      `}</style> 
      <div className="flex h-screen bg-[#050810] overflow-hidden selection:bg-emerald-500/30"> 
        <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sidebar-scroll flex-shrink-0 bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/50 flex flex-col overflow-y-auto relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.4)]`}> 
          <div className="flex items-center gap-4 px-5 py-6 border-b border-slate-800/50 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-10"> 
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"> 
              <span className="text-slate-950 font-black text-sm tracking-tighter">AV</span> 
            </div> 
            <div className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'w-32 opacity-100' : 'w-0 opacity-0'}`}> 
              <span className="text-white font-black tracking-[0.15em] text-sm block">ANRITVOX</span> 
              <span className="text-emerald-500 font-mono text-[9px] uppercase tracking-widest block">Root Access</span> 
            </div> 
          </div> 
          <div className="flex-1 py-6 px-3 space-y-6"> 
            {menuSections.map((section, idx) => ( 
              <div key={idx} className="space-y-1 relative group"> 
                <div className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'h-6 opacity-100' : 'h-0 opacity-0'}`}> 
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-3"> 
                    {section.title} 
                  </p> 
                </div> 
                {section.items.map((item) => { 
                  const isActive = activeTab === item.id; 
                  return ( 
                    <button 
                      key={item.id} 
                      onClick={() => navigate(`/admin/dashboard/${item.id}`)} 
                      className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-300 group/btn relative overflow-hidden ${ 
                        isActive ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' : 'hover:bg-slate-800/40 border border-transparent' 
                      } ${!isSidebarOpen && 'justify-center'}`} 
                    > 
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />} 
                      <item.icon size={20} className={`flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover/btn:text-slate-300'}`} /> 
                      <div className={`overflow-hidden transition-all duration-500 whitespace-nowrap ${isSidebarOpen ? 'w-full ml-3 opacity-100' : 'w-0 ml-0 opacity-0'}`}> 
                        <span className={`text-sm font-semibold tracking-wide flex justify-start ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover/btn:text-white'}`}> 
                          {item.label} 
                        </span> 
                      </div> 
                    </button> 
                  ); 
                })} 
              </div> 
            ))} 
          </div> 
          <div className="p-4 border-t border-slate-800/50 bg-slate-950/90 backdrop-blur-xl sticky bottom-0 z-10"> 
            <button 
              onClick={() => { logout(); navigate('/admin/login'); }} 
              className={`w-full flex items-center py-3 rounded-xl transition-all duration-300 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent text-slate-500 hover:text-rose-400 ${!isSidebarOpen ? 'justify-center px-0' : 'px-4 gap-3'}`} 
            > 
              <LogOut size={20} className="flex-shrink-0" /> 
              <div className={`overflow-hidden transition-all duration-500 ${isSidebarOpen ? 'w-full opacity-100' : 'w-0 opacity-0'}`}> 
                <span className="text-sm font-bold flex justify-start tracking-wide">Disconnect</span> 
              </div> 
            </button> 
          </div> 
        </div> 
        <div className="flex-1 flex flex-col overflow-hidden relative"> 
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" /> 
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" /> 
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-xl relative z-10"> 
            <div className="flex items-center gap-6"> 
              <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)} 
                className="p-2.5 bg-slate-900/80 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 rounded-xl text-slate-400 transition-all shadow-sm" 
              > 
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />} 
              </button> 
              <div className="flex items-center gap-3"> 
                <h1 className="text-xl text-white font-black uppercase tracking-widest"> 
                  {activeTab.replace(/-/g, ' ')} 
                </h1> 
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 uppercase border border-slate-700">Module</span> 
              </div> 
            </div> 
            <div className="flex items-center gap-6"> 
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20"> 
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /> 
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Network Synced</span> 
              </div> 
              <div className="flex items-center gap-3 pl-6 border-l border-slate-800/80"> 
                <div className="text-right hidden md:block"> 
                  <p className="text-sm font-black text-white uppercase tracking-wider">{user?.name || 'SYSADMIN'}</p> 
                  <p className="text-[10px] font-mono text-emerald-500 uppercase">Clearance: Level 0</p> 
                </div> 
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-white font-black text-sm shadow-inner"> 
                  {user?.name?.[0] || 'A'} 
                </div> 
              </div> 
            </div> 
          </div> 
          <div className="flex-1 overflow-auto bg-transparent p-6 relative z-10 content-scroll" style={{ minWidth: 0, minHeight: 0 }}> 
            <ErrorBoundary key={activeTab}> 
              <Suspense fallback={ 
                <div className="flex items-center justify-center min-h-[60vh]"> 
                  <div className="relative w-16 h-16"> 
                    <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" /> 
                    <div className="absolute inset-0 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> 
                  </div> 
                </div> 
              }> 
                <ActiveComponent key={activeTab} /> 
              </Suspense> 
            </ErrorBoundary> 
          </div> 
        </div> 
      </div> 
    </> 
  ); 
}
