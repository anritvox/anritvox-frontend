import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Search, Plus, 
  Loader2, Filter, ShieldAlert, Database, X, FileText, 
  Activity, AlertTriangle
} from 'lucide-react';
import api from '../../services/api'; 

export default function WalletManagement() {
  const [data, setData] = useState({ stats: {}, wallets: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, credit, debit


  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adjustData, setAdjustData] = useState({
    userId: '',
    amount: '',
    type: 'credit',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallet/overview');
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching vault data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!adjustData.userId || !adjustData.amount || !adjustData.description) {
      setError('All fields are required for ledger auditing.');
      return;
    }

    if (parseFloat(adjustData.amount) <= 0) {
      setError('Amount must be a positive number. Use the Debit type to deduct.');
      return;
    }

    setProcessing(true);
    try {

      const response = await api.post('/wallet/adjust', { 
        userId: parseInt(adjustData.userId), 
        amount: parseFloat(adjustData.amount),
        type: adjustData.type,
        description: `[ADMIN OVERRIDE] ${adjustData.description}`
      });
      
      if (response.data.success) {
        setModalOpen(false);
        setAdjustData({ userId: '', amount: '', type: 'credit', description: '' });
        await fetchWalletData(); // Resync ledger
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute ledger adjustment.');
      console.error("Ledger override error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(tx => {
      const matchesSearch = 
        tx.user_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [data.transactions, searchTerm, typeFilter]);


  const recentVolume = useMemo(() => {
    return data.transactions.reduce((acc, tx) => {
      if (tx.type === 'credit') acc.credits += parseFloat(tx.amount);
      if (tx.type === 'debit') acc.debits += parseFloat(tx.amount);
      return acc;
    }, { credits: 0, debits: 0 });
  }, [data.transactions]);

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Wallet className="text-emerald-500" size={24} />
            </div>
            Financial Control Center
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono uppercase tracking-widest text-[10px]">
            Encrypted Ledger & Balance Auditing
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 uppercase tracking-wider text-sm"
        >
          <ShieldAlert size={16} /> Override Ledger
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Database size={64} className="text-blue-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> System Liability
          </p>
          <p className="text-3xl font-black text-white font-mono tracking-tighter">
            ₹{parseFloat(data.stats.totalBalanceHeld || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Nodes
          </p>
          <p className="text-3xl font-black text-white font-mono tracking-tighter">
            {data.stats.totalActiveWallets || 0}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 p-6 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.05)]">
          <p className="text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-2">Recent Inflow</p>
          <p className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">
            +₹{recentVolume.credits.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-rose-500/20 p-6 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.05)]">
          <p className="text-[10px] font-black text-rose-500/70 uppercase tracking-widest mb-2">Recent Outflow</p>
          <p className="text-2xl font-black text-rose-400 font-mono tracking-tighter">
            -₹{recentVolume.debits.toLocaleString()}
          </p>
        </div>
      </div>

      {}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950/40">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
            <FileText size={16} className="text-cyan-500" /> Immutable Ledger Logs
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search UID, TXN ID, or Memo..." 
                className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl pl-9 pr-4 py-2 focus:border-cyan-500 focus:outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-sm text-white rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
              >
                <option value="all">All Flows</option>
                <option value="credit">Credits Only</option>
                <option value="debit">Debits Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">TXN Hash</th>
                <th className="px-6 py-4">Target Node (UID)</th>
                <th className="px-6 py-4">Flow</th>
                <th className="px-6 py-4">Volume</th>
                <th className="px-6 py-4">Encrypted Memo</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Decrypting Ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-mono text-xs uppercase tracking-widest">
                    Zero logs found in current matrix.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">#{tx.id}</td>
                    <td className="px-6 py-4 font-mono text-white">USR-{tx.user_id}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center justify-center gap-1 w-20 px-2 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${
                        tx.type === 'credit' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {tx.type === 'credit' ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-bold font-mono ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-300">
                      {tx.description || <span className="text-slate-600 italic">No memo</span>}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 text-right">
                      {new Date(tx.created_at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050810]/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            
            <div className="p-6 border-b border-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ShieldAlert className="text-emerald-500" /> Authorize Override
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <p className="text-slate-400 text-xs mt-2">Manual adjustments bypass standard billing logic. Memos are strictly audited.</p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 text-xs font-bold">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Node (User ID)</label>
                  <input 
                    type="number" required
                    placeholder="e.g. 42"
                    value={adjustData.userId}
                    onChange={e => setAdjustData({...adjustData, userId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Amount (₹)</label>
                  <input 
                    type="number" step="0.01" min="0.01" required
                    placeholder="0.00"
                    value={adjustData.amount}
                    onChange={e => setAdjustData({...adjustData, amount: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Flow Direction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustData({...adjustData, type: 'credit'})}
                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                      adjustData.type === 'credit' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    <ArrowUpRight size={16} /> Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustData({...adjustData, type: 'debit'})}
                    className={`py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                      adjustData.type === 'debit' 
                        ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    <ArrowDownRight size={16} /> Debit (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Audit Memo (Required)</label>
                <input 
                  type="text" required
                  placeholder="Reason for adjustment (e.g. Refund for Order #1042)"
                  value={adjustData.description}
                  onChange={e => setAdjustData({...adjustData, description: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processing}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {processing ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
                  {processing ? 'Executing...' : 'Execute Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
