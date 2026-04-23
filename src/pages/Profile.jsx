// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  updateProfile, 
  fetchMyOrders, 
  fetchAddressesAPI, 
  saveAddressAPI, 
  changePassword, 
  fetchWishlistAPI,
  registerWarranty,
  removeFromWishlistAPI
} from '../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Form States
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [pwdForm, setPwdForm] = useState({ current: '', new: '' });
  const [warrantySerial, setWarrantySerial] = useState('');
  const [addrForm, setAddrForm] = useState({ street: '', city: '', state: '', pincode: '' });
  
  // UI States
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Initial Auth Check & Setup
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user, navigate]);

  // Tab Data Fetcher
  useEffect(() => {
    const loadTabData = async () => {
      setStatusMsg({ type: '', text: '' });
      try {
        if (activeTab === 'orders') {
          const res = await fetchMyOrders();
          setOrders(res.data || res);
        } else if (activeTab === 'addresses') {
          const res = await fetchAddressesAPI();
          setAddresses(res.data || res);
        } else if (activeTab === 'wishlist') {
          const res = await fetchWishlistAPI();
          setWishlist(res.data || res);
        }
      } catch (error) {
        console.error(`Failed to load data for ${activeTab}:`, error);
      }
    };
    loadTabData();
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showMsg = (text, type = 'success') => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  // --- Actions ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(profileForm);
      showMsg('Profile updated successfully!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword(pwdForm.current, pwdForm.new);
      showMsg('Password changed successfully!');
      setPwdForm({ current: '', new: '' });
    } catch (err) {
      showMsg(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWarrantyRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWarranty({ serial: warrantySerial });
      showMsg('Product successfully registered for warranty!');
      setWarrantySerial('');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Invalid or already registered serial', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveAddressAPI(addrForm);
      showMsg('Address added successfully!');
      setAddrForm({ street: '', city: '', state: '', pincode: '' });
      const res = await fetchAddressesAPI();
      setAddresses(res.data || res);
    } catch (err) {
      showMsg('Failed to add address', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWishlist = async (id) => {
    try {
      await removeFromWishlistAPI(id);
      setWishlist(wishlist.filter(item => item.product_id !== id && item.id !== id));
      showMsg('Item removed from wishlist');
    } catch (err) {
      showMsg('Failed to remove item', 'error');
    }
  };

  // --- Renderers ---
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Account Overview</h2>
            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email (Unchangeable)</label>
                <input disabled value={user?.email || ''} className="w-full border p-2 rounded bg-gray-100 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                <input 
                  required
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-[#39d353] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                <input 
                  value={profileForm.phone} 
                  onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full border p-2 rounded focus:ring-[#39d353] outline-none" 
                />
              </div>
              <div className="md:col-span-2">
                <button disabled={loading} type="submit" className="mt-2 bg-[#39d353] text-white px-6 py-2 rounded hover:bg-[#2db844] transition-colors disabled:opacity-50">
                  {loading ? 'Saving...' : 'Update Profile Details'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Orders & Tracking</h2>
            {orders.length === 0 ? (
              <div className="mt-6 text-center text-gray-500 py-10 bg-gray-50 rounded border border-dashed">
                <p>No active orders found.</p>
                <Link to="/shop" className="mt-2 text-[#39d353] hover:underline block">Browse Accessories</Link>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {orders.map((order, i) => (
                  <div key={i} className="border p-4 rounded bg-gray-50 flex justify-between items-center">
                    <div>
                      <p className="font-bold">Order #{order.id || order._id}</p>
                      <p className="text-sm text-gray-500">Status: <span className="font-semibold text-blue-600 uppercase">{order.status}</span></p>
                    </div>
                    <p className="font-bold text-lg">${parseFloat(order.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'warranty':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">E-Warranty Vault</h2>
            <p className="text-sm text-gray-600 mt-2">Register your electronics (Basstubes, LEDs) using the serial number on the box.</p>
            <form onSubmit={handleWarrantyRegister} className="mt-4 p-4 border rounded bg-white shadow-sm flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input 
                required
                value={warrantySerial}
                onChange={e => setWarrantySerial(e.target.value)}
                type="text" 
                placeholder="Enter Serial (e.g., ANR-12345)" 
                className="flex-1 w-full border p-2 rounded focus:ring-[#39d353] outline-none" 
              />
              <button disabled={loading} type="submit" className="w-full sm:w-auto bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:opacity-50">
                Register
              </button>
            </form>
          </div>
        );

      case 'addresses':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Address Book</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {addresses.map((add, i) => (
                <div key={i} className="border p-4 rounded bg-gray-50">
                  <p className="font-semibold">{add.street}</p>
                  <p className="text-sm text-gray-600">{add.city}, {add.state} {add.pincode}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddAddress} className="mt-6 border-t pt-4 space-y-4">
              <h3 className="font-bold text-lg text-gray-700">Add New Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <input required value={addrForm.street} onChange={e=>setAddrForm({...addrForm, street: e.target.value})} placeholder="Street Address" className="col-span-2 border p-2 rounded outline-none" />
                <input required value={addrForm.city} onChange={e=>setAddrForm({...addrForm, city: e.target.value})} placeholder="City" className="border p-2 rounded outline-none" />
                <input required value={addrForm.state} onChange={e=>setAddrForm({...addrForm, state: e.target.value})} placeholder="State" className="border p-2 rounded outline-none" />
                <input required value={addrForm.pincode} onChange={e=>setAddrForm({...addrForm, pincode: e.target.value})} placeholder="Pincode/ZIP" className="col-span-2 border p-2 rounded outline-none" />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50">
                Save Address
              </button>
            </form>
          </div>
        );

      case 'wishlist':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">My Wishlist</h2>
            {wishlist.length === 0 ? (
              <p className="mt-6 text-center text-gray-500 py-10 bg-gray-50 rounded border border-dashed">Your wishlist is empty.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map((item, i) => (
                  <div key={i} className="border p-4 rounded flex justify-between items-center bg-gray-50">
                    <p className="font-semibold line-clamp-1">{item.name || 'Saved Product'}</p>
                    <button onClick={() => handleRemoveWishlist(item.product_id || item.id)} className="text-red-500 hover:underline text-sm">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Security Settings</h2>
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input required minLength="6" type="password" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})} className="mt-1 w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#39d353]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input required minLength="6" type="password" value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})} className="mt-1 w-full border p-2 rounded outline-none focus:ring-2 focus:ring-[#39d353]" />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>
        
        {/* Status Messages */}
        {statusMsg.text && (
          <div className={`mb-6 px-4 py-3 rounded text-sm font-bold ${statusMsg.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 bg-gray-50 border-b text-center">
                <div className="h-20 w-20 bg-[#39d353] rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-inner uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              <nav className="flex flex-col p-2 space-y-1">
                {[
                  { id: 'overview', label: 'Account Overview', icon: '👤' },
                  { id: 'orders', label: 'Orders & Tracking', icon: '📦' },
                  { id: 'warranty', label: 'E-Warranty Vault', icon: '🛡️' },
                  { id: 'addresses', label: 'Address Book', icon: '📍' },
                  { id: 'wishlist', label: 'My Wishlist', icon: '❤️' },
                  { id: 'security', label: 'Security', icon: '🔒' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center text-left px-4 py-3 rounded transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-gray-100 text-[#39d353] font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-3 rounded text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="mr-3 text-lg">🚪</span>
                    <span className="text-sm font-medium">Secure Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow p-6 min-h-[600px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
