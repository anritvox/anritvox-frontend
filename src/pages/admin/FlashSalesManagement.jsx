import React, { useState, useEffect } from 'react';
import { flashSales as flashSalesApi, products as productsApi } from '../../services/api';
import { Zap, Plus, Edit2, Trash2, Power, Calendar, Tag, RefreshCw, AlertCircle } from 'lucide-react';

export default function FlashSalesManagement() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', discount_percent: 20, start_date: '', end_date: '', product_ids: [], is_active: true });

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
      setProducts(res.data?.products || res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await flashSalesApi.update(editingId, form);
      } else {
        await flashSalesApi.create(form);
      }
      setShowForm(false);
      resetForm();
      fetchSales();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flash sale?')) return;
    try {
      await flashSalesApi.delete(id);
      fetchSales();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await flashSalesApi.toggleStatus(id);
      fetchSales();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const resetForm = () => {
    setForm({ name: '', discount_percent: 20, start_date: '', end_date: '', product_ids: [], is_active: true });
    setEditingId(null);
  };

  const editSale = (sale) => {
    setForm({ name: sale.name, discount_percent: sale.discount_percent, start_date: sale.start_date?.split('T')[0] || '', end_date: sale.end_date?.split('T')[0] || '', product_ids: sale.product_ids || [], is_active: sale.is_active });
    setEditingId(sale.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Flash Sales Scheduler</h2>
          <p className="text-slate-500 font-medium mt-1">Create time-limited discount campaigns</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSales} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition">
            <Plus size={14} /> New Flash Sale
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-900 text-lg mb-4">{editingId ? 'Edit' : 'Create'} Flash Sale</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Sale Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="number" placeholder="Discount %" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: parseInt(e.target.value)})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="datetime-local" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm">{editingId ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
          <Zap size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-bold">No flash sales yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sales.map(sale => (
            <div key={sale.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-black text-slate-900">{sale.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sale.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {sale.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">{sale.discount_percent}% OFF</span>
                </div>
                <div className="text-xs text-slate-500">
                  <Calendar size={12} className="inline mr-1" />
                  {new Date(sale.start_date).toLocaleDateString('en-IN')} - {new Date(sale.end_date).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleStatus(sale.id)} className="p-2 hover:bg-slate-100 rounded-lg transition" title="Toggle Status">
                  <Power size={16} className={sale.is_active ? 'text-emerald-500' : 'text-slate-400'} />
                </button>
                <button onClick={() => editSale(sale)} className="p-2 hover:bg-slate-100 rounded-lg transition" title="Edit">
                  <Edit2 size={16} className="text-blue-500" />
                </button>
                <button onClick={() => handleDelete(sale.id)} className="p-2 hover:bg-slate-100 rounded-lg transition" title="Delete">
                  <Trash2 size={16} className="text-rose-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
