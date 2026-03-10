import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Truck,
  Zap,
  ShoppingBag,
  Award,
  Globe,
  Clock,
  ChevronUp,
  CreditCard,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import hero images
import heroImage1 from "../assets/images/Home1.webp";
import heroImage2 from "../assets/images/Home2.webp";
import heroImage3 from "../assets/images/Home3.webp";
import heroImage4 from "../assets/images/Home4.webp";

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

const categories = [
  { name: "Electronics", icon: <Zap size={28} />, path: "/shop?category=Electronics", color: "bg-blue-100" },
  { name: "Interior", icon: <ShoppingBag size={28} />, path: "/shop?category=Interior", color: "bg-purple-100" },
  { name: "Exterior", icon: <Globe size={28} />, path: "/shop?category=Exterior", color: "bg-green-100" },
  { name: "Best Sellers", icon: <Award size={28} />, path: "/shop?category=Best%20Sellers", color: "bg-orange-100" },
  { name: "Accessories", icon: <Headphones size={28} />, path: "/shop?category=Accessories", color: "bg-pink-100" },
  { name: "Car Audio", icon: <Zap size={28} />, path: "/shop?category=audio", color: "bg-indigo-100" },
  { name: "Stereo", icon: <Settings size={28} />, path: "/shop?category=stereo", color: "bg-cyan-100" },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-[#f1f3f6] min-h-screen font-sans pb-10">
      {/* Category Strip - Flipkart Style */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-40 overflow-x-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex justify-between items-center gap-6 min-w-max">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.path}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className={`${cat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 text-[#2874f0]`}>
                {cat.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700 mt-2 group-hover:text-[#2874f0]">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto">
        {/* Hero Section - Amazon Style with Overlap */}
        <div className="relative h-[450px] md:h-[600px] overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#f1f3f6] via-transparent to-transparent z-10" />
              <img
                src={heroImages[currentIndex]}
                className="w-full h-full object-cover"
                alt="Banner"
              />
              <div className="absolute top-1/2 left-10 md:left-20 -translate-y-1/2 z-20 max-w-2xl">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="inline-block px-4 py-1 bg-[#febd69] text-black text-xs font-bold rounded-full mb-4">
                    NEW ARRIVAL
                  </span>
                  <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg mb-4">
                    UPGRADE YOUR <span className="text-[#febd69]">DRIVE</span>
                  </h1>
                  <p className="text-lg text-white/90 drop-shadow-md mb-8 max-w-lg">
                    Premium Android Stereos and LED Lighting. Tested for Indian Roads.
                  </p>
                  <div className="flex gap-4">
                    <Link
                      to="/shop"
                      className="bg-[#2874f0] hover:bg-blue-700 text-white px-8 py-3 rounded-md font-bold transition shadow-xl"
                    >
                      Shop Deals
                    </Link>
                    <Link
                      to="/ewarranty"
                      className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-md font-bold hover:bg-white/30 transition"
                    >
                      E-Warranty
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button onClick={prevHero} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/20 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
            <ChevronLeft size={32} />
          </button>
          <button onClick={nextHero} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/20 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition">
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Floating Category Grid - Amazon Hybrid */}
        <div className="px-4 -mt-20 md:-mt-48 relative z-30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-sm shadow-md">
            <h2 className="text-xl font-bold mb-4">Top Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.slice(0, 4).map((cat, i) => (
                <Link key={i} to={cat.path} className="group">
                  <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center group-hover:bg-blue-50 transition">
                     <span className="text-[#2874f0]">{cat.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                </Link>
              ))}
            </div>
            <Link to="/shop" className="text-blue-600 text-sm mt-4 inline-block hover:underline font-medium">See all categories</Link>
          </div>

          <div className="bg-white p-5 rounded-sm shadow-md">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <div className="space-y-4">
              <Link to="/login" className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50">
                <ShieldCheck className="text-green-600" />
                <div className="text-sm">
                  <p className="font-bold">E-Warranty</p>
                  <p className="text-gray-500 text-xs">Register your product</p>
                </div>
              </Link>
              <Link to="/shop" className="flex items-center gap-3 p-3 border rounded-md hover:bg-gray-50">
                <Truck className="text-blue-600" />
                <div className="text-sm">
                  <p className="font-bold">Order Tracking</p>
                  <p className="text-gray-500 text-xs">Where is my order?</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="bg-white p-5 rounded-sm shadow-md col-span-1 md:col-span-2">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Today's Deals</h2>
                <div className="flex items-center gap-2 text-red-600">
                  <Clock size={18} />
                  <span className="font-bold text-sm">Ends in 08:45:22</span>
                </div>
             </div>
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {products.slice(0, 5).map((p, i) => (
                  <Link key={i} to={'/shop/' + p.id} className="min-w-[120px] flex-shrink-0">
                    <div className="aspect-square bg-gray-50 rounded mb-2 overflow-hidden flex items-center justify-center">
                       <img src={p.image || "https://via.placeholder.com/100"} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <p className="bg-red-600 text-white text-[10px] font-bold px-1 py-0.5 rounded w-fit mb-1">Up to 40% Off</p>
                    <p className="text-xs font-bold text-gray-800">₹{p.price}</p>
                  </Link>
                ))}
             </div>
          </div>
        </div>

        {/* Feature Strip - Amazon Style */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          {[
            { icon: <Award className="text-orange-500" />, title: "Best Sellers", sub: "Most popular choice" },
            { icon: <ShieldCheck className="text-blue-500" />, title: "1 Year Warranty", sub: "Standard protection" },
            { icon: <CreditCard className="text-green-500" />, title: "Secure Payment", sub: "UPI & Cards accepted" },
            { icon: <Headphones className="text-purple-500" />, title: "Expert Support", sub: "WhatsApp support" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="p-2 bg-gray-50 rounded-full">{item.icon}</div>
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-gray-500 text-[11px]">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Best Sellers Section - Flipkart Style */}
        <div className="mt-8 mx-4 bg-white shadow-sm rounded-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold">Best Sellers in Electronics</h2>
              <p className="text-xs text-gray-500">Premium quality car electronics</p>
            </div>
            <Link to="/shop" className="bg-[#2874f0] text-white px-5 py-2 rounded-sm text-sm font-bold shadow-md">
              VIEW ALL
            </Link>
          </div>
          <div className="relative group/scroll">
             <div className="flex gap-4 overflow-x-auto no-scrollbar p-6">
               {loading ? (
                 [1, 2, 3, 4, 5].map((n) => (
                   <div key={n} className="min-w-[200px] h-[300px] bg-gray-100 animate-pulse rounded-lg" />
                 ))
               ) : (
                 products.map((product) => (
                   <Link
                     key={product.id}
                     to={'/shop/' + product.id}
                     className="min-w-[200px] flex flex-col items-center p-4 border rounded-lg hover:shadow-xl transition group relative"
                   >
                     <div className="h-40 w-full mb-4 flex items-center justify-center overflow-hidden">
                       <img
                         src={product.image || "https://via.placeholder.com/200"}
                         className="h-full w-full object-contain group-hover:scale-110 transition duration-500"
                         alt={product.name}
                       />
                     </div>
                     <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-2 mb-2">
                       {product.name}
                     </h3>
                     <div className="flex items-center gap-1 mb-2">
                       <span className="text-green-600 font-bold text-lg">₹{product.price.toLocaleString()}</span>
                       <span className="text-gray-400 text-xs line-through">₹{(product.price * 1.3).toFixed(0)}</span>
                     </div>
                     <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                       SAVE 30%
                     </span>
                   </Link>
                 ))
               )}
             </div>
          </div>
        </div>

        {/* Promo Banner - Unique Modern Style */}
        <div className="mt-10 mx-4 overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-blue-900 relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/10 blur-3xl rounded-full" />
          <div className="flex flex-col md:flex-row items-center p-10 relative z-10">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
               <h2 className="text-3xl md:text-5xl font-black text-white mb-4 italic tracking-tighter">
                 THE ELITE SERIES
               </h2>
               <p className="text-blue-200 text-lg mb-8 max-w-md">
                 Ultra HD Android Systems with wireless CarPlay & Android Auto. Limited stock available.
               </p>
               <Link to="/shop" className="bg-white text-blue-900 px-10 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#febd69] hover:text-black transition">
                 Explore Tech
               </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
               <div className="relative">
                  <div className="absolute -inset-4 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                  <img src={heroImage2} alt="Promo" className="max-h-[300px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-6" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top - Amazon Style */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-[#37475a] hover:bg-[#485769] text-white p-4 rounded-full shadow-2xl transition-all active:scale-95"
        >
          <ChevronUp size={24} />
        </button>
      )}

      {/* Footer Spacer */}
      <div className="mt-20 border-t pt-10 text-center text-gray-400 text-sm">
        <p>© 2026 Anritvox. Redefining Car Electronics in India.</p>
      </div>
    </div>
  );
}
