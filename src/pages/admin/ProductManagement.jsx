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
} from "../../services/api";

// --- Helper Components for better UI ---

const IconEdit = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path
      fillRule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clipRule="evenodd"
    />
  </svg>
);

const IconTrash = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
      clipRule="evenodd"
    />
  </svg>
);

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// --- Main Component ---

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
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editProductId, setEditProductId] = useState(null);
  const [serialMethod, setSerialMethod] = useState("manual");
  const [fileError, setFileError] = useState("");
  const formRef = useRef(null);

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      for (let file of files) {
        if (!allowed.includes(file.type)) {
          alert(
            `Invalid image format: ${file.name}. Only JPEG, PNG, and WEBP allowed.`
          );
          return;
        }
      }
      setForm((prev) => ({ ...prev, images: files }));
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
    setEditProductId(null);
    setSerialMethod("manual");
    setFileError("");
    setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    try {
      if (
        Number(form.quantity) !== form.serials.length ||
        form.serials.some((s) => !s)
      ) {
        throw new Error(
          `Please ensure all ${form.quantity} serial number fields are filled.`
        );
      }
      const compressedImages = await Promise.all(
        Array.from(form.images).map(async (file) => {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1280,
            useWebWorker: true,
            fileType: "image/webp",
          };
          const compressedFile = await imageCompression(file, options);
          return new File(
            [compressedFile],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: "image/webp" }
          );
        })
      );
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key !== "images" && key !== "serials")
          formData.append(key, form[key]);
      });
      formData.append("serials", JSON.stringify(form.serials));
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
      serials: Array.isArray(product.serials) ? product.serials : [],
    });
    setSerialMethod("manual");
    setFileError("");
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRemove = async (productId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        await deleteProduct(productId, token);
        await loadData();
      } catch (err) {
        setError(
          "Failed to delete product. It might be linked to other records."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-2 text-lg text-gray-600">Loading Product Data...</p>
        </div>
      </div>
    );
  }

  const inputBaseClass =
    "block w-full px-4 py-3 text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition duration-150 ease-in-out";
  const btnPrimary =
    "inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-lime-700 rounded-lg shadow-md hover:bg-lime-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all";
  const btnSecondary =
    "inline-flex items-center justify-center px-6 py-3 font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50 transition-all";

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* --- Product Form --- */}
        <div
          ref={formRef}
          className="p-6 md:p-8 bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {editProductId ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-gray-500 mt-1">
                {editProductId
                  ? `Editing product ID: ${editProductId}`
                  : "Fill out the details below to add a new product."}
              </p>
            </div>
            <span className="text-sm font-medium text-white bg-lime-700 px-3 py-1 rounded-full shadow-md">
              {serialMethod === "manual" ? "Manual Entry" : "Excel Entry"}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fields: Name, Price, Categories, Description, Images */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g., Wireless Mouse"
                  className={inputBaseClass}
                  value={form.name}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price ($)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g., 49.99"
                  className={inputBaseClass}
                  value={form.price}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="category_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  className={inputBaseClass}
                  value={form.category_id}
                  onChange={handleChange}
                  disabled={formLoading}
                >
                  <option value="">Select a Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="subcategory_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subcategory (Optional)
                </label>
                <select
                  id="subcategory_id"
                  name="subcategory_id"
                  className={inputBaseClass}
                  value={form.subcategory_id}
                  onChange={handleChange}
                  disabled={formLoading || !form.category_id}
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
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  placeholder="Detailed product description..."
                  className={inputBaseClass}
                  value={form.description}
                  onChange={handleChange}
                  disabled={formLoading}
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="images"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Images
                </label>
                <input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  onChange={handleChange}
                  accept="image/jpeg,image/png,image/webp"
                  disabled={formLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can upload multiple images (JPG, PNG, WEBP). New images
                  replace existing ones on update.
                </p>
              </div>
            </div>

            <hr className="my-8" />

            {/* Serial Number Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Inventory & Serials
              </h3>
              <div className="mt-4 flex items-center space-x-6">
                {["manual", "excel"].map((method) => (
                  <label
                    key={method}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="serialMethod"
                      value={method}
                      checked={serialMethod === method}
                      onChange={() => setSerialMethod(method)}
                      className="h-4 w-4 text-lime-600 border-gray-300 focus:ring-lime-500"
                    />
                    <span className="ml-2 text-gray-700 capitalize">
                      {method} Entry
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {serialMethod === "manual" ? (
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  required
                  placeholder="e.g., 10"
                  className={`${inputBaseClass} max-w-xs`}
                  value={form.quantity}
                  onChange={handleChange}
                  disabled={formLoading}
                />
                {Number(form.quantity) > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 max-h-96 overflow-y-auto">
                    <h4 className="font-semibold text-gray-700">
                      Enter Serial Numbers ({form.serials.length})
                    </h4>
                    {Array.from({ length: Number(form.quantity) }).map(
                      (_, i) => (
                        <input
                          key={i}
                          placeholder={`Serial Number #${i + 1}`}
                          required
                          className={inputBaseClass}
                          value={form.serials[i] || ""}
                          onChange={(e) =>
                            handleSerialChange(i, e.target.value)
                          }
                          disabled={formLoading}
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor="excelUpload"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Upload Excel File
                </label>
                <input
                  id="excelUpload"
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelUpload}
                  disabled={formLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload an .xlsx file with serial numbers in the first column.
                  Quantity will be set automatically.
                </p>
                {fileError && (
                  <p className="text-sm text-red-600 mt-2">{fileError}</p>
                )}
                {form.serials.length > 0 && !fileError && (
                  <p className="text-sm text-green-600 mt-2">
                    {form.serials.length} serials loaded successfully. Quantity
                    is set to {form.quantity}.
                  </p>
                )}
              </div>
            )}

            <div className="pt-5">
              <div className="flex justify-end space-x-4">
                {editProductId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className={btnSecondary}
                    disabled={formLoading}
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className={btnPrimary}
                  disabled={
                    formLoading ||
                    !form.name ||
                    !form.price ||
                    !form.category_id ||
                    form.quantity <= 0
                  }
                >
                  {formLoading && <Spinner />}
                  {formLoading
                    ? "Saving..."
                    : editProductId
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-4 text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* --- Products Table --- */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Product Inventory
            </h2>
            <p className="text-gray-500 mt-2">
              A list of all products and their total quantity in stock.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Product Name",
                    "Price",
                    "Quantity",
                    "Category",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No products found. Add one using the form above.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {product.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-800">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {categories.find((c) => c.id === product.category_id)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center text-lime-600 hover:text-lime-800 font-semibold text-xs transition-colors"
                          >
                            <IconEdit /> EDIT
                          </button>
                          <button
                            onClick={() => handleRemove(product.id)}
                            className="inline-flex items-center text-red-600 hover:text-red-800 font-semibold text-xs transition-colors"
                          >
                            <IconTrash /> DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
