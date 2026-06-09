import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { support } from '../../services/api';
import {
  LifeBuoy, Search, Trash2, RefreshCw, Eye, X, Mail, User, Clock, 
  AlertCircle, ChevronRight, MessageSquare, CheckCircle, Clock3, 
  ShieldAlert, Filter, ArrowUpRight, Inbox, MoreVertical,
  Activity, Tag, UserPlus, Send, LayoutGrid, List
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function SupportManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const { showToast } = useToast() || {};

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => !t.isResolved).length,
      resolved: tickets.filter(t => t.isResolved).length,
      highPriority: tickets.filter(t => t.priority === 'high').length
    };
  }, [tickets]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await support.getAllAdmin();
      const data = res.data?.data || res.data?.tickets || res.data;
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Support fetch error:", err);
      setError(err.message || "Failed to initialize support node.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently purge this support ticket? This action is irreversible.")) return;
    try {
      await support.delete(id);
      loadTickets();
      if (selectedTicket?.id === id) setSelectedTicket(null);
    } catch (err) {
      alert("Failed to purge ticket");
    }
  };

  const handleToggleStatus = async (ticket) => {
    setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, isResolved: !t.isResolved } : t));
  };

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.message?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'open' && !t.isResolved) ||
        (activeTab === 'resolved' && t.isResolved);
      
      return matchesSearch && matchesTab;
    });
  }, [tickets, searchTerm, activeTab]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <LifeBuoy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500" size={24} />
      </div>
      <p className="text-slate-400 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Support Nodes...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-[#030712] min-h-screen text-slate-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
              <LifeBuoy className="text-cyan-400" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
                Support <span className="text-cyan-400">Resolution</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Operational Command Center</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 rounded-xl transition-all"
          >
            {viewMode === 'list' ? <LayoutGrid size={20} /> : <List size={20} />}
          </button>
          <button 
            onClick={loadTickets}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <RefreshCw size={16} /> Sync Registry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Inquiries', value: stats.total, icon: Inbox, color: 'blue' },
          { label: 'Active Tickets', value: stats.open, icon: Clock3, color: 'amber' },
          { label: 'Resolved Hub', value: stats.resolved, icon: CheckCircle, color: 'emerald' },
          { label: 'Critical Ops', value: stats.highPriority, icon: ShieldAlert, color: 'rose' }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all group`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by client DNA, email hash, or message content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all font-bold text-sm placeholder:text-slate-700"
          />
        </div>
        <div className="flex bg-slate-900/50 p-1.5 border border-slate-800 rounded-2xl">
          {['all', 'open', 'resolved'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
        {filtered.map((ticket) => (
          <div 
            key={ticket.id} 
            className={`bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group relative overflow-hidden ${
              ticket.isResolved ? 'opacity-60 grayscale-[0.5]' : ''
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform">
                    {ticket.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-white uppercase tracking-tight">{ticket.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${ticket.isResolved ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{ticket.isResolved ? 'Resolved' : 'Pending Action'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleStatus(ticket)}
                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg transition-all"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ticket.id)}
                    className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 italic">
                  <div className="flex items-center gap-1.5">
                    <Mail size={12} className="text-cyan-500" />
                    {ticket.email}
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">
                  {ticket.message}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock3 size={12} /> {new Date(ticket.created_at || Date.now()).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Inspect <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-xl flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative overflow-hidden">
            <button 
              onClick={() => setSelectedTicket(null)} 
              className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all bg-slate-800/50 p-2.5 rounded-full hover:rotate-90"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-8 p-10 border-b lg:border-b-0 lg:border-r border-slate-800">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-[1.5rem] flex items-center justify-center text-cyan-400 font-black text-2xl italic">
                    {selectedTicket.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedTicket.name}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                        {selectedTicket.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="text-slate-600" size={16} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Message Payload</span>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800/50 p-8 rounded-3xl">
                      <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedTicket.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => window.location.href = `mailto:${selectedTicket.email}`}
                      className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-cyan-500 text-black font-black uppercase tracking-[0.1em] text-xs rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_10px_30px_rgba(6,182,212,0.2)]"
                    >
                      <Send size={18} /> Transmit Reply
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(selectedTicket)}
                      className="flex-1 flex items-center justify-center gap-3 px-8 py-5 font-black uppercase tracking-[0.1em] text-xs rounded-2xl transition-all border border-emerald-500/20 text-emerald-500"
                    >
                      <CheckCircle size={18} />
                      {selectedTicket.isResolved ? 'Reopen Stream' : 'Finalize Resolution'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-slate-950/30 p-10 space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Ticket Metadata</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Registry ID</span>
                      <span className="text-[10px] font-mono font-bold text-white">#{selectedTicket.id?.toString().slice(-8).toUpperCase() || 'SYS_001'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Internal Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white text-[10px] font-bold uppercase rounded-xl transition-all border border-slate-800">
                      <UserPlus size={14} /> Assign Agent
                    </button>
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
