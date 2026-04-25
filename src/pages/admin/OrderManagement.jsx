import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShoppingBag, Truck, Package, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, Download, RefreshCw, Eye, IndianRupee, 
  MapPin, User, CreditCard, Calendar, ArrowRight, Printer, Activity,
  Clock, ShieldCheck, Mail, Phone
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// --- CONFIGURATION MAPS ---
const STATUS_MAP = {
  'pending': { label: 'Pending', color: 'amber', icon: Clock },
  'processing': { label: 'Processing', color: 'blue', icon: Activity },
  'shipped': { label: 'In Transit', color: 'purple', icon: Truck },
  'delivered': { label: 'Delivered', color: 'emerald', icon: CheckCircle },
  'cancelled': { label: 'Cancelled', color: 'rose', icon: XCircle },
  'returned': { label: 'Returned', color: 'slate', icon: AlertCircle }
};

const TIMELINE_STAGES = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Inspector Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');

  const { showToast } = useToast() || {};

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Safely map endpoints based on your typical architecture
      const res = await api.get('/orders').catch(() => api.get('/admin/orders'));
      setOrders(res.data?.orders || res.data?.data || res.data || []);
    } catch (err) {
      showToast?.('Failed to synchronize order matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return '/logo.webp';
    let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
    if (!path) return '/logo.webp';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  // --- MUTATION PROTOCOLS ---
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Transition order to [${newStatus.toUpperCase()}] status?`)) return;
    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus }).catch(() => 
        api.patch(`/orders/${orderId}/status`, { status: newStatus })
      );
      showToast?.(`Order transition to ${newStatus} successful`, 'success');
      
      // Optimistic update
      setOrders(orders.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: newStatus } : o));
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (err) {
      showToast?.('Status mutation failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const orderId = selectedOrder.id || selectedOrder._id;
      await api.put(`/orders/${orderId}/tracking`, { tracking_number: trackingNumber, courier: courierName });
      
      // Auto-transition to shipped if tracking is added and it was processing
      let newStatus = selectedOrder.status;
      if (selectedOrder.status === 'processing' && trackingNumber) {
        newStatus = 'shipped';
        await api.put(`/orders/${orderId}/status`, { status: newStatus }).catch(()=>api.patch(`/orders/${orderId}/status`, { status: newStatus }));
      }

      showToast?.('Fulfillment details injected', 'success');
      fetchOrders();
      setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber, courier: courierName, status: newStatus });
    } catch (err) {
      showToast?.('Fulfillment injection failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- EXPORT PROTOCOL ---
  const exportToExcel = () => {
    const worksheetData = orders.map(o => ({
      'Order ID': o.order_number || o.id || o._id,
      'Timestamp': new Date(o.created_at).toLocaleString(),
      'Customer Name': o.user?.name || o.shipping_address?.full_name || 'Guest',
      'Email': o.user?.email || o.shipping_address?.email || 'N/A',
      'Total Valuation (₹)': parseFloat(o.total_amount || o.total || 0),
      'Payment Status': o.payment_status || 'N/A',
      'Fulfillment Status': o.status,
      'Tracking Hash': o.tracking_number || 'Pending'
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logistics Audit");
    XLSX.writeFile(workbook, `Anritvox_Logistics_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast?.('XLSX Audit Exported', 'success');
  };

  // --- ANALYTICS & FILTERING ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const searchStr = `${o.order_number || o.id} ${o.user?.name || ''} ${o.user?.email || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Telemetry KPIs
  const totalRevenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'returned').reduce((acc, o) => acc + parseFloat(o.total_amount || o.total || 0), 0);
  const activeFulfillments = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const inTransitCount = orders.filter(o => o.status === 'shipped').length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Logistics Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Fulfillment <span className="text-blue-500">Matrix</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> Advanced Order Processing & Logistics
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchOrders} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-blue-400 transition-all shadow-lg">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-3 bg-blue-500/10 border border-blue-500/50 text-blue-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Download size={16} /> Export Master Ledger
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-500 z-10"><IndianRupee size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Gross Revenue</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">₹{totalRevenue.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-amber-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-amber-500 z-10"><Clock size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Queue</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{activeFulfillments}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-purple-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-purple-500 z-10"><Truck size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">In Transit</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{inTransitCount}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-blue-500 z-10"><CheckCircle size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Successfully Closed</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{completedCount}</h4>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-[2rem] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Scan by Order ID, Hash, Name, or Email..." 
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          <select 
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Pipeline Stages</option>
            {Object.entries(STATUS_MAP).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LOGISTICS TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Order Hash</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Client Payload</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Timestamp</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Valuation</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Pipeline Stage</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <Package size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Pipeline is empty for current filters</p>
                  </td>
                </tr>
              ) : paginatedOrders.map(order => {
                const status = STATUS_MAP[order.status] || STATUS_MAP['pending'];
                const StatusIcon = status.icon;
                const orderIdStr = String(order.order_number || order.id || order._id).padStart(6, '0');

                return (
                  <tr key={order.id || order._id} className="hover:bg-blue-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                          <ShoppingBag size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white font-mono tracking-tighter">#{orderIdStr}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            {order.items?.length || 0} Nodes
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-white truncate max-w-[150px]">{order.user?.name || order.shipping_address?.full_name || 'Guest User'}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5">{order.user?.email || order.shipping_address?.email || 'N/A'}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-slate-300">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-emerald-400 font-black tracking-tight text-sm">
                        ₹{parseFloat(order.total_amount || order.total || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-${status.color}-500/10 text-${status.color}-500 border border-${status.color}-500/20 shadow-[0_0_10px_rgba(var(--tw-colors-${status.color}-500),0.1)]`}>
                        <StatusIcon size={12} /> {status.label}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingNumber(order.tracking_number || '');
                          setCourierName(order.courier || '');
                        }}
                        className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-md inline-flex items-center gap-2"
                      >
                        <Eye size={14} /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMMAND CENTER MODAL - DEEP INSPECTION */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-start bg-slate-900/50 flex-shrink-0">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      Order Hash: <span className="text-blue-400 font-mono">#{String(selectedOrder.order_number || selectedOrder.id || selectedOrder._id).padStart(6, '0')}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                      <Calendar size={12} /> {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="p-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all shadow-md hidden sm:block" title="Print Invoice">
                  <Printer size={20} />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-slate-950 border border-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all shadow-md">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Interactive Timeline */}
            <div className="bg-slate-950/50 border-b border-slate-800 p-6 md:p-8 flex-shrink-0 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[600px] relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
                {TIMELINE_STAGES.map((stage, idx) => {
                  const stageIndex = TIMELINE_STAGES.indexOf(stage);
                  const currentIndex = TIMELINE_STAGES.indexOf(selectedOrder.status);
                  
                  // Handle edge cases (cancelled/returned)
                  const isCancelled = selectedOrder.status === 'cancelled' || selectedOrder.status === 'returned';
                  
                  let isActive = stageIndex <= currentIndex && !isCancelled;
                  let isCurrent = stageIndex === currentIndex && !isCancelled;
                  
                  // Style logic
                  let bgClass = isActive ? `bg-${STATUS_MAP[stage].color}-500` : 'bg-slate-900';
                  let borderClass = isActive ? `border-${STATUS_MAP[stage].color}-500` : 'border-slate-700';
                  let textClass = isActive ? 'text-white' : 'text-slate-500';
                  
                  if (isCancelled && stageIndex === 0) { bgClass = 'bg-rose-500'; borderClass = 'border-rose-500'; textClass = 'text-white'; }

                  const Icon = STATUS_MAP[stage].icon;

                  return (
                    <div key={stage} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${bgClass} ${borderClass} ${isCurrent ? 'scale-110 shadow-[0_0_20px_rgba(var(--tw-colors-blue-500),0.3)]' : ''}`}>
                        <Icon size={18} className={isActive ? 'text-slate-950' : 'text-slate-500'} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${textClass}`}>
                        {STATUS_MAP[stage].label}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Quick Status Mutation */}
              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Force Transition:</span>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(STATUS_MAP).map(status => (
                    <button 
                      key={status}
                      disabled={isUpdating || selectedOrder.status === status}
                      onClick={() => handleUpdateStatus(selectedOrder.id || selectedOrder._id, status)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${selectedOrder.status === status ? `bg-${STATUS_MAP[status].color}-500/20 border-${STATUS_MAP[status].color}-500/50 text-${STATUS_MAP[status].color}-400` : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'} disabled:opacity-50`}
                    >
                      {STATUS_MAP[status].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Body (2 Columns) */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: Items & Finances */}
                <div className="space-y-8">
                  {/* Items List */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><ShoppingBag size={14}/> Hardware Manifest</h3>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl group">
                          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 p-1">
                            <img src={getImageUrl(item.image || item.product?.images?.[0] || item.product?.image_url)} alt="node" className="w-full h-full object-cover rounded-lg" onError={(e) => { e.target.src = '/logo.webp'; }}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.name || item.product?.name || 'Unknown Hardware'}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">QTY: <span className="text-blue-400 font-black text-xs">{item.quantity}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                            <p className="text-[9px] text-slate-500 mt-1 line-through">₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                      {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                        <div className="p-8 text-center text-slate-600 font-bold text-xs uppercase tracking-widest border border-dashed border-slate-700 rounded-2xl">
                          Manifest Data Corrupted or Empty
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><IndianRupee size={14}/> Financial Telemetry</h3>
                    <div className="space-y-4 text-sm font-bold">
                      <div className="flex justify-between text-slate-400"><span className="text-xs">Subtotal</span><span>₹{selectedOrder.subtotal || selectedOrder.total_amount}</span></div>
                      <div className="flex justify-between text-slate-400"><span className="text-xs">Shipping</span><span>₹{selectedOrder.shipping_cost || 0}</span></div>
                      <div className="flex justify-between text-emerald-500"><span className="text-xs">Discount</span><span>- ₹{selectedOrder.discount || 0}</span></div>
                      <div className="w-full h-px bg-slate-800 my-2"></div>
                      <div className="flex justify-between text-white text-lg font-black"><span className="uppercase tracking-widest text-sm">Total Remittance</span><span className="text-emerald-400">₹{parseFloat(selectedOrder.total_amount || selectedOrder.total || 0).toLocaleString()}</span></div>
                    </div>
                    <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard size={18} className="text-slate-500" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Vector</p>
                          <p className="text-xs font-bold text-white mt-0.5 capitalize">{selectedOrder.payment_method || 'Online Processing'}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${selectedOrder.payment_status === 'completed' || selectedOrder.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {selectedOrder.payment_status || 'Pending Verification'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Logistics & Customer */}
                <div className="space-y-8">
                  
                  {/* Fulfillment Engine (Tracking) */}
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-6 flex items-center gap-2 relative z-10"><Truck size={14}/> Courier Linkage</h3>
                    <form onSubmit={handleUpdateTracking} className="relative z-10 space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Tracking Hash (AWB)</label>
                        <input 
                          type="text" placeholder="e.g. BLUEDART-123456789"
                          value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-mono outline-none focus:border-blue-500/50 transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Logistics Partner</label>
                        <input 
                          type="text" placeholder="e.g. BlueDart, Delhivery"
                          value={courierName} onChange={e => setCourierName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold outline-none focus:border-blue-500/50 transition-colors" 
                        />
                      </div>
                      <button 
                        type="submit" disabled={isUpdating}
                        className="w-full py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                      >
                        {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />} 
                        Inject Fulfillment Data
                      </button>
                    </form>
                  </div>

                  {/* Customer Identity Profile */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><User size={14}/> Client Identity Node</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{selectedOrder.user?.name || selectedOrder.shipping_address?.full_name || 'Guest Checkout'}</p>
                          <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-1"><Mail size={10}/> {selectedOrder.user?.email || selectedOrder.shipping_address?.email || 'N/A'}</p>
                          <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-1"><Phone size={10}/> {selectedOrder.user?.phone || selectedOrder.shipping_address?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destination Matrix */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><MapPin size={14}/> Destination Matrix</h3>
                    {selectedOrder.shipping_address ? (
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                        <p className="text-sm font-bold text-white mb-2">{selectedOrder.shipping_address.full_name}</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {selectedOrder.shipping_address.address_line1}<br />
                          {selectedOrder.shipping_address.address_line2 && <>{selectedOrder.shipping_address.address_line2}<br /></>}
                          {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}<br />
                          {selectedOrder.shipping_address.country}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-bold italic border border-dashed border-slate-700 p-4 rounded-xl text-center">Destination Coordinates Missing</p>
                    )}
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
