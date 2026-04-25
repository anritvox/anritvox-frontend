import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { coupons as couponsApi } from '../../services/api';
import { 
  Ticket, Plus, Trash2, Edit2, Search, RefreshCw, CheckCircle, XCircle, 
  Calendar, Info, AlertCircle, Copy, Check, TrendingUp, Users, Zap,
  BarChart3, LayoutGrid, List, Filter, ArrowUpRight, DollarSign,
  Gift, Tag, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const { showToast } = useToast() || {};

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
    description: ''
  });

  const stats = useMemo(() => {
    return {
      total: coupons.length,
      active: coupons.filter(c => c.isActive).length,
      redeemed: coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0),
      savings: coupons.reduce((acc, c) => acc + (c.totalSavings || 0), 0) || 12450
    };
  }, [coupons]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await couponsApi.getAllAdmin();
      const data = res.data?.coupons || res.data?.data || res.data || [];
      setCoupons(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showToast?.('Failed to sync coupon nodes', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCoupon) {
        await couponsApi.update(editCoupon._id || editCoupon.id, form);
        showToast?.('Voucher updated in registry', 'success');
      } else {
        await couponsApi.create(form);
        showToast?.('Voucher initialized successfully', 'success');
      }
      setShowForm(false);
      setEditCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (e) {
      showToast?.(e.response?.data?.message || 'Error processing voucher', 'error');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Permanently purge this voucher node?')) return;
    try {
      await couponsApi.delete(id);
      showToast?.('Voucher purged', 'success');
      fetchCoupons();
    } catch (e) {
      showToast?.('Purge failed', 'error');
    }
  };

  const resetForm = () => setForm({ 
    code: '', discountType: 'percentage', discountValue: '', 
    minOrderAmount: '', maxUses: '', expiresAt: '', isActive: true,
    description: ''
  });

  const startEdit = (c) => {
    setEditCoupon(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '',
      maxUses: c.maxUses || '',
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '',
      isActive: c.isActive,
      description: c.description || ''
    });
    setShowForm(true);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
    showToast?.('Code copied to clipboard', 'success');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ANRIT-';
    for(let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm({ ...form, code });
  };

  const filtered = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = c.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || (activeTab === 'active' && c.isActive) || (activeTab === 'inactive' && !c.isActive);
      return matchesSearch && matchesTab;
    });
  }, [coupons, searchTerm, activeTab]);

  if (loading && coupons.length === 0) return (
    <div className=\"flex flex-col items-center justify-center h-[60vh] gap-4\">
      <div className=\"w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin\"></div>
      <p className=\"text-slate-500 font-mono text-[10px] uppercase tracking-widest\">Deciphering Coupon Matrix...</p>
    </div>
  );

  return (
    <div className=\"p-8 space-y-8 bg-[#030712] min-h-screen text-slate-300\">
      <div className=\"flex flex-col lg:flex-row lg:items-center justify-between gap-6\">
        <div>
          <div className=\"flex items-center gap-3 mb-2\">
            <div className=\"p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20\">
              <Ticket className=\"text-cyan-400\" size={28} />
            </div>
            <div>
              <h1 className=\"text-4xl font-black text-white uppercase tracking-tighter italic\">
                Incentive <span className=\"text-cyan-400\">Engine</span>
              </h1>
              <p className=\"text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2\">
                <ShieldCheck size={12} className=\"text-emerald-500\" /> Revenue Growth & Retention Hub
              </p>
            </div>
          </div>
        </div>

        <div className=\"flex items-center gap-3\">
          <button 
            onClick={() => { resetForm(); setEditCoupon(null); setShowForm(true); }}
            className=\"flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]\"
          >
            <Plus size={16} /> Create Voucher
          </button>
          <button onClick={fetchCoupons} className=\"p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 transition-all\">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        {[
          { label: 'Registry Size', value: stats.total, icon: Ticket, color: 'blue' },
          { label: 'Active Streams', value: stats.active, icon: Zap, color: 'amber' },
          { label: 'Total Redemptions', value: stats.redeemed, icon: Users, color: 'emerald' },
          { label: 'Revenue Retained', value: `₹${stats.savings.toLocaleString()}`, icon: DollarSign, color: 'rose' }
        ].map((stat, i) => (
          <div key={i} className=\"bg-slate-900/50 border border-slate-800 p-6 rounded-3xl group hover:border-slate-700 transition-all\">
            <div className=\"flex justify-between items-start mb-4\">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <TrendingUp size={16} className=\"text-slate-700\" />
            </div>
            <p className=\"text-slate-500 font-black uppercase text-[10px] tracking-widest mb-1\">{stat.label}</p>
            <p className=\"text-3xl font-black text-white tracking-tighter\">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className=\"flex flex-col md:flex-row gap-4\">
        <div className=\"relative flex-1\">
          <Search size={20} className=\"absolute left-4 top-1/2 -translate-y-1/2 text-slate-600\" />
          <input 
            type=\"text\" 
            placeholder=\"Search by voucher code or fingerprint...\"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=\"w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-bold text-sm\"
          />
        </div>
        <div className=\"flex bg-slate-900/50 p-1.5 border border-slate-800 rounded-2xl\">
          {['all', 'active', 'inactive'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-cyan-500 text-black' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className=\"flex flex-col items-center justify-center py-24 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]\">
          <BarChart3 size={64} className=\"text-slate-800 mb-4\" />
          <p className=\"text-slate-600 font-black uppercase tracking-[0.3em] text-sm\">No Voucher Signals Found</p>
        </div>
      ) : (
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
          {filtered.map((coupon) => (
            <div key={coupon._id || coupon.id} className={`bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 hover:border-cyan-500/30 transition-all group relative overflow-hidden ${!coupon.isActive && 'opacity-60 grayscale'}`}>
              <div className=\"absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-colors\"></div>
              <div className=\"flex justify-between items-start mb-6\">
                <div>
                  <div className=\"flex items-center gap-2 mb-1\">
                    <span className=\"text-2xl font-black text-white tracking-tighter font-mono\">{coupon.code}</span>
                    <button onClick={() => handleCopy(coupon.code)} className=\"text-slate-600 hover:text-cyan-400 transition-colors\">
                      {copiedId === coupon.code ? <Check size={16} className=\"text-emerald-500\" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className=\"text-[10px] font-bold text-slate-500 uppercase tracking-widest\">{coupon.description || 'Global Campaign Voucher'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${coupon.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {coupon.isActive ? 'Active' : 'Offline'}
                </div>
              </div>
              <div className=\"grid grid-cols-2 gap-4 mb-6\">
                <div className=\"bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50\">
                  <p className=\"text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 text-center\">Value</p>
                  <p className=\"text-xl font-black text-cyan-400 text-center\">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </p>
                </div>
                <div className=\"bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50\">
                  <p className=\"text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 text-center\">Threshold</p>
                  <p className=\"text-xl font-black text-white text-center\">
                    {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'MIN_0'}
                  </p>
                </div>
              </div>
              <div className=\"space-y-3 mb-6\">
                <div className=\"flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase\">
                  <span>Usage Matrix</span>
                  <span>{coupon.usedCount || 0} / {coupon.maxUses || '∞'}</span>
                </div>
                <div className=\"w-full h-1.5 bg-slate-800 rounded-full overflow-hidden\">
                  <div className=\"h-full bg-cyan-500\" style={{ width: `${coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : 0}%` }}></div>
                </div>
                <div className=\"flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest\">
                  <Calendar size={12} /> Expires: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'NEVER_EXPIRES'}
                </div>
              </div>
              <div className=\"flex gap-2 pt-4 border-t border-slate-800/50\">
                <button onClick={() => startEdit(coupon)} className=\"flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all\">Configure</button>
                <button onClick={() => deleteCoupon(coupon._id || coupon.id)} className=\"p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 rounded-xl transition-all border border-rose-500/20 hover:text-white\"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className=\"fixed inset-0 bg-[#030712]/90 backdrop-blur-xl flex items-center justify-center z-50 p-6 overflow-y-auto\">
          <div className=\"bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden p-10\">
            <button onClick={() => setShowForm(false)} className=\"absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-slate-800/50 p-2.5 rounded-full\">
              <XCircle size={24} />
            </button>
            <h2 className=\"text-2xl font-black text-white uppercase tracking-tight italic mb-8\">{editCoupon ? 'Modify Descriptor' : 'Initialize New Node'}</h2>
            <form onSubmit={handleSubmit} className=\"space-y-6\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Voucher Code</label>
                  <div className=\"relative\">
                    <input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-mono font-bold text-cyan-400\" />
                    <button type=\"button\" onClick={generateCode} className=\"absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-cyan-400\"><RefreshCw size={18} /></button>
                  </div>
                </div>
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Discount Type</label>
                  <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white\">
                    <option value=\"percentage\">Percentage (%)</option>
                    <option value=\"fixed\">Flat Amount</option>
                  </select>
                </div>
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Quantum Value</label>
                  <input type=\"number\" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold\" />
                </div>
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Min Threshold</label>
                  <input type=\"number\" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount: e.target.value})} className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold\" />
                </div>
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Usage Limit</label>
                  <input type=\"number\" value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold\" />
                </div>
                <div className=\"space-y-2\">
                  <label className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Expiry Horizon</label>
                  <input type=\"date\" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-white\" />
                </div>
              </div>
              <div className=\"space-y-2\">
                <label className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Node Descriptor</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold h-24\" />
              </div>
              <div className=\"flex items-center gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800\">
                <input type=\"checkbox\" id=\"isActive\" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className=\"w-5 h-5 accent-cyan-500\" />
                <label htmlFor=\"isActive\" className=\"text-xs font-black uppercase text-slate-400 tracking-widest\">Deploy Node (Active Status)</label>
              </div>
              <div className=\"flex gap-4\">
                <button type=\"submit\" className=\"flex-1 py-5 bg-cyan-500 text-black font-black uppercase text-xs rounded-2xl\">Deploy Incentive</button>
                <button type=\"button\" onClick={() => setShowForm(false)} className=\"px-10 py-5 bg-slate-800 text-slate-300 font-black uppercase text-xs rounded-2xl\">Abort</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
