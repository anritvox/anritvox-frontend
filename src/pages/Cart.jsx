import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl shadow-blue-100 flex flex-col items-center text-center max-w-lg border border-white"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 text-blue-600">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-500 mb-10 leading-relaxed text-lg font-medium">Looks like you haven't added anything to your cart yet. Explore our premium collections to get started.</p>
          <Link to="/shop" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full font-black transition-all shadow-xl shadow-blue-200 flex items-center gap-3 active:scale-95">
            <ArrowLeft size={20} /> CONTINUE SHOPPING
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 pt-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/shop" className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Your Shopping Cart</h1>
          <span className="ml-auto text-sm font-black bg-blue-100 text-blue-600 px-4 py-2 rounded-full uppercase tracking-widest">{cartCount} ITEMS</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-white shadow-xl shadow-gray-100/50 flex flex-col sm:flex-row gap-8 items-center group"
                >
                  <div className="w-40 h-40 bg-gray-50 rounded-2xl overflow-hidden p-4 flex-shrink-0 relative">
                    <img 
                      src={item.images?.[0] || item.image || "https://via.placeholder.com/300?text=ANRITVOX"} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                      alt={item.name} 
                    />
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-black text-gray-900 text-xl mb-1 leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h3>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{item.category}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-rose-500 p-2 transition-colors ml-auto sm:ml-0"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-50">
                      <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-90"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-14 text-center font-black text-lg text-gray-900">{item.qty || 1}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-blue-600 hover:shadow-md transition-all active:scale-90"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Price</p>
                        <span className="text-2xl font-black text-gray-900">₹{(item.price * (item.qty || 1)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-gray-900 text-white p-8 sm:p-10 rounded-[40px] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[80px] rounded-full" />
              
              <h2 className="text-2xl font-black mb-8 relative z-10 uppercase tracking-tighter">Order Summary</h2>
              
              <div className="space-y-5 relative z-10 mb-10 border-b border-white/10 pb-8">
                <div className="flex justify-between text-gray-400 font-bold uppercase text-xs tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-white text-sm">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold uppercase text-xs tracking-widest">
                  <span>Shipping</span>
                  <span className="text-emerald-400 text-sm italic font-black">FREE</span>
                </div>
                <div className="flex justify-between text-gray-400 font-bold uppercase text-xs tracking-widest">
                  <span>Tax (Estimated)</span>
                  <span className="text-white text-sm">₹0</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10 relative z-10">
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Final Amount</p>
                  <span className="text-4xl font-black tracking-tighter italic">₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 relative z-10 group active:scale-95">
                <CreditCard size={20} className="group-hover:rotate-12 transition-transform" /> PROCEED TO CHECKOUT
              </button>
              
              <p className="text-center text-gray-500 text-[10px] font-black uppercase tracking-widest mt-6 relative z-10">
                Secure SSL Encrypted Payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
