import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, Eye, Truck, CheckCircle, XCircle, Clock, 
  Package, MoreHorizontal, Activity, ChevronRight, MapPin, CreditCard,
  User, Calendar, Box, Shield, AlertCircle, Download, ExternalLink,
  Printer, Trash2, ArrowUpRight, ArrowDownRight, RefreshCcw, Image
} from 'lucide-react';
import { orders as ordersApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrderManagement() {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { showToast } = useToast() || {};

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await ordersApi.getAllAdmin();
      setOrdersList(res.data?.data || res.data || []);
    } catch (error) {
      showToast?.('Order pipeline sync failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      showToast?.(`Order status updated to ${newStatus}`, 'success');
      loadOrders();
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
    } catch (error) {
      showToast?.('Status update failed', 'error');
    }
  };

  const filteredOrders = ordersList.filter(o => {
    const matchesSearch = o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 bg-[#0a0c10] min-h-screen text-slate-300 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <ShoppingBag size={36} className="text-blue-500" /> Order Pipeline
          </h2>
          <p className="text-slate-500 font-medium mt-1">Monitor and fulfill hardware transactions globally</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={loadOrders} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
            <RefreshCcw size={16} /> Sync Pipeline
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Active Orders', val: ordersList.filter(o => o.status === 'pending').length, icon: Clock, color: 'blue' },
          { label: 'Out for Delivery', val: ordersList.filter(o => o.status === 'dispatched').length, icon: Truck, color: 'emerald' },
          { label: 'Failed/Refunded', val: ordersList.filter(o => ['failed', 'refunded'].includes(o.status)).length, icon: AlertCircle, color: 'rose' },
          { label: 'Total Volume', val: `₹${ordersList.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0).toFixed(2)}`, icon: Activity, color: 'purple' }
        ].map((s, i) => (
          <div key={i} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{s.label}</p>
              <h4 className="text-2xl font-black text-white">{s.val}</h4>
            </div>
            <div className={`w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Client Name..." 
            className="w-full bg-slate-950 border-2 border-slate-800 focus:border-blue-500/50 rounded-2xl py-3 pl-12 pr-4 text-white font-bold outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          {['all', 'pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${statusFilter === status ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-white'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Transaction Node</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Client Entity</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Valuation</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Current Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={5} className="p-12 text-center text-slate-700 font-bold uppercase tracking-widest">Synchronizing Data Nodes...</td></tr>
              ))
            ) : filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center text-blue-500">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-white font-black uppercase tracking-tight">#{order.order_number || order.id}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-white font-bold">{order.customer_name}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{order.email || 'Retail Client'}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-emerald-500 font-black">₹{order.total}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{order.payment_method || 'COD'}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                    order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-blue-500/50 transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    <div className="relative group/ops">
                      <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover/ops:opacity-100 group-hover/ops:visible transition-all z-10 overflow-hidden">
                        {['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(s => (
                          <button 
                            key={s}
                            onClick={() => handleUpdateStatus(order.id, s)}
                            className="w-full px-4 py-3 text-left text-[10px] font-bold uppercase text-slate-400 hover:bg-slate-800 hover:text-white transition-all border-b border-slate-800 last:border-0"
                          >
                            Mark as {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-5xl bg-[#0a0c10] border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Box size={24} /></div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase">Node Details #{selectedOrder.order_number || selectedOrder.id}</h3>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Transaction ID: {selectedOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 bg-slate-900 text-slate-500 hover:text-white rounded-2xl transition-all"><XCircle /></button>
            </div>
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Client Info */}
              <div className="space-y-6">
                <div className="bg-slate-900/30 p-6 rounded-[2rem] border border-slate-800">
                  <h5 className="text-[10px] font-black uppercase text-blue-500 mb-4 flex items-center gap-2"><User size={14} /> Client Identity</h5>
                  <p className="text-xl font-black text-white">{selectedOrder.customer_name}</p>
                  <p className="text-slate-400 font-bold mt-1">{selectedOrder.email}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{selectedOrder.phone || '+91 00000-00000'}</p>
                </div>
                <div className="bg-slate-900/30 p-6 rounded-[2rem] border border-slate-800">
                  <h5 className="text-[10px] font-black uppercase text-emerald-500 mb-4 flex items-center gap-2"><MapPin size={14} /> Delivery Coordinates</h5>
                  <p className="text-slate-300 text-sm font-bold leading-relaxed">{selectedOrder.shipping_address || 'Address registry not provided'}</p>
                </div>
              </div>
              {/* Order Items */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800 min-h-[300px]">
                  <h5 className="text-[10px] font-black uppercase text-purple-500 mb-6 flex items-center gap-2"><Package size={14} /> Hardware Manifest</h5>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 group hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
                            <Image size={20} />
                          </div>
                          <div>
                            <p className="text-white font-black text-sm uppercase">{item.name || 'System Module'}</p>
                            <p className="text-[10px] font-bold text-slate-500">QTY: {item.quantity} units</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-black">₹{item.price}</p>
                          <p className="text-[10px] text-slate-600 font-bold">SUBTOTAL</p>
                        </div>
                      </div>
                    )) || <div className="text-center py-20 text-slate-700 font-black uppercase tracking-widest">Manifest data pending...</div>}
                  </div>
                </div>
                {/* Financial Summary */}
                <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex items-center justify-between px-10">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase">Payment System</p>
                      <p className="text-white font-black">{selectedOrder.payment_method?.toUpperCase() || 'COD'}</p>
                    </div>
                    <div className="w-[1px] h-10 bg-slate-800"></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase">Tax Config</p>
                      <p className="text-white font-black">IGST 18%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase">Net Valuation</p>
                    <p className="text-3xl font-black text-emerald-500">₹{selectedOrder.total}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"><Printer size={16} /> Print Invoice</button>
                  <button className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"><Truck size={16} /> Shipping Label</button>
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')} className="flex-[1.5] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Confirm Fulfillment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
