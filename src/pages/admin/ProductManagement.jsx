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
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [serialStats, setSerialStats] = useState({});
  const [serialLoading, setSerialLoading] = useState(false);
  const [newSerials, setNewSerials] = useState("");
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
    const newSerials = [...form.serials];
    newSerials[index] = value.trim().toUpperCase();
    setForm((prev) => ({ ...prev, serials: newSerials }));
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
      setForm((prev) => ({ ...prev, quantity: serials.length, serials }));
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
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true, fileType: "image/webp" };
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
    setEditProductId(product.id);
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

  const handleRemove = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId, token);
        await loadData();
      } catch (err) {
        setError("Failed to delete product.");
      }
    }
  };

  const openSerialModal = async (product) => {
    setSelectedProduct(product);
    setShowSerialModal(true);
    await loadProductSerials(product.id);
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
      await addProductSerials(selectedProduct.id, serialArray, token);
      setNewSerials("");
      await loadProductSerials(selectedProduct.id);
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
      await addProductSerials(selectedProduct.id, bulkSerialPreview, token);
      setBulkSerialPreview([]);
      await loadProductSerials(selectedProduct.id);
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
      await updateProductSerial(selectedProduct.id, serialId, newSerial, token);
      setEditingSerial(null);
      await loadProductSerials(selectedProduct.id);
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
        await deleteProductSerial(selectedProduct.id, serialId, token);
        await loadProductSerials(selectedProduct.id);
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
      <div className="flex items-center justify-center min-h-screen bg-[#f0f2f2]">
        <div className="flex flex-col items-center p-8 bg-white rounded shadow-md">
          <Loader2 className="h-10 w-10 text-[#e77600] animate-spin" />
          <p className="text-xl font-bold text-[#0f1111] mt-4">Loading Inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f2] font-sans text-[#0f1111] p-4 sm:p-6 animate-fade-in">
      {/* Amazon-style Admin Header */}
      <div className="bg-[#131921] text-white p-4 -mx-4 -mt-4 mb-8 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ffd814] rounded shadow">
            <Package className="h-6 w-6 text-[#131921]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Amazon Admin | Product Management</h1>
            <p className="text-xs text-gray-400">Manage your inventory and serial numbers</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-[#ffd814]">{products.length}</div>
            <div className="text-[10px] uppercase">Products</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-[#ffd814]">{categories.length}</div>
            <div className="text-[10px] uppercase">Categories</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Form Section */}
        <div ref={formRef} className="bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
          <div className="bg-[#f0f2f2] border-b border-gray-300 px-6 py-3 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[#0f1111]">
              {editProductId ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editProductId ? "Edit Product Details" : "Add a New Product"}
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-bold">Product Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none"
                    value={form.name}
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold flex items-center gap-1"><IndianRupee className="h-3 w-3" /> Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none"
                    value={form.price}
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Category</label>
                  <select
                    name="category_id"
                    required
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-[#f0f2f2] focus:border-[#e77600] outline-none"
                    value={form.category_id}
                    onChange={handleChange}
                    disabled={formLoading}
                  >
                    <option value="">Choose a Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold">Subcategory</label>
                  <select
                    name="subcategory_id"
                    className="w-full px-3 py-2 border border-gray-400 rounded bg-[#f0f2f2] focus:border-[#e77600] outline-none disabled:opacity-50"
                    value={form.subcategory_id}
                    onChange={handleChange}
                    disabled={formLoading || !form.category_id}
                  >
                    <option value="">Optional</option>
                    {subcategories
                      .filter((sc) => String(sc.category_id) === String(form.category_id))
                      .map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-bold">Description</label>
                  <textarea
                    name="description"
                    rows="3"
                    required
                    className="w-full px-3 py-2 border border-gray-400 rounded focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none"
                    value={form.description}
                    onChange={handleChange}
                    disabled={formLoading}
                  />
                </div>
              </div>

              {/* Images Section */}
              <div className="border border-gray-300 rounded p-4 bg-[#fcfcfc]">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#e77600]" />
                  Product Images
                </h3>
                <div className="flex flex-wrap gap-4">
                  {editProductId && existingImages.map((img, i) => (
                    <div key={i} className="relative border p-1 rounded">
                      <img src={img.url} className="w-20 h-20 object-cover" alt="Existing" />
                      <button type="button" onClick={() => setExistingImages(prev => prev.filter(x => x.id !== img.id))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"><X className="h-3 w-3"/></button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-[10px] text-gray-500">Upload</span>
                    <input name="images" type="file" multiple hidden accept="image/*" onChange={handleChange} />
                  </label>
                  {form.images.length > 0 && Array.from(form.images).map((file, i) => (
                    <div key={i} className="relative border p-1 rounded bg-green-50">
                      <div className="w-20 h-20 flex items-center justify-center text-xs text-center text-gray-500 p-1 break-all">{file.name}</div>
                      <button type="button" onClick={() => setForm(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))} className="absolute -top-2 -right-2 bg-gray-600 text-white rounded-full p-1"><X className="h-3 w-3"/></button>
                    </div>
                  ))}
                </div>
              </div>

              {!editProductId && (
                <div className="border border-gray-300 rounded p-4 bg-[#fff9f3]">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[#c45500]">
                    <Hash className="h-4 w-4" /> Initial Inventory Tracking
                  </h3>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={serialMethod === "manual"} onChange={() => setSerialMethod("manual")} className="accent-[#e77600]" />
                      <span className="text-sm">Manual Serial Entry</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={serialMethod === "excel"} onChange={() => setSerialMethod("excel")} className="accent-[#e77600]" />
                      <span className="text-sm">Excel Import</span>
                    </label>
                  </div>
                  {serialMethod === "manual" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-bold">Quantity:</label>
                        <input name="quantity" type="number" min="1" className="w-24 px-3 py-1 border border-gray-400 rounded focus:border-[#e77600] outline-none" value={form.quantity} onChange={handleChange} />
                      </div>
                      {Number(form.quantity) > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                          {Array.from({ length: Number(form.quantity) }).map((_, i) => (
                            <input key={i} placeholder={`Serial #${i + 1}`} className="text-xs p-2 border border-gray-300 rounded font-mono uppercase" value={form.serials[i] || ""} onChange={(e) => handleSerialChange(i, e.target.value)} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input type="file" accept=".xlsx" onChange={handleExcelUpload} className="text-sm" />
                      {form.serials.length > 0 && <p className="text-xs text-green-700">{form.serials.length} serials detected from file.</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {editProductId && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-white border border-gray-400 rounded shadow-sm hover:bg-gray-100 text-sm font-medium">
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formLoading || imageCompressing || !form.name || !form.price || !form.category_id}
                  className="px-6 py-2 bg-[#ffd814] border border-[#fcd200] rounded shadow-sm hover:bg-[#f7ca00] text-[#0f1111] font-bold text-sm min-w-[120px] flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editProductId ? "Update Item" : "Add to Inventory"}
                </button>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4"/> {error}</div>}
            </form>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
          <div className="bg-[#f0f2f2] border-b border-gray-300 px-6 py-4">
            <h2 className="text-lg font-bold text-[#0f1111] flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              Manage Inventory
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f0f2f2] border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 font-bold uppercase text-[11px] tracking-wider text-gray-600">Product Detail</th>
                  <th className="px-6 py-3 font-bold uppercase text-[11px] tracking-wider text-gray-600">Price</th>
                  <th className="px-6 py-3 font-bold uppercase text-[11px] tracking-wider text-gray-600">In Stock</th>
                  <th className="px-6 py-3 font-bold uppercase text-[11px] tracking-wider text-gray-600">Category</th>
                  <th className="px-6 py-3 font-bold uppercase text-[11px] tracking-wider text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#007185] group-hover:underline cursor-pointer">{product.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">ID: {product.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium"><IndianRupee className="h-3 w-3 inline mb-0.5" /> {Number(product.price).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${product.quantity > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {categories.find(c => c.id === product.category_id)?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openSerialModal(product)} className="p-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-gray-700" title="Manage Serials">
                          <Settings2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleEdit(product)} className="p-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 text-[#007185]" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleRemove(product.id)} className="p-1.5 bg-gray-100 border border-gray-300 rounded hover:bg-red-100 text-red-600" title="Delete">
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
            <div className="px-6 py-3 bg-[#f0f2f2] border-t border-gray-300 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Page {currentProductPage} of {totalProductPages}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setCurrentProductPage(p => Math.max(1, p - 1))} disabled={currentProductPage === 1} className="p-1 border border-gray-400 rounded bg-white disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setCurrentProductPage(p => Math.min(totalProductPages, p + 1))} disabled={currentProductPage === totalProductPages} className="p-1 border border-gray-400 rounded bg-white disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Serial Numbers Management Modal - Redesigned to Amazon Style */}
      {showSerialModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-300">
            <div className="bg-[#131921] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Serial Number Management</h3>
                <p className="text-xs text-gray-400">{selectedProduct.name}</p>
              </div>
              <button onClick={closeSerialModal} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-[#fcfcfc]">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border-2 border-l-4 border-l-[#007185] p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500 font-bold uppercase">Total Serials</div>
                  <div className="text-2xl font-bold">{serialStats.total_serials || 0}</div>
                </div>
                <div className="bg-white border-2 border-l-4 border-l-green-600 p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500 font-bold uppercase">Available</div>
                  <div className="text-2xl font-bold text-green-700">{serialStats.available_serials || 0}</div>
                </div>
                <div className="bg-white border-2 border-l-4 border-l-[#c45500] p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500 font-bold uppercase">Registered</div>
                  <div className="text-2xl font-bold text-[#c45500]">{serialStats.used_serials || 0}</div>
                </div>
              </div>

              <div className="border border-gray-300 rounded bg-white p-4 mb-6">
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><PlusCircle className="h-4 w-4 text-green-600"/> Import More Serials</h4>
                <div className="flex gap-4 mb-4 border-b pb-2 text-sm">
                  <button onClick={() => setSerialAddMethod("manual")} className={`pb-2 px-4 transition-all ${serialAddMethod === 'manual' ? 'border-b-2 border-[#e77600] text-[#c45500] font-bold' : 'text-gray-500'}`}>Manual Entry</button>
                  <button onClick={() => setSerialAddMethod("excel")} className={`pb-2 px-4 transition-all ${serialAddMethod === 'excel' ? 'border-b-2 border-[#e77600] text-[#c45500] font-bold' : 'text-gray-500'}`}>Excel Upload</button>
                </div>

                {serialAddMethod === "manual" ? (
                  <div className="flex flex-col gap-3">
                    <textarea 
                      placeholder="One serial per line..." 
                      className="w-full p-3 border border-gray-400 rounded focus:border-[#e77600] outline-none text-sm font-mono h-24"
                      value={newSerials}
                      onChange={(e) => setNewSerials(e.target.value)}
                    />
                    <button onClick={handleAddNewSerials} className="bg-[#ffd814] border border-[#fcd200] px-6 py-2 rounded text-sm font-bold shadow-sm hover:bg-[#f7ca00]">
                      Add to Database
                    </button>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-gray-200 rounded flex flex-col items-center justify-center gap-4">
                    <FileSpreadsheet className="h-12 w-12 text-gray-300" />
                    <input type="file" accept=".xlsx,.xls" onChange={handleExcelUploadForSerials} className="text-xs" />
                    {bulkSerialPreview.length > 0 && (
                      <button onClick={confirmBulkAdd} className="bg-[#131921] text-white px-8 py-2 rounded font-bold hover:bg-[#232f3e] transition-colors">
                        Import {bulkSerialPreview.length} Serials
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-300 rounded overflow-hidden">
                <div className="p-3 bg-[#f0f2f2] border-b flex items-center justify-between">
                  <div className="relative">
                    <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                    <input type="text" placeholder="Filter list..." className="pl-9 pr-3 py-1 border border-gray-400 rounded text-xs outline-none focus:border-[#e77600]" value={serialSearch} onChange={e => setSerialSearch(e.target.value)} />
                  </div>
                  <button onClick={() => loadProductSerials(selectedProduct.id)} className="p-1 hover:rotate-180 transition-all duration-500"><RefreshCw className="h-4 w-4 text-gray-500"/></button>
                </div>
                <div className="divide-y divide-gray-100">
                  {paginatedSerials.map(serial => (
                    <div key={serial.id} className="p-3 flex items-center justify-between hover:bg-gray-50 text-xs">
                      <div className="font-mono font-medium">{serial.serial}</div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${serial.status === 'registered' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          {serial.status === 'registered' ? 'REGISTERED' : 'AVAILABLE'}
                        </span>
                        {serial.status !== 'registered' && (
                          <button onClick={() => handleDeleteSerial(serial.id, serial.serial)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash className="h-3.5 w-3.5"/></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#f0f2f2] border-t border-gray-300 flex justify-end">
              <button onClick={closeSerialModal} className="bg-[#131921] text-white px-8 py-2 rounded font-bold hover:bg-[#232f3e]">Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #adb1b8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #888c91; }
      `}</style>
    </div>
  );
}
