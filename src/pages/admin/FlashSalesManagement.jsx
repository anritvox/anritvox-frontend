import React, { useState, useEffect } from 'react';
import { flashSales as flashSalesApi, products as productsApi } from '../../services/api';
import { Zap, Plus, Edit2, Trash2, Power, Calendar, Tag, RefreshCw, AlertCircle, Clock, Shield, BarChart3, ChevronRight, Activity, Box, Lock, LayoutGrid } from 'lucide-react';

export default function FlashSalesManagement() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    discount_percent: 20, 
    start_date: '', 
    end_date: '', 
    product_ids: [], 
    is_active: true,
    limit_per_user: 1
  });

  useEffect(() => { fetchSales(); fetchProducts(); }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await flashSalesApi.getAll();
      setSales(res.data?.flashSales || res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await productsApi.getAllAdmin();
      setProducts(res.data?.products || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await flashSalesApi.update(editingId, form);
      } else {
        await flashSalesApi.create(form);
      }
      resetForm();
      fetchSales();
    } catch (err) {
      console.error(err);
      alert('Node synchronization failed. Check backend uplink.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate this flash sequence?')) return;
    try {
      await flashSalesApi.delete(id);
      fetchSales();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({ name: '', discount_percent: 20, start_date: '', end_date: '', product_ids: [], is_active: true, limit_per_user: 1 });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (sale) => {
    setForm({
      name: sale.name,
      discount_percent: sale.discount_percent,
      start_date: sale.start_date.split('.')[0],
      end_date: sale.end_date.split('.')[0],
      product_ids: sale.product_ids || [],
      is_active: sale.is_active,
      limit_per_user: sale.limit_per_user || 1
    });
    setEditingId(sale._id);
    setShowForm(true);
  };

  if (loading) return (
    <div className=\"flex flex-col items-center justify-center min-h-[60vh] space-y-4\">
      <RefreshCw className=\"w-12 h-12 text-amber-500 animate-spin\" />
      <p className=\"text-slate-500 font-black uppercase tracking-widest text-xs\">Synchronizing Flash Protocols...</p>
    </div>
  );

  return (
    <div className=\"p-8 space-y-12 bg-[#020617] min-h-screen text-slate-200 font-sans\">
      {/* Header Section */}
      <div className=\"flex justify-between items-end border-b border-slate-800 pb-8\">
        <div>
          <h1 className=\"text-6xl font-black italic tracking-tighter text-white uppercase flex items-center gap-4\">
            Flash <Zap className=\"w-12 h-12 text-amber-500 fill-amber-500\" /> Scheduler
          </h1>
          <p className=\"text-slate-500 font-bold mt-2 flex items-center gap-2\">
            <Activity className=\"w-4 h-4 text-emerald-500\" /> TEMPORAL PRICING NODES & DISPATCH CONTROL
          </p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className=\"px-10 py-5 bg-white text-black font-black uppercase tracking-tighter hover:bg-amber-500 transition-all rounded-full flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95\"
        >
          <Plus className=\"w-6 h-6\" /> Initialize Sequence
        </button>
      </div>

      {/* Analytics Ticker */}
      <div className=\"grid grid-cols-4 gap-6\">
        {[
          { label: 'Active Sequences', val: sales.filter(s => s.is_active).length, icon: Power, color: 'text-emerald-500' },
          { label: 'Scheduled Nodes', val: sales.length, icon: Calendar, color: 'text-blue-500' },
          { label: 'Avg Markdown', val: '24.5%', icon: Tag, color: 'text-amber-500' },
          { label: 'Throughput', val: '1.2k/hr', icon: BarChart3, color: 'text-purple-500' }
        ].map((stat, i) => (
          <div key={i} className=\"bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-6\">
            <div className={`p-4 rounded-2xl bg-slate-950 ${stat.color}`}>
              <stat.icon className=\"w-6 h-6\" />
            </div>
            <div>
              <p className=\"text-[10px] font-black text-slate-500 uppercase\">{stat.label}</p>
              <p className=\"text-2xl font-black text-white\">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className=\"grid grid-cols-12 gap-8\">
        {/* Flash Registry */}
        <div className=\"col-span-8 space-y-4\">
          <div className=\"flex items-center gap-4 mb-6\">
            <LayoutGrid className=\"w-5 h-5 text-amber-500\" />
            <h2 className=\"text-xl font-black uppercase tracking-widest text-white\">Active Node Registry</h2>
          </div>
          
          <div className=\"grid gap-4\">
            {sales.length === 0 ? (
              <div className=\"bg-slate-950 border-2 border-dashed border-slate-800 p-20 rounded-[3rem] text-center\">
                <Shield className=\"w-16 h-16 text-slate-700 mx-auto mb-4\" />
                <p className=\"text-slate-500 font-bold uppercase\">No Active Flash Sequences Detected</p>
              </div>
            ) : (
              sales.map((sale) => (
                <div key={sale._id} className=\"group relative bg-slate-900/30 border border-slate-800 p-8 rounded-[2.5rem] hover:bg-slate-900/50 hover:border-amber-500/50 transition-all overflow-hidden\">
                  <div className=\"absolute top-0 right-0 p-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity\">
                    <button onClick={() => startEdit(sale)} className=\"p-3 bg-slate-950 rounded-full hover:bg-amber-500 hover:text-black transition-colors\">
                      <Edit2 className=\"w-5 h-5\" />
                    </button>
                    <button onClick={() => handleDelete(sale._id)} className=\"p-3 bg-slate-950 rounded-full hover:bg-red-500 transition-colors\">
                      <Trash2 className=\"w-5 h-5\" />
                    </button>
                  </div>

                  <div className=\"flex items-start justify-between\">
                    <div className=\"space-y-4\">
                      <div className=\"flex items-center gap-3\">
                        <span className={`w-3 h-3 rounded-full animate-pulse ${sale.is_active ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`} />
                        <h3 className=\"text-2xl font-black text-white uppercase italic tracking-tighter\">{sale.name}</h3>
                        <span className=\"px-4 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase\">
                          -{sale.discount_percent}% OFF
                        </span>
                      </div>
                      
                      <div className=\"flex items-center gap-8 text-slate-400\">
                        <div className=\"flex items-center gap-2\">
                          <Clock className=\"w-4 h-4 text-slate-600\" />
                          <span className=\"text-xs font-bold uppercase tracking-widest\">
                            {new Date(sale.start_date).toLocaleDateString()} → {new Date(sale.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className=\"flex items-center gap-2\">
                          <Box className=\"w-4 h-4 text-slate-600\" />
                          <span className=\"text-xs font-bold uppercase tracking-widest\">{sale.product_ids?.length || 0} Registered Nodes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className=\"col-span-4 space-y-6\">
          <div className=\"bg-slate-900 border border-slate-800 p-8 rounded-[3rem] sticky top-8\">
            <h3 className=\"text-lg font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8\">
              <Lock className=\"w-5 h-5 text-amber-500\" /> Deployment Logic
            </h3>
            
            <div className=\"space-y-4\">
              {[
                'Global Price Override',
                'Inventory Locking',
                'Anti-Bot Protection',
                'Cache Purging',
                'Temporal Sync'
              ].map((item, i) => (
                <div key={i} className=\"flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800/50\">
                  <span className=\"text-[10px] font-black uppercase text-slate-400\">{item}</span>
                  <div className=\"w-8 h-4 bg-emerald-500/20 rounded-full flex items-center px-1\">
                    <div className=\"w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]\" />
                  </div>
                </div>
              ))}
            </div>

            <div className=\"mt-8 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl\">
              <p className=\"text-[10px] font-black text-amber-500/80 uppercase leading-relaxed\">
                All flash sequences are subject to temporal verification. Discrepancies in system time may cause node desync.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className=\"fixed inset-0 bg-black/90 backdrop-blur-3xl z-50 flex items-center justify-center p-8\">
          <div className=\"bg-[#020617] border border-slate-800 w-full max-w-4xl p-12 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden\">
            <div className=\"absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent\" />
            
            <div className=\"flex justify-between items-center mb-10\">
              <h2 className=\"text-4xl font-black italic tracking-tighter text-white uppercase\">
                {editingId ? 'Modify Sequence' : 'New Deployment'}
              </h2>
              <button onClick={resetForm} className=\"text-slate-500 hover:text-white transition-colors\">
                <Plus className=\"w-8 h-8 rotate-45\" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className=\"grid grid-cols-2 gap-8\">
              <div className=\"col-span-2 space-y-2\">
                <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Operation Codename</label>
                <input 
                  type=\"text\" 
                  required
                  placeholder=\"e.g. MIDNIGHT_SURGE_ALPHA\"
                  className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500 transition-all placeholder:text-slate-700 uppercase\"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                />
              </div>

              <div className=\"space-y-2\">
                <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Discount Magnitude (%)</label>
                <input 
                  type=\"number\" 
                  className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500 transition-all\"
                  value={form.discount_percent}
                  onChange={(e) => setForm({...form, discount_percent: e.target.value})}
                />
              </div>

              <div className=\"space-y-2\">
                <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Purchase Limit / User</label>
                <input 
                  type=\"number\" 
                  className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500 transition-all\"
                  value={form.limit_per_user}
                  onChange={(e) => setForm({...form, limit_per_user: e.target.value})}
                />
              </div>

              <div className=\"space-y-2\">
                <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Start Timeline</label>
                <input 
                  type=\"datetime-local\" 
                  required
                  className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500 transition-all\"
                  value={form.start_date}
                  onChange={(e) => setForm({...form, start_date: e.target.value})}
                />
              </div>

              <div className=\"space-y-2\">
                <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">End Timeline</label>
                <input 
                  type=\"datetime-local\" 
                  required
                  className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-amber-500 transition-all\"
                  value={form.end_date}
                  onChange={(e) => setForm({...form, end_date: e.target.value})}
                />
              </div>

              <div className=\"col-span-2 space-y-4\">
                <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2 flex items-center gap-2\">
                  <Box className=\"w-3 h-3\" /> Hardware Node Registry
                </label>
                <div className=\"mt-2 p-4 bg-slate-950 border border-slate-800 rounded-[2rem] h-[280px] overflow-y-auto space-y-2 custom-scrollbar\">
                  {products.map(p => (
                    <div key={p.id} className=\"flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-colors\">
                      <input 
                        type=\"checkbox\"
                        className=\"w-5 h-5 accent-amber-500\"
                        checked={form.product_ids.includes(p.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked ? [...form.product_ids, p.id] : form.product_ids.filter(id => id !== p.id);
                          setForm({...form, product_ids: newIds});
                        }}
                      />
                      <div className=\"flex-1\">
                        <p className=\"text-xs font-black text-white uppercase\">{p.name}</p>
                        <p className=\"text-[9px] font-bold text-slate-500\">₹{p.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className=\"col-span-2 flex justify-end gap-4 mt-4\">
                <button type=\"button\" onClick={resetForm} className=\"px-8 py-4 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-sm hover:text-white transition-all\">
                  Abort
                </button>
                <button type=\"submit\" className=\"px-12 py-4 bg-amber-500 text-black rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 transition-all\">
                  {editingId ? 'Apply Configuration' : 'Confirm Deployment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
