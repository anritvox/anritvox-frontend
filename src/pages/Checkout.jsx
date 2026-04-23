import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
// 100% PROPER IMPORT
import { addresses as addressesApi, orders as ordersApi } from '../services/api';
import { 
  FiMapPin, FiTruck, FiCreditCard, FiCheckCircle, 
  FiAlertCircle, FiPlus, FiChevronRight, FiShield 
} from 'react-icons/fi';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryType, setDeliveryType] = useState('standard');
  const [orderNotes, setOrderNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [addrForm, setAddrForm] = useState({
    full_name: '', phone: '', line1: '', line2: '', 
    city: '', state: '', pincode: '', is_default: false
  });

  const loadAddresses = useCallback(async () => {
    try {
      const res = await addressesApi.getAll(); // REWRITTEN
      const data = res.data;
      const addrList = Array.isArray(data) ? data : (data.addresses || []);
      setAddresses(addrList);
      const def = addrList.find?.(a => a.is_default === 1) || addrList[0];
      if (def) setSelectedAddress(def.id);
    } catch (err) {
      console.error("Failed to load addresses:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (cartItems && cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    loadAddresses();
  }, [user, cartItems, navigate, loadAddresses]);

  const handleFormChange = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setAddrForm(prev => ({ ...prev, [key]: val }));
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await addressesApi.create(addrForm); // REWRITTEN
      const list = res.data.addresses || res.data;
      setAddresses(Array.isArray(list) ? list : []);
      if (Array.isArray(list) && list.length > 0) {
        setSelectedAddress(list[list.length - 1].id);
      }
      setShowForm(false);
      setAddrForm({ 
        full_name:'', phone:'', line1:'', line2:'', 
        city:'', state:'', pincode:'', is_default: false 
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select a delivery address');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        addressId: selectedAddress,
        deliveryType,
        paymentMode: 'COD',
        notes: orderNotes
      };
      
      const res = await ordersApi.create(payload); // REWRITTEN
      const resData = res.data;
      clearCart();
      navigate('/order-success', { state: { orderId: resData.orderId || resData.id } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getSubtotal ? getSubtotal() : 0;
  const shippingCharge = deliveryType === 'express' ? 99 : 0;
  const finalTotal = subtotal + shippingCharge;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
          <p className="mt-2 text-gray-600">Review your items and select a delivery address to complete your order.</p>
        </header>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg shadow-sm flex items-start gap-3"
            >
              <FiAlertCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-bold">Checkout Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
              <div className="bg-[#232f3e] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg text-white">
                    <FiMapPin className="text-xl" />
                  </div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-wider">1. Delivery Address</h2>
                </div>
                {!showForm && (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="text-xs font-bold text-[#febd69] hover:text-white flex items-center gap-1 transition-colors uppercase"
                  >
                    <FiPlus /> Add New
                  </button>
                )}
              </div>

              <div className="p-6">
                {showForm ? (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={saveAddress} 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-gray-50 border border-gray-200 rounded-xl mb-6"
                  >
                    {[
                      ['full_name','Full Name',2],
                      ['phone','Phone Number',1],
                      ['pincode','Pincode',1],
                      ['line1','Address Line 1',2],
                      ['line2','Landmark / Area',2],
                      ['city','City',1],
                      ['state','State',1],
                    ].map(([k,l,s]) => (
                      <div key={k} className={s === 2 ? 'sm:col-span-2' : ''}>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block ml-1">{l}</label>
                        <input 
                          required={k !== 'line2'} 
                          value={addrForm[k]} 
                          onChange={handleFormChange(k)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#232f3e] focus:border-transparent outline-none transition-all" 
                          placeholder={`Enter ${l.toLowerCase()}`}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex items-center gap-3 py-2">
                      <input 
                        type="checkbox" 
                        checked={addrForm.is_default} 
                        onChange={handleFormChange('is_default')} 
                        id="def" 
                        className="w-5 h-5 text-[#232f3e] rounded border-gray-300 focus:ring-0 cursor-pointer" 
                      />
                      <label htmlFor="def" className="text-sm text-gray-700 font-medium cursor-pointer">Set as default delivery address</label>
                    </div>
                    <div className="sm:col-span-2 flex gap-4 mt-2">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#232f3e] text-white px-8 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save & Use This Address'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowForm(false)} 
                        className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <>
                    {addresses.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <FiMapPin className="text-4xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">You don't have any saved addresses yet.</p>
                        <button 
                          onClick={() => setShowForm(true)}
                          className="mt-4 text-[#232f3e] font-bold hover:underline underline-offset-4"
                        >
                          + Add your first address
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {addresses.map(addr => (
                          <div 
                            key={addr.id}
                            onClick={() => setSelectedAddress(addr.id)}
                            className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${
                              selectedAddress === addr.id 
                                ? 'border-[#232f3e] bg-[#232f3e]/5 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            {selectedAddress === addr.id && (
                              <FiCheckCircle className="absolute top-4 right-4 text-[#232f3e] text-xl" />
                            )}
                            <div className="flex flex-col h-full">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="font-bold text-gray-900">{addr.full_name}</span>
                                {addr.is_default === 1 && (
                                  <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-black uppercase">Default</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 flex-grow leading-relaxed">
                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br/>
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-sm font-bold text-gray-700">
                                {addr.phone}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#232f3e] px-6 py-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg text-white">
                  <FiTruck className="text-xl" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">2. Delivery Options</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ['standard', 'Standard Delivery', '3-5 Business Days', 'FREE'],
                    ['express', 'Express Delivery', '1-2 Business Days', '₹99.00']
                  ].map(([v, l, note, price]) => (
                    <div 
                      key={v}
                      onClick={() => setDeliveryType(v)}
                      className={`p-5 border-2 rounded-xl cursor-pointer transition-all flex items-start gap-4 ${
                        deliveryType === v 
                          ? 'border-[#232f3e] bg-[#232f3e]/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        deliveryType === v ? 'border-[#232f3e] bg-[#232f3e]' : 'border-gray-300'
                      }`}>
                        {deliveryType === v && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900">{l}</span>
                          <span className={`text-sm font-black ${v === 'express' ? 'text-orange-600' : 'text-green-600'}`}>{price}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-[#232f3e] px-6 py-4 flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg text-white">
                  <FiCreditCard className="text-xl" />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">3. Payment Method</h2>
              </div>
              <div className="p-6">
                <div className="p-5 border-2 border-[#232f3e] bg-[#232f3e]/5 rounded-xl flex items-center gap-5">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-2xl">💵</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cash on Delivery (COD)</h3>
                    <p className="text-sm text-gray-600 mt-1">Pay with cash when your package is delivered to your doorstep.</p>
                  </div>
                  <FiCheckCircle className="ml-auto text-[#232f3e] text-xl" />
                </div>
                <div className="mt-6">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1 underline decoration-2 decoration-[#febd69]">Order Notes (Optional)</label>
                  <textarea 
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Any special instructions? (e.g., Leave with security guard)"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#232f3e] focus:border-transparent outline-none transition-all"
                    rows="3"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                  <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1 tracking-widest">{cartItems ? cartItems.length : 0} Items in cart</p>
                </div>
                
                <div className="p-6 space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {cartItems && cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 p-1 border border-gray-100 overflow-hidden">
                        <img 
                          src={Array.isArray(item.images) ? item.images[0] : (item.image || '/placeholder.png')} 
                          alt={item.name} 
                          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tighter">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-medium text-gray-500">Qty: {item.quantity}</span>
                          <span className="text-sm font-black text-gray-900 font-mono">₹{(parseFloat(item.unit_price || item.price) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>Items Subtotal</span>
                    <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>Delivery Charges</span>
                    <span className={shippingCharge === 0 ? 'text-green-600 font-bold' : 'font-mono text-gray-900'}>
                      {shippingCharge === 0 ? 'FREE' : `+₹${shippingCharge.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
                    <div>
                      <span className="text-base font-bold text-gray-900">Order Total</span>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Including all taxes</p>
                    </div>
                    <span className="text-2xl font-black text-gray-900 font-mono tracking-tighter">₹{finalTotal.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || !cartItems || cartItems.length === 0}
                    className="w-full bg-[#febd69] hover:bg-[#f3a847] text-gray-900 py-4 rounded-xl font-black text-base uppercase tracking-widest transition-all shadow-[0_4px_0_rgb(226,149,36)] active:shadow-none active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group mt-4"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <>
                        Place Order (COD)
                        <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
                    <FiShield className="text-lg" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">100% Secure Checkout</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 items-start">
                <FiAlertCircle className="text-blue-500 mt-1 flex-shrink-0" />
                <p className="text-[11px] text-blue-700 leading-normal font-medium">
                  By placing your order, you agree to Anritvox's <span className="underline cursor-pointer">privacy notice</span> and <span className="underline cursor-pointer">conditions of use</span>. We will send you an order confirmation email shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
