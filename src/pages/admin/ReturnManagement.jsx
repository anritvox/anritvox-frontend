import React, { useState, useEffect } from 'react';
import { returns as returnsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  RotateCcw, Search, Filter, Eye, CheckCircle, XCircle, 
  RefreshCw, AlertTriangle, Box, DollarSign, Activity, ChevronRight, X
} from 'lucide-react';

export default function ReturnManagement() {
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const { showToast } = useToast() || {};

  const loadReturns = async () => {
    try {
      setLoading(true);
      const res = await returnsApi.getAllAdmin();
      const data = res.data?.data || res.data || [];
      setReturnsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load returns:', error);
      showToast?.('Failed to sync RMA registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const handleUpdateStatus = async (returnId, newStatus) => {
    try {
      await returnsApi.updateStatus(returnId, newStatus);
      showToast?.(`RMA status updated to ${newStatus}`, 'success');
      loadReturns();
      if (selectedReturn?.id === returnId) setSelectedReturn(null);
    } catch (error) {
      showToast?.('Status update failed', 'error');
    }
  };

  const filteredReturns = returnsList.filter(r => {
    const matchesSearch = r.order_id?.toString().includes(searchTerm) || 
                          r.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing RMA Core...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#0a0c10] min-h-screen text-slate-300 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <RotateCcw size={36} className="text-rose-500" /> Reverse Logistics
          </h2>
          <p className="text-slate-500 font-medium mt-1">Manage Return Merchandise Authorizations (RMA) & Refunds</p>
        </div>
        <button 
          onClick={loadReturns}
          className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} /> Sync Registry
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Active RMAs', val: returnsList.filter(r => r.status === 'pending').length, icon: AlertTriangle, color: 'amber' },
          { label: 'Units Recovered', val: returnsList.filter(r => r.status === 'approved').length, icon: Box, color: 'emerald' },
          { label: 'Refunds Issued', val: returnsList.filter(r => r.status === 'refunded').length, icon: DollarSign, color: 'blue' },
          { label: 'Total Requests', val: returnsList.length, icon: Activity, color: 'purple' }
        ].map((s, i) => (
          <div key={i} className={`bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex items-center justify-between shadow-lg`}>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{s.label}</p>
              <h4 className="text-2xl font-black text-white">{s.val}</h4>
            </div>
            <div className={`w-12 h-12 bg-${s.color}-500/10 rounded-2xl flex items-center justify-center text-${s.color}-500`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 mb-8 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by Order ID or Client Name..." 
            className="w-full bg-slate-950 border-2 border-slate-800 focus:border-rose-500/50 rounded-2xl py-3 pl-12 pr-4 text-white font-bold outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 lg:pb-0">
          {['all', 'pending', 'approved', 'rejected', 'refunded'].map(status => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${statusFilter === status ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-white'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">RMA Details</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Client & Order</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Reason</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredReturns.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-600 font-bold uppercase tracking-widest">No returns found in registry</td></tr>
            ) : filteredReturns.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <p className="text-white font-black uppercase tracking-tight">RMA-{item.id}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(item.created_at).toLocaleDateString()}</p>
                </td>
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="text-white font-bold">{item.customer_name || 'Retail Client'}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Order #{item.order_id}</span>
                  </div>
                </td>
                <td className="p-6 text-sm text-slate-400 font-medium">
                  {item.reason}
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                    item.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                    item.status === 'refunded' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => setSelectedReturn(item)}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-rose-500/50 transition-all inline-flex items-center gap-2"
                  >
                    <Eye size={18} /> Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspect Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0a0c10] border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white uppercase">RMA Inspector</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ticket ID: RMA-{selectedReturn.id}</p>
              </div>
              <button onClick={() => setSelectedReturn(null)} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Order</p>
                  <p className="text-white font-bold">#{selectedReturn.order_id}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-white font-bold uppercase">{selectedReturn.status}</p>
                </div>
              </div>
              
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Customer Declaration</p>
                <p className="text-slate-300 font-medium whitespace-pre-wrap">{selectedReturn.reason}</p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Execute Authority Override</p>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'approved')}
                    className="py-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Approve Return
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'refunded')}
                    className="py-4 bg-blue-600/10 border border-blue-500/20 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Issue Refund
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedReturn.id, 'rejected')}
                    className="py-4 bg-rose-600/10 border border-rose-500/20 text-rose-500 hover:bg-rose-600 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
