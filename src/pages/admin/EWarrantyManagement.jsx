import React, { useState, useEffect } from "react";

import { 
  fetchWarrantyAdmin, 
  updateWarrantyStatusAdmin, 
  deleteWarrantyAdmin, 
  fetchProductsAdmin, 
  fetchProductSerials, 
  addProductSerials, 
  deleteProductSerial,
  exportSerialsExcel
} from "../../services/api";
import { 
  Loader2, Search, Trash2, Edit3, CheckCircle, Clock, XCircle, 
  Download, Printer, Plus, Package, Filter, X, Zap, ShieldCheck, 
  Hash, Copy, Check, FileSpreadsheet, ArrowUpDown
} from "lucide-react";

export default function EWarrantyManagement() {
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
  const [copiedSerial, setCopiedSerial] = useState("");
  
  // Advanced Generator State
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genConfig, setGenConfig] = useState({ prefix: "ANRI", count: 100, batchNumber: "", notes: "" });

  // Printing & Sorting State
  const [selectedPrintSerials, setSelectedPrintSerials] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ field: "created_at", order: "DESC" });
  const [serialPagination, setSerialPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  useEffect(() => {
    loadWarrantyData();
    loadProductsData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductSerials(selectedProduct.id, 1, sortConfig.field, sortConfig.order);
      setSelectedPrintSerials(new Set()); // Clear print queue on product change
    }
  }, [selectedProduct, sortConfig]);

  const loadWarrantyData = async () => {
    setLoading(true);
    try {
      const data = await fetchWarrantyAdmin();
      setWarranties(Array.isArray(data) ? data : (data.warranties || []));
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
      setProducts(Array.isArray(data) ? data : (data.products || []));
    } catch (err) {
      console.error("Products load error:", err);
      setProducts([]);
    }
  };

  const loadProductSerials = async (productId, page = 1, sortBy = 'created_at', sortOrder = 'DESC') => {
    setSerialsLoading(true);
    try {
      const data = await fetchProductSerials(productId, page, 100, sortBy, sortOrder);
      setProductSerials(Array.isArray(data) ? data : (data.serials || []));
      if (data.pagination) setSerialPagination(data.pagination);
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

  // --- NEW: Serial Delete Function ---
  const handleDeleteProductSerial = async (serialId, serialNumber) => {
    if (window.confirm(`PERMANENTLY DELETE serial: ${serialNumber}? This action cannot be undone.`)) {
      setSerialsLoading(true);
      try {
        await deleteProductSerial(selectedProduct.id, serialId);
        await loadProductSerials(selectedProduct.id, serialPagination.page, sortConfig.field, sortConfig.order);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete serial. It might be actively registered.");
      } finally {
        setSerialsLoading(false);
      }
    }
  };

 const generateAdvancedSerials = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);
    try {
      await addProductSerials(selectedProduct.id, genConfig.count, genConfig.prefix, genConfig.batchNumber, genConfig.notes);
      
      await loadProductSerials(selectedProduct.id, 1, sortConfig.field, sortConfig.order);
      
      await downloadExcel();

      setIsGeneratorOpen(false);
      setGenConfig({ prefix: "ANRI", count: 100, batchNumber: "", notes: "" });
    } catch (err) {
      alert(err.message || "Failed to generate serials");
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadExcel = async () => {
    try {
      const blob = await exportSerialsExcel({ productId: selectedProduct?.id });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Anritvox_Serials_${selectedProduct ? selectedProduct.name : 'ALL'}_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
    } catch (error) {
      alert("Excel Export Failed");
    }
  };

  const executePrintJob = () => {
    if (selectedPrintSerials.size === 0) return alert("Select at least one serial to print.");
    
    const printItems = productSerials.filter(s => selectedPrintSerials.has(s.id));
    const printWindow = window.open('', '_blank');
    
    let html = `
      <html><head><title>Print Labels - ${selectedProduct.name}</title>
      <style>
        body { font-family: 'Courier New', Courier, monospace; padding: 20px; background: white; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
        .label { border: 2px solid #000; padding: 15px; text-align: center; border-radius: 8px; page-break-inside: avoid; }
        .brand { font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
        .serial { font-size: 16px; font-weight: 900; letter-spacing: 1px; }
        .meta { font-size: 9px; color: #555; margin-top: 5px; }
        @media print { button { display: none; } }
      </style></head><body>
      <div style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-weight: bold; cursor: pointer;">Print Now</button>
      </div>
      <div class="grid">
    `;

    printItems.forEach(item => {
      html += `
        <div class="label">
          <div class="brand">ANRITVOX AUTHENTIC</div>
          <div class="serial">${item.serial_number || item.serial}</div>
          <div class="meta">${selectedProduct.name.substring(0, 20)} | BATCH: ${item.batch_number || 'N/A'}</div>
        </div>
      `;
    });

    html += `</div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const toggleSelectSerial = (id) => {
    const newSet = new Set(selectedPrintSerials);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPrintSerials(newSet);
  };

  const selectAllSerials = () => {
    if (selectedPrintSerials.size === productSerials.length) {
      setSelectedPrintSerials(new Set());
    } else {
      setSelectedPrintSerials(new Set(productSerials.map(s => s.id)));
    }
  };

  const handleSort = (field) => {
    const order = sortConfig.field === field && sortConfig.order === "DESC" ? "ASC" : "DESC";
    setSortConfig({ field, order });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSerial(text);
    setTimeout(() => setCopiedSerial(""), 2000);
  };

 const filteredWarranties = warranties.filter(w => {
    const matchesSearch = w.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.registered_serial?.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
          <button onClick={downloadExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">
            <FileSpreadsheet className="w-4 h-4" /> Global Excel Export
          </button>
        </div>

        <div className="flex gap-2 p-1.5 bg-[#0a0c10] border border-white/5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab("warranties")} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'warranties' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}>
            <ShieldCheck className="w-4 h-4" /> Registered Units
          </button>
          <button onClick={() => setActiveTab("serials")} className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'serials' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}>
            <Hash className="w-4 h-4" /> Advanced Serial Inventory
          </button>
        </div>

        {activeTab === "warranties" ? (
          <>
            {/* Warranty stats & search inputs ... */}
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
                        <code className="text-purple-400 font-bold bg-purple-500/5 px-2 py-1 rounded-lg">#{w.registered_serial}</code>
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
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-1 space-y-4">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-2">Registry</h3>
              <div className="space-y-1 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {products.map(p => (
                  <button key={p.id} onClick={() => setSelectedProduct(p)} className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center justify-between group ${selectedProduct?.id === p.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                    <span className="font-bold truncate pr-4">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="xl:col-span-3 space-y-6">
              {!selectedProduct ? (
                <div className="h-96 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                  <Package className="w-12 h-12 text-gray-800 mb-4" />
                  <h4 className="text-white font-bold mb-1">Select Product Base</h4>
                  <p className="text-sm text-gray-500">Choose a product to manage its serial inventory</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0c10] border border-white/5 p-6 rounded-3xl">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">{selectedProduct.name}</h2>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        {serialPagination.total || productSerials.length} Total Identifiers
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedPrintSerials.size > 0 && (
                        <button onClick={executePrintJob} className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2">
                          <Printer className="w-4 h-4" /> Print Labels ({selectedPrintSerials.size})
                        </button>
                      )}
                      <button onClick={downloadExcel} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-white/10">
                        <Download className="w-4 h-4" /> Batch Export
                      </button>
                      <button onClick={() => setIsGeneratorOpen(true)} className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20">
                        <Zap className="w-4 h-4" /> Advanced Generate
                      </button>
                    </div>
                  </div>

                  {serialsLoading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
                  ) : (
                    <div className="bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                              <th className="px-6 py-4 w-10">
                                <input type="checkbox" checked={selectedPrintSerials.size === productSerials.length && productSerials.length > 0} onChange={selectAllSerials} className="rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500/50" />
                              </th>
                              <th onClick={() => handleSort("serial_number")} className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white group">
                                Serial Number <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                              </th>
                              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type / Format</th>
                              <th onClick={() => handleSort("status")} className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white group">
                                Status <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                              </th>
                              <th onClick={() => handleSort("batch_number")} className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white group">
                                Batch / Notes <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                              </th>
                              <th onClick={() => handleSort("created_at")} className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:text-white group">
                                Generated <ArrowUpDown className="inline w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                              </th>
                              {/* NEW ACTIONS HEADER */}
                              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {productSerials.map((s) => (
                              <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                  <input type="checkbox" checked={selectedPrintSerials.has(s.id)} onChange={() => toggleSelectSerial(s.id)} className="rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500/50" />
                                </td>
                                <td className="px-6 py-4 font-mono text-sm font-bold text-white tracking-wider flex items-center gap-2">
                                  {s.serial_number || s.serial}
                                  <button onClick={() => copyToClipboard(s.serial_number || s.serial)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-500 transition-all">
                                    {copiedSerial === (s.serial_number || s.serial) ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </td>
                                <td className="px-6 py-4">
                                  {s.is_new_format ? (
                                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[9px] font-black uppercase tracking-widest">Enhanced Checksum</span>
                                  ) : (
                                    <span className="px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-[9px] font-black uppercase tracking-widest">Legacy Old</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${s.status === 'available' ? 'bg-emerald-500/10 text-emerald-400' : s.status === 'registered' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {s.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-xs font-bold text-gray-300">{s.batch_number || "NO BATCH"}</div>
                                  {s.notes && <div className="text-[10px] text-gray-500 truncate max-w-[150px] mt-0.5">{s.notes}</div>}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                  {new Date(s.created_at).toLocaleDateString()}
                                </td>
                                
                                {/* NEW DELETE BUTTON IN ACTIONS COLUMN */}
                                <td className="px-6 py-4 text-right">
                                  {s.status !== 'registered' && (
                                    <button 
                                      onClick={() => handleDeleteProductSerial(s.id, s.serial_number || s.serial)} 
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/50 text-rose-500 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ml-auto"
                                    >
                                      <Trash2 className="w-3.5 h-3.5"/> Delete
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Block */}
                      {serialPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-white/5 bg-white/[0.01]">
                          <button disabled={serialPagination.page <= 1} onClick={() => loadProductSerials(selectedProduct.id, serialPagination.page - 1, sortConfig.field, sortConfig.order)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                            Prev Page
                          </button>
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                            {serialPagination.page} / {serialPagination.totalPages}
                          </span>
                          <button disabled={serialPagination.page >= serialPagination.totalPages} onClick={() => loadProductSerials(selectedProduct.id, serialPagination.page + 1, sortConfig.field, sortConfig.order)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                            Next Page
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Batch Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0c10] border border-white/10 w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">Advanced Engine</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Generate High-Integrity Serials</p>
                </div>
                <button onClick={() => setIsGeneratorOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Prefix (Max 4)</label>
                    <input type="text" maxLength={4} value={genConfig.prefix} onChange={(e) => setGenConfig({...genConfig, prefix: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono" placeholder="ANRI" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Volume</label>
                    <input type="number" min="1" max="100000" value={genConfig.count} onChange={(e) => setGenConfig({...genConfig, count: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Batch Identifier</label>
                  <input type="text" value={genConfig.batchNumber} onChange={(e) => setGenConfig({...genConfig, batchNumber: e.target.value.toUpperCase()})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono" placeholder="Optional. E.g., Q3-PRO-RUN" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Internal Notes</label>
                  <textarea value={genConfig.notes} onChange={(e) => setGenConfig({...genConfig, notes: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white min-h-[100px]" placeholder="Add context for this manufacturing run..." />
                </div>
              </div>
              <button onClick={generateAdvancedSerials} disabled={isUpdating} className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex justify-center items-center gap-2">
                {isUpdating ? <><Loader2 className="w-5 h-5 animate-spin" /> EXECUTING...</> : <><Zap className="w-5 h-5" /> COMMENCE GENERATION</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Warranty Modal */}
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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }
      `}} />
    </div>
  );
}
