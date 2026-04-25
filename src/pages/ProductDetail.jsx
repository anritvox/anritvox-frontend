import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Star, ShoppingBag, Heart, Shield, Truck, Zap, ChevronRight, 
  Minus, Plus, CheckCircle2, AlertCircle, Car, Play
} from 'lucide-react';
import { 
  products as productsApi, 
  reviews as reviewsApi, 
  fitment as fitmentApi, 
  cart as cartApi
} from '../services/api';

// --- Safe Image URL Helper ---
const getImageUrl = (img) => {
  if (!img) return '/logo.webp';
  let path = typeof img === 'object' ? (img.url || img.file_path || img.path) : img;
  if (!path) return '/logo.webp';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE HOOKS ---
  const [product, setProduct] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [isAdding, setIsAdding] = useState(false);
  const [fitment, setFitment] = useState({ make: '', model: '', year: '' });
  const [fitmentStatus, setFitmentStatus] = useState(null);

  // --- ANIMATION HOOKS (MUST BE TOP LEVEL!) ---
  const { scrollY } = useScroll();
  const showStickyBar = useTransform(scrollY, [0, 800], [0, 1]);
  // FIXED: Extracted useTransform out of the conditional JSX
  const stickyYOffset = useTransform(showStickyBar, [0, 1], [50, 0]);

  // --- EFFECT HOOKS ---
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        let fetchedProduct = null;
        try {
          const prodRes = await productsApi.getById(id);
          fetchedProduct = prodRes.data?.data || prodRes.data;
        } catch (err) {
          const slugRes = await productsApi.getBySlug(id);
          fetchedProduct = slugRes.data?.data || slugRes.data;
        }
        
        setProduct(fetchedProduct);
        if (fetchedProduct?.images?.length > 0) {
          setActiveMedia(fetchedProduct.images[0]);
        }

        if (fetchedProduct && fetchedProduct.id) {
          try {
            const revRes = await reviewsApi.getByProduct(fetchedProduct.id);
            setReviewsData(revRes.data?.data || revRes.data || []);
          } catch (revErr) {
            console.error("Reviews API failed:", revErr);
            setReviewsData([]);
          }
        }
      } catch (err) {
        console.error("Failed to load product ecosystem:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await cartApi.add({ productId: product.id, quantity });
      alert("Added to Cart!");
    } catch (err) {
      console.error("Cart error:", err);
    } finally {
      setTimeout(() => setIsAdding(false), 800);
    }
  };

  const handleFitmentCheck = async (e) => {
    e.preventDefault();
    if (!product) return;
    setFitmentStatus('checking');
    try {
      const res = await fitmentApi.check(product.id, fitment.make, fitment.model, fitment.year);
      setFitmentStatus(res.data?.compatible ? 'fits' : 'nofit');
    } catch (err) {
      setFitmentStatus('nofit'); 
    }
  };

  const isOutOfStock = product?.quantity <= 0;
  const savings = product?.discount_price ? product.price - product.discount_price : 0;
  const savingsPercent = savings > 0 ? Math.round((savings / product.price) * 100) : 0;

  return (
    <>
      {loading && <SkeletonPDP />}

      {!loading && !product && (
        <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-950 font-black uppercase tracking-widest text-2xl">
          Product Node Offline.
        </div>
      )}

      {!loading && product && (
        <div className="bg-slate-950 text-white min-h-screen selection:bg-emerald-500 selection:text-black pt-24 pb-32 font-sans relative">
          
          <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to={`/shop?category=${product.category_id}`} className="hover:text-emerald-500 transition-colors">{product.category_name || 'Hardware'}</Link>
            <ChevronRight size={14} />
            <span className="text-white truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* MEDIA GALLERY */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6 relative">
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 shrink-0 no-scrollbar py-1">
                {product.images?.map((media, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveMedia(media)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 shrink-0 ${
                      activeMedia?.url === media.url ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center"><Play size={24} className="text-emerald-500" /></div>
                    ) : (
                      <img src={getImageUrl(media)} alt="Thumbnail" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>

              <div className="relative w-full aspect-square md:aspect-auto md:h-[700px] bg-slate-900/50 rounded-[3rem] border border-slate-800/50 overflow-hidden flex items-center justify-center lg:sticky lg:top-32 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMedia?.url}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full p-8"
                  >
                    {activeMedia?.type === 'video' ? (
                      <video src={getImageUrl(activeMedia)} autoPlay loop muted controls className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                      <img src={getImageUrl(activeMedia)} alt={product.name} className="w-full h-full object-contain group-hover:scale-150 transition-transform duration-[1.5s] ease-out origin-center cursor-crosshair" />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                  {product.is_new_arrival === 1 && <span className="bg-emerald-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]">New Node</span>}
                  {product.is_trending === 1 && <span className="bg-cyan-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Trending</span>}
                </div>
                
                <button className="absolute top-6 right-6 w-14 h-14 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all duration-300 z-10 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]">
                  <Heart size={22} />
                </button>
              </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="lg:col-span-5 flex flex-col relative">
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[1.1] mb-4 text-white">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                    <div className="flex text-emerald-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} className={i < Math.floor(product.rating || 5) ? "" : "text-slate-700"} />
                      ))}
                    </div>
                    <span className="text-sm font-black text-white">{product.rating || '5.0'}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l border-slate-700 pl-2 ml-1">
                      {product.review_count || 0} Reviews
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    SKU: <span className="text-emerald-500">{product.sku || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-8">
                  <div className="flex items-end gap-4">
                    <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                      ₹{product.discount_price || product.price}
                    </span>
                    {product.discount_price && (
                      <span className="text-2xl font-bold text-slate-600 line-through mb-1">₹{product.price}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="text-emerald-500 text-sm font-black uppercase tracking-widest">
                      You Save ₹{savings} ({savingsPercent}% Off)
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-lg leading-relaxed mb-8 font-medium">
                  {product.description?.substring(0, 150)}...
                </p>
              </div>

              {/* FITMENT WIDGET */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Car size={150} /></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                  <Zap size={16} /> Fitment Verification Engine
                </h3>
                <form onSubmit={handleFitmentCheck} className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                  <input type="text" placeholder="Make" required onChange={(e) => setFitment({...fitment, make: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none w-full" />
                  <input type="text" placeholder="Model" required onChange={(e) => setFitment({...fitment, model: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none w-full" />
                  <button type="submit" className="bg-slate-800 hover:bg-emerald-500 text-white hover:text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all">Check</button>
                </form>
                
                <AnimatePresence>
                  {fitmentStatus && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl flex items-center gap-3 border ${
                      fitmentStatus === 'fits' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      fitmentStatus === 'nofit' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-500 animate-pulse'
                    }`}>
                      {fitmentStatus === 'fits' && <><CheckCircle2 size={20} /> <span className="text-sm font-black uppercase tracking-widest">Confirmed Fitment for your vehicle.</span></>}
                      {fitmentStatus === 'nofit' && <><AlertCircle size={20} /> <span className="text-sm font-black uppercase tracking-widest">May require modification.</span></>}
                      {fitmentStatus === 'checking' && <span className="text-sm font-black uppercase tracking-widest">Running diagnostic...</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ACTION AREA */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${isOutOfStock ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                    {isOutOfStock ? 'Out of Stock' : 'In Stock & Ready'}
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-2xl w-32 p-1">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors">
                      <Minus size={18} />
                    </button>
                    <span className="font-black text-xl w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock || isAdding}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className={`flex items-center gap-2 transition-transform duration-300 ${isAdding ? '-translate-y-12' : ''}`}>
                      <ShoppingBag size={20} /> Add To Cart
                    </span>
                    <span className={`absolute inset-0 flex items-center justify-center gap-2 bg-emerald-400 transition-transform duration-300 ${isAdding ? 'translate-y-0' : 'translate-y-12'}`}>
                      <CheckCircle2 size={20} /> Node Secured
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Shield />, title: "Premium E-Warranty", sub: product.warranty_period || "2 Years Coverage" },
                  { icon: <Truck />, title: "Express Dispatch", sub: "Ships within 24hrs" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                    <div className="text-emerald-500">{item.icon}</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{item.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* TABBED INTERFACE */}
          <div className="max-w-7xl mx-auto px-6 mt-32">
            <div className="flex border-b border-slate-800 mb-12 relative overflow-x-auto no-scrollbar">
              {['details', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-6 px-8 text-sm font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap relative ${
                    activeTab === tab ? 'text-emerald-500' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-slate-400 leading-loose text-lg max-w-4xl font-medium whitespace-pre-wrap">
                    {product.description}
                  </motion.div>
                )}
                
                {activeTab === 'specifications' && (
                  <motion.div key="specs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    {[
                      { label: 'Brand', value: product.brand },
                      { label: 'SKU', value: product.sku },
                      { label: 'Warranty', value: product.warranty_period },
                      { label: 'Tags', value: product.tags },
                      { label: '3D Model Support', value: product.model_3d_url ? 'Enabled' : 'N/A' },
                    ].map((spec, i) => (
                      <div key={i} className="flex justify-between py-4 border-b border-slate-800">
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">{spec.label}</span>
                        <span className="text-white font-black">{spec.value || 'N/A'}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div key="reviews" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl">
                    {reviewsData.length > 0 ? (
                      reviewsData.map((review, i) => (
                        <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-[2rem] mb-6">
                          <div className="flex items-center gap-2 text-emerald-500 mb-4">
                            {[...Array(5)].map((_, idx) => <Star key={idx} size={16} fill={idx < review.rating ? "currentColor" : "none"} />)}
                          </div>
                          <h4 className="text-xl font-black text-white mb-2">{review.title}</h4>
                          <p className="text-slate-400 font-medium mb-4">{review.comment}</p>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{review.user_name} • Verified Buyer</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-900/50 rounded-[2rem] border border-slate-800 border-dashed">
                        <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest">No Field Reports Yet</h3>
                        <p className="text-slate-600 mt-2">Be the first to test this hardware.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* STICKY BAR - FIXED HOOK USAGE */}
          <motion.div 
            style={{ opacity: showStickyBar, y: stickyYOffset }}
            className="fixed bottom-0 left-0 w-full z-50 p-4 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-4 rounded-3xl shadow-2xl flex items-center justify-between pointer-events-auto">
              <div className="hidden md:flex items-center gap-4">
                <img src={getImageUrl(activeMedia)} className="w-12 h-12 rounded-xl object-cover" alt="sticky" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tighter text-white line-clamp-1">{product.name}</h4>
                  <p className="text-emerald-500 font-black tracking-widest">₹{product.discount_price || product.price}</p>
                </div>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full md:w-auto px-12 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-white transition-colors disabled:opacity-50"
              >
                Add To Cart
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

const SkeletonPDP = () => (
  <div className="bg-slate-950 min-h-screen pt-24 pb-32 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
      <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
        <div className="flex md:flex-col gap-4 w-full md:w-24">
          {[1,2,3,4].map(i => <div key={i} className="w-20 h-20 md:w-24 md:h-24 bg-slate-900 rounded-2xl shrink-0"></div>)}
        </div>
        <div className="w-full h-[500px] md:h-[700px] bg-slate-900 rounded-[3rem]"></div>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-8 pt-8">
        <div className="h-16 bg-slate-900 rounded-2xl w-3/4"></div>
        <div className="h-8 bg-slate-900 rounded-xl w-1/3"></div>
        <div className="h-24 bg-slate-900 rounded-2xl w-1/2"></div>
        <div className="h-40 bg-slate-900 rounded-3xl w-full"></div>
        <div className="h-32 bg-slate-900 rounded-[2rem] w-full"></div>
      </div>
    </div>
  </div>
);
