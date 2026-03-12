// src/pages/admin/OrderManagement.jsx
// Fully connected to backend - no more localStorage
import React, { useState, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const STATUS_COLORS = {
  pending:   'bg-yellow-900 text-yellow-300',
  confirmed: 'bg-blue-900 text-blue-300',
  shipped:   'bg-purple-900 text-purple-300',
  delivered: 'bg-green-900 text-green-300',
  cancelled: 'bg-red-900 text-red-300',
};

export default function OrderManagement({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/orders`, { headers });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch { setError('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [token]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { setError('Failed to update order status'); }
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const matchSearch = !search ||
      String(o.id).includes(search) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const statuses = ['pending','confirmed','shipped','delivered','cancelled'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Order Management</h2>
        <button onClick={fetchOrders} className="text-sm text-gray-400 hover:text-white border border-gray-600 px-3 py-1 rounded">
          Refresh
        </button>
      </div>
      {error && <div className="bg-red-900 text-red-300 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by ID, customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-[#39d353]"
        />
        {['all', ...statuses].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded text-sm capitalize font-medium ${
              filter === s ? 'bg-[#39d353] text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-gray-500 text-sm self-center">{filtered.length} orders</span>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading orders...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Delivery</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <React.Fragment key={o.id}>
                  <tr className="border-t border-gray-700 text-sm text-gray-300 hover:bg-gray-750 cursor-pointer"
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td className="px-4 py-3 font-mono">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{o.customer_name}</p>
                      <p className="text-xs text-gray-500">{o.customer_email}</p>
                    </td>
                    <td className="px-4 py-3">{o.items?.length || 0} items</td>
                    <td className="px-4 py-3 text-[#39d353] font-bold">₹{parseFloat(o.total).toFixed(0)}</td>
                    <td className="px-4 py-3 capitalize">{o.delivery_type}</td>
                    <td className="px-4 py-3">COD</td>
                    <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${STATUS_COLORS[o.status] || 'bg-gray-700 text-gray-300'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600"
                      >
                        {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr className="bg-gray-850">
                      <td colSpan={9} className="px-6 py-4 text-sm">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="font-bold text-white mb-2">Items</p>
                            {o.items?.map(i => (
                              <div key={i.id} className="flex justify-between text-gray-300 py-1 border-b border-gray-700">
                                <span>{i.name} x{i.quantity}</span>
                                <span>₹{(parseFloat(i.price) * i.quantity).toFixed(0)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="font-bold text-white mb-2">Delivery Address</p>
                            {o.address_snapshot && (
                              <div className="text-gray-300">
                                <p>{o.address_snapshot.full_name} — {o.address_snapshot.phone}</p>
                                <p>{o.address_snapshot.line1}{o.address_snapshot.line2 ? ', ' + o.address_snapshot.line2 : ''}</p>
                                <p>{o.address_snapshot.city}, {o.address_snapshot.state} - {o.address_snapshot.pincode}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-gray-500 text-sm py-8 text-center">No orders found.</p>}
        </div>
      )}
    </div>
  );
}
