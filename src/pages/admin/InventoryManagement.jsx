import React, { useState, useEffect } from 'react';
import api, { inventory } from '../../services/api';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventory.get(); 
      const data = res.data;
      setProducts(Array.isArray(data) ? data : (data?.products || []));
    } catch (e) { 
      console.error(e); 
      setProducts([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const quickAddStock = async (id, qty) => {
    try {
      // Use core API instance for specific add/subtract operation mapping if not supported natively in inventory.updateStock
      await api.put(`/inventory/${id}/stock`, { stock: Math.abs(qty), operation: qty > 0 ? 'add' : 'subtract' });
      fetchInventory();
    } catch (e) { alert('Failed to adjust stock'); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Inventory Management</h2>
      {loading ? <div className="text-center text-gray-400 py-12">Loading inventory...</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                <th className="text-left py-3 px-2">Product</th>
                <th className="text-center py-3 px-2">Stock</th>
                <th className="text-center py-3 px-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id || p._id} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-2 font-medium text-white">{p.name}</td>
                  <td className="py-3 px-2 text-center text-lg">{p.quantity ?? p.stock ?? 0}</td>
                  <td className="py-3 px-2 text-center">
                    <button onClick={() => quickAddStock(p.id || p._id, 10)} className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded">+ 10</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
