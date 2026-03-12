// src/pages/Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-50 font-sans">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-blue-100 flex flex-col items-center text-center max-w-lg border border-white">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8 text-blue-600">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-500 mb-10 leading-relaxed text-lg font-medium">Explore our products and add items to your cart.</p>
          <Link to="/shop" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full font-black transition-all shadow-xl shadow-blue-200 flex items-center gap-2">
            <ArrowLeft size={20} /> CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cartCount} items)</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => {
              const id = item.product_id || item.id;
              const img = Array.isArray(item.images) ? item.images[0] : item.images;
              const qty = item.quantity || 1;
              return (
                <div key={id} className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
                  <img src={img} alt={item.name} className="w-20 h-20 object-cover rounded-lg border" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                    <p className="text-[#39d353] font-bold text-lg">₹{parseFloat(item.price).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(id, qty - 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold">{qty}</span>
                      <button
                        onClick={() => updateQuantity(id, qty + 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{(parseFloat(item.price) * qty).toLocaleString()}</p>
                    <button
                      onClick={() => removeFromCart(id)}
                      className="text-red-400 hover:text-red-600 mt-2 flex items-center gap-1 text-sm"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Summary */}
          <div className="bg-white rounded-xl shadow p-6 h-fit sticky top-4">
            <h2 className="text-lg font-bold mb-4 border-b pb-4">Price Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Items ({cartCount})</span>
                <span>₹{cartTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-3">
                <span>Total Amount</span>
                <span>₹{cartTotal.toFixed(0)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-[#f0c040] text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
              {user ? 'Proceed to Checkout' : 'Login & Checkout'}
            </button>
            <Link to="/shop" className="block text-center text-sm text-blue-600 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
