import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageSquare, Star } from 'lucide-react';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

function StarRating({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-all duration-300 ${
            interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'
          }`}
        >
          <Star 
            size={interactive ? 24 : 16} 
            className={(hovered || rating) >= star ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-300'} 
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm group">
      <span className="text-gray-600 font-medium w-4">{stars}</span>
      <Star size={14} className="text-amber-400 fill-amber-400" />
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div 
          className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
          style={{ width: `${pct}%` }} 
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      </div>
      <span className="text-gray-500 w-10 text-right tabular-nums">{pct}%</span>
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

  useEffect(() => { loadReviews(); }, [productId]);

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
        setSubmitMsg('Review submitted successfully!');
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

  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / total : 0;
  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: reviews.filter(r => Math.round(r.rating) === s).length,
  }));

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
    if (sort === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sort === 'lowest') return (a.rating || 0) - (b.rating || 0);
    return 0;
  });

  return (
    <div className="mt-16 bg-white rounded-3xl p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100" id="reviews-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Customer Reviews</h2>
          <p className="text-gray-500 mt-1">Real experiences from verified buyers.</p>
        </div>
        
        {user ? (
          <button
            onClick={() => setShowForm(f => !f)}
            className="bg-gray-900 hover:bg-[#ffa41c] hover:text-gray-900 text-white shadow-lg hover:shadow-xl hover:shadow-[#ffa41c]/20 text-sm font-semibold px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2"
          >
            <MessageSquare size={16} />
            {showForm ? 'Cancel Review' : 'Write a Review'}
          </button>
        ) : (
          <a href="/login" className="text-[#007185] hover:text-[#c7511f] hover:underline font-medium text-sm bg-blue-50 px-4 py-2 rounded-full">
            Log in to write a review
          </a>
        )}
      </div>

      {/* Advanced Rating Summary */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 mb-10 border border-gray-100/80 shadow-sm flex flex-col lg:flex-row gap-12">
        <div className="flex flex-col items-center justify-center lg:w-1/3 text-center lg:border-r border-gray-200 lg:pr-12">
          <div className="text-7xl font-black text-gray-900 tracking-tighter mb-2">
            {avgRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(avgRating)} />
          <span className="text-gray-500 font-medium mt-3 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
            {total} global rating{total !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex flex-col justify-center flex-1 gap-3">
          {starCounts.map(({ stars, count }) => (
            <RatingBar key={stars} stars={stars} count={count} total={total} />
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showForm && user && (
        <form onSubmit={submitReview} className="bg-white rounded-3xl p-8 mb-10 shadow-xl shadow-gray-200/40 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ffa41c] to-yellow-300"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-6">Share Your Experience</h3>
          
          <div className="mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <label className="text-gray-700 font-medium block mb-3">Overall Rating</label>
            <StarRating rating={form.rating} interactive onRate={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          
          <div className="mb-6">
            <label className="text-gray-700 font-medium block mb-3">Detailed Review</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={5}
              className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#ffa41c] focus:border-transparent outline-none resize-none transition-all shadow-inner"
              placeholder="What did you like or dislike? What should other shoppers know?"
            />
          </div>
          
          {submitMsg && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 ${
              submitMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {submitMsg}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-gray-900 hover:bg-[#ffa41c] text-white hover:text-gray-900 font-bold px-8 py-3.5 rounded-full transition-all duration-300 disabled:opacity-60 shadow-md"
          >
            {submitting ? 'Submitting securely...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews Controls */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h3 className="font-bold text-gray-900 text-lg">Top Reviews</h3>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-gray-50 text-gray-700 font-medium text-sm border border-gray-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-[#ffa41c] outline-none cursor-pointer appearance-none pr-8 relative"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
        >
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="space-y-2"><div className="h-4 bg-gray-200 rounded w-full"/><div className="h-4 bg-gray-200 rounded w-5/6"/></div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100 border-dashed">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Star size={32} className="text-gray-300" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h4>
          <p className="text-gray-500 max-w-sm mx-auto">Be the first to share your thoughts and help other shoppers make informed decisions.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sorted.map((review, i) => {
            const date = review.created_at || review.createdAt;
            const dateStr = date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            const name = review.user?.name || review.user_name || review.userName || 'Verified Customer';
            const verified = review.verified_purchase || review.verifiedPurchase || true;

            return (
              <div key={review.id || review._id || i} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-lg flex-shrink-0 shadow-inner">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="text-gray-900 font-bold">{name}</span>
                      {verified && (
                        <span className="text-[11px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating rating={review.rating || 0} />
                      <span className="text-gray-400 text-sm font-medium">• {dateStr}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-[15px] leading-relaxed mt-4 whitespace-pre-line">
                  {review.comment || review.review || ''}
                </p>

                <div className="mt-6 flex items-center gap-4 pt-4 border-t border-gray-50">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Helpful?</span>
                  <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#007185] transition-colors border border-gray-200 hover:border-[#007185] rounded-full px-3 py-1">
                    <ThumbsUp size={14} /> Yes
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
