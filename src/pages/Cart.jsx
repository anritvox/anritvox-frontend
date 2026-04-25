import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, ArrowLeft, Trash2, Plus, Minus, 
  ShieldCheck, Zap, ArrowRight, Truck 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// --- Safe Image URL Helper ---
const getImageUrl = (img) => {
  if (!img) return '/logo.webp';
  let path = typeof img === 'object' ? (img.url || img.file_path || img.path) : img;
  if (!path) return '/logo.webp';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export default function Cart() {
  // Destructuring EXACTLY what the new context provides
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

  // Safe calculated variables
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

  // --- EMPTY STATE UI ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-black pt-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-lg border border-slate-800/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
          <div className="w-32 h-32 bg-slate-950 rounded-full flex items-center justify-center mb-8 text-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping"></div>
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Hardware Arsenal Empty</h2>
          <p className="text-slate-400 mb-10 leading-relaxed font-medium">Your node requires equipment. Explore our high-performance gear to deploy to your cart.</p>
          <Link to="/shop" className="bg-emerald-500 hover:bg-emerald-400 text-black px-10 py-5 rounded-full font-black tracking-widest uppercase text-sm transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center gap-3">
            <ArrowLeft size={18} /> Initialize Search
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- POPULATED CART UI ---
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500 selection:text-black py-32 px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-end justify-between mb-12 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Checkout Protocol</h1>
            <p className="text-emerald-500 font-bold tracking-widest text-sm">{cartCount} Active Nodes in Arsenal</p>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-2 text-slate-400 hover:text-emerald-400 font-black uppercase tracking-widest text-xs transition-colors">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CART ITEMS LIST */}
          <div className="lg:col-span-8 space-y-6">
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
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    key={id} 
                    className="bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start group hover:border-emerald-500/30 transition-colors"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-32 h-32 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shrink-0 relative">
                      <img src={getImageUrl(img)} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 w-full flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-black uppercase tracking-tight line-clamp-2 mb-1 group-hover:text-emerald-400 transition-colors">{product.name}</h3>
                          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">SKU: {product.sku || 'N/A'}</span>
                        </div>
                        <button onClick={() => removeFromCart(id)} className="p-2.5 bg-slate-950 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0">
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                        {/* Price */}
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white">₹{parseFloat(price).toLocaleString()}</span>
                        </div>

                        {/* Quantity Controller */}
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                          <button onClick={() => updateQuantity(id, qty - 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors">
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-black text-lg">{qty}</span>
                          <button onClick={() => updateQuantity(id, qty + 1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors">
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        {/* Line Total */}
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Line Total</span>
                          <span className="text-emerald-500 font-black text-xl">₹{(price * qty).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* SUMMARY PANEL */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 sticky top-32 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-emerald-500">
                <ShieldCheck size={200} />
              </div>

              <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b border-slate-800 pb-6 relative z-10">Transmission Summary</h2>
              
              {/* Shipping Progress */}
              <div className="mb-8 relative z-10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                  <span className="text-slate-400">Shipping Status</span>
                  {amountLeftForFreeShipping > 0 ? (
                    <span className="text-emerald-500">Add ₹{amountLeftForFreeShipping.toLocaleString()} for Free</span>
                  ) : (
                    <span className="text-cyan-400 flex items-center gap-1"><Truck size={14}/> Free Shipping Unlocked</span>
                  )}
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${shippingProgress}%` }} transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${amountLeftForFreeShipping === 0 ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Subtotal ({cartCount} Items)</span>
                  <span className="font-bold text-white">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300 font-medium pb-6 border-b border-slate-800">
                  <span>Logistics & Handling</span>
                  {amountLeftForFreeShipping === 0 ? (
                    <span className="text-cyan-400 font-black uppercase tracking-widest text-xs bg-cyan-400/10 px-2 py-1 rounded">Comped</span>
                  ) : (
                    <span className="font-bold text-white">Calculated at next step</span>
                  )}
                </div>
                
                <div className="flex justify-between items-end pt-2">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-500">Final Total</span>
                  <span className="text-4xl font-black tracking-tighter text-emerald-500">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button 
                onClick={handleCheckout} 
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-[0.2em] text-sm py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 relative z-10 group"
              >
                {user ? 'Initialize Checkout' : 'Secure Login & Checkout'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest relative z-10">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure 256-Bit SSL Encrypted Node
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
