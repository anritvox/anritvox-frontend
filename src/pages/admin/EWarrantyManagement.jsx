import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, Search, Trash2, ShieldAlert, 
  Calendar, RefreshCw, XCircle, CheckCircle, 
  Plus, Hash, Database, Cpu, Zap, Filter, 
  FileText, Download, History, UserCheck, AlertTriangle
} from 'lucide-react';
import api, { warranty as warrantyApi, products as productsApi } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function EWarrantyManagement() {
  const [activeTab, setActiveTab] = useState('registrations');
  const [warranties, setWarranties] = useState([]);
  const [serialsVault, setSerialsVault] = useState([]);
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultFilter, setVaultFilter] = useState('all'); // all, available, registered, legacy
  
  // Generator State
  const [genModal, setGenModal] = useState(false);
  const [genData, setGenData] = useState({ productId: '', count: 10, prefix: 'ANRI', format: 'advanced', warranty: 12 });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { showToast } = useToast() || {};

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resW, resS, resP] = await Promise.all([
        warrantyApi.getAllAdmin(),
        api.get("/warranty/serials"), // Critical Fix: Pointing to the SQL JOIN route to recover legacy serials
        productsApi.getAllAdmin()
      ]);
      setWarranties(resW.data?.data || resW.data || []);
      setSerialsVault(resS.data || []);
      setProductList(resP.data?.products || resP.data?.data || resP.data || []);
    } catch (err) {
      console.error(err);
      showToast?.("Telemetry sync failed. Check database connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- MUTATION PROTOCOLS ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/warranty/${id}/status`, { status: newStatus });
      showToast?.(`Assurance node status updated to ${newStatus.toUpperCase()}`, "success");
      
      // Optimistic Update
      setWarranties(warranties.map(w => w.id === id ? { ...w, status: newStatus } : w));
    } catch (err) {
      showToast?.("Status mutation failed", "error");
    }
  };

  const handleDeleteSerial = async (serialId) => {
    if (!window.confirm("CRITICAL WARNING: Purging this serial will permanently invalidate it. Proceed?")) return;
    try {
      await api.delete(`/warranty/serials/${serialId}`);
      showToast?.("Serial hash purged from registry", "success");
      setSerialsVault(serialsVault.filter(s => s.id !== serialId));
    } catch (err) {
      showToast?.("Purge protocol failed", "error");
    }
  };

  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      await api.post("/serials/generate", {
        productId: genData.productId,
        count: parseInt(genData.count),
        prefix: genData.prefix,
        format: genData.format,
        base_warranty_months: genData.warranty
      });
      showToast?.(`Successfully generated ${genData.count} encrypted hashes.`, "success");
      setGenModal(false);
      fetchData();
    } catch (err) {
      showToast?.("Generation sequence failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- EXPORT PROTOCOL ---
  const exportVault = () => {
    const headers = ['Hash ID', 'Encrypted Serial', 'Hardware Node', 'SKU', 'Term (Months)', 'Legacy Node', 'State', 'Deployed At'];
    const csv = serialsVault.map(s => [
      s.id, 
      s.serial_number, 
      `"${s.product_name || 'Legacy/Orphaned Node'}"`, 
      s.sku || 'N/A',
      s.base_warranty_months || 12,
      s.is_legacy ? 'YES' : 'NO',
      s.status, 
      new Date(s.created_at).toLocaleString()
    ].join(',')).join('\n');
    
    const blob = new Blob([[headers.join(','), csv].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anritvox_Serial_Registry_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // --- ANALYTICS & FILTERING ---
  const filteredRegistrations = useMemo(() => {
    return warranties.filter(w => 
      w.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.registered_serial?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [warranties, searchTerm]);

  const filteredVault = useMemo(() => {
    return serialsVault.filter(s => {
      const matchesSearch = s.serial_number?.toLowerCase().includes(vaultSearch.toLowerCase()) || 
                            s.product_name?.toLowerCase().includes(vaultSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (vaultFilter === 'available') return s.status === 'available';
      if (vaultFilter === 'registered') return s.status === 'registered';
      if (vaultFilter === 'legacy') return s.is_legacy;
      return true;
    });
  }, [serialsVault, vaultSearch, vaultFilter]);

  // Telemetry KPIs
  const activeWarranties = warranties.filter(w => w.status === 'approved' || w.status === 'active').length;
  const flaggedWarranties = warranties.filter(w => w.status === 'rejected' || w.status === 'revoked').length;
  const totalSerials = serialsVault.length;
  const availableSerials = serialsVault.filter(s => s.status === 'available').length;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-[#020617]">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <ShieldCheck className="absolute inset-0 m-auto text-purple-500 animate-pulse" size={24} />
      </div>
      <div className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">Decrypting Vault Data...</div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Assurance <span className="text-purple-500">Vault</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <Cpu size={12} className="text-purple-500" /> E-Warranty & Serial Integrity Network
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportVault} className="flex items-center gap-2 px-5 py-3 bg-slate-900 border border-slate-800 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-800 hover:text-white transition-all shadow-lg">
            <Download size={16} /> Export Registry
          </button>
          <button onClick={() => setGenModal(true)} className="flex items-center gap-2 px-5 py-3 bg-purple-500/10 border border-purple-500/50 text-purple-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Zap size={16} /> Batch Generator
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-500 z-10"><UserCheck size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Policies</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{activeWarranties}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-purple-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-purple-500 z-10"><Database size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Vault Hashes</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{totalSerials.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-blue-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-blue-500 z-10"><Hash size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Available Keys</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{availableSerials.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-rose-500 z-10"><ShieldAlert size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Flagged/Revoked</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{flaggedWarranties}</h4>
          </div>
        </div>
      </div>

      {/* MATRIX TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        {[
          { id: 'registrations', label: 'Client Registrations', icon: ShieldCheck },
          { id: 'vault', label: 'Hash Registry Vault', icon: Database }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
              : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        
        {activeTab === 'registrations' ? (
          <div className="space-y-0">
            <div className="p-6 border-b border-slate-800/80">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  placeholder="Scan by Client Name or Serial Hash..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-purple-500/50 transition-all text-sm font-bold text-white"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Identity</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Assurance Node</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Matrix</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredRegistrations.length === 0 ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">No active claims found</td></tr>
                  ) : filteredRegistrations.map((w) => {
                    const isRevoked = w.status === 'revoked' || w.status === 'rejected';
                    return (
                      <tr key={w.id} className="hover:bg-purple-500/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-purple-400 shadow-inner">
                              {w.user_name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">{w.user_name}</p>
                              <p className="text-[10px] text-slate-500 font-bold mt-0.5 flex items-center gap-1"><Calendar size={10}/> {new Date(w.registered_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-purple-400 font-mono font-black tracking-widest text-xs flex items-center gap-1.5"><Hash size={12}/> {w.registered_serial}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Node Reference: #{w.id}</p>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isRevoked ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {isRevoked ? <AlertTriangle size={12}/> : <CheckCircle size={12}/>}
                            {w.status || 'Active'}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button className="p-2.5 bg-slate-950 border border-slate-800 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 rounded-xl text-slate-400 transition-all" title="View Documents"><FileText size={16} /></button>
                            <button 
                              onClick={() => handleUpdateStatus(w.id, isRevoked ? 'approved' : 'revoked')}
                              className={`p-2.5 bg-slate-950 border border-slate-800 rounded-xl transition-all ${isRevoked ? 'hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 text-slate-400' : 'hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 text-slate-400'}`}
                              title={isRevoked ? "Reinstate Policy" : "Revoke Policy"}
                            >
                              {isRevoked ? <RefreshCw size={16} /> : <XCircle size={16} />}
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
        ) : (
          <div className="space-y-0">
            <div className="p-6 border-b border-slate-800/80 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  placeholder="Scan specific serial hash..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-purple-500/50 transition-all text-sm font-bold text-white"
                  value={vaultSearch} onChange={(e) => setVaultSearch(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-64">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                <select 
                  value={vaultFilter} onChange={(e) => setVaultFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="all">All Registry Hashes</option>
                  <option value="available">Available (Unclaimed)</option>
                  <option value="registered">Registered (Claimed)</option>
                  <option value="legacy">Legacy Identifiers</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Encrypted Serial Hash</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hardware Target</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Generation Date</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">State</th>
                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredVault.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">No serials match parameters</td></tr>
                  ) : filteredVault.map(s => (
                    <tr key={s.id} className="hover:bg-purple-500/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-purple-400 text-sm tracking-widest">{s.serial_number}</span>
                          {s.is_legacy === 1 && <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[8px] font-black uppercase">Legacy</span>}
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-xs font-bold text-white max-w-[200px] truncate">{s.product_name || 'Orphaned Node'}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 flex items-center gap-1">
                          <ShieldCheck size={10}/> {s.base_warranty_months || 12} Mo Policy
                        </p>
                      </td>
                      <td className="p-6 text-slate-400 text-xs font-bold font-mono">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          s.status === 'registered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleDeleteSerial(s.id)}
                          className="p-2.5 bg-slate-950 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Purge Serial"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* GENERATOR MODAL */}
      {genModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-800 flex justify-between items-start bg-purple-500/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Cryptographic Generator</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Batch produce secure assurance hashes</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setGenModal(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-950 p-2 rounded-xl border border-slate-800">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Hardware Node</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                  value={genData.productId} onChange={e => setGenData({...genData, productId: e.target.value})}
                >
                  <option value="">Select Hardware...</option>
                  {productList.map(p => <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Batch Yield Count</label>
                  <input 
                    type="number" min="1" max="5000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono font-bold text-white outline-none focus:border-purple-500/50"
                    value={genData.count} onChange={e => setGenData({...genData, count: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hash Prefix (Max 4)</label>
                  <input 
                    type="text" maxLength="4" placeholder="ANRI" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono font-black text-purple-400 uppercase outline-none focus:border-purple-500/50"
                    value={genData.prefix} onChange={e => setGenData({...genData, prefix: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Encryption Protocol</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                    value={genData.format} onChange={e => setGenData({...genData, format: e.target.value})}
                  >
                    <option value="advanced">Advanced (Checksum Auth)</option>
                    <option value="legacy">Legacy (Standard Base36)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Warranty (Months)</label>
                  <input 
                    type="number" min="1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-purple-500/50"
                    value={genData.warranty} onChange={e => setGenData({...genData, warranty: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button 
                  onClick={handleGenerate} disabled={!genData.productId || isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
                  Execute Deployment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
