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

const getImageUrl = (img) => {
  if (!img) return '/logo-rect.jpeg';
  let path = typeof img === 'object' ? (img.url || img.file_path || img.path) : img;
  if (!path) return '/logo-rect.jpeg';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [isAdding, setIsAdding] = useState(false);
  const [fitment, setFitment] = useState({ make: '', model: '', year: '' });
  const [fitmentStatus, setFitmentStatus] = useState(null);

  const { scrollY } = useScroll();
  const showStickyBar = useTransform(scrollY, [0, 800], [0, 1]);
  const stickyYOffset = useTransform(showStickyBar, [0, 1], [50, 0]);

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
        <div className="min-h-screen flex items-center justify-center text-olive-500 bg-slate-50 font-black uppercase tracking-widest text-2xl">
          Product Offline.
        </div>
      )}

      {!loading && product && (
        <div className="bg-white text-slate-900 min-h-screen selection:bg-olive-400 selection:text-white pt-24 pb-32 font-sans relative">
          
          {}
          <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center flex-wrap gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Link to="/" className="hover:text-olive-400 transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to={`/shop?category=${product.category_id}`} className="hover:text-olive-400 transition-colors">{product.category_name || 'Hardware Registry'}</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800 truncate max-w-[200px]">{product.name}</span>
          </div>

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6 relative">
              <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 shrink-0 no-scrollbar py-1">
                {product.images?.map((media, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveMedia(media)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 bg-slate-50 p-1 shrink-0 ${
                      activeMedia?.url === media.url ? 'border-olive-400 ring-4 ring-olive-400/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center"><Play size={24} className="text-olive-500" /></div>
                    ) : (
                      <img src={getImageUrl(media)} alt="Thumbnail" className="w-full h-full object-contain transition-all" />
                    )}
                  </button>
                ))}
              </div>

              <div className="relative w-full aspect-square md:aspect-auto md:h-[650px] bg-slate-50 border border-slate-200 rounded-[3rem] overflow-hidden flex items-center justify-center lg:sticky lg:top-32 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeMedia?.url}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full p-8 flex items-center justify-center"
                  >
                    {activeMedia?.type === 'video' ? (
                      <video src={getImageUrl(activeMedia)} autoPlay loop muted controls className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                      <img src={getImageUrl(activeMedia)} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out origin-center cursor-zoom-in" />
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
                  {product.is_new_arrival === 1 && <span className="bg-olive-400 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-olive-500/10">New Arrival</span>}
                  {product.is_trending === 1 && <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Trending</span>}
                </div>
                
                <button className="absolute top-6 right-6 w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-100 transition-all duration-300 z-10 shadow-sm">
                  <Heart size={20} />
                </button>
              </div>
            </div>

            {}
            <div className="lg:col-span-5 flex flex-col relative">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight mb-4 text-slate-900">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-6 mb-6 flex-wrap">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} className={i < Math.floor(product.rating || 5) ? "" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-xs font-black text-slate-900">{product.rating || '5.0'}</span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-l border-slate-200 pl-2 ml-1">
                      {product.review_count || 0} Reviews
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    SKU: <span className="text-slate-800 font-mono font-black">{product.sku || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black tracking-tight text-slate-900 font-mono">
                      ₹{product.discount_price || product.price}
                    </span>
                    {product.discount_price && (
                      <span className="text-lg font-bold text-slate-400 line-through font-mono">₹{product.price}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="text-olive-500 text-xs font-black uppercase tracking-widest mt-1">
                      Offer Saved ₹{savings} ({savingsPercent}% Off)
                    </span>
                  )}
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                  {product.description?.substring(0, 220)}...
                </p>
              </div>

              {}
              <div className="bg-gradient-to-b from-slate-50 to-slate-100/50 border border-slate-200 rounded-3xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none text-slate-900"><Car size={140} /></div>
                <h3 className="text-xs font-black uppercase tracking-widest text-olive-500 mb-4 flex items-center gap-2">
                  <Zap size={14} /> Hardware Compatibility System
                </h3>
                <form onSubmit={handleFitmentCheck} className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                  <input type="text" placeholder="Make" required onChange={(e) => setFitment({...fitment, make: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none w-full text-slate-900 placeholder:text-slate-400" />
                  <input type="text" placeholder="Model" required onChange={(e) => setFitment({...fitment, model: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none w-full text-slate-900 placeholder:text-slate-400" />
                  <button type="submit" className="bg-slate-900 hover:bg-olive-400 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">Check</button>
                </form>
                
                <AnimatePresence>
                  {fitmentStatus && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl flex items-center gap-3 border ${
                      fitmentStatus === 'fits' ? 'bg-olive-50 border-olive-200 text-olive-600' :
                      fitmentStatus === 'nofit' ? 'bg-red-50 border-red-200 text-red-600' :
                      'bg-slate-100 border-slate-200 text-slate-500 animate-pulse'
                    }`}>
                      {fitmentStatus === 'fits' && <><CheckCircle2 size={16} /> <span className="text-xs font-black uppercase tracking-wider">Verified Compatible for your vehicle.</span></>}
                      {fitmentStatus === 'nofit' && <><AlertCircle size={16} /> <span className="text-xs font-black uppercase tracking-wider">May require individual configuration.</span></>}
                      {fitmentStatus === 'checking' && <span className="text-xs font-black uppercase tracking-wider">Verifying details...</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-4 mb-5">
                  <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${isOutOfStock ? 'bg-red-50 text-red-600' : 'bg-olive-50 text-olive-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-olive-400 animate-pulse'}`}></div>
                    {isOutOfStock ? 'Out of Stock' : 'In Stock & Ready'}
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl w-32 p-1">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-200/50 transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="font-black text-base font-mono w-8 text-center text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-200/50 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={handleAddToCart} 
                    disabled={isOutOfStock || isAdding}
                    className="flex-1 bg-slate-900 hover:bg-olive-400 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <span className={`flex items-center gap-2 transition-transform duration-300 ${isAdding ? '-translate-y-12' : ''}`}>
                      <ShoppingBag size={16} /> Add To Cart
                    </span>
                    <span className={`absolute inset-0 flex items-center justify-center gap-2 bg-olive-400 text-white transition-transform duration-300 ${isAdding ? 'translate-y-0' : 'translate-y-12'}`}>
                      <CheckCircle2 size={16} /> Item Added
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Shield />, title: "Hardware Registry Warranty", sub: product.warranty_period || "2 Years Coverage" },
                  { icon: <Truck />, title: "Express Dispatch", sub: "Ships within 24hrs" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-olive-400">{item.icon}</div>
                    <div>
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900">{item.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {}
          <div className="max-w-7xl mx-auto px-6 mt-24">
            <div className="flex border-b border-slate-200 mb-10 relative overflow-x-auto no-scrollbar">
              {['details', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap relative ${
                    activeTab === tab ? 'text-olive-400' : 'text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 w-full h-0.5 bg-olive-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                  <motion.div key="details" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="text-slate-600 leading-relaxed text-sm max-w-4xl font-medium whitespace-pre-wrap">
                    {product.description}
                  </motion.div>
                )}
                
                {activeTab === 'specifications' && (
                  <motion.div key="specs" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 max-w-4xl">
                    {[
                      { label: 'Brand Placement', value: product.brand },
                      { label: 'Hardware Registry SKU', value: product.sku },
                      { label: 'Warranty Scope', value: product.warranty_period },
                      { label: 'Classification Tags', value: product.tags },
                      { label: '3D Model Support', value: product.model_3d_url ? 'Enabled' : 'N/A' },
                    ].map((spec, i) => (
                      <div key={i} className="flex justify-between py-3.5 border-b border-slate-100 text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">{spec.label}</span>
                        <span className="text-slate-900 font-black">{spec.value || 'N/A'}</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div key="reviews" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="max-w-3xl">
                    {reviewsData.length > 0 ? (
                      reviewsData.map((review, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl mb-4 shadow-sm">
                          <div className="flex items-center gap-1 text-amber-500 mb-3">
                            {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill={idx < review.rating ? "currentColor" : "none"} className={idx < review.rating ? "" : "text-slate-200"} />)}
                          </div>
                          <h4 className="text-base font-black text-slate-900 mb-1">{review.title}</h4>
                          <p className="text-slate-600 text-xs font-medium mb-3">{review.comment}</p>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{review.user_name} • Verified Buyer</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Reviews Available Yet</h3>
                        <p className="text-slate-400 text-xs mt-1">Be the first to review this product.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {}
          <motion.div 
            style={{ opacity: showStickyBar, y: stickyYOffset }}
            className="fixed bottom-0 left-0 w-full z-50 p-4 pointer-events-none"
          >
            <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-xl flex items-center justify-between pointer-events-auto">
              <div className="hidden md:flex items-center gap-4">
                <img src={getImageUrl(activeMedia)} className="w-10 h-10 rounded-lg object-contain bg-slate-50" alt="sticky thumbnail" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 line-clamp-1">{product.name}</h4>
                  <p className="text-olive-500 font-mono font-black text-xs">₹{product.discount_price || product.price}</p>
                </div>
              </div>
              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full md:w-auto px-10 py-3.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-sm hover:bg-olive-400 transition-all disabled:opacity-50"
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
  <div className="bg-white min-h-screen pt-24 pb-32 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
      <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
        <div className="flex md:flex-col gap-4 w-full md:w-24">
          {[1,2,3,4].map(i => <div key={i} className="w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-2xl shrink-0"></div>)}
        </div>
        <div className="w-full h-[500px] md:h-[650px] bg-slate-100 rounded-[3rem]"></div>
      </div>
      <div className="lg:col-span-5 flex flex-col gap-6 pt-8">
        <div className="h-12 bg-slate-100 rounded-xl w-3/4"></div>
        <div className="h-6 bg-slate-100 rounded-lg w-1/4"></div>
        <div className="h-16 bg-slate-100 rounded-xl w-1/2"></div>
        <div className="h-32 bg-slate-100 rounded-2xl w-full"></div>
        <div className="h-24 bg-slate-100 rounded-xl w-full"></div>
      </div>
    </div>
  </div>
);
