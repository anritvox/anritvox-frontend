import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 100% STRICT IMPORT: Using the mapped orders object
import { orders as ordersApi } from '../services/api';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '📦', description: 'Your order has been placed successfully.' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', description: 'Seller has confirmed your order.' },
  { key: 'processing', label: 'Processing', icon: '⚙️', description: 'Your order is being prepared.' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', description: 'Your order is on its way.' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵', description: 'Your order is out for delivery.' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', description: 'Your order has been delivered.' },
];

const STATUS_MAP = {
  pending: 0, placed: 0, confirmed: 1, processing: 2,
  shipped: 3, out_for_delivery: 4, delivered: 5,
};

function getStepIndex(status) {
  const s = (status || 'pending').toLowerCase().replace(/ /g, '_');
  return STATUS_MAP[s] ?? 0;
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // REWRITTEN: Strict object-oriented API call
        const res = await ordersApi.getMyOrders();
        setOrders(res.data?.data || res.data || []);
      } catch (e) {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const order = orderId ? orders.find(o => String(o.id || o._id) === String(orderId)) : null;
  const displayOrders = order ? [order] : orders;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">
        <div className="text-center">
          <p className="text-xl mb-4">{error}</p>
          <Link to="/profile" className="text-cyan-400 hover:underline">Go to Profile</Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Please log in to track your orders.</p>
          <Link to="/login" className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Track Orders</h1>
        <p className="text-gray-400 mb-8">Real-time status of your purchases</p>

        {displayOrders.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start shopping to see your orders here.</p>
            <Link to="/shop" className="bg-cyan-500 text-white px-6 py-3 rounded-xl hover:bg-cyan-600 transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayOrders.map((ord) => {
              const currentStep = getStepIndex(ord.status);
              const orderId = ord.id || ord._id;
              const items = ord.items || ord.order_items || [];
              const total = ord.total_amount || ord.total || 0;
              const createdAt = ord.created_at || ord.createdAt || ord.date;
              const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : 'N/A';

              return (
                <div key={orderId} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                  {/* Order Header */}
                  <div className="bg-gray-800 px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Order ID</p>
                      <p className="text-white font-mono font-semibold">#{String(orderId).slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Placed On</p>
                      <p className="text-white font-medium">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
                      <p className="text-cyan-400 font-bold text-lg">₹{Number(total).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                        currentStep >= 5 ? 'bg-green-500/20 text-green-400' :
                        currentStep >= 3 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {ord.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="px-6 py-8">
                    <div className="relative">
                      {/* Progress Bar */}
                      <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-700">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-700"
                          style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                      </div>

                      {/* Steps */}
                      <div className="relative flex justify-between">
                        {STATUS_STEPS.map((step, idx) => {
                          const done = idx <= currentStep;
                          const active = idx === currentStep;
                          return (
                            <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg z-10 transition-all duration-300 ${
                                done ? (active ? 'bg-cyan-500 ring-4 ring-cyan-500/30 scale-110' : 'bg-cyan-600') : 'bg-gray-700'
                              }`}>
                                {step.icon}
                              </div>
                              <p className={`text-xs mt-3 text-center font-medium ${
                                done ? 'text-cyan-400' : 'text-gray-500'
                              }`}>{step.label}</p>
                              {active && (
                                <p className="text-xs text-gray-400 text-center mt-1 max-w-[80px]">{step.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {items.length > 0 && (
                    <div className="px-6 pb-6">
                      <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Items in this order</h4>
                      <div className="space-y-2">
                        {items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-xl p-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-lg">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                              ) : '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{item.name || item.product_name || 'Product'}</p>
                              <p className="text-gray-400 text-xs">Qty: {item.quantity || 1}</p>
                            </div>
                            <p className="text-cyan-400 text-sm font-semibold">₹{Number(item.price || item.unit_price || 0).toLocaleString()}</p>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-gray-400 text-sm text-center">+{items.length - 3} more items</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
