import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, PenLine, Star, ShieldCheck } from 'lucide-react';
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
          className={`transition-all duration-300 flex-shrink-0 ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
        >
          <Star 
            size={interactive ? 26 : 18} 
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
    <div className="flex items-center gap-3 text-sm group w-full">
      <span className="text-gray-900 font-black w-3 flex-shrink-0">{stars}</span>
      <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner relative min-w-[100px]">
        <div 
          className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" 
          style={{ width: `${pct}%` }} 
        >
          <div className="absolute top-0 left-0 w-full h-full bg-white/30 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        </div>
      </div>
      <span className="text-gray-400 font-bold w-10 text-right tabular-nums flex-shrink-0 text-xs sm:text-sm">{pct}%</span>
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
        // FIXED: Maps payload to snake_case 'product_id' as required by Express Backend
        body: JSON.stringify({ product_id: productId, rating: form.rating, comment: form.comment }),
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
    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 lg:p-14 shadow-sm border border-gray-100 overflow-hidden" id="reviews-section">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Customer Reviews</h2>
          <p className="text-gray-500 font-medium mt-1 sm:mt-2 text-sm sm:text-base">Real experiences from verified buyers.</p>
        </div>
        
        {user ? (
          <button
            onClick={() => setShowForm(f => !f)}
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 text-xs sm:text-sm font-black px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 w-full md:w-auto"
          >
            {showForm ? 'Cancel Review' : <><PenLine size={16} /> Write a Review</>}
          </button>
        ) : (
          <a href="/login" className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 font-bold text-xs sm:text-sm bg-blue-50 px-5 sm:px-6 py-3 rounded-full transition-colors border border-blue-100 text-center w-full md:w-auto">
            Log in to write a review
          </a>
        )}
      </div>

      {/* Advanced Futuristic Rating Dashboard */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 mb-8 sm:mb-12 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 lg:gap-16">
        <div className="flex flex-col items-center justify-center md:w-1/3 text-center md:border-r border-gray-100 md:pr-8 lg:pr-12">
          <div className="text-5xl sm:text-6xl lg:text-[5rem] font-black text-gray-900 tracking-tighter leading-none mb-3 sm:mb-4 drop-shadow-sm">
            {avgRating.toFixed(1)}
          </div>
          <StarRating rating={Math.round(avgRating)} />
          <span className="text-gray-500 font-black text-[10px] sm:text-xs uppercase tracking-widest mt-3 sm:mt-4">
            Based on {total} rating{total !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex flex-col justify-center flex-1 gap-3 sm:gap-4 w-full">
          {starCounts.map(({ stars, count }) => (
            <RatingBar key={stars} stars={stars} count={count} total={total} />
          ))}
        </div>
      </div>

      {/* Premium Review Form */}
      {showForm && user && (
        <form onSubmit={submitReview} className="bg-slate-50 rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 mb-8 sm:mb-12 shadow-inner border border-slate-100 relative overflow-hidden transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-yellow-300"></div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 sm:mb-8">Share Your Experience</h3>
          
          <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <label className="text-gray-900 font-black uppercase tracking-wider text-xs sm:text-sm">Tap to Rate:</label>
            <StarRating rating={form.rating} interactive onRate={r => setForm(f => ({ ...f, rating: r }))} />
          </div>
          
          <div className="mb-6 sm:mb-8">
            <label className="text-gray-900 font-black uppercase tracking-wider text-xs sm:text-sm block mb-3 sm:mb-4">Detailed Review</label>
            <textarea
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={5}
              className="w-full bg-white text-gray-900 font-medium text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-[1.5rem] px-4 sm:px-6 py-4 sm:py-5 focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none resize-none transition-all shadow-sm"
              placeholder="What did you like or dislike? What should other shoppers know?"
            />
          </div>
          
          {submitMsg && (
            <div className={`p-4 rounded-xl mb-6 text-xs sm:text-sm font-bold flex items-center gap-2 ${
              submitMsg.includes('Success') ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {submitMsg}
            </div>
          )}
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-900 font-black px-8 sm:px-10 py-3 sm:py-4 rounded-full transition-all duration-300 disabled:opacity-60 shadow-lg shadow-amber-400/20 text-sm sm:text-base"
          >
            {submitting ? 'Submitting...' : 'Post Public Review'}
          </button>
        </form>
      )}

      {/* Reviews Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 border-b border-gray-100 pb-4 sm:pb-6 gap-4">
        <h3 className="font-black text-gray-900 text-lg sm:text-xl tracking-tight">Top Reviews</h3>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-white text-gray-900 font-bold text-xs sm:text-sm border border-gray-200 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 focus:ring-2 focus:ring-gray-900 outline-none cursor-pointer appearance-none pr-10 relative shadow-sm hover:border-gray-300 transition-colors w-full sm:w-auto"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23111827'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
        >
          <option value="newest">Sort by Newest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4 sm:space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-gray-100 shadow-sm animate-pulse">
              <div className="flex items-center gap-4 sm:gap-5 mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex-shrink-0" />
                <div className="space-y-2 sm:space-y-3 w-full">
                  <div className="h-3 sm:h-4 bg-gray-100 rounded w-32 sm:w-40" />
                  <div className="h-2 sm:h-3 bg-gray-100 rounded w-20 sm:w-24" />
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3"><div className="h-3 sm:h-4 bg-gray-100 rounded w-full"/><div className="h-3 sm:h-4 bg-gray-100 rounded w-5/6"/></div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl sm:rounded-[2.5rem] p-8 sm:p-16 text-center border border-gray-200 border-dashed mx-2 sm:mx-0">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm border border-gray-100">
            <Star size={28} className="text-gray-300 sm:w-10 sm:h-10" />
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">No reviews yet</h4>
          <p className="text-gray-500 text-sm sm:text-lg max-w-xs sm:max-w-md mx-auto font-medium">Be the first to share your thoughts and help other shoppers make informed decisions.</p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {sorted.map((review, i) => {
            const date = review.created_at || review.createdAt;
            const dateStr = date ? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            const name = review.user?.name || review.user_name || review.userName || 'Verified Customer';
            const verified = review.verified_purchase || review.verifiedPurchase || true;

            return (
              <div key={review.id || review._id || i} className="bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-10 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-3 sm:gap-5 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gray-900 flex items-center justify-center text-white font-black text-base sm:text-xl flex-shrink-0 shadow-sm">
                    {name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-1 sm:mb-1.5">
                      <span className="text-gray-900 font-black text-sm sm:text-lg truncate">{name}</span>
                      {verified && (
                        <span className="text-[10px] sm:text-xs bg-green-50 text-green-700 border border-green-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold flex items-center gap-1 sm:gap-1.5 shadow-sm whitespace-nowrap">
                          <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      <StarRating rating={review.rating || 0} />
                      <span className="text-gray-400 font-bold text-xs sm:text-sm">• {dateStr}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed mt-4 sm:mt-6 whitespace-pre-line break-words">
                  {review.comment || review.review || ''}
                </p>

                <div className="mt-6 sm:mt-8 flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-50">
                  <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Helpful?</span>
                  <button className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                    <ThumbsUp size={14} className="sm:w-4 sm:h-4" /> Yes (0)
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
