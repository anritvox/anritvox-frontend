import React, { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, ShoppingBag, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/api';

export default function FlashSales() {
  const [products, setProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 0 });

  useEffect(() => {
    const load = async () => {
      const res = await fetchProducts();
      setProducts(res.data?.slice(0, 8) || []);
    };
    load();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className=\"max-w-7xl mx-auto px-4 py-12 space-y-16\">
      {/* Hero Timer */}
      <section className=\"relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 md:p-24 text-white shadow-2xl\">
        <div className=\"absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none\" />
        <div className=\"relative z-10 max-w-2xl\">
          <div className=\"inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-8\">
            <Zap className=\"text-emerald-400\" size={16} fill=\"currentColor\" />
            <span className=\"text-xs font-black uppercase tracking-widest text-emerald-400\">Active Now</span>
          </div>
          <h1 className=\"text-5xl md:text-7xl font-black mb-6 leading-tight\">Midnight<br/>Super Sonic Sale</h1>
          <p className=\"text-slate-400 text-lg mb-12 leading-relaxed\">Get exclusive discounts on high-performance car audio and electronics. Limited quantities available.</p>
          
          <div className=\"flex gap-4 md:gap-8 mb-12\">
            {[
              { val: timeLeft.h, label: 'Hours' },
              { val: timeLeft.m, label: 'Mins' },
              { val: timeLeft.s, label: 'Secs' }
            ].map((t, i) => (
              <div key={i} className=\"text-center\">
                <div className=\"w-20 h-20 md:w-24 md:h-24 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl md:text-4xl font-black border border-white/10\">
                  {t.val.toString().padStart(2, '0')}
                </div>
                <span className=\"text-[10px] uppercase font-black tracking-widest text-slate-500 mt-3 block\">{t.label}</span>
              </div>
            ))}
          </div>
          
          <button className=\"bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform flex items-center gap-3\">
            Shop All Deals <ArrowRight />
          </button>
        </div>
      </section>

      {/* Deals Grid */}
      <section className=\"space-y-10\">
        <div className=\"flex items-end justify-between\">
          <div>
            <h2 className=\"text-4xl font-black text-slate-900\">Hot New Arrivals</h2>
            <p className=\"text-slate-500 mt-2\">Don't miss out on these limited-time offers.</p>
          </div>
          <TrendingUp className=\"text-slate-200\" size={64} />
        </div>

        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-8\">
          {products.map((p) => (
            <div key={p._id} className=\"group bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-xl transition-all\">
              <div className=\"relative aspect-square bg-slate-50 rounded-3xl overflow-hidden mb-6\">
                <div className=\"absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full z-10\">-40% OFF</div>
                <img src={p.images?.[0]} alt={p.name} className=\"w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500\" />
              </div>
              <h3 className=\"font-bold text-slate-900 line-clamp-1 mb-2\">{p.name}</h3>
              <div className=\"flex items-center gap-2 mb-6\">
                <span className=\"text-xl font-black text-slate-900\">₹{p.price?.toLocaleString()}</span>
                <span className=\"text-sm text-slate-400 line-through\">₹{(p.price * 1.6).toLocaleString()}</span>
              </div>
              <Link to={`/product/${p._id}`} className=\"w-full flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl font-bold text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all\">
                <ShoppingBag size={18} /> View Deal
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Buy Now */}
      <section className=\"grid grid-cols-1 md:grid-cols-3 gap-8\">
        {[
          { icon: ShieldCheck, title: 'Official Warranty', desc: 'All flash sale items are eligible for our E-Warranty protection.' },
          { icon: Clock, title: 'Same Day Dispatch', desc: 'Orders placed during flash sales are prioritized in our warehouse.' },
          { icon: Star, title: 'Premium Support', desc: 'Get 24/7 dedicated assistance for all electronic components.' }
        ].map((item, i) => (
          <div key={i} className=\"p-10 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100\">
            <div className=\"p-4 bg-white rounded-2xl w-fit shadow-sm text-slate-900\"><item.icon size={28} /></div>
            <h3 className=\"text-xl font-black text-slate-900\">{item.title}</h3>
            <p className=\"text-slate-500 text-sm leading-relaxed\">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
