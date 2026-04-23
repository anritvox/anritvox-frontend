import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit3, Trash2, ExternalLink, Activity, Filter, Archive } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast() || {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProductsList(pRes.data?.data || pRes.data || []);
      setCategories(cRes.data || []);
    } catch (error) {
      showToast?.('Registry synchronization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm product de-registration?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast?.('Product purged from database', 'success');
      fetchData();
    } catch (error) {
      showToast?.('De-registration failed', 'error');
    }
  };

  const filteredProducts = productsList.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Package className="text-emerald-500" /> Product Audit
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Inventory Lifecycle & Taxonomy Control</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-emerald-500 transition-colors" size={18} />
            <input 
              placeholder="Search catalog..." 
              className="bg-slate-900/50 border border-slate-800 px-12 py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all w-full md:w-64 text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-emerald-500 text-slate-950 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all">
            <Plus size={16} /> New Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] space-y-2">
          <div className="text-white font-black text-3xl">{productsList.length}</div>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total SKU Count</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] space-y-2">
          <div className="text-emerald-500 font-black text-3xl">{productsList.filter(p => p.stock_status === 'in_stock').length}</div>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Available Assets</div>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2rem] space-y-2">
          <div className="text-rose-500 font-black text-3xl">{productsList.filter(p => p.quantity < 10).length}</div>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Critical Stock Level</div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2rem] space-y-2">
          <div className="text-blue-500 font-black text-3xl">{categories.length}</div>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active Taxonomies</div>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Entity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Registry ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valuation</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden group-hover:scale-110 transition-transform">
                        <img src={p.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div>
                        <div className="font-black text-white uppercase text-sm tracking-tight">{p.name}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{p.category_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-mono text-slate-500">#{p.id?.toString().slice(-8)}</td>
                  <td className="px-8 py-6">
                    <div className="font-black text-emerald-400">₹{p.price}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Retail Price</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                      p.quantity > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {p.quantity > 0 ? 'Functional' : 'Depleted'} ({p.quantity})
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90">
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-3 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-400 transition-all active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Archive className="mx-auto text-slate-800" size={64} />
            <div className="text-slate-600 font-black uppercase tracking-[0.3em]">No Catalog Data Synchronized</div>
          </div>
        )}
      </div>
    </div>
  );
}
