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
    title: "PREMIUM <br/><span class='text-olive-500'>CAR TECH</span>",
    subtitle: "ELITE SERIES",
    description: "Upgrade your drive with our next-generation automotive accessories.",
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
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900 overflow-x-hidden relative selection:bg-olive-500 selection:text-white">
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center">
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-olive-500/5 blur-[100px] -top-20 -left-20 mix-blend-multiply" />
        <div className="absolute w-[60vw] h-[60vw] rounded-full bg-blue-500/5 blur-[100px] bottom-0 right-0 mix-blend-multiply" />
      </div>

      {/* Glassmorphic Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 lg:hidden shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/40">
        <div className="flex items-center justify-between p-4 gap-4">
          <button className="p-2 hover:bg-gray-100/50 rounded-2xl transition-colors">
            <FiMenu size={24} className="text-gray-800" />
          </button>
          
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search Anritvox..." 
              className="w-full bg-gray-100/80 border-transparent focus:bg-white border focus:border-olive-500/50 focus:ring-4 focus:ring-olive-500/10 rounded-2xl py-2.5 px-10 text-sm transition-all outline-none" 
            />
            <FiSearch className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-olive-500 transition-colors" size={18} />
          </div>

          <Link to="/cart" className="p-2 bg-white shadow-sm border border-gray-100 hover:border-olive-200 rounded-2xl text-gray-800 transition-all relative">
            <FiShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </Link>
        </div>
      </div>

      {/* Cinematic Hero Section */}
      <div className="relative max-w-[1600px] mx-auto lg:mt-6 lg:px-6 z-10">
        <div className="relative w-full h-[65vh] lg:h-[75vh] lg:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50">
          {loading ? (
             <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 flex items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/50 to-transparent z-10" />
                
                <img 
                  src={currentBanner.image_url || currentBanner.imageUrl || FALLBACK_IMG} 
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="relative z-20 w-full px-6 md:px-16 lg:px-24">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="max-w-xl backdrop-blur-md bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <FiZap className="text-olive-400" />
                      <span className="text-olive-400 font-bold tracking-widest uppercase text-xs">
                        {currentBanner.subtitle || "New Arrivals"}
                      </span>
                    </div>
                    <h1 
                      className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4 tracking-tight" 
                      dangerouslySetInnerHTML={{ __html: currentBanner.title }} 
                    />
                    <p className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed font-light">
                      {currentBanner.description}
                    </p>
                    <Link to={currentBanner.link || "/shop"} className="inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-olive-500 hover:text-white transition-all duration-300 group">
                      Explore Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Premium Progress Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300 bg-white/30"
                  style={{ width: currentIndex === i ? '2rem' : '1rem' }}
                >
                  {currentIndex === i && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-white rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* App-Style Category Scroll */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-12 relative z-20">
        <h3 className="text-lg font-bold text-gray-900 mb-6 lg:hidden">Shop by Category</h3>
        <div className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-8 pb-4 snap-x snap-mandatory">
          {loading ? (
             [1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[80px]">
                <div className="w-20 h-20 rounded-[1.5rem] bg-gray-200 animate-pulse" />
                <div className="w-14 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          ) : dynamicCategories.length > 0 ? dynamicCategories.map((cat, i) => (
            <Link 
              to={`/shop?category=${cat.slug || cat.name}`} 
              key={cat.id || i} 
              className="flex flex-col items-center gap-3 min-w-[88px] group snap-start"
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-[1.5rem] bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-1 transition-all duration-300 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-olive-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {cat.image ? (
                  <img src={cat.image} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" alt={cat.name} />
                ) : (
                  <FiCheckCircle size={32} className="text-gray-300 group-hover:text-olive-500 relative z-10 transition-colors" />
                )}
              </div>
              <span className="text-[11px] md:text-sm font-bold tracking-wide text-gray-600 group-hover:text-gray-900 text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          )) : null}
        </div>
      </section>

      {/* Premium Product Grid */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-20 relative z-20">
        <div className="flex justify-between items-end mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-olive-500 to-olive-600 text-white rounded-2xl shadow-lg shadow-olive-500/20">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Trending Now</h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">Engineered for your journey</p>
            </div>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-olive-600 transition-colors bg-white px-5 py-2.5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md">
            View Collection <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {loading ? (
             [1, 2, 3, 4, 5].map((_, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-4 border border-gray-100 h-[300px] animate-pulse">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-4" />
                <div className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
                <div className="w-1/2 h-4 bg-gray-200 rounded" />
              </div>
             ))
          ) : products.slice(0, 10).map((product, idx) => (
            <motion.div 
              key={product._id || product.id || idx} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white rounded-3xl p-3 md:p-5 border border-gray-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-olive-200 transition-all duration-500 relative flex flex-col h-full"
            >
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.discount && (
                  <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <button className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                <FiHeart size={16} />
              </button>

              <Link to={`/product/${product._id || product.id}`} className="block relative aspect-square mb-5 bg-[#F8F9FA] rounded-2xl overflow-hidden group-hover:bg-olive-50/30 transition-colors">
                <img 
                  src={product.image || product.images?.[0] || FALLBACK_IMG} 
                  className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" 
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              <div className="flex flex-col flex-1 px-1">
                <div className="flex items-center gap-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={12} className={i < 4 ? "fill-current" : "text-gray-200"} />
                  ))}
                  <span className="text-[10px] font-medium text-gray-400 ml-1">(12)</span>
                </div>
                
                <Link to={`/product/${product._id || product.id}`}>
                  <h3 className="text-gray-900 font-bold mb-1 line-clamp-2 text-sm md:text-base group-hover:text-olive-600 transition-colors">
                    {product.name || "Premium Accessory"}
                  </h3>
                </Link>

                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    {product.oldPrice && (
                      <div className="text-[11px] text-gray-400 line-through mb-0.5">
                        ₹{Number(product.oldPrice).toLocaleString()}
                      </div>
                    )}
                    <div className="font-black text-lg md:text-xl text-gray-900 tracking-tight">
                      ₹{Number(product.price || 999).toLocaleString()}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-sm ${
                      addedToCart[product._id || product.id] 
                      ? 'bg-gray-900 text-white scale-105' 
                      : 'bg-white border border-gray-200 text-gray-900 hover:bg-olive-500 hover:border-olive-500 hover:text-white'
                    }`}
                  >
                    {addedToCart[product._id || product.id] ? <FiCheckCircle size={20} /> : <FiShoppingCart size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 md:hidden">
          <Link to="/shop" className="flex items-center justify-center w-full py-4 rounded-2xl border border-gray-200 text-gray-900 font-bold bg-white shadow-sm active:scale-95 transition-transform">
            View All Products
          </Link>
        </div>
      </section>

      {/* Trust & Value Proposition */}
      <div className="border-t border-gray-200/60 bg-white relative z-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <FiShield />, title: "Secure Checkout", desc: "256-bit encryption" },
              { icon: <FiTruck />, title: "Fast Delivery", desc: "Pan-India Shipping" },
              { icon: <FiCheckCircle />, title: "Quality Assured", desc: "Tested for durability" },
              { icon: <FiHeadphones />, title: "24/7 Support", desc: "Expert assistance" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center text-gray-900 text-2xl mb-5 shadow-sm border border-gray-100">
                  {item.icon}
                </div>
                <h5 className="font-bold text-gray-900 mb-1.5">{item.title}</h5>
                <p className="text-sm text-gray-500">{item.desc}</p>
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
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-gray-900/90 backdrop-blur text-white p-4 rounded-full shadow-2xl z-50 hover:bg-olive-600 transition-colors"
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
