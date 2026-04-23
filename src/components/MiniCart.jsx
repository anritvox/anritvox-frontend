import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, Zap, Truck, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function MiniCart() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, getSubtotal, upsells, shippingProgress, freeShippingThreshold } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-slate-950 shadow-2xl border-l border-slate-900 animate-in slide-in-from-right duration-500">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-8 border-b border-slate-900 flex justify-between items-center">
            <div className="flex items-center space-x-4">
               <ShoppingBag size={24} className="text-emerald-500" />
               <h2 className="text-2xl font-black uppercase tracking-tighter">Your Bag</h2>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-900 rounded-full transition-colors text-slate-500">
               <X size={24} />
            </button>
          </div>

          {/* Shipping Progress */}
          <div className="px-8 py-6 bg-slate-900/50">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                <span className="text-slate-500">{shippingProgress < 100 ? `Add ₹${freeShippingThreshold - getSubtotal()} for free shipping` : 'Unlocked Free Shipping'}</span>
                <span className="text-emerald-500">{Math.round(shippingProgress)}%</span>
             </div>
             <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${shippingProgress}%` }} />
             </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="text-slate-800 font-black text-6xl uppercase tracking-tighter opacity-20">Empty</div>
                <button onClick={() => setIsCartOpen(false)} className="text-emerald-500 font-bold uppercase tracking-widest text-xs underline">Shop Now</button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="flex space-x-4 group">
                   <div className="w-20 h-20 bg-slate-900 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={item.product?.images?.[0]} className="w-full h-full object-cover" alt={item.product?.name} />
                   </div>
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                         <h3 className="text-xs font-black uppercase text-white leading-tight">{item.product?.name}</h3>
                         <button onClick={() => removeFromCart(item.product_id)} className="text-slate-700 hover:text-rose-500 transition-colors">
                            <Trash2 size={14} />
                         </button>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500">Qty: {item.quantity}</div>
                      <div className="text-xs font-black text-emerald-500 font-mono italic">₹{item.product?.price * item.quantity}</div>
                   </div>
                </div>
              ))
            )}

            {/* In-Cart Upsells */}
            {upsells.length > 0 && (
              <div className="mt-12 pt-8 border-t border-slate-900">
                <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-4">Complete the Look</h4>
                <div className="space-y-4">
                   {upsells.map((u, i) => (
                     <div key={i} className="p-4 bg-slate-900 rounded-3xl flex items-center justify-between border border-slate-800 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center space-x-3">
                           <img src={u.img} className="w-10 h-10 rounded-xl" alt="" />
                           <div>
                              <div className="text-[10px] font-black uppercase text-white">{u.name}</div>
                              <div className="text-[9px] font-bold text-emerald-500">+ ₹{u.price}</div>
                           </div>
                        </div>
                        <button className="p-2 bg-emerald-500 text-black rounded-lg hover:bg-white transition-colors">
                           <Plus size={14} />
                        </button>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-900 space-y-6">
             <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Subtotal</span>
                <span className="text-3xl font-black text-white font-mono italic tracking-tighter">₹{getSubtotal()}</span>
             </div>
             <Link 
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-emerald-500 text-black py-6 rounded-[2rem] font-black uppercase tracking-tighter text-xl flex items-center justify-center group hover:bg-white transition-all shadow-[0_0_50px_rgba(16,185,129,0.2)]"
             >
               Checkout Now <ArrowRight size={24} className="ml-4 group-hover:translate-x-2 transition-transform" />
             </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
