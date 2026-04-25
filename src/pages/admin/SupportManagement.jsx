import React, { useState, useEffect, useCallback } from "react";
import { support } from "../../services/api";
import {
  Loader2, LifeBuoy, Search, Trash2, RefreshCw, Eye, X, Mail, User, Clock, AlertCircle
} from "lucide-react";

export default function SupportManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await support.getAllAdmin();
      const data = res.data?.data || res.data;
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Support fetch error:", err);
      setError(err.message || "Failed to initialize support module.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently purge this support ticket from the registry?")) return;
    try {
      await support.delete(id);
      loadTickets();
    } catch (err) {
      alert("Failed to purge ticket: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = tickets.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-cyan-400" size={32} />
      <span className="ml-3 text-gray-400 font-mono text-sm">Loading support nodes...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertCircle className="text-red-400" size={32} />
      <div className="text-red-400 font-mono text-sm">{error}</div>
      <button onClick={loadTickets} className="px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-xl font-bold uppercase text-xs hover:bg-cyan-500/30 transition-all">
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <LifeBuoy className="text-cyan-400" size={32} /> Support <span className="text-cyan-400">Desk</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs mt-1 uppercase tracking-widest">Global Ticket Management</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase text-cyan-400 bg-cyan-400/10 px-4 py-2 rounded-full border border-cyan-400/20">
            {tickets.length} Active Tickets
          </span>
          <button
            onClick={loadTickets}
            className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-400 rounded-xl transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          placeholder="Filter by client name, email, or ticket payload..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm placeholder:text-gray-600 font-bold"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 font-bold uppercase tracking-widest py-16">No tickets detected.</div>
        ) : (
          filtered.map((ticket, i) => (
            <div key={ticket.id || i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-start justify-between gap-4 hover:border-cyan-500/30 transition-all group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-cyan-400 shrink-0" />
                  <span className="text-sm font-black text-white uppercase tracking-tight">{ticket.name}</span>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 bg-slate-900 px-2 py-1 rounded">
                    Ticket #{ticket.id?.toString().padStart(4, '0') || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Mail size={12} />{ticket.email}</span>
                  {ticket.phone && <span className="flex items-center gap-1 text-emerald-400"><Clock size={12} />{ticket.phone}</span>}
                </div>
                <p className="text-sm text-gray-300 font-medium line-clamp-2 pr-4">{ticket.message}</p>
              </div>
              
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 shrink-0 mt-4 md:mt-0">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-[#0a0c10] px-3 py-1.5 rounded-lg border border-white/5">
                  {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "Just Now"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
                  >
                    <Eye size={14} /> Review
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative">
            <button onClick={() => setSelectedTicket(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-rose-500 hover:border-rose-500 border border-transparent">
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 font-black text-xl">
                {selectedTicket.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{selectedTicket.name}</h3>
                <div className="text-sm font-bold text-cyan-400">{selectedTicket.email}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Ticket Payload</div>
                <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">{selectedTicket.message}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Phone Protocol</div>
                  <div className="text-white font-bold text-sm">{selectedTicket.phone || 'N/A'}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Timestamp</div>
                  <div className="text-white font-bold text-sm">{selectedTicket.created_at ? new Date(selectedTicket.created_at).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
               <button onClick={() => window.location.href = `mailto:${selectedTicket.email}`} className="flex-1 py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2">
                 <Mail size={18} /> Reply via Email
               </button>
               <button onClick={() => { handleDelete(selectedTicket.id); setSelectedTicket(null); }} className="px-6 py-4 bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-black transition-all flex items-center justify-center">
                 <Trash2 size={18} />
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
