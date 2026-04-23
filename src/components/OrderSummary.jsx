import React from 'react';
import { Package, Truck, ShieldCheck } from 'lucide-react';

const OrderSummary = ({ cartItems = [], subtotal = 0, shipping = 0, tax = 0 }) => {
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl sticky top-24">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-8 italic">Order Summary</h2>
      
      <div className="space-y-6">
        <div className="flex justify-between text-slate-400 font-medium">
          <span>Subtotal</span>
          <span className="text-white">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-slate-400 font-medium">
          <span>Shipping</span>
          <span className="text-emerald-400">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        
        <div className="flex justify-between text-slate-400 font-medium">
          <span>Estimated Tax</span>
          <span className="text-white">${tax.toFixed(2)}</span>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Total Amount</p>
              <p className="text-4xl font-black tracking-tighter text-white">${total.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full">Secure Checkout</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Truck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Express Delivery</p>
            <p className="text-xs text-slate-500">Ships within 24-48 hours</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-blue-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">2-Year Warranty</p>
            <p className="text-xs text-slate-500">Full protection included</p>
          </div>
        </div>
      </div>

      <p className="mt-8 text-[10px] text-center text-slate-600 font-medium leading-relaxed uppercase tracking-widest">
        By completing your order, you agree to our <br/>
        <span className="text-slate-400 hover:text-white cursor-pointer underline transition-colors">Terms of Service</span> and <span className="text-slate-400 hover:text-white cursor-pointer underline transition-colors">Privacy Policy</span>
      </p>
    </div>
  );
};

export default OrderSummary;
