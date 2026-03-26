//review
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-xl transition-colors ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
        >
          <span className={(hovered || rating) >= star ? 'text-yellow-400' : 'text-gray-600'}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400 w-4">{stars}</span>
      <span className="text-yellow-400 text-xs">★</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-gray-400 w-8 text-right">{count}</span>
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 0, comment: '' });
  const [submitMsg, setSubmitMsg] = useState('');
  const [sort, setSort] = useState('newest');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/reviews/product/${productId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : (data.reviews || []));
    } catch (e) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.rating) return setSubmitMsg('Please select a rating.');
    if (!form.comment.trim()) return setSubmitMsg('Please write a comment.');
    try {
      setSubmitting(true);
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ productId, rating: form.rating, comment: form.comment }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg('Review submitted! Thank you.');
        setForm({ rating: 0, comment: '' });
        setShowForm(false);
        loadReviews();
      } else {
        setSubmitMsg(data.message || 'Failed to submit review.');
      }
    } catch (e) {
      setSubmitMsg('Error submitting review.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(''), 4000);
    }
  };

  // Compute stats
  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / total : 0;
  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: reviews.filter(r => Math.round(r.rating) === s).length,
  }));

  // Sort reviews
  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
    if (sort === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'lowest') return (a.rating || 0) - (b.rating || 0);
    return 0;
  });

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-white mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-white">{avgRating.toFixed(1)}</span>
          <StarRating rating={Math.round(avgRating)} />
          <span className="text-gray-400 text-sm mt-2">{total} review{total !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex flex-col justify-center gap-2">
          {starCounts.map(({ stars, count }) => (
            <RatingBar key={stars} stars={stars} count={count} total={total} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-gray-800 text-white text-sm border border-gray-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 outline-none"
        >
          <option value="newest">Sort: Newest</option>
          <option value="highest">Sort: Highest Rated</option>
          <option value="lowest">Sort: Lowest Rated</option>
        </select>
        {user && (
          <button
            onClick={() => setShowForm(f => !f)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
        {!user && (
          <p className="text-gray-400 text-sm">Please <a href="/login" className="text-cyan-400 hover:underline">log in</a> to write a review.</p>
        )}
      </div>

      {/* Review Form */}
      {showForm && user && (
        <form onSubmit={submitReview} className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Your Review</h3>
          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-2">Rating *</label>
            <StarRating rating={form.rating} interactive onRate={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-2">Comment *</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={4}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
              placeholder="Share your experience with this product..."
            />
          </div>
          {submitMsg && (
            <p className={`text-sm mb-3 ${
              submitMsg.includes('Thank') ? 'text-green-400' : 'text-red-400'
            }`}>{submitMsg}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 bg-gray-800 rounded w-24" />
                  <div className="h-3 bg-gray-800 rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2" />
              <div className="h-4 bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl p-10 text-center border border-gray-800">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-white font-semibold mb-1">No reviews yet</p>
          <p className="text-gray-400 text-sm">Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((review, i) => {
            const date = review.created_at || review.createdAt;
            const dateStr = date ? new Date(date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            }) : '';
            const name = review.user?.name || review.user_name || review.userName || 'Anonymous';
            const verified = review.verified_purchase || review.verifiedPurchase;

            return (
              <div key={review.id || review._id || i} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm">{name}</span>
                      {verified && (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating || 0} />
                      {dateStr && <span className="text-gray-500 text-xs">{dateStr}</span>}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{review.comment || review.review || ''}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
