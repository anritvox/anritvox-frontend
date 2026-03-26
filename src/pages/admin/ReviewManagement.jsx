import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const STARS = [1,2,3,4,5];

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews');
      setReviews(Array.isArray(res.data) ? res.data : (res.data.reviews || []));
    } catch (e) { console.error(e); setReviews([]); }
    setLoading(false);
  };

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const approveReview = async (id) => {
    try {
      await api.put(`/reviews/${id}`, { status: 'approved' });
      showMsg('Review approved!');
      fetchReviews();
    } catch (e) { showMsg('Failed to approve'); }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      showMsg('Review deleted');
      fetchReviews();
    } catch (e) { showMsg('Failed to delete'); }
  };

  const filtered = reviews.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter || (filter === 'pending' && !r.status);
    const matchSearch = r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-2">Review Moderation</h2>
      <p className="text-gray-400 text-sm mb-6">Manage and moderate customer product reviews</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Reviews', val: reviews.length, color: 'text-cyan-400' },
          { label: 'Avg Rating', val: `${avgRating} ★`, color: 'text-yellow-400' },
          { label: 'Approved', val: reviews.filter(r => r.status === 'approved').length, color: 'text-green-400' },
          { label: 'Pending', val: reviews.filter(r => !r.status || r.status === 'pending').length, color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-gray-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {msg && <div className="mb-4 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm">{msg}</div>}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search reviews..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500">
          <option value="all">All Reviews</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={fetchReviews} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 text-sm rounded-lg hover:bg-cyan-500/30">Refresh</button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No reviews found</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-white">{r.user_name || 'Anonymous'}</span>
                    <div className="flex gap-0.5">
                      {STARS.map(s => (
                        <span key={s} className={`text-sm ${s <= (r.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      r.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>{r.status || 'pending'}</span>
                  </div>
                  {r.product_name && <div className="text-xs text-cyan-400 mb-1">Product: {r.product_name}</div>}
                  <p className="text-gray-300 text-sm">{r.comment || r.review || '(No comment)'}</p>
                  <div className="text-xs text-gray-500 mt-2">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</div>
                </div>
                <div className="flex gap-2">
                  {r.status !== 'approved' && (
                    <button onClick={() => approveReview(r.id)}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/30">Approve</button>
                  )}
                  <button onClick={() => deleteReview(r.id)}
                    className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/30">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
