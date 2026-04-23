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
          api.get('/products/active'),
          api.get('/categories'),
          api.get('/banners').catch(() => ({ data: [] }))
        ]);
        // Extract data array correctly (assuming { success: true, data: [...] })
        const productsData = pRes.data?.data || pRes.data || [];
        setProducts(productsData.slice(0, 8));
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
      {/* 1. ULTRA-MODERN HERO SLIDER */}
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
          <p className="max-w-xl text-slate-400 text-lg font-medium leading-relaxed">
            The world's most advanced e-commerce ecosystem. Experience hyper-speed logistics, 
            AI-driven inventory, and the next generation of user experience.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/shop" className="group/btn bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95">
              Enter Shop <ArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
            </Link>
            <Link to="/admin/login" className="bg-slate-900/80 border border-slate-800 px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all">
              <Lock size={18} /> Admin Panel
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC STATS GRID */}
      <section className="py-20 border-y border-slate-900 bg-black/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: 'Global Reach', value: '200+', sub: 'Countries', icon: Globe },
            { label: 'Authenticity', value: '100%', sub: 'Verified', icon: Award },
            { label: 'Live Support', value: '24/7', sub: 'Instant', icon: LifeBuoy },
            { label: 'Scalability', value: '1B+', sub: 'Products', icon: Database },
          ].map((s, i) => (
            <div key={i} className="space-y-2 border-l border-slate-800 pl-8">
              <s.icon className="text-emerald-500 mb-4" size={24} />
              <div className="text-4xl font-black tracking-tighter">{s.value}</div>
              <div className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURE REGISTRY HUB */}
      <section className="py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-10 space-y-20">
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <div className="text-emerald-500 font-black uppercase tracking-[0.3em] text-xs">System Modules</div>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Feature Registry</h2>
            </div>
            <Link to="/about" className="text-slate-500 hover:text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors">
              Explore Documentation <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Smart Inventory', desc: 'Real-time stock audit with 100% precision.', icon: Archive },
              { title: 'User HQ', desc: 'Personalized control center for all transactions.', icon: Layout },
              { title: 'Comparison Engine', desc: 'Matrix-based product benchmarking.', icon: BarChart },
              { title: 'Flash Sales', desc: 'Dynamic scheduler for global time-limited events.', icon: Zap },
              { title: 'Loyalty Club', desc: 'Advanced rewards algorithm for power users.', icon: Gift },
              { title: 'Admin Console', desc: '100+ control toggles for system configuration.', icon: Command },
            ].map((f, i) => (
              <div key={i} className="group p-10 bg-slate-900/30 border border-slate-900 rounded-[2.5rem] hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-500">
                <f.icon className="text-slate-600 group-hover:text-emerald-500 transition-colors mb-8" size={32} />
                <h3 className="text-xl font-black uppercase mb-3">{f.title}</h3>
                <p className="text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUCT GRID (AMAZON STYLE BUT MODERN) */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-10 space-y-20">
          <div className="flex justify-between items-center">
            <h2 className="text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
              <Flame className="text-orange-500" /> New Arrivals
            </h2>
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-900 cursor-pointer transition">
                <ChevronRight className="rotate-180" size={20} />
              </div>
              <div className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-900 cursor-pointer transition">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.length > 0 ? products.map((product) => (
              <div key={product.id || product._id} className="group relative bg-[#0a0a0a] border border-slate-900 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
                {/* Image Wrapper */}
                <div className="aspect-square bg-slate-900 relative overflow-hidden">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999'} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
                    <button className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-2xl">
                      <ShoppingCart size={18} onClick={() => addToCart(product)} />
                    </button>
                    <button className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                      <Heart size={18} />
                    </button>
                    <Link to={`/product/${product.id || product._id}`} className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                      <Eye size={18} />
                    </Link>
                  </div>
                  {product.is_new && (
                    <div className="absolute top-4 left-4 bg-emerald-500 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                      New
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black uppercase truncate max-w-[150px]">{product.name}</h3>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{product.category_name || 'Premium'}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-black text-xl">₹{product.price}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= (product.rating || 5) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-800'} />
                    ))}
                    <span className="text-[10px] text-slate-600 font-bold ml-2">(128)</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-20 text-slate-700 font-black uppercase tracking-[0.5em]">
                Product Matrix Synchronizing...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. SYSTEM HQ CONSOLE (ADMIN ACCESS) */}
      <section className="bg-[#0a0a0a] py-40 border-y border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-4xl mx-auto px-10 relative z-10 text-center space-y-12">
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl mx-auto flex items-center justify-center">
            <Cpu className="text-emerald-500 animate-pulse" size={40} />
          </div>
          <div className="space-y-4">
            <h2 className="text-6xl font-black uppercase tracking-tighter">System HQ</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
              Unlock complete system control. Manage global logistics, audit 
              inventories, and monitor the entire Anritvox network from a single console.
            </p>
          </div>
          <Link to="/admin" className="inline-flex items-center gap-4 bg-emerald-500 text-slate-950 px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
            Access Command Center <ArrowRight />
          </Link>
        </div>
      </section>

      {/* 6. VOID FOOTER */}
      <footer className="py-20 text-center space-y-4">
        <div className="text-slate-700 font-black uppercase tracking-[1em] text-[10px]">Anritvox Digital Corp</div>
        <div className="flex items-center justify-center gap-6 text-[10px] font-black text-slate-800 uppercase tracking-widest">
          <span>Build 4.2.0-STABLE</span>
          <span className="w-1 h-1 bg-slate-800 rounded-full" />
          <span>Node IN-WB-01</span>
          <span className="w-1 h-1 bg-slate-800 rounded-full" />
          <span>Matrix Protocol Active</span>
        </div>
      </footer>
    </div>
  );
}
