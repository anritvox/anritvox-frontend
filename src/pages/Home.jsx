import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Shield, Truck, Clock, Zap, Star, ChevronRight, 
  ShoppingBag, Award, Headphones, Flame, Search, Heart, Car, Timer, PlayCircle
} from 'lucide-react';
import { 
  products as productsApi, 
  categories as categoriesApi, 
  flashSales as flashSalesApi,
  cart as cartApi
} from '../services/api';

import HeroSection from '../components/HeroSection'; 
import { ProductGridSkeleton, SkeletonBlock } from '../components/SkeletonLoader'; 

const CategoryCard = lazy(() => import('../components/CategoryCard')); 

// --- Image URL Resolution Protocol ---
const getImageUrl = (img) => {
  if (!img) return 'https://www.anritvox.com/logo.webp';
  let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
  if (!path) return 'https://www.anritvox.com/logo.webp';
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

// --- Fluidic Animation Matrices ---
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll(); 
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    categories: [],
    flashSales: []
  });
  
  const [fitment, setFitment] = useState({ make: '', model: '', year: '' });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes, flashRes] = await Promise.all([
          productsApi.getAllActive({ limit: 8, featured: true }),
          categoriesApi.getAll(),
          flashSalesApi.getActive().catch(() => ({ data: [] }))
        ]);
        
        setData({
          products: prodRes.data?.data || prodRes.data || [],
          categories: catRes.data?.data || catRes.data || [],
          flashSales: flashRes.data?.data || flashRes.data || []
        });
      } catch (err) {
        console.error("Home telemetry error:", err);
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
    } catch (error) {
      console.error("Cart injection failed", error);
    }
  };

  const handleFitmentSearch = (e) => {
    e.preventDefault();
    navigate(`/fitment-engine?make=${fitment.make}&model=${fitment.model}&year=${fitment.year}`); 
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 pt-24 px-6 space-y-12">
       <SkeletonBlock className="w-full h-[60vh] rounded-[3rem]" />
       <ProductGridSkeleton count={4} />
    </div>
  ); 

  return (
    <div className="bg-slate-950 text-white selection:bg-[#808D64] selection:text-black overflow-hidden font-sans">
      
      {/* Scroll Progress Indicator - Premium Gradient */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-[#808D64] to-[#9CA986] origin-left z-50" 
        style={{ scaleX: scrollYProgress }} 
      />

      <HeroSection />

      {/* 2. TRUST MATRIX */}
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
              <motion.div variants={fadeUp} key={i} className="flex items-center gap-4 group cursor-default">
                <div className="p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-[#9CA986] group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-[#808D64] group-hover:text-black group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-[0_0_0_rgba(128,141,100,0)] group-hover:shadow-[0_0_25px_rgba(128,141,100,0.5)]">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#9CA986] transition-colors">{item.label}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. PARALLAX FITMENT ENGINE WIDGET */}
      <section className="py-16 relative z-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-[#808D64]/40 transition-colors duration-500"
          >
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4 group-hover:scale-110 group-hover:opacity-10 transition-all duration-1000 text-[#9CA986]">
              <Car size={400} />
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-left w-full lg:w-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#808D64]/10 border border-[#808D64]/30 text-[#9CA986] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Zap size={12} /> Auto-Match System
                </div>
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                  Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9CA986] to-emerald-400">Fit.</span>
                </h3>
                <p className="text-slate-400 text-sm font-medium mt-3 max-w-sm">Select your vehicle details to instantly filter our inventory for 100% compatible hardware.</p>
              </div>
              
              <form onSubmit={handleFitmentSearch} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
                <input 
                  type="text" placeholder="Make (e.g. Hyundai)" required
                  onChange={(e) => setFitment({...fitment, make: e.target.value})}
                  className="bg-slate-950/80 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:border-[#808D64] outline-none w-full backdrop-blur-md transition-colors text-white placeholder:text-slate-600"
                />
                <input 
                  type="text" placeholder="Model (e.g. Creta)" required
                  onChange={(e) => setFitment({...fitment, model: e.target.value})}
                  className="bg-slate-950/80 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:border-[#808D64] outline-none w-full backdrop-blur-md transition-colors text-white placeholder:text-slate-600"
                />
                <input 
                  type="number" placeholder="Year" required
                  onChange={(e) => setFitment({...fitment, year: e.target.value})}
                  className="bg-slate-950/80 border border-slate-700 rounded-2xl px-5 py-4 text-sm focus:border-[#808D64] outline-none w-full sm:w-32 backdrop-blur-md transition-colors text-white placeholder:text-slate-600"
                />
                <button type="submit" className="bg-gradient-to-r from-emerald-600 to-[#808D64] hover:from-[#9CA986] hover:to-emerald-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(128,141,100,0.3)] hover:shadow-[0_0_30px_rgba(156,169,134,0.5)] hover:-translate-y-1">
                  Scan <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. CATEGORY RIBBON */}
      <section className="py-20 relative overflow-hidden bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="text-xs font-black text-[#9CA986] uppercase tracking-[0.5em] mb-4">Taxonomy</h2>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Hardware <span className="text-slate-600">Ecosystem.</span></h3>
            </div>
            <Link to="/shop" className="group hidden md:flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-[#9CA986] transition-all bg-slate-900/50 px-6 py-3 rounded-full border border-slate-800">
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {data.categories.slice(0, 4).map((cat, i) => (
              <motion.div variants={fadeUp} key={cat.id || i}>
                <Suspense fallback={<SkeletonBlock className="aspect-[4/5] rounded-[2.5rem] w-full" />}>
                  <CategoryCard 
                    category={{
                      name: cat.name,
                      slug: cat.id || cat._id, 
                      image: getImageUrl(cat.image_url),
                      count: cat.product_count || '50' 
                    }} 
                  />
                </Suspense>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. ELITE SELECTION */}
      <section className="py-24 bg-slate-900/30 border-t border-slate-800/50 relative">
        {/* Subtle premium glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#808D64]/5 blur-[150px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-xs font-black text-[#9CA986] uppercase tracking-[0.5em] mb-4">Elite Selection</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Trending Hardware.</h3>
          </motion.div>

          {data.products.length === 0 ? (
             <ProductGridSkeleton count={8} /> 
          ) : (
            <motion.div 
              variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {data.products.map((prod) => (
                <motion.div variants={fadeUp} key={prod.id || prod._id} className="group flex flex-col relative">
                  <div className="relative aspect-square bg-slate-900/80 backdrop-blur-sm rounded-[2.5rem] overflow-hidden border border-slate-800/80 mb-5 group-hover:border-[#808D64]/60 transition-colors duration-500 shadow-lg group-hover:shadow-[0_0_40px_-10px_rgba(128,141,100,0.25)]">
                    
                    <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                      {prod.discount_price && (
                        <span className="px-3 py-1.5 bg-[#808D64] text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          Sale
                        </span>
                      )}
                    </div>
                    
                    <Link to={`/product/${prod.slug || prod.id || prod._id}`}>
                      <img 
                        src={getImageUrl(prod.images?.[0] || prod.image_url)} 
                        className="w-full h-full object-contain p-10 group-hover:scale-110 transition-transform duration-700 ease-out" 
                        alt={prod.name} 
                        onError={(e) => { e.target.src = '/logo.webp'; }}
                      />
                    </Link>

                    <div className="absolute bottom-5 left-0 w-full px-5 flex gap-3 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 z-20">
                      <button 
                        onClick={(e) => handleQuickAdd(e, prod.id || prod._id)}
                        className="flex-1 bg-white hover:bg-[#9CA986] text-black font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl transition-colors shadow-xl flex justify-center items-center gap-2"
                      >
                        <ShoppingBag size={16} /> Quick Add
                      </button>
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/product/${prod.slug || prod.id || prod._id}`}>
                        <h4 className="text-sm font-black uppercase tracking-tight line-clamp-1 group-hover:text-[#9CA986] transition-colors pr-4">{prod.name}</h4>
                      </Link>
                      <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20 text-[10px] font-black">
                        <Star size={10} fill="currentColor" /> {prod.rating || '5.0'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-white font-mono tracking-tight">₹{prod.discount_price || prod.price}</span>
                      {prod.discount_price && (
                        <span className="text-xs font-bold text-slate-500 line-through font-mono">₹{prod.price}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-20 text-center">
            <Link to="/shop" className="inline-flex items-center gap-4 px-10 py-5 bg-slate-900 border border-slate-700 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#808D64] hover:text-black hover:border-[#808D64] transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_rgba(128,141,100,0.3)]">
              Explore Full Arsenal <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. THE GARAGE */}
      <section className="py-24 relative overflow-hidden bg-[#030303]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="relative aspect-video rounded-[3rem] overflow-hidden group cursor-pointer border border-slate-800 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&q=80" alt="Anritvox Garage" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#9CA986] to-[#808D64] backdrop-blur-md rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(156,169,134,0.6)] group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle size={32} />
                </div>
              </div>
            </div>
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#808D64]/10 border border-[#808D64]/20 text-[#9CA986] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                <PlayCircle size={12} /> The Garage Hub
              </div>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-tight">
                Master Your <br/> <span className="text-slate-500">Installation.</span>
              </h3>
              <p className="text-slate-400 text-sm md:text-base font-medium mb-10 leading-relaxed max-w-lg">
                Stop guessing. Our dedicated tech team breaks down every installation process step-by-step. From wiring Android players to securing basstubes, learn how to upgrade your ride like a pro.
              </p>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#808D64] hover:text-black hover:border-[#808D64] transition-all shadow-lg">
                View Tutorials <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. HIGH-CONVERSION CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#808D64]/10 to-transparent blur-[120px] pointer-events-none -z-10"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[3rem] p-12 md:p-20 text-center overflow-hidden relative shadow-2xl"
          >
            <div className="absolute -top-32 -right-32 opacity-5 text-[#9CA986] pointer-events-none rotate-12">
              <Shield size={600} strokeWidth={1} />
            </div>
            
            <h2 className="text-[10px] font-black text-[#9CA986] uppercase tracking-[0.8em] mb-6">Integrated Protection</h2>
            <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
              Activate Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#9CA986] to-[#808D64]">Hardware Node.</span>
            </h3>
            <p className="text-sm md:text-base text-slate-400 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
              Register your Anritvox E-Warranty today. Experience 100% replacement coverage for any manufacturing defects. Pure peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/ewarranty" className="px-8 py-4 bg-gradient-to-r from-[#808D64] to-emerald-600 text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:from-[#9CA986] hover:to-[#808D64] transition-all shadow-[0_0_30px_rgba(128,141,100,0.3)] hover:shadow-[0_0_40px_rgba(156,169,134,0.5)] flex items-center justify-center gap-3">
                <Shield size={16} /> Activate Warranty
              </Link>
              <Link to="/contact" className="px-8 py-4 bg-slate-950 border border-slate-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                <Headphones size={16} /> Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
