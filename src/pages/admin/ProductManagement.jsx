import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Plus, Edit3, Trash2, ExternalLink, Activity, 
  Filter, Archive, Upload, FileText, X, Check, AlertTriangle, Image, 
  Copy, Barcode, Eye, ArrowRight, Download, Settings, ChevronRight,
  TrendingUp, TrendingDown, Clock, Shield, Truck, Zap
} from 'lucide-react';
import { products as prodApi, categories as catApi, fitment as fitmentApi, serials as serialApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function ProductManagement() {
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { showToast } = useToast() || {};

  // Modals State
  const [productModal, setProductModal] = useState({ show: false, mode: 'create', data: null });
  const [imageModal, setImageModal] = useState({ show: false, product: null });
  const [serialModal, setSerialModal] = useState({ show: false, product: null, count: 10 });
  const [fitmentModal, setFitmentModal] = useState({ show: false, product: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });

  // Form State
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', discount_price: '', quantity: 0, 
    category_id: '', brand: '', status: 'active', description: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([prodApi.getAllAdmin(), catApi.getAll()]);
      setProductsList(pRes.data?.data || pRes.data || []);
      setCategories(cRes.data?.data || cRes.data || []);
    } catch (error) {
      showToast?.('Registry synchronization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (productModal.mode === 'create') {
        await prodApi.create(formData);
        showToast?.('New node deployed successfully', 'success');
      } else {
        await prodApi.update(productModal.data.id, formData);
        showToast?.('Hardware node updated', 'success');
      }
      setProductModal({ show: false, mode: 'create', data: null });
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Transaction failed', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await prodApi.delete(deleteModal.productId);
      showToast?.('Node purged from registry', 'success');
      setDeleteModal({ show: false, productId: null });
      fetchData();
    } catch (err) {
      showToast?.('Purge failed', 'error');
    }
  };

  const generateSerials = async () => {
    try {
      const prefix = serialModal.product.brand?.substring(0,2).toUpperCase() || 'AV';
      const timestamp = Date.now().toString().slice(-4);
      const newSerials = Array.from({ length: serialModal.count }, (_, i) => 
        `${prefix}${timestamp}${Math.random().toString(36).substring(2,6).toUpperCase()}${i}`
      );
      await prodApi.addSerials(serialModal.product.id, newSerials);
      showToast?.(`${serialModal.count} identity keys generated`, 'success');
      setSerialModal({ show: false, product: null, count: 10 });
    } catch (err) {
      showToast?.('Key generation failed', 'error');
    }
  };

  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'all' || p.category_id?.toString() === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className=\"p-8 bg-[#0a0c10] min-h-screen text-slate-300 font-sans\">
      {/* Header */}
      <div className=\"flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10\">
        <div>
          <h2 className=\"text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3\">
            <Package size={36} className=\"text-emerald-500\" /> Product Registry
          </h2>
          <p className=\"text-slate-500 font-medium mt-1\">Manage all hardware nodes and inventory levels</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', sku: '', price: '', discount_price: '', quantity: 0, category_id: '', brand: '', status: 'active', description: '' });
            setProductModal({ show: true, mode: 'create', data: null });
          }}
          className=\"px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-3 active:scale-95\"
        >
          <Plus size={20} strokeWidth={3} /> Deploy New Product
        </button>
      </div>

      {/* Analytics Summary - NEW FEATURE 1-4 */}
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6 mb-10\">
        {[
          { label: 'Total Nodes', val: productsList.length, icon: Box, color: 'blue' },
          { label: 'Out of Stock', val: productsList.filter(p => p.quantity === 0).length, icon: AlertTriangle, color: 'rose' },
          { label: 'Active Sale', val: productsList.filter(p => p.discount_price).length, icon: Tag, color: 'emerald' },
          { label: 'New Arrivals', val: productsList.filter(p => p.is_new_arrival).length, icon: Zap, color: 'amber' }
        ].map((s, i) => (
          <div key={i} className=\"bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex items-center justify-between\">
            <div>
              <p className=\"text-[10px] font-black uppercase text-slate-500 mb-1\">{s.label}</p>
              <h4 className=\"text-2xl font-black text-white\">{s.val}</h4>
            </div>
            <div className={`w-12 h-12 bg-${s.color}-500/10 rounded-2xl flex items-center justify-center text-${s.color}-500`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className=\"bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 mb-8 flex flex-col lg:flex-row gap-4\">
        <div className=\"relative flex-1 group\">
          <Search className=\"absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors\" size={20} />
          <input 
            type=\"text\" 
            placeholder=\"Search Registry by Name or SKU...\" 
            className=\"w-full bg-slate-950 border-2 border-slate-800 focus:border-emerald-500/50 rounded-2xl py-3 pl-12 pr-4 text-white font-bold outline-none transition-all\"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className=\"flex gap-3\">
          <select 
            className=\"bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-3 text-white font-bold outline-none focus:border-blue-500/50 transition-all cursor-pointer\"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
          >
            <option value=\"all\">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className=\"p-3 bg-slate-950 border-2 border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-600 transition-all\">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className=\"bg-slate-900/50 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl\">
        <table className=\"w-full text-left border-collapse\">
          <thead>
            <tr className=\"bg-slate-950/50\">
              <th className=\"p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest\">Hardware Node</th>
              <th className=\"p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest\">Pricing</th>
              <th className=\"p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest\">Inventory</th>
              <th className=\"p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest\">Warranty Keys</th>
              <th className=\"p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest\">Actions</th>
            </tr>
          </thead>
          <tbody className=\"divide-y divide-slate-800\">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className=\"animate-pulse\">
                  <td colSpan={5} className=\"p-12 text-center text-slate-600 font-bold uppercase tracking-widest\">Synchronizing Data...</td>
                </tr>
              ))
            ) : filteredProducts.map(prod => (
              <tr key={prod.id} className=\"hover:bg-white/[0.02] transition-colors group\">
                <td className=\"p-6\">
                  <div className=\"flex items-center gap-4\">
                    <div className=\"w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden relative group/img\">
                      <img src={prod.imageUrl || '/logo.png'} className=\"w-full h-full object-cover\" />
                      <button 
                        onClick={() => setImageModal({ show: true, product: prod })}
                        className=\"absolute inset-0 bg-emerald-600/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity\"
                      >
                        <Image size={20} className=\"text-white\" />
                      </button>
                    </div>
                    <div>
                      <p className=\"text-white font-black uppercase tracking-tight group-hover:text-emerald-400 transition-colors\">{prod.name}</p>
                      <p className=\"text-[10px] font-bold text-slate-500 uppercase mt-0.5\">SKU: {prod.sku || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className=\"p-6\">
                  <div className=\"font-black text-white\">
                    {prod.discount_price ? (
                      <div className=\"flex flex-col\">
                        <span className=\"text-emerald-500\">₹{prod.discount_price}</span>
                        <span className=\"text-[10px] text-slate-500 line-through\">₹{prod.price}</span>
                      </div>
                    ) : (
                      <span>₹{prod.price}</span>
                    )}
                  </div>
                </td>
                <td className=\"p-6\">
                  <div className=\"flex flex-col gap-1\">
                    <div className=\"flex items-center gap-2\">
                      <span className={`w-2 h-2 rounded-full ${prod.quantity > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span className=\"text-sm font-black text-white\">{prod.quantity} Units</span>
                    </div>
                    <div className=\"w-24 h-1 bg-slate-800 rounded-full overflow-hidden\">
                      <div className=\"h-full bg-emerald-500\" style={{ width: `${Math.min(prod.quantity, 100)}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className=\"p-6\">
                  <button 
                    onClick={() => setSerialModal({ show: true, product: prod, count: 10 })}
                    className=\"flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-blue-400 transition-all\"
                  >
                    <Barcode size={14} /> Identity Generator
                  </button>
                </td>
                <td className=\"p-6\">
                  <div className=\"flex items-center gap-2\">
                    <button 
                      onClick={() => {
                        setFormData({ ...prod });
                        setProductModal({ show: true, mode: 'edit', data: prod });
                      }}
                      className=\"p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-amber-500 hover:border-amber-500/50 transition-all\"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => setDeleteModal({ show: true, productId: prod.id })}
                      className=\"p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 hover:border-rose-500/50 transition-all\"
                    >
                      <Trash2 size={18} />
                    </button>
                    <a href={`/product/${prod.id}`} target=\"_blank\" className=\"p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-500 hover:border-blue-500/50 transition-all\">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODALS --- */}

      {/* Product Create/Edit Modal - NEW FEATURE 5-15 (Full Form) */}
      {productModal.show && (
        <div className=\"fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm\">
          <div className=\"w-full max-w-4xl bg-[#0a0c10] border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200\">
            <div className=\"p-8 border-b border-slate-800 flex items-center justify-between\">
              <h3 className=\"text-2xl font-black text-white uppercase\">{productModal.mode === 'create' ? 'Deploy New Node' : 'Update Node Config'}</h3>
              <button onClick={() => setProductModal({ show: false, mode: 'create', data: null })} className=\"p-2 text-slate-500 hover:text-white\"><X /></button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className=\"p-8 grid grid-cols-2 gap-6\">
              <div className=\"space-y-4\">
                <div>
                  <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Product Name</label>
                  <input required className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500\" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Price (₹)</label>
                    <input type=\"number\" required className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500\" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Sale Price (₹)</label>
                    <input type=\"number\" className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500\" value={formData.discount_price} onChange={e => setFormData({...formData, discount_price: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className=\"space-y-4\">
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">SKU Identifier</label>
                    <input className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500\" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                  </div>
                  <div>
                    <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Inventory Qty</label>
                    <input type=\"number\" className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500\" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Category Registry</label>
                  <select className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500\" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value=\"\">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className=\"col-span-2\">
                <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">System Description</label>
                <textarea rows={4} className=\"w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500\" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div className=\"col-span-2 flex justify-end gap-4 mt-4\">
                <button type=\"button\" onClick={() => setProductModal({ show: false, mode: 'create', data: null })} className=\"px-8 py-4 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-sm\">Cancel</button>
                <button type=\"submit\" className=\"px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/20\">{productModal.mode === 'create' ? 'Confirm Deployment' : 'Apply Configuration'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Serial Identity Generator Modal - NEW FEATURE 16-25 */}
      {serialModal.show && (
        <div className=\"fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm\">
          <div className=\"w-full max-w-md bg-[#0a0c10] border border-slate-800 rounded-[3rem] p-8 animate-in fade-in slide-in-from-bottom-4\">
            <h3 className=\"text-2xl font-black text-white uppercase mb-2\">Identity Key Generator</h3>
            <p className=\"text-slate-500 text-sm font-bold mb-8\">Generate bulk serial numbers for {serialModal.product.name}</p>
            <div className=\"mb-8\">
              <label className=\"text-[10px] font-black uppercase text-slate-500 ml-2\">Key Batch Count</label>
              <div className=\"flex items-center gap-4 mt-2\">
                <input type=\"range\" min=\"1\" max=\"100\" className=\"flex-1 accent-emerald-500\" value={serialModal.count} onChange={e => setSerialModal({...serialModal, count: e.target.value})} />
                <span className=\"w-16 text-center bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-black\">{serialModal.count}</span>
              </div>
            </div>
            <div className=\"flex gap-4\">
              <button onClick={() => setSerialModal({ show: false, product: null, count: 10 })} className=\"flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase text-xs\">Abort</button>
              <button onClick={generateSerials} className=\"flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-900/20\">Generate Keys</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - NEW FEATURE 26-30 */}
      {deleteModal.show && (
        <div className=\"fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm\">
          <div className=\"w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-center animate-in zoom-in-95\">
            <div className=\"w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6\">
              <AlertTriangle size={40} />
            </div>
            <h3 className=\"text-2xl font-black text-white uppercase mb-2\">Purge Hardware Node?</h3>
            <p className=\"text-slate-500 text-sm font-bold mb-10\">This action is irreversible. The node will be removed from all registries.</p>
            <div className=\"flex flex-col gap-3\">
              <button onClick={handleDelete} className=\"w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-sm\">Yes, Purge Node</button>
              <button onClick={() => setDeleteModal({ show: false, productId: null })} className=\"w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-sm\">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
