import React, { useState, useEffect, useRef } from "react";
import {
  fetchWarrantyAdmin, updateWarrantyStatusAdmin, deleteWarrantyAdmin,
  fetchProductsAdmin, fetchProductSerials, addProductSerials, bulkAddProductSerials,
  updateProductSerial, deleteProductSerial, checkSerialAvailability
} from "../../services/api";
import {
  Loader2, Search, Trash2, Edit3, CheckCircle, Clock, XCircle,
  QrCode, Printer, Download, Upload, Plus, Package,
  FileBarChart, Filter, RefreshCw, X, Save, AlertCircle,
  Sparkles, Zap, ShieldCheck, Hash, Copy, Check
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
  
  // Serial Management
  const [activeTab, setActiveTab] = useState("warranties"); // "warranties" | "serials"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [serialsLoading, setSerialsLoading] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [serialPrefix, setSerialPrefix] = useState("ANRT");
  const [serialCount, setSerialCount] = useState(10);
  const [serialFormat, setSerialFormat] = useState("alphanumeric"); // "numeric" | "alphanumeric"
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [copiedSerial, setCopiedSerial] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  useEffect(() => {
    loadWarrantyData();
    loadProductsData();
  }, [token]);

  useEffect(() => {
    if (selectedProduct) {
      loadProductSerials(selectedProduct.id);
    }
  }, [selectedProduct]);

  const loadWarrantyData = async () => {
    setLoading(true);
    try {
      const data = await fetchWarrantyAdmin(token);
      setWarranties(data || []);
    } catch (err) {
      console.error("Warranty load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsData = async () => {
    try {
      const data = await fetchProductsAdmin(token);
      setProducts(data || []);
    } catch (err) {
      console.error("Products load error:", err);
    }
  };

  const loadProductSerials = async (productId) => {
    setSerialsLoading(true);
    try {
      const data = await fetchProductSerials(productId, token);
      setProductSerials(data.serials || []);
    } catch (err) {
      console.error("Serials load error:", err);
    } finally {
      setSerialsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedWarranty) return;
    setIsUpdating(true);
    try {
      await updateWarrantyStatusAdmin(token, selectedWarranty.id, selectedWarranty.status);
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
        await deleteWarrantyAdmin(token, id);
        loadWarrantyData();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const handleExport = () => {
    const headers = ["Customer", "Email", "Serial Number", "Purchase Date", "Status"];
    const csvData = warranties.map(w => [
      w.customer_name, w.customer_email, w.serial_number, w.purchase_date, w.status
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

  const generateSerials = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);
    const newSerials = [];
    const characters = serialFormat === "numeric" ? "0123456789" : "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for (let i = 0; i < serialCount; i++) {
      let result = serialPrefix;
      for (let j = 0; j < 8; j++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      newSerials.push(result);
    }

    try {
      await addProductSerials(selectedProduct.id, newSerials, token);
      loadProductSerials(selectedProduct.id);
      setIsGeneratorOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSerial(text);
    setTimeout(() => setCopiedSerial(""), 2000);
  };

  const printLabels = async (serialsToPrint) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Serial Labels</title>
          <style>
            @media print {
              body { margin: 0; }
              .label { page-break-inside: avoid; border: 1px solid #eee; margin: 10px; padding: 15px; width: 250px; display: inline-block; font-family: sans-serif; }
            }
            .label { border: 1px solid #eee; margin: 10px; padding: 15px; width: 250px; display: inline-block; font-family: sans-serif; text-align: center; border-radius: 8px; }
            .qr { width: 150px; height: 150px; margin: 10px auto; }
            .serial { font-weight: bold; font-size: 14px; margin-top: 5px; color: #333; }
            .brand { font-size: 12px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .product { font-size: 10px; color: #999; margin-top: 2px; }
          </style>
        </head>
        <body>
          <div id="labels"></div>
        </body>
      </html>
    `);

    const labelsDiv = printWindow.document.getElementById('labels');
    
    for (const serialObj of serialsToPrint) {
      const serial = typeof serialObj === 'string' ? serialObj : serialObj.serial;
      const qrDataUrl = await QRCode.toDataURL(`${window.location.origin}/e-warranty?serial=${serial}`, {
        margin: 1,
        width: 300,
        color: { dark: '#000000', light: '#ffffff' }
      });

      const label = printWindow.document.createElement('div');
      label.className = 'label';
      label.innerHTML = `
        <div class="brand">Anritvox India</div>
        <img class="qr" src="${qrDataUrl}" />
        <div class="serial">${serial}</div>
        <div class="product">${selectedProduct ? selectedProduct.name : 'Authentic Product'}</div>
      `;
      labelsDiv.appendChild(label);
    }

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch = w.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-mono text-sm animate-pulse">Initializing Warranty Systems...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldCheck className="text-purple-400" />
            Warranty <span className="text-purple-400">Nexus</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Enterprise Asset Authentication & Lifecycle Management</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-white/5"
          >
            <Download size={14} /> Export DB
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-white/5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab("warranties")}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'warranties' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <FileBarChart size={14} /> Registered Units
        </button>
        <button 
          onClick={() => setActiveTab("serials")}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'serials' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Hash size={14} /> Serial Inventory
        </button>
      </div>

      {activeTab === "warranties" ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Authenticated', val: stats.active, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
              { label: 'Pending Review', val: stats.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
              { label: 'Terminated', val: stats.expired, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/10' }
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} ${stat.border} border rounded-2xl p-4 animate-fade-in`} style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Sector 0{i+1}</span>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.val}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input 
                type="text" 
                placeholder="Query customer identity or hardware ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-700 font-mono"
              />
            </div>
            <div className="w-full sm:w-48">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl px-6 py-3.5 outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none text-xs font-bold uppercase tracking-widest transition-all text-gray-300"
              >
                <option value="all">Global Scan</option>
                <option value="active">Active Only</option>
                <option value="pending">In Review</option>
                <option value="expired">Terminated</option>
              </select>
            </div>
          </div>

          {/* Registered List */}
          <div className="bg-[#0a0c10]/50 border border-white/5 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Customer Profile</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Hardware ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-center">Lifecycle</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredWarranties.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-sm">{w.customer_name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{w.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded text-xs font-mono">#{w.serial_number}</code>
                          <button onClick={() => copyToClipboard(w.serial_number)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-white transition-all">
                            {copiedSerial === w.serial_number ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1 uppercase tracking-tighter">Registered: {new Date(w.purchase_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          w.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          w.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedWarranty(w); setIsEditModalOpen(true); }}
                            className="p-2 bg-white/5 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(w.id)}
                            className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWarranties.length === 0 && (
                <div className="py-20 flex flex-col items-center text-gray-600">
                  <SearchCode size={40} className="mb-4 opacity-20" />
                  <p className="text-sm font-mono">No matching records found in database.</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Serial Inventory Tab */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Sidebar: Product List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0a0c10] border border-white/5 rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Package size={14} /> Product Base
              </h3>
              <div className="space-y-1">
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${selectedProduct?.id === p.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                  >
                    <span className="truncate">{p.name}</span>
                    <ArrowUpRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedProduct?.id === p.id ? 'opacity-100' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area: Serials */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedProduct ? (
              <div className="bg-[#0a0c10]/50 border border-white/5 border-dashed rounded-3xl h-[400px] flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <h4 className="text-white font-bold mb-1">Secure Inventory Management</h4>
                <p className="text-sm max-w-xs">Select a product from the database to manage unique serial numbers and generate authentication labels.</p>
              </div>
            ) : (
              <div className="bg-[#0a0c10]/50 border border-white/5 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-purple-400 font-mono">Category: {selectedProduct.category_name}</span>
                      <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                      <span className="text-xs text-gray-500">{productSerials.length} Active Serials</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsGeneratorOpen(true)}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Plus size={14} /> Create Serials
                    </button>
                    {selectedSerials.length > 0 && (
                      <button 
                        onClick={() => printLabels(selectedSerials)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <Printer size={14} /> Print ({selectedSerials.length})
                      </button>
                    )}
                  </div>
                </div>

                {serialsLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-purple-500" size={32} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productSerials.map(s => (
                      <div 
                        key={s.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 group relative ${selectedSerials.includes(s) ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/2 border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-bold text-white font-mono">{s.serial}</code>
                          <input 
                            type="checkbox"
                            checked={selectedSerials.includes(s)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSerials([...selectedSerials, s]);
                              else setSelectedSerials(selectedSerials.filter(item => item !== s));
                            }}
                            className="w-4 h-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500/50 cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${s.is_registered ? 'text-emerald-400' : 'text-gray-600'}`}>
                            {s.is_registered ? 'Registered' : 'Available'}
                          </span>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copyToClipboard(s.serial)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
                              {copiedSerial === s.serial ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                            <button onClick={() => printLabels([s])} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-purple-400 transition-all">
                              <Printer size={12} />
                            </button>
                            {!s.is_registered && (
                              <button 
                                onClick={async () => {
                                  if (window.confirm("Delete this serial number?")) {
                                    try {
                                      await deleteProductSerial(selectedProduct.id, s.id, token);
                                      loadProductSerials(selectedProduct.id);
                                    } catch (err) { alert(err.message); }
                                  }
                                }}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {productSerials.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-600">
                        <p className="text-sm font-mono italic">No serial numbers allocated for this sector.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generator Modal */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0f14] border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 animate-fade-in relative shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Advanced Generator</h3>
                  <p className="text-xs text-gray-500">Mass-produce secure product identities</p>
                </div>
              </div>
              <button onClick={() => setIsGeneratorOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 ml-1">Serial Prefix</label>
                  <input 
                    type="text" 
                    value={serialPrefix}
                    onChange={(e) => setSerialPrefix(e.target.value.toUpperCase())}
                    placeholder="e.g. ANRT"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 ml-1">Batch Size</label>
                  <input 
                    type="number" 
                    value={serialCount}
                    onChange={(e) => setSerialCount(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 ml-1">Algorithm Complexity</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSerialFormat("numeric")}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${serialFormat === 'numeric' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-black/40 border-white/10 text-gray-500'}`}
                  >
                    Numeric Only
                  </button>
                  <button 
                    onClick={() => setSerialFormat("alphanumeric")}
                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${serialFormat === 'alphanumeric' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-black/40 border-white/10 text-gray-500'}`}
                  >
                    Alpha-Numeric
                  </button>
                </div>
              </div>

              <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 flex items-start gap-4">
                <AlertCircle size={18} className="text-purple-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-tighter">
                  System will automatically generate unique cryptographically-random suffixes. These serials will be immediately active in the authentication database upon generation.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  onClick={generateSerials}
                  disabled={isUpdating}
                  className="flex-1 py-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  Commence Generation
                </button>
                <button 
                  onClick={() => setIsGeneratorOpen(false)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Edit Modal */}
      {isEditModalOpen && selectedWarranty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0f14] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 animate-fade-in relative">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">Update Lifecycle</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 ml-1">Authentication Status</label>
                <select 
                  value={selectedWarranty.status}
                  onChange={(e) => setSelectedWarranty({...selectedWarranty, status: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all appearance-none text-white"
                >
                  <option value="active">Active / Verified</option>
                  <option value="pending">In Review / Pending</option>
                  <option value="expired">Terminated / Expired</option>
                </select>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Update Database
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-2xl transition-all"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
