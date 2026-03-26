import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AnalyticsManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get(`/analytics?period=${period}`).catch(() => ({ data: {} })),
        api.get('/admin/orders').catch(() => ({ data: [] }))
      ]);
      setStats(analyticsRes.data);
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.orders || []);
      setRecentOrders(orders.slice(0, 10));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const totalRevenue = recentOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount || o.total || 0)), 0);
  const totalOrders = recentOrders.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pendingOrders = recentOrders.filter(o => o.status === 'pending').length;

  const statCards = [
    { label: 'Total Revenue', val: `₹${totalRevenue.toFixed(2)}`, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Total Orders', val: totalOrders, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Avg Order Value', val: `₹${avgOrder.toFixed(2)}`, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Pending Orders', val: pendingOrders, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    processing: 'bg-blue-500/20 text-blue-400',
    shipped: 'bg-cyan-500/20 text-cyan-400',
    delivered: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
          <p className="text-gray-400 text-sm mt-1">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500">
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button onClick={fetchAnalytics} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30">Refresh</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className={`${s.bg} border border-gray-700 rounded-xl p-4`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">Order Status Breakdown</h3>
          {['pending','processing','shipped','delivered','cancelled'].map(status => {
            const count = recentOrders.filter(o => o.status === status).length;
            const pct = totalOrders > 0 ? (count / totalOrders * 100) : 0;
            return (
              <div key={status} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize text-gray-400">{status}</span>
                  <span className="text-white font-medium">{count} ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-300 mb-4">Quick Metrics</h3>
          <div className="space-y-3">
            {stats && Object.entries(stats).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="text-white font-medium">{typeof val === 'number' ? val.toLocaleString() : val}</span>
              </div>
            ))}
            {!stats && <div className="text-gray-500 text-sm">Analytics data will appear here</div>}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <h3 className="text-sm font-bold text-gray-300 mb-4">Recent Orders</h3>
        {loading ? (
          <div className="text-gray-400 text-sm">Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-gray-500 text-sm">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="text-left py-2 px-2">Order ID</th>
                  <th className="text-left py-2 px-2">Customer</th>
                  <th className="text-center py-2 px-2">Amount</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-2 px-2 font-mono text-xs">#{order.id}</td>
                    <td className="py-2 px-2">{order.user_name || order.email || 'N/A'}</td>
                    <td className="py-2 px-2 text-center text-green-400 font-medium">₹{parseFloat(order.total_amount || order.total || 0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status] || 'bg-gray-700 text-gray-300'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-400 text-xs">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
