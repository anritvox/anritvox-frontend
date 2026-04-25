import React, { useState, useEffect } from 'react';
import { reviews as reviewApi } from '../../services/api';
import { 
  Star, Trash2, CheckCircle, Clock, 
  RefreshCw, MessageSquare, ThumbsUp, 
  ThumbsDown, Search, Filter, ShieldCheck,
  AlertCircle, ChevronRight, MoreVertical,
  Reply, BarChart3, TrendingUp, User
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ReviewManagement() {
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { showToast } = useToast() || {};

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getAllAdmin();
      const data = res.data?.reviews || res.data?.data || res.data;
      setReviewsList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showToast?.('Failed to synchronize feedback nodes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id) => {
    try {
      await reviewApi.approve(id);
      showToast?.('Review published successfully', 'success');
      fetchReviews();
    } catch (e) {
      showToast?.('Publication failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('CRITICAL: Purge this feedback record?')) return;
    try {
      await reviewApi.delete(id);
      showToast?.('Record purged from registry', 'success');
      fetchReviews();
    } catch (e) {
      showToast?.('Purge operation failed', 'error');
    }
  };

  const stats = {
    total: reviewsList.length,
    pending: reviewsList.filter(r => r.status === 'pending').length,
    average: (reviewsList.reduce((acc, r) => acc + r.rating, 0) / (reviewsList.length || 1)).toFixed(1),
    positive: reviewsList.filter(r => r.rating >= 4).length
  };

  const filtered = reviewsList.filter(r => {
    const matchesSearch = (r.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.comment?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || r.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-slate-500 font-black uppercase text-[10px] tracking-widest animate-pulse">Analyzing Feedback Sentiment...</div>
    </div>
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 rounded-3xl border border-amber-500/20">
              <MessageSquare className="text-amber-500" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Sentiment <span className="text-amber-500">Center</span></h1>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Global Customer Feedback & Rating Matrix</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={fetchReviews} className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl text-slate-400 hover:text-amber-400 transition-all active:scale-95">
             <RefreshCw size={20} />
           </button>
           <button className="bg-amber-500 hover:bg-amber-400 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-amber-950 transition-all shadow-xl shadow-amber-500/20">
             Configure Auto-Moderation
           </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Logs', val: stats.total, icon: BarChart3, color: 'blue' },
          { label: 'Pending Audit', val: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Mean Rating', val: stats.average, icon: Star, color: 'emerald' },
          { label: 'Positive Trend', val: stats.positive, icon: TrendingUp, color: 'purple' }
        ].map((s, i) => (
          <div key={i} className={`bg-slate-900/40 border border-white/5 p-6 rounded-3xl group hover:border-white/10 transition-colors`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 bg-${s.color}-500/10 rounded-xl`}>
                <s.icon className={`text-${s.color}-500`} size={20} />
              </div>
              <ChevronRight size={16} className="text-slate-700" />
            </div>
            <div className="text-white font-black text-3xl mb-1">{s.val}</div>
            <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            placeholder="Search comments, products or users..."
            className="bg-slate-950/50 border border-slate-800/50 px-12 py-3 rounded-2xl outline-none focus:border-amber-500/30 transition-all w-full text-sm font-bold text-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 px-4 py-3 rounded-2xl min-w-[160px]">
            <Filter size={14} className="text-slate-500" />
            <select 
              className="bg-transparent outline-none text-xs font-bold text-slate-300 w-full cursor-pointer"
              value={selectedFilter}
              onChange={e => setSelectedFilter(e.target.value)}
            >
              <option value="all">Show All</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Review Grid/Table */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">User & Product</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Assessed Sentiment</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(review => (
                <tr key={review.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-amber-500">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-white font-black uppercase text-sm">{review.user_name}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-1 flex items-center gap-2">
                          <ChevronRight size={10} className="text-amber-500" /> {review.product_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2 max-w-md">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                        ))}
                      </div>
                      <p className="text-slate-300 text-xs font-medium leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${ 
                      review.status === 'pending' 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {review.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(review.id)}
                          className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all"
                          title="Approve & Publish"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      <button className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all" title="Reply to Customer">
                        <Reply size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-32 text-center space-y-6">
            <MessageSquare className="mx-auto text-slate-800/50" size={120} />
            <div className="space-y-2">
              <div className="text-slate-500 font-black uppercase tracking-[0.4em] text-lg">No Sentiment Signals Found</div>
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The global feedback registry returned no matches for your current selection matrix.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
