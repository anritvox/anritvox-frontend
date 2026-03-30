import React, { useState, useEffect, useRef } from "react";
import imageCompression from "browser-image-compression";
import * as XLSX from "xlsx";
import {
  fetchProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  fetchSubcategories,
  fetchProductSerials,
  addProductSerials,
  bulkAddProductSerials,
  updateProductSerial,
  deleteProductSerial,
  exportSerialsExcel,
} from "../../services/api";
import {
  Package, Edit3, Trash2, Upload, FileSpreadsheet, Plus, Save, X, Loader2,
  Image as ImageIcon, Hash, AlertCircle, Grid3x3, Settings2, Search,
  RefreshCw, PlusCircle, ChevronLeft, ChevronRight, Trash, DownloadCloud
} from "lucide-react";

export default function ProductManagement({ token }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({
    name: "", description: "", price: "", quantity: "",
    category_id: "", subcategory_id: "", images: [], serials: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [imageCompressing, setImageCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  const [serialMethod, setSerialMethod] = useState("manual");
  const [fileError, setFileError] = useState("");
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [productsPerPage] = useState(10);
  
  // Serial Management State
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [serialStats, setSerialStats] = useState({});
  const [serialLoading, setSerialLoading] = useState(false);
  
  // Generator & Import States
  const [serialAddMethod, setSerialAddMethod] = useState("generate"); // Changed default to generate
  const [genCount, setGenCount] = useState(100);
  const [genPrefix, setGenPrefix] = useState("ANRI");
  const [genFormat, setGenFormat] = useState("advanced");
  const [newSerials, setNewSerials] = useState("");   
  const [bulkSerialPreview, setBulkSerialPreview] = useState([]);
  const [bulkSerialError, setBulkSerialError] = useState("");

  const [serialSearch, setSerialSearch] = useState("");
  const [currentSerialPage, setCurrentSerialPage] = useState(1);
  const [serialsPerPage] = useState(20);

  const formRef = useRef(null);

  const totalProductPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice((currentProductPage - 1) * productsPerPage, currentProductPage * productsPerPage);

  const filteredSerials = productSerials.filter((serial) => (serial.serial || serial.serial_number || "").toLowerCase().includes(serialSearch.toLowerCase()));
  const totalSerialPages = Math.ceil(filteredSerials.length / serialsPerPage);
  const paginatedSerials = filteredSerials.slice((currentSerialPage - 1) * serialsPerPage, currentSerialPage * serialsPerPage);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData, subData] = await Promise.all([
        fetchProductsAdmin(token), fetchCategories(token), fetchSubcategories(token),
      ]);
      setProducts(prodData); setCategories(catData); setSubcategories(subData);
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
      setSerialStats(data.statistics || {});
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

  const handleSerialChange = (index, value) => {
    const newSerials = [...form.serials];
    newSerials[index] = value.trim().toUpperCase();
    setForm(prev => ({ ...prev, serials: newSerials }));
  };

  const handleExcelUpload = async (e) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".xlsx")) return setFileError("Invalid file.");
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const serials = rows.map(row => row[0]).filter(val => val != null && String(val).trim() !== "").map(s => String(s).trim().toUpperCase());
      setForm(prev => ({ ...prev, quantity: serials.length, serials }));
    } catch (err) { setFileError("Error reading Excel."); }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", quantity: "", category_id: "", subcategory_id: "", images: [], serials: [] });
    setExistingImages([]); setEditProductId(null); setSerialMethod("manual"); setFileError(""); setError(null);
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
    setForm({
      name: product.name, description: product.description, price: product.price, quantity: String(product.quantity),
      category_id: product.category_id || "", subcategory_id: product.subcategory_id || "", images: [], serials: [],
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
    setShowSerialModal(false); setSelectedProduct(null); setProductSerials([]); setSerialStats({});
    setNewSerials(""); setSerialSearch(""); setBulkSerialError(""); setBulkSerialPreview([]);
  };

  // --- 1. NEW GENERATOR WITH AUTO-EXPORT ---
  const handleCommenceGeneration = async () => {
    if (!genCount || genCount <= 0) return alert("Please enter a valid count to generate.");
    try {
      setSerialLoading(true);
      // Generate the Serials
      await addProductSerials(selectedProduct.id, genCount, genPrefix, genFormat, token);
      
      // Auto-Export to Excel instantly
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
    } catch (err) {
      alert("Generation failed: " + (err.message || "Server Error"));
    } finally {
      setSerialLoading(false);
    }
  };

  // --- 2. FIXED MANUAL ADD (Uses Bulk API) ---
  const handleAddNewSerials = async () => {
    if (!newSerials.trim()) return;
    try {
      setSerialLoading(true);
      const serialArray = newSerials.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
      await bulkAddProductSerials(selectedProduct.id, serialArray);
      setNewSerials("");
      await loadProductSerials(selectedProduct.id);
      await loadData();
    } catch (err) { alert("Failed to add manual serials"); } 
    finally { setSerialLoading(false); }
  };

  // --- 3. FIXED EXCEL IMPORT (Uses Bulk API) ---
  const handleExcelUploadForSerials = async (e) => {
    setBulkSerialError("");
    const file = e.target.files?.[0];
    if (!file || !file.name.match(/\.(xlsx|xls)$/)) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const serials = rows.map(row => row[0]).filter(val => val != null && String(val).trim() !== "").map(s => String(s).trim().toUpperCase());
      setBulkSerialPreview(serials);
    } catch (err) { setBulkSerialError("Error reading Excel file."); }
  };

  const confirmBulkAdd = async () => {
    try {
      setSerialLoading(true);
      await bulkAddProductSerials(selectedProduct.id, bulkSerialPreview);
      setBulkSerialPreview([]);
      await loadProductSerials(selectedProduct.id);
      await loadData();
    } catch (err) { alert("Failed to import excel serials"); } 
    finally { setSerialLoading(false); }
  };

  // --- 4. EXPLICIT DELETE FUNCTION ---
  const handleDeleteSerial = async (serialId, serialNumber) => {
    if (window.confirm(`PERMANENTLY DELETE serial: ${serialNumber}?`)) {
      try {
        setSerialLoading(true);
        await deleteProductSerial(serialId, token); // Ensure api.js parameter structure matches
        await loadProductSerials(selectedProduct.id);
        await loadData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete serial. It might be registered.");
      } finally {
        setSerialLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
        <p className="text-cyan-500 font-bold tracking-widest animate-pulse">LOADING INVENTORY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] font-sans text-slate-100 p-4 sm:p-6 animate-fade-in text-[12px]">
      <div className="bg-[#16161a] border border-cyan-500/30 p-4 -mx-4 -mt-4 mb-8 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)] rounded-b-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Grid3x3 className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">ANRITVOX | Product Management</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Admin Control Panel</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Form and Table code remains exactly the same structure as your original */}
        <div ref={formRef} className="bg-[#16161a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
           {/* ... Form UI (omitted for brevity, assume exactly identical to your provided code) ... */}
           <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200">
              {editProductId ? <Edit3 className="h-5 w-5 text-fuchsia-400" /> : <Plus className="h-5 w-5 text-cyan-400" />}
              {editProductId ? "Edit Product Details" : "Add a New Product"}
            </h2>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-6">
             {/* Same inputs as before */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Product Name</label>
                  <input name="name" type="text" required className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 outline-none text-slate-100" value={form.name} onChange={handleChange} disabled={formLoading} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Price (INR)</label>
                  <input name="price" type="number" step="0.01" required className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 outline-none text-slate-100" value={form.price} onChange={handleChange} disabled={formLoading} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                    <select name="category_id" required className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 outline-none text-slate-100" value={form.category_id} onChange={handleChange} disabled={formLoading}>
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Subcategory</label>
                    <select name="subcategory_id" className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 outline-none disabled:opacity-30 text-slate-100" value={form.subcategory_id} onChange={handleChange} disabled={formLoading || !form.category_id}>
                      <option value="">Optional</option>
                      {subcategories.filter(sc => String(sc.category_id) === String(form.category_id)).map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                  <textarea name="description" rows="3" required className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 outline-none text-slate-100" value={form.description} onChange={handleChange} disabled={formLoading} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/30">
                  <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider"><ImageIcon className="h-4 w-4 text-cyan-400" /> Images</h3>
                  <div className="flex flex-wrap gap-4">
                    {/* Image rendering Logic */}
                    {editProductId && existingImages.map((img, i) => (
                      <div key={i} className="relative border border-slate-700 p-1 rounded-lg">
                        <img src={img.url} className="w-16 h-16 object-cover rounded" alt="Existing" />
                        <button type="button" onClick={() => setExistingImages(prev => prev.filter(x => x.id !== img.id))} className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1"><X className="h-3 w-3"/></button>
                      </div>
                    ))}
                    <label className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 text-slate-500">
                      <Upload className="h-5 w-5" />
                      <input name="images" type="file" multiple hidden accept="image/*" onChange={handleChange} />
                    </label>
                  </div>
                </div>
                
                {/* Initial Stock Input for New Products */}
                {!editProductId && (
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/30">
                    <h3 className="text-xs font-bold text-fuchsia-400 mb-4 flex items-center gap-2 uppercase tracking-wider"><Hash className="h-4 w-4" /> Initial Inventory Tracking</h3>
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-bold text-slate-400">QUANTITY:</label>
                      <input name="quantity" type="number" min="1" className="w-24 px-3 py-1 bg-[#0f172a] border border-slate-700 rounded outline-none text-slate-100" value={form.quantity} onChange={handleChange} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
              {editProductId && <button type="button" onClick={resetForm} className="px-6 py-2 bg-slate-800 rounded-lg text-xs font-bold uppercase text-slate-300">Cancel</button>}
              <button type="submit" disabled={formLoading || imageCompressing} className="px-8 py-2 rounded-lg font-bold text-xs uppercase bg-cyan-600 hover:bg-cyan-500 text-white flex gap-2">
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
            </div>
          </form>
        </div>

        {/* Inventory List Table */}
        <div className="bg-[#16161a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200"><Package className="h-5 w-5 text-cyan-400" /> Inventory Database</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-500 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Product Detail</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-cyan-500/[0.02]">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">{product.name}</div>
                      <div className="text-[10px] text-slate-600 font-mono mt-1">REF# {product.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${product.quantity > 5 ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {product.quantity} UNITS
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => openSerialModal(product)} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 hover:text-cyan-400" title="Manage Serials"><Settings2 className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(product)} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-fuchsia-500 hover:text-fuchsia-400"><Edit3 className="h-4 w-4" /></button>
                      <button onClick={() => handleRemove(product.id)} className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-rose-500/10 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NEON SERIAL MODAL (Updated) */}
      {showSerialModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#16161a] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#0f172a] border-b border-cyan-500/20 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-cyan-400 tracking-tight">Manage Serial IDs</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">PRODUCT: {selectedProduct.name}</p>
              </div>
              <button onClick={closeSerialModal} className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-full transition-all"><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar text-[12px]">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">TOTAL ENTRIES</div>
                  <div className="text-2xl font-mono font-bold text-slate-200">{serialStats.total_serials || 0}</div>
                </div>
                <div className="bg-lime-500/5 border border-lime-500/20 p-4 rounded-xl shadow-[inset_0_0_10px_rgba(132,204,22,0.05)]">
                  <div className="text-[10px] text-lime-500/60 font-bold uppercase tracking-wider mb-1">AVAILABLE</div>
                  <div className="text-2xl font-mono font-bold text-lime-400">{serialStats.available_serials || 0}</div>
                </div>
                <div className="bg-fuchsia-500/5 border border-fuchsia-500/20 p-4 rounded-xl shadow-[inset_0_0_10px_rgba(217,70,239,0.05)]">
                  <div className="text-[10px] text-fuchsia-500/60 font-bold uppercase tracking-wider mb-1">REGISTERED</div>
                  <div className="text-2xl font-mono font-bold text-fuchsia-400">{serialStats.used_serials || 0}</div>
                </div>
              </div>

              {/* Advanced Generator & Import Section */}
              <div className="border border-slate-800 rounded-xl bg-slate-900/30 p-5 shadow-inner">
                <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-widest text-[12px]">
                  <Settings2 className="h-4 w-4 text-cyan-400"/> Addition Methods
                </h4>
                <div className="flex gap-4 mb-4 border-b border-slate-800 pb-2">
                  <button onClick={() => setSerialAddMethod("generate")} className={`pb-2 px-4 text-[11px] font-bold uppercase tracking-widest transition-all ${serialAddMethod === 'generate' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-500'}`}>Auto-Generate</button>
                  <button onClick={() => setSerialAddMethod("manual")} className={`pb-2 px-4 text-[11px] font-bold uppercase tracking-widest transition-all ${serialAddMethod === 'manual' ? 'border-b-2 border-fuchsia-400 text-fuchsia-400' : 'text-slate-500'}`}>Manual Array</button>
                  <button onClick={() => setSerialAddMethod("excel")} className={`pb-2 px-4 text-[11px] font-bold uppercase tracking-widest transition-all ${serialAddMethod === 'excel' ? 'border-b-2 border-lime-400 text-lime-400' : 'text-slate-500'}`}>Excel Import</button>
                </div>

                {serialAddMethod === "generate" && (
                  <div className="space-y-4 p-4 border border-cyan-500/20 bg-cyan-500/5 rounded-xl">
                    <p className="text-cyan-400 text-[10px] uppercase font-bold tracking-widest mb-2">Configure & Generate Instantly</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Quantity</label>
                        <input type="number" value={genCount} onChange={e => setGenCount(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Model Prefix</label>
                        <input type="text" value={genPrefix} onChange={e => setGenPrefix(e.target.value)} maxLength={6} className="w-full bg-[#0a0a0c] border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 uppercase" />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Algorithm Format</label>
                        <select value={genFormat} onChange={e => setGenFormat(e.target.value)} className="w-full bg-[#0a0a0c] border border-slate-700 rounded px-3 py-2 text-white outline-none focus:border-cyan-500 text-xs">
                          <option value="advanced">Advanced (Prefix-YYMM-XXXXXX-C)</option>
                          <option value="legacy">Legacy (10 digits)</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={handleCommenceGeneration} 
                      disabled={serialLoading}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all flex justify-center items-center gap-2 mt-2"
                    >
                      {serialLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <DownloadCloud className="h-4 w-4"/>}
                      Commence Generation & Auto-Export
                    </button>
                  </div>
                )}

                {serialAddMethod === "manual" && (
                  <div className="space-y-4">
                    <textarea placeholder="Paste existing serials (one per line)..." className="w-full p-4 bg-[#0a0a0c] border border-slate-800 rounded-xl outline-none text-xs font-mono h-24 text-fuchsia-100 placeholder:text-slate-700 transition-all" value={newSerials} onChange={(e) => setNewSerials(e.target.value)} />
                    <button onClick={handleAddNewSerials} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Upload Array</button>
                  </div>
                )}

                {serialAddMethod === "excel" && (
                  <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center gap-4 bg-[#0a0a0c]/50">
                    <FileSpreadsheet className="h-12 w-12 text-slate-700" />
                    <input type="file" accept=".xlsx,.xls" onChange={handleExcelUploadForSerials} className="text-[10px] text-slate-500 file:bg-lime-500/10 file:border-0 file:text-lime-400 file:px-4 file:py-1 file:rounded file:mr-4 file:font-bold file:uppercase cursor-pointer" />
                    {bulkSerialPreview.length > 0 && <button onClick={confirmBulkAdd} className="bg-lime-600 hover:bg-lime-500 text-white px-8 py-2 rounded-lg font-bold text-xs uppercase transition-all">Import {bulkSerialPreview.length} IDs</button>}
                  </div>
                )}
              </div>

              {/* Visual Serial List & EXPLICIT DELETE BUTTON */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden text-[12px]">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-2 h-4 w-4 text-slate-600" />
                    <input type="text" placeholder="FILTER BY SERIAL ID..." className="pl-9 pr-4 py-1.5 bg-[#0a0a0c] border border-slate-800 rounded-lg text-[10px] font-bold tracking-widest outline-none focus:border-cyan-500/30 text-slate-300 w-64" value={serialSearch} onChange={e => setSerialSearch(e.target.value)} />
                  </div>
                  <button onClick={() => loadProductSerials(selectedProduct.id)} className="p-1.5 text-slate-500 hover:text-cyan-400"><RefreshCw className="h-4 w-4"/></button>
                </div>
                <div className="divide-y divide-slate-800/50 max-h-60 overflow-y-auto custom-scrollbar">
                  {paginatedSerials.map(serial => (
                    <div key={serial.id} className="p-3 flex items-center justify-between hover:bg-cyan-500/[0.03]">
                      <div className="font-mono text-sm font-bold text-slate-200 tracking-tighter">{serial.serial || serial.serial_number}</div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${serial.status === 'registered' ? 'bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20' : 'bg-lime-500/10 text-lime-400 border border-lime-500/20'}`}>
                          {serial.status === 'registered' ? 'REGISTERED' : 'AVAILABLE'}
                        </span>
                        
                        {/* THE NEW PROMINENT DELETE BUTTON */}
                        {serial.status !== 'registered' && (
                          <button 
                            onClick={() => handleDeleteSerial(serial.id, serial.serial || serial.serial_number)} 
                            className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/50 text-rose-500 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            <Trash className="h-3 w-3"/> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {paginatedSerials.length === 0 && <div className="p-8 text-center text-slate-600 text-xs uppercase font-bold italic">No matching records</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}
