import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Truck, Zap, Star, 
  ShoppingBag, Award, Headphones, PlayCircle,
  Sparkles, CheckCircle2, Flame, Heart, Eye,
  ArrowUpRight, Users, ShoppingCart, ShieldCheck,
  RefreshCw, Layers, Sliders, ChevronDown, HelpCircle
} from 'lucide-react';
import { 
  products as productsApi, 
  categories as categoriesApi,
  cart as cartApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import HeroSection from '../components/HeroSection'; 
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
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 20 } }
};

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast() || {};
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ products: [], categories: [] });
  const [selectedTab, setSelectedTab] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

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
    <div className="min-h-screen bg-slate-50 pt-24 px-6 space-y-12 max-w-7xl mx-auto">
       <SkeletonBlock className="w-full h-[60vh] rounded-[2.5rem] bg-slate-200" />
       <div className="h-8 w-64 bg-slate-200 rounded-md animate-pulse mx-auto" />
       <ProductGridSkeleton count={8} />
    </div>
  ); 

  return (
    <div className="bg-white text-slate-900 selection:bg-emerald-700 selection:text-white overflow-hidden font-sans">
      
      {/* Dynamic Immersive Hero Section Layer */}
      <HeroSection />

      {/* Corporate trust and engineering parameters segment */}
      <section className="py-16 border-y border-gray-100 bg-gradient-to-b from-white to-gray-50/60 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12"
          >
            {[
              { icon: <ShieldCheck className="h-6 w-6 text-emerald-700" />, label: "Guaranteed Fitment", sub: "100% Secure OEM Compatibility Matching" },
              { icon: <Truck className="h-6 w-6 text-emerald-700" />, label: "Express Distribution", sub: "Fully Insured Safe Pan India Shipping Support" },
              { icon: <Award className="h-6 w-6 text-emerald-700" />, label: "Enterprise Warranty", sub: "Direct Simple Replacement Diagnostics" },
              { icon: <Headphones className="h-6 w-6 text-emerald-700" />, label: "24/7 Priority Hotline", sub: "Direct Technical Configuration Support" }
            ].map((item, i) => (
              <motion.div variants={fadeUp} key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-gray-900">{item.label}</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dynamic Collection Showcase Hub (Tabbed Product Architecture) */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-items-end md:flex-row md:justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 mb-4">
                <Sparkles className="h-3 w-3" /> Elite Performance Upgrades
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 uppercase">
                Explore Our <span className="bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">Premium Collection</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3 font-medium leading-relaxed">
                Precision engineered infotainment units, audiophile-grade studio acoustic profiles, high-intensity ambient modules, and complete dashboard electronic custom solutions.
              </p>
            </div>

            {/* Micro-Interaction Interactive Category Filtering Engine */}
            <div className="flex flex-wrap gap-2 items-center">
              {['all', 'audio', 'lighting', 'dashboard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                    selectedTab === tab 
                      ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-800/10' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                  }`}
                >
                  {tab === 'all' ? 'All Accessories' : `${tab} Upgrades`}
                </button>
              ))}
            </div>
          </div>

          {/* Hyper-Dense Product Grid Layer */}
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
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={prod.id || prod._id} 
                  className="group flex flex-col bg-white border border-gray-100 hover:border-emerald-700/30 rounded-[2rem] p-4 shadow-sm hover:shadow-xl transition-all duration-500 relative bg-gradient-to-b from-white to-gray-50/30"
                >
                  {prod.discount_price && (
                    <span className="absolute top-6 left-6 z-10 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Flame className="h-3 w-3" /> Hot Offer
                    </span>
                  )}

                  {/* High Fidelity Media Frame */}
                  <div className="relative aspect-[4/4] overflow-hidden mb-5 bg-gradient-to-b from-gray-50 to-white rounded-2xl flex items-center justify-center p-6 border border-gray-100 group-hover:bg-white transition-colors duration-500">
                    <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="w-full h-full flex items-center justify-center relative z-10">
                      <img 
                        src={getImageUrl(prod.images?.[0] || prod.image_url)} 
                        className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-700 ease-out" 
                        alt={prod.name} 
                        onError={(e) => { e.target.onerror = null; e.target.src = '/logo.jpeg'; }}
                      />
                    </Link>
                    <div className="absolute inset-0 bg-emerald-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* Informational Context Frame */}
                  <div className="flex-1 flex flex-col justify-between px-1">
                    <div className="mb-4">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="flex-1">
                          <h4 className="text-sm font-black tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 uppercase min-h-[2.5rem]">
                            {prod.name}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 border border-amber-200/50">
                          <Star size={11} fill="currentColor" /> {prod.rating || '5.0'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 mt-2">
                        <span className="text-lg font-black text-gray-900 font-mono">₹{prod.discount_price || prod.price}</span>
                        {prod.discount_price && (
                          <span className="text-xs text-gray-400 line-through font-mono">₹{prod.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Transaction Execution Action Matrix */}
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={(e) => handleQuickAdd(e, prod.id || prod._id)}
                        className="flex-1 bg-gray-900 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest py-3.5 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-sm hover:shadow-lg hover:shadow-emerald-700/10 transform active:scale-95"
                      >
                        <ShoppingBag size={14} /> Add To Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Interactive Live Metrics Counter Dashboard */}
      <section className="py-20 bg-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            {[
              { label: "Satisfied Drivers", val: "45K+", sub: "Verified Installations" },
              { label: "Premium Hardware Lines", val: "320+", sub: "Direct OEM Sourced" },
              { label: "Custom Setup Hubs", val: "150+", sub: "Pan India Support Networks" },
              { label: "Acoustic Accuracy", val: "99.8%", sub: "DTS Digital Tuning Parity" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="p-6 border border-emerald-900 rounded-2xl bg-emerald-900/20 backdrop-blur-sm hover:border-emerald-500/30 transition-colors"
              >
                <div className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">{stat.val}</div>
                <div className="text-xs font-bold text-gray-200 mt-2 uppercase tracking-wider">{stat.label}</div>
                <div className="text-[10px] font-medium text-emerald-300 mt-1 uppercase">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Ethos & Advanced Engineering Laboratory Matrix */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="text-emerald-700 text-xs font-black uppercase tracking-[0.3em] block">Automotive Electronics Architecture</span>
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 uppercase leading-none">
                Pure Acoustics. <br />
                <span className="bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent">Zero Cable Splice.</span>
              </h3>
              <p className="text-gray-600 font-medium text-sm leading-relaxed">
                Every audio kit and infotainment configuration features explicit plug-and-play harness integration to retain full factory wire warranty compatibility without risk.
              </p>
              
              <div className="space-y-4 pt-2">
                {[
                  "True OEM Socket Match Harness Connections (Zero Splice)",
                  "High-Intensity Heat Shielding Core Cables & Gold Terminals",
                  "Perfect Flush Dashboard Trim Panels with Factory Textured Matching"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                    <span className="text-sm font-bold text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase bg-gray-900 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl transition-all shadow-md">
                  Explore Configurations <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="relative aspect-video lg:aspect-square bg-gradient-to-br from-emerald-900 to-slate-950 rounded-[3rem] p-12 overflow-hidden flex flex-col justify-between shadow-2xl shadow-emerald-950/20 group"
            >
              <div className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay transform group-hover:scale-105 transition-transform duration-1000" style={{ backgroundImage: "url('/logo.jpeg')" }} />
              <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20">
                <Sliders className="h-8 w-8 text-emerald-400 animate-pulse" />
              </div>
              <div className="relative z-10 text-white mt-auto max-w-sm">
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <blockquote className="text-lg font-bold italic leading-snug">
                  "The frequency alignment of the signature dashboard staging components outputs pristine resolution across complex acoustic environments."
                </blockquote>
                <cite className="block text-xs uppercase tracking-widest font-black text-emerald-400 mt-4 not-italic">
                  — Custom Audio Installer Federation
                </cite>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Immersive Video Guide Stream & Technical FAQ Integration */}
      <section className="py-24 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
              Need Setup Assistance?
            </h3>
            <p className="text-gray-500 text-sm mt-3 font-medium leading-relaxed">
              Our support team provides step-by-step video setup instructions for installing premium music panels, routing power cables, and updating custom firmware safely.
            </p>
            <div className="mt-6">
              <a 
                href="https://youtube.com" target="_blank" rel="noreferrer" 
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-gray-900 transition-all shadow-md shadow-emerald-700/10"
              >
                <PlayCircle size={16} /> View Video Setup Guides
              </a>
            </div>
          </div>

          {/* Interactive Accordion FAQ Engine */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-4 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-6 px-2">
              <HelpCircle className="h-5 w-5 text-emerald-700" />
              <h4 className="text-sm font-black uppercase tracking-wider text-gray-900">Frequently Explored Mechanics</h4>
            </div>

            {[
              { q: "Will installing these stereo panels void my vehicle electrical warranty?", a: "No. All premium kits utilize native plug-and-play coupler harness components, requiring completely zero wire slicing or permanent modifications." },
              { q: "Are the infotainment systems fully compatible with standard steering controls?", a: "Yes, our systems include pre-mapped physical CANBUS decoding modules to maintain complete steering wheel control wheel integration natively." },
              { q: "What premium cooling architecture is used to prevent unit overheating?", a: "Each device features a heavy-duty continuous extrusion aluminum heatsink alongside a multi-speed silent internal exhaust fan matrix." }
            ].map((faq, fIdx) => (
              <div key={fIdx} className="border-b border-gray-100 last:border-none pb-4 last:pb-0">
                <button
                  onClick={() => setActiveFaq(activeFaq === fIdx ? null : fIdx)}
                  className="w-full flex items-center justify-between text-left py-3 group"
                >
                  <span className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 transform ${activeFaq === fIdx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === fIdx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs text-gray-500 font-medium leading-relaxed pt-1 pb-3 px-1 bg-gray-50/50 rounded-lg">
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
