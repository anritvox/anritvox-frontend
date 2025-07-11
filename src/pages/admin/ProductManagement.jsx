import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";

import {
  fetchProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  fetchSubcategories,
} from "../../services/api";

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

  // --- Existing Logic: DO NOT CHANGE ---
  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, subsData] = await Promise.all([
        fetchProductsAdmin(token),
        fetchCategories(token),
        fetchSubcategories(token),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setSubcategories(subsData);
    } catch (e) {
      setError("Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setForm((f) => ({ ...f, images: files }));
    } else if (name === "quantity") {
      const qty = Number(value) || 0;
      setForm((f) => ({
        ...f,
        quantity: value,
        serials: Array(qty).fill(""),
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSerialChange = (idx, val) => {
    setForm((f) => {
      const copy = [...f.serials];
      copy[idx] = val.trim().toUpperCase();
      return { ...f, serials: copy };
    });
  };

  const handleSave = async () => {
    setFormLoading(true);
    setError(null);
    try {
      if (
        form.serials.length !== Number(form.quantity) ||
        form.serials.some((s) => !s)
      ) {
        throw new Error(
          `Please enter exactly ${form.quantity} serial number(s).`
        );
      }
      const compressedImages = await Promise.all(
        Array.from(form.images).map(async (file) => {
          const options = {
            maxSizeMB: 1, // target size
            maxWidthOrHeight: 1920, // max dimension
            useWebWorker: true,
            fileType: "image/webp", // convert to WebP
          };
          const compressedBlob = await imageCompression(file, options);
          return new File(
            [compressedBlob],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: "image/webp" }
          );
        })
      );
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity);
      formData.append("category_id", form.category_id);
      formData.append("subcategory_id", form.subcategory_id);
      compressedImages.forEach((file) => formData.append("images", file));
      formData.append("serials", JSON.stringify(form.serials));

      if (editProductId) await updateProduct(editProductId, formData, token);
      else await createProduct(formData, token);

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
      loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditProductId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      quantity: String(p.quantity),
      category_id: p.category_id || "",
      subcategory_id: p.subcategory_id || "",
      images: [],
      serials: Array.isArray(p.serials) ? p.serials : [],
    });
  };

  const handleRemove = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await deleteProduct(id, token);
        loadData();
      } catch (e) {
        setError("Failed to delete product: " + e.message);
      }
    }
  };
  // --- End Existing Logic ---

  if (loading)
    return (
      <p className="text-center py-8 text-gray-700 animate-pulse">
        Loading products...
      </p>
    );

  const rows = products.flatMap((p) => {
    const seqs =
      Array.isArray(p.serials) && p.serials.length ? p.serials : [null];
    return seqs.map((s, i) => ({
      ...p,
      displaySerial: s,
      rowKey: `${p.id}-${i}`,
    }));
  });

  // Reusable Tailwind CSS classes for inputs, selects, and textareas
  const inputClasses =
    "w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 shadow-sm";
  const buttonPrimaryClasses =
    "px-6 py-3 rounded-full bg-lime-700 text-white font-semibold hover:bg-lime-800 transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
  const buttonSecondaryClasses =
    "ml-2 px-6 py-3 rounded-full bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition-all duration-300 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
  const buttonEditClasses =
    "text-lime-600 hover:text-lime-800 font-medium transition-colors duration-200";
  const buttonDeleteClasses =
    "text-red-600 hover:text-red-800 font-medium transition-colors duration-200";

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-white rounded-lg shadow-xl animate-fade-in">
      {/* Product Form Section */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-lime-700">
            {editProductId ? "Edit" : "Add New"}
          </span>{" "}
          Product
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <input
            name="name"
            placeholder="Product Name"
            className={inputClasses}
            value={form.name}
            onChange={handleChange}
            disabled={formLoading}
          />
          <input
            name="price"
            type="number"
            placeholder="Price (e.g., 99.99)"
            className={inputClasses}
            value={form.price}
            onChange={handleChange}
            disabled={formLoading}
          />
          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            className={inputClasses}
            value={form.quantity}
            onChange={handleChange}
            disabled={formLoading}
          />
          <select
            name="category_id"
            className={inputClasses}
            value={form.category_id}
            onChange={handleChange}
            disabled={formLoading}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="subcategory_id"
            className={inputClasses}
            value={form.subcategory_id}
            onChange={handleChange}
            disabled={formLoading || !form.category_id}
          >
            <option value="">Select Subcategory (Optional)</option>
            {subcategories
              .filter(
                (sc) => String(sc.category_id) === String(form.category_id)
              ) // Ensure string comparison
              .map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
          </select>
          <textarea
            name="description"
            rows="3"
            placeholder="Product Description"
            className={`${inputClasses} col-span-1 md:col-span-2 lg:col-span-3 resize-y`} // Span across columns, allow resize
            value={form.description}
            onChange={handleChange}
            disabled={formLoading}
          />
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Product Images
            </label>
            <input
              name="images"
              type="file"
              multiple
              onChange={handleChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={formLoading}
            />
          </div>
          {/* Serial Number Inputs */}
          {Number(form.quantity) > 0 && (
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2">
                Serial Numbers ({form.quantity})
              </h3>
              {Array.from({ length: Number(form.quantity) || 0 }).map(
                (_, i) => (
                  <input
                    key={i}
                    placeholder={`Serial Number #${i + 1}`}
                    className={inputClasses}
                    value={form.serials[i] || ""}
                    onChange={(e) => handleSerialChange(i, e.target.value)}
                    disabled={formLoading}
                  />
                )
              )}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleSave}
            className={buttonPrimaryClasses}
            disabled={formLoading}
          >
            {formLoading
              ? "Saving..."
              : editProductId
              ? "Update Product"
              : "Add Product"}
          </button>
          {editProductId && (
            <button
              onClick={() => {
                setEditProductId(null);
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
              }}
              className={buttonSecondaryClasses}
              disabled={formLoading}
            >
              Cancel
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-600 mt-4 text-center font-medium animate-fade-in">
            {error}
          </p>
        )}
      </div>

      {/* Product List Section */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-100 overflow-x-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-lime-700">All</span> Products
        </h2>
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "ID",
                    "Name",
                    "Price",
                    "Qty",
                    "Category",
                    "Subcategory",
                    "Serial",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.rowKey}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {r.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        ${Number(r.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {r.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {categories.find((c) => c.id === r.category_id)?.name ||
                          "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {subcategories.find((sc) => sc.id === r.subcategory_id)
                          ?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {r.displaySerial || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm space-x-3">
                        <button
                          onClick={() => handleEdit(r)}
                          className={buttonEditClasses}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(r.id)}
                          className={buttonDeleteClasses}
                        >
                          Delete
                        </button>
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
