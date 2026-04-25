import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Box, Search, RefreshCw, AlertTriangle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  TrendingDown, TrendingUp, Package, IndianRupee,
  Save, Download, Filter
} from 'lucide-react';
import { products as productsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, in-stock, low, out
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Quick Edit State
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { showToast } = useToast() || {};

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAllAdmin();
      setProducts(res.data?.products || res.data?.data || res.data || []);
    } catch (err) {
      showToast?.('Failed to sync telemetry.', 'error');
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

  // --- INLINE QUICK UPDATE PROTOCOL ---
  const handleQuickUpdate = async (productId) => {
    const newQuantity = parseInt(editValue, 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      showToast?.('Invalid stock quantity', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      await productsApi.update(productId, { quantity: newQuantity });
      showToast?.('Stock matrix updated', 'success');
      
      // Optimistic UI update to prevent full reload
      setProducts(products.map(p => 
        (p.id === productId || p._id === productId) ? { ...p, quantity: newQuantity } : p
      ));
      setEditingId(null);
    } catch (err) {
      showToast?.('Update protocol failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- EXCEL EXPORT PROTOCOL ---
  const exportToExcel = () => {
    const worksheetData = products.map(p => ({
      'SKU / ID': p.sku || p.id || p._id,
      'Hardware Node': p.name,
      'Taxonomy': p.category_name || 'N/A',
      'Current Stock': p.quantity,
      'Unit Price (₹)': p.price,
      'Total Node Valuation (₹)': p.quantity * p.price,
      'Status': p.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Audit");
    XLSX.writeFile(workbook, `Anritvox_Inventory_Telemetry_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast?.('XLSX Audit Exported', 'success');
  };

  // --- ANALYTICS & FILTERING ---
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (stockFilter === 'out') return p.quantity === 0;
      if (stockFilter === 'low') return p.quantity > 0 && p.quantity <= 10;
      if (stockFilter === 'in-stock') return p.quantity > 10;
      return true;
    });
  }, [products, searchTerm, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Telemetry Metrics
  const totalValuation = products.reduce((acc, p) => acc + (parseFloat(p.price || 0) * parseInt(p.quantity || 0)), 0);
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const totalUnits = products.reduce((acc, p) => acc + parseInt(p.quantity || 0), 0);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-300">
      
      {/* HEADER COMMAND CENTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            Inventory <span className="text-emerald-500">Command</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">
            Real-time Valuation & Stock Telemetry
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition-all">
            <RefreshCw size={16} />
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-emerald-500 hover:text-black transition-all">
            <Download size={14} /> Export Audit
          </button>
        </div>
      </div>

      {/* TELEMETRY KPI DASHBOARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><IndianRupee size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Valuation</p>
            <h4 className="text-lg font-black text-white tracking-tight">₹{totalValuation.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><Package size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Units Banked</p>
            <h4 className="text-lg font-black text-white tracking-tight">{totalUnits.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><AlertTriangle size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Critical Alert (&le;10)</p>
            <h4 className="text-lg font-black text-white tracking-tight">{lowStockCount} Nodes</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500"><TrendingDown size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Depleted (0)</p>
            <h4 className="text-lg font-black text-white tracking-tight">{outOfStockCount} Nodes</h4>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" placeholder="Search hardware node..." 
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-900/40 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
          <select 
            value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-900/40 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2.5 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in-stock">Healthy Stock (&gt;10)</option>
            <option value="low">Critical Stock (1-10)</option>
            <option value="out">Depleted (0)</option>
          </select>
        </div>
      </div>

      {/* DENSE TELEMETRY TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Hardware Node</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Health Indicator</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Unit Value</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-48">Live Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-bold text-xs">No hardware matches current parameters.</td>
                </tr>
              ) : paginatedProducts.map(product => {
                const isEditing = editingId === (product.id || product._id);
                
                // Status Logic
                let StatusIcon = CheckCircle;
                let statusColor = 'text-emerald-500';
                let statusBg = 'bg-emerald-500/10';
                let statusText = 'Healthy';

                if (product.quantity === 0) {
                  StatusIcon = XCircle; statusColor = 'text-rose-500'; statusBg = 'bg-rose-500/10'; statusText = 'Depleted';
                } else if (product.quantity <= 10) {
                  StatusIcon = AlertTriangle; statusColor = 'text-amber-500'; statusBg = 'bg-amber-500/10'; statusText = 'Critical';
                }

                return (
                  <tr key={product._id || product.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getImageUrl(product.images?.[0])} 
                          className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800"
                          onError={(e) => { e.target.src = '/logo.webp'; }}
                        />
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{product.name}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{product.category_name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${statusBg} ${statusColor}`}>
                        <StatusIcon size={10} /> {statusText}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-300 text-xs font-bold font-mono">₹{product.price}</span>
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" min="0" autoFocus
                            value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            className="w-20 bg-slate-950 border border-emerald-500 rounded-lg p-1.5 text-xs text-white text-center outline-none font-mono"
                          />
                          <button 
                            disabled={isUpdating}
                            onClick={() => handleQuickUpdate(product.id || product._id)}
                            className="p-1.5 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                          >
                            <Save size={14} />
                          </button>
                          <button 
                            disabled={isUpdating}
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-900 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => { setEditingId(product.id || product._id); setEditValue(product.quantity.toString()); }}
                          className="flex items-center justify-between w-24 bg-slate-950 border border-slate-800 rounded-lg p-1.5 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 group transition-all"
                        >
                          <span className={`text-xs font-black font-mono pl-2 ${product.quantity > 0 ? 'text-white' : 'text-rose-500'}`}>
                            {product.quantity}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 pr-1 text-emerald-500">
                            <TrendingUp size={12} />
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="p-1.5 bg-slate-900 rounded text-slate-400 disabled:opacity-50 hover:bg-slate-800"><ChevronLeft size={14} /></button>
              <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)} className="p-1.5 bg-slate-900 rounded text-slate-400 disabled:opacity-50 hover:bg-slate-800"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
