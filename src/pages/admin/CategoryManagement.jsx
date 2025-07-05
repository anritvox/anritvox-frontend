import React, { useState, useEffect } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../../services/api";

export default function CategoryManagement({ token }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editCatId, setEditCatId] = useState(null);
  const [editSubId, setEditSubId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null); // Clear previous errors on load
    try {
      const [cats, subs] = await Promise.all([
        fetchCategories(token),
        fetchSubcategories(token),
      ]);
      setCategories(cats);
      setSubcategories(subs);
    } catch (err) {
      setError("Failed to load data: " + err.message);
      console.error("Error loading category data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const resetForm = () => {
    setName("");
    setParentId("");
    setEditCatId(null);
    setEditSubId(null);
    setError(null);
  };

  const handleCatSave = async () => {
    setFormLoading(true);
    setError(null);
    try {
      if (!name.trim()) throw new Error("Category name is required.");
      if (editCatId) {
        await updateCategory(editCatId, { name }, token);
      } else {
        await createCategory({ name }, token);
      }
      resetForm();
      loadData(); // Re-fetch data to update lists
    } catch (e) {
      setError("Failed to save category: " + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubSave = async () => {
    setFormLoading(true);
    setError(null);
    try {
      if (!name.trim() || !parentId)
        throw new Error("Subcategory name and parent category are required.");
      const data = { name, category_id: parentId };
      if (editSubId) {
        await updateSubcategory(editSubId, data, token);
      } else {
        await createSubcategory(data, token);
      }
      resetForm();
      loadData(); // Re-fetch data to update lists
    } catch (e) {
      setError("Failed to save subcategory: " + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveCat = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This will also delete all associated subcategories and products."
      )
    ) {
      setFormLoading(true);
      setError(null);
      try {
        await deleteCategory(id, token);
        loadData();
      } catch (e) {
        setError("Failed to delete category: " + e.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleRemoveSub = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      setFormLoading(true);
      setError(null);
      try {
        await deleteSubcategory(id, token);
        loadData();
      } catch (e) {
        setError("Failed to delete subcategory: " + e.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  // Common Tailwind CSS classes for consistent styling
  const commonInputClasses =
    "flex-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 shadow-sm";
  const primaryButtonClasses =
    "bg-lime-600 hover:bg-lime-700 text-white px-5 py-2 rounded-lg shadow-md font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonClasses =
    "bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg shadow-md font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed";
  const editButtonClasses =
    "text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200";
  const deleteButtonClasses =
    "text-red-600 hover:text-red-800 font-medium transition-colors duration-200";

  if (loading)
    return (
      <div className="text-center py-12 text-gray-700">
        <p className="text-2xl font-semibold animate-pulse">
          Loading categories and subcategories...
        </p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 space-y-10 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
        Category <span className="text-lime-700">Management</span>
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center justify-between shadow-sm">
          <p className="text-lg font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-semibold text-xl"
          >
            &times;
          </button>
        </div>
      )}

      {/* Category Management Section */}
      <div className="border border-gray-200 rounded-xl shadow-md p-6 bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 border-gray-200">
          {editCatId ? "Edit Category" : "Add New Category"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
          <div className="flex-1 w-full">
            <label
              htmlFor="category-name"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Category Name
            </label>
            <input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Electronics, Home Appliances"
              className={commonInputClasses}
              disabled={formLoading}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCatSave}
              className={primaryButtonClasses}
              disabled={formLoading || !name.trim()}
            >
              {editCatId ? "Update Category" : "Create Category"}
            </button>
            {editCatId && (
              <button
                onClick={resetForm}
                className={secondaryButtonClasses}
                disabled={formLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Existing Categories
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">{c.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-3">
                      <button
                        onClick={() => {
                          setEditCatId(c.id);
                          setName(c.name);
                          setEditSubId(null); // Ensure subcategory form is reset
                          setParentId(""); // Ensure subcategory form is reset
                        }}
                        className={editButtonClasses}
                        disabled={formLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveCat(c.id)}
                        className={deleteButtonClasses}
                        disabled={formLoading}
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

      {/* Subcategory Management Section */}
      <div className="border border-gray-200 rounded-xl shadow-md p-6 bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3 border-gray-200">
          {editSubId ? "Edit Subcategory" : "Add New Subcategory"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
          <div className="flex-1 w-full">
            <label
              htmlFor="parent-category"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Parent Category
            </label>
            <select
              id="parent-category"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className={commonInputClasses}
              disabled={formLoading || categories.length === 0}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label
              htmlFor="subcategory-name"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              Subcategory Name
            </label>
            <input
              id="subcategory-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Laptops, Smartphones"
              className={commonInputClasses}
              disabled={formLoading}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubSave}
              className={primaryButtonClasses}
              disabled={formLoading || !name.trim() || !parentId}
            >
              {editSubId ? "Update Subcategory" : "Create Subcategory"}
            </button>
            {editSubId && (
              <button
                onClick={resetForm}
                className={secondaryButtonClasses}
                disabled={formLoading}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Existing Subcategories
        </h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subcategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-center text-gray-500"
                  >
                    No subcategories found.
                  </td>
                </tr>
              ) : (
                subcategories.map((sc) => (
                  <tr
                    key={sc.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">{sc.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {sc.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {categories.find((c) => c.id === sc.category_id)?.name ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-3">
                      <button
                        onClick={() => {
                          setEditSubId(sc.id);
                          setName(sc.name);
                          setParentId(sc.category_id);
                          setEditCatId(null); // Ensure category form is reset
                        }}
                        className={editButtonClasses}
                        disabled={formLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveSub(sc.id)}
                        className={deleteButtonClasses}
                        disabled={formLoading}
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

      {/* Tailwind CSS custom animations and font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
