import React, { useState, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import * as XLSX from "xlsx";
import {
  fetchProductsAdmin, createProduct, updateProduct, deleteProduct,
  fetchCategories, fetchSubcategories, fetchProductSerials,
  addProductSerials, bulkAddProductSerials, updateProductSerial,
  deleteProductSerial, exportSerialsExcel,
} from "../../services/api";
import {
  Package, Edit3, Trash2, Upload, FileSpreadsheet, Plus, Save, X, Loader2,
  Image as ImageIcon, Hash, Settings2, Search,
  RefreshCw, Trash, DownloadCloud, Youtube, BoxSelect, ExternalLink,
  ChevronLeft, ChevronRight // Added Pagination Icons
} from "lucide-react";

export default function ProductManagement({ token }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", price: "", quantity: "", category_id: "", 
    subcategory_id: "", images: [], serials: [], video_urls: "", product_links: "", model_3d_url: ""
  });
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [imageCompressing, setImageCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  
  // FIXED: Product Search & Pagination State
  const [productSearch, setProductSearch] = useState("");
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [productsPerPage] = useState(10);
  
  // Serial Management State
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [serialLoading, setSerialLoading] = useState(false);
  const [serialAddMethod, setSerialAddMethod] = useState("generate");
  
  const [genCount, setGenCount] = useState(100);
  const [genPrefix, setGenPrefix] = useState("ANRITV"); 
  const [baseWarrantyMonths, setBaseWarrantyMonths] = useState(12); 
  
  const [newSerials, setNewSerials] = useState("");   
  const [bulkSerialPreview, setBulkSerialPreview] = useState([]);
  
  // FIXED: Serial Search & Pagination State
  const [serialSearch, setSerialSearch] = useState("");
  const [currentSerialPage, setCurrentSerialPage] = useState(1);
  const [serialsPerPage] = useState(20);

  const formRef = useRef(null);

  // DYNAMIC FILTERING & PAGINATION LOGIC (Products)
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice((currentProductPage - 1) * productsPerPage, currentProductPage * productsPerPage);
  
  // DYNAMIC FILTERING & PAGINATION LOGIC (Serials)
  const filteredSerials = productSerials.filter((serial) => (serial.serial || serial.serial_number || "").toLowerCase().includes(serialSearch.toLowerCase()));
  const totalSerialPages = Math.ceil(filteredSerials.length / serialsPerPage);
  const paginatedSerials = filteredSerials.slice((currentSerialPage - 1) * serialsPerPage, currentSerialPage * serialsPerPage);

  // DYNAMIC STATS (Fixes the 0/0/0 bug)
  const derivedSerialStats = {
    total: productSerials.length,
    used: productSerials.filter(s => s.status === 'registered').length,
    available: productSerials.filter(s => s.status !== 'registered').length
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData, subData] = await Promise.all([
        fetchProductsAdmin(token), fetchCategories(token), fetchSubcategories(token),
      ]);
      setProducts(Array.isArray(prodData) ? prodData : (prodData?.data || []));
      setCategories(Array.isArray(catData) ? catData : (catData?.data || []));
      setSubcategories(Array.isArray(subData) ? subData : (subData?.data || []));
    } catch (e) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadData(); }, [token]);

  const loadProductSerials = async (productId) => {
    setSerialLoading(true);
    try {
      const data = await fetchProductSerials(productId, token);
      setProductSerials(data.serials || []);
      setCurrentSerialPage(1); // Reset page on load
    } catch (e) {
      setError("Failed to load product serials.");
    } finally {
      setSerialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      const fileList = Array.from(files);
      if (fileList.some(file => !allowed.includes(file.type))) {
        alert("Invalid formats. Only JPEG, PNG, WEBP allowed.");
        return;
      }
      setForm(prev => ({ ...prev, images: fileList }));
    } else if (name === "quantity") {
      const qty = Math.max(0, Number(value));
      setForm(prev => ({ ...prev, quantity: String(qty), serials: Array(qty).fill("") }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({ 
      name: "", description: "", price: "", quantity: "", category_id: "", 
      subcategory_id: "", images: [], serials: [], video_urls: "", product_links: "", model_3d_url: "" 
    });
    setExistingImages([]); setEditProductId(null); setError(null);
  };

  const compressImages = async (imageFiles) => {
    setImageCompressing(true);
    try {
      return await Promise.all(imageFiles.map(async (file) => {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true, fileType: "image/webp" };
        const compressedFile = await imageCompression(file, options);
        return new File([compressedFile], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
      }));
    } finally { setImageCompressing(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true); setError(null);
    try {
      let compressedImages = form.images.length > 0 ? await compressImages(Array.from(form.images)) : [];
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("category_id", form.category_id);
      if (form.subcategory_id) formData.append("subcategory_id", form.subcategory_id);
      if (form.video_urls) formData.append("video_urls", form.video_urls.trim());
      if (form.model_3d_url) formData.append("model_3d_url", form.model_3d_url.trim());
      if (form.product_links) {
          const linksArray = form.product_links.split(',').map(url => url.trim()).filter(url => url !== "").map(url => ({ label: "Buy Online", url }));
          formData.append("product_links", JSON.stringify(linksArray));
      }
      if (!editProductId) {
        formData.append("quantity", form.quantity);
        formData.append("serials", JSON.stringify(form.serials));
      } else {
        formData.append("existing_images", JSON.stringify(existingImages.map(img => img.url)));
      }
      compressedImages.forEach(image => formData.append("images", image));

      if (editProductId) await updateProduct(editProductId, formData, token);
      else await createProduct(formData, token);
      
      resetForm(); await loadData();
    } catch (err) { setError(err.message || "An error occurred."); } 
    finally { setFormLoading(false); }
  };

  const handleEdit = (product) => {
    setEditProductId(product.id);
    let linkString = "";
    if (product.product_links) {
        try {
            const links = typeof product.product_links === 'string' ? JSON.parse(product.product_links) : product.product_links;
            linkString = links.map(l => l.url).join(', ');
        } catch(e) { linkString = ""; }
    }
    setForm({
      name: product.name, description: product.description, price: product.price, quantity: String(product.quantity),
      category_id: product.category_id || "", subcategory_id: product.subcategory_id || "", images: [], serials: [],
      video_urls: product.video_urls || "", model_3d_url: product.model_3d_url || "", product_links: linkString
    });
    setExistingImages(product.images ? product.images.map((img, idx) => ({ id: idx, url: img, path: img })) : []);
    setError(null); formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRemove = async (productId) => {
    if (window.confirm("Delete this product entirely?")) {
      try { await deleteProduct(productId, token); await loadData(); } catch (err) { setError("Failed to delete."); }
    }
  };

  const openSerialModal = async (product) => {
    setSelectedProduct(product); setShowSerialModal(true); await loadProductSerials(product.id);
  };

  const closeSerialModal = () => {
    setShowSerialModal(false); setSelectedProduct(null); setProductSerials([]); 
    setNewSerials(""); setSerialSearch(""); setBulkSerialPreview([]); setCurrentSerialPage(1);
  };

  const handleCommenceGeneration = async () => {
    if (!genCount || genCount <= 0) return alert("Please enter a valid count to generate.");
    if (!baseWarrantyMonths || baseWarrantyMonths <= 0) return alert("Please set a valid Base Warranty duration in months.");
    
    try {
      setSerialLoading(true);
      await addProductSerials(selectedProduct.id, genCount, genPrefix, "advanced", baseWarrantyMonths, token);
      
      const blob = await exportSerialsExcel({ productId: selectedProduct.id });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Serials_${selectedProduct.name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      await loadProductSerials(selectedProduct.id);
      await loadData();
    } catch (err) { alert("Generation failed."); } finally { setSerialLoading(false); }
  };

  const handleAddNewSerials = async () => {
    if (!newSerials.trim()) return;
    try {
      setSerialLoading(true);
      const serialArray = newSerials.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
      await bulkAddProductSerials(selectedProduct.id, serialArray);
      setNewSerials(""); await loadProductSerials(selectedProduct.id); await loadData();
    } catch (err) { alert("Failed to add manual serials"); } finally { setSerialLoading(false); }
  };

  const handleDeleteSerial = async (serialId, serialNumber) => {
    if (window.confirm(`PERMANENTLY DELETE serial: ${serialNumber}?`)) {
      try {
        setSerialLoading(true);
        await deleteProductSerial(selectedProduct.id, serialId); 
        await loadProductSerials(selectedProduct.id); await loadData();
      } catch (err) { alert(err.response?.data?.message || "Failed to delete serial. It might be registered."); } 
      finally { setSerialLoading(false); }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
    </div>
  );

  return (
    <div className="font-sans text-gray-200 animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
            PRODUCT <span className="text-purple-500">MANAGEMENT</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-tight">Centralized Inventory & Asset Control</p>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      <div ref={formRef} className="bg-[#0a0c10] border border-white/5 rounded-[30px] overflow-hidden shadow-2xl">
        <div className="border-b border-white/5 px-8 py-6">
          <h2 className="text-xl font-black text-white flex items-center gap-3">
            {editProductId ? <Edit3 className="h-6 w-6 text-blue-500" /> : <Plus className="h-6 w-6 text-purple-500" />}
            {editProductId ? "Edit Product Details" : "Register New Product"}
          </h2>
        </div>
        
        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Product Name</label>
                <input name="name" type="text" required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none text-white transition-all text-sm" value={form.name} onChange={handleChange} disabled={formLoading} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Price (INR)</label>
                <input name="price" type="number" step="0.01" required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none text-white transition-all text-sm" value={form.price} onChange={handleChange} disabled={formLoading} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Category</label>
                  <select name="category_id" required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none text-white transition-all text-sm appearance-none" value={form.category_id} onChange={handleChange} disabled={formLoading}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Subcategory</label>
                  <select name="subcategory_id" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none disabled:opacity-30 text-white transition-all text-sm appearance-none" value={form.subcategory_id} onChange={handleChange} disabled={formLoading || !form.category_id}>
                    <option value="">Optional</option>
                    {subcategories.filter(sc => String(sc.category_id) === String(form.category_id)).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                <textarea name="description" rows="4" required className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none text-white transition-all text-sm resize-none custom-scrollbar" value={form.description} onChange={handleChange} disabled={formLoading} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-white/10 rounded-[20px] p-6 bg-black/20">
                <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest"><ImageIcon className="h-4 w-4 text-purple-400" /> Image Assets</h3>
                <div className="flex flex-wrap gap-4">
                  {editProductId && existingImages.map((img, i) => (
                    <div key={i} className="relative border border-white/10 p-1.5 rounded-xl bg-black">
                      <img src={img.url} className="w-20 h-20 object-cover rounded-lg" alt="Existing" />
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter(x => x.id !== img.id))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg"><X className="h-3 w-3"/></button>
                    </div>
                  ))}
                  <label className="w-24 h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-gray-500">
                    <Upload className="h-6 w-6 mb-2 text-purple-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Upload</span>
                    <input name="images" type="file" multiple hidden accept="image/*" onChange={handleChange} />
                  </label>
                </div>
              </div>
              
              {!editProductId && (
                <div className="border border-purple-500/20 rounded-[20px] p-6 bg-purple-500/5">
                  <h3 className="text-xs font-bold text-purple-400 mb-5 flex items-center gap-2 uppercase tracking-widest"><Hash className="h-4 w-4" /> Initial Inventory Tracking</h3>
                  <div className="flex items-center gap-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">BASE QUANTITY:</label>
                    <input name="quantity" type="number" min="1" className="w-32 px-4 py-3 bg-black/40 border border-white/10 rounded-xl outline-none text-white font-mono text-center focus:border-purple-500/50" value={form.quantity} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
            {editProductId && <button type="button" onClick={resetForm} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all">Cancel Edit</button>}
            <button type="submit" disabled={formLoading || imageCompressing} className="px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-3 transition-all shadow-lg shadow-purple-500/20">
              {formLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Commit Record
            </button>
          </div>
        </form>
      </div>

      {/* --- PRODUCTS TABLE WITH FIX PAGINATION & SEARCH --- */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[30px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest">Asset Directory</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="SEARCH PRODUCTS (e.g. AHD)..." 
              className="pl-11 pr-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs font-bold tracking-widest outline-none focus:border-purple-500/50 text-white w-72 transition-all"
              value={productSearch}
              onChange={e => {setProductSearch(e.target.value); setCurrentProductPage(1);}}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Asset Name</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Stock Level</th>
                <th className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-white text-sm">{product.name}</div>
                    <div className="text-[10px] text-gray-600 font-mono mt-1.5 uppercase tracking-widest">REF ID: {product.id}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${product.quantity > 5 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {product.quantity} UNITS
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button onClick={() => openSerialModal(product)} className="p-3 bg-white/5 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 rounded-xl transition-all border border-transparent hover:border-purple-500/30" title="Manage Serials"><Settings2 className="h-4 w-4" /></button>
                    <button onClick={() => handleEdit(product)} className="p-3 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-xl transition-all border border-transparent hover:border-blue-500/30"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => handleRemove(product.id)} className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/30"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                   <td colSpan="3" className="px-8 py-12 text-center text-gray-500 font-bold text-xs uppercase tracking-widest">No Products Found matching "{productSearch}"</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* FIXED: Product Pagination Footer */}
        <div className="px-8 py-4 border-t border-white/5 flex items-center justify-between bg-black/20">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Showing {filteredProducts.length === 0 ? 0 : ((currentProductPage - 1) * productsPerPage) + 1} to {Math.min(currentProductPage * productsPerPage, filteredProducts.length)} of {filteredProducts.length} Entries
          </span>
          <div className="flex gap-2">
            <button disabled={currentProductPage === 1} onClick={() => setCurrentProductPage(p => p - 1)} className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronLeft className="h-4 w-4"/></button>
            <button disabled={currentProductPage === totalProductPages || totalProductPages === 0} onClick={() => setCurrentProductPage(p => p + 1)} className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronRight className="h-4 w-4"/></button>
          </div>
        </div>
      </div>

      {/* --- SERIAL REGISTRY MODAL WITH FIX PAGINATION & SEARCH --- */}
      {showSerialModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="bg-[#0a0c10] border border-white/10 rounded-[40px] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="border-b border-white/5 p-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Security Serial Registry</h3>
                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-2">LINKED TO: {selectedProduct.name}</p>
              </div>
              <button onClick={closeSerialModal} className="p-3 hover:bg-white/5 text-gray-500 hover:text-white rounded-full transition-all"><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              {/* FIXED: Dynamic Stats calculation directly from arrays */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-black/40 border border-white/5 p-6 rounded-3xl shadow-inner">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">TOTAL POOL</div>
                  <div className="text-4xl font-mono font-black text-white">{derivedSerialStats.total}</div>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]">
                  <div className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mb-2">AVAILABLE</div>
                  <div className="text-4xl font-mono font-black text-emerald-400">{derivedSerialStats.available}</div>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 p-6 rounded-3xl shadow-[inset_0_0_20px_rgba(168,85,247,0.02)]">
                  <div className="text-[10px] text-purple-500/60 font-bold uppercase tracking-widest mb-2">REGISTERED</div>
                  <div className="text-4xl font-mono font-black text-purple-400">{derivedSerialStats.used}</div>
                </div>
              </div>

              <div className="border border-white/5 rounded-3xl bg-black/20 p-8 shadow-inner">
                <h4 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <Settings2 className="h-5 w-5 text-purple-400"/> Ingestion Controls
                </h4>
                <div className="flex gap-4 mb-6 border-b border-white/5 pb-4">
                  <button onClick={() => setSerialAddMethod("generate")} className={`pb-2 px-4 text-xs font-bold uppercase tracking-widest transition-all ${serialAddMethod === 'generate' ? 'border-b-2 border-purple-400 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}>Algorithmic</button>
                  <button onClick={() => setSerialAddMethod("manual")} className={`pb-2 px-4 text-xs font-bold uppercase tracking-widest transition-all ${serialAddMethod === 'manual' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Manual Array</button>
                </div>

                {serialAddMethod === "generate" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2 tracking-widest">Volume (Qty)</label>
                        <input type="number" value={genCount} onChange={e => setGenCount(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 font-mono text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2 tracking-widest">Prefix Identifier</label>
                        <input type="text" value={genPrefix} onChange={e => setGenPrefix(e.target.value)} maxLength={6} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 font-mono text-sm uppercase" />
                      </div>
                      <div>
                        <label className="text-[10px] text-purple-400 uppercase font-bold block mb-2 tracking-widest">Base Warranty (Months)</label>
                        <input type="number" value={baseWarrantyMonths} onChange={e => setBaseWarrantyMonths(e.target.value)} min="1" max="120" className="w-full bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 font-mono text-sm" />
                      </div>
                    </div>
                    <button onClick={handleCommenceGeneration} disabled={serialLoading} className="w-full bg-purple-500 hover:bg-purple-600 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all flex justify-center items-center gap-3 text-white">
                      {serialLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <DownloadCloud className="h-5 w-5"/>}
                      Initialize Batch Generation
                    </button>
                  </div>
                )}
                
                {serialAddMethod === "manual" && (
                  <div className="space-y-6">
                    <textarea placeholder="Paste external serials (one per line)..." className="w-full p-5 bg-black/60 border border-white/10 rounded-2xl outline-none text-sm font-mono h-32 text-white placeholder:text-gray-700 transition-all focus:border-purple-500/50 custom-scrollbar" value={newSerials} onChange={(e) => setNewSerials(e.target.value)} />
                    <button onClick={handleAddNewSerials} className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-white shadow-lg shadow-blue-500/20">Inject Serial Array</button>
                  </div>
                )}
              </div>

              <div className="border border-white/5 rounded-3xl overflow-hidden bg-black/40 shadow-2xl">
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="SEARCH OLD SERIALS..." 
                      className="pl-11 pr-4 py-2.5 bg-black border border-white/10 rounded-xl text-[10px] font-bold tracking-widest outline-none focus:border-purple-500/50 text-white w-72 transition-all" 
                      value={serialSearch} 
                      onChange={e => {setSerialSearch(e.target.value); setCurrentSerialPage(1);}} 
                    />
                  </div>
                  <button onClick={() => loadProductSerials(selectedProduct.id)} className="p-2 text-gray-500 hover:text-white bg-black rounded-xl border border-white/10 transition-all shadow-sm"><RefreshCw className="h-4 w-4"/></button>
                </div>
                
                <div className="divide-y divide-white/5 max-h-72 overflow-y-auto custom-scrollbar">
                  {paginatedSerials.map(serial => (
                    <div key={serial.id} className="p-4 px-6 flex items-center justify-between hover:bg-white/[0.02]">
                      <div className="font-mono text-sm font-bold text-white tracking-tighter">{serial.serial || serial.serial_number}</div>
                      <div className="flex items-center gap-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${serial.status === 'registered' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {serial.status === 'registered' ? 'REGISTERED' : 'AVAILABLE'}
                        </span>
                        {serial.status !== 'registered' && (
                          <button onClick={() => handleDeleteSerial(serial.id, serial.serial || serial.serial_number)} className="flex items-center gap-2 p-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:text-white text-red-500 rounded-xl transition-all">
                            <Trash className="h-4 w-4"/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {paginatedSerials.length === 0 && <div className="p-10 text-center text-gray-600 text-xs uppercase font-bold tracking-widest">No matching serials found</div>}
                </div>

                {/* FIXED: Serial Pagination Footer */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-black/40">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Showing {filteredSerials.length === 0 ? 0 : ((currentSerialPage - 1) * serialsPerPage) + 1} to {Math.min(currentSerialPage * serialsPerPage, filteredSerials.length)} of {filteredSerials.length}
                  </span>
                  <div className="flex gap-2">
                    <button disabled={currentSerialPage === 1} onClick={() => setCurrentSerialPage(p => p - 1)} className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronLeft className="h-4 w-4"/></button>
                    <button disabled={currentSerialPage === totalSerialPages || totalSerialPages === 0} onClick={() => setCurrentSerialPage(p => p + 1)} className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"><ChevronRight className="h-4 w-4"/></button>
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
