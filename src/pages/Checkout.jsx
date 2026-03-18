import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchAddressesAPI, saveAddressAPI, placeOrderAPI } from '../services/api';

export default function Checkout() {
  const { user, token } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryType, setDeliveryType] = useState('standard');
  const [orderNotes, setOrderNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [addrForm, setAddrForm] = useState({
    full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', is_default: false
  });

  const activeToken = token || localStorage.getItem('user_token');

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return; }
    if (cart.length === 0) { navigate('/cart'); return; }
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const data = await fetchAddressesAPI(activeToken);
      setAddresses(data);
      const def = data.find(a => a.is_default) || data[0];
      if (def) setSelectedAddress(def.id);
    } catch (err) {
      console.error(err);
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      const list = await saveAddressAPI(activeToken, addrForm);
      setAddresses(list);
      const newest = list[list.length - 1];
      setSelectedAddress(newest?.id);
      setShowForm(false);
      setAddrForm({ full_name:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'', is_default: false });
    } catch (err) { 
      setError(err.message || 'Failed to save address'); 
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) return setError('Please select a delivery address');
    setLoading(true);
    setError('');
    
    try {
      // Sending exact payload matched to our secured backend from Step 3
      const payload = {
        addressId: selectedAddress,
        deliveryType,
        paymentMode: 'COD',
        notes: orderNotes
      };
      
      const resData = await placeOrderAPI(activeToken, payload);
      
      clearCart();
      navigate('/order-success', { state: { orderId: resData.orderId } });
    } catch (err) {
      // This will catch the new secure backend messages, like "Insufficient stock for [Product Name]"
      setError(err.message);
    } finally { 
      setLoading(false); 
    }
  };

  const handleFormChange = (key) => (e) => {
    setAddrForm(prev => ({ 
      ...prev, 
      [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 shadow-sm flex items-center gap-2">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Address, Delivery, Notes */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Address Selection */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#232f3e]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Delivery Address</h2>
                <button onClick={() => setShowForm(!showForm)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  + Add New Address
                </button>
              </div>

              {showForm && (
                <form onSubmit={saveAddress} className="grid grid-cols-2 gap-3 mb-6 p-5 bg-gray-50 border rounded-lg shadow-inner">
                  {[['full_name','Full Name',2],['phone','Phone Number',1],['line1','Address Line 1',2],['line2','Landmark / Line 2 (optional)',2],['city','City',1],['state','State',1],['pincode','Pincode',1]].map(([k,l,s]) => (
                    <div key={k} className={s === 2 ? 'col-span-2' : ''}>
                      <label className="text-xs font-semibold text-gray-700">{l}</label>
                      <input 
                        required={k !== 'line2'} 
                        value={addrForm[k]} 
                        onChange={handleFormChange(k)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={addrForm.is_default} onChange={handleFormChange('is_default')} id="def" className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                    <label htmlFor="def" className="text-sm font-medium text-gray-700">Set as default delivery address</label>
                  </div>
                  <div className="col-span-2 flex gap-3 mt-4">
                    <button type="submit" className="bg-[#232f3e] text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-gray-800 transition-colors">
                      Save Address
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 && !showForm && (
                <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                  <p className="text-gray-500 text-sm mb-2">You don't have any saved addresses.</p>
                  <button onClick={() => setShowForm(true)} className="text-blue-600 text-sm font-medium hover:underline">Add one now</button>
                </div>
              )}

              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAddress === addr.id ? 'border-green-500 bg-green-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    <input type="radio" name="addr" value={addr.id} checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)} className="mt-1.5 w-4 h-4 text-green-600" />
                    <div className="text-sm flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{addr.full_name}</span>
                        <span className="text-gray-400">|</span>
                        <span className="font-medium text-gray-700">{addr.phone}</span>
                        {addr.is_default === 1 && <span className="ml-auto text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">Default</span>}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br/>
                        {addr.city}, {addr.state} - <span className="font-medium text-gray-800">{addr.pincode}</span>
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Delivery Type */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#232f3e]">
              <h2 className="text-lg font-bold mb-4">Delivery Options</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ['standard', 'Standard Delivery', '3-5 Business Days'],
                  ['express', 'Express Delivery', 'Priority Dispatch']
                ].map(([v, l, note]) => (
                  <label key={v} className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                    deliveryType === v ? 'border-green-500 bg-green-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center mb-1">
                      <input type="radio" name="delivery" value={v} checked={deliveryType === v}
                        onChange={() => setDeliveryType(v)} className="mr-3 w-4 h-4 text-green-600" />
                      <span className="font-bold text-sm text-gray-900">{l}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-7">{note}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Mode */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#232f3e]">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              <div className="flex items-center gap-4 p-4 border border-green-500 bg-green-50/50 rounded-lg">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <span className="text-2xl block">💵</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-600 mt-0.5">Pay safely with cash when your order arrives</p>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-[#232f3e]">
              <h2 className="text-lg font-bold mb-3">Order Notes (Optional)</h2>
              <textarea 
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Any special instructions for delivery? (e.g., Leave with security guard)"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#232f3e]"
                rows="2"
              ></textarea>
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow sticky top-20 border-t-4 border-[#febd69]">
              <div className="p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                  Order Summary
                  <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded text-gray-600">{cart.length} Items</span>
                </h2>
                
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.product_id || item.id} className="flex gap-4">
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-md border p-1">
                        <img 
                          src={Array.isArray(item.images) ? item.images[0] : item.images} 
                          alt={item.name}
                          className="w-full h-full object-contain mix-blend-multiply" 
                        />
                      </div>
                      <div className="flex-1 text-sm flex flex-col justify-center">
                        <p className="font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{item.name}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <p className="text-gray-500 font-medium">Qty: {item.quantity}</p>
                          <p className="font-bold text-[#b12704]">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 mt-5 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-medium">₹{cartTotal.toFixed(0)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="text-green-600 font-bold tracking-wide">FREE</span>
                  </div>

                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3 text-gray-900">
                    <span>Order Total</span>
                    <span className="text-[#b12704]">₹{cartTotal.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full mt-6 bg-[#febd69] hover:bg-[#f3a847] text-gray-900 py-3.5 rounded-lg font-bold transition-all shadow-sm active:transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Place Order (COD)'
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">By placing your order, you agree to our terms and conditions.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
