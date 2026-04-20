import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Trash2, ShieldAlert, Loader2, Calendar, RefreshCw, XCircle, CheckCircle
} from 'lucide-react';
import api from "../../services/api";

export default function EWarrantyManagement({ token }) {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchWarranties = async () => {
    setLoading(true);
    try {
      // Assuming your api has a method or we hit the endpoint directly
      const res = await api.get('/warranty/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWarranties(res.data?.data || res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch warranty registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWarranties();
  }, [token]);

  const handleUpdateStatus = async (id, newStatus) => {
    if(!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      await api.put(`/warranty/admin/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWarranties();
    } catch (err) {
      alert("Failed to update warranty status.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("CRITICAL: Completely delete this warranty record? This action cannot be undone.")) return;
    try {
      await api.delete(`/warranty/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWarranties();
    } catch (err) {
      alert("Failed to delete warranty record.");
    }
  };

  const filteredWarranties = warranties.filter(w => 
    (w.registered_serial || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.user_email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWarranties.length / itemsPerPage);
  const paginatedData = filteredWarranties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
    </div>
  );

  return (
    <div className="font-sans text-gray-200 animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            WARRANTY <span className="text-purple-500">REGISTRY</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">Monitor and manage activated customer protections</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <div className="bg-[#0a0c10] border border-white/5 rounded-[30px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.02]">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-500" /> Active Ledger
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search Name, Email, or Serial..." 
                className="pl-11 pr-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs font-bold tracking-widest outline-none focus:border-purple-500/50 text-white w-72 transition-all"
                value={searchQuery}
                onChange={e => {setSearchQuery(e.target.value); setCurrentPage(1);}}
              />
            </div>
            <button onClick={fetchWarranties} className="p-2.5 bg-black border border-white/10 hover:bg-white/5 hover:text-white text-gray-400 rounded-xl transition-all">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer / ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Serial & Product</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timeline</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedData.map((warranty) => (
                <tr key={warranty.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-white text-sm">{warranty.user_name || 'N/A'}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-1">{warranty.user_email || warranty.user_phone || 'No Contact'}</div>
                    <div className="text-[9px] text-purple-400/70 font-bold uppercase tracking-widest mt-1">Shop: {warranty.shop_name || 'Direct'}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-mono font-bold text-purple-400 text-sm tracking-tight">{warranty.registered_serial}</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">{warranty.product_name || `Product ID: ${warranty.product_id}`}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5 text-[10px] font-mono text-gray-400">
                      <div className="flex items-center gap-2"><Calendar className="h-3 w-3 text-gray-600"/> START: {warranty.purchase_date ? new Date(warranty.purchase_date).toLocaleDateString() : 'N/A'}</div>
                      <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-gray-600"/> EXPIRES: <span className="text-white font-bold">{warranty.warranty_end_date ? new Date(warranty.warranty_end_date).toLocaleDateString() : 'N/A'}</span></div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                       warranty.status === 'active' || warranty.status === 'registered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                       warranty.status === 'expired' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                       'bg-red-500/10 text-red-400 border-red-500/20'
                     }`}>
                       {warranty.status || 'registered'}
                     </span>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    {warranty.status !== 'revoked' ? (
                      <button onClick={() => handleUpdateStatus(warranty.id, 'revoked')} className="p-2.5 bg-white/5 hover:bg-orange-500/20 text-gray-400 hover:text-orange-400 rounded-xl transition-all border border-transparent hover:border-orange-500/30" title="Revoke Warranty">
                        <XCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button onClick={() => handleUpdateStatus(warranty.id, 'active')} className="p-2.5 bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-xl transition-all border border-transparent hover:border-emerald-500/30" title="Reinstate Warranty">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(warranty.id)} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/30" title="Delete Record">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                   <td colSpan="5" className="px-8 py-12 text-center text-gray-500 font-bold text-xs uppercase tracking-widest">
                     No warranty registrations found
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-black/20">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Showing {filteredWarranties.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredWarranties.length)} of {filteredWarranties.length} Records
          </span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all text-xs font-bold uppercase tracking-widest">Prev</button>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all text-xs font-bold uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
