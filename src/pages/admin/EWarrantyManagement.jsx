import React, { useState, useEffect } from "react";
import { fetchWarrantyAdmin, updateWarrantyAdmin, deleteWarrantyAdmin } from "../../services/api";
import { 
  Loader2, Search, Trash2, Edit3, CheckCircle, Clock, XCircle, 
  ChevronDown, Filter, FileText, Download, User, ShieldCheck, 
  Zap, Sparkles, SearchCode, Calendar, Layers, Activity, 
  ArrowUpRight, X, Save, RefreshCw
} from "lucide-react";

export default function EWarrantyManagement({ token }) {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

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

  const handleEdit = (warranty) => {
    setSelectedWarranty({ ...warranty });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateWarrantyAdmin(selectedWarranty.id, selectedWarranty, token);
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to update warranty.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = () => {
    const headers = ["Customer", "Email", "Serial Number", "Purchase Date", "Status"];
    const csvData = warranties.map(w => [
      w.customer_name,
      w.customer_email,
      w.serial_number,
      w.purchase_date,
      w.status
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("
");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warranties_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch = 
      w.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredWarranties.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredWarranties.length / recordsPerPage);

  const stats = {
    active: warranties.filter(w => w.status === 'active').length,
    pending: warranties.filter(w => w.status === 'pending').length,
    expired: warranties.filter(w => w.status === 'expired').length,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin relative z-10" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050608] text-gray-300 p-4 lg:p-12 font-sans selection:bg-purple-500/30 selection:text-white relative overflow-hidden custom-scroll">
      {/* Background FX */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <ShieldCheck className="text-purple-400" size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
                Warranty <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Nexus</span>
              </h1>
            </div>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em]">Secure Asset Authentication & Lifecycle</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn"
            >
              <Download size={18} className="group-hover/btn:translate-y-0.5 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider">Export DB</span>
            </button>
            <button 
              onClick={loadData}
              className="p-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-2xl transition-all"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Authenticated', val: stats.active, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
            { label: 'In Review', val: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/5' },
            { label: 'Terminated', val: stats.expired, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/5' }
          ].map((stat, i) => (
            <div key={i} className={`p-8 rounded-[2rem] border border-white/5 ${stat.bg} backdrop-blur-md group hover:border-white/10 transition-all`}>
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-black/40 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Sector {i + 1}</div>
              </div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
              <h3 className="text-4xl font-black text-white tracking-tighter tabular-nums">{stat.val}</h3>
            </div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Query customer identity or hardware ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-700 font-mono"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
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
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Database Grid */}
        <div className="bg-[#0a0c10]/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl mb-8">
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Customer Profile</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Hardware ID</th>
                  <th className="px-8 py-6 text-left text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Lifecycle</th>
                  <th className="px-8 py-6 text-right text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {currentRecords.map((w) => (
                  <tr key={w.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/5">
                          <User size={18} className="text-purple-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white mb-0.5">{w.customer_name}</div>
                          <div className="text-[10px] font-mono text-gray-600">{w.customer_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-mono text-purple-400 tracking-wider font-bold">#{w.serial_number}</div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <Calendar size={12} />
                          Registered: {new Date(w.purchase_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                        w.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        w.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        <div className={`w-1 h-1 rounded-full animate-pulse ${
                          w.status === 'active' ? 'bg-emerald-400' :
                          w.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        {w.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(w)}
                          className="p-3 bg-white/5 hover:bg-purple-500/20 text-purple-400 rounded-2xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(w.id)}
                          className="p-3 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
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
        </div>

        {/* Footer Stats & Pagination */}
        <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
            <Layers size={14} className="text-purple-400" />
            Total Database Sector Volume: {filteredWarranties.length} Records
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
            >
              Prev Segment
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono transition-all ${
                    currentPage === i + 1 ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
            >
              Next Segment
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedWarranty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050608]/80 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-[#0a0c10] border border-white/10 w-full max-w-xl rounded-[2.5rem] relative z-10 overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Edit3 className="text-purple-400" size={20} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Edit Warranty Record</h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Customer Name</label>
                <input 
                  type="text"
                  value={selectedWarranty.customer_name}
                  onChange={(e) => setSelectedWarranty({...selectedWarranty, customer_name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Serial Number</label>
                <input 
                  type="text"
                  value={selectedWarranty.serial_number}
                  onChange={(e) => setSelectedWarranty({...selectedWarranty, serial_number: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Customer Email</label>
                <input 
                  type="email"
                  value={selectedWarranty.customer_email}
                  onChange={(e) => setSelectedWarranty({...selectedWarranty, customer_email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={selectedWarranty.status}
                  onChange={(e) => setSelectedWarranty({...selectedWarranty, status: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Purchase Date</label>
                <input 
                  type="date"
                  value={selectedWarranty.purchase_date?.split('T')[0]}
                  onChange={(e) => setSelectedWarranty({...selectedWarranty, purchase_date: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all color-scheme-dark"
                />
              </div>
            </div>

            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
              <button 
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isUpdating ? 'Synchronizing...' : 'Apply Changes'}
              </button>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-2xl transition-all"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .custom-scroll::-webkit-scrollbar {
            height: 6px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: #1f2937;
            border-radius: 10px;
          }
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #1f2937;
            border-radius: 10px;
          }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
        `}
      </style>
    </div>
  );
}
