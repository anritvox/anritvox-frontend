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
  ChevronUp,
  Flame,
  CheckCircle2,
  Cpu,
  Smartphone,
  Sparkles,
  MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import hero images
import heroImage1 from "../assets/images/Home1.webp";
import heroImage2 from "../assets/images/Home2.webp";
import heroImage3 from "../assets/images/Home3.webp";
import heroImage4 from "../assets/images/Home4.webp";

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

const categories = [
  {
    name: "Android Stereo",
    icon: <Cpu size={24} />,
    path: "/shop?category=stereo",
  },
  {
    name: "LED Lighting",
    icon: <Zap size={24} />,
    path: "/shop?category=lighting",
  },
  {
    name: "Interior",
    icon: <ShoppingBag size={24} />,
    path: "/shop?category=Interior",
  },
  {
    name: "Exterior",
    icon: <Globe size={24} />,
    path: "/shop?category=Exterior",
  },
  {
    name: "Dash Cams",
    icon: <ShieldCheck size={24} />,
    path: "/shop?category=dashcam",
  },
  {
    name: "Accessories",
    icon: <Smartphone size={24} />,
    path: "/shop?category=Accessories",
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState("featured");

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
    }, 8000);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const nextHero = () =>
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () =>
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDisplayPrice = (product) => {
    const base = Number(product.price) || 0;
    return base.toLocaleString("en-IN");
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20 selection:bg-blue-100 selection:text-blue-900">
      {/* Top category strip */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 overflow-hidden shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.path}
                className="flex items-center gap-2 group cursor-pointer whitespace-nowrap py-1.5 sm:py-2 relative"
              >
                <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm group-hover:scale-110 transition-all duration-300">
                  {React.cloneElement(cat.icon, { size: 18 })}
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 border-l pl-6">
            <div className="flex items-center gap-2 text-rose-500 font-bold text-xs sm:text-sm animate-pulse">
              <Flame size={18} />
              <span>LIVE OFFERS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto">
        {/* Hero section */}
        <div className="relative h-[420px] sm:h-[520px] md:h-[620px] overflow-hidden group bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
              <img
                src={heroImages[currentIndex]}
                className="w-full h-full object-cover"
                alt="Premium Car Tech"
              />

              <div className="absolute top-1/2 left-4 sm:left-8 md:left-16 -translate-y-1/2 z-20 max-w-xl pr-4">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.7 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-10 sm:w-12 h-[2px] bg-blue-500 rounded-full" />
                    <span className="text-blue-400 font-black tracking-[0.25em] text-[10px] sm:text-xs uppercase">
                      The Future of Car Tech
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
                    ELEVATE YOUR <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                      DRIVING EXPERIENCE
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 max-w-md leading-relaxed font-light">
                    Experience premium Android infotainment and precision lighting engineered for Indian road conditions.
                  </p>

                  <div className="flex flex-wrap gap-3 sm:gap-5">
                    <Link
                      to="/shop"
                      className="group relative bg-blue-600 hover:bg-blue-700 text-white px-5 sm:px-8 md:px-10 py-2.5 sm:py-3.5 rounded-full text-sm sm:text-base font-bold transition-all overflow-hidden shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Explore Collections{" "}
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </Link>
                    <Link
                      to="/ewarranty"
                      className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 sm:px-8 md:px-10 py-2.5 sm:py-3.5 rounded-full text-sm sm:text-base font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      <ShieldCheck size={18} className="text-blue-400" /> E-Warranty
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-30 flex items-center gap-3">
            <div className="flex gap-1 sm:gap-2 mr-2 sm:mr-4">
              {heroImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentIndex ? "w-6 sm:w-8 bg-blue-500" : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={prevHero}
              className="p-2 sm:p-3 border border-white/30 bg-white/5 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextHero}
              className="p-2 sm:p-3 border border-white/30 bg-white/5 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Three feature tiles */}
        <div className="px-4 sm:px-6 -mt-10 sm:-mt-16 md:-mt-20 relative z-30 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              title: "Android Infotainment",
              desc: "Ultra HD screens with Wireless CarPlay and fast processors.",
              icon: <Smartphone size={28} className="text-blue-500" />,
              tag: "Best Seller",
            },
            {
              title: "Precision LED Pro",
              desc: "Powerful illumination with long-life warranty coverage.",
              icon: <Sparkles size={28} className="text-amber-500" />,
              tag: "Trending",
            },
            {
              title: "Intelligent Dash Cams",
              desc: "High-res loop recording for evidence-grade footage.",
              icon: <ShieldCheck size={28} className="text-emerald-500" />,
              tag: "New Arrival",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="bg-white/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-white"
            >
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  {item.icon}
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4 sm:mb-5">
                {item.desc}
              </p>
              <Link
                to="/shop"
                className="flex items-center gap-2 text-blue-600 font-bold text-sm"
              >
                View Series{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Curated collection grid */}
        <div className="mt-16 sm:mt-20 px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 tracking-widest uppercase text-[11px]">
                <CheckCircle2 size={14} /> Verified Performance
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                Curated Collection
              </h2>
            </div>

            <div className="flex bg-white p-1.5 rounded-2xl shadow-inner border border-gray-100 text-xs sm:text-sm">
              {[
                { label: "Featured", id: "featured" },
                { label: "Newest", id: "new" },
                { label: "Best Value", id: "value" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-6 py-2 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="h-[220px] sm:h-[260px] md:h-[300px] bg-white rounded-2xl animate-pulse border border-gray-100"
                />
              ))
            ) : products && products.length > 0 ? (
              products.slice(0, 8).map((product) => {
                const safePrice = Number(product.price) || 0;
                const mrp = safePrice ? Math.round(safePrice * 1.3) : 0;
                const imageSrc =
                  product.image && product.image.trim() !== ""
                    ? product.image
                    : "https://via.placeholder.com/300x300?text=ANRITVOX";

                return (
                  <Link
                    key={product.id}
                    to={`/shop/${product.id}`}
                    className="group bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col"
                  >
                    <div className="relative aspect-square mb-3 sm:mb-4 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center p-3 sm:p-4">
                      <img
                        src={imageSrc}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        alt={product.name}
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <div className="bg-white/90 backdrop-blur p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                          <Star size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="px-1 flex-grow flex flex-col">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex text-amber-400">
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                          <Star size={12} fill="currentColor" />
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold ml-1">
                          (240+)
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mb-2 leading-snug">
                        {product.name}
                      </h3>

                      <div className="mt-auto flex items-center justify-between pt-1 sm:pt-2">
                        <div>
                          <span className="text-sm sm:text-lg font-black text-gray-900">
                            ₹{getDisplayPrice(product)}
                          </span>
                          {mrp > 0 && (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[9px] sm:text-xs text-emerald-500 font-black">
                                30% OFF
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="p-2 sm:p-3 bg-gray-900 text-white rounded-xl group-hover:bg-blue-600 transition-colors shadow-md"
                        >
                          <ShoppingBag size={16} />
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="col-span-full text-center text-gray-500 text-sm">
                No products available right now.
              </p>
            )}
          </div>

          <div className="mt-10 sm:mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-white border-2 border-gray-100 rounded-full font-black text-xs sm:text-sm md:text-base text-gray-900 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm"
            >
              BROWSE ALL PRODUCTS{" "}
              <MousePointer2 size={18} className="text-blue-600" />
            </Link>
          </div>
        </div>

        {/* Elite section */}
        <div className="mt-20 sm:mt-24 mx-4 sm:mx-6">
          <div className="rounded-3xl sm:rounded-[32px] overflow-hidden bg-gray-950 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent z-10" />
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-blue-600/10 blur-[120px] rounded-full" />

            <div className="flex flex-col lg:flex-row items-center relative z-20">
              <div className="p-8 sm:p-10 md:p-14 lg:w-3/5">
                <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-6 sm:mb-8">
                  Premium Exclusive
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white italic tracking-tight mb-6 sm:mb-8">
                  THE <span className="text-blue-500">ELITE</span> SERIES
                </h2>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed mb-8 sm:mb-10">
                  Engineered with robust components and modern Android architecture.
                  Transform your cockpit with seamless connectivity.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 border-t border-white/10 pt-6 sm:pt-8">
                  {[
                    { label: "Memory", val: "8GB RAM" },
                    { label: "Display", val: "4K QLED" },
                    { label: "Sound", val: "DSP 32EQ" },
                  ].map((spec, i) => (
                    <div key={i}>
                      <p className="text-gray-500 text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1">
                        {spec.label}
                      </p>
                      <p className="text-white font-black text-sm sm:text-base">
                        {spec.val}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/shop"
                  className="inline-block bg-white text-black px-8 sm:px-10 py-3 sm:py-4 rounded-full font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105"
                >
                  Unlock the technology
                </Link>
              </div>

              <div className="lg:w-2/5 p-8 sm:p-10 flex justify-center">
                <motion.div
                  initial={{ rotate: 8, y: 40 }}
                  whileInView={{ rotate: -4, y: 0 }}
                  transition={{ duration: 1 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full" />
                  <img
                    src={heroImage2}
                    alt="Promo Infotainment"
                    className="max-h-[260px] sm:max-h-[320px] md:max-h-[360px] drop-shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative z-10"
                    loading="lazy"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature strip */}
        <div className="mt-20 sm:mt-24 border-y border-gray-100 py-10 sm:py-14 bg-white">
          <div className="px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {[
              {
                icon: <Award className="text-blue-600" />,
                title: "ISO Certified",
                desc: "Global quality standards",
              },
              {
                icon: <Truck className="text-blue-600" />,
                title: "Express Shipping",
                desc: "PAN India delivery",
              },
              {
                icon: <CheckCircle2 className="text-blue-600" />,
                title: "Tested for India",
                desc: "High heat endurance",
              },
              {
                icon: <Headphones className="text-blue-600" />,
                title: "24/7 Concierge",
                desc: "Priority WhatsApp support",
              },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-3xl">
                  {feature.icon}
                </div>
                <h4 className="font-black text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                  {feature.title}
                </h4>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 bg-gray-900 hover:bg-blue-600 text-white p-4 sm:p-5 rounded-2xl shadow-2xl transition-all active:scale-95 group"
        >
          <ChevronUp
            size={22}
            className="group-hover:-translate-y-1 transition-transform"
          />
        </button>
      )}

      {/* Footer */}
      <footer className="mt-20 sm:mt-24 border-t border-gray-100 pt-14 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
            A
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-gray-900">
            ANRITVOX
          </span>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Redefining automotive electronics through innovation and reliability.
          The choice for Indian automotive enthusiasts.
        </p>
        <div className="mt-8 sm:mt-10 flex justify-center gap-6 sm:gap-8 text-[10px] sm:text-xs font-bold text-gray-400">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">
            PRIVACY
          </span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">
            TERMS
          </span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">
            SUPPORT
          </span>
        </div>
        <p className="mt-8 sm:mt-10 text-gray-300 text-[9px] sm:text-[10px] uppercase tracking-widest font-black">
          © 2026 ANRITVOX GLOBAL. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
