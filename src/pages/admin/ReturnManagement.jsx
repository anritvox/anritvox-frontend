import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  RotateCcw, Package, CheckCircle, XCircle, AlertCircle, 
  Search, Filter, Download, RefreshCw, Eye, IndianRupee, 
  Clock, Activity, Printer, FileText, ShieldAlert, ShieldCheck,
  User, Box, CreditCard, ClipboardCheck
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

// --- CONFIGURATION MAPS ---
const RMA_STATUS_MAP = {
  'pending': { label: 'RMA Requested', color: 'amber', icon: Clock, next: 'approved' },
  'approved': { label: 'RMA Approved', color: 'blue', icon: CheckCircle, next: 'received' },
  'received': { label: 'Item Received', color: 'purple', icon: Package, next: 'refunded' },
  'refunded': { label: 'Refund Issued', color: 'emerald', icon: IndianRupee, next: null },
  'exchanged': { label: 'Replacement Sent', color: 'emerald', icon: RotateCcw, next: null },
  'rejected': { label: 'RMA Denied', color: 'rose', icon: XCircle, next: null }
};

const CONDITION_GRADES = [
  { grade: 'A', desc: 'Pristine / Unopened', penalty: 0 },
  { grade: 'B', desc: 'Opened / Minor Wear', penalty: 10 },
  { grade: 'C', desc: 'Damaged Packaging', penalty: 20 },
  { grade: 'D', desc: 'Defective / Destroyed', penalty: 100 }
];

