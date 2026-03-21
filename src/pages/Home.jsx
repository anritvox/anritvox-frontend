import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronLeft, FiChevronRight, FiStar, FiArrowRight, 
  FiShield, FiHeadphones, FiTruck, FiZap, FiChevronUp, 
  FiGrid, FiSearch, FiMenu, FiShoppingCart, FiPercent, FiCheckCircle
} from "react-icons/fi";

// Services & Context
import { fetchProducts, fetchActiveBanners, fetchCategories } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200";

const DEFAULT_BANNER = {
  imageUrl: FALLBACK_IMG,
  title: "MODERN <br /> <span class='text-olive-500'>CAR TECH</span>",
  subtitle: "ELITE SERIES",
  description: "Experience premium accessories engineered for the modern driver.",
  link: "/shop"
};

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
        setProducts(Array.isArray(p) ? p : []);
        setBanners(Array.isArray(b) && b.length > 0 ? b : [DEFAULT_BANNER]);
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

  const currentBanner = banners[currentIndex] || DEFAULT_BANNER;

  return (
    <div className="min-h-screen bg-alabaster bg-striped-olive font-sans text-gray-800 overflow-x-hidden relative">
      
      {/* Background Fluid Motion Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="fluid-blob top-[-10%] left-[-10%] animate-fluid-drift opacity-50" />
        <div className="fluid-blob bottom-[-10%] right-[-10%] animate-fluid-drift opacity-50" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Mobile Sticky Header */}
      <div className="sticky top-0 z-50 glass-light border-b border-olive-100 lg:hidden">
        <div className="flex items-center gap-4 p-4">
          <FiMenu size={24} className="text-olive-700" />
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search accessories..." 
              className="w-full bg-white/50 border border-olive-100 rounded-full py-2 px-10 text-sm focus:outline-none focus:border-olive-500" 
            />
            <FiSearch className="absolute left-4 top-2.5 text-olive-500" size={16} />
          </div>
          <Link to="/cart" className="relative text-olive-700">
            <FiShoppingCart size={24} />
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[75vh] lg:h-[85vh] overflow-hidden z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-alabaster via-alabaster/40 to-transparent z-10" />
            <img 
              src={currentBanner.image_url || currentBanner.imageUrl || FALLBACK_IMG} 
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover grayscale-[10%] opacity-90 transition-transform duration-[10s] scale-105"
            />
            
            <div className="relative z-20 max-w-7xl mx-auto px-8 w-full">
              <motion.div 
                initial={{ x: -50, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="text-olive-600 font-bold tracking-[0.4em] uppercase text-xs mb-4 block">
                  {currentBanner.subtitle || "Premium Exclusive"}
                </span>
                <h1 
                  className="text-5xl md:text-8xl font-black text-olive-800 leading-[0.9] mb-6" 
                  dangerouslySetInnerHTML={{ __html: currentBanner.title }} 
                />
                <p className="text-gray-600 max-w-lg mb-10 text-lg leading-relaxed hidden md:block">
                  {currentBanner.description}
                </p>
                <Link to={currentBanner.link || "/shop"} className="inline-flex items-center gap-4 px-10 py-5 bg-olive-500 text-white rounded-full font-bold hover:bg-olive-600 transition-all group shadow-xl hover:shadow-olive-200">
                  EXPLORE NOW <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Banner Navigation Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-10 left-8 z-30 flex gap-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === i ? "w-12 bg-olive-500" : "w-4 bg-olive-200"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {dynamicCategories.map((cat, i) => (
            <motion.div key={cat.id || i} whileHover={{ y: -10 }}>
              <Link to={`/shop?category=${cat.slug || cat.name}`} className="flex flex-col items-center gap-4 group">
                <div className="w-24 h-24 rounded-[2rem] glass-light border border-olive-50 flex items-center justify-center group-hover:bg-olive-500 group-hover:text-white group-hover:shadow-2xl transition-all duration-500">
                  {cat.image ? (
                    <img src={cat.image} className="w-12 h-12 object-contain" alt={cat.name} />
                  ) : (
                    <FiGrid size={28} />
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-700 text-center">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Products: The Olive Edition */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative z-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h2 className="text-olive-500 font-bold tracking-widest uppercase text-sm mb-2">Curated Selection</h2>
            <p className="text-4xl md:text-5xl font-black text-olive-900 leading-tight">THE OLIVE EDITION</p>
          </div>
          <Link to="/shop" className="text-olive-600 font-bold flex items-center gap-2 hover:gap-4 transition-all">
            VIEW ALL COLLECTIONS <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map((product) => (
            <motion.div 
              key={product._id || product.id} 
              layout 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group glass-light rounded-[3rem] p-6 hover:shadow-[0_30px_60px_-15px_rgba(60,70,30,0.15)] transition-all border border-transparent hover:border-olive-100"
            >
              <div className="aspect-square mb-8 overflow-hidden rounded-[2.5rem] bg-white relative">
                <img 
                  src={product.image || product.images?.[0] || FALLBACK_IMG} 
                  className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700" 
                  alt={product.name}
                />
                {product.discount && (
                  <div className="absolute top-4 left-4 bg-olive-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                    {product.discount}% OFF
                  </div>
                )}
              </div>

              <div className="px-2">
                <div className="flex items-center gap-1 text-olive-400 mb-2">
                  <FiStar size={12} fill="currentColor" />
                  <span className="text-[10px] font-bold text-gray-400">4.9 (120+ REVIEWS)</span>
                </div>
                <h3 className="text-olive-900 font-bold mb-4 line-clamp-1">{product.name}</h3>
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold line-through">₹{(product.price * 1.2).toFixed(0)}</span>
                    <span className="font-black text-xl text-olive-600">₹{Number(product.price).toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    className={`p-4 rounded-2xl transition-all duration-300 shadow-lg ${
                      addedToCart[product._id || product.id] 
                      ? 'bg-green-500 text-white' 
                      : 'bg-olive-800 text-white hover:bg-olive-500 hover:-translate-y-1'
                    }`}
                  >
                    {addedToCart[product._id || product.id] ? <FiCheckCircle size={20} /> : <FiShoppingCart size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-20">
        <div className="glass-light rounded-[4rem] p-12 grid grid-cols-2 lg:grid-cols-4 gap-12 border border-olive-50">
          {[
            { icon: <FiShield />, title: "SECURE ACCESS", desc: "ISO Certified" },
            { icon: <FiTruck />, title: "EXPRESS", desc: "Pan India Delivery" },
            { icon: <FiCheckCircle />, title: "VERIFIED", desc: "Tested for Heat" },
            { icon: <FiHeadphones />, title: "CONCIERGE", desc: "24/7 Priority" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4">
              <div className="text-olive-600 bg-olive-50 w-16 h-16 rounded-3xl flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <h5 className="font-black text-olive-900 text-xs tracking-widest">{item.title}</h5>
                <p className="text-sm text-gray-500 font-medium mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Scroll Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="fixed bottom-12 right-12 bg-olive-500 text-white p-5 rounded-[2rem] shadow-2xl z-50 hover:bg-olive-800 transition-colors"
          >
            <FiChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
