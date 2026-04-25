import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, Heart, Share2, Shield, Plus, Minus, 
  Zap, Tag, Box, Truck, RefreshCw, Lock, CreditCard, Award, Info, MapPin, 
  Youtube, Play, RotateCcw, Eye, Settings, Terminal, Cpu, Clock, AlertTriangle, Search, Mic, Camera 
} from 'lucide-react';
import { products as productsApi, fitment as fitmentApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// --- NEW COMPONENT: Image Gallery ---
const ImageGallery = ({ images, mainImage }) => {
  const [selected, setSelected] = useState(0);
  const gallery = images && images.length > 0 ? images : [{ url: mainImage || '/logo.webp' }];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 group">
        <img 
          src={gallery[selected]?.url} 
          className="w-full h-full object-contain hover:scale-110 transition-transform duration-500" 
          alt="Product" 
        />
        <div className="absolute top-6 right-6 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-3 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-white hover:bg-emerald-500 hover:text-black transition-all">
            <Eye size={18} />
          </button>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {gallery.map((img, i) => (
          <button 
            key={i}
            onClick={() => setSelected(i)}
            className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${selected === i ? 'border-emerald-500 scale-95' : 'border-slate-800 grayscale hover:grayscale-0'}`}
          >
            <img src={img.url} className="w-full h-full object-cover" alt="thumbnail" />
          </button>
        ))}
      </div>
    </div>
  );
};

// --- NEW COMPONENT: Vehicle Fitment Selector ---
const VehicleFitmentChecker = ({ productId }) => {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [selection, setSelection] = useState({ make: '', model: '', year: '' });
  const [result, setResult] = useState(null); // { fits: boolean, notes: string }
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const res = await fitmentApi.getMakes();
        setMakes(res.data?.data || []);
      } catch (err) { console.error(err); }
    };
    fetchMakes();
  }, []);

  const handleMakeChange = async (make) => {
    setSelection({ ...selection, make, model: '' });
    setResult(null);
    try {
      const res = await fitmentApi.getModels(make);
      setModels(res.data?.data || []);
    } catch (err) { console.error(err); }
  };

  const checkFit = async () => {
    if (!selection.make || !selection.model) return;
    setChecking(true);
    try {
      const res = await fitmentApi.check(productId, selection.make, selection.model, selection.year);
      setResult(res.data);
    } catch (err) { console.error(err); }
    setChecking(false);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
          <Shield size={24} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Guaranteed Fit System</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Verify compatibility before checkout</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select 
          value={selection.make} 
          onChange={(e) => handleMakeChange(e.target.value)}
          className="bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select Make</option>
          {makes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select 
          value={selection.model}
          disabled={!selection.make}
          onChange={(e) => setSelection({...selection, model: e.target.value})}
          className="bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        >
          <option value="">Select Model</option>
          {models.map(m => <option key={m.model} value={m.model}>{m.model}</option>)}
        </select>

        <button 
          onClick={checkFit}
          disabled={checking || !selection.model}
          className="bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-xl py-3 hover:bg-emerald-400 transition-all disabled:opacity-50"
        >
          {checking ? 'Analyzing...' : 'Verify Fitment'}
        </button>
      </div>

      {result && (
        <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-4 ${result.fits ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          <div className="mt-1">
            {result.fits ? <Check size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <p className="text-xs font-black uppercase">{result.fits ? 'Verified Match' : 'Fitment Alert'}</p>
            <p className="text-[10px] font-bold mt-1 text-slate-300">
              {result.fits ? 'This item is confirmed to fit your selected vehicle.' : 'We could not verify compatibility for this vehicle model.'}
              {result.data?.[0]?.notes && <span className="block mt-2 italic text-slate-500">Note: {result.data[0].notes}</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast() || {};

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || id === 'null') { setNotFound(true); setLoading(false); return; }
      setLoading(true);
      try {
        const isNumericId = /^\d+$/.test(id); // Check if purely numeric (product IDs)        const res = isObjectId ? await productsApi.getById(id) : await productsApi.getBySlug(id);
                const res = isNumericId ? await productsApi.getById(id) : await productsApi.getBySlug(id);
        setProduct(res.data?.data || res.data);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (notFound) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex p-6 bg-rose-500/10 rounded-full text-rose-500 mb-8">
          <Box size={64} />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Node Not Found</h1>
        <p className="text-slate-500 font-bold mb-8">The requested hardware node does not exist in the active registry.</p>
        <button onClick={() => navigate('/shop')} className="px-12 py-5 bg-white text-black font-black uppercase rounded-full hover:bg-emerald-400 transition-all">
          Return to Catalog
        </button>
      </div>
    </div>
  );

  if (loading || !product) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 animate-pulse">Syncing Node Data...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-12">
          <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-emerald-500 transition-colors">Catalog</Link>
          <ChevronRight size={12} />
          <span className="text-emerald-500">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT: VISUALS */}
          <div className="lg:col-span-7">
            <ImageGallery images={product.images} mainImage={product.image_url} />
            
            {/* Expanded Details Section */}
            <div className="mt-16 bg-slate-900/30 border border-slate-800/50 rounded-[3rem] p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Settings size={200} />
              </div>

              <div className="flex gap-12 border-b border-slate-800 mb-12">
                {['specs', 'details', 'shipping'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`pb-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === t ? 'text-emerald-500' : 'text-slate-600 hover:text-white'}`}
                  >
                    {t}
                    {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></div>}
                  </button>
                ))}
              </div>

              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {[
                      { label: 'Brand', value: product.brand },
                      { label: 'SKU', value: product.sku },
                      { label: 'Bulb Type', value: product.bulb_type || 'LED / HID' },
                      { label: 'Wattage', value: product.wattage || '55W' },
                      { label: 'Color Temp', value: product.color_temp || '6000K' },
                      { label: 'Warranty', value: product.warranty_period || '12 Months' }
                    ].map(s => (
                      <div key={s.label} className="flex justify-between items-center py-4 border-b border-slate-800/50">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{s.label}</span>
                        <span className="text-xs font-bold text-white">{s.value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'details' && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-sm font-bold leading-relaxed text-slate-400">{product.description}</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-slate-800/30 rounded-3xl">
                        <Zap size={20} className="text-emerald-500 mb-4" />
                        <h4 className="text-[10px] font-black uppercase mb-2">High Intensity</h4>
                        <p className="text-[9px] font-bold text-slate-500">Optimized for maximum light output.</p>
                      </div>
                      <div className="p-6 bg-slate-800/30 rounded-3xl">
                        <RefreshCw size={20} className="text-blue-500 mb-4" />
                        <h4 className="text-[10px] font-black uppercase mb-2">Canbus Ready</h4>
                        <p className="text-[9px] font-bold text-slate-500">Error-free installation in 99% of cars.</p>
                      </div>
                      <div className="p-6 bg-slate-800/30 rounded-3xl">
                        <Shield size={20} className="text-purple-500 mb-4" />
                        <h4 className="text-[10px] font-black uppercase mb-2">IP68 Rated</h4>
                        <p className="text-[9px] font-bold text-slate-500">Fully dust and waterproof design.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: DATA & ACTIONS */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">In Stock</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-black">{product.rating || '4.8'}</span>
                </div>
              </div>

              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                {product.name}
              </h1>

              <div className="flex items-end gap-6 mb-12">
                <div className="text-4xl font-black text-white">₹{product.discount_price || product.price}</div>
                {product.discount_price && (
                  <div className="text-xl font-bold text-slate-600 line-through mb-1">₹{product.price}</div>
                )}
                <div className="mb-2 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-black uppercase">
                  -{Math.round(((product.price - product.discount_price)/product.price)*100)}% OFF
                </div>
              </div>

              {/* Quantity & Add */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-slate-900 rounded-full p-2 border border-slate-800">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-black text-xl">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-800 rounded-full transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => addToCart(product, quantity)}
                    className="flex-1 bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 group"
                  >
                    Add to Cart
                    <ShoppingCart size={24} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-colors">
                    <Heart size={16} /> Wishlist
                  </button>
                  <button className="flex items-center justify-center gap-3 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-colors">
                              <RefreshCw size={16} /> Compare
                            </button>
                </div>
              {/* Vehicle Fitment Integrated Here */}
              <VehicleFitmentChecker productId={product.id} />

              <div className="mt-12 grid grid-cols-1 gap-4">
                <div className="flex items-center gap-6 p-6 bg-slate-900/30 border border-slate-800/50 rounded-3xl">
                  <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500"><Truck size={24} /></div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest">Free Priority Shipping</h5>
                    <p className="text-[9px] font-bold text-slate-500 mt-1">Estimated arrival: 2-3 Business Days</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-slate-900/30 border border-slate-800/50 rounded-3xl">
                  <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500"><Award size={24} /></div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest">Official Warranty</h5>
                    <p className="text-[9px] font-bold text-slate-500 mt-1">1 Year comprehensive replacement coverage</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
  );
}
