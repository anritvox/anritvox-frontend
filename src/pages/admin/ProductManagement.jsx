// import React, { useState, useEffect, useRef } from "react";
// import imageCompression from "browser-image-compression";
// import * as XLSX from "xlsx";
// import {
//   fetchProductsAdmin,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   fetchCategories,
//   fetchSubcategories,
// } from "../../services/api";
// import {
//   Package,
//   Edit3,
//   Trash2,
//   Upload,
//   FileSpreadsheet,
//   Plus,
//   Save,
//   X,
//   Loader2,
//   Image as ImageIcon,
//   Tag,
//   DollarSign,
//   Hash,
//   AlertCircle,
//   CheckCircle2,
//   Folder,
//   Grid3X3,
// } from "lucide-react";

// export default function ProductManagement({ token }) {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [subcategories, setSubcategories] = useState([]);
//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//     price: "",
//     quantity: "",
//     category_id: "",
//     subcategory_id: "",
//     images: [],
//     serials: [],
//   });
//   const [loading, setLoading] = useState(true);
//   const [formLoading, setFormLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [editProductId, setEditProductId] = useState(null);
//   const [serialMethod, setSerialMethod] = useState("manual");
//   const [fileError, setFileError] = useState("");
//   const formRef = useRef(null);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [prodData, catData, subData] = await Promise.all([
//         fetchProductsAdmin(token),
//         fetchCategories(token),
//         fetchSubcategories(token),
//       ]);
//       setProducts(prodData);
//       setCategories(catData);
//       setSubcategories(subData);
//     } catch (e) {
//       setError("Failed to load data. Please refresh the page.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) loadData();
//   }, [token]);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "images") {
//       const allowed = ["image/jpeg", "image/png", "image/webp"];
//       for (let file of files) {
//         if (!allowed.includes(file.type)) {
//           alert(
//             `Invalid image format: ${file.name}. Only JPEG, PNG, and WEBP allowed.`
//           );
//           return;
//         }
//       }
//       setForm((prev) => ({ ...prev, images: files }));
//     } else if (name === "quantity") {
//       const qty = Math.max(0, Number(value));
//       setForm((prev) => ({
//         ...prev,
//         quantity: String(qty),
//         serials: Array(qty).fill(""),
//       }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSerialChange = (index, value) => {
//     const newSerials = [...form.serials];
//     newSerials[index] = value.trim().toUpperCase();
//     setForm((prev) => ({ ...prev, serials: newSerials }));
//   };

