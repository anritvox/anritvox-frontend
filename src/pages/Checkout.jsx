// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function Checkout() {
  const { user, token } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [deliveryType, setDeliveryType] = useState('standard');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addrForm, setAddrForm] = useState({
    full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', is_default: false
  });

  const authHeader = () => ({ Authorization: `Bearer ${token || localStorage.getItem('user_token')}` });

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return; }
    if (cart.length === 0) { navigate('/cart'); return; }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/addresses`, { headers: authHeader() });
      const data = await res.json();
      setAddresses(data);
      const def = data.find(a => a.is_default) || data[0];
      if (def) setSelectedAddress(def.id);
    } catch {}
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(addrForm),
      });
      const list = await res.json();
      setAddresses(list);
      const newest = list[list.length - 1];
      setSelectedAddress(newest?.id);
      setShowForm(false);
      setAddrForm({ full_name:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'', is_default: false });
    } catch { setError('Failed to save address'); }
  };

  const placeOrder = async () => {
    if (!selectedAddress) return setError('Please select a delivery address');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ addressId: selectedAddress, deliveryType }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Order failed');
      clearCart();
      navigate('/order-success', { state: { orderId: body.orderId } });
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const f = (k) => (e) => setAddrForm(prev => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Address + Delivery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Delivery Address</h2>
                <button onClick={() => setShowForm(!showForm)} className="text-sm text-blue-600 hover:underline">
                  + Add New Address
                </button>
              </div>
              {showForm && (
                <form onSubmit={saveAddress} className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded">
                  {[['full_name','Full Name',2],['phone','Phone',1],['line1','Address Line 1',2],['line2','Line 2 (optional)',2],['city','City',1],['state','State',1],['pincode','Pincode',1]].map(([k,l,s]) => (
                    <div key={k} className={s === 2 ? 'col-span-2' : ''}>
                      <label className="text-xs font-medium text-gray-600">{l}</label>
                      <input required={k !== 'line2'} value={addrForm[k]} onChange={f(k)}
                        className="w-full border rounded px-2 py-1 text-sm mt-1" />
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" checked={addrForm.is_default} onChange={f('is_default')} id="def" />
                    <label htmlFor="def" className="text-sm">Set as default address</label>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button type="submit" className="bg-[#232f3e] text-white px-4 py-2 rounded text-sm">Save Address</button>
                    <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded text-sm">Cancel</button>
                  </div>
                </form>
              )}
              {addresses.length === 0 && !showForm && <p className="text-gray-500 text-sm">No addresses saved. Add one above.</p>}
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded cursor-pointer ${
                    selectedAddress === addr.id ? 'border-[#39d353] bg-green-50' : 'border-gray-200'
                  }`}>
                    <input type="radio" name="addr" value={addr.id} checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                    <div className="text-sm">
                      <p className="font-semibold">{addr.full_name} — {addr.phone}</p>
                      <p className="text-gray-600">{addr.line1}{addr.line2 ? ', ' + addr.line2 : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      {addr.is_default === 1 && <span className="text-xs text-green-600 font-medium">Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Delivery Type</h2>
              <div className="flex gap-4">
                {[['standard','Standard Delivery (3-5 days)','FREE'],['express','Express Delivery (1-2 days)','+ ₹99']].map(([v,l,note]) => (
                  <label key={v} className={`flex-1 p-3 border rounded cursor-pointer ${
                    deliveryType === v ? 'border-[#39d353] bg-green-50' : 'border-gray-200'
                  }`}>
                    <input type="radio" name="delivery" value={v} checked={deliveryType === v}
                      onChange={() => setDeliveryType(v)} className="mr-2" />
                    <span className="font-medium text-sm">{l}</span>
                    <span className="text-xs text-gray-500 block ml-5">{note}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product_id || item.id} className="flex gap-3">
                    <img src={Array.isArray(item.images) ? item.images[0] : item.images} alt={item.name}
                      className="w-12 h-12 object-cover rounded border" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-2">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{cartTotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className="text-green-600">{deliveryType === 'standard' ? 'FREE' : '₹99'}</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>Total</span>
                  <span>₹{(cartTotal + (deliveryType === 'express' ? 99 : 0)).toFixed(0)}</span>
                </div>
              </div>
              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full mt-4 bg-[#f0c040] text-black py-3 rounded font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
              >
                {loading ? 'Placing Order...' : 'Place Order (COD)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
