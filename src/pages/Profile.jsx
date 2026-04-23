import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, Package, MapPin, Lock, Heart, ShieldCheck, 
  LogOut, ChevronRight, Award, Save, Plus
} from 'lucide-react';
// 100% PROPER IMPORTS: Using the strictly mapped 
import { 
  users, 
  orders as ordersApi, 
  addresses as addressesApi, 
  wishlist as wishlistApi, 
  warranty 
} from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast() || {};
  const [activeTab, setActiveTab] = useState('overview');

  // Data State
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ current: '', new: '' });
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zip: '', country: '' });
  const [warrantySerial, setWarrantySerial] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      // REWRITTEN API CALLS
      const [oRes, aRes, wRes] = await Promise.all([
        ordersApi.getMyOrders(),
        addressesApi.getAll(),
        wishlistApi.get()
      ]);
      setOrders(oRes.data);
      setAddresses(aRes.data);
      setWishlist(wRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await users.updateProfile(profileForm); // REWRITTEN
      showToast?.('Profile updated successfully', 'success');
    } catch (err) {
      showToast?.('Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await users.changePassword(pwdForm); // REWRITTEN
      showToast?.('Password changed successfully', 'success');
      setPwdForm({ current: '', new: '' });
    } catch (err) {
      showToast?.('Failed to change password', 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressesApi.create(addressForm); // REWRITTEN
      showToast?.('Address added', 'success');
      setAddressForm({ street: '', city: '', state: '', zip: '', country: '' });
      const aRes = await addressesApi.getAll();
      setAddresses(aRes.data);
    } catch (err) {
      showToast?.('Failed to add address', 'error');
    }
  };

  const handleWarranty = async (e) => {
    e.preventDefault();
    try {
      await warranty.register({ serialNumber: warrantySerial }); // REWRITTEN
      showToast?.('Warranty registered', 'success');
      setWarrantySerial('');
    } catch (err) {
      showToast?.('Registration failed', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={18} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'warranty', label: 'E-Warranty', icon: <ShieldCheck size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-80 space-y-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-4xl font-black">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
                <p className="text-slate-500 font-medium">{user?.email}</p>
              </div>
              <div className="inline-flex items-center px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <Award size={12} className="mr-1" /> Gold Member
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-4 px-6 py-4 text-left transition-colors font-bold uppercase tracking-tighter text-sm ${
                  activeTab === tab.id ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-6 py-4 text-left transition-colors font-bold uppercase tracking-tighter text-sm text-rose-500 hover:bg-rose-50"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 min-h-[600px]">
            
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">Account Profile</h3>
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400">Full Name</label>
                      <input 
                        type="text" 
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400">Phone Number</label>
                      <input 
                        type="text" 
                        value={profileForm.phone}
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter hover:bg-emerald-500 transition-colors flex items-center">
                        <Save size={18} className="mr-2" /> Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <div className="text-4xl font-black text-emerald-500 mb-1">{orders.length}</div>
                    <div className="text-xs font-black uppercase text-slate-400">Total Orders</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <div className="text-4xl font-black text-emerald-500 mb-1">{wishlist.length}</div>
                    <div className="text-xs font-black uppercase text-slate-400">Wishlist Items</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                    <div className="text-4xl font-black text-emerald-500 mb-1">2,450</div>
                    <div className="text-xs font-black uppercase text-slate-400">Loyalty Points</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-8">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Order History</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Package size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="p-6 border border-slate-100 rounded-3xl hover:border-emerald-500 transition-colors flex justify-between items-center">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-400 mb-1">Order #{order._id.slice(-8).toUpperCase()}</p>
                          <h4 className="text-lg font-black text-slate-900">${order.totalAmount}</h4>
                          <p className="text-xs font-bold text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                          <ChevronRight size={20} className="text-slate-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">My Addresses</h3>
                   <button className="text-emerald-500 font-black uppercase tracking-widest text-xs flex items-center">
                     <Plus size={16} className="mr-1" /> New Address
                   </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr, i) => (
                    <div key={i} className="p-6 border border-slate-100 rounded-3xl relative">
                       <h4 className="font-black uppercase text-slate-900 mb-2">Home Address</h4>
                       <p className="text-slate-500 font-medium">{addr.street}, {addr.city}</p>
                       <p className="text-slate-500 font-medium">{addr.state}, {addr.zip}</p>
                       <p className="text-slate-500 font-medium">{addr.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-12">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Account Security</h3>
                <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400">Current Password</label>
                    <input 
                      type="password" 
                      value={pwdForm.current}
                      onChange={e => setPwdForm({...pwdForm, current: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400">New Password</label>
                    <input 
                      type="password" 
                      value={pwdForm.new}
                      onChange={e => setPwdForm({...pwdForm, new: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>
                  <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter hover:bg-emerald-500 transition-colors">
                    Update Password
                  </button>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
