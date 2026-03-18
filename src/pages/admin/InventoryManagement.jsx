import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API}/api/products?limit=200`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data.products || data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStock = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stock: parseInt(editStock), lowStockThreshold: parseInt(editLowThreshold) || 10 })
      });
      if (res.ok) {
        setMsg('Stock updated!');
        setEditId(null);
        fetchInventory();
      } else { setMsg('Failed to update'); }
    } catch (e) { setMsg('Network error'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const stock = p.stock ?? 0;
    const threshold = p.lowStockThreshold || 10;
    if (filter === 'low') return matchSearch && stock > 0 && stock <= threshold;
    if (filter === 'out') return matchSearch && stock === 0;
    if (filter === 'ok') return matchSearch && stock > threshold;
    return matchSearch;
  });

  const stats = {
    total: products.length,
    outOfStock: products.filter(p => (p.stock ?? 0) === 0).length,
    lowStock: products.filter(p => { const s = p.stock ?? 0; const t = p.lowStockThreshold || 10; return s > 0 && s <= t; }).length,
    healthy: products.filter(p => (p.stock ?? 0) > (p.lowStockThreshold || 10)).length
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-white">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Inventory Management</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{label:'Total Products',val:stats.total,color:'text-cyan-400'},{label:'Healthy Stock',val:stats.healthy,color:'text-green-400'},{label:'Low Stock',val:stats.lowStock,color:'text-yellow-400'},{label:'Out of Stock',val:stats.outOfStock,color:'text-red-400'}].map(s=>(
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {msg && <div className="mb-4 p-3 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm">{msg}</div>}

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
          <option value="all">All Products</option>
          <option value="ok">Healthy Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading inventory...</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Low Threshold</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
              ) : filtered.map(p => {
                const stock = p.stock ?? 0;
                const threshold = p.lowStockThreshold || 10;
                const status = stock === 0 ? 'out' : stock <= threshold ? 'low' : 'ok';
                const statusStyles = { ok: 'bg-green-500/20 text-green-400', low: 'bg-yellow-500/20 text-yellow-400', out: 'bg-red-500/20 text-red-400' };
                const statusLabels = { ok: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };
                return (
                  <tr key={p._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />}
                        <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.sku || p._id?.slice(-6)}</td>
                    <td className="px-4 py-3">
                      {editId === p._id ? (
                        <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)}
                          className="w-20 bg-gray-800 border border-cyan-500 rounded px-2 py-1 text-sm focus:outline-none" />
                      ) : (
                        <span className={stock === 0 ? 'text-red-400 font-bold' : stock <= threshold ? 'text-yellow-400 font-bold' : ''}>{stock}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === p._id ? (
                        <input type="number" value={editLowThreshold} onChange={e => setEditLowThreshold(e.target.value)}
                          className="w-20 bg-gray-800 border border-cyan-500 rounded px-2 py-1 text-sm focus:outline-none" />
                      ) : threshold}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[status]}`}>{statusLabels[status]}</span>
                    </td>
                    <td className="px-4 py-3">
                      {editId === p._id ? (
                        <div className="flex gap-2">
                          <button onClick={() => updateStock(p._id)} disabled={saving}
                            className="px-2 py-1 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs rounded transition-colors">Save</button>
                          <button onClick={() => setEditId(null)}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(p._id); setEditStock(stock); setEditLowThreshold(threshold); }}
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
