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
      className="group flex items-center justify-center"
    >
      <Link
        to={`/product/${prod.slug || prod.id || prod._id}`}
        className="w-full aspect-square flex items-center justify-center"
      >
        <img
          src={getImageUrl(prod.images?.[0] || prod.image_url)}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
          alt={prod.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/logo.jpeg';
          }}
        />
      </Link>
    </motion.div>
  ))}
</AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Brand Ethos & Advanced Engineering Laboratory Matrix */}
      


      {/* Architectural Table Specifications Matrix Breakdown Section */} 
      <section className="py-24 bg-white border-b border-neutral-100"> <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"> <div className="lg:col-span-5 space-y-6"> <span className="text-[#3a533a] text-xs font-black uppercase tracking-[0.35em] block">Certified Performance Metrics</span> <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-neutral-950"> Architectural <br /> <span className="text-[#3a533a]">Specifications</span> </h2> <p className="text-neutral-500 text-xs font-bold leading-relaxed"> Review verified mechanical tolerances, DSP routing matrices, and installation footprints benchmarked inside our custom modification laboratory. </p> <div className="grid grid-cols-2 gap-4 pt-2"> <div className="p-4 rounded-2xl bg-[#f4f7f4] border border-neutral-200/50"> <Gauge className="h-5 w-5 text-[#3a533a] mb-2" /> <div className="text-lg font-black text-neutral-900 font-mono">0.02ms</div> <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">DSP Group Delay Latency</div> </div> <div className="p-4 rounded-2xl bg-[#f4f7f4] border border-neutral-200/50"> <Radio className="h-5 w-5 text-[#3a533a] mb-2" /> <div className="text-lg font-black text-neutral-900 font-mono">5.0 GHz</div> <div className="text-[10px] font-bold text-neutral-400 uppercase mt-0.5">Wireless CarPlay Link</div> </div> </div> </div> <div className="lg:col-span-7"> <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 shadow-sm"> <table className="w-full text-left border-collapse bg-white text-xs"> <thead> <tr className="bg-neutral-950 text-white font-black uppercase tracking-wider text-[10px]"> <th className="p-4">Hardware Line</th> <th className="p-4">Integration Standard</th> <th className="p-4">Warranty Scope</th> </tr> </thead> <tbody className="divide-y divide-neutral-100 text-neutral-700 font-medium"> <tr> <td className="p-4 font-bold text-neutral-900">Anritvox 360 Player (BHU-58)</td> <td className="p-4">OEM Socket-Coupled (No Splice)</td> <td className="p-4">2-Year Replacement Protect</td> </tr> <tr> <td className="p-4 font-bold text-neutral-900">AV-P2810 Mid-Range Array</td> <td className="p-4">High-Excursion Gold Terminal</td> <td className="p-4">2-Year Full Hardware Protect</td> </tr> <tr> <td className="p-4 font-bold text-neutral-900">Ambient Lighting Systems</td> <td className="p-4">CANBUS Module Addressable</td> <td className="p-4">1-Year System Protect</td> </tr> </tbody> </table> </div> </div> </div> </div> </section>

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

      {/* Floating WhatsApp Button */}
<a
  href="https://wa.me/919217731435"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Get Help"
  className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-110 hover:shadow-[0_10px_35px_rgba(37,211,102,0.5)]"
>
  {/* Help / Support Icon */}
  <svg
    viewBox="0 0 24 24"
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2z" />
    <path d="M20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z" />
    <path d="M15 19a3 3 0 0 1-3 2h-1" />
  </svg>
</a>
    </div>
  );
}