export default function ReturnManagement() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Inspector Modal State
  const [selectedRMA, setSelectedRMA] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Resolution State
  const [conditionGrade, setConditionGrade] = useState('A');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundOverride, setRefundOverride] = useState('');

  const { showToast } = useToast() || {};

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/returns').catch(() => api.get('/admin/returns'));
      setReturns(res.data?.returns || res.data?.data || res.data || []);
    } catch (err) {
      showToast?.('Failed to synchronize RMA matrix.', 'error');
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
  const handleUpdateStatus = async (rmaId, newStatus) => {
    if (!window.confirm(`Transition RMA to [${newStatus.toUpperCase()}] stage?`)) return;
    setIsUpdating(true);
    try {
      const payload = { 
        status: newStatus, 
        admin_notes: adminNotes,
        condition_grade: conditionGrade,
        refund_amount: refundOverride || selectedRMA?.refund_amount
      };

      await api.put(`/returns/${rmaId}/status`, payload).catch(() => 
        api.patch(`/returns/${rmaId}/status`, payload)
      );
      
      showToast?.(`RMA transitioned to ${newStatus}`, 'success');
      
      setReturns(returns.map(r => (r.id === rmaId || r._id === rmaId) ? { ...r, status: newStatus, ...payload } : r));
      if (selectedRMA) setSelectedRMA({ ...selectedRMA, status: newStatus, ...payload });
    } catch (err) {
      showToast?.('RMA transition failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- EXPORT PROTOCOL ---
  const exportToExcel = () => {
    const worksheetData = returns.map(r => ({
      'RMA Hash': r.rma_number || r.id || r._id,
      'Order ID': r.order_id || r.order?.order_number,
      'Timestamp': new Date(r.created_at).toLocaleString(),
      'Customer Name': r.user?.name || r.customer_name || 'Guest',
      'Reason': r.reason,
      'Requested Refund (₹)': parseFloat(r.refund_amount || 0),
      'Condition Grade': r.condition_grade || 'Pending',
      'Stage': r.status,
      'Admin Notes': r.admin_notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RMA Ledger");
    XLSX.writeFile(workbook, `Anritvox_Reverse_Logistics_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast?.('RMA Ledger Exported', 'success');
  };

  // --- ANALYTICS & FILTERING ---
  const filteredReturns = useMemo(() => {
    return returns.filter(r => {
      const searchStr = `${r.rma_number || r.id} ${r.order_id || ''} ${r.user?.name || ''} ${r.reason || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [returns, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const paginatedReturns = filteredReturns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Telemetry KPIs
  const totalRMARequests = returns.length;
  const pendingActionCount = returns.filter(r => r.status === 'pending' || r.status === 'approved' || r.status === 'received').length;
  const totalRefunded = returns.filter(r => r.status === 'refunded').reduce((acc, r) => acc + parseFloat(r.refund_amount || 0), 0);
  const rejectionRate = totalRMARequests > 0 ? Math.round((returns.filter(r => r.status === 'rejected').length / totalRMARequests) * 100) : 0;

  if (loading && returns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
          <RotateCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Reverse Logistics...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Reverse <span className="text-rose-500">Logistics</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <ShieldAlert size={12} className="text-rose-500" /> Advanced RMA & Financial Reconciliation
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchReturns} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-rose-400 transition-all shadow-lg">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-3 bg-rose-500/10 border border-rose-500/50 text-rose-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <Download size={16} /> Export RMA Ledger
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-rose-500 z-10"><Activity size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total RMA Cases</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{totalRMARequests}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-amber-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-amber-500 z-10"><Clock size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Pending Action</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{pendingActionCount}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-500 z-10"><IndianRupee size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Capital Refunded</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">₹{totalRefunded.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-purple-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-purple-500 z-10"><ShieldAlert size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Fraud / Rejection Rate</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{rejectionRate}%</h4>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-[2rem] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Scan by RMA Hash, Order ID, Client, or Reason..." 
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
          <select 
            value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All RMA Stages</option>
            {Object.entries(RMA_STATUS_MAP).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* RMA LEDGER TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">RMA Hash</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Client Identity</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Claim / Reason</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Resolution Value</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Stage</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <RotateCcw size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">RMA ledger is empty for current filters</p>
                  </td>
                </tr>
              ) : paginatedReturns.map(rma => {
                const status = RMA_STATUS_MAP[rma.status] || RMA_STATUS_MAP['pending'];
                const StatusIcon = status.icon;
                const rmaIdStr = rma.rma_number || `RMA-${String(rma.id || rma._id).padStart(5, '0')}`;

                return (
                  <tr key={rma.id || rma._id} className="hover:bg-rose-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-rose-500">
                          <RotateCcw size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white font-mono tracking-tighter">{rmaIdStr}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                            Order: #{rma.order_id || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-white truncate max-w-[150px]">{rma.user?.name || rma.customer_name || 'Guest User'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(rma.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={12} className="text-amber-500 shrink-0"/>
                        <p className="text-xs font-bold text-slate-300 truncate max-w-[200px]">{rma.reason}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-emerald-400 font-black tracking-tight text-sm">
                        ₹{parseFloat(rma.refund_amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-${status.color}-500/10 text-${status.color}-500 border border-${status.color}-500/20 shadow-[0_0_10px_rgba(var(--tw-colors-${status.color}-500),0.1)]`}>
                        <StatusIcon size={12} /> {status.label}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => {
                          setSelectedRMA(rma);
                          setConditionGrade(rma.condition_grade || 'A');
                          setAdminNotes(rma.admin_notes || '');
                          setRefundOverride(rma.refund_amount || '');
                        }}
                        className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-md inline-flex items-center gap-2"
                      >
                        <Eye size={14} /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMMAND CENTER MODAL - DEEP INSPECTION */}
      {selectedRMA && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-start bg-slate-900/50 flex-shrink-0">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                    <RotateCcw size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      RMA Hash: <span className="text-rose-400 font-mono">{selectedRMA.rma_number || `RMA-${String(selectedRMA.id || selectedRMA._id).padStart(5, '0')}`}</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                      <FileText size={12} /> Origin Order: #{selectedRMA.order_id || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="p-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all shadow-md hidden sm:block" title="Print Return Slip">
                  <Printer size={20} />
                </button>
                <button onClick={() => setSelectedRMA(null)} className="p-3 bg-slate-950 border border-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all shadow-md">
                  <XCircle size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body (2 Columns) */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* LEFT COLUMN: Claim Details & Hardware */}
                <div className="space-y-8">
                  
                  {/* Claim Diagnostics */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><AlertCircle size={14}/> Claim Diagnostics</h3>
                    <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">Customer Stated Reason</p>
                      <p className="text-sm font-bold text-white leading-relaxed">{selectedRMA.reason}</p>
                      {selectedRMA.comments && (
                        <div className="mt-4 pt-4 border-t border-rose-500/10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2">Additional Comments</p>
                          <p className="text-xs text-slate-300 italic">"{selectedRMA.comments}"</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Visual Evidence Area (If applicable in your DB) */}
                    {selectedRMA.images && selectedRMA.images.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Client Visual Evidence</p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {selectedRMA.images.map((img, i) => (
                            <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="w-20 h-20 rounded-xl overflow-hidden border border-slate-700 block flex-shrink-0 hover:border-rose-500 transition-colors">
                              <img src={getImageUrl(img)} className="w-full h-full object-cover" alt={`evidence-${i}`} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Targeted Hardware */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><Box size={14}/> Targeted Hardware Node</h3>
                    <div className="flex items-center gap-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0 p-1">
                        <img src={getImageUrl(selectedRMA.product?.images?.[0] || selectedRMA.product?.image_url)} alt="node" className="w-full h-full object-cover rounded-lg" onError={(e) => { e.target.src = '/logo.webp'; }}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{selectedRMA.product?.name || 'Unknown Hardware'}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">QTY Authorized: <span className="text-rose-400 font-black text-xs">{selectedRMA.quantity || 1}</span></p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: Resolution Engine */}
                <div className="space-y-8">
                  
                  {/* Warehouse Grading Matrix */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><ClipboardCheck size={14}/> Warehouse Receiving Matrix</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-3">Hardware Condition Grade</label>
                        <div className="grid grid-cols-2 gap-2">
                          {CONDITION_GRADES.map(grade => (
                            <div 
                              key={grade.grade}
                              onClick={() => setConditionGrade(grade.grade)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all ${conditionGrade === grade.grade ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-black text-lg">{grade.grade}</span>
                                {conditionGrade === grade.grade && <CheckCircle size={14} />}
                              </div>
                              <p className="text-[9px] font-bold uppercase mt-1">{grade.desc}</p>
                              {grade.penalty > 0 && <p className="text-[8px] text-rose-500 mt-1">-{grade.penalty}% Value</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Base Valuation (₹)</label>
                          <input type="text" readOnly value={selectedRMA.refund_amount || 0} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-500 font-mono outline-none cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 ml-1 block mb-2">Adjusted Refund (₹)</label>
                          <input 
                            type="number" 
                            value={refundOverride} onChange={e => setRefundOverride(e.target.value)}
                            placeholder="Override Amount"
                            className="w-full bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-400 font-black outline-none focus:border-emerald-500" 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Internal Auditing Notes</label>
                        <textarea 
                          rows={3} placeholder="Log visual damage, missing cables, or RMA approval notes..."
                          value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 resize-none outline-none focus:border-purple-500/50" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Execution Control Panel */}
                  <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2 relative z-10"><ShieldCheck size={14}/> Execution Protocol</h3>
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex gap-3">
                        <button 
                          disabled={isUpdating || selectedRMA.status === 'approved'}
                          onClick={() => handleUpdateStatus(selectedRMA.id || selectedRMA._id, 'approved')}
                          className="flex-1 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          Approve RMA
                        </button>
                        <button 
                          disabled={isUpdating || selectedRMA.status === 'rejected'}
                          onClick={() => handleUpdateStatus(selectedRMA.id || selectedRMA._id, 'rejected')}
                          className="flex-1 py-3 bg-rose-600/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          Deny Claim
                        </button>
                      </div>

                      <button 
                        disabled={isUpdating || selectedRMA.status === 'received'}
                        onClick={() => handleUpdateStatus(selectedRMA.id || selectedRMA._id, 'received')}
                        className="w-full py-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        Mark Hardware Received
                      </button>

                      <div className="pt-3 border-t border-slate-800 mt-2 flex gap-3">
                        <button 
                          disabled={isUpdating || selectedRMA.status === 'refunded'}
                          onClick={() => handleUpdateStatus(selectedRMA.id || selectedRMA._id, 'refunded')}
                          className="flex-1 py-4 bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <IndianRupee size={14}/> Execute Refund
                        </button>
                        <button 
                          disabled={isUpdating || selectedRMA.status === 'exchanged'}
                          onClick={() => handleUpdateStatus(selectedRMA.id || selectedRMA._id, 'exchanged')}
                          className="flex-1 py-4 bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={14}/> Execute Exchange
                        </button>
                      </div>
                    </div>
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
