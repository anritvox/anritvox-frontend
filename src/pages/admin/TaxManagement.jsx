import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, Plus, Edit2, Trash2, X, Search, Filter, 
  Globe, Percent, Activity, AlertTriangle, CheckCircle 
} from 'lucide-react';
import api from '../../services/api';

export default function TaxManagement() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [currentTax, setCurrentTax] = useState(null);
  

  const [formData, setFormData] = useState({ name: '', rate: '', region: '', is_active: 1 });
  const [processing, setProcessing] = useState(false);

  useEffect(() => { 
    fetchTaxes(); 
  }, []);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tax');
      setTaxes(Array.isArray(response.data) ? response.data : []);
    } catch (error) { 
      console.error("Error fetching tax matrix:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const openModal = (tax = null) => {
    if (tax) {
      setCurrentTax(tax);
      setFormData({ name: tax.name, rate: tax.rate, region: tax.region, is_active: tax.is_active });
    } else {
      setCurrentTax(null);
      setFormData({ name: '', rate: '', region: '', is_active: 1 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (currentTax) { 
        await api.put(`/tax/${currentTax.id}`, formData); 
      } else { 
        await api.post('/tax', formData); 
      }
      setIsModalOpen(false);
      await fetchTaxes();
    } catch (error) { 
      console.error("Error saving tax logic:", error); 
    } finally {
      setProcessing(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    setProcessing(true);
    try {
      await api.delete(`/tax/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null });
      await fetchTaxes();
    } catch (error) { 
      console.error("Error deleting tax logic:", error); 
    } finally {
      setProcessing(false);
    }
  };

  const toggleStatus = async (tax) => {
    try {
      const updatedStatus = tax.is_active ? 0 : 1;
      await api.put(`/tax/${tax.id}`, { ...tax, is_active: updatedStatus });
      await fetchTaxes();
    } catch (error) {
      console.error("Error toggling tax status:", error);
    }
  };


  const metrics = useMemo(() => {
    const active = taxes.filter(t => t.is_active === 1);
    const avg = active.length > 0 ? active.reduce((acc, curr) => acc + parseFloat(curr.rate), 0) / active.length : 0;
    const regions = new Set(taxes.map(t => t.region)).size;
    
    return { activeCount: active.length, avgRate: avg.toFixed(2), totalRegions: regions };
  }, [taxes]);

  const filteredTaxes = useMemo(() => {
    return taxes.filter(tax => {
      const matchesSearch = 
        tax.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tax.region.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === 'all' ? true : 
        statusFilter === 'active' ? tax.is_active === 1 : tax.is_active === 0;
      return matchesSearch && matchesStatus;
    });
  }, [taxes, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Receipt className="text-emerald-500" size={24} />
            </div>
            Taxation Matrix
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-mono uppercase tracking-widest text-[10px]">
            Global & Regional Fiscal Configuration
          </p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95 uppercase tracking-wider text-sm"
        >
          <Plus size={18} /> Deploy Tax Logic
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-xl"><Activity className="text-emerald-500" size={24} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Rules</p>
            <p className="text-2xl font-black text-white font-mono">{metrics.activeCount}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-cyan-500/10 rounded-xl"><Percent className="text-cyan-500" size={24} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Avg Burden (Active)</p>
            <p className="text-2xl font-black text-white font-mono">{metrics.avgRate}%</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 rounded-xl"><Globe className="text-purple-500" size={24} /></div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mapped Jurisdictions</p>
            <p className="text-2xl font-black text-white font-mono">{metrics.totalRegions}</p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 shadow-xl">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" placeholder="Search Rules or Regions..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div className="relative sm:max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl pl-10 pr-8 py-2.5 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Logic</option>
            <option value="inactive">Suspended</option>
          </select>
        </div>
      </div>

      {}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-4">Rule Identifier</th>
                <th className="px-6 py-4">Tax Yield</th>
                <th className="px-6 py-4">Jurisdiction</th>
                <th className="px-6 py-4">Logic Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Matrix...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTaxes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-500 font-mono text-xs uppercase tracking-widest">
                    No fiscal configuration found.
                  </td>
                </tr>
              ) : (
                filteredTaxes.map((tax) => (
                  <tr key={tax.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-white tracking-wide">{tax.name}</td>
                    <td className="px-6 py-4 font-mono text-cyan-400 font-black text-base">
                      {parseFloat(tax.rate).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">
                        {tax.region}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(tax)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                          tax.is_active 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                          : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {tax.is_active ? <CheckCircle size={12}/> : <X size={12}/>}
                        {tax.is_active ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(tax)} className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-cyan-500/10">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setDeleteModal({ isOpen: true, id: tax.id })} className="p-2 text-slate-400 hover:text-rose-400 transition-colors ml-2 rounded-lg hover:bg-rose-500/10">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#050810]/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-md relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-black text-white mb-2 tracking-tight">
              {currentTax ? 'Reconfigure Tax Logic' : 'Establish Tax Logic'}
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">Set parameters for checkout calculation.</p>
            
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rule Identifier</label>
                <input 
                  type="text" required placeholder="e.g. IGST 18%" 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors" 
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Yield Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="number" required step="0.01" min="0" placeholder="18.00" 
                    className="w-full bg-slate-950 border border-slate-800 text-cyan-400 font-bold rounded-xl pl-11 pr-4 py-3 focus:border-cyan-500 focus:outline-none font-mono transition-colors" 
                    value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Applied Jurisdiction</label>
                <input 
                  type="text" required placeholder="e.g. National, Kerala, International" 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:border-cyan-500 focus:outline-none transition-colors" 
                  value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} 
                />
              </div>
              
              <div className="pt-2 pb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" className="sr-only"
                      checked={!!formData.is_active} 
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} 
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_active ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                    Activate Logic Gate
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 text-sm">
                  {processing ? 'Compiling...' : currentTax ? 'Update Node' : 'Initialize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050810]/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-sm p-8 shadow-[0_0_50px_rgba(244,63,94,0.15)] text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
             <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                <AlertTriangle size={32} className="text-rose-500" />
             </div>
             <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Purge Logic?</h3>
             <p className="text-slate-400 text-sm mb-8">
               This will permanently delete this tax configuration. Live checkouts will no longer apply this burden.
             </p>
             <div className="flex gap-3">
               <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                 Abort
               </button>
               <button onClick={executeDelete} disabled={processing} className="flex-1 py-3 bg-rose-500 hover:bg-rose-400 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50">
                 {processing ? '...' : 'Purge'}
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
