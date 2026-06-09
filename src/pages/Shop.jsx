import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Star, Search, SlidersHorizontal, 
  Sparkles, Layers, Flame, CheckCircle, ArrowRight 
} from 'lucide-react';
import { products as productsApi, cart as cartApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductGridSkeleton } from '../components/SkeletonLoader';


const getImageUrl = (img) => {
  if (!img) return '/logo-rect.jpeg';
  let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
  if (!path) return '/logo-rect.jpeg';
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export default function Shop() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast() || {};


  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Products');


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const queryParam = params.get('q');
    
    if (categoryParam) {

      if (categoryParam.toLowerCase() === 'audio') setActiveCategory('Audio');
      if (categoryParam.toLowerCase() === 'lighting' || categoryParam.toLowerCase() === 'lights') setActiveCategory('Lighting');
      if (categoryParam.toLowerCase() === 'players' || categoryParam.toLowerCase() === 'android players') setActiveCategory('Android Players');
    }
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [location.search]);


  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);

        const res = await productsApi.getAllActive({ limit: 100 });
        setProducts(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Catalog retrieval error:", err);
        if (showToast) showToast('Could not load products. Please refresh.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);


  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (showToast) showToast('Please login to begin adding items to your cart.', 'error');
      navigate('/login');
      return;
    }

    try {
      await cartApi.add({ productId, quantity: 1 });
      if (showToast) showToast('Product successfully added to your cart!', 'success');
    } catch (error) {
      console.error("Cart mutation failure:", error);
      if (showToast) showToast('Could not add product. Please try again.', 'error');
    }
  };


  const filteredProducts = products.filter(product => {

    let matchesCategory = true;
    if (activeCategory !== 'All Products') {
      const targetCat = activeCategory.toLowerCase();
      const productCat = product.category?.name?.toLowerCase() || product.category_name?.toLowerCase() || '';
      
      if (targetCat === 'audio') {
        matchesCategory = productCat.includes('audio') || productCat.includes('sound') || productCat.includes('speaker');
      } else if (targetCat === 'lighting') {
        matchesCategory = productCat.includes('light') || productCat.includes('led') || productCat.includes('bulb');
      } else if (targetCat === 'android players') {
        matchesCategory = productCat.includes('player') || productCat.includes('android') || productCat.includes('screen');
      }
    }


    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categoryPills = ['All Products', 'Audio', 'Lighting', 'Android Players'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-olive-400 selection:text-white font-sans pb-24">
      
      {}
      <div className="relative bg-slate-950 text-white overflow-hidden py-16 md:py-20 border-b border-slate-900">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#808d64_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-olive-500/20 rounded-full blur-[120px] -translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-olive-500/10 border border-olive-500/20 text-olive-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
            <Sparkles size={12} className="animate-pulse" /> Premium Equipment Collection
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            The Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-300 to-olive-500">Store</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-medium">
            Explore our curated catalog of expert car equipment upgrades. Premium quality components, precision engineered for your vehicle.
          </p>
        </div>
      </div>

      {}
      <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
            {categoryPills.map((pill) => {
              const isActive = activeCategory === pill;
              return (
                <button
                  key={pill}
                  onClick={() => {
                    setActiveCategory(pill);
                    navigate(`/shop${pill === 'All Products' ? '' : `?category=${encodeURIComponent(pill)}`}`);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-olive-400 text-white shadow-md shadow-olive-500/20 scale-[1.02]' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {}
          <div className="relative w-full md:w-80 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-olive-400 transition-colors" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search within ${activeCategory.toLowerCase()}...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:border-olive-400/50 focus:bg-white outline-none transition-all placeholder:text-slate-400 shadow-inner"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-tighter"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-6 mt-12">
        
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <>
            {}
            <div className="mb-6 flex justify-between items-center px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Showing {filteredProducts.length} of {products.length} Items
              </span>
              {searchTerm && (
                <span className="text-xs font-medium text-slate-500">
                  Filtered by match string: <strong className="text-slate-900 font-bold">"{searchTerm}"</strong>
                </span>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {filteredProducts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-[2.5rem] p-16 text-center shadow-sm max-w-xl mx-auto mt-12"
                >
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <Layers size={24} />
                  </div>
                  <h3 className="text-lg font-black uppercase text-slate-900 mb-2">No Equipment Found</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                    We couldn't locate any products in the {activeCategory} category matching your criteria. Try adjusting your query or select a different category.
                  </p>
                  <button 
                    onClick={() => { setSearchTerm(''); setActiveCategory('All Products'); navigate('/shop'); }}
                    className="px-6 py-3 bg-slate-900 hover:bg-olive-400 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors shadow-md"
                  >
                    Reset Store View
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                  {filteredProducts.map((prod) => {
                    const priceVal = prod.discount_price || prod.price;
                    const hasDiscount = !!prod.discount_price;

                    return (
                      <motion.div
                        layout
                        key={prod.id || prod._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="group flex flex-col bg-white border border-slate-200 rounded-[2.2rem] p-4 hover:border-olive-400/40 transition-all duration-300 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(128,141,100,0.12)] relative"
                      >
                        {}
                        {hasDiscount && (
                          <div className="absolute top-6 left-6 z-20">
                            <span className="px-2.5 py-1 bg-olive-400 text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                              Sale Offer
                            </span>
                          </div>
                        )}

                        {}
                        <div className="relative aspect-square overflow-hidden mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
                          <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="w-full h-full flex items-center justify-center p-6">
                            <img 
                              src={getImageUrl(prod.images?.[0] || prod.image_url)} 
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out" 
                              alt={prod.name} 
                              onError={(e) => { e.target.src = '/logo-rect.jpeg'; }}
                            />
                          </Link>
                        </div>

                        {}
                        <div className="flex-1 flex flex-col justify-between px-1">
                          <div className="mb-4">
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="flex-1">
                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-olive-400 transition-colors line-clamp-1">
                                  {prod.name}
                                </h3>
                              </Link>
                              <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold bg-amber-50 px-1.5 py-0.5 border border-amber-100 rounded shrink-0">
                                <Star size={10} fill="currentColor" /> {prod.rating || '5.0'}
                              </div>
                            </div>
                            
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
                              {prod.brand || 'Premium Grade'}
                            </p>

                            <div className="flex items-baseline gap-2">
                              <span className="text-base font-black text-slate-900 font-mono">₹{priceVal}</span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through font-mono">₹{prod.price}</span>
                              )}
                            </div>
                          </div>

                          <button 
                            onClick={(e) => handleAddToCart(e, prod.id || prod._id)}
                            className="w-full bg-slate-900 hover:bg-olive-400 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
                          >
                            <ShoppingBag size={13} /> Add to Cart
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {}
      <div className="max-w-5xl mx-auto px-6 mt-24">
        <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 md:p-12 border border-slate-900 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(#808d64_1px,transparent_1px)] opacity-[0.03] [background-size:12px_12px] pointer-events-none"></div>
          
          <div className="max-w-xl">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Verified Vehicle Fitting Guarantee</h3>
            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
              Every equipment package contains comprehensive operational hardware registry logs. Need installation assistance? Contact our technical line.
            </p>
          </div>
          
          <Link to="/contact" className="px-6 py-3.5 bg-olive-400 hover:bg-white text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all whitespace-nowrap shadow-md shadow-olive-500/10 hover:-translate-y-0.5 flex items-center gap-2">
            Contact Support <ArrowRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  );
}
