import React, { useState, useEffect } from "react";
import { fetchWarrantyAdmin, updateWarrantyAdmin, deleteWarrantyAdmin } from "../../services/api";
import {
  Loader2,
  Search,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Filter,
  FileText,
  Download,
  User,
  ShieldCheck,
  Zap,
  Sparkles,
  SearchCode,
  Calendar,
  Layers,
  Activity,
  ArrowUpRight
} from "lucide-react";

export default function EWarrantyManagement({ token }) {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWarrantyAdmin(token);
      setWarranties(data);
    } catch (err) {
      console.error("Warranty load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this warranty record?")) {
      try {
        await deleteWarrantyAdmin(id, token);
        loadData();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch = 
      w.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      w.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: warranties.filter(w => w.status === 'active').length,
    pending: warranties.filter(w => w.status === 'pending').length,
    expired: warranties.filter(w => w.status === 'expired').length,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin"></div>
        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 animate-pulse" size={24} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 p-4 lg:p-8 font-sans selection:bg-purple-500/30">
      {/* Background FX */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white via-purple-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
              <ShieldCheck className="text-purple-400" />
              Warranty Nexus
            </h1>
            <p className="text-gray-500 text-xs mt-1 font-mono uppercase tracking-widest flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" /> Secure Asset Authentication & Lifecycle
            </p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => {}} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn">
                <Download size={18} className="text-purple-400 group-hover/btn:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Export DB</span>
             </button>
          </div>
        </div>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Authenticated</p>
              <h3 className="text-2xl font-black text-emerald-400">{stats.active}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><CheckCircle size={20} className="text-emerald-500" /></div>
          </div>
          <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">In Review</p>
              <h3 className="text-2xl font-black text-amber-400">{stats.pending}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20"><Clock size={20} className="text-amber-500" /></div>
          </div>
          <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Terminated</p>
              <h3 className="text-2xl font-black text-red-400">{stats.expired}</h3>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20"><XCircle size={20} className="text-red-500" /></div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] flex flex-col lg:flex-row gap-4">
           <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Query customer identity or hardware ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-700 font-mono"
              />
           </div>
           <div className="flex gap-4">
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-10 py-4 outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none text-xs font-bold uppercase tracking-widest transition-all"
                >
                   <option value="all">Global Scan</option>
                   <option value="active">Active Only</option>
                   <option value="expired">Terminated</option>
                   <option value="pending">In Review</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              </div>
              <button onClick={loadData} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                <RefreshCw size={20} className="text-purple-400" />
              </button>
           </div>
        </div>

        {/* Database Grid */}
        <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
           <div className="overflow-x-auto custom-scroll">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer Profile</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hardware ID</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Lifecycle</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredWarranties.map((w) => (
                    <tr key={w.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-purple-500/10 rounded-xl border border-purple-500/20 flex items-center justify-center">
                              <User size={18} className="text-purple-400" />
                           </div>
                           <div>
                              <div className="font-bold text-gray-200">{w.customer_name}</div>
                              <div className="text-xs text-gray-600 font-mono mt-0.5">{w.customer_email}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <span className="font-mono text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20 inline-block w-fit">
                              {w.serial_number}
                           </span>
                           <span className="text-[10px] text-gray-600 mt-2 flex items-center gap-1 uppercase font-bold tracking-tighter">
                              <Calendar size={10} /> Registered: {new Date(w.purchase_date).toLocaleDateString()}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all ${
                           w.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10' :
                           w.status === 'expired' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                           'bg-amber-500/10 text-amber-400 border-amber-500/20'
                         }`}>
                           <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                              w.status === 'active' ? 'bg-emerald-400' :
                              w.status === 'expired' ? 'bg-red-400' : 'bg-amber-400'
                           }`} />
                           {w.status}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-3 bg-white/5 hover:bg-purple-500/20 text-purple-400 rounded-2xl transition-all"><FileText size={18} /></button>
                            <button onClick={() => handleDelete(w.id)} className="p-3 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all"><Trash2 size={18} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {filteredWarranties.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                         <div className="flex flex-col items-center gap-4">
                            <SearchCode size={48} className="text-gray-800" />
                            <p className="text-gray-600 font-mono text-sm">No records detected in current scan sector.</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
           
           {/* Footer Stats */}
           <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-3">
                 <Layers size={14} className="text-purple-400" />
                 Total Database Sector Volume: {warranties.length} Records
              </div>
              <div className="flex items-center gap-4">
                 <button className="hover:text-purple-400 transition-colors">Prev Segment</button>
                 <div className="w-1 h-1 bg-gray-700 rounded-full" />
                 <button className="hover:text-purple-400 transition-colors">Next Segment</button>
              </div>
           </div>
        </div>
      </div>

      <style>{\`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scroll::-webkit-scrollbar { height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
      \`}</style>
    </div>
  );
}
