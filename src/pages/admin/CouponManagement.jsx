import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Ticket, Percent, IndianRupee, Zap, Calendar, Users, 
  Target, Search, RefreshCw, Plus, Edit2, Trash2, 
  CheckCircle, XCircle, AlertTriangle, Download, 
  Clock, TrendingUp, Filter, ShieldAlert, Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('core');
  const [editingItem, setEditingItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage', // percentage, fixed
    discount_value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    status: 'active'
  });

  const { showToast } = useToast() || {};

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons').catch(() => api.get('/admin/coupons'));
      setCoupons(res.data?.coupons || res.data?.data || res.data || []);
    } catch (err) {
      showToast?.('Failed to synchronize campaign matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- ALGORITHMIC CODE GENERATOR ---
  const generateHash = (length = 8, prefix = '') => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix ? `${prefix}-` : '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code: result });
    showToast?.('Cryptographic hash generated', 'success');
  };

  // --- CRUD OPERATIONS ---
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        code: item.code || '',
        description: item.description || '',
        discount_type: item.discount_type || 'percentage',
        discount_value: item.discount_value || '',
        min_purchase: item.min_purchase || item.min_cart_value || '',
        max_discount: item.max_discount || item.max_discount_amount || '',
        usage_limit: item.usage_limit || '',
        valid_from: item.valid_from ? new Date(item.valid_from).toISOString().slice(0, 16) : '',
        valid_until: item.valid_until ? new Date(item.valid_until).toISOString().slice(0, 16) : '',
        status: item.status || 'active'
      });
    } else {
      setEditingItem(null);
      setForm({
        code: '', description: '', discount_type: 'percentage', discount_value: '',
        min_purchase: '', max_discount: '', usage_limit: '', valid_from: '', valid_until: '', status: 'active'
      });
    }
    setActiveTab('core');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const payload = { ...form };
      // Sanitize empty strings to null for backend numbers
      Object.keys(payload).forEach(key => { if (payload[key] === '') payload[key] = null; });

      if (editingItem) {
        await api.put(`/coupons/${editingItem.id || editingItem._id}`, payload);
        showToast?.('Campaign parameters updated', 'success');
      } else {
        await api.post('/coupons', payload);
        showToast?.('New campaign deployed', 'success');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showToast?.('Campaign deployment failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Purging this campaign will invalidate it for all users immediately. Proceed?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      showToast?.('Campaign purged', 'success');
      fetchCoupons();
    } catch (err) {
      showToast?.('Purge protocol failed', 'error');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/coupons/${id}/status`, { status: newStatus }).catch(() => api.put(`/coupons/${id}`, { status: newStatus }));
      fetchCoupons();
      showToast?.(`Campaign ${newStatus === 'active' ? 'activated' : 'suspended'}`, 'success');
    } catch (err) {}
  };

  // --- TELEMETRY & ANALYTICS ---
  const exportToExcel = () => {
    const worksheetData = coupons.map(c => ({
      'Campaign Hash (Code)': c.code,
      'Internal Designation': c.description || 'N/A',
      'Discount Type': c.discount_type,
      'Discount Value': c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`,
      'Min Purchase (₹)': c.min_purchase || c.min_cart_value || 0,
      'Times Claimed': c.used_count || 0,
      'Max Usage Cap': c.usage_limit || 'Unlimited',
      'Valid From': c.valid_from ? new Date(c.valid_from).toLocaleString() : 'Immediate',
      'Expiry Horizon': c.valid_until ? new Date(c.valid_until).toLocaleString() : 'Never',
      'Status': getCampaignStatus(c).label
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Campaign Matrix");
    XLSX.writeFile(workbook, `Anritvox_Growth_Matrix_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast?.('Telemetry Exported', 'success');
  };

  const getCampaignStatus = (coupon) => {
    const now = new Date();
    if (coupon.status === 'inactive') return { label: 'Suspended', color: 'slate', icon: ShieldAlert };
    if (coupon.valid_from && new Date(coupon.valid_from) > now) return { label: 'Scheduled', color: 'blue', icon: Clock };
    if (coupon.valid_until && new Date(coupon.valid_until) < now) return { label: 'Expired', color: 'rose', icon: XCircle };
    if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) return { label: 'Depleted', color: 'amber', icon: AlertTriangle };
    return { label: 'Live', color: 'emerald', icon: Zap };
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = c.code?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter !== 'all') {
        const status = getCampaignStatus(c).label.toLowerCase();
        return status === statusFilter.toLowerCase();
      }
      return true;
    }).sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
  }, [coupons, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dash Metrics
  const activeCampaigns = coupons.filter(c => getCampaignStatus(c).label === 'Live').length;
  const totalClaims = coupons.reduce((acc, c) => acc + (parseInt(c.used_count) || 0), 0);
  const expiringSoon = coupons.filter(c => {
    if (!c.valid_until) return false;
    const daysLeft = (new Date(c.valid_until) - new Date()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 7;
  }).length;

  if (loading && coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <Ticket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Growth Engine...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Growth <span className="text-amber-500">Matrix</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <TrendingUp size={12} className="text-amber-500" /> Promotional Campaign & Yield Control
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchCoupons} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-all shadow-lg">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportToExcel} className="hidden sm:flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <Download size={14} /> Export
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Plus size={16} /> Deploy Campaign
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-500 z-10"><Zap size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Live Vectors</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{activeCampaigns}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-blue-500 z-10"><Users size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Redemptions</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{totalClaims.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-rose-500 z-10"><Clock size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Expiring Horizon (&lt;7D)</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{expiringSoon}</h4>
          </div>
        </div>
      </div>

      {/* FILTER MATRIX */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-[2rem] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Scan by Hash Code or Designation..." 
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          <select 
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all appearance-none cursor-pointer capitalize"
          >
            <option value="all">All Lifecycles</option>
            <option value="live">Live</option>
            <option value="scheduled">Scheduled</option>
            <option value="depleted">Depleted</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* CAMPAIGN LEDGER TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Campaign Hash</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Yield Logic</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Redemptions</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Time Fencing</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">State</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <Ticket size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No campaigns match active parameters</p>
                  </td>
                </tr>
              ) : paginatedCoupons.map(coupon => {
                const status = getCampaignStatus(coupon);
                const StatusIcon = status.icon;
                const isPerc = coupon.discount_type === 'percentage';

                return (
                  <tr key={coupon.id || coupon._id} className="hover:bg-amber-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center ${isPerc ? 'text-blue-500' : 'text-emerald-500'}`}>
                          {isPerc ? <Percent size={16}/> : <IndianRupee size={16}/>}
                        </div>
                        <div>
                          <p className="text-sm font-black text-amber-400 font-mono tracking-wider">{coupon.code}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[150px]">
                            {coupon.description || 'Standard Promo'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className={`text-sm font-black ${isPerc ? 'text-blue-400' : 'text-emerald-400'}`}>
                        {isPerc ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} FLAT`}
                      </p>
                      {coupon.min_purchase && (
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                          Min Cart: ₹{coupon.min_purchase}
                        </p>
                      )}
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{coupon.used_count || 0}</span>
                          <span className="text-[10px] text-slate-500 font-bold">/ {coupon.usage_limit || '∞'}</span>
                        </div>
                        {coupon.usage_limit && (
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, ((coupon.used_count || 0) / coupon.usage_limit) * 100)}%` }}></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <Calendar size={12} className="text-slate-600"/>
                        {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Indefinite Horizon'}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-${status.color}-500/10 text-${status.color}-500 border border-${status.color}-500/20 shadow-[0_0_10px_rgba(var(--tw-colors-${status.color}-500),0.1)]`}>
                        <StatusIcon size={12} /> {status.label}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => toggleStatus(coupon.id || coupon._id, coupon.status)}
                          className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                          title="Toggle Suspend/Active"
                        >
                          {coupon.status === 'active' ? <Clock size={14} /> : <Zap size={14} />}
                        </button>
                        <button 
                          onClick={() => openModal(coupon)}
                          className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(coupon.id || coupon._id)}
                          className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCoupons.length)} of {filteredCoupons.length}
            </span>
            <div className="flex items-center gap-2 mr-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"><ChevronLeft size={16}/></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* CAMPAIGN DEPLOYMENT ENGINE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300 relative flex flex-col">
            
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-start bg-slate-900/50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    {editingItem ? 'Reconfigure' : 'Deploy'} Campaign Vector
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Advanced Yield & Promotional Routing</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-950 border border-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all shadow-md">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1">
              <div className="flex border-b border-slate-800 px-8 bg-slate-950/30">
                {[
                  { id: 'core', label: 'Hash & Yield', icon: Zap },
                  { id: 'targeting', label: 'Targeting Matrix', icon: Target },
                  { id: 'time', label: 'Time Fencing', icon: Clock }
                ].map(tab => (
                  <button
                    key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                      activeTab === tab.id ? 'border-amber-500 text-amber-400 bg-amber-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon size={14} /> {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar" style={{ minHeight: '350px' }}>
                
                {/* CORE SETTINGS */}
                {activeTab === 'core' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Cryptographic Hash (Code)</label>
                      <div className="flex gap-2">
                        <input 
                          required type="text" placeholder="e.g. SUMMER25"
                          value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase().replace(/\s+/g, '')})}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-amber-400 font-mono font-bold text-lg outline-none focus:border-amber-500/50 uppercase" 
                        />
                        <button type="button" onClick={() => generateHash(8, 'ANR')} className="px-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" title="Auto-Generate Hash">
                          <RefreshCw size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Internal Designation</label>
                      <input 
                        type="text" placeholder="e.g. End of Summer Flash Sale"
                        value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Yield Logic (Type)</label>
                      <select 
                        value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                      >
                        <option value="percentage">Percentage Algorithm (%)</option>
                        <option value="fixed">Fixed Currency (₹)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Yield Value</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                          {form.discount_type === 'percentage' ? '%' : '₹'}
                        </div>
                        <input 
                          required type="number" min="0" step="0.01" placeholder={form.discount_type === 'percentage' ? '20' : '500'}
                          value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-10 text-white font-bold outline-none focus:border-amber-500/50" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TARGETING MATRIX */}
                {activeTab === 'targeting' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Minimum Cart Threshold (₹)</label>
                      <input 
                        type="number" min="0" placeholder="0 = No Minimum"
                        value={form.min_purchase} onChange={e => setForm({...form, min_purchase: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50" 
                      />
                      <p className="text-[9px] font-bold text-slate-600 ml-1 mt-1">Require users to spend this amount to activate the hash.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Max Yield Cap (₹)</label>
                      <input 
                        type="number" min="0" placeholder="Optional cap for % discounts" disabled={form.discount_type !== 'percentage'}
                        value={form.max_discount} onChange={e => setForm({...form, max_discount: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50 disabled:opacity-30 disabled:cursor-not-allowed" 
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Maximum Redemption Cap</label>
                      <input 
                        type="number" min="0" placeholder="Leave empty for unlimited redemptions"
                        value={form.usage_limit} onChange={e => setForm({...form, usage_limit: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500/50" 
                      />
                      <p className="text-[9px] font-bold text-slate-600 ml-1 mt-1">Useful for "First 100 Customers Only" campaigns.</p>
                    </div>
                  </div>
                )}

                {/* TIME FENCING */}
                {activeTab === 'time' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="col-span-2 p-6 bg-blue-500/5 border border-blue-500/20 rounded-[2rem]">
                      <div className="flex items-start gap-4">
                        <Clock size={24} className="text-blue-500 mt-1" />
                        <div>
                          <h4 className="text-sm font-black text-white uppercase tracking-widest">Temporal Routing</h4>
                          <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed">
                            Define the exact window when this payload becomes active. If no dates are set, the campaign is perpetually active until manually suspended.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Activation Horizon (Start Date)</label>
                      <input 
                        type="datetime-local" 
                        value={form.valid_from} onChange={e => setForm({...form, valid_from: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono font-bold outline-none focus:border-amber-500/50 custom-calendar-icon" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Termination Horizon (End Date)</label>
                      <input 
                        type="datetime-local" 
                        value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono font-bold outline-none focus:border-amber-500/50 custom-calendar-icon" 
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-4 mt-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 text-slate-400 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-900 transition-all">
                  Abort
                </button>
                <button type="submit" disabled={isProcessing} className="px-10 py-3.5 bg-amber-500 text-slate-950 font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-400 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50">
                  {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />} 
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
