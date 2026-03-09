import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { 
  ChevronLeft, ChevronRight, Star, ArrowRight, 
  ShieldCheck, Headphones, Truck, Zap, ShoppingBag,
  Award, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import hero images
import heroImage1 from "../assets/images/Home1.webp";
import heroImage2 from "../assets/images/Home2.webp";
import heroImage3 from "../assets/images/Home3.webp";
import heroImage4 from "../assets/images/Home4.webp";

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

const categories = [
  { name: "Electronics", icon: <Zap size={24} />, path: "/shop?category=Electronics" },
  { name: "Interior", icon: <ShoppingBag size={24} />, path: "/shop?category=Interior" },
  { name: "Exterior", icon: <Globe size={24} />, path: "/shop?category=Exterior" },
  { name: "Best Sellers", icon: <Award size={24} />, path: "/shop?category=Best%20Sellers" },
  { name: "Accessories", icon: <Headphones size={24} />, path: "/shop?category=Accessories" },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return () => clearInterval(interval);
  }, []);

  const nextHero = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans">
      
      {/* Category Strip - Meesho/Flipkart Style */}
      <div className="bg-white border-b sticky top-16 z-40 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-8 min-w-max">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={cat.path}
              className="flex flex-col items-center gap-1 group transition-transform active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-600 uppercase tracking-wider">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Section - Modern & Bold */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={heroImages[currentIndex]}
            alt="Hero"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl text-white"
            >
              <span className="inline-block px-3 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                Premium Car Audio
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                Redefine Your <br />
                <span className="text-blue-500">Driving Beat</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                High-fidelity sound systems and android units crafted for luxury. Experience audio like never before.
              </p>
              <div className="flex gap-4">
                <Link to="/shop" className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                  Shop Now <ArrowRight size={20} />
                </Link>
                <Link to="/ewarranty" className="px-8 py-4 border border-white/30 text-white font-bold rounded-lg hover:bg-white/10 transition-all">
                  E-Warranty
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Carousel Controls */}
        <button onClick={prevHero} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-white/20 backdrop-blur-md transition-all">
          <ChevronLeft size={30} />
        </button>
        <button onClick={nextHero} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 text-white hover:bg-white/20 backdrop-blur-md transition-all">
          <ChevronRight size={30} />
        </button>
      </section>

      {/* Trust Bar */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-30">
        <div className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><ShieldCheck size={32} /></div>
            <div>
              <h4 className="font-bold text-gray-900">Genuine Parts</h4>
              <p className="text-sm text-gray-500">100% Authentic products</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l-0 md:border-l px-0 md:px-8">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Truck size={32} /></div>
            <div>
              <h4 className="font-bold text-gray-900">Fast Delivery</h4>
              <p className="text-sm text-gray-500">Shipping across all India</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-l-0 md:border-l px-0 md:px-8">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Award size={32} /></div>
            <div>
              <h4 className="font-bold text-gray-900">E-Warranty</h4>
              <p className="text-sm text-gray-500">Easy paperless registration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Featured Collection */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular In Audio</h2>
            <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
          </div>
          <Link to="/shop" className="text-blue-600 font-bold flex items-center gap-1 hover:underline">
            View Collection <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={product._id || product.id} 
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden relative"
              >
                <div className="h-56 overflow-hidden relative bg-gray-50">
                  <img 
                    src={product.images?.[0] || product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase">
                    New
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 truncate">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-600">₹{product.price.toLocaleString()}</span>
                    <Link 
                      to={`/shop/${product._id || product.id}`}
                      className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Big Promo Banner - Unique Section */}
        <div className="mt-20 relative rounded-3xl overflow-hidden bg-blue-900 text-white p-12 h-[400px] flex items-center">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-lg">
            <h2 className="text-5xl font-black mb-6 leading-tight">Elite Android Systems</h2>
            <p className="text-blue-100 text-lg mb-8">
              Upgrade your dashboard with 4K resolution, wireless CarPlay, and seamless Android Auto connectivity.
            </p>
            <Link to="/shop?category=Electronics" className="inline-block px-10 py-4 bg-white text-blue-900 font-black rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-xl">
              Explore Tech
            </Link>
          </div>
          {/* Visual element */}
          <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-[#1a1c23] rounded-3xl p-10 text-white relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Headphones size={200} />
            </div>
            <h3 className="text-3xl font-bold mb-4">Precision Audio</h3>
            <p className="text-gray-400 mb-6">Crystal clear highs and deep rumbling bass for every drive.</p>
            <Link to="/shop" className="text-blue-400 font-bold flex items-center gap-2">
              Learn More <ArrowRight size={18} />
            </Link>
          </div>
          <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap size={200} />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-gray-900">Fast Install</h3>
            <p className="text-gray-500 mb-6">Plug-and-play systems designed for your specific car model.</p>
            <Link to="/contact" className="text-blue-600 font-bold flex items-center gap-2">
              Book Service <ArrowRight size={18} />
            </Link>
          </div>
        </div>

      </main>

      {/* Footer padding for mobile nav if needed */}
      <div className="h-10"></div>
    </div>
  );
}
