// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, ShoppingCart, Zap, ShieldCheck, Headphones, ImageIcon } from 'lucide-react';
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
  const { showToast } = useToast() || {}; // Safety fallback

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // FIXED: Corrected the banner endpoint to match backend route GET /api/banners
        const [productsRes, categoriesRes, bannersRes] = await Promise.all([
          api.get('/products/active'),
          api.get('/categories'),
          api.get('/banners') 
        ]);

        setProducts(productsRes.data?.data || productsRes.data || []);
        setCategories(categoriesRes.data?.data || categoriesRes.data || []);
        // Safely extract banner array depending on backend wrapping
        setBanners(bannersRes.data?.data || bannersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
        // Safely invoke toast only if context is available
        if (typeof showToast === 'function') {
          showToast('Failed to load some content', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []); // Removed showToast from dependency array to prevent unnecessary re-renders

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0].file_path || product.images[0];
    if (product.image) return product.image;
    return '/logo.webp'; 
  };

  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return null;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-12">
        <SkeletonLoader type="banner" />
        <SkeletonLoader type="grid" count={4} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-in fade-in duration-500">
      
      {/* Hero Banner Section */}
      {banners.length > 0 && (
        <section className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-gray-900">
          <div className="absolute inset-0">
            <img 
              src={banners[0].image_url} 
              alt={banners[0].title || "Hero Banner"}
              width="1920"
              height="1080"
              className="w-full h-full object-cover opacity-60"
              fetchpriority="high"
            />
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              {banners[0].title || 'Premium Audio Experience'}
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl">
              {banners[0].subtitle || 'Discover the next generation of sound clarity and deep bass.'}
            </p>
            <Link 
              to={banners[0].link_url || '/shop'}
              className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Shop Now
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* Features Bar */}
      <section className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x dark:divide-gray-700">
            <div className="flex flex-col items-center p-4">
              <Zap className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white">Fast Delivery</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Free shipping on orders over $50</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <ShieldCheck className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white">1 Year Warranty</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Guaranteed quality & protection</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Headphones className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white">24/7 Support</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Always here to help you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Explore our wide range of products</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/shop?category=${category.slug}`}
              className="group flex flex-col items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-900"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    loading="lazy"
                    width="96" height="96"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Top rated gear for you</p>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium">
              View All <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => {
              const discountPercent = calculateDiscount(product.price, product.discount_price);
              
              return (
                <div 
                  key={product.id}
                  className="group flex flex-col bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <Link to={`/product/${product.slug || product.id}`} className="relative aspect-square overflow-hidden bg-white dark:bg-gray-800 p-6 flex items-center justify-center">
                    {/* Discount Badge */}
                    {discountPercent && (
                      <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {discountPercent}% OFF
                      </div>
                    )}
                    
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      loading="lazy"
                      width="300" height="300"
                      className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110"
                    />
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      <Star size={16} className="fill-current" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{product.rating || '4.5'}</span>
                    </div>
                    
                    <Link to={`/product/${product.slug || product.id}`}>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex flex-col">
                        {product.discount_price ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">${parseFloat(product.price).toFixed(2)}</span>
                            <span className="text-lg font-bold text-red-500">${parseFloat(product.discount_price).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900 dark:text-white">${parseFloat(product.price).toFixed(2)}</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product, 1);
                          if (typeof showToast === 'function') showToast('Added to cart!', 'success');
                        }}
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-gray-900 dark:text-white p-3 rounded-full transition-colors duration-300"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
             <Link to="/shop" className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-full font-medium">
              View All Products <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
