import React, { useState, useEffect, useCallback } from "react";
import { flashSales } from "../../services/api";
import {
  Loader2, Zap, Search, Trash2, RefreshCw, Plus, Edit3, Clock, AlertCircle, CheckCircle, XCircle
} from "lucide-react";

export default function FlashSalesManagement() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await flashSales.getAllAdmin();
      const data = res.data?.data || res.data;
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Flash Sales fetch error:", err);
      // Soft fallback if table doesn't exist yet
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this Flash Sale event?")) return;
    try {
      await flashSales.delete(id);
      loadSales();
    } catch (err) {
      alert("Failed to delete event: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await flashSales.toggleStatus(id, !currentStatus);
      loadSales();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filtered = sales.filter(s =>
    s.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-amber-500" size={32} />
      <span className="ml-3 text-gray-400 font-mono text-sm">Loading Lightning Nodes...</span>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Zap className="text-amber-500" size={32} /> Flash <span className="text-amber-500">Sales</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs mt-1 uppercase tracking-widest">Time-Limited Promotions Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2">
            <Plus size={16} /> New Event
          </button>
          <button
            onClick={loadSales}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-500 rounded-xl transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          placeholder="Search promotional events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm placeholder:text-gray-600 font-bold text-white"
        />
      </div>

      <div className="bg-slate-900/30 border border-white/10 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Event Title</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Discount</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Window (Start - End)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-black text-white uppercase text-sm tracking-tight">{sale.title}</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">{sale.product_count || 0} Products Attached</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-amber-500 font-black text-lg">{sale.discount_percentage}% OFF</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={14} className="text-slate-600" />
                      {new Date(sale.start_date).toLocaleString()} <br/> {new Date(sale.end_date).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => handleToggleStatus(sale.id, sale.is_active)}
                      className={`inline-flex items-center justify-center p-2 rounded-xl transition-all ${sale.is_active ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-600 hover:bg-slate-800'}`}
                    >
                      {sale.is_active ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-amber-500/20 text-amber-500 rounded-lg transition-colors">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(sale.id)} className="p-2 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-16 text-center space-y-4">
            <Zap className="mx-auto text-slate-800" size={48} />
            <div className="text-slate-600 font-black uppercase tracking-[0.2em] text-sm">No Active Lightning Nodes</div>
          </div>
        )}
      </div>
    </div>
  );
}
