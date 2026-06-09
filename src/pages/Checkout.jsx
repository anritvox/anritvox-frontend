import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addresses as addressesApi, orders as ordersApi } from '../services/api';
import { FiMapPin, FiTruck, FiCreditCard, FiPlus, FiX } from 'react-icons/fi';
import { ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();


  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMode, setPaymentMode] = useState('COD');
  const [loading, setLoading] = useState(false);


  const [showAddForm, setShowAddForm] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    pincode: ''
  });

  const subtotal = getSubtotal();
  const finalTotal = subtotal;

  const fetchData = useCallback(async () => {
    try {
      const addrRes = await addressesApi.getAll();
      const list = addrRes.data?.data || addrRes.data || [];
      setAddresses(list);
      
      const def = list.find(a => a.is_default) || list[0];
      if (def) setSelectedAddress(def.id);
    } catch (err) {
      console.error("Failed to fetch address registry logs:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    try {
      
      const bulletproofPayload = {
        full_name: newAddress.full_name,
        phone: newAddress.phone,
        phone_number: newAddress.phone, // Feeds database model requirement
        line1: newAddress.address_line1, // Feeds API router validation block
        street_address: newAddress.address_line1, // Feeds database column requirement
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode, // Feeds API router payload check
        postal_code: newAddress.pincode, // Feeds database column mapping
        country: 'India',
        is_default: addresses.length === 0 ? 1 : 0
      };


      await addressesApi.create(bulletproofPayload);
      

      const addrRes = await addressesApi.getAll();
      const list = addrRes.data?.data || addrRes.data || [];
      setAddresses(list);
      

      if (list.length > 0) {
        setSelectedAddress(list[list.length - 1].id);
      }


      setNewAddress({ full_name: '', phone: '', address_line1: '', city: '', state: '', pincode: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error("Address registration failure:", err);
      alert(err.response?.data?.message || "Could not save address. Verify all fields are correctly formatted.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return alert("Select a shipping address to fulfill order packaging.");

    setLoading(true);
    try {
      const payload = {
        addressId: selectedAddress,
        paymentMode: 'COD' // Enforced as static exclusive value
      };
      
      const res = await ordersApi.create(payload);
      clearCart();
      navigate(`/order-success/${res.data.orderId}`);
    } catch (err) {
      console.error("Order submission failure:", err);
      alert(err.response?.data?.message || "Checkout processing error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 font-sans min-h-screen bg-slate-50 text-slate-900">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {}
        <div className="flex-1 space-y-6">
          
          {}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FiMapPin className="text-olive-400" /> Shipping Address Log
              </h2>
              
              <button 
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-olive-50 text-slate-700 hover:text-olive-600 border border-slate-200 hover:border-olive-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
              >
                {showAddForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Address</>}
              </button>
            </div>

            {}
            <AnimatePresence>
              {showAddForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddAddressSubmit}
                  className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 overflow-hidden text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                      <input type="text" name="full_name" placeholder="First and Last Name" required value={newAddress.full_name} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none text-slate-900 placeholder:text-slate-400 shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Contact Phone Number</label>
                      <input type="tel" name="phone" placeholder="10-Digit Mobile Number" required value={newAddress.phone} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none text-slate-900 placeholder:text-slate-400 shadow-inner" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Street Address Details</label>
                    <input type="text" name="address_line1" placeholder="Flat / House No. / Building / Colony" required value={newAddress.address_line1} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none text-slate-900 placeholder:text-slate-400 shadow-inner" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">City</label>
                      <input type="text" name="city" placeholder="City" required value={newAddress.city} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none text-slate-900 placeholder:text-slate-400 shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">State</label>
                      <input type="text" name="state" placeholder="State" required value={newAddress.state} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none text-slate-900 placeholder:text-slate-400 shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Pincode</label>
                      <input type="text" name="pincode" placeholder="6-Digit Code" required value={newAddress.pincode} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-olive-400 outline-none text-slate-900 placeholder:text-slate-400 shadow-inner" />
                    </div>
                  </div>

                  <button type="submit" disabled={addressLoading} className="w-full bg-slate-900 hover:bg-olive-400 text-white font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all disabled:opacity-50 pt-2">
                    {addressLoading ? "Registering Address Parameters..." : "Save Delivery Address"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {}
            {addresses.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                No active delivery addresses detected. Use the configuration action button above to add a delivery address record.
              </div>
            ) : (
              <div className="grid gap-3">
                {addresses.map(addr => (
                  <div 
                    key={addr.id} 
                    onClick={() => setSelectedAddress(addr.id)} 
                    className={`p-4 rounded-xl border cursor-pointer transition-all text-left ${
                      selectedAddress === addr.id 
                        ? 'bg-olive-50 border-olive-400 ring-2 ring-olive-400/10' 
                        : 'bg-slate-50 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-slate-950 text-xs font-black uppercase tracking-tight">{addr.full_name}</p>
                      {addr.phone_number && <p className="text-olive-600 font-mono text-[10px] font-bold">Tel: {addr.phone_number}</p>}
                    </div>
                    <p className="text-slate-500 text-xs font-medium">
                      {addr.street_address || addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code || addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-olive-400" /> Payment Selection Node
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-xl border bg-olive-50 border-olive-400 text-olive-600 flex items-center gap-3 shadow-inner">
                <div className="text-base shrink-0"><FiTruck /></div>
                <span className="text-xs font-black uppercase tracking-tight text-left">Cash on Delivery (COD)</span>
              </div>
            </div>
          </section>
        </div>

        {}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sticky top-24 shadow-sm">
            <h3 className="text-base font-black uppercase tracking-tight mb-6 border-b border-slate-100 pb-4 text-slate-900 text-left">Order Summary</h3>
            <div className="space-y-3.5 mb-6 text-xs font-semibold text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono text-slate-900">₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Shipping & Logistics</span><span className="text-olive-500 font-bold uppercase tracking-wider text-[10px]">Free</span></div>
              <div className="border-t border-slate-100 pt-4 flex justify-between text-slate-900 font-black text-base"><span>Final Total</span><span className="font-mono text-lg">₹{finalTotal}</span></div>
            </div>

            <button 
              type="button"
              onClick={handlePlaceOrder} 
              disabled={loading || !selectedAddress} 
              className="w-full bg-slate-900 hover:bg-olive-400 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-slate-950/5"
            >
              {loading ? "Processing Order..." : "Place Order"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={12} className="text-olive-400" /> Secure SSL Connection Verified
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
