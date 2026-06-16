import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { 

  ArrowRight, Shield, Truck, Zap, Star, 

  ShoppingBag, Award, Headphones, PlayCircle

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



const getImageUrl = (img) => {

  if (!img) return '/logo.jpeg';

  let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;

  if (!path) return '/logo.jpeg';

  if (path.startsWith('http')) return path;

  

  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

};



const staggerContainer = {

  hidden: { opacity: 0 },

  show: { opacity: 1, transition: { staggerChildren: 0.05 } }

};



const fadeUp = {

  hidden: { opacity: 0, y: 20 },

  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }

};



export default function Home() {

  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const { showToast } = useToast() || {};

  

  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({ products: [], categories: [] });



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

        console.error("Home direct fetch failure:", err);

      } finally {

        setLoading(false);

      }

    };

    loadHomeData();

  }, []);



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

      console.error("Cart add execution crash:", error);

      if (showToast) showToast('Could not add product. Please try again.', 'error');

    }

  };



  if (loading) return (

    <div className="min-h-screen bg-white pt-24 px-6 space-y-12">

       <SkeletonBlock className="w-full h-[50vh] rounded-[2rem] bg-slate-50 border border-slate-100" />

       <ProductGridSkeleton count={4} />

    </div>

  ); 



  return (

    <div className="bg-white text-slate-900 selection:bg-olive-400 selection:text-white overflow-hidden font-sans">

      

      <HeroSection />



      {/* Trust Badge Section */}

      <section className="py-12 border-y border-slate-100 bg-slate-50/50 backdrop-blur-xl relative z-20">

        <div className="max-w-7xl mx-auto px-6">

          <motion.div 

            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}

            className="grid grid-cols-2 lg:grid-cols-4 gap-8"

          >

            {[

              { icon: <Shield />, label: "Guaranteed Fitment", sub: "100% Compatible Matches" },

              { icon: <Truck />, label: "Fast Shipping", sub: "Pan India Delivery Support" },

              { icon: <Award />, label: "Product Warranty", sub: "Simple Replacement Support" },

              { icon: <Headphones />, label: "Customer Help", sub: "Direct Assistance Hotline" }

            ].map((item, i) => (

              <div key={i} className="flex items-center gap-4 group">

                <div className="p-3 bg-white border border-slate-200 rounded-xl text-olive-400 group-hover:bg-olive-400 group-hover:text-white transition-all duration-300 shadow-sm">

                  {item.icon}

                </div>

                <div>

                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{item.label}</h4>

                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">{item.sub}</p>

                </div>

              </div>

            ))}

          </motion.div>

        </div>

      </section>



      {/* Best Sellers Grid */}

      <section className="py-20 bg-slate-50 relative">

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          <div className="text-center mb-16">

            <h2 className="text-xs font-black text-olive-400 uppercase tracking-[0.5em] mb-3">Our Best Sellers</h2>

            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">Popular Products.</h3>

          </div>



          <motion.div 

            variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}

            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"

          >

            {data.products.map((prod) => (

              <motion.div variants={fadeUp} key={prod.id || prod._id} className="group flex flex-col bg-white border border-slate-200 rounded-[2rem] p-4 hover:border-olive-400/40 transition-all duration-300 shadow-sm">

                <div className="relative aspect-square overflow-hidden mb-4 bg-slate-50/50 rounded-2xl flex items-center justify-center">

                  <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="w-full h-full flex items-center justify-center">

                    <img 

                      src={getImageUrl(prod.images?.[0] || prod.image_url)} 

                      className="max-h-[80%] max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-500" 

                      alt={prod.name} 

                      onError={(e) => { e.target.src = '/logo.jpeg'; }}

                    />

                  </Link>

                </div>



                <div className="flex-1 flex flex-col justify-between px-1">

                  <div className="mb-4">

                    <div className="flex justify-between items-start gap-2 mb-1">

                      <Link to={`/product/${prod.slug || prod.id || prod._id}`} className="flex-1">

                        <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-olive-400 transition-colors line-clamp-1">{prod.name}</h4>

                      </Link>

                      <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold whitespace-nowrap shrink-0">

                        <Star size={10} fill="currentColor" /> {prod.rating || '5.0'}

                      </div>

                    </div>

                    

                    <div className="flex items-center gap-2 mt-1">

                      <span className="text-base font-black text-slate-900 font-mono">₹{prod.discount_price || prod.price}</span>

                      {prod.discount_price && (

                        <span className="text-xs text-slate-400 line-through font-mono">₹{prod.price}</span>

                      )}

                    </div>

                  </div>



                  <button 

                    onClick={(e) => handleQuickAdd(e, prod.id || prod._id)}

                    className="w-full bg-slate-900 hover:bg-olive-400 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2"

                  >

                    <ShoppingBag size={14} /> Add to Cart

                  </button>

                </div>

              </motion.div>

            ))}

          </motion.div>

        </div>

      </section>



      {/* Support Section */}

      <section className="py-20 bg-white border-t border-slate-100">

        <div className="max-w-4xl mx-auto px-6 text-center">

          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4 text-slate-900">

            Need Setup Assistance?

          </h3>

          <p className="text-slate-500 text-sm max-w-lg mx-auto mb-8 font-medium">

            Our support team provides clean step-by-step video setup instructions for installing dashboard stereo systems, high-intensity lighting, and audio equipment.

          </p>

          <a 

            href="https://youtube.com" target="_blank" rel="noreferrer" 

            className="inline-flex items-center gap-3 px-8 py-4 bg-olive-400 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-900 transition-all shadow-md"

          >

            <PlayCircle size={16} /> View Video Guides

          </a>

        </div>

      </section>



    </div>

  );

}
