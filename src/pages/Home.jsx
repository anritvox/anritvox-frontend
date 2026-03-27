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
    title: "Dynamic <br/><span class='text-olive-600'>Acoustics</span>",
    subtitle: "THE ELITE SERIES",
    description: "Experience fluid, studio-quality sound on the road. Engineered for pure power.",
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
  
  // State for the Flying Cart Animation
  const [flyingItem, setFlyingItem] = useState(null);

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
    
    // Capture click coordinates for the flying animation
    const rect = e.currentTarget.getBoundingClientRect();
    const id = product._id || product.id;
    const imgSrc = product.image || product.images?.[0] || FALLBACK_IMG;

    setFlyingItem({
      id: Date.now(), // Unique ID for animation key
      startX: rect.left,
      startY: rect.top,
      img: imgSrc
    });

    await addToCart(product, 1);
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    
    // Clear animation and success state after duration
    setTimeout(() => {
      setFlyingItem(null);
    }, 800);
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const currentBanner = banners[currentIndex] || DEFAULT_BANNERS[0];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 overflow-x-hidden relative selection:bg-olive-500 selection:text-white">
      
      {/* FLUID DYNAMIC BACKGROUND BLOBS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80vw] h-[80vw] rounded-full bg-olive-500/10 blur-[120px] -top-40 -left-20 mix-blend-multiply" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -50, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-[120px] bottom-0 right-0 mix-blend-multiply" 
        />
      </div>

      {/* FLYING CART ANIMATION OVERLAY */}
      <AnimatePresence>
        {flyingItem && (
          <motion.img
            key={flyingItem.id}
            src={flyingItem.img}
            initial={{ 
              position: 'fixed', 
              left: flyingItem.startX, 
              top: flyingItem.startY, 
              scale: 1, 
              opacity: 1, 
              zIndex: 9999,
              borderRadius: '20%'
            }}
            animate={{ 
              left: window.innerWidth - (window.innerWidth < 1024 ? 60 : 100), // Approximate cart icon location
              top: 20, 
              scale: 0.1, 
              opacity: 0.2,
              rotate: 360
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }} // Spring-like cubic bezier
            className="w-20 h-20 object-cover shadow-2xl pointer-events-none border-2 border-olive-500"
          />
        )}
      </AnimatePresence>

      {/* Glassmorphic Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 lg:hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between p-4 gap-4">
          <button className="p-2 hover:bg-olive-50/50 rounded-2xl transition-colors">
            <FiMenu size={24} className="text-gray-800" />
          </button>
          
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search Anritvox..." 
              className="w-full bg-white/50 backdrop-blur-sm border border-white/60 focus:bg-white focus:border-olive-500/50 focus:ring-4 focus:ring-olive-500/10 rounded-2xl py-2.5 px-10 text-sm transition-all outline-none shadow-inner" 
            />
            <FiSearch className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-olive-500 transition-colors" size={18} />
          </div>

          <Link to="/cart" className="p-2 bg-white/80 backdrop-blur-md shadow-sm border border-white hover:border-olive-200 rounded-2xl text-gray-800 transition-all relative">
            <FiShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-olive-500 rounded-full border-2 border-white"></span>
          </Link>
        </div>
      </div>

      {/* Transparent Glass Hero Section */}
      <div className="relative max-w-[1600px] mx-auto lg:mt-6 lg:px-6 z-10">
        <div className="relative w-full h-[65vh] lg:h-[75vh] lg:rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-olive-900/5">
          {loading ? (
             <div className="w-full h-full bg-olive-50/50 animate-pulse" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center"
              >
                {/* Hero Image - Shifted right */}
                <div className="absolute inset-0 lg:left-1/4 z-0">
                  <img 
                    src={currentBanner.image_url || currentBanner.imageUrl || FALLBACK_IMG} 
                    alt="Banner"
                    className="w-full h-full object-cover mix-blend-multiply opacity-90"
                  />
                </div>
                
                {/* Glass Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent lg:via-white/60 z-10 backdrop-blur-[2px]" />
                
                <div className="relative z-20 w-full px-6 md:px-16 lg:px-24 max-w-3xl">
                  <motion.div 
                    initial={{ x: -30, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <FiZap className="text-olive-600" />
                      </motion.div>
                      <span className="text-olive-600 font-bold tracking-[0.25em] uppercase text-xs">
                        {currentBanner.subtitle || "New Arrivals"}
                      </span>
                    </div>
                    <h1 
                      className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1] mb-6 tracking-tighter" 
                      dangerouslySetInnerHTML={{ __html: currentBanner.title }} 
                    />
                    <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed font-light max-w-xl">
                      {currentBanner.description}
                    </p>
                    <Link to={currentBanner.link || "/shop"} className="relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-olive-600 text-white rounded-full font-bold text-lg hover:bg-olive-700 hover:scale-105 transition-all duration-300 group shadow-[0_10px_40px_rgba(132,204,22,0.3)] overflow-hidden">
                      <span className="relative z-10 flex items-center gap-3">
                        Explore Collection <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-olive-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Fluid Progress Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-10 left-6 md:left-16 lg:left-24 z-30 flex gap-3">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className="relative h-2 rounded-full overflow-hidden transition-all duration-500 bg-black/10 backdrop-blur-md"
                  style={{ width: currentIndex === i ? '3rem' : '1rem' }}
                >
                  {currentIndex === i && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-olive-600 rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Category Scroll */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16 relative z-20">
        <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Shop by Category</h3>
        <div className="flex overflow-x-auto hide-scrollbar gap-5 md:gap-8 pb-8 snap-x snap-mandatory px-2">
          {loading ? (
             [1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 min-w-[100px]">
                <div className="w-24 h-24 rounded-[2rem] bg-white/60 backdrop-blur-md animate-pulse border border-white/40" />
                <div className="w-16 h-3 bg-white/60 rounded animate-pulse" />
              </div>
            ))
          ) : dynamicCategories.length > 0 ? dynamicCategories.map((cat, i) => (
            <Link 
              to={`/shop?category=${cat.slug || cat.name}`} 
              key={cat.id || i} 
              className="flex flex-col items-center gap-4 min-w-[110px] group snap-start"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white hover:border-olive-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(132,204,22,0.15)] flex items-center justify-center hover:-translate-y-3 transition-all duration-500 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-olive-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {cat.image ? (
                  <img src={cat.image} className="w-full h-full object-contain relative z-10 group-hover:scale-125 transition-transform duration-700" alt={cat.name} />
                ) : (
                  <FiCheckCircle size={36} className="text-gray-300 group-hover:text-olive-600 relative z-10 transition-colors" />
                )}
              </div>
              <span className="text-sm font-bold tracking-wide text-gray-600 group-hover:text-olive-700 text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          )) : null}
        </div>
      </section>

      {/* Massive Product Image Grid */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-24 relative z-20">
        <div className="flex justify-between items-end mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-white/80 backdrop-blur-md text-olive-600 rounded-[1.5rem] shadow-lg border border-white">
              <FiTrendingUp size={28} />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Trending Now</h2>
              <p className="text-lg text-gray-500 mt-1 font-light">Engineered for your journey</p>
            </div>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-olive-600 transition-colors bg-white/60 backdrop-blur-md px-6 py-3 rounded-full border border-white shadow-sm hover:shadow-md hover:-translate-y-1">
            View Full Collection <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {loading ? (
             [1, 2, 3, 4].map((_, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-5 border border-white h-[450px] animate-pulse">
                <div className="w-full h-2/3 bg-white/50 rounded-[2rem] mb-6" />
                <div className="w-3/4 h-5 bg-white/80 rounded mb-3" />
                <div className="w-1/2 h-5 bg-white/80 rounded" />
              </div>
             ))
          ) : products.slice(0, 8).map((product, idx) => (
            <motion.div 
              key={product._id || product.id || idx} 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="group bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-4 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(132,204,22,0.12)] hover:border-olive-200 transition-all duration-500 relative flex flex-col h-[480px] overflow-hidden"
            >
              {/* Product Badges */}
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                {product.discount && (
                  <span className="bg-olive-500/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <button className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-all shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:scale-110">
                <FiHeart size={20} />
              </button>

              {/* Massive Image Container */}
              <Link to={`/product/${product._id || product.id}`} className="block relative h-[65%] mb-5 bg-gradient-to-b from-transparent to-black/[0.02] rounded-[2rem] overflow-hidden group-hover:bg-olive-50/40 transition-colors">
                <motion.img 
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src={product.image || product.images?.[0] || FALLBACK_IMG} 
                  className="w-full h-full object-contain p-2 mix-blend-multiply drop-shadow-xl" 
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              <div className="flex flex-col flex-1 px-3">
                <div className="flex items-center gap-1 text-olive-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} className={i < 4 ? "fill-current" : "text-gray-300"} />
                  ))}
                </div>
                
                <Link to={`/product/${product._id || product.id}`}>
                  <h3 className="text-gray-900 font-bold mb-1 line-clamp-2 text-lg leading-tight group-hover:text-olive-600 transition-colors">
                    {product.name || "Premium Accessory"}
                  </h3>
                </Link>

                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    {product.oldPrice && (
                      <div className="text-xs text-gray-400 line-through mb-1">
                        ₹{Number(product.oldPrice).toLocaleString()}
                      </div>
                    )}
                    <div className="font-black text-2xl text-gray-900 tracking-tight">
                      ₹{Number(product.price || 999).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Fluid Add to Cart Button */}
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    className={`w-14 h-14 flex items-center justify-center rounded-[1.5rem] transition-all duration-300 shadow-sm ${
                      addedToCart[product._id || product.id] 
                      ? 'bg-olive-600 text-white scale-110 shadow-olive-500/40' 
                      : 'bg-white border border-gray-100 text-gray-900 hover:bg-olive-600 hover:border-olive-600 hover:text-white hover:-translate-y-1 hover:shadow-xl hover:shadow-olive-500/20'
                    }`}
                  >
                    {addedToCart[product._id || product.id] ? <FiCheckCircle size={24} /> : <FiShoppingCart size={24} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 md:hidden">
          <Link to="/shop" className="flex items-center justify-center w-full py-5 rounded-[2rem] border border-white text-gray-900 font-bold bg-white/60 backdrop-blur-xl shadow-lg active:scale-95 transition-transform">
            View All Products
          </Link>
        </div>
      </section>

      {/* Glassmorphic Value Proposition */}
      <div className="relative z-20 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="bg-white/50 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: <FiShield />, title: "Secure Checkout", desc: "256-bit encryption" },
                { icon: <FiTruck />, title: "Fast Delivery", desc: "Pan-India Priority" },
                { icon: <FiCheckCircle />, title: "Quality Assured", desc: "Tested for durability" },
                { icon: <FiHeadphones />, title: "24/7 Support", desc: "Expert assistance" }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-olive-600 text-2xl mb-5 shadow-sm border border-white/80 group-hover:scale-110 group-hover:shadow-olive-500/20 transition-all duration-300">
                    {item.icon}
                  </div>
                  <h5 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h5>
                  <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-olive-600/90 backdrop-blur-xl text-white p-4 rounded-full shadow-[0_10px_30px_rgba(132,204,22,0.4)] z-50 hover:bg-olive-700 hover:scale-110 transition-all"
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
