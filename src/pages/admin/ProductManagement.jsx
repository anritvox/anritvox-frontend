import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Box, Plus, Edit2, Trash2, Search, RefreshCw, AlertTriangle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Video, BoxSelect, ShieldCheck, Tag, Activity, Cpu, QrCode, List, Database, UploadCloud, Globe
} from 'lucide-react';
import api, { products as productsApi, categories as categoriesApi, serials as serialsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const INITIAL_PRODUCT_STATE = {
  name: '', slug: '', description: '', price: '', discount_price: '', quantity: '', category_id: '', 
  video_urls: '', model_3d_url: '', warranty_period: 12, status: 'active',
  meta_title: '', meta_description: '', tags: '', sku: '', brand: 'Anritvox'
};

const INITIAL_SERIAL_STATE = {
  count: 10, prefix: 'BHU', format: 'advanced', base_warranty_months: 12, month: '', year: ''
};

export default function ProductManagement() {

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  const [form, setForm] = useState(INITIAL_PRODUCT_STATE);
  const [images, setImages] = useState([]);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [fitmentFile, setFitmentFile] = useState(null);
  const [serialForm, setSerialForm] = useState(INITIAL_SERIAL_STATE);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([productsApi.getAllAdmin(), categoriesApi.getAll()]);
      
      const pData = prodRes.data?.products || prodRes.data?.data || prodRes.data;
      setProducts(Array.isArray(pData) ? pData : []);

      const cData = catRes.data?.categories || catRes.data?.data || catRes.data;
      setCategories(Array.isArray(cData) ? cData : []);

    } catch (err) { 
      showToast?.('Failed to fetch products', 'error'); 
      setProducts([]); 
      setCategories([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const getImageUrl = (img) => {
    if (!img) return '/logo.webp';
    let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
    if (!path) return '/logo.webp';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await productsApi.toggleStatus(id, newStatus);
      showToast?.(`Product status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (err) { 
      showToast?.('Status update failed', 'error'); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try { 
      await productsApi.delete(id); 
      showToast?.('Product deleted successfully', 'success'); 
      fetchData(); 
    } catch (err) { 
      showToast?.('Delete failed', 'error'); 
    }
  };

  const handleDeleteExistingImage = async (imageIdentifier) => {
    if (!window.confirm('Are you sure you want to permanently delete this image from the database?')) return;
    try {
      const prodId = currentProduct._id || currentProduct.id;
      const payload = typeof imageIdentifier === 'number' || (typeof imageIdentifier === 'string' && /^\d+$/.test(imageIdentifier))
        ? { imageId: imageIdentifier }
        : { filePath: imageIdentifier };

      await api.delete(`/products/${prodId}/images`, { data: payload });
      showToast?.('Image removed successfully', 'success');
      
      setCurrentProduct(prev => {
        if (!prev) return null;
        return {
          ...prev,
          images: prev.images.filter(img => {
            if (typeof img === 'object' && img !== null) {
              return img.id !== imageIdentifier && img.file_path !== imageIdentifier;
            }
            return img !== imageIdentifier;
          })
        };
      });
      fetchData();
    } catch (err) {
      showToast?.('Failed to delete image', 'error');
    }
  };

  const handleAIEnhance = async () => {
    if (!form.name) return showToast?.('Enter a product name first!', 'error');
    setUploadingFileName('AI is writing content...');
    setIsUploading(true);
    try {
      const res = await api.post('/ai/generate-product-content', { productName: form.name });
      const { description, meta_title, meta_description, tags } = res.data.data;
      
      setForm(prev => ({
        ...prev,
        description,
        meta_title,
        meta_description,
        tags
      }));
      showToast?.('AI Content Generated!', 'success');
    } catch (error) {
      showToast?.('AI Generation Failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setForm({
        name: product.name || '', slug: product.slug || '', description: product.description || '', price: product.price || '', discount_price: product.discount_price || '',
        quantity: product.quantity || product.stock || '', category_id: product.category_id || '',
        video_urls: product.video_urls || '', model_3d_url: product.model_3d_url || '',
        warranty_period: product.warranty_period || 12, status: product.status || 'active',
        meta_title: product.meta_title || '', meta_description: product.meta_description || '', tags: product.tags || '', sku: product.sku || '', brand: product.brand || 'Anritvox'
      });
      
      let parsedSpecs = [];
      if (product.specifications) {
        try {
          const specObj = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
          parsedSpecs = Object.entries(specObj).map(([k, v]) => ({ key: k, value: v }));
        } catch(e) { 
          console.error('Spec parse error'); 
        }
      }
      setSpecs(parsedSpecs.length ? parsedSpecs : [{ key: '', value: '' }]);
    } else {
      setCurrentProduct(null);
      setForm(INITIAL_PRODUCT_STATE);
      setSpecs([{ key: '', value: '' }]);
    }
    setImages([]); 
    setFitmentFile(null); 
    setActiveTab('basic'); 
    setProductModalOpen(true);
  };

  const updateSpec = (index, field, val) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsUploading(true); 
    setUploadProgress(0); 
    setUploadingFileName('Saving Product...');
    
    try {
      const specObj = specs.reduce((acc, { key, value }) => {
        if (key.trim() && value.trim()) acc[key.trim()] = value.trim();
        return acc;
      }, {});
      
      const finalSlug = form.slug.trim() === '' ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : form.slug;
      
      const payload = { ...form, slug: finalSlug, specifications: specObj };
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
        setUploadingFileName('Uploading Images...');
        const filesArray = Array.from(images);
        
        const uploadPromises = filesArray.map(async (file) => {
          const urlRes = await productsApi.getUploadUrl(file.name, file.type);
          await axios.put(urlRes.data.uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            onUploadProgress: (e) => {
              setUploadProgress(prev => Math.min(100, prev + Math.round((e.loaded * 100) / (e.total * filesArray.length))));
            }
          });
          return urlRes.data.key;
        });

        const imageKeys = await Promise.all(uploadPromises);
        await productsApi.saveImageKeys(finalId, imageKeys);
      }

      if (fitmentFile && finalId) {
        setUploadingFileName('Uploading Fitment Data...');
        const formData = new FormData();
        formData.append('file', fitmentFile);
        await api.post(`/fitments/upload/${finalId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast?.('Fitment Data uploaded', 'success');
      }

      showToast?.('Product Saved Successfully', 'success');
      setProductModalOpen(false); 
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Error saving product', 'error');
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
      prefix: String(product.name || 'BHU').substring(0, 3).toUpperCase(), 
      format: 'advanced', 
      base_warranty_months: product.warranty_period || 12,
      month: '',
      year: ''
    });
    setSerialModalOpen(true);
  };

  const loadProductSerials = async () => {
    if (!currentProduct) return;
    setLoadingSerials(true);
    try {
      const res = await serialsApi.getByProduct(currentProduct.id || currentProduct._id);
      const sData = res.data?.serials || res.data?.data || res.data;
      setProductSerials(Array.isArray(sData) ? sData : []);
    } catch(e) {
      console.error(e);
      setProductSerials([]); 
    } finally { 
      setLoadingSerials(false); 
    }
  };

  useEffect(() => { 
    if (isSerialModalOpen && serialTab === 'view') loadProductSerials(); 
  }, [serialTab, isSerialModalOpen]);

  const handleGenerateSerials = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        productId: currentProduct._id || currentProduct.id, 
        ...serialForm,
        month: serialForm.month ? parseInt(serialForm.month, 10) : undefined,
        year: serialForm.year ? parseInt(serialForm.year, 10) : undefined
      };
      await serialsApi.generate(payload);
      showToast?.(`Generated ${serialForm.count} serial numbers.`, 'success');
      
      const updatedRes = await serialsApi.getByProduct(payload.productId);
      const sData = updatedRes.data?.serials || updatedRes.data?.data || updatedRes.data;
      const fullList = Array.isArray(sData) ? sData : [];
      
      const worksheetData = fullList.map(s => ({ 
        'Product': currentProduct.name, 
        'Serial Number': s.serial_number || s.serial, 
        'Status': s.status, 
        'Generated Date': new Date(s.created_at).toLocaleString() 
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Serial Numbers");
      XLSX.writeFile(workbook, `${currentProduct.name.replace(/\s+/g, '_')}_Serials.xlsx`);
      
      setSerialTab('view'); 
    } catch (err) { 
      showToast?.('Generation failed.', 'error'); 
    }
  };

  const handleDeleteSerial = async (serialId) => {
    if (!window.confirm('Delete this serial number?')) return;
    try { 
      await serialsApi.delete(currentProduct._id || currentProduct.id, serialId); 
      loadProductSerials(); 
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    return products.filter(p => 
      p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p?.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);
  
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-emerald-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-950 min-h-screen text-slate-300 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            Product <span className="text-emerald-500">Management</span>
          </h1>
          <p className="text-slate-500 font-mono mt-2 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <Box size={12} className="text-emerald-500" /> {filteredProducts.length} Products Found
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search products or SKU..." 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white font-mono text-xs outline-none transition-all shadow-inner" 
            />
          </div>
          <button onClick={fetchData} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:text-emerald-400 hover:border-slate-600 transition-all flex justify-center items-center">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => openProductModal()} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/80 rounded-[1.5rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Product</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Category</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Price & Stock</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 font-mono text-xs">No products match your search.</td>
                </tr>
              ) : paginatedProducts.map(product => (
                <tr key={product._id || product.id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <div className="relative">
                      <img src={getImageUrl(product.images?.[0])} className="w-12 h-12 object-cover rounded-xl bg-slate-950 border border-slate-700 shadow-sm" onError={(e) => { e.target.src = '/logo.webp'; }} alt={product.name}/>
                      {product.video_urls && <Video size={12} className="absolute -bottom-1 -right-1 text-blue-400 bg-slate-900 rounded-full" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white line-clamp-1">{product.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
                        SKU: {product.sku || `BHU-${String(product.id || product._id || '').substring(0,5)}`}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-950 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {product.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-emerald-400 text-sm font-black font-mono">₹{product.price}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${product.quantity > 10 ? 'text-slate-500' : 'text-rose-500 animate-pulse'}`}>
                        {product.quantity} In Stock
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleToggleStatus(product._id || product.id, product.status)} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}
                    >
                      {product.status === 'active' ? 'Active' : 'Draft'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openSerialModal(product)} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-amber-500 hover:bg-amber-50 hover:text-slate-950 transition-colors tooltip-trigger" title="Serial Numbers"><QrCode size={16} /></button>
                      <button onClick={() => openProductModal(product)} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-blue-500 hover:bg-blue-500 hover:text-slate-950 transition-colors" title="Edit Product"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-colors" title="Delete Product"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
            <span className="text-xs font-mono text-slate-500">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 disabled:opacity-30 hover:text-white"><ChevronLeft size={16} /></button>
              <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 disabled:opacity-30 hover:text-white"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden relative">
            
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                <UploadCloud className="w-12 h-12 text-emerald-500 animate-bounce mb-6" />
                <h3 className="text-sm font-mono text-emerald-400 uppercase tracking-widest">{uploadingFileName}</h3>
                <div className="w-72 bg-slate-900 rounded-full h-2 mt-6 border border-slate-800 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-300 relative">
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-3">{uploadProgress}% Complete</p>
              </div>
            )}

            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Cpu className="text-emerald-500" /> {currentProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button type="button" onClick={() => setProductModalOpen(false)} className="text-slate-500 hover:text-rose-500 transition-colors bg-slate-900 p-2 rounded-full"><XCircle size={20} /></button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="flex border-b border-slate-800 px-6 bg-slate-900/20 overflow-x-auto custom-scrollbar">
                {[
                  {id:'basic', l:'Basic Info', i:BoxSelect}, 
                  {id:'seo', l:'SEO & Meta', i:Globe}, 
                  {id:'specs', l:'Specifications', i:List}, 
                  {id:'media', l:'Images & Docs', i:Database}, 
                  {id:'warranty', l:'Warranty', i:ShieldCheck}
                ].map(t => (
                  <button 
                    key={t.id} type="button" onClick={() => setActiveTab(t.id)} 
                    className={`flex items-center gap-2 px-5 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === t.id ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}`}
                  >
                    <t.i size={16} /> {t.l}
                  </button>
                ))}
              </div>

              <div className="p-6 min-h-[400px] max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-950/50">
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product Name</label>
                        <button type="button" onClick={handleAIEnhance} className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1 hover:text-emerald-300">
                          ✨ AI Auto-Fill
                        </button>
                      </div>
                      <input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white outline-none transition-colors" placeholder="e.g. Aloe Vera Glow Serum" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Price (₹)</label>
                      <input required type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm font-mono text-slate-300 outline-none transition-colors" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Discount Price (₹)</label>
                      <input type="number" value={form.discount_price} onChange={e=>setForm({...form, discount_price:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm font-mono text-emerald-400 outline-none transition-colors" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Stock Quantity</label>
                      <input required type="number" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm font-mono text-white outline-none transition-colors" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Category</label>
                      <select required value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white outline-none transition-colors appearance-none">
                        <option value="" disabled>Select a Category...</option>
                        {categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Description</label>
                      <textarea rows={5} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-slate-300 resize-y outline-none transition-colors" placeholder="Enter product details, features, and ingredients..." />
                    </div>
                  </div>
                )}

                {activeTab === 'seo' && (
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-2">
                      <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2"><Globe size={16}/> Schema.org Discovery Engine</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">These fields are autonomously compiled into Google JSON-LD schema when the public API is queried. Do not leave blank for core products.</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex justify-between">URL Slug <span className="text-slate-600 font-mono lowercase">auto-generated if empty</span></label>
                      <input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-emerald-400 font-mono outline-none transition-colors" placeholder="e.g. aloe-vera-serum" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">SKU / Item Number</label>
                      <input value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white font-mono outline-none transition-colors" placeholder="e.g. BHU-ALOE-01" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Brand</label>
                      <input value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white outline-none transition-colors" placeholder="Anritvox" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Search Tags (Comma separated)</label>
                      <input value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white outline-none transition-colors" placeholder="natural, vegan, skincare" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Meta Title (Google Search Head)</label>
                      <input value={form.meta_title} onChange={e=>setForm({...form, meta_title:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white outline-none transition-colors" placeholder="Buy Anritvox Natural Serum Online" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Meta Description (Snippet)</label>
                      <textarea rows={3} value={form.meta_description} onChange={e=>setForm({...form, meta_description:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-slate-300 resize-y outline-none transition-colors" placeholder="100% natural, cruelty-free serum for glowing skin..." />
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <div>
                        <h4 className="text-sm font-bold text-white">Product Specifications</h4>
                        <p className="text-[10px] font-mono text-slate-500 mt-1">Add details like Volume, Weight, Ingredients</p>
                      </div>
                      <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 hover:text-slate-950 transition-all">
                        <Plus size={14}/> Add Row
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {specs.map((spec, i) => (
                        <div key={i} className="flex gap-3 items-center group">
                          <input type="text" placeholder="Title (e.g. Weight)" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm font-mono text-white outline-none transition-colors" />
                          <span className="text-slate-600 font-bold">:</span>
                          <input type="text" placeholder="Value (e.g. 50g)" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} className="flex-[2] bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white outline-none transition-colors" />
                          <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="p-3 text-rose-500 bg-slate-900 border border-slate-700 hover:bg-rose-500 hover:border-rose-500 hover:text-white rounded-xl transition-all opacity-50 group-hover:opacity-100">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 p-6 border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 rounded-2xl text-center relative hover:bg-emerald-500/10 transition-colors group cursor-pointer">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => setImages(e.target.files)} 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <UploadCloud className="mx-auto w-10 h-10 text-slate-500 group-hover:text-emerald-400 transition-colors mb-2" />
                      <p className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Click or Drag to Upload Images</p>
                      <p className="text-[9px] text-slate-600 font-mono mt-1">PNG, JPG, WEBP formats supported</p>
                    </div>

                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                          <ImageIcon size={14} className="text-blue-400" /> Currently Active Images
                        </h4>
                        {currentProduct && currentProduct.images && currentProduct.images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-3">
                            {currentProduct.images.map((img, idx) => (
                              <div key={idx} className="relative group border border-slate-800 rounded-xl overflow-hidden bg-slate-950 aspect-square">
                                <img 
                                  src={getImageUrl(img)} 
                                  alt="Server Attached Asset" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = '/logo.webp'; }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const targetIdentifier = typeof img === 'object' && img !== null ? (img.id || img.file_path) : img;
                                    if (targetIdentifier) {
                                      handleDeleteExistingImage(targetIdentifier);
                                    } else {
                                      showToast?.('Invalid image asset identifier.', 'error');
                                    }
                                  }}
                                  className="absolute top-1 right-1 bg-rose-600/90 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 shadow-lg"
                                  title="Remove Image"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-600 font-mono italic">No permanent cloud storage assets tracked for this item.</p>
                        )}
                      </div>

                      <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                          <UploadCloud size={14} className="text-emerald-400" /> Staged New Upload Previews
                        </h4>
                        {images && images.length > 0 ? (
                          <div className="grid grid-cols-3 gap-3">
                            {Array.from(images).map((file, idx) => (
                              <div key={idx} className="relative group border border-emerald-500/20 rounded-xl overflow-hidden bg-slate-950 aspect-square">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt="Local Preupload Staging" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImages(prev => Array.from(prev).filter((_, i) => i !== idx));
                                  }}
                                  className="absolute top-1 right-1 bg-rose-600/90 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 shadow-lg z-20"
                                  title="Remove Staged Image"
                                >
                                  <Trash2 size={12} />
                                </button>
                                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 p-1 text-[8px] font-mono text-emerald-400 truncate text-center">
                                  {file.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-600 font-mono italic">No temporary staging items selected.</p>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 space-y-4 mt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2"><Video size={14}/> YouTube Link</label>
                        <input type="url" placeholder="https://youtube.com/watch?v=..." value={form.video_urls} onChange={e=>setForm({...form, video_urls:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-sm text-blue-400 font-mono outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-2"><Box size={14}/> 3D Model Link</label>
                        <input type="url" placeholder="https://..." value={form.model_3d_url} onChange={e=>setForm({...form, model_3d_url:e.target.value})} className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-xl p-3 text-sm text-purple-400 font-mono outline-none transition-colors" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'warranty' && (
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                        <ShieldCheck size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-4">Warranty Settings</h4>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Warranty Duration (In Months)</label>
                        <input type="number" value={form.warranty_period} onChange={e=>setForm({...form, warranty_period:e.target.value})} className="w-full md:w-1/2 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl p-3 text-sm font-mono text-amber-400 outline-none transition-colors" />
                        <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">This determines how many months of coverage a customer receives when they register their product.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-800 flex justify-end gap-4 bg-slate-900/40">
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-6 py-3 text-slate-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2">
                  <Activity size={16} /> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSerialModalOpen && currentProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-amber-500/10">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <QrCode size={24} className="text-amber-500"/> Serial Number Generator
                </h2>
                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">Product: {currentProduct.name}</p>
              </div>
              <button onClick={() => setSerialModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-900 p-2 rounded-full transition-colors"><XCircle size={20} /></button>
            </div>
            
            <div className="flex border-b border-slate-800 px-6 bg-slate-900/40">
              <button onClick={() => setSerialTab('generate')} className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${serialTab === 'generate' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                <Plus size={16} /> Generate New
              </button>
              <button onClick={() => setSerialTab('view')} className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${serialTab === 'view' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                <List size={16} /> View Saved Numbers
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {serialTab === 'generate' && (
                <form onSubmit={handleGenerateSerials} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Quantity to Generate</label>
                      <input type="number" required min="1" max="1000" value={serialForm.count} onChange={e=>setSerialForm({...serialForm, count: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg p-3 text-white font-mono outline-none" />
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Code Prefix</label>
                      <input type="text" required value={serialForm.prefix} onChange={e=>setSerialForm({...serialForm, prefix: e.target.value.toUpperCase()})} className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg p-3 text-amber-500 font-mono outline-none tracking-widest" />
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Warranty (Months)</label>
                      <select required value={serialForm.base_warranty_months} onChange={e=>setSerialForm({...serialForm, base_warranty_months: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg p-3 text-white font-mono outline-none appearance-none">
                        <option value={6}>6 Months</option>
                        <option value={12}>12 Months</option>
                        <option value={18}>18 Months</option>
                        <option value={24}>24 Months</option>
                        <option value={36}>36 Months</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Audit Target Month (Optional)</label>
                      <select value={serialForm.month} onChange={e=>setSerialForm({...serialForm, month: e.target.value})} className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg p-3 text-white outline-none appearance-none cursor-pointer text-xs font-bold">
                        <option value="">Current Live Month (Default)</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{String(m).padStart(2, '0')} - {new Date(2026, m - 1).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Audit Target Year (Optional)</label>
                      <select value={serialForm.year} onChange={e=>setSerialForm({...serialForm, year: e.target.value})} className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-lg p-3 text-white outline-none appearance-none cursor-pointer text-xs font-bold">
                        <option value="">Current Live Year (Default)</option>
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800">
                    <button type="submit" className="w-full py-4 bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex justify-center items-center gap-3">
                      <QrCode size={18} /> Generate & Download Excel
                    </button>
                  </div>
                </form>
              )}
              
              {serialTab === 'view' && (
                <div className="p-6">
                  {loadingSerials ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                      <p className="text-amber-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Numbers...</p>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800">
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Serial Number</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                            <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {productSerials.length === 0 ? (
                            <tr><td colSpan="3" className="p-6 text-center text-slate-500 font-mono text-xs">No serial numbers found for this product.</td></tr>
                          ) : productSerials.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                              <td className="p-3 font-mono text-xs text-amber-400 tracking-wider font-bold">
                                {s.serial_number || s.serial}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${s.status === 'active' || s.status === 'sold' || s.status === 'available' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button onClick={() => handleDeleteSerial(s.id || s._id)} className="text-rose-500 hover:bg-rose-500 hover:text-white border border-transparent hover:border-rose-500 p-2 rounded-lg transition-all" title="Delete Serial">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
