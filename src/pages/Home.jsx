import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Truck, Clock, Zap, Star, ChevronRight, 
  ShoppingBag, Award, Headphones, Flame, Search, Heart, Car, Timer
} from 'lucide-react';
import { 
  products as productsApi, 
  categories as categoriesApi, 
  flashSales as flashSalesApi,
  cart as cartApi,
  wishlist as wishlistApi
} from '../services/api';
import HeroSection from '../components/HeroSection'; // Importing your advanced Hero

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  const navigate = useNavigate();
  
  // State Management
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    categories: [],
    flashSales: []
  });
  
  // Fitment State
  const [fitment, setFitment] = useState({ make: '', model: '', year: '' });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        // Concurrent fetching for ultimate speed
        const [prodRes, catRes, flashRes] = await Promise.all([
          productsApi.getAllActive({ limit: 8, featured: true }),
          categoriesApi.getAll(),
          flashSalesApi.getActive().catch(() => ({ data: [] })) // Graceful fail if no flash sales
        ]);
        
        setData({
          products: prodRes.data?.data || prodRes.data || [],
          categories: catRes.data?.data || catRes.data || [],
          flashSales: flashRes.data?.data || flashRes.data || []
        });
      } catch (err) {
        console.error("Home initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleQuickAdd = async (e, productId) => {
    e.preventDefault();
    try {
      await cartApi.add({ productId, quantity: 1 });
      // Here you would trigger your ToastContext to show success
      alert("Added to Cart!");
    } catch (error) {
      console.error("Cart error", error);
    }
  };

  const handleFitmentSearch = (e) => {
    e.preventDefault();
    // Redirect to fitment engine with pre-filled query params
    navigate(`/fitment-engine?make=${fitment.make}&model=${fitment.model}&year=${fitment.year}`);
  };

  if (loading) return <SkeletonHome />;

  return (
    <div className="bg-slate-950 text-white selection:bg-emerald-500 selection:text-black overflow-hidden">
      
      {/* 1. ADVANCED HERO SECTION */}
      <HeroSection />

      {/* 2. TRUST STRIP (Animated) */}
      <section className="py-8 border-y border-slate-800/50 bg-slate-900/50 backdrop-blur-xl relative z-20 -mt-1">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12"
          >
            {[
              { icon: <Shield />, label: "Certified Fitment", sub: "100% Guaranteed" },
              { icon: <Truck />, label: "Express Delivery", sub: "Pan India Support" },
              { icon: <Award />, label: "Premium Warranty", sub: "Instant Replacement" },
              { icon: <Headphones />, label: "Expert Support", sub: "24/7 Tech Line" }
            ].map((item, i) => (
              <motion.div variants={fadeUp} key={i} className="flex items-center gap-4 group">
                <div className="p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black group-hover:scale-110 transition-all duration-300 shadow-[0_0_0_rgba(16,185,129,0)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">{item.label}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. QUICK FITMENT SEARCH WIDGET */}
      <section className="py-12 relative z-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
              <Car size={300} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left w-full md:w-auto">
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Car className="text-emerald-500" /> Find Your Fit
                </h3>
                <p className="text-slate-400 text-sm font-medium mt-1">Guaranteed compatibility for your vehicle.</p>
              </div>
              <form onSubmit={handleFitmentSearch} className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
                <input 
                  type="text" placeholder="Make (e.g. Honda)" required
                  onChange={(e) => setFitment({...fitment, make: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none w-full"
                />
                <input 
                  type="text" placeholder="Model (e.g. Civic)" required
                  onChange={(e) => setFitment({...fitment, model: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none w-full"
                />
                <input 
                  type="number" placeholder="Year" required
                  onChange={(e) => setFitment({...fitment, year: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none w-full sm:w-24"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                  Search <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. FLASH SALES (Conditional rendering if active) */}
      <AnimatePresence>
        {data.flashSales.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="py-16 bg-gradient-to-b from-red-950/20 to-transparent border-y border-red-900/30"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-500/20 text-red-500 rounded-full animate-pulse">
                  <Timer size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                    Flash Sale <Flame className="text-red-500" />
                  </h2>
                  <p className="text-red-400 text-sm font-bold tracking-widest uppercase">Ends Soon. Limited Stock.</p>
                </div>
              </div>
              {/* Add Flash Sale Product Slider/Grid here based on data.flashSales */}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 5. CATEGORIES BIONIC GRID */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">The Collection</h2>
              <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Hardware <br/> <span className="text-slate-600">Ecosystem.</span></h3>
            </div>
            <Link to="/shop" className="group hidden md:flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 transition-all bg-slate-900/50 px-6 py-3 rounded-full border border-slate-800">
              View All Categories <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {data.categories.slice(0, 4).map((cat, i) => (
              <motion.div variants={fadeUp} key={cat.id || i} className={`group relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/60 ${i === 0 || i === 3 ? 'aspect-[4/5] lg:aspect-square' : 'aspect-[4/5] lg:aspect-[3/4]'}`}>
                <Link to={`/shop?category=${cat.id}`} className="absolute inset-0 z-20" />
                <img 
                  src={cat.image_url || 'https://www.anritvox.com/logo.webp'} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out" 
                  alt={cat.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end z-10 pointer-events-none">
                  <h4 className="text-3xl font-black uppercase tracking-tighter mb-1 text-white group-hover:text-emerald-400 transition-colors">{cat.name}</h4>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Explore Catalog →</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. FEATURED PRODUCTS (Ultra-Modern Cards) */}
      <section className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">Elite Selection</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">New Arrivals.</h3>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {data.products.map((prod) => (
              <motion.div variants={fadeUp} key={prod.id || prod._id} className="group flex flex-col relative">
                <div className="relative aspect-square bg-slate-900/50 rounded-[2rem] overflow-hidden border border-slate-800/50 mb-5 group-hover:border-emerald-500/30 transition-colors">
                  {/* Action Badges */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {prod.discount_price && (
                      <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                        Sale
                      </span>
                    )}
                  </div>
                  
                  {/* Image */}
                  <Link to={`/product/${prod.slug || prod.id || prod._id}`}>
                    <img 
                      src={prod.image_url || 'https://www.anritvox.com/logo.webp'} 
                      className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700 ease-out" 
                      alt={prod.name} 
                    />
                  </Link>

                  {/* Hover Actions */}
                  <div className="absolute bottom-4 left-0 w-full px-4 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button 
                      onClick={(e) => handleQuickAdd(e, prod.id || prod._id)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
                    >
                      <ShoppingBag size={16} /> Add
                    </button>
                    <button className="p-3.5 bg-slate-800 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg">
                      <Heart size={18} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="px-2">
                  <div className="flex justify-between items-start mb-1.5">
                    <Link to={`/product/${prod.slug || prod.id || prod._id}`}>
                      <h4 className="text-base font-black uppercase tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">{prod.name}</h4>
                    </Link>
                    <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-black">
                      <Star size={10} fill="currentColor" /> {prod.rating || '5.0'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-white">₹{prod.discount_price || prod.price}</span>
                    {prod.discount_price && (
                      <span className="text-sm font-bold text-slate-600 line-through">₹{prod.price}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-20 text-center">
            <Link to="/shop" className="inline-flex items-center gap-4 px-12 py-5 bg-slate-900 border border-slate-700 rounded-full font-black uppercase tracking-widest text-sm hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all duration-300 shadow-[0_0_0_rgba(16,185,129,0)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              Explore Full Arsenal <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. HIGH-CONVERSION CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20 blur-[150px] animate-pulse pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden relative shadow-2xl"
          >
            <div className="absolute -top-24 -right-24 opacity-5 text-emerald-500 pointer-events-none rotate-12">
              <Shield size={500} strokeWidth={1} />
            </div>
            
            <h2 className="text-xs md:text-sm font-black text-emerald-500 uppercase tracking-[0.8em] mb-6">Integrated Protection</h2>
            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-none">
              Activate Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Hardware Node.</span>
            </h3>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Register your Anritvox E-Warranty today. Experience 100% replacement coverage for any manufacturing defects. Zero questions asked. Pure peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/warranty" className="px-10 py-5 bg-emerald-500 text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-white transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3">
                <Shield size={18} /> Activate Warranty
              </Link>
              <Link to="/contact" className="px-10 py-5 bg-slate-950 border border-slate-700 text-white font-black uppercase tracking-widest text-sm rounded-full hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                <Headphones size={18} /> Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

// --- Premium Skeleton Loader ---
const SkeletonHome = () => (
  <div className="min-h-screen bg-slate-950 p-6 flex flex-col gap-12 animate-pulse pt-24">
    <div className="w-full h-[60vh] bg-slate-900 rounded-[3rem]"></div>
    <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-900 rounded-2xl"></div>)}
    </div>
    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-900 rounded-[2rem]"></div>)}
    </div>
  </div>
);
