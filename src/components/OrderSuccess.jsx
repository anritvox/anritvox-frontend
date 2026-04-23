import React from 'react';
import { CheckCircle2, Package, ArrowRight, Share2 } from 'lucide-react';

const OrderSuccess = ({ orderId = "AVX-9921-X", email = "user@example.com" }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
            <CheckCircle2 size={48} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-5xl font-black tracking-tighter text-white mb-6 uppercase italic">
          Order <span className="text-emerald-400">Confirmed</span>
        </h1>
        
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md mx-auto mb-12">
          Your gear is locked in. We've sent a confirmation receipt to <span className="text-white font-bold">{email}</span>.
        </p>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Order Reference</p>
            <p className="text-xl font-black text-white tracking-tight">{orderId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estimated Delivery</p>
            <p className="text-xl font-black text-white tracking-tight">3-5 Business Days</p>import React from 'react';
import { CheckCircle2, Package, ArrowRight, Share2 } from 'lucide-react';

const OrderSuccess = ({ orderId = "AVX-9921-X", email = "user@example.com" }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 animate-pulse"></div>
          <div className="relative w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
            <CheckCircle2 size={48} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-5xl font-black tracking-tighter text-white mb-6 uppercase italic">
          Order <span className="text-emerald-400">Confirmed</span>
        </h1>
        
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md mx-auto mb-12">
          Your gear is locked in. We've sent a confirmation receipt to <span className="text-white font-bold">{email}</span>.
        </p>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Order Reference</p>
            <p className="text-xl font-black text-white tracking-tight">{orderId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estimated Delivery</p>
            <p className="text-xl font-black text-white tracking-tight">3-5 Business Days</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all duration-300 group">
            Track My Package
            <Package size={18} className="transition-transform group-hover:translate-y-[-2px]" />
          </button>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300">
            Continue Shopping
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-16 pt-16 border-t border-white/5 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6">Spread the Vibe</p>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
            <Share2 size={16} />
            Share your haul
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all duration-300 group">
            Track My Package
            <Package size={18} className="transition-transform group-hover:translate-y-[-2px]" />
          </button>
          
          <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300">
            Continue Shopping
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-16 pt-16 border-t border-white/5 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6">Spread the Vibe</p>
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest">
            <Share2 size={16} />
            Share your haul
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
