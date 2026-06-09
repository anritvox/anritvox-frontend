import React, { useState, useEffect } from 'react';
import { 
  Store, ShieldCheck, Ban, Activity, DollarSign, Package, 
  Calendar, Search, RefreshCw, Plus, XCircle, TrendingUp 
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function WarehouseManagement() {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' or 'access'
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast() || {};


  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]); // Today by default
  const [filterStore, setFilterStore] = useState('');


  const [distributors, setDistributors] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // For granting new access
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccessForm, setNewAccessForm] = useState({ user_id: '', store_name: '' });

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'access') fetchAccessData();
  }, [activeTab, filterDate, filterStore]);


  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const salesRes = await api.get('/warehouse/admin/sales', { params: { date: filterDate, store_user_id: filterStore } });
      const summaryRes = await api.get('/warehouse/admin/sales-summary', { params: { date: filterDate, store_user_id: filterStore } });
      setSales(salesRes.data?.sales || []);
      setSummary(summaryRes.data?.summary || []);
    } catch (err) {
      showToast?.('Failed to fetch warehouse analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessData = async () => {
    setLoading(true);
    try {
      const distRes = await api.get('/warehouse/admin/users');
      setDistributors(distRes.data?.users || []);
    } catch (err) {
      showToast?.('Failed to fetch distributors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/warehouse/admin/all-users');

      setAllUsers((res.data?.users || []).filter(u => u.has_access === 0));
    } catch (err) {
      showToast?.('Failed to fetch user directory', 'error');
    }
  };


  const handleGrantAccess = async (e) => {
    e.preventDefault();
    try {
      await api.post('/warehouse/admin/grant-access', newAccessForm);
      showToast?.('Warehouse access granted successfully!', 'success');
      setIsModalOpen(false);
      setNewAccessForm({ user_id: '', store_name: '' });
      fetchAccessData();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Failed to grant access', 'error');
    }
  };

  const handleRevokeAccess = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke this user\'s warehouse access?')) return;
    try {
      await api.post('/warehouse/admin/revoke-access', { user_id: userId });
      showToast?.('Access revoked', 'success');
      fetchAccessData();
    } catch (err) {
      showToast?.('Failed to revoke access', 'error');
    }
  };


  const totalRevenue = sales.reduce((sum, s) => sum + parseFloat(s.total_value || 0), 0);
  const totalItemsSold = sales.reduce((sum, s) => sum + parseInt(s.quantity || 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans">
      
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Warehouse <span className="text-cyan-500">Command</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
            Global Distributor Analytics & Access Control
          </p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('access')}
            className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'access' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Access Control
          </button>
        </div>
      </div>

      {}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          {}
          <div className="flex flex-wrap gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <Calendar size={16} className="text-cyan-500" />
              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-white text-sm font-bold outline-none"
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="text-slate-500 hover:text-rose-500 ml-2"><XCircle size={14}/></button>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex-1 min-w-[200px]">
              <Store size={16} className="text-cyan-500" />
              <select 
                value={filterStore} 
                onChange={(e) => setFilterStore(e.target.value)}
                className="bg-transparent text-white text-sm font-bold outline-none w-full appearance-none"
              >
                <option value="">All Stores/Distributors</option>
                {distributors.map(d => (
                  <option key={d.user_id} value={d.user_id}>{d.store_name} ({d.name})</option>
                ))}
              </select>
            </div>

            <button onClick={fetchAnalytics} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-cyan-400 transition-colors">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl"><DollarSign size={24} /></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Revenue</p>
                <h3 className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-4 bg-cyan-500/10 text-cyan-500 rounded-xl"><Package size={24} /></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Items Sold</p>
                <h3 className="text-2xl font-black text-white">{totalItemsSold}</h3>
              </div>
            </div>
            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl"><Activity size={24} /></div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Transactions</p>
                <h3 className="text-2xl font-black text-white">{sales.length}</h3>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {}
            <div className="lg:col-span-1 bg-slate-900/30 rounded-[2rem] border border-slate-800 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <TrendingUp size={16} className="text-cyan-500"/> Product Breakdown
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-3 custom-scrollbar">
                {summary.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm mt-10">No sales data found for these filters.</p>
                ) : summary.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="font-bold text-white text-sm">{item.product_name}</p>
                    <p className="text-[10px] uppercase text-slate-500 tracking-widest mb-2">{item.store_name}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-cyan-400 font-bold">{item.total_qty} units</span>
                      <span className="text-sm text-emerald-400 font-black">₹{parseFloat(item.total_revenue).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {}
            <div className="lg:col-span-2 bg-slate-900/30 rounded-[2rem] border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <Activity size={16} className="text-purple-500"/> Transaction Log
                </h3>
              </div>
              <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Time</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Store</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Product</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Qty</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {sales.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-500">No transactions recorded.</td></tr>
                    ) : sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 text-xs font-mono text-slate-400">
                          {new Date(sale.sold_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-white">{sale.store_name}</p>
                          <p className="text-[9px] uppercase tracking-widest text-slate-500">{sale.distributor_name}</p>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-300">{sale.product_name}</td>
                        <td className="p-4 text-sm font-bold text-cyan-400 text-right">{sale.quantity}</td>
                        <td className="p-4 text-sm font-black text-emerald-400 text-right">{parseFloat(sale.total_value).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {}
      {activeTab === 'access' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400 font-medium">Control which users can deploy local warehouse nodes.</p>
            <button 
              onClick={() => { fetchAllUsers(); setIsModalOpen(true); }}
              className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Plus size={16} /> Authorize New User
            </button>
          </div>

          <div className="bg-slate-900/30 rounded-[2rem] border border-slate-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Distributor Info</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Assigned Store</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Sales Metrics</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Access State</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {distributors.length === 0 ? (
                  <tr><td colSpan="5" className="p-10 text-center text-slate-500">No warehouse distributors found.</td></tr>
                ) : distributors.map(dist => (
                  <tr key={dist.id} className="hover:bg-slate-800/20">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{dist.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">{dist.email}</p>
                    </td>
                    <td className="p-6 text-sm font-bold text-cyan-400">{dist.store_name || 'Unnamed Node'}</td>
                    <td className="p-6 text-xs text-slate-400">{dist.total_sales} Recorded Transactions</td>
                    <td className="p-6">
                      {dist.is_active === 1 ? (
                         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500">
                          <ShieldCheck size={10} /> Active
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500">
                          <Ban size={10} /> Revoked
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {dist.is_active === 1 && (
                        <button 
                          onClick={() => handleRevokeAccess(dist.user_id)}
                          className="px-3 py-1.5 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Authorize Distributor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-rose-500"><XCircle size={20}/></button>
            </div>
            <form onSubmit={handleGrantAccess} className="p-6 space-y-6">
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Select Basic User</label>
                <select 
                  required
                  value={newAccessForm.user_id}
                  onChange={(e) => setNewAccessForm({...newAccessForm, user_id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors appearance-none"
                >
                  <option value="">-- Choose User --</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Assign Store / Warehouse Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Downtown Asansol Hub"
                  value={newAccessForm.store_name}
                  onChange={(e) => setNewAccessForm({...newAccessForm, store_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-700 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-cyan-500 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-cyan-400">
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
