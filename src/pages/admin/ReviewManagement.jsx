import React, { useState, useEffect } from 'react';
import api, { reviews as reviewApi } from '../../services/api';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews');
      setReviews(Array.isArray(res.data) ? res.data : (res.data.reviews || []));
    } catch (e) { console.error(e); setReviews([]); }
    setLoading(false);
  };

  const approveReview = async (id) => {
    try {
      await api.put(`/reviews/${id}/approve`);
      fetchReviews();
    } catch (e) { alert('Failed to approve'); }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewApi.delete(id);
      fetchReviews();
    } catch (e) { alert('Failed to delete'); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Review Moderation</h2>
      {loading ? <div className="text-center text-gray-400 py-12">Loading reviews...</div> : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5 flex justify-between">
              <div>
                <div className="font-semibold text-white">{r.user_name || 'Anonymous'}</div>
                <p className="text-gray-300 text-sm mt-2">{r.body || r.comment || r.review}</p>
                <span className="text-xs text-yellow-400 mt-2 block">{r.is_approved === 1 ? 'Approved' : 'Pending'}</span>
              </div>
              <div className="flex gap-2">
                {r.is_approved !== 1 && <button onClick={() => approveReview(r.id)} className="px-4 py-2 bg-green-500/20 text-green-400 text-xs rounded-lg">Approve</button>}
                <button onClick={() => deleteReview(r.id)} className="px-4 py-2 bg-red-500/20 text-red-400 text-xs rounded-lg">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
