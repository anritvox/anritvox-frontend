import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus, 
  ShieldCheck, ArrowRight, Truck 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';


const getImageUrl = (img) => {
  if (!img) return '/logo-rect.jpeg';
  let path = typeof img === 'object' ? (img.url || img.file_path || img.path) : img;
  if (!path) return '/logo-rect.jpeg';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export default function Cart() {
  const { 
    cartItems = [], 
    removeFromCart, 
    updateQuantity, 
    getSubtotal, 
    shippingProgress = 0,
    freeShippingThreshold = 5000
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartTotal = typeof getSubtotal === 'function' ? getSubtotal() : 0;
  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const amountLeftForFreeShipping = Math.max(freeShippingThreshold - cartTotal, 0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };


  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="bg-white border border-slate-200 p-12 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center max-w-lg relative overflow-hidden"
        >
          <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6 text-olive-400 relative">
            <ShoppingBag size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Shopping Bag Is Empty</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">Your current catalog inventory is empty. Browse our hardware selection to find the right upgrades for your vehicle.</p>
          <Link to="/shop" className="bg-slate-900 hover:bg-olive-400 text-white px-8 py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-all flex items-center gap-2 shadow-sm">
            <ArrowLeft size={14} /> Browse Catalog
          </Link>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-24 px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-end justify-between mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-1 text-slate-900">Shopping Cart</h1>
            <p className="text-olive-500 font-bold tracking-wider text-xs">{cartCount} Items Selected in Hardware Registry</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {cartItems.map(item => {
                const product = item.product || item;
                const id = item.product_id || product._id || product.id;
                const img = Array.isArray(product.images) ? product.images[0] : (product.image_url || product.image);
                const qty = item.quantity || 1;
                const price = product.discount_price || product.price || item.unit_price || 0;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    key={id} 
                    className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row gap-5 items-center sm:items-start group hover:border-olive-400/30 transition-colors shadow-sm"
                  >
                    {}
                    <div className="w-24 h-24 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center p-2">
                      <img src={getImageUrl(img)} alt={product.name} className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                    </div>

                    {}
                    <div className="flex-1 w-full flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1 text-slate-900 group-hover:text-olive-400 transition-colors">{product.name}</h3>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">SKU Code: {product.sku || 'N/A'}</span>
                        </div>
                        <button onClick={() => removeFromCart(id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 border border-slate-100">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-slate-900 font-mono">₹{parseFloat(price).toLocaleString()}</span>
                        </div>

                        {}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                          <button onClick={() => updateQuantity(id, qty - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                            <Minus size={12} />
                          </button>
                          <span className="w-10 text-center font-black text-sm font-mono text-slate-900">{qty}</span>
                          <button onClick={() => updateQuantity(id, qty + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-md hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        {}
                        <div className="text-right hidden sm:block">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Item Summary</span>
                          <span className="text-olive-500 font-black text-base font-mono">₹{(price * qty).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {}
          <div className="lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sticky top-24 shadow-sm relative overflow-hidden">
              <h2 className="text-lg font-black uppercase tracking-tight mb-6 border-b border-slate-100 pb-4 text-slate-900">Order Summary</h2>
              
              {}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-2">
                  <span className="text-slate-400">Delivery Protection</span>
                  {amountLeftForFreeShipping > 0 ? (
                    <span className="text-olive-500">Add ₹{amountLeftForFreeShipping.toLocaleString()} for Free Delivery</span>
                  ) : (
                    <span className="text-olive-500 flex items-center gap-1"><Truck size={12}/> Free Shipping Active</span>
                  )}
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${shippingProgress}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-olive-400"
                  />
                </div>
              </div>

              {}
              <div className="space-y-3.5 mb-6 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} Items)</span>
                  <span className="font-bold text-slate-900 font-mono">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-4 border-b border-slate-100">
                  <span>Logistics and Handling</span>
                  {amountLeftForFreeShipping === 0 ? (
                    <span className="text-olive-500 font-black uppercase tracking-widest text-[10px] bg-olive-50 px-2 py-0.5 rounded">Free</span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Calculated at next step</span>
                  )}
                </div>
                
                <div className="flex justify-between items-end pt-1">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Final Total</span>
                  <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {}
              <button 
                onClick={handleCheckout} 
                className="w-full bg-slate-900 hover:bg-olive-400 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                {user ? 'Initialize Checkout' : 'Secure Login & Checkout'}
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-olive-400" /> Secure SSL Encrypted Connection
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
