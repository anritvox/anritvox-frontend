import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Trash2, ShieldAlert, 
  Loader2, Calendar, RefreshCw, XCircle, 
  CheckCircle, Plus, Hash, Database, 
  Cpu, Zap, Filter, FileText, BarChart3, 
  Download, History, Settings2, Link, UserCheck
} from 'lucide-react';
import api, { warranty, products } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function EWarrantyManagement() {
  const [activeTab, setActiveTab] = useState('registrations');
  const [warranties, setWarranties] = useState([]);
  const [serialsVault, setSerialsVault] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [vaultSearch, setVaultSearch] = useState('');
  
  // Generator State
  const [genModal, setGenModal] = useState(false);
  const [genData, setGenData] = useState({ productId: '', count: 10, prefix: '', warranty: 12 });
  
  const { showToast } = useToast() || {};

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resW, resS, resP] = await Promise.all([
        warranty.getAllAdmin(),
        api.get("/serials/admin/all"),
        products.getAllAdmin()
      ]);
      setWarranties(resW.data?.data || resW.data || []);
      setSerialsVault(resS.data?.serials || []);
      setProductList(resP.data?.data || resP.data || []);
    } catch (err) {
      console.error(err);
      showToast?.("Connectivity error with warranty server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await warranty.updateStatus(id, newStatus);
      showToast?.(`Warranty status updated to ${newStatus.toUpperCase()}`, "success");
      fetchData();
    } catch (err) {
      showToast?.("Operation failed", "error");
    }
  };

  const handleGenerate = async () => {
    try {
      await api.post("/serials/generate", {
        productId: genData.productId,
        count: parseInt(genData.count),
        prefix: genData.prefix,
        base_warranty_months: genData.warranty
      });
      showToast?.(`${genData.count} Serials Generated Successfully`, "success");
      setGenModal(false);
      fetchData();
    } catch (err) {
      showToast?.("Generation process failed", "error");
    }
  };

  const exportVault = () => {
    const headers = ['ID', 'Serial', 'Product', 'Status', 'Generated At'];
    const csv = serialsVault.map(s => [
      s.id, s.serial_number, s.product_name, s.status, s.created_at
    ].join(',')).join('\n');
    const blob = new Blob([[headers.join(','), csv].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `serial_vault_export_${new Date().getTime()}.csv`;
    a.click();
  };

  const filteredRegistrations = warranties.filter(w => 
    w.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.registered_serial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <ShieldCheck className="absolute inset-0 m-auto text-purple-500 animate-pulse" size={24} />
      </div>
      <div className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">Syncing Warranty Nodes...</div>
    </div>
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 rounded-3xl border border-purple-500/20">
              <ShieldCheck className="text-purple-500" size={40} />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase text-white">Warranty <span className="text-purple-500">Vault</span></h1>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                <Cpu size={12} /> Global Serial Integrity & Assurance Network
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={exportVault}
            className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={() => setGenModal(true)}
            className="flex items-center gap-3 bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-purple-600/20 active:scale-95"
          >
            <Zap size={18} /> Bulk Generator
          </button>
        </div>
      </div>

      {/* Analytics Mini-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Registered Units', val: warranties.length, icon: UserCheck, color: 'emerald' },
          { label: 'Vault Inventory', val: serialsVault.length, icon: Database, color: 'purple' },
          { label: 'Available Keys', val: serialsVault.filter(s => s.status === 'available').length, icon: Hash, color: 'blue' },
          { label: 'Integrity Nodes', val: '99.9%', icon: ShieldCheck, color: 'orange' }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-3">
            <div className={`p-2 bg-${stat.color}-500/10 rounded-xl w-fit`}>
              <stat.icon className={`text-${stat.color}-500`} size={20} />
            </div>
            <div>
              <div className="text-white font-black text-2xl">{stat.val}</div>
              <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs System */}
      <div className="space-y-6">
        <div className="flex items-center gap-1 bg-slate-900/50 p-1.5 rounded-2xl w-fit border border-white/5">
          {[
            { id: 'registrations', label: 'Active Registrations', icon: ShieldCheck },
            { id: 'vault', label: 'Serial Number Vault', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-slate-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden">
          {activeTab === 'registrations' ? (
            <div className="p-8 space-y-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  placeholder="Search registrations..." 
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-purple-500/30 transition-all text-sm font-bold text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto rounded-3xl border border-white/5">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-white/5">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Client Identity</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Product Assurance</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRegistrations.map((w) => (
                      <tr key={w.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-purple-400">
                              {w.user_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="text-white font-black uppercase text-sm">{w.user_name}</div>
                              <div className="text-[10px] text-slate-500 font-bold">Registered: {new Date(w.registered_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-purple-400 font-mono font-black tracking-widest text-sm">
                              <Hash size={12} /> {w.registered_serial}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">Assurance Node: {w.id}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${
                            w.status === 'revoked' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {w.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-3 bg-slate-800 hover:bg-white/10 rounded-xl text-slate-400 transition-all"><FileText size={18} /></button>
                              <button 
                                onClick={() => handleUpdateStatus(w.id, w.status === 'revoked' ? 'active' : 'revoked')}
                                className={`p-3 rounded-xl transition-all ${w.status === 'revoked' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}
                              >
                                {w.status === 'revoked' ? <RefreshCw size={18} /> : <XCircle size={18} />}
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    placeholder="Search Serial Number Vault..." 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-purple-500/30 transition-all text-sm font-bold text-white"
                    value={vaultSearch}
                    onChange={(e) => setVaultSearch(e.target.value)}
                  />
                </div>
                <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-colors"><Filter size={20} /></button>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-black/20">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Serial Identity</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Product Link</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase">Deployment</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {serialsVault.filter(s => s.serial_number.includes(vaultSearch)).map(s => (
                      <tr key={s.id} className="hover:bg-white/[0.01]">
                        <td className="px-8 py-5 font-mono font-black text-purple-400">{s.serial_number}</td>
                        <td className="px-8 py-5">
                          <div className="text-white font-bold text-xs">{s.product_name}</div>
                          <div className="text-[10px] text-slate-600 font-bold uppercase">{s.product_sku}</div>
                        </td>
                        <td className="px-8 py-5 text-slate-400 text-xs font-bold">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                            s.status === 'registered' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {genModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tighter text-white">SERIAL <span className="text-purple-500">GENERATOR</span></h3>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Batch assurance key production module</p>
              </div>
              <button onClick={() => setGenModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><XCircle className="text-slate-500" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Product</label>
                <select 
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-purple-500/30"
                  value={genData.productId}
                  onChange={e => setGenData({...genData, productId: e.target.value})}
                >
                  <option value="">Select Product...</option>
                  {productList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Batch Count</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-purple-500/30"
                  value={genData.count}
                  onChange={e => setGenData({...genData, count: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Serial Prefix</label>
                <input 
                  placeholder="e.g. ANRI" 
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-purple-500/30"
                  value={genData.prefix}
                  onChange={e => setGenData({...genData, prefix: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Warranty Term (Months)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-purple-500/30"
                  value={genData.warranty}
                  onChange={e => setGenData({...genData, warranty: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleGenerate}
                disabled={!genData.productId}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-purple-600/20"
              >
                Execute Generation Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
