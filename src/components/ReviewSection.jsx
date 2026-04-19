import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ThumbsUp, PenLine, Star, ShieldCheck, Image as ImageIcon, 
  Video, Send, Loader2, X, Filter, ChevronDown, CheckCircle2, 
  MessageSquare, User, Camera, Play, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StarRating({ rating, interactive = false, onRate, size = 16 }) {
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
            interactive ? 'cursor-pointer hover:scale-110 active:scale-90' : 'cursor-default'
          }`}
        >
          <Star
            size={size}
            className={(hovered || rating) >= star ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.4)]' : 'fill-gray-800 text-gray-800'}
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
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all'); 
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', title: '', images: [], videos: [] });
  const [mediaPreview, setMediaPreview] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);

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

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];
    if (filterType === 'images') result = result.filter(r => r.images?.length > 0);
    if (filterType === 'videos') result = result.filter(r => r.videos?.length > 0);
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'highest') result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'lowest') result.sort((a, b) => a.rating - b.rating);
    if (sortBy === 'helpful') result.sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0));
    return result;
  }, [reviews, sortBy, filterType]);

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
    formData.append('title', newReview.title);
    newReview.images.forEach(img => formData.append('images', img));
    newReview.videos.forEach(vid => formData.append('videos', vid));
    try {
      const res = await fetch(`${BASE_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` },
        body: formData
      });
      if (res.ok) {
        setShowForm(false);
        setNewReview({ rating: 5, comment: '', title: '', images: [], videos: [] });
        setMediaPreview([]);
        fetchReviews();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('An error occurred. Please try again.');
    } finally { setSubmitting(false); }
  };

  const recommendRate = useMemo(() => {
    if (!stats.total) return 0;
    const positive = (stats.distribution[5] || 0) + (stats.distribution[4] || 0);
    return Math.round((positive / stats.total) * 100);
  }, [stats]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="animate-spin text-cyan-500" size={48} />
      <p className="text-gray-500 font-medium animate-pulse">Loading verified reviews...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex flex-col lg:flex-row gap-16">
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <h2 className="text-4xl font-black text-white mb-2 flex items-center gap-3">Reviews <span className="text-gray-700 text-2xl font-normal">({stats.total})</span></h2>
            <p className="text-gray-500 mb-8">Authentic feedback from our community</p>
            <div className="bg-[#0A0A0A] border border-gray-900 rounded-[2.5rem] p-10 mb-8 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center gap-6 mb-8">
                <div className="text-7xl font-black bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">{stats.average}</div>
                <div><StarRating rating={Math.round(stats.average)} size={24} /><p className="text-gray-500 mt-2 text-sm font-medium">Average Rating</p></div>
              </div>
              <div className="space-y-4 mb-8">
                {[5, 4, 3, 2, 1].map(num => (
                  <div key={num} className="flex items-center gap-4 group/bar">
                    <span className="text-gray-400 text-xs font-bold w-3">{num}</span>
                    <div className="flex-1 h-2.5 bg-gray-900/50 rounded-full overflow-hidden border border-white/5 relative">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.distribution[num] || 0) / (stats.total || 1) * 100}%` }}
                        className={`h-full relative z-10 ${num >= 4 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : num === 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-600'}`} />
                    </div>
                    <span className="text-gray-600 text-[10px] font-mono w-6 text-right">{stats.distribution[num] || 0}</span>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-white/5 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20"><ThumbsUp className="text-green-400" size={20} /></div>
                <div><p className="text-white font-bold text-lg">{recommendRate}%</p><p className="text-gray-500 text-xs">Recommend this product</p></div>
              </div>
            </div>
            <button onClick={() => setShowForm(true)} className="w-full group relative px-8 py-5 bg-white text-black font-black rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]">
              <div className="flex items-center justify-center gap-3"><PenLine size={20} />WRITE A REVIEW</div>
            </button>
          </div>
        </div>
        <div className="lg:w-2/3">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12 pb-6 border-b border-gray-900">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {['all', 'images', 'videos'].map(type => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${filterType === type ? 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-transparent border-gray-800 text-gray-500 hover:border-gray-600'}`}>{type}</button>
              ))}
            </div>
            <div className="flex items-center gap-4 bg-[#0A0A0A] border border-gray-900 px-4 py-2 rounded-2xl">
              <Filter size={14} className="text-gray-500" /><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer pr-4"><option value="newest">Newest First</option><option value="helpful">Most Helpful</option><option value="highest">Highest Rated</option><option value="lowest">Lowest Rated</option></select>
            </div>
          </div>
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-xl bg-black/80">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative">
                  <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                      <div><h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Share Your Story</h3><p className="text-gray-500">How was your experience with this product?</p></div>
                      <button onClick={() => setShowForm(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Overall Rating</label><div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-center"><StarRating interactive rating={newReview.rating} onRate={r => setNewReview(p => ({ ...p, rating: r }))} size={32} /></div></div>
                        <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Review Title</label><input type="text" placeholder="Summarize your experience..." className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium" value={newReview.title} onChange={(e) => setNewReview(p => ({ ...p, title: e.target.value }))} /></div>
                      </div>
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Detailed Comment</label><textarea required rows={4} className="w-full bg-white/5 border border-white/5 rounded-3xl px-6 py-5 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-medium resize-none" placeholder="What did you like or dislike?" value={newReview.comment} onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))} /></div>
                      <div><label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Attachments</label><div className="flex flex-wrap gap-4"><label className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-dashed border-white/10 rounded-3xl py-6 transition-all group"><Camera size={24} className="text-cyan-500" /><span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Photos</span><input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleMediaChange(e, 'image')} /></label><label className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-dashed border-white/10 rounded-3xl py-6 transition-all group"><Play size={24} className="text-purple-500" /><span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Video</span><input type="file" accept="video/*" className="hidden" onChange={(e) => handleMediaChange(e, 'video')} /></label></div></div>
                      {mediaPreview.length > 0 && (<div className="flex flex-wrap gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">{mediaPreview.map((item, idx) => (<div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden group border border-white/10">{item.type === 'image' ? (<img src={item.preview} className="w-full h-full object-cover" />) : (<div className="w-full h-full bg-gray-900 flex items-center justify-center"><Play size={20} className="text-cyan-500" /></div>)}<button type="button" onClick={() => removeMedia(idx)} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><X size={20} /></button></div>))}</div>)}
                      <button disabled={submitting} className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black rounded-[2rem] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest">{submitting ? <Loader2 className="animate-spin" size={24} /> : <>SUBMIT REVIEW <Send size={20} /></>}</button>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="space-y-10">
            {filteredAndSortedReviews.length === 0 ? (<div className="text-center py-32 bg-[#0A0A0A] rounded-[3rem] border border-dashed border-gray-900"><MessageSquare className="text-gray-700 mx-auto mb-8" size={40} /><h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Feedback Found</h4></div>) : filteredAndSortedReviews.map((review, idx) => (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={review._id || idx} className="bg-[#0A0A0A] border border-gray-900 rounded-[2.5rem] p-8 md:p-10 transition-all hover:border-gray-800 relative group">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-950 p-[1px]"><div className="w-full h-full rounded-[1.4rem] bg-[#0A0A0A] flex items-center justify-center text-cyan-500 border border-white/5"><User size={28} className="opacity-40" /></div></div>
                    <div><div className="flex flex-wrap items-center gap-3 mb-1"><h4 className="text-white font-black text-lg uppercase tracking-tighter">{review.user_name || 'Anonymous User'}</h4>{review.verified && (<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-400 uppercase tracking-widest"><CheckCircle2 size={10} /> Verified</div>)}</div><p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p></div>
                  </div>
                  <div className="flex flex-col items-end gap-2"><StarRating rating={review.rating} size={20} /></div>
                </div>
                {review.title && (<h5 className="text-white font-bold text-xl mb-4 italic tracking-tight">"{review.title}"</h5>)}
                <p className="text-gray-400 leading-relaxed text-lg font-medium mb-8">{review.comment || review.body}</p>
                {(review.images?.length > 0 || review.videos?.length > 0) && (<div className="flex flex-wrap gap-4 mb-8">
                    {review.images?.map((img, i) => (<motion.div key={i} whileHover={{ scale: 1.05 }} onClick={() => setSelectedMedia({ type: 'image', url: img })} className="relative w-32 h-32 rounded-[1.5rem] overflow-hidden border border-white/5 cursor-zoom-in"><img src={img} className="w-full h-full object-cover" /></motion.div>))}
                    {review.videos?.map((vid, i) => (<motion.div key={i} whileHover={{ scale: 1.05 }} onClick={() => setSelectedMedia({ type: 'video', url: vid })} className="relative w-32 h-32 rounded-[1.5rem] overflow-hidden border border-white/5 bg-gray-900 cursor-pointer flex items-center justify-center"><Play size={32} className="text-cyan-500" /></motion.div>))}
                  </div>)}
                <div className="flex items-center gap-8 pt-8 border-t border-white/5"><button className="flex items-center gap-3 text-gray-500 hover:text-cyan-400 transition-all"><ThumbsUp size={16} /><span className="text-xs font-black uppercase tracking-widest">Helpful ({review.helpful_count || 0})</span></button></div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>{selectedMedia && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl" onClick={() => setSelectedMedia(null)}><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>{selectedMedia.type === 'image' ? (<img src={selectedMedia.url} className="max-w-full max-h-[85vh] object-contain rounded-3xl" />) : (<video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-3xl" />)}<button onClick={() => setSelectedMedia(null)} className="absolute -top-16 right-0 p-4 text-white hover:bg-white/10 rounded-full transition-all"><X size={32} /></button></motion.div></motion.div>)}</AnimatePresence>
    </div>
  );
};
export default ReviewSection;
