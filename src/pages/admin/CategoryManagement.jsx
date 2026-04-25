import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderTree, Plus, Edit2, Trash2, Search, RefreshCw, 
  ChevronRight, ChevronDown, Layers, Link as LinkIcon, 
  AlertTriangle, Image as ImageIcon, CheckCircle, Component, XCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tree-View State
  const [expandedRows, setExpandedRows] = useState({});

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('category'); // 'category' or 'subcategory'
  const [editingItem, setEditingItem] = useState(null);
  
  const [form, setForm] = useState({ name: '', slug: '', description: '', category_id: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const { showToast } = useToast() || {};

  useEffect(() => { fetchTaxonomy(); }, []);

  const fetchTaxonomy = async () => {
    setLoading(true);
    try {
      // Fetch both clusters concurrently
      const [catRes, subRes] = await Promise.all([
        api.get('/categories'),
        api.get('/subcategories').catch(() => ({ data: { data: [] } })) // Fallback if subcategories are empty
      ]);
      
      setCategories(catRes.data?.categories || catRes.data?.data || catRes.data || []);
      setSubcategories(subRes.data?.subcategories || subRes.data?.data || subRes.data || []);
    } catch (err) {
      showToast?.('Failed to sync taxonomy matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- CRUD OPERATIONS ---
  const openModal = (mode, item = null, parentId = null) => {
    setModalMode(mode);
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || '',
        slug: item.slug || '',
        description: item.description || '',
        category_id: item.category_id || parentId || ''
      });
    } else {
      setEditingItem(null);
      setForm({ name: '', slug: '', description: '', category_id: parentId || '' });
    }
    setIsModalOpen(true);
  };

  const handleAutoSlug = (name) => {
    setForm(prev => ({ 
      ...prev, 
      name, 
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const endpoint = modalMode === 'category' ? '/categories' : '/subcategories';
      const payload = { ...form };

      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id || editingItem._id}`, payload);
        showToast?.(`${modalMode === 'category' ? 'Cluster' : 'Sub-Node'} updated`, 'success');
      } else {
        await api.post(endpoint, payload);
        showToast?.(`${modalMode === 'category' ? 'Cluster' : 'Sub-Node'} deployed`, 'success');
      }
      setIsModalOpen(false);
      fetchTaxonomy();
    } catch (err) {
      showToast?.('Taxonomy mutation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id, mode) => {
    const isCategory = mode === 'category';
    const warning = isCategory 
      ? 'WARNING: Purging a Master Cluster will orphan all its Sub-Nodes and products. Proceed?' 
      : 'Purge this Sub-Node from the taxonomy?';
      
    if (!window.confirm(warning)) return;

    try {
      const endpoint = isCategory ? `/categories/${id}` : `/subcategories/${id}`;
      await api.delete(endpoint);
      showToast?.('Entity purged successfully', 'success');
      fetchTaxonomy();
    } catch (err) {
      showToast?.('Purge protocol failed', 'error');
    }
  };

  // --- ANALYTICS & GROUPING ---
  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const getSubcategories = (categoryId) => {
    return subcategories.filter(sub => 
      (sub.category_id === categoryId) || 
      (sub.category_id?._id === categoryId) || 
      (sub.category_id?.id === categoryId)
    );
  };

  // Telemetry KPIs
  const totalClusters = categories.length;
  const totalSubNodes = subcategories.length;
  const emptyClusters = categories.filter(c => getSubcategories(c.id || c._id).length === 0).length;

  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Taxonomy Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-300">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Taxonomy <span className="text-purple-500">Matrix</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <FolderTree size={12} className="text-purple-500" /> Advanced Hierarchy & Routing Control
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTaxonomy} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-purple-400 transition-all">
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => openModal('category')}
            className="flex items-center gap-2 px-5 py-3 bg-purple-500/10 border border-purple-500/50 text-purple-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          >
            <Plus size={16} /> Deploy Master Cluster
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-2xl -mr-6 -mt-6"></div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-purple-500 z-10"><Layers size={20} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Master Clusters (Level 1)</p>
            <h4 className="text-2xl font-black text-white tracking-tight">{totalClusters}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-2xl -mr-6 -mt-6"></div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-blue-500 z-10"><Component size={20} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Sub-Nodes (Level 2)</p>
            <h4 className="text-2xl font-black text-white tracking-tight">{totalSubNodes}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-2xl -mr-6 -mt-6"></div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-500 z-10"><AlertTriangle size={20} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Empty Clusters (No Subs)</p>
            <h4 className="text-2xl font-black text-white tracking-tight">{emptyClusters}</h4>
          </div>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input 
          type="text" placeholder="Search taxonomy..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/40 border border-slate-800 focus:border-purple-500/50 rounded-xl py-3 pl-10 pr-4 text-white font-bold text-sm outline-none transition-all"
        />
      </div>

      {/* NESTED TAXONOMY TREE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-slate-950/80 border-b border-slate-800 p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">
          <div className="col-span-4 pl-4">Hierarchy Node</div>
          <div className="col-span-3">URL Routing (Slug)</div>
          <div className="col-span-3">Taxonomy Health</div>
          <div className="col-span-2 text-right pr-4">Operations</div>
        </div>

        <div className="divide-y divide-slate-800/50">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold text-xs">No taxonomy data matched parameters.</div>
          ) : filteredCategories.map(category => {
            const catId = category.id || category._id;
            const isExpanded = expandedRows[catId];
            const subs = getSubcategories(catId);
            const hasDescription = !!category.description;

            return (
              <React.Fragment key={catId}>
                {/* MASTER CATEGORY ROW */}
                <div className="grid grid-cols-12 items-center p-3 hover:bg-slate-800/30 transition-colors group">
                  <div className="col-span-4 flex items-center gap-3 pl-2">
                    <button onClick={() => toggleRow(catId)} className={`p-1.5 rounded-lg transition-colors ${subs.length > 0 ? 'bg-slate-800 text-white hover:bg-purple-500' : 'opacity-20 cursor-default'}`}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-500">
                      <Layers size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{category.name}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{subs.length} Linked Sub-Nodes</p>
                    </div>
                  </div>
                  
                  <div className="col-span-3 flex items-center gap-2">
                    <LinkIcon size={12} className="text-slate-600" />
                    <span className="text-xs font-mono text-slate-400">/shop/<span className="text-purple-400">{category.slug}</span></span>
                  </div>

                  <div className="col-span-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${hasDescription ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {hasDescription ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                      {hasDescription ? 'SEO Optimized' : 'Missing Desc'}
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1.5 pr-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal('subcategory', null, catId)} title="Inject Sub-Node" className="p-1.5 bg-slate-950 border border-slate-800 rounded-md text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><Plus size={14} /></button>
                    <button onClick={() => openModal('category', category)} title="Edit Cluster" className="p-1.5 bg-slate-950 border border-slate-800 rounded-md text-purple-500 hover:bg-purple-500 hover:text-white transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(catId, 'category')} title="Purge Cluster" className="p-1.5 bg-slate-950 border border-slate-800 rounded-md text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* EXPANDED SUBCATEGORY ROWS */}
                {isExpanded && subs.map(sub => {
                  const subId = sub.id || sub._id;
                  const hasSubDesc = !!sub.description;
                  return (
                    <div key={subId} className="grid grid-cols-12 items-center p-3 bg-slate-950/40 hover:bg-slate-800/40 transition-colors group">
                      <div className="col-span-4 flex items-center gap-3 pl-12">
                        <div className="w-4 h-[1px] bg-slate-700"></div>
                        <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500">
                          <Component size={12} />
                        </div>
                        <p className="text-xs font-bold text-slate-300">{sub.name}</p>
                      </div>
                      
                      <div className="col-span-3 flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500">/shop/{category.slug}/<span className="text-blue-400">{sub.slug}</span></span>
                      </div>

                      <div className="col-span-3">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${hasSubDesc ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {hasSubDesc ? 'Optimized' : 'Missing Desc'}
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-1.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('subcategory', sub, catId)} className="p-1.5 bg-slate-900 rounded text-blue-500 hover:bg-blue-500 hover:text-white"><Edit2 size={12} /></button>
                        <button onClick={() => handleDelete(subId, 'subcategory')} className="p-1.5 bg-slate-900 rounded text-rose-500 hover:bg-rose-500 hover:text-white"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* UNIFIED DEPLOYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  {editingItem ? 'Reconfigure' : 'Deploy'} {modalMode === 'category' ? 'Master Cluster' : 'Sub-Node'}
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Taxonomy Routing Engine</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-rose-500 transition-colors bg-slate-950 p-2 rounded-xl">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                
                {modalMode === 'subcategory' && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Parent Cluster Linkage</label>
                    <select 
                      required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                    >
                      <option value="">Select Parent Taxonomy...</option>
                      {categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Node Designation (Name)</label>
                    <input 
                      required type="text" placeholder="e.g. Exterior Lighting"
                      value={form.name} onChange={e => handleAutoSlug(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white font-bold outline-none focus:border-purple-500/50" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">URL Routing Identity (Slug)</label>
                    <input 
                      required type="text" 
                      value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-purple-400 font-mono outline-none focus:border-purple-500/50" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2 mb-2">
                    SEO Meta Description <span className={form.description ? 'text-emerald-500' : 'text-amber-500'}>{form.description ? '(Optimized)' : '(Missing)'}</span>
                  </label>
                  <textarea 
                    rows={4} placeholder="Briefly describe this category for search engines..."
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 resize-none outline-none focus:border-purple-500/50" 
                  />
                </div>

              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-colors">
                  Abort
                </button>
                <button type="submit" disabled={isProcessing} className={`px-8 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 ${modalMode === 'category' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'} disabled:opacity-50`}>
                  {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Layers size={14} />} 
                  Execute Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
