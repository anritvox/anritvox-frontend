import React, { useState, useEffect } from "react";
// 100% STRICT IMPORT: Using the mapped objects
import { categories as catApi, subcategories as subCatApi } from "../../services/api";
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
  Grid3x3,
  Layers,
  ChevronRight,
  Sparkles,
  Zap
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
        catApi.getAll(),
        subCatApi.getAll(),
      ]);
      setCategories(Array.isArray(cats.data) ? cats.data : (cats.data?.data || cats || []));
      setSubcategories(Array.isArray(subs.data) ? subs.data : (subs.data?.data || subs || []));
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
        await catApi.update(editCatId, { name });
      } else {
        await catApi.create({ name });
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
      if (!name.trim() || !parentId) throw new Error("Subcategory name and parent category are required.");
      const data = { name, category_id: parentId };
      if (editSubId) {
        await subCatApi.update(editSubId, data);
      } else {
        await subCatApi.create(data);
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
        await catApi.delete(id);
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
        await subCatApi.delete(id);
        loadData();
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to delete subcategory: " + e.message);
      } finally {
        setFormLoading(false);
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500 animate-pulse" size={20} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 p-4 lg:p-8 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl">
          <div>
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white via-cyan-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
              <Layers className="text-cyan-400" />
              Taxonomy Engine
            </h1>
            <p className="text-gray-400 text-xs mt-1 font-mono uppercase tracking-widest">Global Classification & Hierarchy</p>
          </div>
          <div className="flex gap-2">
             <button onClick={loadData} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
                <Sparkles size={18} className="text-cyan-400" />
             </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-fade-in backdrop-blur-md">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto hover:bg-red-500/20 p-1 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                  <Grid3x3 className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Primary Departments</h2>
                  <p className="text-xs text-gray-500 font-mono">Top-level structural nodes</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category Identifier</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name..."
                    className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-gray-700 text-sm"
                    disabled={formLoading}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCatSave}
                    disabled={formLoading || !name.trim()}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={16} /> : (editCatId ? <Save size={16} /> : <Plus size={16} />)}
                    {editCatId ? "Commit Update" : "Deploy Category"}
                  </button>
                  {editCatId && (
                    <button onClick={resetForm} className="px-6 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c10]/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ref ID</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Label</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {(Array.isArray(categories) ? categories : []).map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-mono text-cyan-500/70 text-xs">#{c.id.toString().padStart(3, '0')}</td>
                        <td className="px-6 py-4 font-bold text-gray-300">{c.name}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditCatId(c.id); setName(c.name); setEditSubId(null); setParentId(""); }}
                              className="p-2 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleRemoveCat(c.id)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!Array.isArray(categories) || categories.length === 0) && (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-600 italic">No primary departments detected.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="space-y-6">
             <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <FolderPlus className="text-purple-400" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Sub-Classifications</h2>
                  <p className="text-xs text-gray-500 font-mono">Secondary hierarchical clusters</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Parent Nexus</label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all text-sm appearance-none"
                      disabled={formLoading || !Array.isArray(categories) || categories.length === 0}
                    >
                      <option value="">Select Parent</option>
                      {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sub Label</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Smartphones"
                      className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all placeholder:text-gray-700 text-sm"
                      disabled={formLoading}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubSave}
                    disabled={formLoading || !name.trim() || !parentId}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    {formLoading ? <Loader2 className="animate-spin" size={16} /> : (editSubId ? <Save size={16} /> : <Plus size={16} />)}
                    {editSubId ? "Commit Change" : "Initialize Sub-Node"}
                  </button>
                  {editSubId && (
                    <button onClick={resetForm} className="px-6 bg-white/5 hover:bg-white/10 text-gray-400 rounded-2xl transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0a0c10]/50">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cluster</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nexus</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {(Array.isArray(subcategories) ? subcategories : []).map((sc) => (
                      <tr key={sc.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-bold text-gray-300">{sc.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-mono rounded-full uppercase tracking-tighter">
                            {(Array.isArray(categories) ? categories : []).find(c => c.id === sc.category_id)?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditSubId(sc.id); setName(sc.name); setParentId(sc.category_id); setEditCatId(null); }}
                              className="p-2 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleRemoveSub(sc.id)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!Array.isArray(subcategories) || subcategories.length === 0) && (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-gray-600 italic">No sub-clusters indexed.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #374151; }
      `}</style>
    </div>
  );
}
