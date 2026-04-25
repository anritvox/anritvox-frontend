import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Box, Plus, Edit2, Trash2, Search, RefreshCw, AlertTriangle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Video, BoxSelect, ShieldCheck, Tag, Activity, Cpu, QrCode, List, Database
} from 'lucide-react';
import api, { products as productsApi, categories as categoriesApi, serials as serialsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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

  const [form, setForm] = useState({
    name: '', description: '', price: '', quantity: '', category_id: '', 
    video_urls: '', model_3d_url: '', warranty_period: 12, status: 'active'
  });
  const [images, setImages] = useState([]);
  // Dynamic Specs Engine State
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  // Fitment Excel Upload State
  const [fitmentFile, setFitmentFile] = useState(null);

  const [serialForm, setSerialForm] = useState({
    count: 10, prefix: 'ANR', format: 'advanced', base_warranty_months: 12
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([productsApi.getAllAdmin(), categoriesApi.getAll()]);
      setProducts(prodRes.data?.products || prodRes.data?.data || prodRes.data || []);
      setCategories(catRes.data?.categories || catRes.data?.data || catRes.data || []);
    } catch (err) { showToast?.('Failed to sync nodes', 'error'); } 
    finally { setLoading(false); }
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
      showToast?.(`Node ${newStatus} successfully`, 'success');
      fetchData();
    } catch (err) { showToast?.('Status toggle failed', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently purge this hardware node?')) return;
    try { await productsApi.delete(id); showToast?.('Node purged', 'success'); fetchData(); } 
    catch (err) { showToast?.('Purge failed', 'error'); }
  };

  const handleWipeImages = async (productId) => {
    if (!window.confirm('Purge all images?')) return;
    try { await api.delete(`/products/${productId}/images/all`); showToast?.('Images purged', 'success'); fetchData(); } 
    catch(e) { showToast?.('Failed to wipe images', 'error'); }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setForm({
        name: product.name || '', description: product.description || '', price: product.price || '',
        quantity: product.quantity || product.stock || '', category_id: product.category_id || '',
        video_urls: product.video_urls || '', model_3d_url: product.model_3d_url || '',
        warranty_period: product.warranty_period || 12, status: product.status || 'active'
      });
      // Parse JSON specs back into array
      let parsedSpecs = [];
      if (product.specifications) {
        try {
          const specObj = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
          parsedSpecs = Object.entries(specObj).map(([k, v]) => ({ key: k, value: v }));
        } catch(e) { console.error('Spec parse error'); }
      }
      setSpecs(parsedSpecs.length ? parsedSpecs : [{ key: '', value: '' }]);
    } else {
      setCurrentProduct(null);
      setForm({ name: '', description: '', price: '', quantity: '', category_id: '', video_urls: '', model_3d_url: '', warranty_period: 12, status: 'active' });
      setSpecs([{ key: '', value: '' }]);
    }
    setImages([]); setFitmentFile(null); setActiveTab('basic'); setProductModalOpen(true);
  };

  const addSpecRow = () => setSpecs([...specs, { key: '', value: '' }]);
  const updateSpec = (index, field, val) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };
  const removeSpecRow = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsUploading(true); setUploadProgress(0); setUploadingFileName('Deploying Core Data...');
    
    try {
      // Compress specs array to JSON object
      const specObj = {};
      specs.forEach(s => { if (s.key.trim() && s.value.trim()) specObj[s.key.trim()] = s.value.trim(); });
      
      const payload = { ...form, specifications: specObj };
      let savedProduct;
      
      if (currentProduct) {
        const res = await productsApi.update(currentProduct._id || currentProduct.id, payload);
        savedProduct = res.data?.data || res.data?.product || res.data;
      } else {
        const res = await productsApi.create(payload);
        savedProduct = res.data?.data || res.data?.product || res.data;
      }

      const finalId = savedProduct?.id || savedProduct?._id;

      // 1. Image Upload Protocol
      if (images.length > 0 && finalId) {
        const imageKeys = [];
        const filesArray = Array.from(images);
        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i];
          setUploadingFileName(`Uploading Visual Payload (${i + 1}/${filesArray.length})...`);
          setUploadProgress(0);
          const urlRes = await productsApi.getUploadUrl(file.name, file.type);
          await axios.put(urlRes.data.uploadUrl, file, {
            headers: { 'Content-Type': file.type },
            onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
          });
          imageKeys.push(urlRes.data.key);
        }
        await productsApi.saveImageKeys(finalId, imageKeys);
      }

      // 2. Fitment Excel Upload Protocol
      if (fitmentFile && finalId) {
        setUploadingFileName('Injecting Fitment Matrix...');
        const formData = new FormData();
        formData.append('file', fitmentFile);
        await api.post(`/fitments/upload/${finalId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast?.('Fitment Matrix injected successfully', 'success');
      }

      showToast?.('Deployment Complete', 'success');
      setProductModalOpen(false); fetchData();
    } catch (err) {
      showToast?.('Deployment Error', 'error');
    } finally {
      setIsUploading(false); setUploadProgress(0);
    }
  };

  const openSerialModal = (product) => { /* Keeping existing serial logic exact */
    setCurrentProduct(product); setSerialTab('generate');
    setSerialForm({ count: 10, prefix: product.name.substring(0, 3).toUpperCase(), format: 'advanced', base_warranty_months: product.warranty_period || 12 });
    setSerialModalOpen(true);
  };
  const loadProductSerials = async () => {
    if (!currentProduct) return;
    setLoadingSerials(true);
    try {
      const res = await serialsApi.getByProduct(currentProduct.id || currentProduct._id);
      setProductSerials(res.data?.serials || res.data?.data || res.data || []);
    } catch(e) {} finally { setLoadingSerials(false); }
  };
  useEffect(() => { if (isSerialModalOpen && serialTab === 'view') loadProductSerials(); }, [serialTab, isSerialModalOpen]);

  const handleGenerateSerials = async (e) => {
    e.preventDefault();
    try {
      const payload = { productId: currentProduct._id || currentProduct.id, ...serialForm };
      await serialsApi.generate(payload);
      showToast?.(`Generated ${serialForm.count} serials.`, 'success');
      const updatedRes = await serialsApi.getByProduct(payload.productId);
      const fullList = updatedRes.data?.serials || updatedRes.data?.data || updatedRes.data || [];
      const worksheetData = fullList.map(s => ({ 'Hardware Node': currentProduct.name, 'Serial Hash': s.serial_number || s.serial, 'State': s.status, 'Generated Date': new Date(s.created_at).toLocaleString() }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Serial Registry");
      XLSX.writeFile(workbook, `${currentProduct.name.replace(/\s+/g, '_')}_Serials.xlsx`);
      setSerialTab('view'); 
    } catch (err) { showToast?.('Generation failed.', 'error'); }
  };
  const handleDeleteSerial = async (serialId) => {
    if (!window.confirm('Delete this serial?')) return;
    try { await serialsApi.delete(currentProduct._id || currentProduct.id, serialId); loadProductSerials(); } catch (err) {}
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category_name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading && products.length === 0) return (<div className="flex justify-center mt-20"><RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" /></div>);

  return (
    <div className="p-4 space-y-4 bg-[#020617] min-h-screen text-slate-300 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">Product <span className="text-emerald-500">Audit</span></h1>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:text-emerald-400"><RefreshCw size={16} /></button>
          <button onClick={() => openProductModal()} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-emerald-400"><Plus size={14} /> Deploy</button>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input type="text" placeholder="Search hardware..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-900/40 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all" />
      </div>

      {/* DENSE TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Node</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Taxonomy</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Metrics</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">State</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedProducts.map(product => (
                <tr key={product._id || product.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-3 flex items-center gap-3">
                    <img src={getImageUrl(product.images?.[0])} className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800" onError={(e) => { e.target.src = '/logo.webp'; }}/>
                    <div><p className="text-xs font-bold text-white line-clamp-1">{product.name}</p></div>
                  </td>
                  <td className="p-3"><span className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-400 rounded-md text-[9px] font-bold uppercase">{product.category_name || 'N/A'}</span></td>
                  <td className="p-3"><div className="flex flex-col"><span className="text-emerald-400 text-xs font-bold">₹{product.price}</span><span className={`text-[9px] font-bold ${product.quantity > 10 ? 'text-slate-500' : 'text-rose-500'}`}>{product.quantity} QTY</span></div></td>
                  <td className="p-3"><button onClick={() => handleToggleStatus(product._id || product.id, product.status)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{product.status === 'active' ? 'Live' : 'Off'}</button></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openSerialModal(product)} className="p-1.5 bg-slate-950 border border-slate-800 rounded-md text-amber-500 hover:bg-amber-500 hover:text-black"><QrCode size={14} /></button>
                      <button onClick={() => openProductModal(product)} className="p-1.5 bg-slate-950 border border-slate-800 rounded-md text-blue-500 hover:bg-blue-500 hover:text-white"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(product._id || product.id)} className="p-1.5 bg-slate-950 border border-slate-800 rounded-md text-rose-500 hover:bg-rose-500 hover:text-white"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative">
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center">
                <Activity className="w-10 h-10 text-emerald-500 animate-bounce mb-4" />
                <h3 className="text-sm font-bold text-white">{uploadingFileName}</h3>
                <div className="w-64 bg-slate-900 rounded-full h-2 mt-4 border border-slate-800"><div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div></div>
              </div>
            )}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-black text-white uppercase">{currentProduct ? 'Modify Node' : 'Deploy Node'}</h2>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-500 hover:text-rose-500"><XCircle size={20} /></button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="flex border-b border-slate-800 px-5 bg-slate-950/30 overflow-x-auto scrollbar-hide">
                {[{id:'basic',l:'Core',i:Cpu}, {id:'specs',l:'Dynamic Specs',i:List}, {id:'media',l:'Media & Fitment',i:Database}, {id:'warranty',l:'Logic',i:ShieldCheck}].map(t => (
                  <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 ${activeTab === t.id ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500'}`}>
                    <t.i size={14} /> {t.l}
                  </button>
                ))}
              </div>

              <div className="p-5 min-h-[350px] max-h-[60vh] overflow-y-auto custom-scrollbar">
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><label className="text-[9px] font-bold text-slate-500 uppercase ml-1 block mb-1">Name</label><input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" /></div>
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase ml-1 block mb-1">Price</label><input required type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" /></div>
                    <div><label className="text-[9px] font-bold text-slate-500 uppercase ml-1 block mb-1">Stock</label><input required type="number" value={form.quantity} onChange={e=>setForm({...form, quantity:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" /></div>
                    <div className="col-span-2"><label className="text-[9px] font-bold text-slate-500 uppercase ml-1 block mb-1">Category</label><select required value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"><option value="">Select Category</option>{categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}</select></div>
                    <div className="col-span-2"><label className="text-[9px] font-bold text-slate-500 uppercase ml-1 block mb-1">Master Description</label><textarea rows={5} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 resize-y" placeholder="Include Wattage, Bulb Type, Lumens, etc. here." /></div>
                  </div>
                )}

                {/* DYNAMIC SPECS ENGINE */}
                {activeTab === 'specs' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold text-slate-500">Inject dynamic Key-Value attributes (e.g., Wattage: 55W)</p>
                      <button type="button" onClick={addSpecRow} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 hover:bg-emerald-500 hover:text-black"><Plus size={12}/> Add Spec</button>
                    </div>
                    {specs.map((spec, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" placeholder="Attribute (e.g. Color)" value={spec.key} onChange={e => updateSpec(i, 'key', e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                        <input type="text" placeholder="Value (e.g. Ice White)" value={spec.value} onChange={e => updateSpec(i, 'value', e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                        <button type="button" onClick={() => removeSpecRow(i)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* MEDIA & FITMENT ENGINE UPLOAD */}
                {activeTab === 'media' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-dashed border-slate-700 bg-slate-900/30 rounded-xl text-center relative hover:bg-slate-900/50">
                      <input type="file" multiple accept="image/*" onChange={e=>setImages(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <ImageIcon size={24} className="mx-auto text-slate-600 mb-2" />
                      <p className="text-xs font-bold text-white mb-1">Image Payload</p>
                      {images.length > 0 && <p className="text-[10px] text-emerald-500">{images.length} files selected</p>}
                    </div>

                    <div className="p-4 border border-dashed border-blue-900/50 bg-blue-900/10 rounded-xl text-center relative hover:bg-blue-900/20">
                      <input type="file" accept=".xlsx, .xls" onChange={e=>setFitmentFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Database size={24} className="mx-auto text-blue-500 mb-2" />
                      <p className="text-xs font-bold text-white mb-1">Fitment Matrix (.xlsx)</p>
                      {fitmentFile && <p className="text-[10px] text-blue-400">{fitmentFile.name}</p>}
                    </div>

                    <div className="col-span-2 space-y-3 mt-2">
                      <input type="url" placeholder="YouTube URL" value={form.video_urls} onChange={e=>setForm({...form, video_urls:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                      <input type="url" placeholder="3D Model URL" value={form.model_3d_url} onChange={e=>setForm({...form, model_3d_url:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                    </div>
                  </div>
                )}

                {activeTab === 'warranty' && (
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-500 mb-2 block">Warranty Horizon (Months)</label>
                    <input type="number" value={form.warranty_period} onChange={e=>setForm({...form, warranty_period:e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white" />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setProductModalOpen(false)} className="px-5 py-2.5 text-slate-400 text-xs font-bold rounded-lg hover:bg-slate-900">Abort</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-500 text-slate-950 text-xs font-black uppercase rounded-lg">Deploy Node</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KEEPING EXISTING SERIAL MODAL */}
      {isSerialModalOpen && currentProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          {/* ... [Serial Modal Content remains exactly identical to previous block to save space] ... */}
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-amber-500/5">
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2"><QrCode size={18} className="text-amber-500"/> {currentProduct.name} Serials</h2>
              <button onClick={() => setSerialModalOpen(false)} className="text-slate-500 hover:text-white"><XCircle size={20} /></button>
            </div>
            <div className="flex border-b border-slate-800 px-5 bg-slate-950/30">
              <button onClick={() => setSerialTab('generate')} className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 ${serialTab === 'generate' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500'}`}><Plus size={14} /> Batch Gen</button>
              <button onClick={() => setSerialTab('view')} className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 ${serialTab === 'view' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500'}`}><List size={14} /> Registry</button>
            </div>
            {serialTab === 'generate' && (
              <form onSubmit={handleGenerateSerials} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Batch Count</label><input type="number" required value={serialForm.count} onChange={e=>setSerialForm({...serialForm, count: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" /></div>
                  <div><label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Prefix</label><input type="text" required value={serialForm.prefix} onChange={e=>setSerialForm({...serialForm, prefix: e.target.value.toUpperCase()})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-500 font-mono" /></div>
                </div>
                <button type="submit" className="w-full py-3 bg-amber-500 text-slate-950 font-black uppercase text-xs rounded-xl mt-2 hover:bg-amber-400">Generate & Export XLSX</button>
              </form>
            )}
            {serialTab === 'view' && (
              <div className="p-5 h-[350px] overflow-y-auto">
                {loadingSerials ? (<div className="flex justify-center mt-10"><RefreshCw className="w-6 h-6 text-amber-500 animate-spin" /></div>) : (
                  <table className="w-full text-left">
                    <thead><tr className="border-b border-slate-800 text-[9px] font-black text-slate-500 uppercase"><th className="pb-2">Hash</th><th className="pb-2">Status</th><th className="pb-2 text-right">Delete</th></tr></thead>
                    <tbody>
                      {productSerials.map((s, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-900/50"><td className="py-2.5 font-mono text-xs text-amber-400">{s.serial_number || s.serial}</td><td className="py-2.5"><span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-800 text-slate-300">{s.status}</span></td><td className="py-2.5 text-right"><button onClick={() => handleDeleteSerial(s.id || s._id)} className="text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-md transition-colors"><Trash2 size={12} /></button></td></tr>
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
