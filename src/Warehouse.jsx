import React, { useState, useEffect } from 'react';
import { Package, LogOut, Server } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Warehouse() {
  const [storeName, setStoreName] = useState('Connecting...');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  const [formData, setFormData] = useState({ product_name: '', quantity: 1, sale_price: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { showToast } = useToast() || {};
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const { data: accessData } = await api.get('/warehouse/check-access');
        if (!accessData.hasAccess && !accessData.isAdmin) {
          setAccessDenied(true);
          return;
        }
        setStoreName(accessData.storeName || 'Master Admin Access');

        const { data: prodData } = await api.get('/products');
        const pList = prodData.data || prodData.products || prodData || [];
        setProducts(pList);
      } catch (e) {
        showToast?.('Connection failed.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name) return showToast?.('Select a product', 'error');
    setIsSubmitting(true);
    try {
      await api.post('/warehouse/log-sale', formData);
      showToast?.('Transaction secured to ledger.', 'success');
      setFormData({ ...formData, quantity: 1, sale_price: '' });
    } catch (e) {
      showToast?.('Failed to log sale.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#020617] text-emerald-500 flex justify-center items-center font-black animate-pulse uppercase tracking-widest text-sm">Verifying Clearance...</div>;

  if (accessDenied) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
       <div className="text-rose-500 text-center font-black text-2xl uppercase tracking-widest">
          Access Denied<br/><span className="text-sm text-slate-500">You lack distributor clearance.</span>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Package className="text-emerald-500" /> Local <span className="text-emerald-500">Warehouse</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{storeName}</p>
          </div>
          <button onClick={handleLogout} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-md">
            <LogOut size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Select Product SKU</label>
            <select 
              required 
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              className="w-full bg-[#0f172a] border border-slate-800 text-white p-3 rounded-xl outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Select Valid Product --</option>
              {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Quantity</label>
              <input 
                type="number" min="1" required 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                className="w-full bg-[#0f172a] border border-slate-800 text-white p-3 rounded-xl outline-none focus:border-emerald-500 transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Sale Price (₹)</label>
              <input 
                type="number" min="0" step="0.01" required placeholder="e.g. 1500"
                value={formData.sale_price}
                onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                className="w-full bg-[#0f172a] border border-slate-800 text-white p-3 rounded-xl outline-none focus:border-emerald-500 transition-all" 
              />
            </div>
          </div>
          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-4 flex items-center justify-center gap-2">
            <Server size={16} /> {isSubmitting ? 'Syncing...' : 'Log Transaction to Ledger'}
          </button>
        </form>
      </div>
    </div>
  );
}
