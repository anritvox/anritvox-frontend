import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiMenu, FiShoppingCart, FiArrowRight, 
  FiShield, FiTruck, FiHeadphones, FiCheckCircle, 
  FiStar, FiChevronUp, FiHeart, FiTrendingUp, FiClock
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
    }, 5000);
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden relative selection:bg-olive-500 selection:text-white">
      
      {/* Background Fluid Motion - Subtle & Clean */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-olive-500/5 blur-[120px] mix-blend-multiply animate-fluid-drift" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-olive-600/5 blur-[120px] mix-blend-multiply animate-fluid-drift" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Mobile Search & Header (App-like sticky top) */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 lg:hidden shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiMenu size={22} className="text-gray-800" />
          </button>
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search for accessories..." 
              className="w-full bg-gray-100 border-transparent focus:bg-white border focus:border-olive-500 rounded-full py-2.5 px-10 text-sm transition-all outline-none shadow-inner" 
            />
            <FiSearch className="absolute left-4 top-3 text-gray-500 group-focus-within:text-olive-500 transition-colors" size={16} />
          </div>
          <Link to="/cart" className="p-2 hover:bg-olive-50 rounded-full text-gray-800 hover:text-olive-600 transition-colors relative">
            <FiShoppingCart size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Link>
        </div>
      </div>

      {/* Modern Hero Slider (Flipkart / Premium vibe) */}
      <div className="relative max-w-[1400px] mx-auto lg:mt-6 lg:px-6 z-10">
        <div className="relative w-full h-[60vh] lg:h-[70vh] lg:rounded-3xl overflow-hidden shadow-2xl shadow-olive-900/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center"
            >
              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
              
              <img 
                src={currentBanner.image_url || currentBanner.imageUrl || FALLBACK_IMG} 
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              <div className="relative z-20 w-full px-8 md:px-16 lg:px-24">
                <motion.div 
                  initial={{ y: 30, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="max-w-xl"
                >
                  <span className="inline-block py-1 px-3 rounded-full bg-olive-500/20 backdrop-blur-md border border-olive-500/30 text-olive-400 font-bold tracking-widest uppercase text-xs mb-6">
                    {currentBanner.subtitle || "New Arrivals"}
                  </span>
                  <h1 
                    className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-lg" 
                    dangerouslySetInnerHTML={{ __html: currentBanner.title }} 
                  />
                  <p className="text-gray-200 text-lg md:text-xl mb-8 leading-relaxed font-light drop-shadow-md">
                    {currentBanner.description}
                  </p>
                  <Link to={currentBanner.link || "/shop"} className="inline-flex items-center gap-3 px-8 py-4 bg-olive-500 text-white rounded-full font-bold hover:bg-olive-600 transition-all group shadow-lg shadow-olive-500/30 hover:shadow-olive-500/50 hover:-translate-y-1">
                    Shop Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === i ? "w-8 bg-olive-500" : "w-2 bg-white/50 hover:bg-white"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Categories (Meesho style - Horizontal Scroll) */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 relative z-20">
        <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4 snap-x">
          {dynamicCategories.length > 0 ? dynamicCategories.map((cat, i) => (
            <Link 
              to={`/shop?category=${cat.slug || cat.name}`} 
              key={cat.id || i} 
              className="flex flex-col items-center gap-3 min-w-[80px] group snap-start"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md group-hover:border-olive-200 transition-all duration-300 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-olive-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {cat.image ? (
                  <img src={cat.image} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" alt={cat.name} />
                ) : (
                  <FiCheckCircle size={28} className="text-gray-400 group-hover:text-olive-500 relative z-10" />
                )}
              </div>
              <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray-600 group-hover:text-olive-700 text-center">
                {cat.name}
              </span>
            </Link>
          )) : (
            /* Placeholders if no categories fetched */
            [1, 2, 3, 4, 5, 6, 7].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[80px]">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Featured Products (Amazon/Flipkart Style Grid) */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 relative z-20">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-olive-100 text-olive-600 rounded-xl">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Trending Now</h2>
              <p className="text-sm text-gray-500 mt-1">Top picks curated just for you</p>
            </div>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold text-olive-600 hover:text-olive-800 transition-colors">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.slice(0, 10).map((product, idx) => (
            <motion.div 
              key={product._id || product.id || idx} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.05 }}
              className="group bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:border-olive-200 transition-all duration-300 relative flex flex-col h-full"
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.discount && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
                {idx < 3 && (
                  <span className="bg-olive-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">
                    BESTSELLER
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm opacity-0 group-hover:opacity-100 md:opacity-100">
                <FiHeart size={16} />
              </button>

              {/* Product Image */}
              <Link to={`/product/${product._id || product.id}`} className="block relative aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden">
                <img 
                  src={product.image || product.images?.[0] || FALLBACK_IMG} 
                  className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              {/* Product Details */}
              <div className="flex flex-col flex-1 px-1">
                <div className="flex items-center gap-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={12} className={i < 4 ? "fill-current" : "text-gray-300"} />
                  ))}
                  <span className="text-[10px] font-medium text-gray-500 ml-1">(120)</span>
                </div>
                
                <Link to={`/product/${product._id || product.id}`}>
                  <h3 className="text-gray-800 font-semibold mb-1 line-clamp-2 text-sm hover:text-olive-600 transition-colors">
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
                    <div className="font-black text-lg text-gray-900">
                      ₹{Number(product.price || 999).toLocaleString()}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-sm ${
                      addedToCart[product._id || product.id] 
                      ? 'bg-green-500 text-white scale-110' 
                      : 'bg-olive-50 text-olive-600 hover:bg-olive-500 hover:text-white'
                    }`}
                  >
                    {addedToCart[product._id || product.id] ? <FiCheckCircle size={18} /> : <FiShoppingCart size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link to="/shop" className="inline-block w-full py-3 rounded-xl border border-olive-200 text-olive-600 font-bold bg-olive-50/50">
            View All Products
          </Link>
        </div>
      </section>

      {/* Trust & Value Proposition (Modern App Cards) */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[
            { icon: <FiShield />, title: "Secure Checkout", desc: "100% Protected Payments" },
            { icon: <FiTruck />, title: "Fast Delivery", desc: "Express Pan-India Shipping" },
            { icon: <FiCheckCircle />, title: "Quality Assured", desc: "Rigorous Testing Standards" },
            { icon: <FiHeadphones />, title: "24/7 Support", desc: "Always here to help you" }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-olive-50 rounded-2xl flex items-center justify-center text-olive-600 text-2xl mb-4">
                {item.icon}
              </div>
              <h5 className="font-bold text-gray-900 mb-1">{item.title}</h5>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Scroll Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-gray-900 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-olive-600 transition-colors"
          >
            <FiChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Utility CSS for hiding scrollbar specifically in this component */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
