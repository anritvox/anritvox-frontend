import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Server, ChevronRight, ChevronLeft, Loader2, Cpu } from "lucide-react";
import api, { BASE_URL } from "../services/api";

export default function Home() {
  const [data, setData] = useState({
    heroBanners: [],
    promoBanners: [],
    featuredProducts: [],
    newArrivals: [],
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadHomepageData = async () => {
      setLoading(true);
      
      const [bannersRes, productsRes] = await Promise.allSettled([
        api.get('/banners').catch(() => ({ data: [] })), 
        api.get('/products/active').catch(() => api.get('/products')).catch(() => ({ data: [] }))
      ]);

      if (!isMounted) return;

      let fetchedBanners = [];
      if (bannersRes.status === 'fulfilled') {
        const rawBanners = bannersRes.value?.data?.data || bannersRes.value?.data || [];
        fetchedBanners = Array.isArray(rawBanners) ? rawBanners : [];
      }

      let fetchedProducts = [];
      if (productsRes.status === 'fulfilled') {
        const rawProducts = productsRes.value?.data?.data || productsRes.value?.data || [];
        fetchedProducts = Array.isArray(rawProducts) ? rawProducts : [];
      }

      const heroBanners = fetchedBanners.filter(b => !b.position || b.position === 'hero' || b.position === 'top');
      const promoBanners = fetchedBanners.filter(b => b.position === 'mid' || b.position === 'promo');

      setData({
        heroBanners,
        promoBanners,
        featuredProducts: fetchedProducts.slice(0, 4),
        newArrivals: fetchedProducts.slice(0, 8),
      });

      setLoading(false);
    };

    loadHomepageData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (data.heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data.heroBanners.length]);

  // FIXED: Bulletproof image resolver. Prevents crashes from nulls, objects, or non-strings.
  const resolveImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '/logo.webp';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^[\/\\]/, '').replace(/^uploads[\/\\]/, '');
    return `${BASE_URL}/uploads/${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest animate-pulse">Initializing Master Node...</div>
        </div>
      </div>
    );
  }

  const displayHeroBanners = data.heroBanners.length > 0 ? data.heroBanners : [{
    id: 'default-1',
    image_url: '/logo.webp',
    title: 'ANRITVOX CORE INFRASTRUCTURE',
    subtitle: 'Next-Generation Asset Management & Security Modules',
    link: '/shop'
  }];

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-black flex items-center justify-center border-b border-white/5">
        {displayHeroBanners.map((banner, index) => (
          <div 
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className="absolute inset-0 bg-black/60 z-10" /> 
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
            <img 
              src={resolveImageUrl(banner.image_url)} 
              alt={banner.title || 'Anritvox Banner'} 
              className="w-full h-full object-cover opacity-60 scale-105 transform transition-transform duration-[10s] ease-out hover:scale-100"
            />
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-6 animate-fade-in">
                <Cpu className="w-3 h-3" /> Verified Systems
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase drop-shadow-2xl">
                {banner.title || 'MASTER NODE SYSTEMS'}
              </h1>
              <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mb-10 tracking-tight">
                {banner.subtitle || 'Deploy premium tech infrastructure and secure your digital assets with our E-Warranty registry.'}
              </p>
              <Link 
                to={banner.link || '/shop'} 
                className="group px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] flex items-center gap-3"
              >
                Explore Hardware <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}

        {displayHeroBanners.length > 1 && (
          <>
            <button onClick={() => setCurrentSlide((p) => (p === 0 ? displayHeroBanners.length - 1 : p - 1))} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/50 backdrop-blur-md transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentSlide((p) => (p + 1) % displayHeroBanners.length)} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 border border-white/10 text-white hover:bg-purple-500/20 hover:text-purple-400 hover:border-purple-500/50 backdrop-blur-md transition-all">
              <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {displayHeroBanners.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="py-12 bg-[#0a0c10] border-b border-white/5 relative z-20 -mt-8 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Server className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Premium Hardware</h3>
              <p className="text-xs text-gray-500 font-medium">Curated high-end tech</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Secure E-Warranty</h3>
              <p className="text-xs text-gray-500 font-medium">Digital certificate registry</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-6 rounded-3xl bg-black/40 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Express Fulfillment</h3>
              <p className="text-xs text-gray-500 font-medium">Pan-India rapid delivery</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">Latest Deployments</div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">New Arrivals</h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-purple-400 uppercase tracking-widest transition-colors">
            View All Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {data.newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.newArrivals.map((product) => {
              // Ensure we pass a clean string to the resolver, or fallback safely
              const rawImage = product.images?.[0] || product.image_url || '';
              const finalImageUrl = typeof rawImage === 'string' ? rawImage : '';
              
              return (
                <Link key={product.id} to={`/product/${product.id}`} className="group bg-[#0a0c10] border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all block relative">
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">
                    NEW
                  </div>
                  <div className="aspect-square bg-black relative overflow-hidden flex items-center justify-center">
                    <img 
                      src={resolveImageUrl(finalImageUrl)} 
                      alt={product.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">{product.brand || 'ANRITVOX CORE'}</div>
                    <h3 className="font-bold text-white text-lg tracking-tight mb-2 group-hover:text-purple-400 transition-colors line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-black text-lg text-white">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="w-full py-20 bg-[#0a0c10] border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center">
            <Cpu className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Catalog Offline</h3>
            <p className="text-sm text-gray-500 font-medium max-w-md">The product database is currently undergoing synchronization. Please check back shortly.</p>
          </div>
        )}
      </section>

      {data.promoBanners.length > 0 && (
        <section className="py-12 bg-black border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.promoBanners.slice(0, 2).map(banner => (
              <Link key={banner.id} to={banner.link || '/shop'} className="relative h-64 rounded-3xl overflow-hidden group block border border-white/5 hover:border-white/20 transition-all">
                <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-black/40 transition-colors" />
                <img src={resolveImageUrl(typeof banner.image_url === 'string' ? banner.image_url : '')} alt={banner.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{banner.title}</h3>
                  <p className="text-sm text-gray-300 font-medium mb-6 max-w-md">{banner.subtitle}</p>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform"/></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black z-0" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="w-20 h-20 mx-auto bg-purple-500/10 border border-purple-500/30 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
            <ShieldCheck className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6 drop-shadow-lg">Protect Your Assets</h2>
          <p className="text-lg text-gray-400 font-medium mb-10 max-w-2xl mx-auto">
            Register your hardware securely in our blockchain-inspired ledger. Instantly download your Certificate of Authenticity and receive a 1-Month Bonus extension.
          </p>
          <Link to="/ewarranty" className="inline-flex items-center gap-3 px-10 py-5 bg-purple-500 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-purple-600 hover:scale-105 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            Access Security Gateway <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
