import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, PenLine, Star, ShieldCheck, Image as ImageIcon, Video, Send, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            size={interactive ? 24 : 16}
            className={(hovered || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-700 text-gray-700'}
          />
        </button>
      ))}
    </div>
  );
}

const ReviewSection = ({ productId }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [], videos: [] });
  const [mediaPreview, setMediaPreview] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/products/${productId}/reviews`);
      const data = await res.json();
      const revs = data.reviews || data.data || [];
      setReviews(revs);
      
      if (data.summary) {
        setStats(data.summary);
      } else {
        calculateStats(revs);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (revs) => {
    if (!revs || revs.length === 0) return;
    const total = revs.length;
    const sum = revs.reduce((acc, r) => acc + (r.rating || 0), 0);
    const dist = revs.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {});
    setStats({ average: (sum / total).toFixed(1), total, distribution: dist });
  };

  const handleMediaChange = (e, type) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({ file, type, preview: URL.createObjectURL(file) }));
    setMediaPreview(prev => [...prev, ...newMedia]);
    if (type === 'image') setNewReview(p => ({ ...p, images: [...p.images, ...files] }));
    else setNewReview(p => ({ ...p, videos: [...p.videos, ...files] }));
  };

  const removeMedia = (index) => {
    const item = mediaPreview[index];
    URL.revokeObjectURL(item.preview);
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
    if (item.type === 'image') setNewReview(p => ({ ...p, images: p.images.filter(f => f !== item.file) }));
    else setNewReview(p => ({ ...p, videos: p.videos.filter(f => f !== item.file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to post a review');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('rating', newReview.rating);
    formData.append('comment', newReview.comment);
    newReview.images.forEach(img => formData.append('images', img));
    newReview.videos.forEach(vid => formData.append('videos', vid));

    try {
      const res = await fetch(`${BASE_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        },
        body: formData
      });

      if (res.ok) {
        alert('Review submitted for approval!');
        setShowForm(false);
        setNewReview({ rating: 5, comment: '', images: [], videos: [] });
        setMediaPreview([]);
        fetchReviews();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-500" size={40} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-[#050505] rounded-3xl border border-gray-900 shadow-2xl">
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Stats Column */}
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-bold text-white mb-6">Customer Reviews</h2>
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {stats.average}
            </span>
            <StarRating rating={Math.round(stats.average)} />
          </div>
          <p className="text-gray-500 text-sm mb-8">Based on {stats.total} reviews</p>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map(num => (
              <div key={num} className="flex items-center gap-4 text-sm">
                <span className="text-gray-400 w-2">{num}</span>
                <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.distribution[num] || 0) / (stats.total || 1) * 100}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  />
                </div>
                <span className="text-gray-500 w-8">{(stats.distribution[num] || 0)}</span>
              </div>
            ))}
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-10 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              <PenLine size={20} />
              Write a Review
            </button>
          )}
        </div>

        {/* Reviews List Column */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Write Your Review</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-all">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                    <StarRating interactive rating={newReview.rating} onRate={r => setNewReview(p => ({ ...p, rating: r }))} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Comment</label>
                    <textarea
                      required
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all min-h-[120px]"
                      placeholder="Share your experience with the product..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-900 hover:bg-gray-800 border border-gray-800 px-4 py-2 rounded-xl text-sm text-gray-300 transition-all">
                      <ImageIcon size={18} className="text-cyan-500" />
                      Add Images
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleMediaChange(e, 'image')} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-900 hover:bg-gray-800 border border-gray-800 px-4 py-2 rounded-xl text-sm text-gray-300 transition-all">
                      <Video size={18} className="text-purple-500" />
                      Add Video
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaChange(e, 'video')} />
                    </label>
                  </div>

                  {mediaPreview.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {mediaPreview.map((item, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-800 group">
                          {item.type === 'image' ? (
                            <img src={item.preview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                              <Video size={24} className="text-cyan-500" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-1 right-1 bg-black/60 backdrop-blur-md rounded-full p-1 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    Submit Review
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-gray-950/50 rounded-3xl border border-dashed border-gray-800">
                <Star className="mx-auto text-gray-800 mb-4" size={48} />
                <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : reviews.map((review, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={review._id || idx}
                className="bg-gray-950 border border-gray-900 rounded-3xl p-6 transition-all hover:border-gray-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {review.user_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-white font-bold flex items-center gap-2">
                        {review.user_name || 'Verified User'}
                        {review.verified && (
                          <span className="flex items-center gap-0.5 text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/30 font-bold uppercase tracking-tighter">
                            <ShieldCheck size={10} /> Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-gray-600 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                <p className="text-gray-300 leading-relaxed mb-6 italic">"{review.comment || review.body}"</p>

                {(review.images?.length > 0 || review.videos?.length > 0) && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {review.images?.map((img, i) => (
                      <div key={i} className="group relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-900 cursor-zoom-in">
                        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      </div>
                    ))}
                    {review.videos?.map((vid, i) => (
                      <div key={i} className="group relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-900 bg-black cursor-pointer flex items-center justify-center">
                        <Video size={24} className="text-purple-500" />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-6 border-t border-gray-900">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 text-sm font-medium transition-colors">
                    <ThumbsUp size={16} />
                    Helpful ({review.helpful_count || 0})
                  </button>
                  <button className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Report</button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
