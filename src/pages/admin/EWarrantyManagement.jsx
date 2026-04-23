import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Trash2, ShieldAlert, Loader2, Calendar, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import api, { warranty } from "../../services/api";

export default function EWarrantyManagement() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchWarranties = async () => {
    setLoading(true);
    try {
      const res = await warranty.getAllAdmin();
      setWarranties(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarranties(); }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    if(!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      await warranty.updateStatus(id, newStatus);
      fetchWarranties();
    } catch (err) {
      alert("Failed to update warranty status.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("CRITICAL: Completely delete this warranty record?")) return;
    try {
      await api.delete(`/warranty/admin/${id}`); // Fallback manual api for explicit delete
      fetchWarranties();
    } catch (err) {
      alert("Failed to delete warranty record.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;

  return (
    <div className="font-sans text-gray-200 animate-fade-in space-y-8 p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">WARRANTY <span className="text-purple-500">REGISTRY</span></h1>
        </div>
      </div>

      <div className="bg-[#0a0c10] border border-white/5 rounded-[30px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Serial</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {warranties.map((w) => (
                <tr key={w.id} className="group hover:bg-white/[0.02]">
                  <td className="px-8 py-5 font-bold text-white text-sm">{w.user_name || 'N/A'}</td>
                  <td className="px-8 py-5 font-mono font-bold text-purple-400 text-sm tracking-tight">{w.registered_serial}</td>
                  <td className="px-8 py-5"><span className="px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{w.status || 'registered'}</span></td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    {w.status !== 'revoked' ? (
                      <button onClick={() => handleUpdateStatus(w.id, 'revoked')} className="p-2.5 bg-white/5 text-gray-400 hover:text-orange-400 rounded-xl"><XCircle className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => handleUpdateStatus(w.id, 'active')} className="p-2.5 bg-white/5 text-gray-400 hover:text-emerald-400 rounded-xl"><CheckCircle className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => handleDelete(w.id)} className="p-2.5 bg-white/5 text-gray-400 hover:text-red-400 rounded-xl"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
