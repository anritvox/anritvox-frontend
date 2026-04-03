import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function InventoryManagement() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editLowThreshold, setEditLowThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [filter, setFilter] = useState('all');
  const [quickAddId, setQuickAddId] = useState(null);
  const [quickAddQty, setQuickAddQty] = useState('');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/admin/all'); 
      const data = res.data;
      setProducts(data.products || data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const updateStock = async (id) => {
    setSaving(true);
    try {
      await api.put(`/products/${id}/stock`, {
        stock: parseInt(editStock),
        lowStockThreshold: parseInt(editLowThreshold) || 10
      });
      showMsg('Stock updated successfully!');
      setEditId(null);
      fetchInventory();
    } catch (e) { showMsg('Failed to update stock', 'error'); }
    setSaving(false);
  };

  const quickAddStock = async (id) => {
    const qty = parseInt(quickAddQty);
    if (!qty || qty === 0) return;
    setSaving(true);
    try {
      await api.post(`/products/${id}/stock`, { adjustment: qty });
      showMsg(`Stock ${qty > 0 ? 'added' : 'removed'}: ${Math.abs(qty)} units`);
      setQuickAddId(null);
      setQuickAddQty('');
      fetchInventory();
    } catch (e) { showMsg('Failed to adjust stock', 'error'); }
    setSaving(false);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const stock = p.quantity ?? p.stock ?? 0;
    const threshold = p.low_stock_threshold || p.lowStockThreshold || 10;
    if (filter === 'low') return matchSearch && stock > 0 && stock <= threshold;
    if (filter === 'out') return matchSearch && stock === 0;
    if (filter === 'ok') return matchSearch && stock > threshold;
    return matchSearch;
  });

  const getStock = (p) => p.quantity ?? p.stock ?? 0;
  const getThreshold = (p) => p.low_stock_threshold || p.lowStockThreshold || 10;

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => getStock(p) === 0).length,
    lowStock: products.filter(p => { const s = getStock(p); const t = getThreshold(p); return s > 0 && s <= t; }).length,
    healthy: products.filter(p => getStock(p) > getThreshold(p)).length
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Inventory Management</h2>
      <p className="text-gray-400 text-sm mb-6">Manage product stock levels, set low-stock alerts, and adjust inventory in real-time.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{label:'Total Products',val:stats.total,color:'text-cyan-400',bg:'bg-cyan-500/10'},
          {label:'Healthy Stock',val:stats.healthy,color:'text-green-400',bg:'bg-green-500/10'},
          {label:'Low Stock',val:stats.lowStock,color:'text-yellow-400',bg:'bg-yellow-500/10'},
          {label:'Out of Stock',val:stats.outOfStock,color:'text-red-400',bg:'bg-red-500/10'}].map(s=>(
          <div key={s.label} className={`${s.bg} border border-gray-700 rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {msg && <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
        msgType === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
      }`}>{msg}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-48 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
          <option value="all">All Products</option>
          <option value="ok">Healthy Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <button onClick={fetchInventory} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 text-sm rounded-lg hover:bg-cyan-500/30 transition-colors">
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading inventory...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                <th className="text-left py-3 px-2">Product</th>
                <th className="text-left py-3 px-2">SKU</th>
                <th className="text-center py-3 px-2">Stock</th>
                <th className="text-center py-3 px-2">Low Alert</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-center py-3 px-2">Quick Add</th>
                <th className="text-center py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No products found</td></tr>
              ) : filtered.map(p => {
                const stock = getStock(p);
                const threshold = getThreshold(p);
                const status = stock === 0 ? 'out' : stock <= threshold ? 'low' : 'ok';
                const statusStyles = { ok: 'bg-green-500/20 text-green-400', low: 'bg-yellow-500/20 text-yellow-400', out: 'bg-red-500/20 text-red-400' };
                const statusLabels = { ok: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };
                return (
                  <tr key={p.id || p._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />}
                        <span className="font-medium text-white truncate max-w-32">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-gray-400">{p.sku || p._id?.slice(-6) || p.id}</td>
                    <td className="py-3 px-2 text-center">
                      {editId === (p.id || p._id) ? (
                        <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)}
                          className="w-20 bg-gray-800 border border-cyan-500 rounded px-2 py-1 text-sm text-center focus:outline-none" />
                      ) : (
                        <span className={`font-bold text-lg ${stock === 0 ? 'text-red-400' : stock <= threshold ? 'text-yellow-400' : 'text-white'}`}>{stock}</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {editId === (p.id || p._id) ? (
                        <input type="number" value={editLowThreshold} onChange={e => setEditLowThreshold(e.target.value)}
                          className="w-20 bg-gray-800 border border-cyan-500 rounded px-2 py-1 text-sm text-center focus:outline-none" />
                      ) : threshold}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[status]}`}>{statusLabels[status]}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {quickAddId === (p.id || p._id) ? (
                        <div className="flex items-center gap-1 justify-center">
                          <input type="number" value={quickAddQty} onChange={e => setQuickAddQty(e.target.value)}
                            placeholder="+/-qty" className="w-16 bg-gray-800 border border-green-500 rounded px-1 py-1 text-xs text-center focus:outline-none" />
                          <button onClick={() => quickAddStock(p.id || p._id)} disabled={saving}
                            className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30">OK</button>
                          <button onClick={() => { setQuickAddId(null); setQuickAddQty(''); }}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">X</button>
                        </div>
                      ) : (
                        <button onClick={() => { setQuickAddId(p.id || p._id); setQuickAddQty(''); }}
                          className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded hover:bg-green-500/30 transition-colors">+ Add</button>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {editId === (p.id || p._id) ? (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => updateStock(p.id || p._id)} disabled={saving}
                            className="px-2 py-1 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs rounded">Save</button>
                          <button onClick={() => setEditId(null)}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(p.id || p._id); setEditStock(stock); setEditLowThreshold(threshold); }}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-xs rounded transition-colors">Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
