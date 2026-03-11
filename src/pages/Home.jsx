import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { 
  ChevronLeft, ChevronRight, Star, ArrowRight, ShieldCheck, Headphones, Truck, Zap, 
  ShoppingBag, Award, Globe, ChevronUp, Flame, CheckCircle2, Cpu, Smartphone, 
  Sparkles, MousePointer2, LayoutGrid, Search, Menu, X, User, ShoppingCart, Percent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import hero images
import heroImage1 from "../assets/images/Home1.webp";
import heroImage2 from "../assets/images/Home2.webp";
import heroImage3 from "../assets/images/Home3.webp";
import heroImage4 from "../assets/images/Home4.webp";
import heroImage5 from "../assets/images/Home5.webp";
import heroImage6 from "../assets/images/Home6.webp";
import heroImage7 from "../assets/images/Home7.webp";
import heroImage8 from "../assets/images/Home8.webp";

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4, heroImage5, heroImage6, heroImage7, heroImage8];

const categories = [
  { name: "Android Stereo", icon: <Cpu />, path: "/shop?category=stereo", color: "bg-blue-500" },
  { name: "LED Lighting", icon: <Zap />, path: "/shop?category=lighting", color: "bg-yellow-500" },
  { name: "Interior", icon: <LayoutGrid />, path: "/shop?category=Interior", color: "bg-purple-500" },
  { name: "Exterior", icon: <Globe />, path: "/shop?category=Exterior", color: "bg-green-500" },
  { name: "Dash Cams", icon: <ShieldCheck />, path: "/shop?category=dashcam", color: "bg-red-500" },
  { name: "Accessories", icon: <Smartphone />, path: "/shop?category=Accessories", color: "bg-orange-500" },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("featured");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const nextHero = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 overflow-x-hidden">
      {/* Mobile-Friendly Search Bar (Amazon/Flipkart Style) */}
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
            <span className="flex items-center gap-1"><Truck size={14} /> Free Shipping Over ₹4999</span>
            <span className="flex items-center gap-1"><ShieldCheck size={14} /> 2 Year Warranty</span>
          </div>
          <div className="flex gap-4">
            <Link to="/support" className="hover:underline">Support</Link>
            <Link to="/track-order" className="hover:underline">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Hero Section (Mix of Amazon Slider & Flipkart Banners) */}
      <div className="relative w-full h-[300px] md:h-[500px] lg:h-[600px] bg-gray-200 overflow-hidden group">
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
              src={heroImages[currentIndex]} 
              alt={`Promotion ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1200";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent flex items-center px-6 md:px-20">
              <div className="max-w-2xl text-white space-y-4">
                <motion.span 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-block bg-blue-600 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                >
                  Premium Exclusive
                </motion.span>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-black leading-tight"
                >
                  THE FUTURE OF <br /> <span className="text-blue-400">CAR TECH</span>
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-gray-200 max-w-lg"
                >
                  Experience premium Android infotainment and precision lighting engineered specifically for Indian roads.
                </motion.p>
                <motion.div 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.4 }}
                   className="flex gap-4 pt-4"
                >
                  <Link to="/shop" className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">Shop Now</Link>
                  <Link to="/e-warranty" className="bg-transparent border-2 border-white/50 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors backdrop-blur-sm">E-Warranty</Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        <button 
          onClick={prevHero}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-md transition-all hidden group-hover:block"
        >
          <ChevronLeft className="text-white" size={32} />
        </button>
        <button 
          onClick={nextHero}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-md transition-all hidden group-hover:block"
        >
          <ChevronRight className="text-white" size={32} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${currentIndex === i ? "w-10 bg-blue-500" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Meesho Style Circular Categories (Best for Mobile) */}
      <div className="max-w-7xl mx-auto px-4 py-8 overflow-x-auto scrollbar-hide">
        <div className="flex lg:grid lg:grid-cols-6 gap-6 min-w-max lg:min-w-0">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={cat.path} 
              className="group flex flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className={`${cat.color} w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                {React.cloneElement(cat.icon, { size: 32 })}
              </div>
              <span className="text-sm font-bold text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products (Flipkart Grid Style) */}
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
          ) : (
            products.slice(0, 8).map((product) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={product._id || product.id} 
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group"
              >
                {/* Badge */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Percent size={10} /> 30% OFF
                  </span>
                  <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                    TRENDING
                  </span>
                </div>

                <div className="aspect-square relative overflow-hidden bg-gray-50">
                  <img 
                    src={product.image || product.images?.[0] || "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400"} 
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400";
                    }}
                  />
                </div>
                
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <span className="text-gray-400 text-[10px] font-bold ml-1">(4.9)</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 min-h-[40px] leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">₹{(product.price * 1.3).toFixed(0)}</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-blue-500/20">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Amazon Style Banner Grid */}
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
                <Link to="/shop" className="mt-4 flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all">
                  Shop Series <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges (Meesho/Flipkart Style) */}
      <div className="bg-white border-y border-gray-200 mt-12 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <ShieldCheck />, title: "ISO Certified", desc: "Global Quality" },
            { icon: <Truck />, title: "Free Delivery", desc: "Pan India Support" },
            { icon: <CheckCircle2 />, title: "Tested for India", desc: "High Heat Endurance" },
            { icon: <Headphones />, title: "24/7 Concierge", desc: "Priority Support" }
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
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-2xl z-50 hover:bg-blue-700 transition-all animate-bounce"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {/* Mobile Footer (Meesho Style Bottom Nav) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-3 z-50">
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