//   const handleExcelUpload = async (e) => {
//     setFileError("");
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (!file.name.endsWith(".xlsx")) {
//       setFileError("Invalid file type. Please upload a .xlsx file.");
//       return;
//     }
//     try {
//       const data = await file.arrayBuffer();
//       const workbook = XLSX.read(data, { type: "array" });
//       const sheet = workbook.Sheets[workbook.SheetNames[0]];
//       const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
//       const serials = rows
//         .map((row) => row[0])
//         .filter((val) => val != null && String(val).trim() !== "")
//         .map((s) => String(s).trim().toUpperCase());
//       const invalidChars = serials.filter((s) => !/^[A-Z0-9-]+$/.test(s));
//       if (invalidChars.length > 0) {
//         setFileError(
//           `Invalid serials (only A-Z, 0-9, - allowed): ${[
//             ...new Set(invalidChars),
//           ].join(", ")}`
//         );
//         return;
//       }
//       const duplicates = serials.filter((s, i) => serials.indexOf(s) !== i);
//       if (duplicates.length > 0) {
//         setFileError(
//           `Duplicate serials found: ${[...new Set(duplicates)].join(", ")}`
//         );
//         return;
//       }
//       setForm((prev) => ({ ...prev, quantity: serials.length, serials }));
//     } catch (err) {
//       setFileError("An error occurred while reading the Excel file.");
//     } finally {
//       e.target.value = "";
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       name: "",
//       description: "",
//       price: "",
//       quantity: "",
//       category_id: "",
//       subcategory_id: "",
//       images: [],
//       serials: [],
//     });
//     setEditProductId(null);
//     setSerialMethod("manual");
//     setFileError("");
//     setError(null);
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     setFormLoading(true);
//     setError(null);
//     try {
//       if (
//         Number(form.quantity) !== form.serials.length ||
//         form.serials.some((s) => !s)
//       ) {
//         throw new Error(
//           `Please ensure all ${form.quantity} serial number fields are filled.`
//         );
//       }
//       const compressedImages = await Promise.all(
//         Array.from(form.images).map(async (file) => {
//           const options = {
//             maxSizeMB: 1,
//             maxWidthOrHeight: 1280,
//             useWebWorker: true,
//             fileType: "image/webp",
//           };
//           const compressedFile = await imageCompression(file, options);
//           return new File(
//             [compressedFile],
//             file.name.replace(/\.\w+$/, ".webp"),
//             { type: "image/webp" }
//           );
//         })
//       );
//       const formData = new FormData();
//       Object.keys(form).forEach((key) => {
//         if (key !== "images" && key !== "serials")
//           formData.append(key, form[key]);
//       });
//       formData.append("serials", JSON.stringify(form.serials));
//       compressedImages.forEach((image) => formData.append("images", image));
//       if (editProductId) {
//         await updateProduct(editProductId, formData, token);
//       } else {
//         await createProduct(formData, token);
//       }
//       resetForm();
//       await loadData();
//     } catch (err) {
//       setError(err.message || "An unexpected error occurred.");
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleEdit = (product) => {
//     setEditProductId(product.id);
//     setForm({
//       name: product.name,
//       description: product.description,
//       price: product.price,
//       quantity: String(product.quantity),
//       category_id: product.category_id || "",
//       subcategory_id: product.subcategory_id || "",
//       images: [],
//       serials: Array.isArray(product.serials) ? product.serials : [],
//     });
//     setSerialMethod("manual");
//     setFileError("");
//     setError(null);
//     formRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleRemove = async (productId) => {
//     if (
//       window.confirm(
//         "Are you sure you want to delete this product? This action cannot be undone."
//       )
//     ) {
//       try {
//         await deleteProduct(productId, token);
//         await loadData();
//       } catch (err) {
//         setError(
//           "Failed to delete product. It might be linked to other records."
//         );
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="flex flex-col items-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200">
//           <div className="relative">
//             <Loader2 className="h-16 w-16 text-lime-600 animate-spin" />
//             <div className="absolute inset-0 h-16 w-16 border-4 border-lime-200 rounded-full animate-ping"></div>
//           </div>
//           <p className="text-2xl font-bold text-gray-700 mt-6 animate-pulse">
//             Loading Product Data...
//           </p>
//           <p className="text-gray-500 mt-2">Fetching inventory information</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 animate-fade-in-up">
//       {/* Header Section */}
//       <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-3xl p-8 border border-lime-200/50 shadow-xl">
//         <div className="text-center">
//           <div className="mx-auto h-16 w-16 bg-gradient-to-r from-lime-600 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
//             <Package className="h-8 w-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-black bg-gradient-to-r from-lime-700 to-green-700 bg-clip-text text-transparent mb-4">
//             Product Management
//           </h1>
//           <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
//               <span>Total Products: {products.length}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//               <span>Categories: {categories.length}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Product Form */}
//       <div
//         ref={formRef}
//         className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
//       >
//         <div className="bg-gradient-to-r from-lime-600 to-green-600 p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
//                 {editProductId ? (
//                   <Edit3 className="h-6 w-6 text-white" />
//                 ) : (
//                   <Plus className="h-6 w-6 text-white" />
//                 )}
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-white">
//                   {editProductId ? "Edit Product" : "Add New Product"}
//                 </h2>
//                 <p className="text-lime-100">
//                   {editProductId
//                     ? `Editing product ID: ${editProductId}`
//                     : "Create a new product with inventory tracking"}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
//               {serialMethod === "manual" ? (
//                 <Hash className="h-4 w-4 text-white" />
//               ) : (
//                 <FileSpreadsheet className="h-4 w-4 text-white" />
//               )}
//               <span className="text-sm font-medium text-white">
//                 {serialMethod === "manual" ? "Manual Entry" : "Excel Entry"}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="p-8">
//           <form onSubmit={handleSave} className="space-y-8">
//             {/* Basic Information */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Tag className="h-4 w-4 text-lime-600" />
//                   Product Name
//                 </label>
//                 <div className="relative group">
//                   <input
//                     name="name"
//                     type="text"
//                     required
//                     placeholder="e.g., Wireless Mouse"
//                     className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
//                     value={form.name}
//                     onChange={handleChange}
//                     disabled={formLoading}
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lime-600/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10"></div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <DollarSign className="h-4 w-4 text-lime-600" />
//                   Price ($)
//                 </label>
//                 <div className="relative group">
//                   <input
//                     name="price"
//                     type="number"
//                     step="0.01"
//                     required
//                     placeholder="e.g., 49.99"
//                     className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
//                     value={form.price}
//                     onChange={handleChange}
//                     disabled={formLoading}
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Folder className="h-4 w-4 text-lime-600" />
//                   Category
//                 </label>
//                 <select
//                   name="category_id"
//                   required
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
//                   value={form.category_id}
//                   onChange={handleChange}
//                   disabled={formLoading}
//                 >
//                   <option value="">Select a Category</option>
//                   {categories.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <Grid3X3 className="h-4 w-4 text-lime-600" />
//                   Subcategory (Optional)
//                 </label>
//                 <select
//                   name="subcategory_id"
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer"
//                   value={form.subcategory_id}
//                   onChange={handleChange}
//                   disabled={formLoading || !form.category_id}
//                 >
//                   <option value="">Select a Subcategory</option>
//                   {subcategories
//                     .filter(
//                       (sc) =>
//                         String(sc.category_id) === String(form.category_id)
//                     )
//                     .map((sc) => (
//                       <option key={sc.id} value={sc.id}>
//                         {sc.name}
//                       </option>
//                     ))}
//                 </select>
//               </div>

//               <div className="lg:col-span-2 space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   rows="4"
//                   required
//                   placeholder="Detailed product description..."
//                   className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none"
//                   value={form.description}
//                   onChange={handleChange}
//                   disabled={formLoading}
//                 />
//               </div>

//               <div className="lg:col-span-2 space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                   <ImageIcon className="h-4 w-4 text-lime-600" />
//                   Product Images
//                 </label>
//                 <div className="relative">
//                   <input
//                     name="images"
//                     type="file"
//                     multiple
//                     onChange={handleChange}
//                     accept="image/jpeg,image/png,image/webp"
//                     disabled={formLoading}
//                     className="hidden"
//                     id="image-upload"
//                   />
//                   <label
//                     htmlFor="image-upload"
//                     className="flex items-center justify-center w-full p-6 border-2 border-dashed border-lime-300 rounded-xl cursor-pointer hover:border-lime-500 hover:bg-lime-50 transition-all duration-300 group"
//                   >
//                     <div className="text-center">
//                       <Upload className="h-8 w-8 text-lime-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
//                       <p className="text-sm font-medium text-gray-700">
//                         Click to upload images
//                       </p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         JPG, PNG, WEBP supported
//                       </p>
//                     </div>
//                   </label>
//                 </div>
//                 <p className="text-xs text-gray-500">
//                   Multiple images allowed. New images replace existing ones on
//                   update.
//                 </p>
//               </div>
//             </div>

//             {/* Serial Number Section */}
//             <div className="bg-gradient-to-r from-gray-50 to-lime-50 rounded-2xl p-6 border border-lime-200">
//               <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//                 <Hash className="h-5 w-5 text-lime-600" />
//                 Inventory & Serial Numbers
//               </h3>

//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 {["manual", "excel"].map((method) => (
//                   <label
//                     key={method}
//                     className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
//                       serialMethod === method
//                         ? "border-lime-500 bg-lime-100 text-lime-700"
//                         : "border-gray-200 bg-white text-gray-600 hover:border-lime-300"
//                     }`}
//                   >
//                     <input
//                       type="radio"
//                       name="serialMethod"
//                       value={method}
//                       checked={serialMethod === method}
//                       onChange={() => setSerialMethod(method)}
//                       className="sr-only"
//                     />
//                     <div className="flex items-center gap-2">
//                       {method === "manual" ? (
//                         <Hash className="h-4 w-4" />
//                       ) : (
//                         <FileSpreadsheet className="h-4 w-4" />
//                       )}
//                       <span className="font-medium capitalize">
//                         {method} Entry
//                       </span>
//                     </div>
//                   </label>
//                 ))}
//               </div>

//               {serialMethod === "manual" ? (
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <label className="block text-sm font-semibold text-gray-700">
//                       Quantity
//                     </label>
//                     <input
//                       name="quantity"
//                       type="number"
//                       min="0"
//                       required
//                       placeholder="e.g., 10"
//                       className="w-full max-w-xs p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
//                       value={form.quantity}
//                       onChange={handleChange}
//                       disabled={formLoading}
//                     />
//                   </div>

//                   {Number(form.quantity) > 0 && (
//                     <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 space-y-4 max-h-96 overflow-y-auto">
//                       <h4 className="font-bold text-gray-700 flex items-center gap-2">
//                         <Hash className="h-4 w-4 text-lime-600" />
//                         Enter Serial Numbers ({form.serials.length})
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {Array.from({ length: Number(form.quantity) }).map(
//                           (_, i) => (
//                             <input
//                               key={i}
//                               placeholder={`Serial #${i + 1}`}
//                               required
//                               className="p-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300"
//                               value={form.serials[i] || ""}
//                               onChange={(e) =>
//                                 handleSerialChange(i, e.target.value)
//                               }
//                               disabled={formLoading}
//                             />
//                           )
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   <div className="space-y-2">
//                     <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
//                       <FileSpreadsheet className="h-4 w-4 text-lime-600" />
//                       Upload Excel File
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="file"
//                         accept=".xlsx"
//                         onChange={handleExcelUpload}
//                         disabled={formLoading}
//                         className="hidden"
//                         id="excel-upload"
//                       />
//                       <label
//                         htmlFor="excel-upload"
//                         className="flex items-center justify-center w-full p-6 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
//                       >
//                         <div className="text-center">
//                           <FileSpreadsheet className="h-8 w-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
//                           <p className="text-sm font-medium text-gray-700">
//                             Click to upload Excel file
//                           </p>
//                           <p className="text-xs text-gray-500 mt-1">
//                             Serial numbers in first column
//                           </p>
//                         </div>
//                       </label>
//                     </div>
//                   </div>

//                   {fileError && (
//                     <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
//                       <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                       <p className="text-sm text-red-700">{fileError}</p>
//                     </div>
//                   )}

//                   {form.serials.length > 0 && !fileError && (
//                     <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
//                       <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
//                       <p className="text-sm text-green-700">
//                         {form.serials.length} serials loaded successfully.
//                         Quantity set to {form.quantity}.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Form Actions */}
//             <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
//               {editProductId && (
//                 <button
//                   type="button"
//                   onClick={resetForm}
//                   disabled={formLoading}
//                   className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
//                 >
//                   <X className="h-5 w-5" />
//                   Cancel Edit
//                 </button>
//               )}

//               <button
//                 type="submit"
//                 disabled={
//                   formLoading ||
//                   !form.name ||
//                   !form.price ||
//                   !form.category_id ||
//                   form.quantity <= 0
//                 }
//                 className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
//               >
//                 <div className="absolute inset-0 bg-gradient-to-r from-lime-700 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
//                 {formLoading ? (
//                   <>
//                     <Loader2 className="h-5 w-5 animate-spin relative z-10" />
//                     <span className="relative z-10">Saving...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-5 w-5 relative z-10" />
//                     <span className="relative z-10">
//                       {editProductId ? "Update Product" : "Add Product"}
//                     </span>
//                   </>
//                 )}
//               </button>
//             </div>

//             {error && (
//               <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
//                 <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}
//           </form>
//         </div>
//       </div>

//       {/* Products Table */}
//       <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
//         <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
//               <Package className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-white">
//                 Product Inventory
//               </h2>
//               <p className="text-green-100">
//                 All products and their quantities in stock
//               </p>
//             </div>
//           </div>
//         </div>

//         {products.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Package className="h-12 w-12 text-gray-400" />
//             </div>
//             <p className="text-xl font-semibold text-gray-600 mb-2">
//               No products found
//             </p>
//             <p className="text-gray-400">
//               Add your first product using the form above
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
//                 <tr>
//                   {[
//                     { name: "Product Name", icon: Tag },
//                     { name: "Price", icon: DollarSign },
//                     { name: "Quantity", icon: Hash },
//                     { name: "Category", icon: Folder },
//                     { name: "Actions", icon: null },
//                   ].map((h) => (
//                     <th
//                       key={h.name}
//                       className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
//                     >
//                       <div className="flex items-center gap-2">
//                         {h.icon && <h.icon className="h-4 w-4 text-gray-500" />}
//                         {h.name}
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-100">
//                 {products.map((product, index) => (
//                   <tr
//                     key={product.id}
//                     className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
//                     style={{ animationDelay: `${index * 50}ms` }}
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
//                           {product.name.charAt(0).toUpperCase()}
//                         </div>
//                         <div>
//                           <div className="font-semibold text-gray-900">
//                             {product.name}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             ID: {product.id}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <DollarSign className="h-4 w-4 text-gray-400" />
//                         <span className="font-medium text-gray-900">
//                           {Number(product.price).toFixed(2)}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center justify-center">
//                         <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
//                           {product.quantity}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <Folder className="h-4 w-4 text-gray-400" />
//                         <span className="text-gray-700">
//                           {categories.find((c) => c.id === product.category_id)
//                             ?.name || "N/A"}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleEdit(product)}
//                           className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
//                         >
//                           <Edit3 className="h-4 w-4" />
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => handleRemove(product.id)}
//                           className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Enhanced Custom Styles */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

//         .font-inter {
//           font-family: 'Inter', sans-serif;
//         }

//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fade-in-up {
//           animation: fadeInUp 0.8s ease-out forwards;
//         }

//         /* Custom scrollbar */
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
//         ::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
//         ::-webkit-scrollbar-thumb {
//           background: #84cc16;
//           border-radius: 10px;
//         }
//         ::-webkit-scrollbar-thumb:hover {
//           background: #65a30d;
//         }
//       `}</style>
//     </div>
//   );
// }
////////////////////////New updateed version//////////////
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
  checkSerialAvailability,
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
  Grid3X3,
  Eye,
  Settings2,
  Download,
  Copy,
  Search,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  Camera,
  Trash,
  Info,
} from "lucide-react";

export default function ProductManagement({ token }) {
  // Core state management
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

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [imageCompressing, setImageCompressing] = useState(false);
  const [error, setError] = useState(null);

  // Form control states
  const [editProductId, setEditProductId] = useState(null);
  const [serialMethod, setSerialMethod] = useState("manual");
  const [fileError, setFileError] = useState("");

  // Product pagination states
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [productsPerPage] = useState(10);

  // Serial management modal states
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

  // Computed pagination values
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

  // Data loading and initialization
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

  // Serial management data loading
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

  // Form input handling with validation
  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      const fileList = Array.from(files);

      // File type validation
      const invalidFiles = fileList.filter(
        (file) => !allowed.includes(file.type)
      );
      if (invalidFiles.length > 0) {
        alert(
          `Invalid image formats: ${invalidFiles
            .map((f) => f.name)
            .join(", ")}. Only JPEG, PNG, and WEBP are allowed.`
        );
        e.target.value = "";
        return;
      }

      // File size validation (10MB max per file)
      const oversizedFiles = fileList.filter(
        (file) => file.size > 10 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        alert(
          `Files too large: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}. Maximum 10MB per file.`
        );
        e.target.value = "";
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

  // Image management functions
  const removeSelectedImage = (indexToRemove) => {
    const newImages = Array.from(form.images).filter(
      (_, index) => index !== indexToRemove
    );
    setForm((prev) => ({ ...prev, images: newImages }));
  };

  const removeExistingImage = async (imageId, imagePath) => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    try {
      // Note: Backend endpoint for image deletion to be implemented
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      console.log("Image removal - implement backend endpoint for:", {
        imageId,
        imagePath,
      });
    } catch (error) {
      setError("Failed to remove image. Please try again.");
    }
  };

  // Serial number input handling
  const handleSerialChange = (index, value) => {
    const newSerials = [...form.serials];
    newSerials[index] = value.trim().toUpperCase();
    setForm((prev) => ({ ...prev, serials: newSerials }));
  };

  // Excel file processing for initial product creation
  const handleExcelUpload = async (e) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".xlsx")) {
      setFileError("Invalid file type. Please upload a .xlsx file.");
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
      const invalidChars = serials.filter((s) => !/^[A-Z0-9-]+$/.test(s));
      if (invalidChars.length > 0) {
        setFileError(
          `Invalid serials (only A-Z, 0-9, - allowed): ${[
            ...new Set(invalidChars),
          ].join(", ")}`
        );
        return;
      }
      const duplicates = serials.filter((s, i) => serials.indexOf(s) !== i);
      if (duplicates.length > 0) {
        setFileError(
          `Duplicate serials found: ${[...new Set(duplicates)].join(", ")}`
        );
        return;
      }
      setForm((prev) => ({ ...prev, quantity: serials.length, serials }));
    } catch (err) {
      setFileError("An error occurred while reading the Excel file.");
    } finally {
      e.target.value = "";
    }
  };

  // Form reset and cleanup
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

    // Clear file inputs
    const imageInput = document.getElementById("image-upload");
    const excelInput = document.getElementById("excel-upload");
    if (imageInput) imageInput.value = "";
    if (excelInput) excelInput.value = "";
  };

  // Image compression with progress tracking
  const compressImages = async (imageFiles) => {
    setImageCompressing(true);
    try {
      const compressedImages = await Promise.all(
        imageFiles.map(async (file, index) => {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            fileType: "image/webp",
            onProgress: (progress) => {
              console.log(
                `Compressing image ${index + 1}: ${Math.round(progress)}%`
              );
            },
          };
          const compressedFile = await imageCompression(file, options);
          return new File(
            [compressedFile],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: "image/webp" }
          );
        })
      );
      return compressedImages;
    } finally {
      setImageCompressing(false);
    }
  };

  // Form validation before submission
  const validateForm = () => {
    const errors = [];

    if (!form.name.trim()) errors.push("Product name is required");
    if (!form.description.trim()) errors.push("Description is required");
    if (!form.price || Number(form.price) <= 0)
      errors.push("Valid price is required");
    if (!form.category_id) errors.push("Category is required");

    // Serial validation only for new products
    if (!editProductId) {
      if (!form.quantity || Number(form.quantity) <= 0) {
        errors.push("Initial quantity is required for new products");
      }
      if (
        Number(form.quantity) !== form.serials.length ||
        form.serials.some((s) => !s.trim())
      ) {
        errors.push(
          `Please ensure all ${form.quantity} serial number fields are filled`
        );
      }
    }

    return errors;
  };

  // Product form submission handler
  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    try {
      // Form validation
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(". "));
      }

      // Image compression if any are selected
      let compressedImages = [];
      if (form.images.length > 0) {
        compressedImages = await compressImages(Array.from(form.images));
      }

      // FormData preparation
      const formData = new FormData();

      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      formData.append("category_id", form.category_id);
      if (form.subcategory_id) {
        formData.append("subcategory_id", form.subcategory_id);
      }

      // Add serials and quantity for new products only
      if (!editProductId) {
        formData.append("quantity", form.quantity);
        formData.append("serials", JSON.stringify(form.serials));
      }

      compressedImages.forEach((image) => formData.append("images", image));

      // API call
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

  // Product edit initialization
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

    // Set existing images for display
    setExistingImages(
      product.images
        ? product.images.map((img, idx) => ({
            id: idx,
            url: img,
            path: img,
          }))
        : []
    );

    setSerialMethod("manual");
    setFileError("");
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Product deletion with confirmation
  const handleRemove = async (productId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This will also delete all associated serial numbers and warranty registrations. This action cannot be undone."
      )
    ) {
      try {
        await deleteProduct(productId, token);
        await loadData();
      } catch (err) {
        setError(
          err.message ||
            "Failed to delete product. It might have active warranties that need to be handled first."
        );
      }
    }
  };

  // Serial management modal controls
  const openSerialModal = async (product) => {
    setSelectedProduct(product);
    setShowSerialModal(true);
    setCurrentSerialPage(1);
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
    setSerialAddMethod("manual");
    setBulkSerialError("");
    setBulkSerialPreview([]);
    setCurrentSerialPage(1);
  };

  // Manual serial addition
  const handleAddNewSerials = async () => {
    if (!newSerials.trim()) return;

    try {
      setSerialLoading(true);
      const serialArray = newSerials
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await addProductSerials(selectedProduct.id, serialArray, token);
      setNewSerials("");
      await loadProductSerials(selectedProduct.id);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to add serials");
    } finally {
      setSerialLoading(false);
    }
  };

  // Excel serial upload processing
  const handleExcelUploadForSerials = async (e) => {
    setBulkSerialError("");
    setBulkSerialPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setBulkSerialError(
        "Invalid file type. Please upload a .xlsx or .xls file."
      );
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

      if (serials.length === 0) {
        setBulkSerialError("No serial numbers found in the Excel file.");
        return;
      }

      if (serials.length > 1000) {
        setBulkSerialError(
          "Too many serials. Maximum 1000 serials per upload."
        );
        return;
      }

      const invalidChars = serials.filter((s) => !/^[A-Z0-9-_]+$/.test(s));
      if (invalidChars.length > 0) {
        setBulkSerialError(
          `Invalid serials (only A-Z, 0-9, -, _ allowed): ${[
            ...new Set(invalidChars.slice(0, 5)),
          ].join(", ")}${
            invalidChars.length > 5
              ? ` and ${invalidChars.length - 5} more`
              : ""
          }`
        );
        return;
      }

      const duplicates = serials.filter((s, i) => serials.indexOf(s) !== i);
      if (duplicates.length > 0) {
        setBulkSerialError(
          `Duplicate serials in file: ${[
            ...new Set(duplicates.slice(0, 5)),
          ].join(", ")}${
            duplicates.length > 5 ? ` and ${duplicates.length - 5} more` : ""
          }`
        );
        return;
      }

      setBulkSerialPreview(serials);
    } catch (err) {
      setBulkSerialError(
        "Error reading Excel file. Please ensure it's a valid Excel format."
      );
    } finally {
      e.target.value = "";
    }
  };

  // Bulk serial import confirmation
  const confirmBulkAdd = async () => {
    try {
      setSerialLoading(true);
      await addProductSerials(selectedProduct.id, bulkSerialPreview, token);
      setBulkSerialPreview([]);
      setBulkSerialError("");
      await loadProductSerials(selectedProduct.id);
      await loadData();
    } catch (err) {
      setBulkSerialError(err.message || "Failed to import serials");
    } finally {
      setSerialLoading(false);
    }
  };

  // Individual serial editing
  const handleEditSerial = async (serialId, newSerial) => {
    try {
      setSerialLoading(true);
      await updateProductSerial(selectedProduct.id, serialId, newSerial, token);
      setEditingSerial(null);
      await loadProductSerials(selectedProduct.id);
    } catch (err) {
      setError(err.message || "Failed to update serial");
    } finally {
      setSerialLoading(false);
    }
  };

  // Serial deletion with confirmation
  const handleDeleteSerial = async (serialId, serialNumber) => {
    if (
      window.confirm(
        `Are you sure you want to delete serial "${serialNumber}"? This action cannot be undone.`
      )
    ) {
      try {
        setSerialLoading(true);
        await deleteProductSerial(selectedProduct.id, serialId, token);
        await loadProductSerials(selectedProduct.id);
        await loadData();
      } catch (err) {
        setError(err.message || "Failed to delete serial");
      } finally {
        setSerialLoading(false);
      }
    }
  };

  // CSV export functionality
  const exportSerials = () => {
    const csvContent = [
      ["Serial Number", "Status", "User Name", "Registered Date"],
      ...filteredSerials.map((serial) => [
        serial.serial,
        serial.status === "registered" ? "Registered" : "Available",
        serial.user_name || "",
        serial.registered_at
          ? new Date(serial.registered_at).toLocaleDateString()
          : "",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedProduct.name}_serials_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Pagination helper for serial modal
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalSerialPages <= maxVisible) {
      for (let i = 1; i <= totalSerialPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentSerialPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalSerialPages);
      } else if (currentSerialPage >= totalSerialPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalSerialPages - 3; i <= totalSerialPages; i++)
          pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentSerialPage - 1; i <= currentSerialPage + 1; i++)
          pages.push(i);
        pages.push("...");
        pages.push(totalSerialPages);
      }
    }

    return pages;
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center p-6 sm:p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 max-w-sm mx-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-lime-600 animate-spin" />
            <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 border-4 border-lime-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-700 mt-4 sm:mt-6 animate-pulse text-center">
            Loading Product Data...
          </p>
          <p className="text-gray-500 mt-2 text-sm sm:text-base text-center">
            Fetching inventory information
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up px-2 sm:px-0">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-lime-200/50 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-r from-lime-600 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-lime-700 to-green-700 bg-clip-text text-transparent mb-3 sm:mb-4">
            Product Management
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
              <span>Total Products: {products.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Categories: {categories.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Form */}
      <div
        ref={formRef}
        className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-lime-600 to-green-600 p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                {editProductId ? (
                  <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                ) : (
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  {editProductId ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-lime-100 text-xs sm:text-sm">
                  {editProductId
                    ? `Editing product ID: ${editProductId}`
                    : "Create a new product with inventory tracking"}
                </p>
              </div>
            </div>

            {!editProductId && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl backdrop-blur-sm">
                {serialMethod === "manual" ? (
                  <Hash className="h-4 w-4 text-white" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 text-white" />
                )}
                <span className="text-xs sm:text-sm font-medium text-white">
                  {serialMethod === "manual" ? "Manual Entry" : "Excel Entry"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-lime-600" />
                  Product Name
                </label>
                <div className="relative group">
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g., Wireless Mouse"
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                    value={form.name}
                    onChange={handleChange}
                    disabled={formLoading || imageCompressing}
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lime-600/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10"></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-lime-600" />
                  Price (₹)
                </label>
                <div className="relative group">
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g., 4999.00"
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                    value={form.price}
                    onChange={handleChange}
                    disabled={formLoading || imageCompressing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Folder className="h-4 w-4 text-lime-600" />
                  Category
                </label>
                <select
                  name="category_id"
                  required
                  className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer text-sm sm:text-base"
                  value={form.category_id}
                  onChange={handleChange}
                  disabled={formLoading || imageCompressing}
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-lime-600" />
                  Subcategory (Optional)
                </label>
                <select
                  name="subcategory_id"
                  className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer text-sm sm:text-base"
                  value={form.subcategory_id}
                  onChange={handleChange}
                  disabled={
                    formLoading || imageCompressing || !form.category_id
                  }
                >
                  <option value="">Select a Subcategory</option>
                  {subcategories
                    .filter(
                      (sc) =>
                        String(sc.category_id) === String(form.category_id)
                    )
                    .map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="lg:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  required
                  placeholder="Detailed product description..."
                  className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md resize-none text-sm sm:text-base"
                  value={form.description}
                  onChange={handleChange}
                  disabled={formLoading || imageCompressing}
                />
              </div>

              {/* Image Upload Section */}
              <div className="lg:col-span-2 space-y-4">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-lime-600" />
                  Product Images
                </label>

                {/* Existing Images Display for Edit Mode */}
                {editProductId && existingImages.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Current Images ({existingImages.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-75 transition-opacity duration-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeExistingImage(img.id, img.path)
                            }
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Upload Interface */}
                <div className="relative">
                  <input
                    name="images"
                    type="file"
                    multiple
                    onChange={handleChange}
                    accept="image/jpeg,image/png,image/webp"
                    disabled={formLoading || imageCompressing}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full p-4 sm:p-6 border-2 border-dashed border-lime-300 rounded-xl cursor-pointer hover:border-lime-500 hover:bg-lime-50 transition-all duration-300 group"
                  >
                    <div className="text-center">
                      {imageCompressing ? (
                        <>
                          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-lime-500 mx-auto mb-2 animate-spin" />
                          <p className="text-sm font-medium text-lime-700">
                            Compressing images...
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-lime-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <p className="text-sm font-medium text-gray-700">
                            {editProductId
                              ? "Add new images"
                              : "Click to upload images"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, WEBP supported (max 10MB each)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Selected Images Preview */}
                {form.images.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected Images ({form.images.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {Array.from(form.images).map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-75 transition-opacity duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs truncate max-w-full">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  {editProductId
                    ? "New images will be added to existing ones. Remove unwanted existing images first."
                    : "Multiple images allowed. Images will be compressed and converted to WebP format."}
                </p>
              </div>
            </div>

            {/* Serial Number Section for New Products Only */}
            {!editProductId && (
              <div className="bg-gradient-to-r from-gray-50 to-lime-50 rounded-2xl p-4 sm:p-6 border border-lime-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-lime-600" />
                    Initial Serial Numbers
                  </h3>
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-xs font-medium flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      Add more serials later using "Add/Remove Serials" button
                    </span>
                    <span className="sm:hidden">
                      Add more later via Manage Serials
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                  {["manual", "excel"].map((method) => (
                    <label
                      key={method}
                      className={`flex items-center justify-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        serialMethod === method
                          ? "border-lime-500 bg-lime-100 text-lime-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-lime-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="serialMethod"
                        value={method}
                        checked={serialMethod === method}
                        onChange={() => setSerialMethod(method)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2">
                        {method === "manual" ? (
                          <Hash className="h-4 w-4" />
                        ) : (
                          <FileSpreadsheet className="h-4 w-4" />
                        )}
                        <span className="font-medium capitalize text-sm sm:text-base">
                          {method} Entry
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {serialMethod === "manual" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Initial Quantity
                      </label>
                      <input
                        name="quantity"
                        type="number"
                        min="0"
                        required
                        placeholder="e.g., 10"
                        className="w-full max-w-xs p-3 sm:p-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm sm:text-base"
                        value={form.quantity}
                        onChange={handleChange}
                        disabled={formLoading || imageCompressing}
                      />
                    </div>

                    {Number(form.quantity) > 0 && (
                      <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-gray-200 space-y-4 max-h-96 overflow-y-auto">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2">
                          <Hash className="h-4 w-4 text-lime-600" />
                          Enter Serial Numbers ({form.serials.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {Array.from({ length: Number(form.quantity) }).map(
                            (_, i) => (
                              <input
                                key={i}
                                placeholder={`Serial #${i + 1}`}
                                required
                                className="p-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 text-sm font-mono"
                                value={form.serials[i] || ""}
                                onChange={(e) =>
                                  handleSerialChange(i, e.target.value)
                                }
                                disabled={formLoading || imageCompressing}
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-lime-600" />
                        Upload Excel File
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".xlsx"
                          onChange={handleExcelUpload}
                          disabled={formLoading || imageCompressing}
                          className="hidden"
                          id="excel-upload"
                        />
                        <label
                          htmlFor="excel-upload"
                          className="flex items-center justify-center w-full p-4 sm:p-6 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
                        >
                          <div className="text-center">
                            <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                            <p className="text-sm font-medium text-gray-700">
                              Click to upload Excel file
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Serial numbers in first column
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {fileError && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{fileError}</p>
                      </div>
                    )}

                    {form.serials.length > 0 && !fileError && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-green-700 font-medium">
                            {form.serials.length} serials loaded successfully.
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Quantity automatically set to {form.quantity}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Edit Mode Information Banner */}
            {editProductId && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    Serial Number Management
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    To add, edit, or remove serial numbers, use the "Add/Remove
                    Serials" button in the products table below after saving
                    your changes.
                  </p>
                </div>
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              {editProductId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={formLoading || imageCompressing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                disabled={
                  formLoading ||
                  imageCompressing ||
                  !form.name ||
                  !form.price ||
                  !form.category_id ||
                  (!editProductId && form.quantity <= 0)
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-lime-700 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                {formLoading || imageCompressing ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin relative z-10" />
                    <span className="relative z-10">
                      {imageCompressing ? "Compressing..." : "Saving..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="relative z-10">
                      {editProductId ? "Update Product" : "Add Product"}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Products Table with Pagination */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  Product Inventory
                </h2>
                <p className="text-green-100 text-xs sm:text-sm">
                  All products with serial number management
                </p>
              </div>
            </div>
            {products.length > productsPerPage && (
              <div className="text-green-100 text-xs sm:text-sm">
                Page {currentProductPage} of {totalProductPages}
              </div>
            )}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              No products found
            </p>
            <p className="text-gray-400 text-sm sm:text-base">
              Add your first product using the form above
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <tr>
                    {[
                      { name: "Product Name", icon: Tag },
                      { name: "Price", icon: IndianRupee },
                      { name: "Quantity", icon: Hash },
                      { name: "Category", icon: Folder },
                      { name: "Actions", icon: null },
                    ].map((h) => (
                      <th
                        key={h.name}
                        className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          {h.icon && (
                            <h.icon className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="hidden sm:inline">{h.name}</span>
                          <span className="sm:hidden">
                            {h.name === "Product Name"
                              ? "Product"
                              : h.name === "Actions"
                              ? "Actions"
                              : h.name}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              ID: {product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900 text-sm sm:text-base">
                            {Number(product.price).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                            {product.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700 text-sm truncate">
                            {categories.find(
                              (c) => c.id === product.category_id
                            )?.name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => openSerialModal(product)}
                            className="w-full sm:w-auto flex items-center justify-center gap-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
                          >
                            <Settings2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">
                              Add/Remove Serials
                            </span>
                            <span className="sm:hidden">Serials</span>
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="w-full sm:w-auto flex items-center justify-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
                          >
                            <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemove(product.id)}
                            className="w-full sm:w-auto flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Product Pagination Controls */}
            {products.length > productsPerPage && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {(currentProductPage - 1) * productsPerPage + 1}-
                    {Math.min(
                      currentProductPage * productsPerPage,
                      products.length
                    )}{" "}
                    of {products.length} products
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentProductPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentProductPage === 1}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalProductPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalProductPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentProductPage <= 3) {
                            pageNum = i + 1;
                          } else if (
                            currentProductPage >=
                            totalProductPages - 2
                          ) {
                            pageNum = totalProductPages - 4 + i;
                          } else {
                            pageNum = currentProductPage - 2 + i;
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => setCurrentProductPage(pageNum)}
                              className={`px-3 py-2 text-sm border border-gray-200 rounded-lg transition-colors duration-200 ${
                                pageNum === currentProductPage
                                  ? "bg-green-600 text-white border-green-600"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentProductPage((prev) =>
                          Math.min(totalProductPages, prev + 1)
                        )
                      }
                      disabled={currentProductPage === totalProductPages}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Serial Management Modal */}
      {showSerialModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
            onClick={closeSerialModal}
          ></div>

          {/* Modal Content Container */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                    <Settings2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                      Add/Remove Serial Numbers
                    </h3>
                    <p className="text-indigo-100 text-xs sm:text-sm truncate">
                      {selectedProduct.name} (ID: {selectedProduct.id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeSerialModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className="px-4 sm:px-6 py-4 overflow-y-auto flex-1">
              {/* Serial Statistics Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {serialStats.total_serials || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-800">
                    Total Serials
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {serialStats.available_serials || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-green-800">
                    Available
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">
                    {serialStats.used_serials || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-orange-800">
                    Used/Registered
                  </div>
                </div>
              </div>

              {/* Add New Serials Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-green-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  Add New Serial Numbers
                </h4>

                {/* Method Selection Tabs */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                  <button
                    onClick={() => setSerialAddMethod("manual")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 text-sm ${
                      serialAddMethod === "manual"
                        ? "border-green-500 bg-green-100 text-green-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                    }`}
                  >
                    <Hash className="h-4 w-4" />
                    <span>Manual Entry</span>
                  </button>
                  <button
                    onClick={() => setSerialAddMethod("excel")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 text-sm ${
                      serialAddMethod === "excel"
                        ? "border-purple-500 bg-purple-100 text-purple-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-purple-300"
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Excel Upload</span>
                  </button>
                </div>

                {/* Manual Entry Interface */}
                {serialAddMethod === "manual" ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Enter serial numbers (one per line or comma-separated)"
                      value={newSerials}
                      onChange={(e) => setNewSerials(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm"
                      rows="3"
                      disabled={serialLoading}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddNewSerials}
                        disabled={!newSerials.trim() || serialLoading}
                        className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {serialLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Add Serials
                      </button>
                      {newSerials.trim() && (
                        <button
                          onClick={() => setNewSerials("")}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors duration-200 text-sm"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Excel Upload Interface */
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelUploadForSerials}
                        disabled={serialLoading}
                        className="hidden"
                        id="serial-excel-upload"
                      />
                      <label
                        htmlFor="serial-excel-upload"
                        className="flex flex-col items-center justify-center w-full p-4 sm:p-6 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
                      >
                        <div className="text-center">
                          <FileSpreadsheet className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" />
                          <p className="text-sm font-medium text-gray-700">
                            Click to upload Excel file
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Serial numbers in first column (.xlsx, .xls)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Excel Upload Error Display */}
                    {bulkSerialError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">
                          {bulkSerialError}
                        </p>
                      </div>
                    )}

                    {/* Excel Upload Preview */}
                    {bulkSerialPreview.length > 0 && !bulkSerialError && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-800">
                            {bulkSerialPreview.length} serials ready to import
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto mb-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                            {bulkSerialPreview
                              .slice(0, 12)
                              .map((serial, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white px-2 py-1 rounded border font-mono"
                                >
                                  {serial}
                                </div>
                              ))}
                            {bulkSerialPreview.length > 12 && (
                              <div className="bg-gray-100 px-2 py-1 rounded border text-gray-600 font-medium">
                                +{bulkSerialPreview.length - 12} more
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={confirmBulkAdd}
                            disabled={serialLoading}
                            className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                          >
                            {serialLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            Import All
                          </button>
                          <button
                            onClick={() => setBulkSerialPreview([])}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors duration-200 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Serial Search Interface */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search serial numbers..."
                    value={serialSearch}
                    onChange={(e) => setSerialSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Pagination Info and Controls */}
              {filteredSerials.length > serialsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
                  <div className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {(currentSerialPage - 1) * serialsPerPage + 1}-
                    {Math.min(
                      currentSerialPage * serialsPerPage,
                      filteredSerials.length
                    )}{" "}
                    of {filteredSerials.length} serials
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentSerialPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentSerialPage === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-medium">
                      {currentSerialPage} / {totalSerialPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentSerialPage((prev) =>
                          Math.min(totalSerialPages, prev + 1)
                        )
                      }
                      disabled={currentSerialPage === totalSerialPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Serials List Container */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {serialLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Loading serials...
                      </p>
                    </div>
                  </div>
                ) : paginatedSerials.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Hash className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium mb-1">
                      {productSerials.length === 0
                        ? "No serial numbers found"
                        : "No matching serials"}
                    </p>
                    <p className="text-sm">
                      {productSerials.length === 0
                        ? "Add some serial numbers using the form above"
                        : "Try adjusting your search terms"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {paginatedSerials.map((serial) => (
                      <div
                        key={serial.id}
                        className={`flex items-center justify-between p-4 transition-all duration-200 hover:bg-gray-50 ${
                          serial.status === "registered" ? "bg-orange-25" : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          {editingSerial === serial.id ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                defaultValue={serial.serial}
                                autoFocus
                                onBlur={(e) => {
                                  if (e.target.value.trim() !== serial.serial) {
                                    handleEditSerial(
                                      serial.id,
                                      e.target.value.trim()
                                    );
                                  } else {
                                    setEditingSerial(null);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const newValue = e.target.value.trim();
                                    if (newValue !== serial.serial) {
                                      handleEditSerial(serial.id, newValue);
                                    } else {
                                      setEditingSerial(null);
                                    }
                                  } else if (e.key === "Escape") {
                                    setEditingSerial(null);
                                  }
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm font-mono"
                                placeholder="Enter new serial number"
                              />
                            </div>
                          ) : (
                            <div className="min-w-0">
                              <div className="font-mono font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {serial.serial}
                              </div>
                              {serial.status === "registered" && (
                                <div className="text-xs text-orange-600 mt-1 truncate">
                                  Registered to: {serial.user_name} on{" "}
                                  {new Date(
                                    serial.registered_at
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              serial.status === "registered"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {serial.status === "registered"
                              ? "Registered"
                              : "Available"}
                          </span>

                          {serial.status !== "registered" && (
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  setEditingSerial(
                                    editingSerial === serial.id
                                      ? null
                                      : serial.id
                                  )
                                }
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                title="Edit serial"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSerial(serial.id, serial.serial)
                                }
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                title="Delete serial"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Pagination Controls */}
              {filteredSerials.length > serialsPerPage && (
                <div className="flex items-center justify-center mt-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentSerialPage(1)}
                      disabled={currentSerialPage === 1}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      First
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSerialPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentSerialPage === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((pageNum, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          typeof pageNum === "number" &&
                          setCurrentSerialPage(pageNum)
                        }
                        disabled={typeof pageNum !== "number"}
                        className={`px-3 py-2 text-sm border border-gray-200 rounded-lg transition-colors duration-200 ${
                          pageNum === currentSerialPage
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : typeof pageNum === "number"
                            ? "hover:bg-gray-100"
                            : "cursor-default"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentSerialPage((prev) =>
                          Math.min(totalSerialPages, prev + 1)
                        )
                      }
                      disabled={currentSerialPage === totalSerialPages}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentSerialPage(totalSerialPages)}
                      disabled={currentSerialPage === totalSerialPages}
                      className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => loadProductSerials(selectedProduct.id)}
                    disabled={serialLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 text-sm"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        serialLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>

                  {filteredSerials.length > 0 && (
                    <button
                      onClick={exportSerials}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-xl transition-colors duration-200 text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                  )}
                </div>

                <button
                  onClick={closeSerialModal}
                  className="w-full sm:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors duration-200 text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #84cc16;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #65a30d;
        }

        @media (max-width: 640px) {
          .animate-fade-in-up {
            animation-duration: 0.5s;
          }
        }
      `}</style>
    </div>
  );
}
