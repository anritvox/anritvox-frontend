import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Plus, Edit2, Trash2, Search, Filter, RefreshCw, AlertTriangle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Video, BoxSelect, ShieldCheck, Tag, Activity, Cpu, QrCode, List
} from 'lucide-react';
import api, { products as productsApi, categories as categoriesApi, serials as serialsApi, BASE_URL } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Modals State
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isSerialModalOpen, setSerialModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'media', 'warranty'
  const [serialTab, setSerialTab] = useState('generate'); // 'generate', 'view'
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const { showToast } = useToast() || {};

  // Form States
  const [form, setForm] = useState({
    name: '', description: '', price: '', quantity: '', category_id: '', 
    video_urls: '', model_3d_url: '', warranty_period: 12, status: 'active'
  });
  const [images, setImages] = useState([]);

  const [serialForm, setSerialForm] = useState({
    count: 10, prefix: 'ANR', format: 'advanced', base_warranty_months: 12
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productsApi.getAllAdmin(),
        categoriesApi.getAll()
      ]);
      setProducts(prodRes.data?.products || prodRes.data?.data || prodRes.data || []);
      setCategories(catRes.data?.categories || catRes.data?.data || catRes.data || []);
    } catch (err) {
      showToast?.('Failed to synchronize product nodes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Safe Image Resolver
  const getImageUrl = (img) => {
    if (!img) return '/logo.webp';
    let url = typeof img === 'object' ? img.url || img.path : img;
    if (!url) return '/logo.webp';
    if (url.startsWith('http')) return url;
    return `${BASE_URL.replace(/\/api$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Handlers
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      // FIX 1: Send string "active" or "inactive" to prevent 400 Bad Request
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await productsApi.toggleStatus(id, newStatus);
      showToast?.(`Node ${newStatus} successfully`, 'success');
      fetchData();
    } catch (err) {
      showToast?.('Status toggle failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently purge this hardware node from the registry?')) return;
    try {
      await productsApi.delete(id);
      showToast?.('Node purged successfully', 'success');
      fetchData();
    } catch (err) {
      showToast?.('Purge sequence failed', 'error');
    }
  };

  const handleWipeImages = async (productId) => {
    if (!window.confirm('Are you sure you want to permanently delete all images for this product?')) return;
    try {
      await api.delete(`/products/${productId}/images/all`);
      showToast?.('All images purged from database', 'success');
      fetchData();
    } catch(e) {
      showToast?.('Failed to wipe images', 'error');
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        quantity: product.quantity || product.stock || '',
        category_id: product.category_id || '',
        video_urls: product.video_urls || '',
        model_3d_url: product.model_3d_url || '',
        warranty_period: product.warranty_period || 12,
        status: product.status || 'active'
      });
      setImages([]); 
    } else {
      setCurrentProduct(null);
      setForm({
        name: '', description: '', price: '', quantity: '', category_id: '', 
        video_urls: '', model_3d_url: '', warranty_period: 12, status: 'active'
      });
      setImages([]);
    }
    setActiveTab('basic');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      
      let savedProduct;
      if (currentProduct) {
        const res = await productsApi.update(currentProduct._id || currentProduct.id, payload);
        // FIX 2: Safely extract ID from standard backend response shape
        savedProduct = res.data?.data || res.data?.product || res.data;
        showToast?.('Node configuration updated.', 'success');
      } else {
        const res = await productsApi.create(payload);
        savedProduct = res.data?.data || res.data?.product || res.data;
        showToast?.('New node deployed to registry.', 'success');
      }

      // Handle Image Upload to the correct product ID
      const finalId = savedProduct?.id || savedProduct?._id;
      if (images.length > 0 && finalId) {
        const formData = new FormData();
        Array.from(images).forEach(img => formData.append('images', img));
        await productsApi.uploadImages(finalId, formData);
        showToast?.('Visual payloads successfully attached', 'success');
      }

      setProductModalOpen(false);
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Error processing hardware node', 'error');
    }
  };

  const openSerialModal = (product) => {
    setCurrentProduct(product);
    setSerialTab('generate');
    setSerialForm({
      count: 10,
      prefix: product.name.substring(0, 3).toUpperCase(),
      format: 'advanced',
      base_warranty_months: product.warranty_period || 12
    });
    setSerialModalOpen(true);
  };

  const loadProductSerials = async () => {
    if (!currentProduct) return;
    setLoadingSerials(true);
    try {
      const res = await serialsApi.getByProduct(currentProduct.id || currentProduct._id);
      setProductSerials(res.data?.serials || res.data?.data || res.data || []);
    } catch(e) {
      showToast?.('Failed to load serial registry', 'error');
    } finally {
      setLoadingSerials(false);
    }
  };

  useEffect(() => {
    if (isSerialModalOpen && serialTab === 'view') {
      loadProductSerials();
    }
  }, [serialTab, isSerialModalOpen]);

  const handleGenerateSerials = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId: currentProduct._id || currentProduct.id,
        ...serialForm
      };
      const res = await serialsApi.generate(payload);
      showToast?.(`Generated ${res.data?.count || serialForm.count} serial hashes successfully.`, 'success');
      setSerialTab('view'); // Switch to view tab to see new serials
    } catch (err) {
      showToast?.('Serial generation protocol failed.', 'error');
    }
  };

  // Pagination & Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Hardware Registry...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            Product <span className="text-emerald-500">Audit</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={12} className="text-emerald-500" /> Advanced Hardware Node Management & Telemetry
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-emerald-400 transition-all shadow-lg">
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => openProductModal()}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Deploy Node
          </button>
        </div>
      </div>

      {/* Overview Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Nodes', val: products.length, icon: Box, color: 'emerald' },
          { label: 'Active Streams', val: products.filter(p => p.status === 'active').length, icon: Activity, color: 'blue' },
          { label: 'Low Stock Alerts', val: products.filter(p => p.quantity < 10).length, icon: AlertTriangle, color: 'amber' },
          { label: 'Avg Node Valuation', val: `₹${(products.reduce((acc, p) => acc + parseFloat(p.price || 0), 0) / (products.length || 1)).toFixed(0)}`, icon: Tag, color: 'purple' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/10 blur-2xl -mr-8 -mt-8 group-hover:bg-${stat.color}-500/20 transition-colors duration-500`}></div>
            <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 text-${stat.color}-500 relative z-10 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-white tracking-tighter mt-1">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-[2rem] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search registry by hardware name or taxonomy..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Products Registry Grid */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Hardware Node</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Taxonomy</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Valuation & Stock</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">State</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <BoxSelect size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No hardware matched parameters</p>
                  </td>
                </tr>
              ) : paginatedProducts.map(product => (
                <tr key={product._id || product.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 p-1.5 flex-shrink-0 group-hover:border-emerald-500/30 transition-colors">
                        <img 
                          src={getImageUrl(product.images?.[0])} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => { e.target.src = '/logo.webp'; }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{product.name}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-500"/> {product.warranty_period || 12} Mo</span>
                          {(product.video_urls) && <Video size={12} className="text-blue-500" title="Video Embedded" />}
                          {(product.model_3d_url) && <Box size={12} className="text-purple-500" title="3D Model Attached" />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      {product.category_name || 'Component'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-emerald-400 font-black tracking-tight">₹{product.price?.toLocaleString()}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${product.quantity > 10 ? 'text-slate-500' : 'text-rose-500'}`}>
                        {product.quantity} Units
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <button 
                      onClick={() => handleToggleStatus(product._id || product.id, product.status)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                        product.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {product.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {product.status === 'active' ? 'Live' : 'Offline'}
                    </button>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => openSerialModal(product)}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all"
                        title="Manage RMA Serials"
                      >
                        <QrCode size={16} />
                      </button>
                      <button 
                        onClick={() => openProductModal(product)}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                        title="Edit Node Configuration"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id || product.id)}
                        className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                        title="Purge Node"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
            </span>
            <div className="flex items-center gap-2 mr-4">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                      currentPage === i + 1 
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                      : 'bg-transparent text-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                  <BoxSelect size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {currentProduct ? 'Modify Hardware Node' : 'Deploy New Node'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configure registry specifications and media payloads</p>
                </div>
              </div>
              <button onClick={() => setProductModalOpen(false)} className="p-3 bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="flex border-b border-slate-800 px-8 bg-slate-950/30">
                {[
                  { id: 'basic', label: 'Core Specs', icon: Cpu },
                  { id: 'media', label: 'Media & Assets', icon: ImageIcon },
                  { id: 'warranty', label: 'Logic & Warranty', icon: ShieldCheck }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                      activeTab === tab.id ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8 min-h-[350px]">
                {/* TAB 1: BASIC INFO */}
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Node Designation (Name)</label>
                      <input 
                        required type="text" 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700" 
                        placeholder="e.g. RTX 5090 Ti Vanguard"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Base Valuation (₹)</label>
                      <input 
                        required type="number" 
                        value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500/50 transition-all" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Available Units (Stock)</label>
                      <input 
                        required type="number" 
                        value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500/50 transition-all" 
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Taxonomy Assignment</label>
                      <select 
                        required 
                        value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Primary Category Cluster</option>
                        {categories.map(c => (
                          <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Hardware Specifications (Description)</label>
                      <textarea 
                        rows={4}
                        value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 font-medium text-sm outline-none focus:border-emerald-500/50 transition-all resize-none custom-scrollbar" 
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: MEDIA ASSETS */}
                {activeTab === 'media' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Visual Uploads */}
                    <div className="p-6 border border-dashed border-slate-700 bg-slate-900/30 rounded-3xl text-center relative hover:bg-slate-900/50 transition-colors group">
                      <input 
                        type="file" multiple accept="image/*" 
                        onChange={e => setImages(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <ImageIcon size={40} className="mx-auto text-slate-600 mb-3 group-hover:text-emerald-500 transition-colors" />
                      <p className="text-sm font-bold text-white mb-1">Inject Visual Payloads</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Drag & Drop or Click (JPEG, PNG, WEBP)</p>
                      {images.length > 0 && <p className="mt-4 text-xs font-bold text-emerald-500">{images.length} payload(s) queued for uplink</p>}
                    </div>

                    {currentProduct && (
                      <button 
                        type="button"
                        onClick={() => handleWipeImages(currentProduct.id || currentProduct._id)}
                        className="w-full py-4 border border-rose-500/30 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> Purge All Existing Database Images
                      </button>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2"><Video size={12} /> YouTube Embedded Stream</label>
                      <input 
                        type="url" 
                        value={form.video_urls} onChange={e => setForm({...form, video_urls: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700" 
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2"><Box size={12} /> 3D Spatial Model URL (GLTF/GLB)</label>
                      <input 
                        type="url" 
                        value={form.model_3d_url} onChange={e => setForm({...form, model_3d_url: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700" 
                        placeholder="https://models.anritvox.com/hardware.glb"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: WARRANTY & LOGIC */}
                {activeTab === 'warranty' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Standard Warranty Horizon (Months)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" min="0" max="60" step="6"
                          value={form.warranty_period} onChange={e => setForm({...form, warranty_period: e.target.value})}
                          className="flex-1 accent-emerald-500"
                        />
                        <div className="w-20 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center text-emerald-400 font-black text-lg">
                          {form.warranty_period}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 mt-4 leading-relaxed">
                        This dictates the default validity period injected into generated RMA Serial Hashes upon purchase.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl cursor-pointer" onClick={() => setForm({...form, status: form.status === 'active' ? 'inactive' : 'active'})}>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Deploy to Live Front-End</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Make this hardware visible to retail clients</p>
                      </div>
                      <div className={`w-14 h-8 rounded-full p-1 transition-colors ${form.status === 'active' ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform shadow-md ${form.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-4">
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-8 py-3.5 text-slate-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-900 transition-all">
                  Abort
                </button>
                <button type="submit" className="px-10 py-3.5 bg-emerald-500 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-all hover:-translate-y-0.5">
                  Execute Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SERIAL GENERATOR / REGISTRY MODAL --- */}
      {isSerialModalOpen && currentProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-800 flex justify-between items-start bg-amber-500/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                    <QrCode size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Serial Console</h2>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Target Node: <span className="text-amber-400">{currentProduct.name}</span></p>
              </div>
              <button onClick={() => setSerialModalOpen(false)} className="text-slate-500 hover:text-white transition-colors p-2">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="flex border-b border-slate-800 px-8 bg-slate-950/30">
              <button
                onClick={() => setSerialTab('generate')}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                  serialTab === 'generate' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Plus size={16} /> Batch Generate
              </button>
              <button
                onClick={() => setSerialTab('view')}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
                  serialTab === 'view' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <List size={16} /> View Registry
              </button>
            </div>

            {/* Generate Tab */}
            {serialTab === 'generate' && (
              <form onSubmit={handleGenerateSerials} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Batch Count</label>
                    <input 
                      type="number" min="1" max="1000" required
                      value={serialForm.count} onChange={e => setSerialForm({...serialForm, count: parseInt(e.target.value)})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50 transition-all text-center text-xl" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Hash Prefix</label>
                    <input 
                      type="text" required maxLength="6"
                      value={serialForm.prefix} onChange={e => setSerialForm({...serialForm, prefix: e.target.value.toUpperCase()})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-amber-500 font-mono font-bold outline-none focus:border-amber-500/50 transition-all text-center text-xl uppercase" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Encryption Format</label>
                  <select 
                    value={serialForm.format} onChange={e => setSerialForm({...serialForm, format: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="advanced">Advanced Secure (Checksum Auth)</option>
                    <option value="legacy">Legacy / Standard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Override Warranty Horizon (Months)</label>
                  <input 
                    type="number" required
                    value={serialForm.base_warranty_months} onChange={e => setSerialForm({...serialForm, base_warranty_months: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50 transition-all" 
                  />
                </div>

                <button type="submit" className="w-full py-4 bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all hover:-translate-y-0.5 mt-4">
                  Execute Batch Generation
                </button>
              </form>
            )}

            {/* View Registry Tab */}
            {serialTab === 'view' && (
              <div className="p-8 h-[400px] overflow-y-auto custom-scrollbar">
                {loadingSerials ? (
                  <div className="flex justify-center items-center h-full">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                ) : productSerials.length === 0 ? (
                  <div className="text-center text-slate-500 font-bold uppercase tracking-widest mt-20">
                    No Serials Found in Registry
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="pb-3">Hash Identity</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productSerials.map((s, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                          <td className="py-3 font-mono text-sm font-bold text-amber-400">{s.serial_number || s.serial}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                              s.status === 'available' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 text-right text-xs text-slate-400 font-medium">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
