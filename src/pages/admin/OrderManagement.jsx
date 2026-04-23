import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Eye, Truck, CheckCircle, XCircle, Clock, Package, MoreHorizontal, Activity } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrderManagement() {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast() || {};

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
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
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      showToast?.(`Order ${orderId.slice(-6)} updated to ${newStatus.toUpperCase()}`, 'success');
      loadOrders();
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            <ShoppingBag className="text-emerald-500" /> Order Pipeline
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Global Logistics & fulfillment Monitoring</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-emerald-500 transition-colors" size={18} />
            <input 
              placeholder="Search by ID or Client..." 
              className="bg-slate-900/50 border border-slate-800 px-12 py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all w-full md:w-64 text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-slate-900/50 border border-slate-800 px-6 py-4 rounded-2xl outline-none text-xs font-black uppercase tracking-widest text-slate-400 focus:border-emerald-500/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction Info</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Entity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fulfillment</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="font-black text-white uppercase text-sm tracking-tight">{o.order_number}</div>
                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                      <Clock size={10} /> {new Date(o.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-300 text-sm">{o.customer_name}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">{o.shipping_city}, {o.shipping_country}</div>
                  </td>
                  <td className="px-8 py-6 font-black text-emerald-400">₹{o.total_amount}</td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                      o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' : 
                      o.status === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                      o.status === 'shipped' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Activity size={10} /> {o.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90">
                        <Eye size={18} />
                      </button>
                      <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90">
                        <Truck size={18} />
                      </button>
                      <div className="relative group/menu">
                        <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 hidden group-hover/menu:block z-30">
                          {['processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                            <button 
                              key={s}
                              onClick={() => handleUpdateStatus(o.id, s)}
                              className="w-full text-left px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
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
        {filteredOrders.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Package className="mx-auto text-slate-800" size={64} />
            <div className="text-slate-600 font-black uppercase tracking-[0.3em]">No Transaction Records Synchronized</div>
          </div>
        )}
      </div>
    </div>
  );
}
