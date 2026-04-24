import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiClock } from 'react-icons/fi';
// 100% PROPER
import { products as productsApi, categories as categoriesApi, banners as bannersApi } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        // REWRITTEN: Proper object-oriented API calls mapped 
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
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500 tracking-widest uppercase">Initializing Interface...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Section */}
      <section className="relative bg-slate-900 text-white py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 italic">Next-Gen Automotive Architecture</h1>
          <p className="text-lg md:text-xl text-slate-400 font-medium max-w-3xl mx-auto mb-10">Deploy industrial-grade lighting, acoustics, and hardware directly to your vehicle.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-emerald-400 transition-all hover:scale-105">
            Initialize Catalog <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-b border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center justify-center gap-4 text-slate-700">
            <FiShield size={32} className="text-emerald-500" />
            <div>
              <h4 className="font-black uppercase tracking-tight">Verified Hardware</h4>
              <p className="text-xs font-bold text-slate-500">100% Authentic Quality</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-slate-700">
            <FiTruck size={32} className="text-emerald-500" />
            <div>
              <h4 className="font-black uppercase tracking-tight">Rapid Logistics</h4>
              <p className="text-xs font-bold text-slate-500">Express Pan-India Delivery</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-slate-700">
            <FiClock size={32} className="text-emerald-500" />
            <div>
              <h4 className="font-black uppercase tracking-tight">24/7 Support Nexus</h4>
              <p className="text-xs font-bold text-slate-500">Always Online</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
