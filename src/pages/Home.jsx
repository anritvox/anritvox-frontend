import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchActiveBanners, fetchCategories } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { 
  FiChevronLeft, FiChevronRight, FiStar, FiArrowRight, 
  FiShield, FiHeadphones, FiTruck, FiZap, FiChevronUp, 
  FiGrid, FiSearch, FiMenu, FiShoppingCart 
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200";

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
        setBanners(Array.isArray(b) ? b : []);
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

  const currentBanner = banners[currentIndex] || { imageUrl: FALLBACK_IMG, title: "Modern Automotive", subtitle: "Elite Series" };

  return (
    <div className="min-h-screen bg-alabaster bg-striped-olive font-sans text-gray-800">
      
      <div className="fluid-blob top-[-10%] left-[-10%] animate-fluid-drift" />
      <div className="fluid-blob bottom-[-10%] right-[-10%] animate-fluid-drift" style={{ animationDelay: '-5s' }} />

      <div className="sticky top-0 z-50 glass-light border-b border-olive-100 lg:hidden">
        <div className="flex items-center gap-4 p-4">
          <FiMenu size={24} className="text-olive-700" />
          <div className="flex-1 relative">
            <input type="text" placeholder="Search..." className="w-full bg-white/50 border border-olive-100 rounded-full py-2 px-10 text-sm focus:outline-none focus:border-olive-500" />
            <FiSearch className="absolute left-4 top-2.5 text-olive-500" size={16} />
          </div>
          <Link to="/cart" className="relative text-olive-700">
            <FiShoppingCart size={24} />
          </Link>
        </div>
      </div>

      <div className="relative w-full h-[70vh] lg:h-[85vh] overflow-hidden">
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
              className="absolute inset-0 w-full h-full object-cover grayscale-[20%] opacity-90"
            />
            
            <div className="relative z-20 max-w-7xl mx-auto px-8 w-full">
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <span className="text-olive-600 font-bold tracking-[0.4em] uppercase text-xs">{currentBanner.subtitle}</span>
                <h1 className="text-6xl md:text-8xl font-black text-olive-800 leading-none mt-4 mb-8" dangerouslySetInnerHTML={{ __html: currentBanner.title }} />
                <Link to="/shop" className="inline-flex items-center gap-4 px-8 py-4 bg-olive-500 text-white rounded-full font-bold hover:bg-olive-600 transition-all group">
                  EXPLORE <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {dynamicCategories.map((cat, i) => (
            <motion.div key={cat.id || i} whileHover={{ y: -10 }}>
              <Link to={`/shop?category=${cat.slug}`} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 rounded-2xl glass-light flex items-center justify-center group-hover:bg-olive-500 group-hover:text-white transition-all duration-500">
                  <FiGrid size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-olive-700">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-12 relative z-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-olive-500 font-bold tracking-widest uppercase text-sm mb-2">Curated Selection</h2>
            <p className="text-4xl font-black text-olive-800">The Olive Edition</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.slice(0, 8).map((product) => (
            <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-light rounded-[2.5rem] p-6 hover:shadow-2xl transition-all">
              <div className="aspect-square mb-6 overflow-hidden rounded-3xl bg-white">
                <img src={product.image || FALLBACK_IMG} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-olive-800 font-bold mb-2">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-olive-600">₹{product.price}</span>
                <button onClick={() => addToCart(product, 1)} className="p-3 bg-olive-500 text-white rounded-xl hover:bg-olive-600 transition-colors">
                  <FiShoppingCart />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-12 right-12 bg-olive-500 text-white p-4 rounded-full shadow-lg z-50">
          <FiChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
