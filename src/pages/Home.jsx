import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchActiveBanners, fetchCategories } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { 
  FiChevronLeft as ChevronLeft, 
  FiChevronRight as ChevronRight, 
  FiStar as Star, 
  FiArrowRight as ArrowRight, 
  FiShield as ShieldCheck, 
  FiHeadphones as Headphones, 
  FiTruck as Truck, 
  FiZap as Zap, 
  FiChevronUp as ChevronUp, 
  FiCheckCircle as CheckCircle2, 
  FiGrid as LayoutGrid, 
  FiSearch as Search, 
  FiMenu as Menu, 
  FiUser as User, 
  FiShoppingCart as ShoppingCart 
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200";

const DEFAULT_BANNER = {
  imageUrl: FALLBACK_IMG,
  title: "THE FUTURE OF <br /> <span class='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300'>AUTOMOTIVE TECH</span>",
  description: "Experience absolute acoustic perfection engineered specifically for your vehicle.",
  subtitle: "S E R I E S   O N E",
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { addToCart = () => console.warn("Cart Provider missing") } = useCart() || {};
  const { settings = {} } = useSettings() || {}; 

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true); 
        const [productsData, bannersData, categoriesData] = await Promise.all([
          fetchProducts().catch(() => []),
          fetchActiveBanners().catch(() => []),
          fetchCategories().catch(() => [])
        ]);
        
        setProducts(Array.isArray(productsData) ? productsData : []);
        setBanners(Array.isArray(bannersData) ? bannersData : []);
        setDynamicCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error("Failed to fetch initial home data:", err);
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
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]); 

  const nextHero = () => { if (banners.length > 1) setCurrentIndex((prev) => (prev + 1) % banners.length); };
  const prevHero = () => { if (banners.length > 1) setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const currentBanner = banners.length > 0 ? banners[currentIndex] : DEFAULT_BANNER;

  return (
    <div className="min-h-screen bg-[#030508] font-sans text-gray-200 overflow-x-hidden selection:bg-blue-500/30 selection:text-white">
      
      {/* Premium Mobile Header */}
      <div className="sticky top-0 z-50 bg-[#030508]/80 backdrop-blur-xl border-b border-white/5 lg:hidden">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-300 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex-1 relative group">
            <input 
              type="text" 
              placeholder="Search registry..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono placeholder:text-gray-600"
            />
            <Search className="absolute left-4 top-3 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
          </div>
          <Link to="/cart" className="p-2 relative text-gray-300 hover:text-white transition-colors">
            <ShoppingCart size={24} />
            <span className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">0</span>
          </Link>
        </div>
      </div>

      {/* Ultra-Minimal Desktop Highlight */}
      <div className="hidden lg:block bg-[#000000] border-b border-white/5 text-gray-400 py-2.5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.2em]">
          <div className="flex gap-8">
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
              <Truck size={14} className="text-blue-500" /> 
              Complimentary Shipping Over ₹{settings?.free_shipping_threshold || "4999"}
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
              <ShieldCheck size={14} className="text-blue-500" /> 
              24-Month Global Warranty
            </span>
          </div>
          <div className="flex gap-6">
            <Link to="/support" className="hover:text-white transition-colors">Concierge</Link>
            <Link to="/track-order" className="hover:text-white transition-colors">Locate Order</Link>
          </div>
        </div>
      </div>

      {/* Cinematic Hero Engine */}
      <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[85vh] bg-[#000000] overflow-hidden group border-b border-white/10">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 border-[3px] border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-[#030508]/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030508]/90 via-[#030508]/20 to-transparent z-10" />
                
                <img 
                  src={currentBanner.image_url || currentBanner.image || currentBanner.imageUrl || DEFAULT_BANNER.imageUrl} 
                  alt={currentBanner.title || `Promotion`}
                  className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.1]"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; e.currentTarget.onerror = null; }}
                />
                
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-24 max-w-7xl mx-auto">
                  <div className="max-w-3xl space-y-6">
                    <motion.div 
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="flex items-center gap-4"
                    >
                      <div className="h-[1px] w-12 bg-blue-500"></div>
                      <span className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-400">
                        {currentBanner.subtitle || "Premium Exclusive"}
                      </span>
                    </motion.div>
                    
                    <motion.h1 
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white"
                    >
                      {currentBanner.title ? (
                        <span dangerouslySetInnerHTML={{ __html: String(currentBanner.title).replace(/\n/g, "<br />") }} />
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: DEFAULT_BANNER.title }} />
                      )}
                    </motion.h1>
                    
                    <motion.p 
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                      className="text-lg md:text-xl text-gray-400 max-w-xl font-light leading-relaxed"
                    >
                      {currentBanner.description || DEFAULT_BANNER.description}
                    </motion.p>
                    
                    <motion.div 
                       initial={{ y: 30, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.9, duration: 0.8 }}
                       className="pt-8"
                    >
                      <Link to={currentBanner.link_url || currentBanner.link || "/shop"} className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-500 bg-white/5 border border-white/20 rounded-full hover:bg-white hover:text-black overflow-hidden">
                        <span className="relative z-10 tracking-widest text-xs uppercase flex items-center gap-3">
                          Explore Collection <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {banners.length > 1 && (
              <div className="absolute bottom-12 right-12 z-30 hidden lg:flex items-center gap-6">
                <div className="flex gap-2">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => setCurrentIndex(i)} className={`h-[2px] transition-all duration-500 ${currentIndex === i ? "w-12 bg-blue-500" : "w-6 bg-white/20"}`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={prevHero} className="p-4 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextHero} className="p-4 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition-all backdrop-blur-md">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Glassmorphic Category Matrix */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex lg:grid lg:grid-cols-6 gap-6 overflow-x-auto scrollbar-hide pb-4">
          {!loading && dynamicCategories.length === 0 && (
            <div className="col-span-full text-center text-gray-500 font-mono text-sm py-8">
              System awaits category initialization.
            </div>
          )}
          
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 animate-pulse min-w-[100px]">
                <div className="bg-white/5 border border-white/5 w-24 h-24 rounded-full"></div>
                <div className="bg-white/10 h-3 w-16 rounded-full"></div>
              </div>
            ))
          ) : (
            dynamicCategories.map((cat) => (
              <Link key={cat._id || cat.id} to={`/shop?category=${cat.slug || cat.name}`} className="group flex flex-col items-center gap-5 min-w-[120px] lg:min-w-0 cursor-pointer">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-[1px] group-hover:border-blue-500/50 transition-colors duration-500">
                  <div className="w-full h-full rounded-full bg-[#030508] flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    {cat.image || cat.icon ? (
                      <img src={cat.image || cat.icon} alt={cat.name} className="w-12 h-12 object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500 relative z-10" />
                    ) : (
                      <LayoutGrid size={28} className="text-gray-400 group-hover:text-white transition-colors relative z-10" />
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{cat.name}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Premium Product Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-black tracking-[0.3em] uppercase text-blue-500 flex items-center gap-3">
              <Zap size={16} /> Signature Collection
            </h2>
            <p className="text-3xl md:text-5xl font-black text-white tracking-tighter">Engineered for <br/>Excellence.</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors pb-2 border-b border-white/10 hover:border-white">
            View Complete Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-3xl h-[400px] animate-pulse border border-white/5"></div>
            ))
          ) : products.length === 0 ? (
             <div className="col-span-full text-center text-gray-600 font-mono py-20">
               Inventory scan complete. 0 products found.
             </div>
          ) : (
            products.slice(0, 8).map((product) => (
              <Link
                key={product._id || product.id}
                to={`/product/${product._id || product.id}`}
                className="group relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10 rounded-[2rem] p-6 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all duration-500 flex flex-col"
              >
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                  <span className="bg-white text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    New Era
                  </span>
                </div>

                <div className="aspect-square relative flex items-center justify-center overflow-hidden mb-8">
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-full blur-3xl transition-opacity duration-700"></div>
                  <img 
                    src={product.image || product.images?.[0] || FALLBACK_IMG} 
                    alt={product.name}
                    className="w-4/5 h-4/5 object-contain filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:rotate-[-2deg] transition-all duration-700 relative z-10"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; e.currentTarget.onerror = null; }}
                  />
                </div>
                
                <div className="flex flex-col flex-grow justify-end space-y-4">
                  <div>
                    <h3 className="text-white font-medium text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-mono font-bold text-white">₹{Number(product.price).toLocaleString()}</span>
                      <span className="text-xs font-mono text-gray-600 line-through">₹{(product.price * 1.3).toFixed(0)}</span>
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.preventDefault(); e.stopPropagation();
                      const id = product._id || product.id;
                      await addToCart(product, 1);
                      setAddedToCart(prev => ({ ...prev, [id]: true }));
                      setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
                    }}
                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${addedToCart[product._id || product.id] ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-transparent border-white/20 text-white hover:bg-white hover:text-black'}`}
                  >
                    {addedToCart[product._id || product.id] ? 'Acquired ✓' : 'Add to Setup'}
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Editorial Tech Banners */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { title: "Quantum Display", subtitle: "QLED Infotainment", img: "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?auto=format&fit=crop&q=80&w=1200" },
            { title: "Acoustic Purity", subtitle: "Studio-Grade Audio", img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=1200" }
          ].map((banner, i) => (
            <div key={i} className="group relative h-[400px] rounded-[2rem] overflow-hidden bg-[#0a0c10] border border-white/5">
              <img src={banner.img} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000 filter grayscale group-hover:grayscale-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="relative z-10 h-full flex flex-col justify-end p-10">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-blue-400 mb-2">{banner.subtitle}</span>
                <h4 className="text-4xl font-black text-white mb-6 tracking-tight">{banner.title}</h4>
                <Link to="/shop" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <ArrowRight size={20} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectured Trust Matrix */}
      <div className="border-t border-white/5 mt-10 py-20 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: <ShieldCheck size={32} />, title: "Enterprise Security", desc: "Military-grade encryption on all transactions." },
            { icon: <Truck size={32} />, title: "Global Logistics", desc: "Insured, tracked, and expedited delivery." },
            { icon: <CheckCircle2 size={32} />, title: "Rigorous QA", desc: "Tested under extreme thermal conditions." },
            { icon: <Headphones size={32} />, title: "Elite Support", desc: "Direct line to our acoustic engineers." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col space-y-4">
              <div className="text-white opacity-80">{item.icon}</div>
              <h5 className="font-bold text-white text-lg tracking-wide">{item.title}</h5>
              <p className="text-sm text-gray-500 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-24 lg:bottom-12 right-6 lg:right-12 bg-white/10 backdrop-blur-xl border border-white/20 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-white hover:text-black transition-all duration-500"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Mobile Footer App Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-4 z-50 pb-safe">
        <Link to="/" className="flex flex-col items-center gap-1.5 text-white">
          <Zap size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Explore</span>
        </Link>
        <Link to="/shop" className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
          <LayoutGrid size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Catalog</span>
        </Link>
        <Link to="/account" className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-white transition-colors">
          <User size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
        </Link>
      </div>
    </div>
  );
}
