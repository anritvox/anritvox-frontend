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
import {
  Plus,
  Edit3,
  Trash2,
  Folder,
  FolderPlus,
  Save,
  X,
  AlertCircle,
  Loader2,
  Grid3X3,
  List,
  ChevronRight,
} from "lucide-react";

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
    setError(null);
    try {
      const [cats, subs] = await Promise.all([
        fetchCategories(token),
        fetchSubcategories(token),
      ]);
      setCategories(cats);
      setSubcategories(subs);
    } catch (err) {
      setError("Failed to load data: " + err.message);
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
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save category: " + e.message);
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
      loadData();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save subcategory: " + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveCat = async (id) => {
    if (window.confirm("Are you sure you want to delete this category? This will also delete all associated subcategories.")) {
      setFormLoading(true);
      setError(null);
      try {
        await deleteCategory(id, token);
        loadData();
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to delete category: " + e.message);
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
        setError(e?.response?.data?.message || "Failed to delete subcategory: " + e.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-10 w-10 text-[#c45500] animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Loading classifications...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in p-2">
      {/* Error Alert */}
      {error && (
        <div className="bg-[#fff1f0] border border-[#ffa39e] rounded-md p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-[#f5222d] mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-[#cf1322] text-sm">Action Required</h3>
            <p className="text-xs text-[#cf1322] mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-gray-400 hover:text-black">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Categories Section */}
      <section className="bg-white">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Folder className="h-6 w-6 text-[#232f3e]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111]">Product Categories</h2>
              <p className="text-xs text-gray-500">Organize products into high-level departments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add/Edit Form */}
          <div className="lg:col-span-1 bg-[#fcfcfc] border border-gray-200 rounded-lg p-6 h-fit">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#c45500]" /> {editCatId ? "Update Category" : "Add New Category"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electronics"
                  className="w-full p-2 border border-[#888c8c] rounded-[3px] focus:shadow-[0_0_0_3px_rgba(0,113,133,.5)] focus:border-[#007185] outline-none text-sm"
                  disabled={formLoading}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleCatSave}
                  disabled={formLoading || !name.trim()}
                  className="flex-1 bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] shadow-[0_2px_5px_0_rgba(213,217,217,.5)] py-1.5 rounded-lg text-sm font-medium transition-all"
                >
                  {formLoading ? "Saving..." : (editCatId ? "Update" : "Save Category")}
                </button>
                {editCatId && (
                  <button 
                    onClick={resetForm}
                    className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="border border-[#e7e9ec] rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f0f2f2] border-b border-[#e7e9ec]">
                  <tr>
                    <th className="px-4 py-2 font-bold text-gray-700">ID</th>
                    <th className="px-4 py-2 font-bold text-gray-700">Category Name</th>
                    <th className="px-4 py-2 font-bold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.id}</td>
                      <td className="px-4 py-3 font-bold text-[#007185]">{c.name}</td>
                      <td className="px-4 py-3 text-right space-x-4">
                        <button 
                          onClick={() => { setEditCatId(c.id); setName(c.name); setEditSubId(null); setParentId(""); }}
                          className="text-[#007185] hover:underline hover:text-[#c45500] font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleRemoveCat(c.id)}
                          className="text-[#af2a2a] hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan="3" className="px-4 py-10 text-center text-gray-400">No categories found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Subcategories Section */}
      <section className="bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <List className="h-6 w-6 text-[#232f3e]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111]">Subcategories</h2>
              <p className="text-xs text-gray-500">Fine-grained grouping for easier product discovery</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1 bg-[#fcfcfc] border border-gray-200 rounded-lg p-6 h-fit">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#c45500]" /> {editSubId ? "Edit Subcategory" : "Add Subcategory"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Parent Category</label>
                <select 
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full p-2 border border-[#888c8c] rounded-[3px] focus:shadow-[0_0_0_3px_rgba(0,113,133,.5)] focus:border-[#007185] outline-none text-sm bg-white"
                  disabled={formLoading || categories.length === 0}
                >
                  <option value="">Select Parent</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Subcategory Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Smartphones"
                  className="w-full p-2 border border-[#888c8c] rounded-[3px] focus:shadow-[0_0_0_3px_rgba(0,113,133,.5)] focus:border-[#007185] outline-none text-sm"
                  disabled={formLoading}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleSubSave}
                  disabled={formLoading || !name.trim() || !parentId}
                  className="flex-1 bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] shadow-[0_2px_5px_0_rgba(213,217,217,.5)] py-1.5 rounded-lg text-sm font-medium transition-all"
                >
                  {formLoading ? "Saving..." : (editSubId ? "Update" : "Save Subcategory")}
                </button>
                {editSubId && (
                  <button onClick={resetForm} className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="border border-[#e7e9ec] rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f0f2f2] border-b border-[#e7e9ec]">
                  <tr>
                    <th className="px-4 py-2 font-bold text-gray-700">Subcategory</th>
                    <th className="px-4 py-2 font-bold text-gray-700">Parent</th>
                    <th className="px-4 py-2 font-bold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subcategories.map((sc) => (
                    <tr key={sc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-[#007185]">{sc.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 border border-gray-200">
                          {categories.find(c => c.id === sc.category_id)?.name || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-4">
                        <button 
                          onClick={() => { setEditSubId(sc.id); setName(sc.name); setParentId(sc.category_id); setEditCatId(null); }}
                          className="text-[#007185] hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleRemoveSub(sc.id)}
                          className="text-[#af2a2a] hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {subcategories.length === 0 && (
                    <tr><td colSpan="3" className="px-4 py-10 text-center text-gray-400">No subcategories found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
