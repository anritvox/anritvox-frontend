// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, ShoppingCart, Zap, ShieldCheck, Headphones, ImageIcon, Flame, ArrowRight, Tag } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import SkeletonLoader from '../components/SkeletonLoader';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart();
  const { showToast } = useToast() || {}; 

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, bannersRes] = await Promise.all([
          api.get('/products/active'),
          api.get('/categories'),
          api.get('/banners') 
        ]);

        setProducts(productsRes.data?.data || productsRes.data || []);
        setCategories(categoriesRes.data?.data || categoriesRes.data || []);
        setBanners(bannersRes.data?.data || bannersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
        if (typeof showToast === 'function') {
          showToast('Failed to load some content', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const getProductImage = (product) => {
    if (product.image_url) return product.image_url;
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0].file_path || product.images[0];
    }
    return '/logo.webp'; 
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  // Extract deals dynamically based on discount logic
  const flashDeals = products.filter(p => calculateDiscount(p.price, p.discount_price) > 5).slice(0, 6);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <SkeletonLoader type="banner" />
        <SkeletonLoader type="grid" count={4} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      
      {/* Hide Scrollbar Style for Horizontal Carousels */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Hero Banner Section - Cinematic Layout */}
      {banners.length > 0 && (
        <section className="relative w-full h-[65vh] lg:h-[75vh] flex items-center justify-center bg-black overflow-hidden group">
          <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
            <img 
              src={banners[0].image_url} 
              alt={banners[0].title || "Hero Banner"}
              className="w-full h-full object-cover opacity-50"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          </div>
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto transform translate-y-4 opacity-0 animate-[fadeInUp_1s_ease-out_forwards]">
            <span className="inline-block py-1 px-3 rounded-full bg-[#39d353]/20 text-[#39d353] text-sm font-bold tracking-widest uppercase mb-4 backdrop-blur-md border border-[#39d353]/30">
              New Arrival
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
              {banners[0].title || 'Elevate Your Drive.'}
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto drop-shadow-md font-light">
              {banners[0].subtitle || 'Experience studio-quality sound and ultra-bright illumination built for the road.'}
            </p>
            <Link 
              to={banners[0].link_url || '/shop'}
              className="inline-flex items-center gap-3 bg-white text-black hover:bg-[#39d353] hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(57,211,83,0.8)]"
            >
              Explore Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Trust Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-2xl p-4 md:p-6 grid grid-cols-3 gap-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center md:text-left">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400"><Zap size={24} /></div>
          <div><p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Express Delivery</p><p className="text-xs text-gray-500 hidden md:block">Dispatched within 24h</p></div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center md:text-left border-l border-r border-gray-100 dark:border-gray-700">
          <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-full text-[#39d353]"><ShieldCheck size={24} /></div>
          <div><p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Secure Checkout</p><p className="text-xs text-gray-500 hidden md:block">100% Protected</p></div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center md:text-left">
          <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400"><Headphones size={24} /></div>
          <div><p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">Expert Support</p><p className="text-xs text-gray-500 hidden md:block">Installation guidance</p></div>
        </div>
      </div>

      {/* App-Style Horizontal Categories */}
      <section className="pt-16 pb-8 max-w-7xl mx-auto pl-4 md:px-8">
        <div className="flex items-center justify-between pr-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <Link to="/shop" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">See All <ChevronRight size={16}/></Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-6 hide-scrollbar snap-x">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/shop?category=${category.slug}`}
              className="flex-none w-28 md:w-36 snap-start group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3 transition-all duration-300 group-hover:border-[#39d353] group-hover:shadow-md group-hover:-translate-y-1">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gray-50 dark:bg-gray-700 flex items-center justify-center p-2">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} loading="lazy" className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"/>
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 text-center line-clamp-2">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Deals - High Urgency Row */}
      {flashDeals.length > 0 && (
        <section className="py-8 max-w-7xl mx-auto pl-4 md:px-8">
          <div className="flex items-center gap-2 mb-6 pr-4">
            <Flame className="text-red-500 animate-pulse" size={28} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">Flash Deals</h2>
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Ending Soon
            </div>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-8 hide-scrollbar snap-x">
            {flashDeals.map((product) => {
              const discountPercent = calculateDiscount(product.price, product.discount_price);
              return (
                <div key={product.id} className="flex-none w-64 md:w-72 snap-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/50 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 relative group h-full flex flex-col">
                    <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SAVE {discountPercent}%
                    </div>
                    <Link to={`/product/${product.slug || product.id}`} className="block h-48 bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden">
                      <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"/>
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-red-500 transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-gray-500">{product.rating || '4.8'}</span>
                      </div>
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <span className="text-xl font-bold text-red-500">${parseFloat(product.discount_price).toFixed(2)}</span>
                          <span className="text-sm text-gray-400 line-through block">${parseFloat(product.price).toFixed(2)}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); addToCart(product, 1); if(showToast) showToast('Added to cart!', 'success'); }}
                          className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-full transition-colors"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Product Grid - Amazon Style Cards */}
      <section className="py-12 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Trending Gear</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Highly rated automotive upgrades</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:text-[#39d353] transition-colors border-b-2 border-transparent hover:border-[#39d353] pb-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 12).map((product) => {
              const discountPercent = calculateDiscount(product.price, product.discount_price);
              return (
                <div key={product.id} className="group flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <Link to={`/product/${product.slug || product.id}`} className="relative aspect-square bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center overflow-hidden">
                    {discountPercent > 0 && (
                      <div className="absolute top-2 left-2 z-10 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {discountPercent}% OFF
                      </div>
                    )}
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-4 flex flex-col flex-1">
                    <Link to={`/product/${product.slug || product.id}`}>
                      <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < Math.floor(product.rating || 4.5) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200 dark:fill-gray-700"} />
                      ))}
                      <span className="text-xs text-blue-600 dark:text-blue-400 ml-1 hover:underline cursor-pointer">{product.review_count || Math.floor(Math.random() * 500) + 10}</span>
                    </div>

                    <div className="mt-auto pt-3 flex flex-col">
                      <div className="flex items-baseline gap-2">
                        {product.discount_price ? (
                          <>
                            <span className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white">${parseFloat(product.discount_price).toFixed(2)}</span>
                            <span className="text-xs text-gray-500 line-through block">MSRP ${parseFloat(product.price).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(2)}</span>
                        )}
                      </div>
                      
                      <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <Tag size={12}/> Eligible for free shipping
                      </div>

                      <button 
                        onClick={(e) => { e.preventDefault(); addToCart(product, 1); if(showToast) showToast('Added to cart!', 'success'); }}
                        className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-full text-sm transition-colors shadow-sm active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 text-center sm:hidden">
             <Link to="/shop" className="block w-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-3 rounded-xl font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              See All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Global CSS for basic keyframe animations (can be removed if added to Tailwind config) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default Home;
