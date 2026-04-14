import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, PenLine, Star, ShieldCheck, Image as ImageIcon, Video, Send, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            size={interactive ? 24 : 16}
            className={(hovered || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-700 text-gray-700'}
          />
        </button>
      ))}
    </div>
  );
}

const ReviewSection = ({ productId }) => {
  const { user } = useAuth();
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
      setReviews(data.reviews || []);
      calculateStats(data.reviews || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (revs) => {
    if (revs.length === 0) return;
    const total = revs.length;
    const sum = revs.reduce((acc, r) => acc + r.rating, 0);
    const dist = revs.reduce((acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      return acc;
    }, {});
    setStats({ average: (sum / total).toFixed(1), total, distribution: dist });
  };

  const handleMediaChange = (e, type) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map(file => ({
      file,
      type,
      preview: URL.createObjectURL(file)
    }));
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (res.ok) {
        fetchReviews();
        setShowForm(false);
        setNewReview({ rating: 5, comment: '', images: [], videos: [] });
        setMediaPreview([]);
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-cyan-500" size={40} />
    </div>
  );

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-bold text-white mb-6">Customer Reviews</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              {stats.average}
            </div>
            <div>
              <StarRating rating={Math.round(stats.average)} />
              <p className="text-gray-400 text-sm mt-1">Based on {stats.total} reviews</p>
            </div>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(num => (
              <div key={num} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-4">{num}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.distribution[num] || 0) / stats.total * 100}%` }}
                    className="h-full bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{(stats.distribution[num] || 0)}</span>
              </div>
            ))}
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-8 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              <PenLine size={18} /> Write a Review
            </button>
          )}
        </div>

        <div className="lg:w-2/3">
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-10 bg-gray-800/50 p-6 rounded-xl border border-cyan-500/30"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Write Your Review</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Rating</label>
                    <StarRating rating={newReview.rating} interactive onRate={(r) => setNewReview(p => ({...p, rating: r}))} />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Comment</label>
                    <textarea
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 min-h-[120px]"
                      placeholder="What did you like or dislike?"
                      value={newReview.comment}
                      onChange={(e) => setNewReview(p => ({...p, comment: e.target.value}))}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 transition-colors">
                      <ImageIcon size={18} /> Add Images
                      <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleMediaChange(e, 'image')} />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 transition-colors">
                      <Video size={18} /> Add Video
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaChange(e, 'video')} />
                    </label>
                  </div>

                  {mediaPreview.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {mediaPreview.map((item, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                          {item.type === 'image' ? (
                            <img src={item.preview} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Video size={20} className="text-cyan-500" /></div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-red-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    disabled={submitting}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    Submit Review
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-8">
            {reviews.map((review, idx) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={review._id || idx}
                className="border-b border-gray-800 pb-8 last:border-0"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {review.user_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {review.user_name || 'Verified User'}
                        {review.verified && <ShieldCheck size={14} className="text-cyan-400" />}
                      </h4>
                      <p className="text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>

                <p className="text-gray-300 leading-relaxed mb-4">{review.comment}</p>

                {(review.images?.length > 0 || review.videos?.length > 0) && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {review.images?.map((img, i) => (
                      <div key={i} className="group relative w-24 h-24 rounded-lg overflow-hidden border border-gray-800 cursor-pointer">
                        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                      </div>
                    ))}
                    {review.videos?.map((vid, i) => (
                      <div key={i} className="group relative w-24 h-24 rounded-lg overflow-hidden border border-gray-800 bg-black cursor-pointer flex items-center justify-center">
                        <Video size={24} className="text-cyan-500" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-400 text-sm transition-colors">
                  <ThumbsUp size={14} /> Helpful ({review.helpful_count || 0})
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
