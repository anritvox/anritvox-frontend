import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiMenu, FiShoppingCart, FiArrowRight, 
  FiShield, FiTruck, FiHeadphones, FiCheckCircle, 
  FiStar, FiChevronUp, FiHeart, FiTrendingUp, FiZap
} from "react-icons/fi";

// Services & Context
import { fetchProducts, fetchActiveBanners, fetchCategories } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200";

const DEFAULT_BANNERS = [
  {
    imageUrl: FALLBACK_IMG,
    title: "Premium <br/><span class='text-blue-600'>Car Audio</span>",
    subtitle: "THE ELITE SERIES",
    description: "Experience studio-quality sound on the road. Engineered for precision, built for power.",
    link: "/shop"
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { addToCart = () => {} } = useCart() || {};
  const { settings = {} } = useSettings() || {}; 

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true); 
        const [p, b, c] = await Promise.all([
          fetchProducts().catch(() => []),
          fetchActiveBanners().catch(() => []),
          fetchCategories().catch(() => [])
        ]);
        setProducts(Array.isArray(p) && p.length > 0 ? p : []);
        setBanners(Array.isArray(b) && b.length > 0 ? b : DEFAULT_BANNERS);
        setDynamicCategories(Array.isArray(c) ? c : []);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
    
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); 

  // Auto-rotate Hero Banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const id = product._id || product.id;
    await addToCart(product, 1);
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
  };

  const currentBanner = banners[currentIndex] || DEFAULT_BANNERS[0];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden relative selection:bg-blue-500 selection:text-white">
      
      {/* Mobile Header (Clean & Minimal) */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 lg:hidden">
        <div className="flex items-center justify-between p-4 gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <FiMenu size={24} className="text-slate-800" />
          </button>
          
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-slate-100/80 border-transparent focus:bg-white border focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 rounded-full py-2.5 px-10 text-sm transition-all outline-none" 
            />
            <FiSearch className="absolute left-4 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          </div>

          <Link to="/cart" className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-all relative">
            <FiShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white"></span>
          </Link>
        </div>
      </div>

      {/* Modern, Bright Hero Section */}
      <div className="relative max-w-[1600px] mx-auto lg:mt-6 lg:px-6 z-10">
        <div className="relative w-full h-[60vh] lg:h-[65vh] lg:rounded-[2rem] overflow-hidden bg-white shadow-sm border border-slate-100">
          {loading ? (
             <div className="w-full h-full bg-slate-100 animate-pulse" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center"
              >
                {/* Image layer - positioned to the right on desktop, full on mobile */}
                <div className="absolute inset-0 lg:left-1/3 z-0">
                  <img 
                    src={currentBanner.image_url || currentBanner.imageUrl || FALLBACK_IMG} 
                    alt="Banner"
                    className="w-full h-full object-cover lg:object-cover"
                  />
                </div>
                
                {/* Bright gradient overlay ensures text is readable without being dark */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent lg:via-white/90 lg:to-transparent z-10" />
                
                <div className="relative z-20 w-full px-6 md:px-16 lg:px-24 max-w-3xl">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.2, duration: 0.7 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiZap className="text-blue-600" />
                      <span className="text-blue-600 font-bold tracking-[0.2em] uppercase text-xs">
                        {currentBanner.subtitle || "New Arrivals"}
                      </span>
                    </div>
                    <h1 
                      className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.05] mb-6 tracking-tight" 
                      dangerouslySetInnerHTML={{ __html: currentBanner.title }} 
                    />
                    <p className="text-slate-600 text-lg md:text-xl mb-10 leading-relaxed max-w-xl">
                      {currentBanner.description}
                    </p>
                    <Link to={currentBanner.link || "/shop"} className="inline-flex items-center justify-center gap-3 px-10 py-4 md:py-5 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 group">
                      Explore Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Minimalist Progress Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-8 left-6 md:left-16 lg:left-24 z-30 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300 bg-slate-200"
                  style={{ width: currentIndex === i ? '2.5rem' : '1rem' }}
                >
                  {currentIndex === i && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-slate-900 rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Premium Category Scroll */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16 relative z-20">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-6 md:gap-8 pb-4 snap-x snap-mandatory">
          {loading ? (
             [1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 min-w-[100px]">
                <div className="w-24 h-24 rounded-full bg-slate-200 animate-pulse" />
                <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
              </div>
            ))
          ) : dynamicCategories.length > 0 ? dynamicCategories.map((cat, i) => (
            <Link 
              to={`/shop?category=${cat.slug || cat.name}`} 
              key={cat.id || i} 
              className="flex flex-col items-center gap-4 min-w-[100px] group snap-start"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:shadow-xl group-hover:shadow-slate-200/50 group-hover:-translate-y-2 transition-all duration-300 p-5 relative overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" alt={cat.name} />
                ) : (
                  <FiCheckCircle size={32} className="text-slate-300 group-hover:text-blue-600 relative z-10 transition-colors" />
                )}
              </div>
              <span className="text-xs md:text-sm font-semibold tracking-wide text-slate-600 group-hover:text-slate-900 text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          )) : null}
        </div>
      </section>

      {/* Clean & Elegant Product Grid */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-24 relative z-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Trending Now</h2>
            <p className="text-slate-500 mt-2 text-lg">Engineered for your journey</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            View Full Collection <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {loading ? (
             [1, 2, 3, 4, 5].map((_, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] p-5 border border-slate-100 h-[340px] animate-pulse">
                <div className="w-full aspect-square bg-slate-100 rounded-2xl mb-4" />
                <div className="w-3/4 h-4 bg-slate-200 rounded mb-3" />
                <div className="w-1/2 h-4 bg-slate-200 rounded" />
              </div>
             ))
          ) : products.slice(0, 10).map((product, idx) => (
            <motion.div 
              key={product._id || product.id || idx} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white rounded-[2rem] p-4 md:p-5 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative flex flex-col h-full"
            >
              <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                {product.discount && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <button className="absolute top-5 right-5 z-10 p-2.5 bg-slate-50 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                <FiHeart size={18} />
              </button>

              <Link to={`/product/${product._id || product.id}`} className="block relative aspect-square mb-6 bg-slate-50/50 rounded-[1.5rem] overflow-hidden group-hover:bg-slate-50 transition-colors">
                <img 
                  src={product.image || product.images?.[0] || FALLBACK_IMG} 
                  className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" 
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              <div className="flex flex-col flex-1 px-2">
                <Link to={`/product/${product._id || product.id}`}>
                  <h3 className="text-slate-900 font-semibold mb-2 line-clamp-2 text-sm md:text-base group-hover:text-blue-600 transition-colors">
                    {product.name || "Premium Accessory"}
                  </h3>
                </Link>

                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    {product.oldPrice && (
                      <div className="text-[11px] text-slate-400 line-through mb-1">
                        ₹{Number(product.oldPrice).toLocaleString()}
                      </div>
                    )}
                    <div className="font-black text-xl text-slate-900 tracking-tight">
                      ₹{Number(product.price || 999).toLocaleString()}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm ${
                      addedToCart[product._id || product.id] 
                      ? 'bg-slate-900 text-white scale-105' 
                      : 'bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {addedToCart[product._id || product.id] ? <FiCheckCircle size={20} /> : <FiShoppingCart size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 md:hidden">
          <Link to="/shop" className="flex items-center justify-center w-full py-4 rounded-full text-white font-bold bg-slate-900 shadow-md active:scale-95 transition-transform">
            View All Products
          </Link>
        </div>
      </section>

      {/* Trust & Value Proposition (Minimalist) */}
      <div className="border-t border-slate-200/60 bg-white relative z-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <FiShield />, title: "Secure Checkout", desc: "256-bit SSL encryption" },
              { icon: <FiTruck />, title: "Fast Delivery", desc: "Pan-India Shipping" },
              { icon: <FiCheckCircle />, title: "Quality Assured", desc: "Tested for extreme durability" },
              { icon: <FiHeadphones />, title: "24/7 Support", desc: "Expert automotive assistance" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 text-xl mb-4 shadow-sm border border-slate-100">
                  {item.icon}
                </div>
                <h5 className="font-bold text-slate-900 mb-1">{item.title}</h5>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-slate-900/90 backdrop-blur text-white p-4 rounded-full shadow-2xl z-50 hover:bg-blue-600 transition-colors"
          >
            <FiChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
