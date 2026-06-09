import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Box, Search, RefreshCw, AlertTriangle, 
  CheckCircle, XCircle, ChevronLeft, ChevronRight,
  TrendingDown, TrendingUp, Package, Save, Download, Filter, Plus, Minus
} from 'lucide-react';
import api, { products as productsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);


  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);


  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState('');


  const toastContext = useToast() || {};
  const showToast = toastContext.showToast || (() => {});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {

      const res = await productsApi.getAllAdmin();
      let rawData = res.data?.products || res.data?.data || res.data || [];


      const mappedData = rawData.map(p => ({
        ...p,
        stock: p.quantity !== undefined ? p.quantity : (p.stock || 0)
      })).sort((a, b) => (a.stock || 0) - (b.stock || 0));

      setProducts(mappedData);
      setSelectedIds(new Set()); 
    } catch (err) {
      console.error(err);
      showToast('Failed to sync telemetry.', 'error');
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


  const handleQuickUpdate = async (productId, operation = 'set', overrideValue = null) => {
    const valueStr = overrideValue !== null ? overrideValue : editValue;
    const stockDelta = parseInt(valueStr, 10);
    
    if (isNaN(stockDelta) || (operation === 'set' && stockDelta < 0)) {
      showToast('Invalid stock quantity', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await api.put(`/inventory/${productId}/stock`, { 
        stock: stockDelta, 
        operation 
      });
      
      showToast('Stock matrix updated', 'success');
      
      const updatedStock = res.data?.product?.stock !== undefined ? res.data.product.stock : stockDelta;
      setProducts(products.map(p => 
        (p.id === productId || p._id === productId) ? { ...p, stock: updatedStock, quantity: updatedStock } : p
      ));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      showToast('Update protocol failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };


  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map(p => p.id || p._id)));
    }
  };

  const handleBulkUpdate = async () => {
    const stock = parseInt(bulkStockValue, 10);
    if (isNaN(stock) || stock < 0) return showToast('Invalid bulk value', 'error');

    setIsUpdating(true);
    try {
      const updates = Array.from(selectedIds).map(id => ({ product_id: id, stock }));
      await api.put('/inventory/bulk-update', { updates });
      showToast(`Bulk updated ${selectedIds.size} nodes`, 'success');
      setIsBulkModalOpen(false);
      setBulkStockValue('');
      fetchInventory(); 
    } catch (err) {
      console.error(err);
      showToast('Bulk update failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };


  const exportToExcel = () => {
    const worksheetData = products.map(p => ({
      'SKU': p.sku || 'N/A',
      'Hardware Node': p.name,
      'Taxonomy': p.category_name || 'N/A',
      'Current Stock': p.stock || 0,
      'Unit Price (₹)': p.price || 0,
      'Total Node Valuation (₹)': (p.stock || 0) * (p.price || 0),
      'Status': p.status || p.is_active
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Audit");
    XLSX.writeFile(workbook, `Anritvox_Inventory_Telemetry_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('XLSX Audit Exported', 'success');
  };


  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      const stock = p.stock || 0;
      if (stockFilter === 'out') return stock === 0;
      if (stockFilter === 'low') return stock > 0 && stock <= 10;
      if (stockFilter === 'in-stock') return stock > 10;
      return true;
    });
  }, [products, searchTerm, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalValuation = products.reduce((acc, p) => acc + (parseFloat(p.price || 0) * parseInt(p.stock || 0)), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalUnits = products.reduce((acc, p) => acc + parseInt(p.stock || 0), 0);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Syncing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-300 relative">
      
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            Inventory <span className="text-emerald-500">Matrix</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-widest mt-1">
            Real-time Valuation & Supercharged Telemetry
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

      {}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500"><span className="font-bold text-lg">₹</span></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Valuation</p>
            <h4 className="text-lg font-black text-white tracking-tight">₹{totalValuation.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-colors">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><Package size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Units Banked</p>
            <h4 className="text-lg font-black text-white tracking-tight">{totalUnits.toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 hover:border-amber-500/30 transition-colors">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500"><AlertTriangle size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Critical Alert (&le;10)</p>
            <h4 className="text-lg font-black text-white tracking-tight">{lowStockCount} Nodes</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-4 hover:border-rose-500/30 transition-colors">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500"><TrendingDown size={18} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Depleted (0)</p>
            <h4 className="text-lg font-black text-white tracking-tight">{outOfStockCount} Nodes</h4>
          </div>
        </div>
      </div>

      {}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" placeholder="Search SKU or Node..." 
              value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all"
            />
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            <select 
              value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl py-2 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="in-stock">Healthy (&gt;10)</option>
              <option value="low">Critical (1-10)</option>
              <option value="out">Depleted (0)</option>
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
            <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg">
              {selectedIds.size} Selected
            </span>
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Box size={14} /> Batch Override
            </button>
          </div>
        )}
      </div>

      {}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800">
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleAll} className="text-slate-500 hover:text-emerald-400 transition-colors">
                    {paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length 
                      ? <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center"><CheckCircle size={12} className="text-black"/></div> 
                      : <div className="w-4 h-4 border-2 border-slate-600 rounded"></div>}
                  </button>
                </th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Hardware Node & SKU</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Health Indicator</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">Unit Value</th>
                <th className="p-4 text-[9px] font-black uppercase text-slate-500 tracking-widest w-64 text-center">Live Logic Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold text-xs">No hardware matches current parameters.</td>
                </tr>
              ) : paginatedProducts.map(product => {
                const pId = product.id || product._id;
                const isSelected = selectedIds.has(pId);
                const isEditing = editingId === pId;
                const stock = product.stock || 0;
                
                let StatusIcon = CheckCircle;
                let statusColor = 'text-emerald-500';
                let statusBg = 'bg-emerald-500/10';
                let statusText = 'Healthy';

                if (stock === 0) {
                  StatusIcon = XCircle; statusColor = 'text-rose-500'; statusBg = 'bg-rose-500/10'; statusText = 'Depleted';
                } else if (stock <= 10) {
                  StatusIcon = AlertTriangle; statusColor = 'text-amber-500'; statusBg = 'bg-amber-500/10'; statusText = 'Critical';
                }

                return (
                  <tr key={pId} className={`${isSelected ? 'bg-emerald-500/5' : 'hover:bg-slate-800/30'} transition-colors`}>
                    <td className="p-3 text-center">
                      <button onClick={() => toggleSelection(pId)} className="text-slate-500 hover:text-emerald-400 transition-colors mt-1">
                        {isSelected 
                          ? <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center"><CheckCircle size={12} className="text-black"/></div> 
                          : <div className="w-4 h-4 border-2 border-slate-600 rounded"></div>}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getImageUrl(product.images?.[0])} 
                          className="w-10 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800"
                          onError={(e) => { e.target.src = '/logo.webp'; }}
                        />
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {product.sku || 'NO-SKU'}
                            </span>
                            <span className="text-[9px] text-slate-500">{product.category_name || 'Uncategorized'}</span>
                          </div>
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
                        <div className="flex items-center justify-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-emerald-500/50">
                          <button 
                            disabled={isUpdating}
                            onClick={() => handleQuickUpdate(pId, 'subtract', '1')}
                            className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-black transition-colors"
                          ><Minus size={14} /></button>
                          
                          <input 
                            type="number" min="0" autoFocus
                            value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            className="w-16 bg-transparent text-xs text-white text-center outline-none font-mono font-bold"
                          />
                          
                          <button 
                            disabled={isUpdating}
                            onClick={() => handleQuickUpdate(pId, 'add', '1')}
                            className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-black transition-colors"
                          ><Plus size={14} /></button>
                          
                          <div className="w-[1px] h-4 bg-slate-800 mx-1"></div>
                          
                          <button 
                            disabled={isUpdating}
                            onClick={() => handleQuickUpdate(pId, 'set')}
                            className="p-1.5 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                          ><Save size={14} /></button>
                          
                          <button 
                            disabled={isUpdating}
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-900 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                          ><XCircle size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div 
                            onClick={() => { setEditingId(pId); setEditValue(stock.toString()); }}
                            className="flex items-center justify-between w-28 bg-slate-950 border border-slate-800 rounded-xl p-2 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900 group transition-all"
                          >
                            <span className={`text-sm font-black font-mono pl-2 ${stock > 0 ? 'text-white' : 'text-rose-500'}`}>
                              {stock}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 pr-1 text-emerald-500 bg-emerald-500/10 p-1 rounded-md">
                              <TrendingUp size={12} />
                            </div>
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
        
        {totalPages > 1 && (
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="p-1.5 bg-slate-900 rounded-lg text-slate-400 disabled:opacity-50 hover:bg-slate-800 transition-colors"><ChevronLeft size={14} /></button>
              <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)} className="p-1.5 bg-slate-900 rounded-lg text-slate-400 disabled:opacity-50 hover:bg-slate-800 transition-colors"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#020617] border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              <Box className="text-emerald-500" size={20} /> Batch Override
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Force update <strong className="text-emerald-400">{selectedIds.size} selected nodes</strong> to a new absolute stock value.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">New Absolute Quantity</label>
                <input 
                  type="number" min="0" autoFocus
                  value={bulkStockValue} onChange={(e) => setBulkStockValue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-white font-mono font-bold outline-none"
                  placeholder="e.g., 100"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setIsBulkModalOpen(false)}
                  className="flex-1 py-3 bg-slate-900 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkUpdate}
                  disabled={isUpdating || !bulkStockValue}
                  className="flex-1 py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {isUpdating ? 'Executing...' : 'Force Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
