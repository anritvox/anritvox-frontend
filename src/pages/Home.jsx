import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Truck, Zap, Star, 
  ShoppingBag, Award, Headphones, PlayCircle,
  Sparkles, CheckCircle2, Flame, Heart, Eye,
  ArrowUpRight, Users, ShoppingCart, ShieldCheck,
  RefreshCw, Layers, Sliders, ChevronDown, HelpCircle,
  Cpu, Disc3, Maximize2, Settings, ShieldAlert,
  Gauge, Radio, Volume2, Hammer
} from 'lucide-react';
import { 
  products as productsApi, 
  categories as categoriesApi,
  cart as cartApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { ProductGridSkeleton, SkeletonBlock } from '../components/SkeletonLoader'; 

// Continuous Edge Case Asset Resolution Engine
const getImageUrl = (img) => {
  if (!img) return '/logo.jpeg';
  let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
  if (!path) return '/logo.jpeg';
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

// Orchestrated Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 22 } }
};

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast() || {};
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ products: [], categories: [] });
  const [selectedTab, setSelectedTab] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsApi.getAllActive({ limit: 40 }),
          categoriesApi.getAll()
        ]);
        
        setData({
          products: prodRes.data?.data || prodRes.data || [],
          categories: catRes.data?.data || catRes.data || []
        });
      } catch (err) {
        console.error("Home dynamic master data fetching failure:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Rigorous Pattern Matching for Active Flagship Hardware Stock Records
  const flagshipShowcase = useMemo(() => {
    const androidUnit = data.products.find(p => 
      p.sku?.toUpperCase() === 'BHU-58' || 
      p.name?.toLowerCase().includes('bhu-58') ||
      p.name?.toLowerCase().includes('360 degree')
    ) || data.products.find(p => p.name?.toLowerCase().includes('360')) || data.products[0];

    const audioUnit = data.products.find(p => 
      p.name?.toLowerCase().includes('p2810') || 
      p.name?.toLowerCase().includes('av-p2810') ||
      p.name?.toLowerCase().includes('cleanest sound')
    ) || data.products.find(p => p.name?.toLowerCase().includes('mid range')) || data.products[1] || data.products[0];

    return { android: androidUnit, audio: audioUnit };
  }, [data.products]);

  // Unified Slide Collection for the Automated Carousel Engine
  const slideshowImages = useMemo(() => {
    const slides = [];
    if (flagshipShowcase.android) {
      slides.push({
        id: flagshipShowcase.android.id || flagshipShowcase.android._id,
        url: getImageUrl(flagshipShowcase.android.images?.[0] || flagshipShowcase.android.image_url),
        alt: "Anritvox 360 Degree Android Player Panel",
        target: `/product/${flagshipShowcase.android.slug || flagshipShowcase.android.id || flagshipShowcase.android._id}`
      });
    }
    if (flagshipShowcase.audio) {
      slides.push({
        id: flagshipShowcase.audio.id || flagshipShowcase.audio._id,
        url: getImageUrl(flagshipShowcase.audio.images?.[0] || flagshipShowcase.audio.image_url),
        alt: "Mid Range Cleanest Sound AV-P2810 Component",
        target: `/product/${flagshipShowcase.audio.slug || flagshipShowcase.audio.id || flagshipShowcase.audio._id}`
      });
    }
    return slides;
  }, [flagshipShowcase]);

  // Automated Hero Scrolling State Clock Loop
  useEffect(() => {
    if (slideshowImages.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prevIndex) => (prevIndex + 1) % slideshowImages.length);
    }, 3500);
    return () => clearInterval(slideTimer);
  }, [slideshowImages]);

  // Filter Computation Context
  const filteredProducts = useMemo(() => {
    if (selectedTab === 'all') return data.products;
    return data.products.filter(p => p.category?.toLowerCase() === selectedTab.toLowerCase());
  }, [data.products, selectedTab]);

  const handleQuickAdd = async (e, productId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (showToast) showToast('Please login to begin adding items to your cart.', 'error');
      navigate('/login');
      return;
    }

    try {
      await cartApi.add({ productId, quantity: 1 });
      if (showToast) showToast('Product successfully added to your cart!', 'success');
    } catch (error) {
      console.error("Cart quick add transaction crash:", error);
      if (showToast) showToast('Could not add product. Please try again.', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f4f7f4] pt-24 px-6 space-y-12 max-w-7xl mx-auto">
       <SkeletonBlock className="w-full h-[60vh] rounded-[2.5rem] bg-neutral-200" />
       <div className="h-8 w-64 bg-neutral-200 rounded-md animate-pulse mx-auto" />
       <ProductGridSkeleton count={8} />
    </div>
  ); 

  return (
    <div className="bg-[#fcfcfc] text-neutral-900 selection:bg-[#3a533a] selection:text-white overflow-hidden font-sans">
      
      {/* 20X EXPERT OVERHAUL: REMOVED ALL BOX BOUNDS FOR HALF-SCREEN MAX EXPANSION COMPLIANCE WITH IMAGE_E9DC27.JPG */}
      <section className="relative bg-gradient-to-br from-[#090e09] via-[#121c14] to-[#060a06] text-white py-20 lg:py-28 overflow-hidden border-b border-neutral-950">
        
        {/* Precise Technical Background Mesh Grid Layout */}
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#3a533a_1px,transparent_1px),linear-gradient(to_bottom,#3a533a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#3a533a]/10 blur-[180px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[500px] lg:min-h-[560px]">
            
            {/* Left Strategic Copy Column */}
            <div className="lg:col-span-5 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3a533a]/30 border border-[#3a533a]/50 text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" /> Custom Automotive Tuning
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                  Elite <br />
                  Performance <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-[#9bb49b] to-neutral-200 bg-clip-text text-transparent">Audio & Screens</span>
                </h1>
                
                <p className="text-neutral-400 text-xs sm:text-sm font-bold leading-relaxed max-w-md">
                  Upgrade your drive with premium components designed for absolute accuracy. Zero wire slicing, full steering integration, and perfect flush dashboard layouts.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/shop" className="px-8 py-4 bg-[#3a533a] hover:bg-[#466746] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-[#3a533a]/20 flex items-center gap-2 group">
                  View Catalog <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#active-catalog" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/10">
                  Browse All Upgrades
                </a>
              </div>
            </div>

            {/* Right Strategic Image Column - Unlocked Bounding Containers for Half-Screen Panoramic Impact */}
            <div className="lg:col-span-7 flex items-center justify-center h-full w-full relative">
              <div className="w-full h-[400px] sm:h-[460px] lg:h-[520px] flex items-center justify-center relative overflow-visible select-none">
                
                <AnimatePresence mode="wait">
                  {slideshowImages.length > 0 && (
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.96, x: 15 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.98, x: -15 }}
                      transition={{ duration: 0.65, ease: "easeOut" }}
                      className="w-full h-full flex flex-col items-center justify-center absolute inset-0"
                    >
                      <Link to={slideshowImages[currentSlide].target} className="w-full h-full flex items-center justify-center relative group">
                        <img 
                          src={slideshowImages[currentSlide].url} 
                          alt={slideshowImages[currentSlide].alt}
                          className="w-full h-full max-h-[380px] sm:max-h-[440px] lg:max-h-[500px] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.65)] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                          onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpeg'; }}
                        />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Minimalist Slide Progress Bars */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2.5 z-20">
                  {slideshowImages.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCurrentSlide(dotIdx)}
                      className={`h-1 rounded-full transition-all duration-500 ${dotIdx === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/20'}`}
                      aria-label={`Go to slide index ${dotIdx + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Corporate Trust Matrix Parameters Segment */}
      <section className="py-16 border-b border-neutral-200/60 bg-gradient-to-b from-[#fcfcfc] to-[#f4f7f4] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: <ShieldCheck className="h-6 w-6 text-[#3a533a]" />, label: "Guaranteed Fitment", sub: "100% Secure OEM Compatibility Matching" },
              { icon: <Truck className="h-6 w-6 text-[#3a533a]" />, label: "Express Distribution", sub: "Fully Insured Safe Pan India Shipping Support" },
              { icon: <Award className="h-6 w-6 text-[#3a533a]" />, label: "Enterprise Warranty", sub: "Direct Simple Replacement Diagnostics" },
              { icon: <Headphones className="h-6 w-6 text-[#3a533a]" />, label: "24/7 Priority Hotline", sub: "Direct Technical Configuration Support" }
            ].map((item, i) => (
              <motion.div variants={fadeUp} key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-sm hover:shadow-md transition-all group">
                <div className="p-3 bg-[#f4f7f4] rounded-xl group-hover:bg-[#3a533a] group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">{item.label}</h4>
                  <p className="text-xs text-neutral-500 font-semibold mt-1 leading-relaxed">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Architectural Table Specifications Matrix Breakdown Section */}
      <section className="py-24 bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[#3a533a] text-xs font-black uppercase tracking-[0.35em] block">Certified Performance Metrics</span>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
                Architectural <br />
                <span className="text-[#3a533a]">Specifications</span>
              </h2>
              <p className="text-neutral-500 text-xs font-bold leading-relaxed">
                Review verified mechanical tolerances, DSP routing matrices, and installation footprints benchmarked inside our custom modification laboratory.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#f4f7f4] border border-neutral-200/50">
                  <Gauge className="h-5 w-5 text-[#3a533a] mb-2" />
                  <div className="text-lg font-black text-neutral-900 font-mono">0.02ms</div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">DSP Group Delay Latency</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#f4f7f4] border border-neutral-200/50">
                  <Radio className="h-5 w-5 text-[#3a533a] mb-2" />
                  <div className="text-lg font-black text-neutral-900 font-mono">5.0 GHz</div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">Wireless CarPlay Link</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 shadow-sm">
                <table className="w-full text-left border-collapse bg-white text-xs">
                  <thead>
                    <tr className="bg-neutral-950 text-white font-black uppercase tracking-wider text-[10px]">
                      <th className="p-4">Hardware Line</th>
                      <th className="p-4">Integration Standard</th>
                      <th className="p-4">Warranty Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700 font-medium">
                    <tr>
                      <td className="p-4 font-bold text-neutral-900">Anritvox 360 Player (BHU-58)</td>
                      <td className="p-4">OEM Socket-Coupled (No Splice)</td>
                      <td className="p-4">2-Year Replacement Protect</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-neutral-900">AV-P2810 Mid-Range Array</td>
                      <td className="p-4">High-Excursion Gold Terminal</td>
                      <td className="p-4">2-Year Full Hardware Protect</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-neutral-900">Ambient Lighting Systems</td>
                      <td className="p-4">CANBUS Module Addressable</td>
                      <td className="p-4">1-Year System Protect</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Premium Infinite Collection Catalog Showcase Hub */}
      <section id="active-catalog" className="py-24 bg-[#fcfcfc] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-items-end md:flex-row md:justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f4f7f4] text-[#3a533a] mb-4 border border-neutral-200">
                <Sparkles className="h-3 w-3" /> Complete Hardware Lines
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 uppercase">
                Explore Entire <span className="text-[#3a533a]">Upgrade Catalog</span>
              </h2>
              <p className="text-neutral-500 text-xs font-bold mt-2 leading-relaxed">
                Filter through active inventory lines sourced from certified suppliers to configure your premium interior updates.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 items-center">
              {['all', 'audio', 'lighting', 'dashboard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                    selectedTab === tab 
                      ? 'bg-[#3a533a] text-white shadow-lg shadow-[#3a533a]/10' 
                      : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  {tab === 'all' ? 'All Accessories' : `${tab} lines`}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Layer */}
          <motion.div 
            layout
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((prod) => (
                <motion.div 
                  layout
                  variants={scaleIn}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={prod.id || prod._id} 
                  className="group flex flex-col bg-white border border-neutral-200/80 rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500 relative"
                >
                  {prod.discount_price && (
                    <span className="absolute top-6 left-6 z-10 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Flame className="h-3 w-3" /> Offer Active
                    </span>
                  )}

                  {/* High Fidelity Media Frame */}
                  <div className="relative aspect-[1/1] overflow-hidden mb-5 bg-gradient-to-b from-neutral-50 to-white rounded-2xl flex items-center justify-center p-6 border border-neutral-100 group-hover:bg-white transition-colors duration-500">
                    <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="w-full h-full flex items-center justify-center relative z-10">
                      <img 
                        src={getImageUrl(prod.images?.[0] || prod.image_url)} 
                        className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-700 ease-out" 
                        alt={prod.name} 
                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpeg'; }}
                      />
                    </Link>
                    <div className="absolute inset-0 bg-neutral-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Informational Context Frame */}
                  <div className="flex-1 flex flex-col justify-between px-1">
                    <div className="mb-4">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="flex-1">
                          <h4 className="text-xs font-black tracking-tight text-neutral-950 group-hover:text-[#3a533a] transition-colors line-clamp-2 uppercase min-h-[2.5rem]">
                            {prod.name}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 border border-amber-200/50">
                          <Star size={11} fill="currentColor" /> {prod.rating || '5.0'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 mt-2">
                        <span className="text-base font-black text-neutral-900 font-mono">₹{prod.discount_price || prod.price}</span>
                        {prod.discount_price && (
                          <span className="text-xs text-gray-400 line-through font-mono">₹{prod.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Transaction Execution Action Matrix */}
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={(e) => handleQuickAdd(e, prod.id || prod._id)}
                        className="w-full bg-neutral-950 hover:bg-[#3a533a] text-white font-black text-[11px] uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-sm hover:shadow-lg hover:shadow-[#3a533a]/10 transform active:scale-95"
                      >
                        <ShoppingBag size={14} /> Secure Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Brand Ethos & Advanced Engineering Laboratory Matrix */}
      <section className="py-24 bg-gradient-to-b from-[#f4f7f4] to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="text-[#3a533a] text-xs font-black uppercase tracking-[0.3em] block">Automotive Electronics Engineering</span>
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 uppercase leading-none">
                Pure Staging. <br />
                <span className="bg-gradient-to-r from-[#3a533a] to-[#141f14] bg-clip-text text-transparent">Zero Cable Splice.</span>
              </h3>
              <p className="text-neutral-600 font-semibold text-sm leading-relaxed">
                Every screen assembly and audio array configuration incorporates clean wire harness couplings to keep vehicle factory warranties safe from unauthorized splicing.
              </p>
              
              <div className="space-y-4 pt-2">
                {[
                  "True OEM Socket Match Harness Connections (Zero Splice)",
                  "High-Intensity Heat Shielding Core Cables & Gold Terminals",
                  "Perfect Flush Dashboard Trim Panels with Factory Textured Matching"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#3a533a] shrink-0" />
                    <span className="text-xs font-black uppercase text-neutral-800">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase bg-neutral-950 hover:bg-[#3a533a] text-white px-8 py-4 rounded-xl transition-all shadow-md">
                  Explore Configurations <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="relative aspect-video lg:aspect-square bg-gradient-to-br from-[#3a533a] to-neutral-950 rounded-[3rem] p-12 overflow-hidden flex flex-col justify-between shadow-2xl shadow-[#141f14]/20 group"
            >
              <div className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay transform group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('/logo.jpeg')" }} />
              <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                <Sliders className="h-8 w-8 text-neutral-300 animate-pulse" />
              </div>
              <div className="relative z-10 text-white mt-auto max-w-sm">
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <blockquote className="text-lg font-bold italic leading-snug uppercase tracking-tight">
                  "The frequency alignment of the signature dashboard staging components outputs pristine resolution across complex acoustic environments."
                </blockquote>
                <cite className="block text-[10px] uppercase tracking-widest font-black text-[#7ca17c] mt-4 not-italic">
                  — Custom Audio Installer Federation
                </cite>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Immersive Video Guide Stream & Technical FAQ Integration */}
      <section className="py-24 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950">
              Need Verification Guides?
            </h3>
            <p className="text-neutral-500 text-xs font-semibold mt-2 leading-relaxed">
              Our support engineers provide step-by-step video setup instructions for mounting music panels, routing power lines, and managing active CANBUS steering mappings safely.
            </p>
            <div className="mt-6">
              <a 
                href="https://youtube.com" target="_blank" rel="noreferrer" 
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#3a533a] text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-neutral-950 transition-all shadow-md"
              >
                <PlayCircle size={16} /> View Video Guides
              </a>
            </div>
          </div>

          {/* Interactive Accordion FAQ Engine */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-4 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-6 px-2">
              <HelpCircle className="h-5 w-5 text-[#3a533a]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-950">Frequently Explored Mechanics</h4>
            </div>

            {[
              { q: "Will installing these stereo panels void my vehicle electrical warranty?", a: "No. All premium kits utilize native plug-and-play coupler harness components, requiring completely zero wire slicing or permanent modifications." },
              { q: "Are the infotainment systems fully compatible with standard steering controls?", a: "Yes, our systems include pre-mapped physical CANBUS decoding modules to maintain complete steering wheel control wheel integration natively." },
              { q: "What premium cooling architecture is used to prevent unit overheating?", a: "Each device features a heavy-duty continuous extrusion aluminum heatsink alongside a multi-speed silent internal exhaust fan matrix." }
            ].map((faq, fIdx) => (
              <div key={fIdx} className="border-b border-neutral-100 last:border-none pb-4 last:pb-0">
                <button
                  onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                  className="w-full flex items-center justify-between text-left py-3 group"
                >
                  <span className="text-xs font-black uppercase tracking-wide text-neutral-800 group-hover:text-[#3a533a] transition-colors">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-300 transform ${activeFaq === fIdx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === fIdx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-neutral-500 font-semibold leading-relaxed pt-1 pb-3 px-2 bg-[#f4f7f4] rounded-xl mt-1">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
