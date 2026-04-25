import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiClock, FiZap, FiStar, FiChevronRight } from 'react-icons/fi';
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
          productsApi.getAllActive({ limit: 8 }),
          categoriesApi.getAll(),
          bannersApi.getActive()
        ]);
        setFeaturedProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.data || []));
        setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        setBanners(Array.isArray(banRes.data) ? banRes.data : []);
      } catch (err) {
        console.error("Home initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-mono uppercase tracking-[0.3em] text-xs">Initializing Anritvox Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[85vh] overflow-hidden bg-black flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          {banners[0] ? (
            <img 
              src={banners[0].image_url} 
              alt="Hero" 
              className="w-full h-full object-cover opacity-60 scale-105"
            />
          ) : (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover opacity-40" />
          )}
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
              <FiZap className="animate-pulse" /> Next-Gen Automotive Gear
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
              Precision <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Engineering.</span><br/>
              Ultimate Style.
            </h1>
            <p className="text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
              Deploy industrial-grade lighting, acoustics, and performance hardware directly to your vehicle with Anritvox’s proprietary catalog.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-none font-black uppercase tracking-widest transition-all hover:translate-x-1">
                Access Catalog <FiArrowRight />
              </Link>
              <Link to="/about" className="flex items-center gap-3 border border-white/20 hover:border-white/50 text-white px-8 py-4 rounded-none font-bold uppercase tracking-widest transition-all">
                Our DNA
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-slate-900 py-6 border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 text-slate-400 group">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors"><FiShield /></div>
              <div className="text-xs font-black uppercase tracking-widest">Certified Hardware</div>
            </div>
            <div className="flex items-center gap-4 text-slate-400 group">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors"><FiTruck /></div>
              <div className="text-xs font-black uppercase tracking-widest">Rapid Logistics</div>
            </div>
            <div className="flex items-center gap-4 text-slate-400 group">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors"><FiClock /></div>
              <div className="text-xs font-black uppercase tracking-widest">24/7 Nexus</div>
            </div>
            <div className="flex items-center gap-4 text-slate-400 group">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors"><FiStar /></div>
              <div className="text-xs font-black uppercase tracking-widest">Elite Grade</div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">The Selection</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">Featured Hardware</h3>
            </div>
            <Link to="/shop" className="hidden md:flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest hover:text-emerald-600 transition-colors">
              View All <FiChevronRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => {
              // Exact routing mapped to App.jsx specs
              const prodId = product.id || product._id || `home-feat-${index}`;
              const productLink = product.slug ? `/product/slug/${product.slug}` : `/product/${prodId}`;
              
              // Handle parsed JSON images if MySQL returns them stringified
              const parsedImage = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;

              return (
                <Link key={prodId} to={productLink} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-slate-100 mb-6 border border-slate-100 group-hover:border-emerald-500/20 transition-all">
                    <img 
                      src={parsedImage?.[0] || 'https://via.placeholder.com/500'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {product.flash_sale_active && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-black text-[10px] font-black px-2 py-1 uppercase">Limited Drop</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-black px-6 py-3 font-bold uppercase text-xs tracking-widest">Inspect Gear</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category_name}</div>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight uppercase">{product.name}</h4>
                    <div className="text-xl font-mono text-slate-900">₹{product.price?.toLocaleString()}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 blur-[120px] rounded-full translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-8">
            Upgrade Your <span className="text-emerald-400 italic">Drive Experience</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-12">
            Don't settle for stock. Join the Anritvox elite and equip your vehicle with the industry's most advanced hardware.
          </p>
          <Link to="/shop" className="inline-flex items-center gap-4 bg-white hover:bg-emerald-500 hover:text-white text-black px-12 py-5 rounded-none font-black uppercase tracking-widest transition-all">
            Enter The Shop <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
