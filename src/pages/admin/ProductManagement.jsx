import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Plus, Edit3, Trash2, ExternalLink, Activity, 
  Filter, Archive, Upload, FileText, X, Check, AlertTriangle 
} from 'lucide-react';
import { products as prodApi, categories as catApi, fitment as fitmentApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast() || {};

  // Fitment Modal State
  const [fitmentModal, setFitmentModal] = useState({ show: false, product: null });
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        prodApi.getAllAdmin(),
        catApi.getAll()
      ]);
      setProductsList(pRes.data?.data || pRes.data || []);
      setCategories(cRes.data?.data || cRes.data || []);
    } catch (error) {
      showToast?.('Registry synchronization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExcelUpload = async () => {
    if (!excelFile || !fitmentModal.product) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('productId', fitmentModal.product.id);
      
      const res = await fitmentApi.uploadExcel(fitmentModal.product.id, formData);
      showToast?.(res.data.message || 'Fitment data imported successfully', 'success');
      setFitmentModal({ show: false, product: null });
      setExcelFile(null);
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Excel upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const filtered = productsList.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Product Registry</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">Manage active hardware inventory and fitment nodes</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Plus size={18} /> Deploy New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
        <div className="lg:col-span-8 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search Registry by Name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-sm font-bold text-white outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="lg:col-span-4 flex gap-4">
          <select className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 text-[10px] font-black uppercase text-slate-400 outline-none">
            <option>All Sectors</option>
            {categories.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
          <button className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-900 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-900 bg-slate-900/20">
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Hardware Node</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Pricing</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Inventory</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Fitment</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/50">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center text-[10px] font-black uppercase text-slate-600 animate-pulse">Accessing Encrypted Data...</td></tr>
            ) : filtered.map((prod) => (
              <tr key={prod.id} className="group hover:bg-slate-900/20 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex-shrink-0">
                      <img src={prod.image_url || '/logo.webp'} className="w-full h-full object-contain p-2" alt="" />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase text-white group-hover:text-emerald-500 transition-colors">{prod.name}</div>
                      <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{prod.sku} | {prod.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="text-sm font-black text-white">₹{prod.discount_price || prod.price}</div>
                  {prod.discount_price && <div className="text-[10px] font-bold text-slate-600 line-through mt-0.5">₹{prod.price}</div>}
                </td>
                <td className="px-8 py-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase ${prod.quantity > 10 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <Archive size={10} /> {prod.quantity} Units
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => setFitmentModal({ show: true, product: prod })}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white hover:border-emerald-500 transition-all"
                  >
                    <Upload size={12} /> Fitment Map
                  </button>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-3 bg-slate-900 text-slate-500 hover:text-blue-500 rounded-xl transition-all"><Edit3 size={16} /></button>
                    <button className="p-3 bg-slate-900 text-slate-500 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FITMENT EXCEL UPLOAD MODAL */}
      {fitmentModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-[3rem] p-12 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><FileText size={200} /></div>
            
            <button 
              onClick={() => setFitmentModal({ show: false, product: null })}
              className="absolute top-8 right-8 p-3 bg-slate-900 text-slate-500 hover:text-white rounded-full transition-all"
            ><X size={20} /></button>

            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">Vehicle Fitment Node</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-12">Product: <span className="text-emerald-500">{fitmentModal.product?.name}</span></p>

            <div className="space-y-8 relative z-10">
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-[2rem] p-12 text-center group hover:border-emerald-500/50 transition-all relative">
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={(e) => setExcelFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-5 bg-slate-800 rounded-3xl text-slate-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase text-white">{excelFile ? excelFile.name : 'Select Excel Sheet'}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Columns: Make, Model, YearStart, YearEnd, BulbType, Notes</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <Activity size={20} className="text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                  Uploading a new map will <span className="text-blue-500">overwrite</span> existing fitment data for this product node in the production registry.
                </p>
              </div>

              <button 
                onClick={handleExcelUpload}
                disabled={!excelFile || uploading}
                className="w-full py-6 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-3xl hover:bg-emerald-400 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
              >
                {uploading ? 'Injecting Map...' : 'Commit Fitment Data'}
                <Check size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
