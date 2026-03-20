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
} from "../../services/api";
import {
  Package,
  Edit3,
  Trash2,
  Upload,
  FileSpreadsheet,
  Plus,
  Save,
  X,
  Loader2,
  Image as ImageIcon,
  Tag,
  IndianRupee,
  Hash,
  AlertCircle,
  CheckCircle2,
  Folder,
  Grid3x3,
  Settings2,
  Download,
  Search,
  RefreshCw,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Camera,
  Trash,
  Info,
} from "lucide-react";

export default function ProductManagement({ token }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category_id: "",
    subcategory_id: "",
    images: [],
    serials: [],
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
  const [newSerials, setNewSerials] = useState("");
  const [serialCount, setSerialCount] = useState(1);
  const [serialPrefix, setSerialPrefix] = useState("ANRI");
  const [editingSerial, setEditingSerial] = useState(null);
  const [serialSearch, setSerialSearch] = useState("");
  const [serialAddMethod, setSerialAddMethod] = useState("manual");
  const [bulkSerialError, setBulkSerialError] = useState("");
  const [bulkSerialPreview, setBulkSerialPreview] = useState([]);
  const [currentSerialPage, setCurrentSerialPage] = useState(1);
  const [serialsPerPage] = useState(20);

  const formRef = useRef(null);

  const totalProductPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentProductPage - 1) * productsPerPage,
    currentProductPage * productsPerPage
  );

  const filteredSerials = productSerials.filter((serial) =>
    serial.serial.toLowerCase().includes(serialSearch.toLowerCase())
  );
  const totalSerialPages = Math.ceil(filteredSerials.length / serialsPerPage);
  const paginatedSerials = filteredSerials.slice(
    (currentSerialPage - 1) * serialsPerPage,
    currentSerialPage * serialsPerPage
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData, subData] = await Promise.all([
        fetchProductsAdmin(token),
        fetchCategories(token),
        fetchSubcategories(token),
      ]);
      setProducts(prodData);
      setCategories(catData);
      setSubcategories(subData);
    } catch (e) {
      setError("Failed to load data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

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
      const invalidFiles = fileList.filter((file) => !allowed.includes(file.type));
      
      if (invalidFiles.length > 0) {
        alert("Invalid formats. Only JPEG, PNG, and WEBP are allowed.");
        return;
      }
      setForm((prev) => ({ ...prev, images: fileList }));
    } else if (name === "quantity") {
      const qty = Math.max(0, Number(value));
      setForm((prev) => ({
        ...prev,
        quantity: String(qty),
        serials: Array(qty).fill(""),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSerialChange = (index, value) => {
    const newSerialsArr = [...form.serials];
    newSerialsArr[index] = value.trim().toUpperCase();
    setForm((prev) => ({ ...prev, serials: newSerialsArr }));
  };

  const handleExcelUpload = async (e) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".xlsx")) {
      setFileError("Invalid file. Please upload a .xlsx file.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      const serials = rows
        .map((row) => row[0])
        .filter((val) => val != null && String(val).trim() !== "")
        .map((s) => String(s).trim().toUpperCase());

      setForm((prev) => ({
        ...prev,
        quantity: serials.length,
        serials
      }));
    } catch (err) {
      setFileError("Error reading Excel file.");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      category_id: "",
      subcategory_id: "",
      images: [],
      serials: [],
    });
    setExistingImages([]);
    setEditProductId(null);
    setSerialMethod("manual");
    setFileError("");
    setError(null);
  };

  const compressImages = async (imageFiles) => {
    setImageCompressing(true);
    try {
      return await Promise.all(
        imageFiles.map(async (file) => {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            fileType: "image/webp"
          };
          const compressedFile = await imageCompression(file, options);
          return new File([compressedFile], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
        })
      );
    } finally {
      setImageCompressing(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      let compressedImages = [];
      if (form.images.length > 0) {
        compressedImages = await compressImages(Array.from(form.images));
      }

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("category_id", form.category_id);
      if (form.subcategory_id) formData.append("subcategory_id", form.subcategory_id);
      
      if (!editProductId) {
        formData.append("quantity", form.quantity);
        formData.append("serials", JSON.stringify(form.serials));
      }

      compressedImages.forEach((image) => formData.append("images", image));

      if (editProductId) {
        await updateProduct(editProductId, formData, token);
      } else {
        await createProduct(formData, token);
      }
      
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (product) => {
    const prodId = product._id || product.id; // FIX: MongoDB Support
    setEditProductId(prodId);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: String(product.quantity),
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      images: [],
      serials: [],
    });
    setExistingImages(product.images ? product.images.map((img, idx) => ({ id: idx, url: img, path: img })) : []);
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRemove = async (product) => {
    const prodId = product._id || product.id; // FIX: MongoDB Support
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(prodId, token);
        await loadData();
      } catch (err) {
        setError("Failed to delete product.");
      }
    }
  };

  const openSerialModal = async (product) => {
    setSelectedProduct(product);
    setShowSerialModal(true);
    await loadProductSerials(product._id || product.id); // FIX: MongoDB Support
  };

  const closeSerialModal = () => {
    setShowSerialModal(false);
    setSelectedProduct(null);
    setProductSerials([]);
    setSerialStats({});
    setNewSerials("");
    setEditingSerial(null);
    setSerialSearch("");
    setBulkSerialError("");
    setBulkSerialPreview([]);
  };

  const handleAddNewSerials = async () => {
    if (!newSerials.trim()) return;
    try {
      setSerialLoading(true);
      const serialArray = newSerials.split(/[\n,]+/).map((s) => s.trim()).filter((s) => s.length > 0);
      const prodId = selectedProduct._id || selectedProduct.id;
      
      // FIX: Correctly pass the arguments expected by enhanced backend generator
      await addProductSerials(prodId, serialArray.length, "ANRI", token); 
      
      setNewSerials("");
      await loadProductSerials(prodId);
      await loadData();
    } catch (err) {
      setError("Failed to add serials");
    } finally {
      setSerialLoading(false);
    }
  };

  const handleExcelUploadForSerials = async (e) => {
    setBulkSerialError("");
    const file = e.target.files?.[0];
    if (!file || !file.name.match(/\.(xlsx|xls)$/)) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      const serials = rows.map((row) => row[0]).filter((val) => val != null && String(val).trim() !== "").map((s) => String(s).trim().toUpperCase());
      setBulkSerialPreview(serials);
    } catch (err) {
      setBulkSerialError("Error reading Excel file.");
    }
  };

  const confirmBulkAdd = async () => {
    try {
      setSerialLoading(true);
      const prodId = selectedProduct._id || selectedProduct.id;
      
      // FIX: Correctly pass the arguments expected by enhanced backend generator
      await addProductSerials(prodId, bulkSerialPreview.length, "ANRI", token);
      
      setBulkSerialPreview([]);
      await loadProductSerials(prodId);
      await loadData();
    } catch (err) {
      setBulkSerialError("Failed to import serials");
    } finally {
      setSerialLoading(false);
    }
  };

  const handleEditSerial = async (serialId, newSerial) => {
    try {
      setSerialLoading(true);
      const prodId = selectedProduct._id || selectedProduct.id;
      await updateProductSerial(prodId, serialId, newSerial, token);
      setEditingSerial(null);
      await loadProductSerials(prodId);
    } catch (err) {
      setError("Failed to update serial");
    } finally {
      setSerialLoading(false);
    }
  };

  const handleDeleteSerial = async (serialId, serialNumber) => {
    if (window.confirm(`Delete serial "${serialNumber}"?`)) {
      try {
        setSerialLoading(true);
        const prodId = selectedProduct._id || selectedProduct.id;
        await deleteProductSerial(prodId, serialId, token);
        await loadProductSerials(prodId);
        await loadData();
      } catch (err) {
        setError("Failed to delete serial");
      } finally {
        setSerialLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
        <p className="text-cyan-500 font-bold tracking-widest animate-pulse">LOADING INVENTORY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] font-sans text-slate-100 p-4 sm:p-6 animate-fade-in text-[12px]">
      {/* Neon Dark Admin Header */}
      <div className="bg-[#16161a] border border-cyan-500/30 p-4 -mx-4 -mt-4 mb-8 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.15)] rounded-b-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Grid3x3 className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">
              ANRITVOX | Product Management
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Admin Control Panel</p>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="text-center px-4 border-r border-slate-800">
            <div className="font-bold text-cyan-400 text-lg leading-none">{products.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Products</div>
          </div>
          <div className="text-center px-4">
            <div className="font-bold text-fuchsia-400 text-lg leading-none">{categories.length}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Categories</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Form Section */}
        <div ref={formRef} className="bg-[#16161a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-cyan-500/20">
          <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200">
              {editProductId ? <Edit3 className="h-5 w-5 text-fuchsia-400" /> : <Plus className="h-5 w-5 text-cyan-400" />}
              {editProductId ? "Edit Product Details" : "Add a New Product"}
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Product Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] outline-none transition-all text-slate-100"
                    value={form.name}
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Price (INR)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] outline-none transition-all text-slate-100"
                    value={form.price}
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Category</label>
                    <select
                      name="category_id"
                      required
                      className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 outline-none text-slate-100"
                      value={form.category_id}
                      onChange={handleChange}
                      disabled={formLoading}
                    >
                      <option value="">Select</option>
                      {categories.map((c) => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Subcategory</label>
                    <select
                      name="subcategory_id"
                      className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 outline-none disabled:opacity-30 text-slate-100"
                      value={form.subcategory_id}
                      onChange={handleChange}
                      disabled={formLoading || !form.category_id}
                    >
                      <option value="">Optional</option>
                      {subcategories
                        .filter((sc) => String(sc.category_id) === String(form.category_id))
                        .map((sc) => (
                          <option key={sc._id || sc.id} value={sc._id || sc.id}>{sc.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    required
                    className="w-full px-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] outline-none transition-all text-slate-100"
                    value={form.description}
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {/* Images Section */}
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/30">
                  <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <ImageIcon className="h-4 w-4 text-cyan-400" /> Product Images
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {editProductId && existingImages.map((img, i) => (
                      <div key={i} className="relative border border-slate-700 p-1 rounded-lg group">
                        <img src={img.url} className="w-20 h-20 object-cover rounded shadow-lg" alt="Existing" />
                        <button 
                          type="button" 
                          onClick={() => setExistingImages(prev => prev.filter(x => x.id !== img.id))}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3"/>
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all text-slate-500 hover:text-cyan-400">
                      <Upload className="h-6 w-6" />
                      <span className="text-[10px] uppercase font-bold mt-1">Add</span>
                      <input name="images" type="file" multiple hidden accept="image/*" onChange={handleChange} />
                    </label>
                    {form.images.length > 0 && Array.from(form.images).map((file, i) => (
                      <div key={i} className="relative border border-cyan-500/30 p-1 rounded-lg bg-cyan-500/5">
                        <div className="w-20 h-20 flex items-center justify-center text-[10px] text-center text-cyan-400 p-1 break-all font-mono leading-tight">
                          {file.name}
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setForm(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))}
                          className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full p-1 shadow-lg"
                        >
                          <X className="h-3 w-3"/>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {!editProductId && (
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-fuchsia-500/10 transition-all"></div>
                    <h3 className="text-xs font-bold text-fuchsia-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <Hash className="h-4 w-4" /> Initial Inventory Tracking
                    </h3>
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer group/label">
                        <input type="radio" checked={serialMethod === "manual"} onChange={() => setSerialMethod("manual")} className="accent-fuchsia-500" />
                        <span className="text-xs font-medium text-slate-300 group-hover/label:text-fuchsia-400 transition-colors">Manual Entry</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group/label">
                        <input type="radio" checked={serialMethod === "excel"} onChange={() => setSerialMethod("excel")} className="accent-fuchsia-500" />
                        <span className="text-xs font-medium text-slate-300 group-hover/label:text-fuchsia-400 transition-colors">Excel Import</span>
                      </label>
                    </div>

                    {serialMethod === "manual" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <label className="text-xs font-bold text-slate-400">QUANTITY:</label>
                          <input
                            name="quantity"
                            type="number"
                            min="1"
                            className="w-24 px-3 py-1 bg-[#0f172a] border border-slate-700 rounded focus:border-fuchsia-500 outline-none text-slate-100"
                            value={form.quantity}
                            onChange={handleChange}
                          />
                        </div>
                        {Number(form.quantity) > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                            {Array.from({ length: Number(form.quantity) }).map((_, i) => (
                              <input
                                key={i}
                                placeholder={`SERIAL #${i + 1}`}
                                className="text-[10px] p-2 bg-slate-900 border border-slate-800 rounded font-mono uppercase focus:border-fuchsia-500 outline-none text-slate-300"
                                value={form.serials[i] || ""}
                                onChange={(e) => handleSerialChange(i, e.target.value)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-4 border border-dashed border-slate-700 rounded-lg text-center hover:border-fuchsia-500/50 transition-all">
                          <input type="file" accept=".xlsx" onChange={handleExcelUpload} className="text-xs w-full text-slate-400 file:bg-fuchsia-500/10 file:border-0 file:text-fuchsia-400 file:px-4 file:py-1 file:rounded file:mr-4 file:font-bold file:uppercase file:text-[10px] cursor-pointer" />
                        </div>
                        {form.serials.length > 0 && <p className="text-[10px] font-bold text-lime-400 animate-pulse">{form.serials.length} SERIALS DETECTED FROM FILE.</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
              {editProductId && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-xs font-bold uppercase tracking-widest text-slate-300 transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={formLoading || imageCompressing || !form.name || !form.price || !form.category_id}
                className={`px-8 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  editProductId 
                  ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-500/20' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                } disabled:opacity-50 disabled:shadow-none`}
              >
                {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editProductId ? "Update Product" : "Save to Inventory"}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4"/> {error}
              </div>
            )}
          </form>
        </div>

        {/* Inventory Table */}
        <div className="bg-[#16161a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-200">
              <Package className="h-5 w-5 text-cyan-400" /> 
              Inventory Database
            </h2>
            <div className="text-[10px] font-mono text-slate-500 uppercase">System Status: Online</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-500">Product Detail</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-500">Price</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-500">Stock Status</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-500">Category</th>
                  <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedProducts.map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{product.name}</div>
                      <div className="text-[10px] text-slate-600 font-mono mt-1 tracking-tighter">REF# {product._id || product.id}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400">
                      <IndianRupee className="h-3 w-3 inline mb-0.5" /> 
                      {Number(product.price).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        product.quantity > 5 
                        ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {product.quantity} UNITS
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                        {categories.find(c => (c._id || c.id) === product.category_id)?.name || "UNCATEGORIZED"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openSerialModal(product)} 
                          className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                          title="Manage Serials"
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(product)} 
                          className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-fuchsia-500/50 hover:text-fuchsia-400 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleRemove(product)} 
                          className="p-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalProductPages > 1 && (
            <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Page {currentProductPage} of {totalProductPages}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentProductPage(p => Math.max(1, p - 1))} 
                  disabled={currentProductPage === 1}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-cyan-500/50 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setCurrentProductPage(p => Math.min(totalProductPages, p + 1))} 
                  disabled={currentProductPage === totalProductPages}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-cyan-500/50 disabled:opacity-20 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Neon Serial Modal */}
      {showSerialModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#16161a] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-[#0f172a] border-b border-cyan-500/20 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-cyan-400 tracking-tight">Manage Serial IDs</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">PRODUCT: {selectedProduct.name}</p>
              </div>
              <button onClick={closeSerialModal} className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-full transition-all">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar text-[12px]">
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

              <div className="border border-slate-800 rounded-xl bg-slate-900/30 p-5 shadow-inner">
                <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-widest text-[12px]">
                  <PlusCircle className="h-4 w-4 text-cyan-400"/> Batch Import Serials
                </h4>
                <div className="flex gap-4 mb-4 border-b border-slate-800 pb-2">
                  <button 
                    onClick={() => setSerialAddMethod("manual")} 
                    className={`pb-2 px-6 text-[11px] font-bold uppercase tracking-widest transition-all ${serialAddMethod === 'manual' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Manual
                  </button>
                  <button 
                    onClick={() => setSerialAddMethod("excel")} 
                    className={`pb-2 px-6 text-[11px] font-bold uppercase tracking-widest transition-all ${serialAddMethod === 'excel' ? 'border-b-2 border-fuchsia-400 text-fuchsia-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Excel
                  </button>
                </div>

                {serialAddMethod === "manual" ? (
                  <div className="space-y-4">
                    <textarea 
                      placeholder="ENTER SERIALS (ONE PER LINE)..." 
                      className="w-full p-4 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-cyan-500/50 outline-none text-xs font-mono h-24 text-cyan-100 placeholder:text-slate-700 transition-all shadow-inner" 
                      value={newSerials} 
                      onChange={(e) => setNewSerials(e.target.value)} 
                    />
                    <button 
                      onClick={handleAddNewSerials} 
                      className="w-full bg-cyan-600 hover:bg-cyan-500 py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                    >
                      Process Batch
                    </button>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center gap-4 bg-[#0a0a0c]/50 hover:border-fuchsia-500/30 transition-all">
                    <FileSpreadsheet className="h-12 w-12 text-slate-700" />
                    <input type="file" accept=".xlsx,.xls" onChange={handleExcelUploadForSerials} className="text-[10px] text-slate-500 file:bg-fuchsia-500/10 file:border-0 file:text-fuchsia-400 file:px-4 file:py-1 file:rounded file:mr-4 file:font-bold file:uppercase cursor-pointer" />
                    {bulkSerialPreview.length > 0 && (
                      <button 
                        onClick={confirmBulkAdd} 
                        className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-fuchsia-500/20 transition-all"
                      >
                        Import {bulkSerialPreview.length} IDs
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden text-[12px]">
                <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-2 h-4 w-4 text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="FILTER BY SERIAL ID..." 
                      className="pl-9 pr-4 py-1.5 bg-[#0a0a0c] border border-slate-800 rounded-lg text-[10px] font-bold tracking-widest outline-none focus:border-cyan-500/30 text-slate-300 w-64" 
                      value={serialSearch} 
                      onChange={e => setSerialSearch(e.target.value)} 
                    />
                  </div>
                  <button onClick={() => loadProductSerials(selectedProduct._id || selectedProduct.id)} className="p-1.5 hover:rotate-180 transition-all duration-700 text-slate-500 hover:text-cyan-400">
                    <RefreshCw className="h-4 w-4"/>
                  </button>
                </div>
                <div className="divide-y divide-slate-800/50 max-h-60 overflow-y-auto custom-scrollbar">
                  {paginatedSerials.map(serial => (
                    <div key={serial._id || serial.id} className="p-3 flex items-center justify-between hover:bg-cyan-500/[0.03] transition-colors">
                      <div className="font-mono text-xs font-bold text-slate-300 tracking-tighter">{serial.serial}</div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                          serial.status === 'registered' 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                          : 'bg-lime-500/10 text-lime-400 border border-lime-500/20'
                        }`}>
                          {serial.status === 'registered' ? 'ASSIGNED' : 'READY'}
                        </span>
                        {serial.status !== 'registered' && (
                          <button onClick={() => handleDeleteSerial(serial._id || serial.id, serial.serial)} className="text-slate-600 hover:text-rose-500 p-1 rounded transition-colors">
                            <Trash className="h-3.5 w-3.5"/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {paginatedSerials.length === 0 && (
                    <div className="p-8 text-center text-slate-600 text-xs uppercase tracking-widest font-bold italic">No matching records</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[#0a0a0c] border-t border-slate-800 flex justify-end">
              <button 
                onClick={closeSerialModal} 
                className="px-8 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        
        .neon-pulse { animation: neonPulse 2s infinite alternate; }
        @keyframes neonPulse {
          from { text-shadow: 0 0 5px rgba(6,182,212,0.2); }
          to { text-shadow: 0 0 15px rgba(6,182,212,0.6); }
        }
      `}</style>
    </div>
  );
}
