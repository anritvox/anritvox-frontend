import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Star, CheckCircle, XCircle, AlertTriangle, 
  Search, Filter, RefreshCw, Trash2, Eye, User, Box, 
  ShieldAlert, ThumbsUp, ThumbsDown, BarChart2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// --- CONFIGURATION MAPS ---
const STATUS_MAP = {
  'pending': { label: 'Awaiting Moderation', color: 'amber', icon: AlertTriangle },
  'approved': { label: 'Published (Live)', color: 'emerald', icon: CheckCircle },
  'rejected': { label: 'Filtered (Hidden)', color: 'rose', icon: XCircle }
};

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Inspector Modal State
  const [selectedReview, setSelectedReview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { showToast } = useToast() || {};

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Safely map endpoints based on standard routing patterns
      const res = await api.get('/reviews').catch(() => api.get('/admin/reviews'));
      setReviews(res.data?.reviews || res.data?.data || res.data || []);
    } catch (err) {
      showToast?.('Failed to synchronize sentiment matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return '/logo.webp';
    let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
    if (!path) return '/logo.webp';
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  // --- MUTATION PROTOCOLS ---
  const handleUpdateStatus = async (reviewId, newStatus) => {
    setIsUpdating(true);
    try {
      // Handle potential API structure variations
      await api.put(`/reviews/${reviewId}/status`, { status: newStatus })
        .catch(() => api.patch(`/reviews/${reviewId}/status`, { status: newStatus }));
      
      showToast?.(`Review matrix updated to: ${newStatus}`, 'success');
      
      // Optimistic UI update
      setReviews(reviews.map(r => (r.id === reviewId || r._id === reviewId) ? { ...r, status: newStatus } : r));
      if (selectedReview) setSelectedReview({ ...selectedReview, status: newStatus });
    } catch (err) {
      showToast?.('Sentiment mutation failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Permanently purge this feedback from the registry?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      showToast?.('Feedback purged successfully', 'success');
      fetchReviews();
      if (selectedReview && (selectedReview.id === reviewId || selectedReview._id === reviewId)) {
        setSelectedReview(null);
      }
    } catch (err) {
      showToast?.('Purge protocol failed', 'error');
    }
  };

  // --- ANALYTICS & FILTERING ---
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const searchStr = `${r.title || ''} ${r.comment || ''} ${r.user?.name || r.reviewer_name || ''} ${r.product?.name || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || parseInt(r.rating) === parseInt(ratingFilter);
      return matchesSearch && matchesStatus && matchesRating;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Telemetry KPIs
  const totalReviews = reviews.length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0) / totalReviews).toFixed(1) : '0.0';
  const positiveRatio = totalReviews > 0 ? Math.round((reviews.filter(r => parseFloat(r.rating) >= 4).length / totalReviews) * 100) : 0;

  if (loading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Sentiment Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Sentiment <span className="text-amber-500">Matrix</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <BarChart2 size={12} className="text-amber-500" /> Advanced Client Feedback & Telemetry
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchReviews} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-all shadow-lg">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-blue-500 z-10"><MessageSquare size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Feedbacks</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{totalReviews}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-amber-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-amber-500 z-10"><Star size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Rating</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{averageRating} <span className="text-sm text-slate-500">/ 5.0</span></h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-rose-500 z-10"><ShieldAlert size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Moderation Queue</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{pendingCount}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-500 z-10"><ThumbsUp size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Positive Sentiment</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{positiveRatio}%</h4>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-[2rem] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Scan by content, client identity, or hardware node..." 
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <select 
              value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Moderation States</option>
              {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 md:w-40">
            <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
            <select 
              value={ratingFilter} onChange={(e) => { setRatingFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl py-3.5 pl-10 pr-4 text-white font-bold text-sm outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODERATION FEED TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Hardware Target</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Client Identity</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Sentiment Payload</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">State</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <MessageSquare size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Sentiment Matrix is empty for current parameters</p>
                  </td>
                </tr>
              ) : paginatedReviews.map(review => {
                const status = STATUS_MAP[review.status] || STATUS_MAP['pending'];
                const StatusIcon = status.icon;
                const rRating = parseInt(review.rating) || 0;

                return (
                  <tr key={review.id || review._id} className="hover:bg-amber-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex-shrink-0 p-1">
                          <img 
                            src={getImageUrl(review.product?.images?.[0] || review.product?.image_url)} 
                            alt="product" 
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => { e.target.src = '/logo.webp'; }}
                          />
                        </div>
                        <div className="max-w-[150px]">
                          <p className="text-xs font-bold text-white truncate">{review.product?.name || 'Unknown Node'}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {review.product_id || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-white truncate max-w-[150px]">{review.user?.name || review.reviewer_name || 'Guest User'}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex mb-1.5 gap-0.5 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < rRating ? "currentColor" : "none"} className={i < rRating ? "" : "text-slate-700"} />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-white truncate max-w-[250px]">{review.title || 'No Title'}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[250px] mt-1">{review.comment || review.review || 'No content provided.'}</p>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-${status.color}-500/10 text-${status.color}-500 border border-${status.color}-500/20`}>
                        <StatusIcon size={12} /> {status.label}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {review.status === 'pending' && (
                          <button 
                            onClick={() => handleUpdateStatus(review.id || review._id, 'approved')}
                            className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md"
                            title="Publish to Storefront"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedReview(review)}
                          className="px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-slate-950 transition-all text-[10px] font-black uppercase tracking-widest shadow-md inline-flex items-center gap-2"
                        >
                          <Eye size={14} /> Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEEP INSPECTOR MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300 relative">
            
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Feedback Telemetry</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Deep Scan Inspector</p>
                </div>
              </div>
              <button onClick={() => setSelectedReview(null)} className="p-3 bg-slate-950 border border-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all shadow-md">
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12">
              
              {/* Context Sidebar */}
              <div className="col-span-1 md:col-span-4 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/30">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><Box size={14}/> Target Hardware Node</h4>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex gap-3 items-center">
                      <img 
                        src={getImageUrl(selectedReview.product?.images?.[0] || selectedReview.product?.image_url)} 
                        alt="hardware" 
                        className="w-14 h-14 object-cover rounded-xl border border-slate-800"
                        onError={(e) => { e.target.src = '/logo.webp'; }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white line-clamp-2">{selectedReview.product?.name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2"><User size={14}/> Client Identity</h4>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                      <p className="text-sm font-bold text-white">{selectedReview.user?.name || selectedReview.reviewer_name || 'Guest User'}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">{selectedReview.user?.email || 'No email attached'}</p>
                      <div className="w-full h-px bg-slate-800 my-3"></div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Submitted: <span className="text-slate-300 font-mono">{new Date(selectedReview.created_at).toLocaleString()}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Feedback Viewer */}
              <div className="col-span-1 md:col-span-8 p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={24} fill={i < (parseInt(selectedReview.rating) || 0) ? "currentColor" : "none"} className={i < (parseInt(selectedReview.rating) || 0) ? "" : "text-slate-800"} />
                    ))}
                  </div>
                  <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                    selectedReview.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    selectedReview.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {STATUS_MAP[selectedReview.status]?.label || 'Pending'}
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 mb-8 relative">
                  <MessageSquare size={100} className="absolute top-4 right-4 text-slate-800/30 pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-4 relative z-10">{selectedReview.title || 'No Title'}</h3>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed relative z-10 whitespace-pre-wrap">
                    "{selectedReview.comment || selectedReview.review || 'No content provided.'}"
                  </p>
                </div>

                {/* Moderation Controls */}
                <div className="border-t border-slate-800 pt-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><ShieldAlert size={14}/> Execution Protocols</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      disabled={isUpdating || selectedReview.status === 'approved'}
                      onClick={() => handleUpdateStatus(selectedReview.id || selectedReview._id, 'approved')}
                      className="px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-500 hover:text-black transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle size={14}/> Publish to Storefront
                    </button>
                    <button 
                      disabled={isUpdating || selectedReview.status === 'rejected'}
                      onClick={() => handleUpdateStatus(selectedReview.id || selectedReview._id, 'rejected')}
                      className="px-6 py-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle size={14}/> Filter (Hide)
                    </button>
                    <div className="flex-1"></div>
                    <button 
                      onClick={() => handleDelete(selectedReview.id || selectedReview._id)}
                      className="px-6 py-3.5 bg-slate-950 border border-slate-800 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-md flex items-center gap-2"
                    >
                      <Trash2 size={14}/> Purge Node
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
