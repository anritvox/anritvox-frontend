import React, { useState, useEffect } from 'react';
import { reviews as reviewApi } from '../../services/api';
import { Star, Trash2, CheckCircle, Clock, RefreshCw, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewApi.getAllAdmin();
      const data = res.data?.reviews || res.data?.data || res.data;
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError('Failed to load reviews: ' + (e.response?.data?.message || e.message));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id) => {
    try {
      await reviewApi.approve(id);
      fetchReviews();
    } catch (e) {
      alert('Failed to approve: ' + (e.response?.data?.message || e.message));
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await reviewApi.delete(id);
      fetchReviews();
    } catch (e) {
      alert('Failed to delete: ' + (e.response?.data?.message || e.message));
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
      ))}
    </div>
  );

  const filtered = filter === 'all' ? reviews
    : filter === 'pending' ? reviews.filter(r => !r.is_approved && r.is_approved !== 1)
    : reviews.filter(r => r.is_approved === 1 || r.is_approved === true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Sentiments / Reviews</h2>
          <p className="text-slate-500 font-medium mt-1">Moderate customer reviews and feedback</p>
        </div>
        <button onClick={fetchReviews} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-black text-slate-900">{reviews.length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Total Reviews</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-black text-emerald-600">{reviews.filter(r => r.is_approved === 1 || r.is_approved === true).length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Approved</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-black text-amber-500">{reviews.filter(r => !r.is_approved && r.is_approved !== 1).length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Pending</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm font-medium">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
          <MessageSquare size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-bold">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id || r._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
                      {(r.user_name || r.userName || r.user?.name || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{r.user_name || r.userName || r.user?.name || 'Anonymous'}</div>
                      <div className="text-xs text-slate-400">{r.product_name || r.productName || r.product?.name || 'Unknown Product'}</div>
                    </div>
                    {renderStars(r.rating || 0)}
                    <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                      (r.is_approved === 1 || r.is_approved === true)
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {(r.is_approved === 1 || r.is_approved === true) ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{r.body || r.comment || r.review || r.content || '(No content)'}</p>
                  {r.created_at || r.createdAt ? (
                    <div className="text-xs text-slate-400 mt-2">
                      {new Date(r.created_at || r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!(r.is_approved === 1 || r.is_approved === true) && (
                    <button onClick={() => approveReview(r.id || r._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition">
                      <CheckCircle size={12} /> Approve
                    </button>
                  )}
                  <button onClick={() => deleteReview(r.id || r._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
