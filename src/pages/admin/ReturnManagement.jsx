import React, { useState, useEffect } from 'react';
import { returns as returnsApi } from '../../services/api';

export default function ReturnManagement() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => { loadReturns(); }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const res = await returnsApi.getAllAdmin();
      const data = res.data;
      setReturns(Array.isArray(data) ? data : (data.returns || data.data || []));
    } catch (e) {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await returnsApi.updateStatus(id, status);
      setToast(`Return #${String(id).slice(-6)} marked as ${status}`);
      setTimeout(() => setToast(''), 3000);
      loadReturns();
    } catch (e) {
      setToast('Error updating status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Return & Refund Management</h2>
        <button onClick={loadReturns} className="text-cyan-400 text-sm">↻ Refresh</button>
      </div>

      {toast && <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg">{toast}</div>}

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>
        ) : returns.length === 0 ? (
          <div className="text-center py-16"><p className="text-white font-semibold">No return requests found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  {['Return ID', 'Customer', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map(ret => {
                  const id = ret.id || ret._id;
                  return (
                    <tr key={id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-white font-mono text-xs">#{String(id).slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-white text-sm">{ret.user?.name || ret.userName || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{ret.reason || '-'}</td>
                      <td className="px-4 py-3 text-sm capitalize">{ret.status || 'pending'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {ret.status === 'pending' && (
                            <>
                              <button onClick={() => updateStatus(id, 'approved')} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">Approve</button>
                              <button onClick={() => updateStatus(id, 'rejected')} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-lg">Reject</button>
                            </>
                          )}
                          {ret.status === 'approved' && (
                            <button onClick={() => updateStatus(id, 'completed')} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-lg">Mark Complete</button>
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
