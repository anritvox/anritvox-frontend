import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageSquare, Star, ShieldCheck, PenLine } from 'lucide-react';
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
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
        >
          <Star 
            size={interactive ? 28 : 20} 
            className={(hovered || rating) >= star ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'} 
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4 text-sm group">
      <span className="text-gray-900 font-black w-3">{stars}</span>
      <Star size={14} className="text-amber-400 fill-amber-400" />
      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner relative">
        <div 
          className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
          style={{ width: `${pct}%` }} 
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/30 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      </div>
      <span className="text-gray-400 font-bold w-12 text-right tabular-nums">{pct}%</span>
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
      setReviews([]); // Strict 0 initialization fallback
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.rating) return setSubmitMsg('Please select a star rating to continue.');
    if (!form.comment.trim()) return setSubmitMsg('Please share some details in your review.');
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
        setSubmitMsg('Success! Your review has been published.');
        setForm({ rating: 0, comment: '' });
        setShowForm(false);
        loadReviews();
      } else {
        setSubmitMsg(data.message || 'Failed to submit review.');
      }
    } catch (e) {
      setSubmitMsg('Error connecting to the server. Please try again.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(''), 4000);
    }
  };

  // Strict 0 calculation for new store
  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / total : 0.0;
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
    <div className="bg-white rounded-[2.5rem] p-8 lg:p-14 shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-gray-100" id="reviews-section">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
          <p className="text-gray-500 font-medium mt-2">Real experiences from verified buyers.</p>
        </div>
        
        {user ? (
          <button
            onClick={() => setShowForm(f => !f)}
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-xl shadow-gray-900/20 text-sm font-black px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-3"
          >
            {showForm ? 'Cancel Review' : <><PenLine size={18} /> Write a Review</>}
          </button>
        ) : (
          <a href="/login" className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 font-bold text-sm bg-blue-50 px-6 py-3 rounded-full transition-colors border border-blue-100">
            Log in to write a review
          </a>
        )}
      </div>

      {/* Advanced Futuristic Rating Dashboard */}
      <div className="bg-white rounded-[2rem] p-8 mb-12 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row gap-12 lg:gap-20">
        <div className="flex flex-col items-center justify-center lg:w-1/3 text-center lg:border-r border-gray-100 lg:pr-12">
          <div className="text-[5rem] font-black text-gray-900 tracking-tighter leading-none mb-4 drop-shadow-sm">
            {avgRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(avgRating)} />
          <span className="text-gray-500 font-black text-xs uppercase tracking-widest mt-4">
            Based on {total} rating{total !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex flex-col justify-center flex-1 gap-4">
          {starCounts.map(({ stars, count }) => (
            <RatingBar key={stars} stars={stars} count={count} total={total} />
          ))}
        </div>
      </div>

      {/* Premium Review Form */}
      {showForm && user && (
        <form onSubmit={submitReview} className="bg-slate-50 rounded-[2rem] p-10 mb-12 shadow-inner border border-slate-100 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-yellow-300"></div>
          <h3 className="text-2xl font-black text-gray-900 mb-8">Share Your Experience</h3>
          
          <div className="mb-8 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
            <label className="text-gray-900 font-black uppercase tracking-wider text-sm">Tap to Rate:</label>
            <StarRating rating={form.rating} interactive onRate={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          
          <div className="mb-8">
            <label className="text-gray-900 font-black uppercase tracking-wider text-sm block mb-4">Detailed Review</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={5}
              className="w-full bg-white text-gray-900 font-medium border border-gray-200 rounded-[1.5rem] px-6 py-5 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none resize-none transition-all shadow-sm"
              placeholder="What did you like or dislike? What should other shoppers know about the build quality and performance?"
            />
          </div>
          
          {submitMsg && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${
              submitMsg.includes('Success') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {submitMsg}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto bg-amber-400 hover:bg-amber-500 text-gray-900 font-black px-10 py-4 rounded-full transition-all duration-300 disabled:opacity-60 shadow-xl shadow-amber-400/20"
          >
            {submitting ? 'Authenticating & Submitting...' : 'Post Public Review'}
          </button>
        </form>
      )}

      {/* Reviews Controls */}
      <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-6">
        <h3 className="font-black text-gray-900 text-xl tracking-tight">Top Reviews</h3>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-white text-gray-900 font-bold text-sm border border-gray-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer appearance-none pr-10 relative shadow-sm hover:border-gray-300 transition-colors"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23111827'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
        >
          <option value="newest">Sort by Newest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-pulse">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 bg-gray-100 rounded-full" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
              <div className="space-y-3"><div className="h-4 bg-gray-100 rounded w-full"/><div className="h-4 bg-gray-100 rounded w-5/6"/></div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-slate-50 rounded-[2.5rem] p-16 text-center border border-gray-200 border-dashed">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-gray-100">
            <Star size={40} className="text-gray-300" />
          </div>
          <h4 className="text-2xl font-black text-gray-900 mb-3">No reviews yet</h4>
          <p className="text-gray-500 text-lg max-w-md mx-auto font-medium">Be the first to share your thoughts and help other shoppers make informed decisions.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sorted.map((review, i) => {
            const date = review.created_at || review.createdAt;
            const dateStr = date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            const name = review.user?.name || review.user_name || review.userName || 'Verified Customer';
            const verified = review.verified_purchase || review.verifiedPurchase || true;

            return (
              <div key={review.id || review._id || i} className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-md">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <span className="text-gray-900 font-black text-lg">{name}</span>
                      {verified && (
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                          <ShieldCheck size={14} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <StarRating rating={review.rating || 0} />
                      <span className="text-gray-400 font-bold text-sm">• {dateStr}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-base font-medium leading-relaxed mt-6 whitespace-pre-line">
                  {review.comment || review.review || ''}
                </p>

                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-gray-100">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Helpful?</span>
                  <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200 rounded-full px-4 py-2">
                    <ThumbsUp size={16} /> Yes (0)
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
