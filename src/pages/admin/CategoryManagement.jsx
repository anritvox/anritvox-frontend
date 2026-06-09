import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FolderTree, Plus, Edit2, Trash2, Search, RefreshCw, 
  ChevronRight, ChevronDown, Layers, Link as LinkIcon, 
  AlertTriangle, CheckCircle, Component, XCircle, 
  Activity, BarChart2, Download, Filter, Move, Settings, 
  ShieldAlert, Eye, Server, Zap, PieChart, Info, Database, Terminal
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CategoryManagement() {

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, missing_seo, master_only
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // list, visual
  const [activeInspectorNode, setActiveInspectorNode] = useState(null);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('category'); // 'category' or 'subcategory'
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', category_id: '', is_active: 1, image_url: '' });
  const [isProcessing, setIsProcessing] = useState(false);


  const [auditLogs, setAuditLogs] = useState([]);

  const { showToast } = useToast() || {};


  useEffect(() => { 
    fetchTaxonomy(); 
    generateMockAuditLog();
  }, []);

  const fetchTaxonomy = async () => {
    setLoading(true);
    try {

      const [catRes, subRes] = await Promise.all([
        api.get('/categories'),
        api.get('/subcategories').catch(() => ({ data: { data: [] } }))
      ]);
      
      const rawCategories = catRes.data?.categories || catRes.data?.data || catRes.data || [];
      const rawSubcategories = subRes.data?.subcategories || subRes.data?.data || subRes.data || [];
      
      setCategories(rawCategories);
      setSubcategories(rawSubcategories);
      

      if (rawCategories.length < 20) {
        const initialExpandState = {};
        rawCategories.forEach(c => initialExpandState[c.id || c._id] = true);
        setExpandedRows(initialExpandState);
      }
    } catch (err) {
      console.error("Taxonomy Sync Error:", err);
      showToast?.('Critical failure syncing taxonomy matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAuditLog = () => {
    const logs = [
      { id: 1, action: 'SYSTEM_INIT', target: 'Taxonomy Engine', time: new Date(Date.now() - 86400000).toISOString(), user: 'ROOT' },
      { id: 2, action: 'SYNC_COMPLETE', target: 'Master Categories', time: new Date(Date.now() - 3600000).toISOString(), user: 'SYSTEM' },
      { id: 3, action: 'HEALTH_CHECK', target: 'SEO Meta Tags', time: new Date().toISOString(), user: 'CRON_JOB' },
    ];
    setAuditLogs(logs);
  };

  const logAction = (action, target) => {
    setAuditLogs(prev => [{
      id: Date.now(),
      action,
      target,
      time: new Date().toISOString(),
      user: 'ADMIN'
    }, ...prev].slice(0, 10)); // Keep last 10 logs
  };


  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNodeSelection = (id) => {
    setSelectedNodes(prev => 
      prev.includes(id) ? prev.filter(nodeId => nodeId !== id) : [...prev, id]
    );
  };

  const selectAllNodes = () => {
    if (selectedNodes.length === categories.length + subcategories.length) {
      setSelectedNodes([]);
    } else {
      const allIds = [
        ...categories.map(c => c.id || c._id),
        ...subcategories.map(s => s.id || s._id)
      ];
      setSelectedNodes(allIds);
    }
  };

  const getSubcategories = useCallback((categoryId) => {
    return subcategories.filter(sub => 
      (sub.category_id === categoryId) || 
      (sub.category_id?._id === categoryId) || 
      (sub.category_id?.id === categoryId)
    );
  }, [subcategories]);


  const calculateSEOScore = (item) => {
    let score = 0;
    if (item.name && item.name.length > 3) score += 30;
    if (item.slug && item.slug.length > 3) score += 30;
    if (item.description && item.description.length > 20) score += 40;
    return score;
  };

  const taxonomyMetrics = useMemo(() => {
    const totalClusters = categories.length;
    const totalSubNodes = subcategories.length;
    let totalSEOScore = 0;
    let missingDescCount = 0;

    categories.forEach(c => {
      totalSEOScore += calculateSEOScore(c);
      if (!c.description) missingDescCount++;
    });
    
    subcategories.forEach(s => {
      totalSEOScore += calculateSEOScore(s);
      if (!s.description) missingDescCount++;
    });

    const totalNodes = totalClusters + totalSubNodes;
    const averageHealth = totalNodes > 0 ? Math.round(totalSEOScore / totalNodes) : 0;
    const emptyClusters = categories.filter(c => getSubcategories(c.id || c._id).length === 0).length;

    return { totalClusters, totalSubNodes, totalNodes, averageHealth, missingDescCount, emptyClusters };
  }, [categories, subcategories, getSubcategories]);


  const filteredData = useMemo(() => {
    let processedCategories = [...categories];
    let processedSubcategories = [...subcategories];


    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      processedCategories = processedCategories.filter(c => 
        c.name?.toLowerCase().includes(lowerTerm) || c.slug?.toLowerCase().includes(lowerTerm)
      );

      const parentIds = processedCategories.map(c => c.id || c._id);
      processedSubcategories = processedSubcategories.filter(s => 
        s.name?.toLowerCase().includes(lowerTerm) || 
        s.slug?.toLowerCase().includes(lowerTerm) ||
        parentIds.includes(s.category_id)
      );
    }


    if (filterMode === 'missing_seo') {
      processedCategories = processedCategories.filter(c => !c.description || calculateSEOScore(c) < 100);
      processedSubcategories = processedSubcategories.filter(s => !s.description || calculateSEOScore(s) < 100);
    } else if (filterMode === 'master_only') {
      processedSubcategories = []; // Hide all subs
    }

    return { master: processedCategories, subs: processedSubcategories };
  }, [categories, subcategories, searchTerm, filterMode]);


  const exportTaxonomyCSV = () => {
    logAction('EXPORT_DATA', 'Taxonomy CSV');
    
    const headers = ['Node Level', 'ID', 'Name', 'Slug', 'Parent ID', 'SEO Score', 'Created At'];
    const rows = [];

    categories.forEach(cat => {
      const catId = cat.id || cat._id;
      rows.push(['Master', catId, cat.name, cat.slug, 'NULL', calculateSEOScore(cat), cat.created_at || 'N/A']);
      
      const subs = getSubcategories(catId);
      subs.forEach(sub => {
        rows.push(['Sub-Node', sub.id || sub._id, sub.name, sub.slug, catId, calculateSEOScore(sub), sub.created_at || 'N/A']);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `anritvox_taxonomy_matrix_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const openModal = (mode, item = null, parentId = null) => {
    setModalMode(mode);
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name || '',
        slug: item.slug || '',
        description: item.description || '',
        category_id: item.category_id || parentId || '',
        is_active: item.is_active !== undefined ? item.is_active : 1,
        image_url: item.image_url || ''
      });
    } else {
      setEditingItem(null);
      setForm({ name: '', slug: '', description: '', category_id: parentId || '', is_active: 1, image_url: '' });
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
        logAction('UPDATE_NODE', payload.name);
        showToast?.(`${modalMode === 'category' ? 'Cluster' : 'Sub-Node'} synchronized`, 'success');
      } else {
        await api.post(endpoint, payload);
        logAction('DEPLOY_NODE', payload.name);
        showToast?.(`${modalMode === 'category' ? 'Cluster' : 'Sub-Node'} deployed to matrix`, 'success');
      }
      setIsModalOpen(false);
      fetchTaxonomy();
    } catch (err) {
      console.error("Mutation Error:", err);
      showToast?.('Taxonomy mutation failed due to core integrity fault.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id, mode, skipConfirm = false) => {
    const isCategory = mode === 'category';
    
    if (!skipConfirm) {
      const warning = isCategory 
        ? 'CRITICAL WARNING: Purging a Master Cluster will irrevocably orphan all attached Sub-Nodes and associated products. Execute purge?' 
        : 'Purge this Sub-Node from the taxonomy matrix?';
        
      if (!window.confirm(warning)) return;
    }

    try {
      const endpoint = isCategory ? `/categories/${id}` : `/subcategories/${id}`;
      await api.delete(endpoint);
      logAction('PURGE_NODE', `ID: ${id}`);
      showToast?.('Entity purged from active memory', 'success');
      fetchTaxonomy();
    } catch (err) {
      console.error("Purge Error:", err);
      showToast?.('Purge protocol failed.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNodes.length === 0) return;
    if (!window.confirm(`Execute mass purge on ${selectedNodes.length} nodes? This action is irreversible.`)) return;

    setIsProcessing(true);
    try {

      for (const id of selectedNodes) {

        const isCat = categories.some(c => (c.id || c._id) === id);
        const mode = isCat ? 'category' : 'subcategory';
        await handleDelete(id, mode, true);
      }
      logAction('BULK_PURGE', `${selectedNodes.length} Nodes`);
      setSelectedNodes([]);
    } catch (error) {
      showToast?.('Bulk purge encountered an error.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };


  const renderInspectorPane = () => {
    if (!activeInspectorNode) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/30 border-l border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
            <Eye size={24} className="text-slate-500" />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight mb-2">Telemetry Inspector</h3>
          <p className="text-xs text-slate-500 font-mono">Select any node from the matrix to analyze its localized data payload, SEO health, and relational mapping.</p>
        </div>
      );
    }

    const isMaster = !!activeInspectorNode.isMaster;
    const score = calculateSEOScore(activeInspectorNode);
    const healthColor = score === 100 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
    const healthBg = score === 100 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

    return (
      <div className="h-full flex flex-col bg-slate-900/50 border-l border-slate-800/80 overflow-y-auto animate-in slide-in-from-right-4 duration-300">
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10 flex justify-between items-start">
          <div>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-3 border ${isMaster ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
              {isMaster ? <Layers size={10}/> : <Component size={10}/>}
              {isMaster ? 'Master Cluster' : 'Sub-Node Entity'}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight break-all">{activeInspectorNode.name}</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
              <Server size={10} /> ID: {activeInspectorNode.id || activeInspectorNode._id}
            </p>
          </div>
          <button onClick={() => setActiveInspectorNode(null)} className="p-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-400 transition-colors">
            <XCircle size={16} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {}
          <div className={`p-4 rounded-2xl border ${healthBg}`}>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Activity size={12} /> Optimization Telemetry
            </h4>
            <div className="flex items-end gap-3 mb-4">
              <span className={`text-4xl font-black font-mono leading-none ${healthColor}`}>{score}</span>
              <span className="text-sm font-bold text-slate-500 mb-1">/ 100</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Node Identifier</span>
                <span className={activeInspectorNode.name?.length > 3 ? 'text-emerald-400' : 'text-rose-400'}>
                  {activeInspectorNode.name ? 'Valid' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">URL Slug Integrity</span>
                <span className={activeInspectorNode.slug?.length > 3 ? 'text-emerald-400' : 'text-rose-400'}>
                  {activeInspectorNode.slug ? 'Valid' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Meta Description</span>
                <span className={activeInspectorNode.description?.length > 20 ? 'text-emerald-400' : 'text-amber-400'}>
                  {activeInspectorNode.description ? `${activeInspectorNode.description.length} chars` : 'Null Payload'}
                </span>
              </div>
            </div>
          </div>

          {}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <Database size={12} /> Data Payload
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Routing Slug</span>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-xs text-cyan-400 break-all select-all">
                  /shop/{isMaster ? activeInspectorNode.slug : `parent/${activeInspectorNode.slug}`}
                </div>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Description</span>
                <div className="bg-slate-900 p-3 rounded border border-slate-800 text-xs text-slate-300 min-h-[60px]">
                  {activeInspectorNode.description || <span className="text-slate-600 italic">No semantic description provided.</span>}
                </div>
              </div>
              {isMaster && (
                <div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Linked Entities</span>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-mono text-xs">
                      {getSubcategories(activeInspectorNode.id || activeInspectorNode._id).length} Sub-Nodes
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="flex gap-2">
            <button 
              onClick={() => openModal(isMaster ? 'category' : 'subcategory', activeInspectorNode, isMaster ? null : activeInspectorNode.category_id)}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Edit2 size={14} /> Reconfigure
            </button>
            <button 
              onClick={() => {
                handleDelete(activeInspectorNode.id || activeInspectorNode._id, isMaster ? 'category' : 'subcategory');
                setActiveInspectorNode(null);
              }}
              className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Purge
            </button>
          </div>
        </div>
      </div>
    );
  };


  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/20 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FolderTree size={20} className="text-purple-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-white font-black uppercase tracking-widest text-sm mb-1">Booting Taxonomy Engine</h3>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">Syncing matrix relationships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#030712] text-slate-300 font-sans animate-in fade-in duration-500 relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md z-10 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,247,0.3)]">
              <FolderTree size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                Taxonomy <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Matrix</span>
              </h1>
              <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <ShieldAlert size={10} className="text-purple-500" /> Deep Hierarchical Control System
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {}
            <div className="hidden xl:flex items-center gap-4 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl mr-2">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Global Health</span>
                <span className={`text-sm font-black font-mono leading-none ${taxonomyMetrics.averageHealth >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {taxonomyMetrics.averageHealth}/100
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Total Nodes</span>
                <span className="text-sm font-black text-blue-400 font-mono leading-none">{taxonomyMetrics.totalNodes}</span>
              </div>
            </div>

            <button onClick={fetchTaxonomy} className="p-3 bg-slate-900 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-sm">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={exportTaxonomyCSV} className="p-3 bg-slate-900 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-cyan-400 transition-all shadow-sm group relative">
              <Download size={16} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[9px] font-bold text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">Export CSV</span>
            </button>
            
            <div className="h-8 w-px bg-slate-800 mx-1"></div>

            <button onClick={() => openModal('subcategory')} className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Plus size={14} /> Sub-Node
            </button>
            <button onClick={() => openModal('category')} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(16,185,247,0.3)]">
              <Layers size={14} /> Deploy Cluster
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="px-6 py-3 border-b border-slate-800/50 bg-slate-950/80 z-10 flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-1 w-full gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text" placeholder="Search matrix nodes by name or slug..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500/50 rounded-lg py-2 pl-9 pr-4 text-white text-xs outline-none transition-all"
            />
          </div>
          <div className="relative max-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <select
              value={filterMode} onChange={(e) => setFilterMode(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
            >
              <option value="all">Global Matrix (All)</option>
              <option value="missing_seo">SEO Deficient Only</option>
              <option value="master_only">Master Clusters Only</option>
            </select>
          </div>
        </div>

        {}
        <div className={`flex items-center gap-3 transition-all duration-300 ${selectedNodes.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 font-mono">
            {selectedNodes.length} SELECTED
          </span>
          <button onClick={handleBulkDelete} disabled={isProcessing} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50">
            <Trash2 size={14} /> Mass Purge
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 flex overflow-hidden">
        
        {}
        <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
          {}
          <div className="grid grid-cols-12 bg-slate-950 border-b border-slate-800/80 p-3 text-[9px] font-black uppercase text-slate-500 tracking-widest sticky top-0 z-10 pr-6">
            <div className="col-span-5 pl-2 flex items-center gap-3">
              <button onClick={selectAllNodes} className="w-4 h-4 rounded border border-slate-700 bg-slate-900 flex items-center justify-center hover:border-purple-500 transition-colors">
                {selectedNodes.length > 0 && <div className="w-2 h-2 bg-purple-500 rounded-sm" />}
              </button>
              Hierarchy Node
            </div>
            <div className="col-span-4">SEO Health / Slug</div>
            <div className="col-span-3 text-right">Telemetry</div>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 content-scroll">
            {filteredData.master.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2">
                <FolderTree size={24} className="opacity-50" />
                <span className="font-bold text-xs uppercase tracking-widest">Matrix empty or filtered out.</span>
              </div>
            ) : (
              filteredData.master.map(category => {
                const catId = category.id || category._id;
                const isExpanded = expandedRows[catId];
                const subs = getSubcategories(catId);
                const isSelected = selectedNodes.includes(catId);
                const score = calculateSEOScore(category);
                const isInspecting = activeInspectorNode && (activeInspectorNode.id || activeInspectorNode._id) === catId;

                return (
                  <div key={`master-${catId}`} className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden shadow-sm transition-all hover:border-slate-700/80">
                    {}
                    <div className={`grid grid-cols-12 items-center p-2.5 transition-colors ${isInspecting ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'}`}>
                      <div className="col-span-5 flex items-center gap-3 pl-1">
                        <button onClick={() => toggleNodeSelection(catId)} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'border-purple-500 bg-purple-500/20 text-purple-400' : 'border-slate-700 bg-slate-900'}`}>
                          {isSelected && <CheckCircle size={10} />}
                        </button>
                        <button onClick={() => toggleRow(catId)} className={`p-1 rounded transition-colors ${subs.length > 0 ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'opacity-20 cursor-default'}`}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                          <Layers size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{category.name}</p>
                          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{subs.length} Subs</p>
                        </div>
                      </div>
                      
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-full max-w-[80px] bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 flex-shrink-0">
                          <div className={`h-full ${score === 100 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 truncate">/{category.slug}</span>
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-2 pr-2">
                        <button onClick={() => setActiveInspectorNode({...category, isMaster: true})} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isInspecting ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                          Inspect
                        </button>
                      </div>
                    </div>

                    {}
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-slate-950/50 border-t border-slate-800/50">
                        {subs.length === 0 ? (
                          <div className="py-4 pl-16 text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
                            <Info size={12} className="text-amber-500" /> Empty Cluster. No sub-nodes deployed.
                          </div>
                        ) : (
                          subs.map((sub, index) => {
                            const subId = sub.id || sub._id;
                            const isSubSelected = selectedNodes.includes(subId);
                            const subScore = calculateSEOScore(sub);
                            const isSubInspecting = activeInspectorNode && (activeInspectorNode.id || activeInspectorNode._id) === subId;
                            const isLast = index === subs.length - 1;

                            return (
                              <div key={`sub-${subId}`} className={`grid grid-cols-12 items-center p-2 transition-colors relative ${isSubInspecting ? 'bg-slate-800/60' : 'hover:bg-slate-800/30'}`}>
                                {}
                                <div className="absolute left-[38px] top-0 bottom-0 w-px bg-slate-800" style={{ bottom: isLast ? '50%' : '0' }}></div>
                                <div className="absolute left-[38px] top-1/2 w-4 h-px bg-slate-800"></div>

                                <div className="col-span-5 flex items-center gap-3 pl-[58px]">
                                  <button onClick={() => toggleNodeSelection(subId)} className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${isSubSelected ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-slate-700 bg-slate-900'}`}>
                                    {isSubSelected && <CheckCircle size={8} className="stroke-[3]" />}
                                  </button>
                                  <div className="w-6 h-6 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 flex-shrink-0">
                                    <Component size={10} />
                                  </div>
                                  <p className="text-xs font-semibold text-slate-300 truncate">{sub.name}</p>
                                </div>
                                
                                <div className="col-span-4 flex items-center gap-3">
                                  <div className="w-full max-w-[60px] bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-800 flex-shrink-0">
                                    <div className={`h-full ${subScore === 100 ? 'bg-emerald-500' : subScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${subScore}%` }} />
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-500 truncate">/{sub.slug}</span>
                                </div>

                                <div className="col-span-3 flex justify-end pr-2">
                                  <button onClick={() => setActiveInspectorNode({...sub, isMaster: false})} className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${isSubInspecting ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
                                    Inspect
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {}
        <div className="hidden lg:flex w-80 xl:w-96 flex-col">
          {}
          <div className="flex-1 overflow-hidden">
            {renderInspectorPane()}
          </div>
          
          {}
          <div className="h-1/3 bg-slate-950/80 border-l border-t border-slate-800/80 flex flex-col">
            <div className="p-3 border-b border-slate-800/80 bg-slate-900 flex items-center gap-2">
              <Terminal size={14} className="text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Event Log</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 content-scroll">
              {auditLogs.map(log => (
                <div key={log.id} className="text-[10px] font-mono leading-tight">
                  <span className="text-slate-600">[{new Date(log.time).toLocaleTimeString()}]</span>{' '}
                  <span className="text-blue-400">{log.user}</span>{' '}
                  <span className="text-emerald-400">{log.action}</span>{' '}
                  <span className="text-slate-300">{log.target}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="relative h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500"></div>

            <div className="p-6 border-b border-slate-800/80 flex justify-between items-start bg-slate-950/50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${modalMode === 'category' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                  {modalMode === 'category' ? <Layers size={24} /> : <Component size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    {editingItem ? 'Reconfigure' : 'Initialize'} <span className={modalMode === 'category' ? 'text-purple-400' : 'text-blue-400'}>{modalMode === 'category' ? 'Cluster' : 'Sub-Node'}</span>
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Taxonomy Routing Variables</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-800 hover:bg-rose-500/20 p-2 rounded-xl transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh]">
              <div className="p-6 space-y-6 overflow-y-auto content-scroll">
                
                {}
                {modalMode === 'subcategory' && (
                  <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-3">
                      <LinkIcon size={12} /> Parent Cluster Linkage
                    </label>
                    <select 
                      required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white font-bold outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="">Select Target Parent Matrix...</option>
                      {categories.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Display Designation</label>
                    <input 
                      required type="text" placeholder="e.g. Core Processors"
                      value={form.name} onChange={e => handleAutoSlug(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white font-bold outline-none focus:border-purple-500/50 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">URL Slug (System ID)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-xs">/</span>
                      <input 
                        required type="text" 
                        value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-7 pr-4 text-sm text-cyan-400 font-mono outline-none focus:border-cyan-500/50 transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                {}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">SEO Semantic Payload</label>
                    <span className={`text-[10px] font-mono ${form.description.length > 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {form.description.length} chars
                    </span>
                  </div>
                  <textarea 
                    rows={3} placeholder="Inject metadata for crawler interpretation..."
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-300 resize-none outline-none focus:border-emerald-500/50 transition-colors" 
                  />
                  <p className="text-[9px] text-slate-600 mt-1 font-mono">Minimum 20 characters recommended for optimal PageRank health.</p>
                </div>

                {}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">Logic Gate Status</h4>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Enable or disable client-side routing visibility.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" className="sr-only peer"
                      checked={!!form.is_active} 
                      onChange={(e) => setForm({...form, is_active: e.checked ? 1 : 0})} 
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className={`px-8 py-3 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center gap-2 ${modalMode === 'category' ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'} disabled:opacity-50`}>
                  {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <ShieldAlert size={16} />} 
                  {editingItem ? 'Execute Update' : 'Initialize Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
