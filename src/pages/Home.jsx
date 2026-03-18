import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, fetchActiveBanners, fetchCategories } from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { 
  ChevronLeft, ChevronRight, Star, ArrowRight, ShieldCheck, 
  Headphones, Truck, Zap, Globe, ChevronUp, Flame, 
  CheckCircle2, Cpu, Smartphone, LayoutGrid, Search, 
  Menu, User, ShoppingCart, Percent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200";

// Default Fallback Banner if the database is empty
const DEFAULT_BANNER = {
  imageUrl: FALLBACK_IMG,
  title: "THE FUTURE OF <br /> <span class='text-blue-400'>CAR TECH</span>",
  description: "Experience premium accessories engineered specifically for your needs.",
  subtitle: "Premium Exclusive",
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

  const { addToCart } = useCart();
  const { settings } = useSettings(); 

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true); 
        const [productsData, bannersData, categoriesData] = await Promise.all([
          fetchProducts().catch(() => []), // Fails safely to empty array
          fetchActiveBanners().catch(() => []),
          fetchCategories().catch(() => [])
        ]);
        
        setProducts(Array.is'hero'Array(productsData) ? productsData : []);
        setBanners(Array.isArray(bannersData) ? bannersData : []);
        setDynamicCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
      } catch (err) {
        console.error("Failed to fetch initial home data:", err);
      } finally {
        setLoading(false); // This STOPS the spinner
      }
    };

    loadInitialData();

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); 

  // Slider rotation effect
  useEffect(() => {
    if (banners.length <= 1) return; // Don't slide if 0 or 1 banner exists
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]); 

  const nextHero = () => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };
  
  const prevHero = () => {
    if (banners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Use the loaded banner, or the default fallback if database is empty
  const currentBanner = banners.length > 0 ? banners[currentIndex] : DEFAULT_BANNER;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      {/* Mobile-Friendly Search Bar */}
      <div className="sticky top-0 z-50 bg-white shadow-md lg:hidden">
        <div className="flex items-center gap-3 p-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            <Menu size={24} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <Link to="/cart" className="p-2 relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </Link>
        </div>
      </div>

      {/* Desktop Navigation Highlights */}
      <div className="hidden lg:block bg-blue-700 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm font-medium">
          <div className="flex gap-6">
            <span className="flex items-center gap-1">
              <Truck size={14} /> 
              Free Shipping Over ₹{settings?.free_shipping_threshold || "4999"}
            </span>
            <span className="flex items-center gap-1"><ShieldCheck size={14} /> 2 Year Warranty</span>
          </div>
          <div className="flex gap-4">
            <Link to="/support" className="hover:underline">Support</Link>
            <Link to="/track-order" className="hover:underline">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Dynamic Hero Section */}
      <div className="relative w-full h-[300px] md:h-[500px] lg:h-[600px] bg-gray-200 overflow-hidden group">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <img 
                  src={currentBanner.image_url || currentBanner.image || currentBanner.imageUrl || DEFAULT_BANNER.imageUrl} 
                  alt={currentBanner.title || `Promotion`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; e.currentTarget.onerror = null; }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex items-center px-6 md:px-20">
                  <div className="max-w-2xl text-white space-y-4">
                    <motion.span 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="inline-block bg-blue-600 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                    >
                      {currentBanner.subtitle || "Premium Exclusive"}
                    </motion.span>
                    <motion.h1 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-6xl font-black leading-tight"
                    >
                      {currentBanner.title ? (
                        <span dangerouslySetInnerHTML={{ __html: String(currentBanner.title).replace(/\n/g, "<br />") }} />
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: DEFAULT_BANNER.title }} />
                      )}
                    </motion.h1>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg md:text-xl text-gray-200 max-w-lg"
                    >
                      {currentBanner.description || DEFAULT_BANNER.description}
                    </motion.p>
                    <motion.div 
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       transition={{ delay: 0.4 }}
                       className="flex gap-4 pt-4"
                    >
                      <Link to={currentBanner.link_url || currentBanner.link || "/shop"} className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">Shop Now</Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {banners.length > 1 && (
              <>
                <button onClick={prevHero} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-md transition-all hidden group-hover:block">
                  <ChevronLeft className="text-white" size={32} />
                </button>
                <button onClick={nextHero} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-md transition-all hidden group-hover:block">
                  <ChevronRight className="text-white" size={32} />
                </button>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? "w-10 bg-blue-500" : "w-2 bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Dynamic Categories */}
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto scrollbar-hide">
        <div className="flex lg:grid lg:grid-cols-6 gap-6 min-w-max lg:min-w-0">
          {!loading && dynamicCategories.length === 0 && (
            <div className="col-span-full text-center text-gray-500 font-medium w-full py-4">
              Categories will appear here once added in the Admin Panel.
            </div>
          )}
          
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                <div className="bg-gray-200 w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-sm"></div>
                <div className="bg-gray-200 h-4 w-16 rounded"></div>
              </div>
            ))
          ) : (
            dynamicCategories.map((cat) => (
              <Link 
                key={cat._id || cat.id} 
                to={`/shop?category=${cat.slug || cat.name}`} 
                className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
              >
                <div className={`bg-blue-500 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform overflow-hidden`}>
                  {cat.image || cat.icon ? (
                    <img src={cat.image || cat.icon} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <LayoutGrid size={32} />
                  )}
                </div>
                <span className="text-sm font-bold text-gray-700">{cat.name}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              <Flame className="text-orange-500 fill-orange-500" /> DEALS OF THE DAY
            </h2>
            <p className="text-gray-500 text-sm font-medium">Top picks hand-curated for you</p>
          </div>
          <Link to="/shop" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">View All</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 shadow-sm"></div>
            ))
          ) : products.length === 0 ? (
             <div className="col-span-full text-center text-gray-500 font-medium py-12">
               Products will appear here once added in the Admin Panel.
             </div>
          ) : (
            products.slice(0, 8).map((product) => (
              <Link
                key={product._id || product.id}
                to={`/product/${product._id || product.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group flex flex-col"
              >
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <Percent size={10} /> 30% OFF
                  </span>
                  <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm w-fit">
                    TRENDING
                  </span>
                </div>

                <div className="aspect-square relative overflow-hidden bg-gray-50 flex-shrink-0">
                  <img 
                    src={product.image || product.images?.[0] || FALLBACK_IMG} 
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; e.currentTarget.onerror = null; }}
                  />
                </div>
                
                <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      <span className="text-gray-400 text-[10px] font-bold ml-1">(4.9)</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[40px] leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">₹{(product.price * 1.3).toFixed(0)}</span>
                    </div>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const id = product._id || product.id;
                      await addToCart(product, 1);
                      setAddedToCart(prev => ({ ...prev, [id]: true }));
                      setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
                    }}
                    className={`w-full py-2 mt-auto rounded-xl text-sm font-bold opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shadow-sm hover:shadow-md ${addedToCart[product._id || product.id] ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
                  >
                    {addedToCart[product._id || product.id] ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Info Banners */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Android Infotainment", desc: "Ultra HD Screens", img: "https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?auto=format&fit=crop&q=80&w=600", color: "bg-blue-900" },
            { title: "Precision LED", desc: "Night-Piercing Light", img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600", color: "bg-indigo-900" },
            { title: "4K Dash Cams", desc: "Evidence-Grade Video", img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600", color: "bg-gray-900" }
          ].map((banner, i) => (
            <div key={i} className={`relative h-[200px] rounded-3xl overflow-hidden group ${banner.color}`}>
              <img src={banner.img} alt={banner.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
              <div className="relative z-10 p-6 h-full flex flex-col justify-end text-white">
                <h4 className="text-2xl font-black">{banner.title}</h4>
                <p className="text-gray-300 font-medium">{banner.desc}</p>
                <Link to="/shop" className="mt-4 flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all w-fit">
                  Shop Series <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-y border-gray-200 mt-12 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <ShieldCheck size={28} />, title: "ISO Certified", desc: "Global Quality" },
            { icon: <Truck size={28} />, title: "Free Delivery", desc: "Pan India Support" },
            { icon: <CheckCircle2 size={28} />, title: "Tested for India", desc: "High Heat Endurance" },
            { icon: <Headphones size={28} />, title: "24/7 Concierge", desc: "Priority Support" }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-3">
              <div className="text-blue-600 bg-blue-50 p-4 rounded-2xl">{item.icon}</div>
              <h5 className="font-bold text-gray-900">{item.title}</h5>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 bg-blue-600 text-white p-3 lg:p-4 rounded-full shadow-2xl z-50 hover:bg-blue-700 transition-all animate-bounce"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {/* Mobile Footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-3 z-50 pb-safe">
        <Link to="/" className="flex flex-col items-center gap-1 text-blue-600">
          <Zap size={20} />
          <span className="text-[10px] font-bold">Explore</span>
        </Link>
        <Link to="/shop" className="flex flex-col items-center gap-1 text-gray-400">
          <LayoutGrid size={20} />
          <span className="text-[10px] font-bold">Categories</span>
        </Link>
        <Link to="/account" className="flex flex-col items-center gap-1 text-gray-400">
          <User size={20} />
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </div>
    </div>
  );
}
