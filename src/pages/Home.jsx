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
    link: "/shop",
    position: "hero"
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]); 
  const [promoBanners, setPromoBanners] = useState([]); 
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
        setDynamicCategories(Array.isArray(c) ? c : []);

        // Filter Banners by Position
        const activeBanners = Array.isArray(b) && b.length > 0 ? b : DEFAULT_BANNERS;
        const heroes = activeBanners.filter(banner => banner.position === 'hero' || !banner.position);
        const promos = activeBanners.filter(banner => banner.position === 'promo');
        
        setHeroBanners(heroes.length > 0 ? heroes : DEFAULT_BANNERS);
        setPromoBanners(promos);

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
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const id = product._id || product.id;
    await addToCart(product, 1);
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
  };

  const currentBanner = heroBanners[currentIndex] || DEFAULT_BANNERS[0];

  return (
    <div className="min-h-screen bg-[#FDFDFB] font-sans text-gray-900 overflow-x-hidden relative selection:bg-olive-500 selection:text-white">
      
      {/* Refined Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center opacity-40">
        <div className="absolute w-[80vw] h-[80vw] rounded-full bg-olive-100/30 blur-[120px] -top-20 -left-20" />
        <div className="absolute w-[60vw] h-[60vw] rounded-full bg-gray-100/50 blur-[120px] bottom-0 right-0" />
      </div>

      {/* Glassmorphic Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 lg:hidden shadow-sm">
        <div className="flex items-center justify-between p-4 gap-4">
          <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <FiMenu size={24} className="text-gray-900" />
          </button>
          
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search Anritvox..." 
              className="w-full bg-gray-50 border-transparent focus:bg-white border focus:border-olive-500/30 focus:ring-2 focus:ring-olive-500/10 rounded-xl py-2.5 px-10 text-sm transition-all outline-none" 
            />
            <FiSearch className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-olive-600 transition-colors" size={18} />
          </div>

          <Link to="/cart" className="p-2 bg-white shadow-sm border border-gray-100 hover:border-olive-200 rounded-xl text-gray-900 transition-all relative">
            <FiShoppingCart size={22} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-olive-500 rounded-full border-2 border-white"></span>
          </Link>
        </div>
      </div>

      {/* Cinematic Professional Hero Section */}
      <div className="relative max-w-[1500px] mx-auto lg:mt-8 lg:px-8 z-10">
        <div className="relative w-full h-[60vh] lg:h-[70vh] rounded-none lg:rounded-tr-[5rem] lg:rounded-bl-[5rem] lg:rounded-tl-2xl lg:rounded-br-2xl overflow-hidden shadow-xl bg-gray-900">
          {loading ? (
             <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/60 to-transparent z-10 pointer-events-none" />
                
                <motion.img 
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 1.05 }}
                  transition={{ duration: 6, ease: "easeOut" }}
                  src={currentBanner.image_url || currentBanner.imageUrl || FALLBACK_IMG} 
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                
                <div className="relative z-20 w-full px-6 md:px-16 lg:px-24">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                    className="max-w-xl"
                  >
                    <div className="flex items-center gap-2 mb-6 border-l-2 border-olive-500 pl-3">
                      <span className="text-olive-400 font-semibold tracking-[0.2em] uppercase text-xs">
                        {currentBanner.subtitle || "New Arrivals"}
                      </span>
                    </div>
                    <h1 
                      className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight" 
                      dangerouslySetInnerHTML={{ __html: currentBanner.title }} 
                    />
                    <p className="text-gray-300 text-base md:text-lg mb-10 leading-relaxed font-light max-w-lg">
                      {currentBanner.description}
                    </p>
                    <Link to={currentBanner.link_url || currentBanner.link || "/shop"} className="inline-flex items-center gap-3 px-8 py-4 bg-olive-600 text-white rounded-tr-2xl rounded-bl-2xl rounded-tl-md rounded-br-md font-bold hover:bg-olive-500 transition-all duration-300 group shadow-lg shadow-olive-600/20">
                      Explore Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Minimalist Progress Indicators */}
          {heroBanners.length > 1 && (
            <div className="absolute bottom-8 left-6 md:left-16 lg:left-24 z-30 flex gap-2">
              {heroBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1 transition-all duration-300 ${currentIndex === i ? 'w-8 bg-olive-500' : 'w-4 bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Professional Category Scroll */}
      <section className="max-w-[1500px] mx-auto px-4 lg:px-8 py-16 relative z-20">
        <h3 className="text-xl font-bold text-gray-900 mb-8 lg:hidden">Shop by Category</h3>
        <div className="flex overflow-x-auto hide-scrollbar gap-6 pb-4 snap-x snap-mandatory">
          {loading ? (
             [1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 min-w-[100px]">
                <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          ) : dynamicCategories.length > 0 ? dynamicCategories.map((cat, i) => (
            <Link 
              to={`/shop?category=${cat.slug || cat.name}`} 
              key={cat.id || i} 
              className="flex flex-col items-center gap-4 min-w-[100px] group snap-start"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md group-hover:border-olive-200 transition-all duration-300 p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-olive-50/0 group-hover:bg-olive-50/50 transition-colors duration-300" />
                {cat.image ? (
                  <motion.img 
                    whileHover={{ scale: 1.1 }} 
                    transition={{ type: "spring", stiffness: 300 }}
                    src={cat.image} 
                    className="w-full h-full object-contain relative z-10" 
                    alt={cat.name} 
                  />
                ) : (
                  <FiCheckCircle size={28} className="text-gray-400 group-hover:text-olive-600 relative z-10 transition-colors" />
                )}
              </div>
              <span className="text-[12px] md:text-sm font-semibold tracking-wide text-gray-500 group-hover:text-gray-900 text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          )) : null}
        </div>
      </section>

      {/* Asymmetric Promo Banners */}
      {promoBanners.length > 0 && !loading && (
        <section className="max-w-[1500px] mx-auto px-4 lg:px-8 pb-16 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {promoBanners.map((promo, idx) => (
              <motion.div
                key={promo.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="relative rounded-tr-[4rem] rounded-bl-[4rem] rounded-tl-xl rounded-br-xl overflow-hidden shadow-lg group h-56 md:h-72 cursor-pointer bg-gray-900"
              >
                <Link to={promo.link_url || promo.link || "/shop"} className="block w-full h-full relative">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    src={promo.image_url || promo.imageUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 transition-opacity"
                    alt={promo.title || "Promo Banner"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/20 to-transparent flex flex-col justify-end p-8 md:p-10">
                    {promo.subtitle && <p className="text-olive-400 font-bold tracking-[0.15em] text-xs mb-2 uppercase">{promo.subtitle}</p>}
                    <h3 className="text-white text-2xl md:text-3xl font-black tracking-tight leading-tight" dangerouslySetInnerHTML={{ __html: promo.title }}></h3>
                    {promo.description && <p className="text-gray-300 text-sm mt-3 line-clamp-2 max-w-sm font-light">{promo.description}</p>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Unique Shape Product Grid */}
      <section className="max-w-[1500px] mx-auto px-4 lg:px-8 pb-24 relative z-20">
        <div className="flex justify-between items-end mb-10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-olive-500 rounded-full hidden md:block"></div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Trending Series</h2>
              <p className="text-sm md:text-base text-gray-500 mt-2 font-light">Engineered for absolute precision</p>
            </div>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-olive-600 transition-colors bg-white px-6 py-3 rounded-tr-xl rounded-bl-xl rounded-tl-md rounded-br-md border border-gray-200 shadow-sm hover:shadow-md">
            View Collection <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {loading ? (
             [1, 2, 3, 4, 5].map((_, idx) => (
              <div key={idx} className="bg-white rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl p-4 border border-gray-100 h-[320px] animate-pulse">
                <div className="w-full aspect-square bg-gray-100 rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-tl-lg rounded-br-lg mb-4" />
                <div className="w-3/4 h-4 bg-gray-200 rounded mb-3" />
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
              className="group bg-white p-4 md:p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-olive-200 transition-all duration-500 relative flex flex-col h-full overflow-hidden rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl"
            >
              {/* Product Badges */}
              <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                {product.discount && (
                  <span className="bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-tr-lg rounded-bl-lg rounded-tl-sm rounded-br-sm shadow-sm tracking-wide">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <button className="absolute top-5 right-5 z-10 p-2 text-gray-400 hover:text-red-500 transition-colors bg-white/50 rounded-full backdrop-blur-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                <FiHeart size={18} />
              </button>

              {/* Unique Shape Image Container */}
              <Link to={`/product/${product._id || product.id}`} className="block relative aspect-square mb-6 bg-gray-50 rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-tl-lg rounded-br-lg overflow-hidden group-hover:bg-olive-50/40 transition-colors">
                <motion.img 
                  whileHover={{ scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  src={product.image || product.images?.[0] || FALLBACK_IMG} 
                  className="w-full h-full object-contain p-8 mix-blend-multiply drop-shadow-sm" 
                  alt={product.name}
                  loading="lazy"
                />
              </Link>

              <div className="flex flex-col flex-1 px-2">
                <div className="flex items-center gap-1 text-olive-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={10} className={i < 4 ? "fill-current" : "text-gray-200"} />
                  ))}
                  <span className="text-[10px] font-medium text-gray-400 ml-1">(12)</span>
                </div>
                
                <Link to={`/product/${product._id || product.id}`}>
                  <h3 className="text-gray-900 font-semibold mb-1 line-clamp-2 text-sm md:text-base group-hover:text-olive-600 transition-colors leading-snug">
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
                  
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleAddToCart(e, product)} 
                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-tr-xl rounded-bl-xl rounded-tl-md rounded-br-md transition-all duration-300 shadow-sm ${
                      addedToCart[product._id || product.id] 
                      ? 'bg-olive-600 text-white' 
                      : 'bg-gray-50 border border-gray-100 text-gray-900 hover:bg-gray-900 hover:border-gray-900 hover:text-white'
                    }`}
                  >
                    {addedToCart[product._id || product.id] ? <FiCheckCircle size={18} /> : <FiShoppingCart size={18} />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 md:hidden">
          <Link to="/shop" className="flex items-center justify-center w-full py-4 rounded-tr-2xl rounded-bl-2xl rounded-tl-md rounded-br-md border border-gray-200 text-gray-900 font-bold bg-white shadow-sm active:scale-95 transition-transform">
            View All Products
          </Link>
        </div>
      </section>

      {/* Professional Trust & Value Proposition */}
      <div className="border-t border-gray-200/50 bg-white relative z-20">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8 py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-x-0 lg:divide-x divide-gray-100">
            {[
              { icon: <FiShield />, title: "Secure Checkout", desc: "Enterprise-grade encryption" },
              { icon: <FiTruck />, title: "Express Delivery", desc: "Pan-India premium shipping" },
              { icon: <FiCheckCircle />, title: "Quality Assured", desc: "Rigorous durability testing" },
              { icon: <FiHeadphones />, title: "Dedicated Support", desc: "24/7 expert assistance" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center text-center ${i !== 0 ? 'lg:pl-8' : ''}`}
              >
                <div className="w-14 h-14 bg-gray-50 rounded-tr-xl rounded-bl-xl rounded-tl-md rounded-br-md flex items-center justify-center text-olive-600 text-2xl mb-6 shadow-sm border border-gray-100">
                  {item.icon}
                </div>
                <h5 className="font-bold text-gray-900 mb-2 tracking-tight">{item.title}</h5>
                <p className="text-sm text-gray-500 font-light">{item.desc}</p>
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
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-gray-900 text-white p-4 rounded-tr-2xl rounded-bl-2xl rounded-tl-md rounded-br-md shadow-2xl z-50 hover:bg-olive-600 transition-colors"
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
