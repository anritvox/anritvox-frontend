import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Shield, Truck, Clock, Zap, Star, ChevronRight, 
  ShoppingBag, Award, Headphones, Play, Search, Box, Flame
} from 'lucide-react';
import { products as productsApi, categories as categoriesApi, banners as bannersApi } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [prodRes, catRes, banRes] = await Promise.all([
          productsApi.getAllActive({ limit: 8, featured: true }),
          categoriesApi.getAll(),
          bannersApi.getActive()
        ]);
        setFeaturedProducts(prodRes.data?.data || prodRes.data || []);
        setCategories(catRes.data?.data || catRes.data || []);
        setBanners(banRes.data?.data || banRes.data || []);
      } catch (err) {
        console.error("Home initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-black text-white selection:bg-emerald-500 selection:text-black">
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <Flame size={14} className="animate-bounce" /> 2026 Hardware Evolution
            </div>
            <h1 className="text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
              Lumina <span className="text-transparent stroke-text">Series</span><br/>
              <span className="text-emerald-500">Projectors.</span>
            </h1>
            <p className="text-lg font-bold text-slate-500 max-w-lg mb-12 leading-relaxed">
              Experience the pinnacle of automotive lighting. Over 15,000 lumens of pure, focused vision. Engineered for the dark.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/shop" className="px-12 py-6 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all flex items-center gap-4">
                Explore Gear <ArrowRight size={20} />
              </Link>
              <button className="px-12 py-6 bg-slate-900 border border-slate-800 text-white font-black uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all">
                Watch Reveal
              </button>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse"></div>
            <img 
              src="https://www.anritvox.com/logo.webp" 
              alt="Hero" 
              className="relative z-10 w-full h-auto drop-shadow-[0_0_50px_rgba(16,185,129,0.3)] animate-float"
            />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-12 border-y border-slate-900 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-12">
          {[
            { icon: <Shield />, label: "Certified Fitment", sub: "100% Guaranteed" },
            { icon: <Truck />, label: "Express Delivery", sub: "Pan India Support" },
            { icon: <Award />, label: "Premium Warranty", sub: "Instant Replacement" },
            { icon: <Headphones />, label: "Expert Support", sub: "24/7 Tech Line" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="p-3 bg-slate-900 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                {item.icon}
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">The Collection</h2>
              <h3 className="text-6xl font-black uppercase tracking-tighter">Gear Up By <br/> <span className="text-slate-700">Category.</span></h3>
            </div>
            <Link to="/shop" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all">
              View All Systems <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((cat, i) => (
              <Link key={cat.id || i} to={`/shop?category=${cat.id}`} className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800">
                <img 
                  src={cat.image_url || 'https://www.anritvox.com/logo.webp'} 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" 
                  alt={cat.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-8 flex flex-col justify-end">
                  <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">{cat.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all">Explore Hardware</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.5em] mb-4">Elite Selection</h2>
            <h3 className="text-7xl font-black uppercase tracking-tighter">New Arrivals.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((prod) => (
              <Link 
                key={prod.id || prod._id} 
                to={`/product/${prod.slug || prod.id || prod._id}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-square bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 mb-6">
                  <img 
                    src={prod.image_url || 'https://www.anritvox.com/logo.webp'} 
                    className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500" 
                    alt={prod.name} 
                  />
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white text-black rounded-full shadow-xl hover:bg-emerald-400 transition-all">
                      <ShoppingBag size={18} />
                    </button>
                  </div>
                  {prod.discount_price && (
                    <div className="absolute top-6 left-6 px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-lg">
                      Hot Deal
                    </div>
                  )}
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-black uppercase tracking-tight line-clamp-1 group-hover:text-emerald-500 transition-colors">{prod.name}</h4>
                    <div className="flex items-center gap-1 text-emerald-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs font-black">{prod.rating || '5.0'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black">₹{prod.discount_price || prod.price}</span>
                    {prod.discount_price && (
                      <span className="text-sm font-bold text-slate-600 line-through">₹{prod.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-24 text-center">
            <Link to="/shop" className="inline-flex items-center gap-4 px-16 py-6 bg-slate-900 border border-slate-800 rounded-full font-black uppercase tracking-widest hover:border-emerald-500/50 transition-all">
              View Full Catalogue <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-600 opacity-20 blur-[150px] animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 bg-slate-900 border border-slate-800 rounded-[4rem] p-24 text-center overflow-hidden">
          <div className="absolute top-0 right-0 p-24 opacity-5">
            <Shield size={400} />
          </div>
          <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[1em] mb-8">Integrated Protection</h2>
          <h3 className="text-8xl font-black uppercase tracking-tighter mb-12">Register Your <br/> <span className="text-transparent stroke-text">Hardware.</span></h3>
          <p className="text-xl text-slate-400 font-bold max-w-2xl mx-auto mb-16 leading-relaxed">
            Activate your E-Warranty today and get 100% replacement coverage for any manufacturing defects. Zero questions asked.
          </p>
          <Link to="/warranty" className="px-16 py-8 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_50px_rgba(16,185,129,0.4)]">
            Activate Warranty Node
          </Link>
        </div>
      </section>

    </div>
  );
}
