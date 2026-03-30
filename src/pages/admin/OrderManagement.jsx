import React, { useState, useEffect } from "react";
import { fetchAdminOrders } from "../../services/api";
import api from "../../services/api"; // For direct put request
import { Loader2, Search, Edit3, CheckCircle, Clock, Truck, XCircle, X, Package, Mail } from "lucide-react";

export default function OrderManagement({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateConfig, setUpdateConfig] = useState({ status: "", trackingNumber: "", courier: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [token]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Order load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setUpdateConfig({ 
      status: order.status, 
      trackingNumber: order.tracking_number || "", 
      courier: order.courier || "" 
    });
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      // Direct API call utilizing the upgraded backend
      await api.put(`/admin/orders/${selectedOrder.id}/status`, updateConfig);
      
      setIsModalOpen(false);
      await loadOrders(); // Refresh table
    } catch (err) {
      alert("Failed to update order status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toString().includes(searchTerm) || 
                          (o.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (o.user_email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch(status) {
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
              ORDER <span className="text-purple-500">DISPATCH</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium tracking-tight">Logistics & Automated Notification Center</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input 
              type="text" 
              placeholder="Query Order ID, Name, or Email..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-700 font-mono" 
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl px-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none text-xs font-bold uppercase tracking-widest transition-all text-gray-300"
            >
              <option value="all">Global Scan</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order Ref</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">State</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <code className="text-purple-400 font-bold bg-purple-500/5 px-2 py-1 rounded-lg">#{order.id}</code>
                      <div className="text-[10px] text-gray-600 font-mono mt-2">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-white">{order.user_name || "Guest"}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{order.user_email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                      {order.tracking_number && (
                        <div className="text-[10px] font-mono text-gray-500 mt-2 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-purple-400"/> {order.tracking_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => openUpdateModal(order)} 
                        className="p-2 bg-white/5 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all border border-transparent hover:border-purple-500/30"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Update Modal */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0c10] border border-white/10 w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-fade-in">
              <div className="p-8 space-y-8">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white">Logistics Update</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">ORDER #{selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Lifecycle Status</label>
                    <select 
                      value={updateConfig.status} 
                      onChange={(e) => setUpdateConfig({...updateConfig, status: e.target.value})} 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none text-white font-bold"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped (Requires Tracking)</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Dynamic Tracking Fields - Only visible if Shipped */}
                  {updateConfig.status === "shipped" && (
                    <div className="p-5 border border-purple-500/20 bg-purple-500/5 rounded-2xl space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Customer Notification Triggered</span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Courier Service</label>
                        <input 
                          type="text" 
                          value={updateConfig.courier} 
                          onChange={(e) => setUpdateConfig({...updateConfig, courier: e.target.value})} 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white" 
                          placeholder="e.g. FedEx, BlueDart, Delhivery" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Tracking Number</label>
                        <input 
                          type="text" 
                          value={updateConfig.trackingNumber} 
                          onChange={(e) => setUpdateConfig({...updateConfig, trackingNumber: e.target.value})} 
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono" 
                          placeholder="AWB / Tracking Code" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleStatusUpdate} 
                  disabled={isUpdating || (updateConfig.status === 'shipped' && (!updateConfig.trackingNumber || !updateConfig.courier))} 
                  className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/30 disabled:text-gray-400 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex justify-center items-center gap-2"
                >
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Commit Update & Notify"}
                </button>

              </div>
            </div>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}
