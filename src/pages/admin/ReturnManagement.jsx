import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  processing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-cyan-500/20 text-cyan-400',
};

export default function ReturnManagement() {
  const { token } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadReturns();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadReturns = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/returns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReturns(Array.isArray(data) ? data : (data.returns || data.data || []));
    } catch (e) {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      const res = await fetch(`${BASE_URL}/api/returns/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReturns(prev => prev.map(r => (r.id || r._id) === id ? { ...r, status } : r));
        showToast(`Return #${String(id).slice(-6)} marked as ${status}`);
      } else {
        showToast('Failed to update status');
      }
    } catch (e) {
      showToast('Error updating status');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = returns.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const matchSearch = !search || (
      String(r.id || r._id || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.reason || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.user?.name || r.userName || '').toLowerCase().includes(search.toLowerCase())
    );
    return matchFilter && matchSearch;
  });

  const counts = {
    all: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
    completed: returns.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Return & Refund Management</h2>
          <p className="text-gray-400 text-sm mt-1">{returns.length} total return requests</p>
        </div>
        <button onClick={loadReturns} className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
          ↻ Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-xl p-3 text-center transition-all border ${
              filter === key
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
            }`}
          >
            <p className="text-xl font-bold text-white">{count}</p>
            <p className="text-xs capitalize">{key}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ID, reason, or customer name..."
          className="w-full bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-white font-semibold">No return requests found</p>
            <p className="text-gray-400 text-sm mt-1">
              {filter !== 'all' ? `No ${filter} requests.` : 'No returns yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Return ID', 'Order ID', 'Customer', 'Reason', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(ret => {
                  const id = ret.id || ret._id;
                  const date = ret.created_at || ret.createdAt;
                  return (
                    <tr key={id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-white font-mono text-xs">#{String(id).slice(-8).toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-sm">#{String(ret.order_id || ret.orderId || '-').slice(-8)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-sm">{ret.user?.name || ret.userName || ret.user_name || 'N/A'}</p>
                        <p className="text-gray-400 text-xs">{ret.user?.email || ret.userEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 text-sm max-w-[160px] truncate" title={ret.reason}>{ret.reason || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          STATUS_COLORS[ret.status] || 'bg-gray-700 text-gray-300'
                        }`}>
                          {ret.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-xs">
                          {date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {ret.status === 'pending' && (
                            <>
                              <button
                                disabled={actionLoading === id}
                                onClick={() => updateStatus(id, 'approved')}
                                className="px-2 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs rounded-lg transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                disabled={actionLoading === id}
                                onClick={() => updateStatus(id, 'rejected')}
                                className="px-2 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs rounded-lg transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {ret.status === 'approved' && (
                            <button
                              disabled={actionLoading === id}
                              onClick={() => updateStatus(id, 'completed')}
                              className="px-2 py-1 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs rounded-lg transition-colors disabled:opacity-50"
                            >
                              Mark Complete
                            </button>
                          )}
                          {(ret.status === 'rejected' || ret.status === 'completed') && (
                            <span className="text-gray-500 text-xs">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
