import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Box, Plus, Edit2, Trash2, Search, RefreshCw, AlertTriangle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Video, BoxSelect, ShieldCheck, Tag, Activity, Cpu, QrCode, List
} from 'lucide-react';
import api, { products as productsApi, categories as categoriesApi, serials as serialsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isSerialModalOpen, setSerialModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); 
  const [serialTab, setSerialTab] = useState('generate');
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  
  const { showToast } = useToast() || {};

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

  // The critical fix: Connects to your environment variables dynamically
  const getImageUrl = (img) => {
    if (!img) return '/logo.webp';
    let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
    if (!path) return '/logo.webp';
    if (path.startsWith('http')) return path;
    
    const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${cleanBase}/${cleanPath}`;
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
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
    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName('Initializing deployment...');
    
    try {
      const payload = { ...form };
      let savedProduct;
      
      if (currentProduct) {
        const res = await productsApi.update(currentProduct._id || currentProduct.id, payload);
        savedProduct = res.data?.data || res.data?.product || res.data;
      } else {
        const res = await productsApi.create(payload);
        savedProduct = res.data?.data || res.data?.product || res.data;
      }

      const finalId = savedProduct?.id || savedProduct?._id;

      if (images.length > 0 && finalId) {
        const imageKeys = [];
        const filesArray = Array.from(images);

        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];
          setUploadingFileName(`Uploading ${file.name} (${i + 1}/${filesArray.length})...`);
          setUploadProgress(0);

          const urlRes = await productsApi.getUploadUrl(file.name, file.type);
          const { uploadUrl, key } = urlRes.data;

          await axios.put(uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          });

          imageKeys.push(key);
        }

        setUploadingFileName('Linking visual payloads to registry...');
        await productsApi.saveImageKeys(finalId, imageKeys);
        showToast?.('Visual payloads successfully attached', 'success');
      } else {
        showToast?.('Node configuration saved successfully.', 'success');
      }

      setProductModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Deployment Error:', err);
      showToast?.('Error processing deployment. Check network constraints.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
      setSerialTab('view'); 
    } catch (err) {
      showToast?.('Serial generation protocol failed.', 'error');
    }
  };

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

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300 relative">
            
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 rounded-[3rem]">
                <Activity className="w-16 h-16 text-emerald-500 animate-bounce mb-6" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest text-center">{uploadingFileName}</h3>
                <div className="w-full max-w-md bg-slate-900 rounded-full h-6 mt-8 border border-slate-800 overflow-hidden relative shadow-inner">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out flex items-center justify-end pr-3 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <span className="text-[10px] font-black text-slate-950">{uploadProgress}%</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 mt-6 uppercase tracking-widest animate-pulse">Do not close this window</p>
              </div>
            )}

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
              <button disabled={isUploading} onClick={() => setProductModalOpen(false)} className="p-3 bg-slate-950 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all disabled:opacity-50">
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

                {activeTab === 'media' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-6 border border-dashed border-slate-700 bg-slate-900/30 rounded-3xl text-center relative hover:bg-slate-900/50 transition-colors group cursor-pointer">
                      <input 
                        type="file" multiple accept="image/*" 
                        onChange={e => setImages(e.target.files)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <ImageIcon size={40} className="mx-auto text-slate-600 mb-3 group-hover:text-emerald-500 transition-colors" />
                      <p className="text-sm font-bold text-white mb-1">Inject Visual Payloads</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Drag & Drop or Click
