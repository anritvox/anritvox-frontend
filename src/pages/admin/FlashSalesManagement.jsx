import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Clock, Calendar, PlayCircle, StopCircle, 
  CheckCircle, AlertCircle, Trash2, Edit2, Plus, 
  Search, RefreshCw, Tag, Percent, XCircle, Activity,
  Package, LayoutDashboard, Timer
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function FlashSalesManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('core'); // 'core' | 'products'

  const { showToast } = useToast() || {};

  const [form, setForm] = useState({
    name: '',
    discount_percentage: '',
    start_time: '',
    end_time: '',
    status: 'active',
    product_ids: [] // Array of linked hardware node IDs
  });

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    setLoading(true);
    try {
      // Parallel fetch: Get campaigns and all products for linkage
      const [campRes, prodRes] = await Promise.all([
        api.get('/flash-sales').catch(() => ({ data: { data: [] } })), // Fallback if endpoint varies
        api.get('/products').catch(() => api.get('/admin/products')).catch(() => ({ data: { data: [] } }))
      ]);
      
      setCampaigns(campRes.data?.data || campRes.data?.campaigns || campRes.data || []);
      setAvailableProducts(prodRes.data?.products || prodRes.data?.data || prodRes.data || []);
    } catch (err) {
      showToast?.('Failed to synchronize Chrono-Matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- TIME & STATUS COMPUTATION ENGINE ---
  const getCampaignState = (campaign) => {
    if (campaign.status === 'inactive') return { label: 'Halted', color: 'slate', icon: StopCircle };
    
    const now = new Date().getTime();
    const start = new Date(campaign.start_time).getTime();
    const end = new Date(campaign.end_time).getTime();

    if (now < start) return { label: 'Upcoming', color: 'blue', icon: Clock };
    if (now >= start && now <= end) return { label: 'Live', color: 'emerald', icon: PlayCircle };
    return { label: 'Expired', color: 'rose', icon: AlertCircle };
  };

  // --- CRUD PROTOCOLS ---
  const openModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setForm({
        name: campaign.name || '',
        discount_percentage: campaign.discount_percentage || campaign.discount || '',
        start_time: campaign.start_time ? new Date(campaign.start_time).toISOString().slice(0, 16) : '',
        end_time: campaign.end_time ? new Date(campaign.end_time).toISOString().slice(0, 16) : '',
        status: campaign.status || 'active',
        product_ids: campaign.products?.map(p => p.id || p._id) || campaign.product_ids || []
      });
    } else {
      setEditingCampaign(null);
      setForm({
        name: '',
        discount_percentage: '',
        start_time: '',
        end_time: '',
        status: 'active',
        product_ids: []
      });
    }
    setActiveTab('core');
    setIsModalOpen(true);
  };

  const handleToggleProduct = (productId) => {
    setForm(prev => {
      const isSelected = prev.product_ids.includes(productId);
      return {
        ...prev,
        product_ids: isSelected 
          ? prev.product_ids.filter(id => id !== productId)
          : [...prev.product_ids, productId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start = new Date(form.start_time).getTime();
    const end = new Date(form.end_time).getTime();
    
    if (end <= start) {
      showToast?.('End time must be after start time.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const payload = { ...form };
      if (editingCampaign) {
        await api.put(`/flash-sales/${editingCampaign.id || editingCampaign._id}`, payload);
        showToast?.('Campaign parameters updated.', 'success');
      } else {
        await api.post('/flash-sales', payload);
        showToast?.('New flash deployment live.', 'success');
      }
      setIsModalOpen(false);
      fetchMatrixData();
    } catch (err) {
      showToast?.('Deployment sequence failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently purge this campaign? This will un-link all products.')) return;
    try {
      await api.delete(`/flash-sales/${id}`);
      showToast?.('Campaign purged.', 'success');
      fetchMatrixData();
    } catch (err) {
      showToast?.('Purge failed.', 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/flash-sales/${id}/status`, { status: newStatus }).catch(() => 
        api.put(`/flash-sales/${id}`, { status: newStatus })
      );
      showToast?.(`Campaign ${newStatus}`, 'success');
      fetchMatrixData();
    } catch (err) {
      showToast?.('State mutation failed', 'error');
    }
  };

  // --- ANALYTICS & PIPELINE FILTERING ---
  const enrichedCampaigns = campaigns.map(c => ({ ...c, computedState: getCampaignState(c) }));

  const filteredCampaigns = useMemo(() => {
    return enrichedCampaigns.filter(c => {
      const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.computedState.label.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  }, [enrichedCampaigns, searchTerm, statusFilter]);

  // Telemetry KPIs
  const totalCampaigns = campaigns.length;
  const liveCount = enrichedCampaigns.filter(c => c.computedState.label === 'Live').length;
  const upcomingCount = enrichedCampaigns.filter(c => c.computedState.label === 'Upcoming').length;
  const avgDiscount = campaigns.length > 0 
    ? (campaigns.reduce((acc, c) => acc + parseFloat(c.discount_percentage || 0), 0) / campaigns.length).toFixed(1)
    : 0;

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Chrono-Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Flash <span className="text-amber-500">Scheduler</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <Timer size={12} className="text-amber-500" /> Advanced Chronological Event Matrix
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMatrixData} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-all shadow-lg">
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500/10 border border-amber-500/50 text-amber-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <Zap size={16} /> Deploy Campaign
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-500 z-10"><PlayCircle size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Live Drops</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{liveCount}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-blue-500 z-10"><Clock size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Upcoming Events</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{upcomingCount}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-amber-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-amber-500 z-10"><Percent size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Avg Markdown</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{avgDiscount}%</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-purple-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-purple-500 z-10"><LayoutDashboard size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Campaigns</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{totalCampaigns}</h4>
          </div>
        </div>
      </div>

      {/* FILTER MATRIX */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-[2rem] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Scan by Campaign Designation..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          <select 
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all appearance-none cursor-pointer capitalize"
          >
            <option value="all">All Chrono-States</option>
            <option value="live">Live Now</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Expired</option>
            <option value="halted">Halted</option>
          </select>
        </div>
      </div>

      {/* CHRONOLOGICAL CAMPAIGN TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Campaign Identity</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Chrono-State</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Validity Horizon</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Hardware Impact</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <Zap size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No campaigns active in this vector</p>
                  </td>
                </tr>
              ) : filteredCampaigns.map(campaign => {
                const state = campaign.computedState;
                const StateIcon = state.icon;
                const productCount = campaign.product_ids?.length || campaign.products?.length || 0;

                return (
                  <tr key={campaign.id || campaign._id} className="hover:bg-amber-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center bg-${state.color}-500/10 border-${state.color}-500/30 text-${state.color}-500`}>
                          <Zap size={20} className={state.label === 'Live' ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white tracking-tight">{campaign.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[9px] font-black uppercase tracking-widest">
                              {campaign.discount_percentage || campaign.discount}% OFF
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-${state.color}-500/10 text-${state.color}-500 border border-${state.color}-500/20`}>
                        <StateIcon size={12} /> {state.label}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <PlayCircle size={12} className="text-emerald-500" /> 
                          {new Date(campaign.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <StopCircle size={12} className="text-rose-500" /> 
                          {new Date(campaign.end_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg inline-flex">
                        <Package size={14} /> {productCount} Nodes Linked
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(campaign.id || campaign._id, campaign.status)}
                          className={`p-2 bg-slate-950 border border-slate-800 rounded-xl transition-all ${campaign.status === 'active' ? 'text-amber-500 hover:bg-amber-500 hover:text-black' : 'text-emerald-500 hover:bg-emerald-500 hover:text-black'}`}
                          title={campaign.status === 'active' ? 'Halt Campaign' : 'Activate Campaign'}
                        >
                          {campaign.status === 'active' ? <StopCircle size={16} /> : <PlayCircle size={16} />}
                        </button>
                        <button onClick={() => openModal(campaign)} className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(campaign.id || campaign._id)} className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEPLOYMENT COMMAND MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-start bg-amber-500/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                    <Zap size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {editingCampaign ? 'Reconfigure' : 'Deploy'} Campaign
                  </h2>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 ml-14">Chronological Markdown Engine</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-rose-500 transition-colors p-2 bg-slate-950 rounded-xl border border-slate-800">
                <XCircle size={20} />
              </button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 px-8 bg-slate-950/30">
              <button
                onClick={() => setActiveTab('core')}
                className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'core' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Clock size={14} /> Chrono Parameters
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'products' ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Package size={14} /> Hardware Linkage
                <span className="ml-2 bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[8px]">{form.product_ids.length}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-8 min-h-[350px] max-h-[500px] overflow-y-auto custom-scrollbar">
                
                {/* CORE CONFIGURATION */}
                {activeTab === 'core' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Campaign Designation</label>
                        <input 
                          type="text" required placeholder="e.g. Cyber Monday Drop"
                          value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-amber-500/50 transition-all text-lg" 
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Markdown Vector (%)</label>
                        <div className="relative">
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                          <input 
                            type="number" required min="1" max="99" placeholder="e.g. 25"
                            value={form.discount_percentage} onChange={e => setForm({...form, discount_percentage: e.target.value})}
                            className="w-full bg-slate-950 border border-amber-500/30 rounded-xl p-4 pl-12 text-amber-400 font-black outline-none focus:border-amber-500 transition-all text-xl" 
                          />
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4 md:col-span-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4"><Calendar size={14}/> Validity Horizon</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Ignition Time</label>
                            <input 
                              type="datetime-local" required
                              value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs outline-none focus:border-emerald-500" 
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Termination Time</label>
                            <input 
                              type="datetime-local" required
                              value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs outline-none focus:border-rose-500" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PRODUCT LINKAGE */}
                {activeTab === 'products' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
                      Select Hardware Nodes to receive the <span className="text-amber-500">{form.discount_percentage || 'X'}%</span> markdown during the validity horizon.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {availableProducts.length === 0 ? (
                        <div className="col-span-2 text-center text-slate-600 font-bold text-xs p-8 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                          No hardware nodes found in registry.
                        </div>
                      ) : availableProducts.map(product => {
                        const isSelected = form.product_ids.includes(product.id || product._id);
                        return (
                          <div 
                            key={product.id || product._id}
                            onClick={() => handleToggleProduct(product.id || product._id)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                          >
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-white'}`}>{product.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono mt-0.5">₹{product.price}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'bg-transparent border-slate-700'}`}>
                              {isSelected && <CheckCircle size={12} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3.5 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-900 transition-all">
                  Abort Integration
                </button>
                <button type="submit" disabled={isProcessing} className="px-8 py-3.5 bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all flex items-center gap-2 disabled:opacity-50">
                  {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />} 
                  Execute Deployment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
