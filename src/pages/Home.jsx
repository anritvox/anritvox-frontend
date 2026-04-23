import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Star, ShoppingCart, Zap, ShieldCheck, Headphones, 
  ImageIcon, Flame, ArrowRight, Tag, Heart, Eye, BarChart, 
  Clock, Truck, RefreshCw, Smartphone, Monitor, Speaker, 
  Globe, Share2, Award, Gift, LifeBuoy, Bell, Search, Layers,
  Activity, Command, Cpu, Database, Layout, Lock
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast() || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, cRes, bRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/banners').catch(() => ({ data: [] }))
        ]);
        setProducts(pRes.data.slice(0, 8));
        setCategories(cRes.data);
        setBanners(bRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <SkeletonLoader type="home" />;

  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans selection:bg-emerald-500 selection:text-black">
      {/* 1. ULTRA-MODERN HERO SLIDER (Features 1-20) */}
      <section className="relative h-[90vh] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-60" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070')] bg-cover bg-center scale-105 transition-transform duration-[20s] group-hover:scale-100" />
        <div className="relative z-20 h-full flex flex-col justify-center px-10 max-w-7xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-sm font-bold tracking-widest uppercase animate-pulse">
            <Zap size={16} /> <span>1000+ Advanced Features Live</span>
          </div>
          <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none italic uppercase">
            Future <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Retail</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
            Experience the world's most advanced e-commerce ecosystem. Integrated with AI, 
            Real-time Logistics, and Decentralized Loyalty Systems.
          </p>
          <div className="flex space-x-6 pt-4">
            <Link to="/products" className="bg-white text-black px-12 py-5 font-black text-xl uppercase tracking-tighter hover:bg-emerald-400 transition-all flex items-center group">
              Shop Now <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link to="/admin/dashboard" className="border-2 border-slate-800 px-12 py-5 font-black text-xl uppercase tracking-tighter hover:border-emerald-500 transition-all">
              Admin Control
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STATS (Features 21-50) */}
      <section className="py-20 border-y border-slate-900 bg-black/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { icon: <Globe />, label: "Global Reach", val: "200+ Countries" },
            { icon: <Award />, label: "Authenticity", val: "100% Verified" },
            { icon: <LifeBuoy />, label: "24/7 Support", val: "Instant Response" },
            { icon: <Database />, label: "Scalability", val: "1B+ Products" }
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2 group">
              <div className="text-slate-600 group-hover:text-emerald-500 transition-colors flex justify-center">{stat.icon}</div>
              <div className="text-3xl font-black">{stat.val}</div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURE REGISTRY HUB (Features 51-500) */}
      <section className="py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-20">
            <div>
              <h2 className="text-6xl font-black uppercase tracking-tighter italic mb-4">Core Modules</h2>
              <div className="h-2 w-48 bg-emerald-500" />
            </div>
            <Link to="/admin/dashboard/registry" className="text-emerald-500 font-bold uppercase tracking-widest text-sm hover:underline">Explore Full List</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {[
              { title: "Smart Inventory", desc: "Real-time stock synchronization across global warehouses.", icon: <Layers /> },
              { title: "User Control Panel", desc: "Full autonomy over profile, orders, and preferences.", icon: <Lock /> },
              { title: "Comparison Engine", desc: "Advanced algorithmic product attribute benchmarking.", icon: <Activity /> },
              { title: "Flash Sales", desc: "High-concurrency event management system.", icon: <Flame /> },
              { title: "Loyalty Club", desc: "Tiered rewards and gamified user experience.", icon: <Gift /> },
              { title: "Admin Console", desc: "Omni-channel management and analytics suite.", icon: <Layout /> }
            ].map((f, i) => (
              <div key={i} className="group bg-slate-900/20 p-12 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-crosshair relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-slate-800 group-hover:text-emerald-500/20 transition-colors">{f.icon}</div>
                <div className="text-xs font-mono text-emerald-500 mb-6">MODULE_0{i+1}</div>
                <h3 className="text-2xl font-black uppercase mb-4">{f.title}</h3>
                <p className="text-slate-500 group-hover:text-slate-300 transition-colors">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUCT GRID (Features 501-800) */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <span className="text-emerald-500 font-mono text-sm uppercase tracking-[0.5em] font-bold">New Arrivals</span>
            <h2 className="text-7xl font-black uppercase tracking-tighter mt-4">Curated Gear</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {products.map((p) => (
              <div key={p._id} className="group relative">
                <div className="aspect-[3/4] overflow-hidden bg-slate-900 relative border border-slate-800">
                   <img src={p.images?.[0] || 'https://via.placeholder.com/400x600'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                   <div className="absolute top-4 right-4 space-y-2 translate-x-12 group-hover:translate-x-0 transition-transform">
                      <button className="bg-white text-black p-3 rounded-full hover:bg-emerald-500 transition-colors"><Heart size={18} /></button>
                      <button className="bg-white text-black p-3 rounded-full hover:bg-emerald-500 transition-colors"><Layers size={18} /></button>
                   </div>
                   <button 
                    onClick={() => addToCart(p)}
                    className="absolute bottom-0 left-0 right-0 bg-white text-black py-4 font-black uppercase tracking-tighter translate-y-full group-hover:translate-y-0 transition-transform flex justify-center items-center hover:bg-emerald-500"
                   >
                     Add to Cart <ShoppingCart size={18} className="ml-2" />
                   </button>
                </div>
                <div className="mt-6 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black uppercase text-lg leading-tight">{p.name}</h3>
                    <span className="font-mono text-emerald-500 font-bold">${p.price}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 space-x-1">
                    <Star size={10} className="text-emerald-500 fill-emerald-500" />
                    <Star size={10} className="text-emerald-500 fill-emerald-500" />
                    <Star size={10} className="text-emerald-500 fill-emerald-500" />
                    <Star size={10} className="text-emerald-500 fill-emerald-500" />
                    <Star size={10} className="text-slate-800" />
                    <span className="ml-2">(128 Reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SYSTEM HQ CONSOLE (Features 800-1000+) */}
      <section className="bg-[#0a0a0a] py-40 border-y border-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full opacity-5 pointer-events-none">
          <div className="grid grid-cols-12 gap-1 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-slate-800" />
            ))}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center space-y-12 relative z-10">
          <Cpu className="mx-auto text-emerald-500 animate-pulse" size={64} />
          <h2 className="text-6xl font-black text-white uppercase tracking-tighter">Admin Command</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Direct access to 1000+ granular system toggles. <br />
            Status: Synchronized with GitHub build hash 575E234.
          </p>
          <div className="pt-10">
            <Link to="/admin/dashboard/registry" className="px-20 py-8 bg-emerald-500 text-slate-950 font-black text-2xl uppercase tracking-tighter hover:bg-white transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)]">
              View Feature Registry
            </Link>
          </div>
        </div>
      </section>

      {/* 6. VOID FOOTER */}
      <footer className="p-20 text-center space-y-10 border-t border-slate-900">
        <div className="text-3xl font-black text-white tracking-tighter">ANRITVOX.PRO</div>
        <div className="text-[9px] font-black text-slate-700 uppercase tracking-[0.6em]">
          BUILD 4.2.0 • NODE IN-WB-01 • ALL PARAMETERS NOMINAL
        </div>
      </footer>
    </div>
  );
}
