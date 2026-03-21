import React, { useState, useEffect, useRef } from "react";
import { 
  fetchWarrantyAdmin, 
  updateWarrantyStatusAdmin, 
  deleteWarrantyAdmin, 
  fetchProductsAdmin, 
  fetchProductSerials, 
  addProductSerials, 
  bulkAddProductSerials, 
  updateProductSerial, 
  deleteProductSerial, 
  checkSerialAvailability 
} from "../../services/api";
import { 
  Loader2, Search, Trash2, Edit3, CheckCircle, Clock, XCircle, 
  QrCode, Printer, Download, Upload, Plus, Package, 
  FileBarChart, Filter, RefreshCw, X, Save, AlertCircle, 
  Sparkles, Zap, ShieldCheck, Hash, Copy, Check, ArrowUpRight, SearchCode 
} from "lucide-react";
import QRCode from "qrcode";

export default function EWarrantyManagement({ token }) {
  const [warranties, setWarranties] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Serial Management State
  const [activeTab, setActiveTab] = useState("warranties");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [serialsLoading, setSerialsLoading] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [serialPrefix, setSerialPrefix] = useState("AV");
  const [serialCount, setSerialCount] = useState(10);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [copiedSerial, setCopiedSerial] = useState("");
  const [serialPagination, setSerialPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  useEffect(() => {
    loadWarrantyData();
    loadProductsData();
  }, [token]);

  useEffect(() => {
    if (selectedProduct) {
      loadProductSerials(selectedProduct.id, 1);
    }
  }, [selectedProduct]);

 const loadWarrantyData = async () => {
    setLoading(true);
    try {
     const data = await fetchWarrantyAdmin();
      const normalizedData = Array.isArray(data) ? data : (data.warranties || []);
      setWarranties(normalizedData);
    } catch (err) {
      console.error("Warranty load error:", err);
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

 const loadProductsData = async () => {
    try {
     const data = await fetchProductsAdmin();
      const normalizedData = Array.isArray(data) ? data : (data.products || []);
      setProducts(normalizedData);
    } catch (err) {
      console.error("Products load error:", err);
      setProducts([]);
    }
  };

  // Step B: Updated loadProductSerials to handle the page parameter
  const loadProductSerials = async (productId, page = 1) => {
    setSerialsLoading(true);
    try {
     const loadProductSerials = async (productId, page = 1) => {
    setSerialsLoading(true);
    try {
      const data = await fetchProductSerials(productId, page);
      setProductSerials(Array.isArray(data) ? data : (data.serials || []));
      if (data.pagination) {
        setSerialPagination(data.pagination);
      }
    } catch (err) {
      console.error("Serials load error:", err);
      setProductSerials([]);
    } finally {
      setSerialsLoading(false);
    }
  };

 const handleUpdate = async () => {
    if (!selectedWarranty) return;
    setIsUpdating(true);
    try {
      await updateWarrantyStatusAdmin(selectedWarranty.id, selectedWarranty.status);
      setIsEditModalOpen(false);
      loadWarrantyData();
    } catch (err) {
      alert("Failed to update warranty.");
    } finally {
      setIsUpdating(false);
    }
  };

 const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this warranty record?")) {
      try {
        await deleteWarrantyAdmin(id);
        loadWarrantyData();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const handleExport = () => {
    const headers = ["Customer", "Email", "Serial Number", "Purchase Date", "Status"];
    const csvRows = [headers.join(",")];
    
    warranties.forEach(w => {
      csvRows.push([
        w.user_name,
        w.user_email,
        w.serial,
        w.registered_at,
        w.status
      ].join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warranties_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateSerials = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);

    try {
      const paddedPrefix = (serialPrefix || 'AV').toUpperCase().substring(0, 4).padEnd(4, 'X');
      const generateSerials = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);

    try {
      const paddedPrefix = (serialPrefix || 'AV').toUpperCase().substring(0, 4).padEnd(4, 'X');
      await addProductSerials(selectedProduct.id, serialCount, paddedPrefix);
      await loadProductSerials(selectedProduct.id, 1);
      setIsGeneratorOpen(false);
    } catch (err) {
      alert(err.message || "Failed to generate serials");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSerial(text);
    setTimeout(() => setCopiedSerial(""), 2000);
  };

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch = w.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.serial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    active: warranties.filter(w => w.status === 'accepted').length,
    pending: warranties.filter(w => w.status === 'pending').length,
    expired: warranties.filter(w => w.status === 'rejected').length,
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        <p className="text-gray-500 font-mono text-xs tracking-widest animate-pulse">INITIALIZING SYSTEMS...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
              WARRANTY <span className="text-purple-500">NEXUS</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium tracking-tight">Enterprise Asset Authentication & Lifecycle Management</p>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
            <Download className="w-4 h-4" /> Export DB
          </button>
        </div>

        <div className="flex gap-2 p-1.5 bg-[#0a0c10] border border-white/5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab("warranties")} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'warranties' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}>
            <ShieldCheck className="w-4 h-4" /> Registered Units
          </button>
          <button onClick={() => setActiveTab("serials")} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'serials' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}>
            <Hash className="w-4 h-4" /> Serial Inventory
          </button>
        </div>

        {activeTab === "warranties" ? (
          <>
            {/* Warranty Content... (omitted for brevity but kept in your local file) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Authenticated', val: stats.active, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
                { label: 'Pending Review', val: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
                { label: 'Terminated', val: stats.expired, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/10' }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-3xl border ${stat.border} ${stat.bg} space-y-4 group hover:border-white/10 transition-all`}>
                  <div className="flex items-center justify-between">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Sector 0{i+1}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">{stat.val}</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                <input type="text" placeholder="Query identity..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-700 font-mono" />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none text-xs font-bold uppercase tracking-widest transition-all text-gray-300">
                  <option value="all">Global Scan</option>
                  <option value="accepted">Active Only</option>
                  <option value="pending">In Review</option>
                  <option value="rejected">Terminated</option>
                </select>
              </div>
            </div>

            <div className="bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Profile</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hardware ID</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredWarranties.map((w) => (
                      <tr key={w.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-bold text-white">{w.user_name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">{w.user_email}</div>
                        </td>
                        <td className="px-6 py-5">
                          <code className="text-purple-400 font-bold bg-purple-500/5 px-2 py-1 rounded-lg">#{w.serial}</code>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setSelectedWarranty(w); setIsEditModalOpen(true); }} className="p-2 bg-white/5 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(w.id)} className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Registry</h3>
              <div className="space-y-1">
                {products.map(p => (
                  <button key={p.id} onClick={() => setSelectedProduct(p)} className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center justify-between group ${selectedProduct?.id === p.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                    <span className="font-bold truncate pr-4">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              {!selectedProduct ? (
                <div className="h-96 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                  <Package className="w-12 h-12 text-gray-800 mb-4" />
                  <h4 className="text-white font-bold mb-1">Select Product</h4>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0c10] border border-white/5 p-6 rounded-3xl">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">{selectedProduct.name}</h2>
                      {/* Step C: Fix the Active Identifiers counter */}
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {serialPagination.total || productSerials.length} Total Identifiers
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setIsGeneratorOpen(true)} className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
                        <Zap className="w-4 h-4" /> Generate
                      </button>
                    </div>
                  </div>

                  {/* Step D: Serial Grid & Pagination Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {productSerials.map(s => (
                      <div key={s.id} className="bg-[#0a0c10] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
                        <div className="font-mono text-sm font-bold text-white tracking-wider">{s.serial_number || s.serial}</div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => copyToClipboard(s.serial_number || s.serial)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white">
                            {copiedSerial === (s.serial_number || s.serial) ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Block */}
                  {serialPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 bg-[#0a0c10] border border-white/5 p-4 rounded-2xl">
                      <button 
                        disabled={serialPagination.page <= 1}
                        onClick={() => loadProductSerials(selectedProduct.id, serialPagination.page - 1)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 rounded-lg text-sm transition-all"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-400 font-mono">
                        Page {serialPagination.page} of {serialPagination.totalPages}
                      </span>
                      <button 
                        disabled={serialPagination.page >= serialPagination.totalPages}
                        onClick={() => loadProductSerials(selectedProduct.id, serialPagination.page + 1)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 rounded-lg text-sm transition-all"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals and Styles (omitted but preserve) */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0c10] border border-white/10 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Batch Generator</h3>
                <button onClick={() => setIsGeneratorOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Serial Prefix</label>
                  <input type="text" value={serialPrefix} onChange={(e) => setSerialPrefix(e.target.value.toUpperCase())} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Batch Size</label>
                  <input type="number" value={serialCount} onChange={(e) => setSerialCount(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono" />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={generateSerials} disabled={isUpdating} className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-purple-500/20">
                  {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Commence Generation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedWarranty && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0c10] border border-white/10 w-full max-md rounded-[40px] overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Status Update</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Status</label>
                <select value={selectedWarranty.status} onChange={(e) => setSelectedWarranty({...selectedWarranty, status: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none text-white">
                  <option value="accepted">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Expired</option>
                </select>
              </div>
              <button onClick={handleUpdate} disabled={isUpdating} className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-purple-500/20">
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
