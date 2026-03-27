import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, FiMenu, FiShoppingCart, FiArrowRight, 
  FiShield, FiTruck, FiHeadphones, FiCheckCircle, 
  FiStar, FiChevronUp, FiHeart, FiZap, FiSpeaker, FiCrosshair
} from "react-icons/fi";

// Services & Context
import { fetchProducts } from "../services/api";
import { useCart } from "../context/CartContext";

// Premium Automotive Imagery Fallbacks
const HERO_IMG = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80";
const AUDIO_IMG = "https://images.unsplash.com/photo-1545127398-14699f92334b?auto=format&fit=crop&w=800&q=80";
const LIGHTING_IMG = "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=800&q=80";
const INTERIOR_IMG = "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80";
const PERFORMANCE_IMG = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80";
const GENERIC_PART_IMG = "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80";

// FIXED, FUNCTIONAL CATEGORIES
const FIXED_CATEGORIES = [
  { name: "Premium Audio", slug: "audio", image: AUDIO_IMG },
  { name: "Custom Lighting", slug: "lighting", image: LIGHTING_IMG },
  { name: "Interior Mods", slug: "interior", image: INTERIOR_IMG },
  { name: "Performance", slug: "performance", image: PERFORMANCE_IMG },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // State for the Flying Cart Animation
  const [flyingItem, setFlyingItem] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true); 
        // We only fetch products now. Banners and Categories are hardcoded for Beast Mode.
        const p = await fetchProducts();
        setProducts(Array.isArray(p) ? p : []);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
    
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); 

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 1. Capture exact click coordinates for the flying animation
    const rect = e.currentTarget.getBoundingClientRect();
    const id = product._id || product.id;
    const imgSrc = product.image || product.images?.[0] || GENERIC_PART_IMG;

    // 2. Trigger the Flying Image UI
    setFlyingItem({
      id: Date.now(), 
      startX: rect.left,
      startY: rect.top,
      img: imgSrc
    });

    // 3. Actually add to the React Context/Database Cart
    try {
      await addToCart(product, 1);
      setAddedToCart(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error("Cart add failed", err);
    }
    
    // 4. Cleanup UI states
    setTimeout(() => setFlyingItem(null), 800);
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 overflow-x-hidden relative selection:bg-olive-500 selection:text-white">
      
      {/* 🌪️ FLUID DYNAMIC BACKGROUND BLOBS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80vw] h-[80vw] rounded-full bg-olive-500/10 blur-[120px] -top-40 -left-20 mix-blend-multiply" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-[120px] bottom-0 right-0 mix-blend-multiply" 
        />
      </div>

      {/* 🛒 FLYING CART ANIMATION OVERLAY */}
      <AnimatePresence>
        {flyingItem && (
          <motion.img
            key={flyingItem.id}
            src={flyingItem.img}
            initial={{ position: 'fixed', left: flyingItem.startX, top: flyingItem.startY, scale: 1, opacity: 1, zIndex: 9999, borderRadius: '20%' }}
            animate={{ left: window.innerWidth - (window.innerWidth < 1024 ? 60 : 100), top: 20, scale: 0.1, opacity: 0.2, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }} 
            className="w-20 h-20 object-cover shadow-2xl pointer-events-none border-2 border-olive-500"
          />
        )}
      </AnimatePresence>

      {/* 📱 Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 lg:hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between p-4 gap-4">
          <button className="p-2 hover:bg-olive-50 rounded-2xl transition-colors">
            <FiMenu size={24} className="text-gray-800" />
          </button>
          
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search accessories..." 
              className="w-full bg-white/60 backdrop-blur-sm border border-white focus:bg-white focus:border-olive-500/50 focus:ring-4 focus:ring-olive-500/10 rounded-2xl py-2.5 px-10 text-sm transition-all outline-none shadow-sm" 
            />
            <FiSearch className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-olive-500 transition-colors" size={18} />
          </div>

          <Link to="/cart" className="p-2 bg-white backdrop-blur-md shadow-sm border border-white hover:border-olive-200 rounded-2xl text-gray-800 transition-all relative">
            <FiShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-olive-500 rounded-full border-2 border-white animate-pulse"></span>
          </Link>
        </div>
      </div>

      {/* 🔥 STATIC BEAST MODE HERO SECTION */}
      <div className="relative max-w-[1600px] mx-auto lg:mt-6 lg:px-6 z-10">
        <div className="relative w-full h-[70vh] lg:h-[80vh] lg:rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-3xl border border-white/80 shadow-2xl shadow-olive-900/10 flex items-center">
          
          {/* Beast Image Layer */}
          <div className="absolute inset-0 lg:left-[20%] z-0">
            <img 
              src={HERO_IMG} 
              alt="Beast Mode"
              className="w-full h-full object-cover opacity-90"
            />
          </div>
          
          {/* Olive/White Glass Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:via-white/50 z-10 backdrop-blur-[4px]" />
          
          <div className="relative z-20 w-full px-6 md:px-16 lg:px-24 max-w-4xl">
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, type: "spring" }}>
              <div className="flex items-center gap-2 mb-6">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
                  <FiCrosshair className="text-olive-600 h-6 w-6" />
                </motion.div>
                <span className="text-olive-600 font-black tracking-[0.3em] uppercase text-sm">
                  Beast Mode Activated
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-[7.5rem] font-black text-gray-900 leading-[0.95] mb-8 tracking-tighter">
                UNLEASH <br/> THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-600 to-emerald-400">BEAST.</span>
              </h1>
              <p className="text-gray-700 text-xl md:text-2xl mb-12 leading-relaxed font-medium max-w-2xl">
                Transform your vehicle with competition-grade audio, aggressive lighting, and elite interior modifications.
              </p>
              <Link to="/shop" className="relative inline-flex items-center justify-center gap-3 px-14 py-6 bg-gray-900 text-white rounded-full font-black text-xl hover:bg-olive-600 hover:scale-[1.02] transition-all duration-300 group shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(132,204,22,0.4)] overflow-hidden">
                <span className="relative z-10 flex items-center gap-3">
                  Shop The Collection <FiArrowRight className="group-hover:translate-x-2 transition-transform h-6 w-6" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 🚀 FUNCTIONAL HARDCODED CATEGORIES */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-20 relative z-20">
        <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight flex items-center gap-3">
          <FiZap className="text-olive-500" /> Upgrade By Category
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {FIXED_CATEGORIES.map((cat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/shop?category=${cat.slug}`)}
              className="group cursor-pointer rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white hover:border-olive-300 shadow-lg hover:shadow-2xl hover:shadow-olive-500/20 overflow-hidden relative aspect-[4/5] flex items-end p-6 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 z-0">
                <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" alt={cat.name} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
              <div className="relative z-20 w-full transform group-hover:translate-y-[-10px] transition-transform duration-500">
                <h4 className="text-white font-black text-2xl md:text-3xl mb-1">{cat.name}</h4>
                <div className="flex items-center gap-2 text-olive-400 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Explore Parts <FiArrowRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🏎️ THE BEAST PRODUCT GRID */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-24 relative z-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">Elite Hardware</h2>
            <p className="text-xl text-gray-500 mt-2 font-medium">Top-rated performance accessories</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-lg font-bold text-olive-600 hover:text-olive-700 transition-colors">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
             [1, 2, 3, 4].map((_, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-5 border border-white h-[500px] animate-pulse">
                <div className="w-full h-[60%] bg-white/80 rounded-[2rem] mb-6" />
                <div className="w-3/4 h-6 bg-white/80 rounded mb-4" />
                <div className="w-1/2 h-6 bg-white/80 rounded" />
              </div>
             ))
          ) : products.slice(0, 8).map((product, idx) => (
            <motion.div 
              key={product._id || product.id || idx} 
              initial={{ opacity: 0, scale: 0.95 }} 
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-4 border border-white shadow-xl hover:shadow-[0_40px_80px_rgba(132,204,22,0.15)] hover:border-olive-200 transition-all duration-500 flex flex-col h-[520px] overflow-hidden"
            >
              <div className="absolute top-6 left-6 z-10">
                {product.discount && (
                  <span className="bg-gray-900 text-olive-400 text-xs font-black px-4 py-2 rounded-full shadow-lg tracking-widest uppercase">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <button className="absolute top-6 right-6 z-10 p-4 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:scale-110">
                <FiHeart size={22} />
              </button>

              {/* Massive Auto Part Image */}
              <Link to={`/product/${product._id || product.id}`} className="block relative h-[60%] mb-6 bg-gray-50 rounded-[2rem] overflow-hidden group-hover:bg-olive-50/50 transition-colors">
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  src={product.image || product.images?.[0] || GENERIC_PART_IMG} 
                  className="w-full h-full object-cover mix-blend-multiply drop-shadow-2xl" 
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              <div className="flex flex-col flex-1 px-4">
                <Link to={`/product/${product._id || product.id}`}>
                  <h3 className="text-gray-900 font-black mb-2 line-clamp-2 text-xl leading-tight group-hover:text-olive-600 transition-colors">
                    {product.name || "Beast Auto Accessory"}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 text-olive-500 mb-auto">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={16} className={i < 4 ? "fill-current" : "text-gray-300"} />
                  ))}
                  <span className="text-gray-400 font-bold text-sm ml-2">4.8</span>
                </div>

                <div className="pt-6 flex items-end justify-between border-t border-gray-100 mt-4">
                  <div>
                    {product.oldPrice && (
                      <div className="text-sm text-gray-400 line-through mb-1 font-bold">
                        ₹{Number(product.oldPrice).toLocaleString()}
                      </div>
                    )}
                    <div className="font-black text-3xl text-gray-900 tracking-tighter">
                      ₹{Number(product.price || 999).toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Flawless Add To Cart Trigger */}
                  <button 
                    onClick={(e) => handleAddToCart(e, product)} 
                    className={`w-16 h-16 flex items-center justify-center rounded-[1.5rem] transition-all duration-300 shadow-md ${
                      addedToCart[product._id || product.id] 
                      ? 'bg-olive-600 text-white scale-110 shadow-olive-500/40' 
                      : 'bg-gray-900 text-white hover:bg-olive-600 hover:-translate-y-2 hover:shadow-xl hover:shadow-olive-500/30'
                    }`}
                  >
                    {addedToCart[product._id || product.id] ? <FiCheckCircle size={28} /> : <FiShoppingCart size={28} />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Value Proposition */}
      <div className="relative z-20 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-white shadow-2xl p-10 lg:p-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
              {[
                { icon: <FiShield />, title: "Secure Checkout", desc: "256-bit AES encryption" },
                { icon: <FiTruck />, title: "Express Delivery", desc: "Pan-India Priority" },
                { icon: <FiCheckCircle />, title: "Quality Assured", desc: "Tested for durability" },
                { icon: <FiHeadphones />, title: "24/7 Support", desc: "Expert automotive help" }
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-olive-600 text-3xl mb-6 shadow-inner border border-white group-hover:scale-110 group-hover:bg-olive-50 transition-all duration-300">
                    {item.icon}
                  </div>
                  <h5 className="font-black text-gray-900 mb-2 text-xl">{item.title}</h5>
                  <p className="text-base text-gray-500 font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 50 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
            className="fixed bottom-8 right-8 lg:bottom-12 lg:right-12 bg-gray-900 text-white p-5 rounded-full shadow-2xl z-50 hover:bg-olive-600 hover:scale-110 transition-all border-2 border-white/10"
          >
            <FiChevronUp size={28} />
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
