import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  ShoppingBag, Truck, Package, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, Download, RefreshCw, Eye, IndianRupee, 
  MapPin, User, CreditCard, Calendar, ArrowRight, Printer, Activity,
  Clock, ShieldCheck, Mail, Phone, FileText
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STATUS_MAP = {
  'pending': { label: 'Pending', color: 'amber', icon: Clock },
  'processing': { label: 'Processing', color: 'blue', icon: Activity },
  'shipped': { label: 'Shipped', color: 'purple', icon: Truck },
  'delivered': { label: 'Delivered', color: 'emerald', icon: CheckCircle },
  'cancelled': { label: 'Cancelled', color: 'rose', icon: XCircle },
  'returned': { label: 'Returned', color: 'slate', icon: AlertCircle }
};

const TIMELINE_STAGES = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');

  const { showToast } = useToast() || {};

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // FIX: Call the correct globally exposed admin route
      const res = await api.get('/orders/all');
      setOrders(res.data || []);
    } catch (err) {
      showToast?.('Failed to fetch orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return '/placeholder.png';
    let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Update this order to ${newStatus}?`)) return;
    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast?.(`Order marked as ${newStatus}`, 'success');
      
      setOrders(orders.map(o => (o.id === orderId) ? { ...o, status: newStatus } : o));
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (err) {
      showToast?.('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const orderId = selectedOrder.id;
      // Combine Tracking Update & Status Change
      await api.put(`/orders/${orderId}/status`, { 
        status: 'shipped', 
        trackingNumber: trackingNumber, 
        courier: courierName 
      });
      
      showToast?.('Tracking details added & order shipped.', 'success');
      fetchOrders();
      setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber, courier: courierName, status: 'shipped' });
    } catch (err) {
      showToast?.('Failed to save tracking info', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToExcel = () => {
    const worksheetData = orders.map(o => ({
      'Order ID': o.id,
      'Date': new Date(o.created_at).toLocaleString(),
      'Customer': o.user_name || o.address_snapshot?.full_name || 'Guest',
      'Email': o.user_email || 'N/A',
      'Total (₹)': parseFloat(o.total || 0),
      'Payment Method': o.payment_mode || 'COD',
      'Status': o.status,
      'Tracking ID': o.tracking_number || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `Orders_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const searchStr = `${o.id} ${o.user_name || ''} ${o.address_snapshot?.full_name || ''} ${o.user_email || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalRevenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'returned').reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
  const activeOrders = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const inTransitCount = orders.filter(o => o.status === 'shipped').length;
  const completedCount = orders.filter(o => o.status === 'delivered').length;

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Database...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Order Management
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            View, track, and update all customer orders.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchOrders} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md">
            <Download size={16} /> Export to Excel
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600"><IndianRupee size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Gross Revenue</p>
            <h4 className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-4 rounded-xl bg-amber-50 text-amber-600"><Clock size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Action Required</p>
            <h4 className="text-2xl font-black text-slate-900">{activeOrders}</h4>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-4 rounded-xl bg-purple-50 text-purple-600"><Truck size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">In Transit</p>
            <h4 className="text-2xl font-black text-slate-900">{inTransitCount}</h4>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600"><CheckCircle size={24} /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Completed</p>
            <h4 className="text-2xl font-black text-slate-900">{completedCount}</h4>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Search by Order ID, Name, or Email..." 
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-800 font-medium outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <select 
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-800 font-medium outline-none focus:border-emerald-500 appearance-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            {Object.entries(STATUS_MAP).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Order ID</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Customer</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Total</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : paginatedOrders.map(order => {
                const status = STATUS_MAP[order.status] || STATUS_MAP['pending'];
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-5 font-bold text-slate-900">#{order.id}</td>
                    <td className="p-5">
                      <p className="font-bold text-slate-800">{order.address_snapshot?.full_name || order.user_name || 'Guest'}</p>
                      <p className="text-xs text-slate-500">{order.user_email || 'No email'}</p>
                    </td>
                    <td className="p-5 text-sm text-slate-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-5 font-bold text-emerald-600">₹{parseFloat(order.total || 0).toLocaleString()}</td>
                    <td className="p-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-${status.color}-100 text-${status.color}-700`}>
                         {status.label}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingNumber(order.tracking_number || '');
                          setCourierName(order.courier || '');
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* order detail MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl my-auto relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Order #{selectedOrder.id}
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
                  <Printer size={20} />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shadow-sm">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Quick Actions (Admin overrides) */}
            <div className="bg-white border-b border-slate-100 p-6 flex flex-wrap items-center gap-4">
               <span className="text-sm font-bold text-slate-700">Update Status:</span>
               {Object.keys(STATUS_MAP).map(status => (
                  <button 
                    key={status}
                    disabled={isUpdating || selectedOrder.status === status}
                    onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      selectedOrder.status === status 
                        ? `bg-${STATUS_MAP[status].color}-100 border-${STATUS_MAP[status].color}-200 text-${STATUS_MAP[status].color}-700` 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    } disabled:opacity-50`}
                  >
                    {STATUS_MAP[status].label}
                  </button>
               ))}
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Side: Items & Money */}
                <div className="space-y-6">
                  {/* Items */}
                  <div className="border border-slate-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><ShoppingBag size={18}/> Ordered Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0 last:pb-0">
                          <img src={getImageUrl(item.image)} alt="product" className="w-16 h-16 object-contain rounded-lg border border-slate-100 p-1" />
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">{item.name}</p>
                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-emerald-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={18}/> Payment Summary</h3>
                    <div className="space-y-3 text-sm font-medium">
                      <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{selectedOrder.subtotal || selectedOrder.total}</span></div>
                      <div className="flex justify-between text-slate-600"><span>Shipping</span><span>₹{selectedOrder.delivery_type === 'express' ? 99 : 0}</span></div>
                      {selectedOrder.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- ₹{selectedOrder.discount}</span></div>}
                      <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between text-lg font-extrabold text-slate-900">
                        <span>Total Paid</span>
                        <span className="text-emerald-600">₹{parseFloat(selectedOrder.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 inline-flex px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                      Payment Mode: {selectedOrder.payment_mode || 'COD'}
                    </div>
                  </div>
                </div>

                {/* Right Side: Shipping & Tracking */}
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="border border-slate-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><User size={18}/> Customer Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-bold text-slate-700">Name:</span> {selectedOrder.address_snapshot?.full_name || selectedOrder.user_name}</p>
                      <p><span className="font-bold text-slate-700">Email:</span> {selectedOrder.user_email || 'N/A'}</p>
                      <p><span className="font-bold text-slate-700">Phone:</span> {selectedOrder.address_snapshot?.phone || 'N/A'}</p>
                    </div>
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600">
                      <span className="font-bold text-slate-800 block mb-1"><MapPin size={14} className="inline mr-1"/> Shipping Address:</span>
                      {selectedOrder.address_snapshot ? (
                        <>
                          {selectedOrder.address_snapshot.line1}, {selectedOrder.address_snapshot.line2}<br/>
                          {selectedOrder.address_snapshot.city}, {selectedOrder.address_snapshot.state} - {selectedOrder.address_snapshot.pincode}
                        </>
                      ) : 'Address not found.'}
                    </div>
                    {selectedOrder.notes && (
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                        <span className="font-bold block mb-1">Customer Note:</span>
                        {selectedOrder.notes}
                      </div>
                    )}
                  </div>

                  {/* Add Tracking Info */}
                  <div className="border border-slate-200 rounded-2xl p-6 bg-blue-50/50">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Truck size={18}/> Dispatch & Tracking</h3>
                    <form onSubmit={handleUpdateTracking} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 block mb-1">Tracking Number</label>
                        <input 
                          type="text" placeholder="AWB Number"
                          value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 block mb-1">Courier Partner</label>
                        <input 
                          type="text" placeholder="e.g. BlueDart"
                          value={courierName} onChange={e => setCourierName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors" 
                        />
                      </div>
                      <button 
                        type="submit" disabled={isUpdating}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        {isUpdating ? 'Saving...' : 'Save & Mark as Shipped'}
                      </button>
                    </form>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
