import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Package, MapPin, Lock, Heart, ShieldCheck, 
  LogOut, ChevronRight, Award, Save, Plus, 
  Trash2, Clock, Truck, CheckCircle2, Zap
} from 'lucide-react';
import { 
  users, 
  orders as ordersApi, 
  addresses as addressesApi, 
  wishlist as wishlistApi, 
  warranty 
} from '../services/api';
// Fallback if ToastContext is missing
import { useToast } from '../context/ToastContext'; 

// --- Animation Variants ---
const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Safe extraction of toast
  const toastContext = useToast();
  const showToast = toastContext?.showToast || ((msg) => alert(msg)); 
  
  const [activeTab, setActiveTab] = useState('overview');

  // --- Data State ---
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Form States ---
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ current: '', new: '' });
  const [addressForm, setAddressForm] = useState({ street: '', city: '', state: '', zip: '', country: '' });
  const [warrantySerial, setWarrantySerial] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAllData();
  }, [user, navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [oRes, aRes, wRes] = await Promise.all([
        ordersApi.getMyOrders().catch(() => ({ data: [] })),
        addressesApi.getAll().catch(() => ({ data: [] })),
        wishlistApi.get().catch(() => ({ data: [] }))
      ]);
      setOrders(oRes.data?.data || oRes.data || []);
      setAddresses(aRes.data?.data || aRes.data || []);
      setWishlist(wRes.data?.data || wRes.data || []);
    } catch (err) {
      console.error("Dashboard Sync Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await users.updateProfile(profileForm);
      showToast('Node profile updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await users.changePassword(pwdForm);
      showToast('Security key updated successfully', 'success');
      setPwdForm({ current: '', new: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update security key', 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressesApi.create(addressForm);
      showToast('Shipping coordinate registered', 'success');
      setAddressForm({ street: '', city: '', state: '', zip: '', country: '' });
      setShowAddressForm(false);
      loadAllData();
    } catch (err) {
      showToast('Failed to register coordinate', 'error');
    }
  };

  const handleWarranty = async (e) => {
    e.preventDefault();
    try {
      await warranty.register({ serialNumber: warrantySerial });
      showToast('Hardware node secured under warranty', 'success');
      setWarrantySerial('');
    } catch (err) {
      showToast('Verification failed. Invalid serial.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: <User size={18} /> },
    { id: 'orders', label: 'Active Deployments', icon: <Package size={18} /> },
    { id: 'addresses', label: 'Shipping Coordinates', icon: <MapPin size={18} /> },
    { id: 'wishlist', label: 'Target Arsenal', icon: <Heart size={18} /> },
    { id: 'security', label: 'Access & Security', icon: <Lock size={18} /> },
    { id: 'warranty', label: 'Node Protection', icon: <ShieldCheck size={18} /> }
  ];

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="min-h-screen bg-slate-950 text-white py-32 px-6 selection:bg-emerald-500 selection:text-black">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-[10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-[10%] w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0">
          
          {/* User ID Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-50"></div>
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-emerald-500 text-4xl font-black shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                {user?.name?.charAt(0).toUpperCase() || 'X'}
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">{user?.name || 'Unknown Operator'}</h2>
                <p className="text-slate-400 font-medium text-sm">{user?.email}</p>
              </div>
              <div className="inline-flex items-center px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Award size={14} className="mr-2" /> Clearance Level: Prime
              </div>
            </div>
          </div>

          {/* Navigation Matrix */}
          <nav className="bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-slate-800 overflow-hidden flex flex-col">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-4 px-6 py-5 text-left transition-all font-black uppercase tracking-widest text-xs relative ${
                  activeTab === tab.id ? 'bg-slate-800 text-emerald-500' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {activeTab === tab.id && <motion.div layoutId="activeNav" className="absolute left-0 top-0 w-1 h-full bg-emerald-500" />}
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 px-6 py-5 text-left transition-colors font-black uppercase tracking-widest text-xs text-red-500 hover:bg-red-500/10 border-t border-slate-800"
            >
              <LogOut size={16} />
              <span>Terminate Session</span>
            </button>
          </nav>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-slate-800 p-8 min-h-[600px] overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div key="overview" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Zap className="text-emerald-500" /> Operator Profile
                  </h3>
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Designation (Name)</label>
                      <input 
                        type="text" 
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-2xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comm Link (Phone)</label>
                      <input 
                        type="text" 
                        value={profileForm.phone}
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-2xl focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 mt-4">
                      <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Save size={16} className="mr-2" /> Sync Changes
                      </button>
                    </div>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800">
                  {[
                    { label: "Active Orders", value: orders.length, icon: <Package/> },
                    { label: "Arsenal Targets", value: wishlist.length, icon: <Heart/> },
                    { label: "Credit Nodes", value: "2,450", icon: <Award/> }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                      <div className="absolute -right-4 -top-4 text-slate-900 group-hover:text-emerald-900/20 transition-colors">
                        {React.cloneElement(stat.icon, { size: 100 })}
                      </div>
                      <div className="relative z-10">
                        <div className="text-4xl font-black text-emerald-500 mb-2">{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div key="orders" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Package className="text-emerald-500" /> Deployment History
                </h3>
                {orders.length === 0 ? (
                  <div className="text-center py-24 bg-slate-950 rounded-3xl border border-slate-800 border-dashed">
                    <Package size={48} className="mx-auto text-slate-800 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No hardware deployed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, i) => (
                      <div key={order._id || i} className="p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Manifest #{String(order._id).slice(-8).toUpperCase()}</p>
                          <h4 className="text-xl font-black text-white">₹{order.totalAmount || order.total_amount || 0}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                            <Clock size={12}/> {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                          }`}>
                            {order.status || 'Processing'}
                          </span>
                          <button className="text-slate-500 hover:text-white transition-colors bg-slate-900 p-2 rounded-lg">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                     <MapPin className="text-emerald-500" /> Delivery Coordinates
                   </h3>
                   <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-emerald-500 hover:text-white font-black uppercase tracking-widest text-[10px] flex items-center bg-emerald-500/10 px-4 py-2 rounded-lg transition-colors border border-emerald-500/20">
                     {showAddressForm ? 'Cancel' : <><Plus size={14} className="mr-1" /> Add Node</>}
                   </button>
                </div>

                <AnimatePresence>
                  {showAddressForm && (
                    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 overflow-hidden">
                      <input type="text" placeholder="Street Address" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none text-sm md:col-span-2" required />
                      <input type="text" placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none text-sm" required />
                      <input type="text" placeholder="State/Province" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none text-sm" required />
                      <input type="text" placeholder="Zip/Postal Code" value={addressForm.zip} onChange={e => setAddressForm({...addressForm, zip: e.target.value})} className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none text-sm" required />
                      <input type="text" placeholder="Country" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none text-sm" required />
                      <button type="submit" className="md:col-span-2 bg-emerald-500 text-black p-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white transition-colors mt-2">Save Coordinates</button>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.length === 0 && !showAddressForm && (
                    <div className="md:col-span-2 text-center py-12 text-slate-500 font-bold uppercase tracking-widest text-sm">No coordinates mapped.</div>
                  )}
                  {addresses.map((addr, i) => (
                    <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-2xl relative group">
                       <div className="absolute top-6 right-6 text-slate-800 group-hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={18}/></div>
                       <h4 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2"><Truck size={16}/> Node {i + 1}</h4>
                       <p className="text-slate-300 font-medium text-sm leading-relaxed">{addr.street}<br/>{addr.city}, {addr.state} {addr.zip}<br/>{addr.country}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div key="security" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Lock className="text-emerald-500" /> Encryption Protocols
                </h3>
                <form onSubmit={handlePasswordChange} className="max-w-md space-y-6 bg-slate-950 p-8 rounded-2xl border border-slate-800">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Key</label>
                    <input 
                      type="password" 
                      required
                      value={pwdForm.current}
                      onChange={e => setPwdForm({...pwdForm, current: e.target.value})}
                      className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Key</label>
                    <input 
                      type="password" 
                      required
                      value={pwdForm.new}
                      onChange={e => setPwdForm({...pwdForm, new: e.target.value})}
                      className="w-full p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none text-sm"
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    Update Master Key
                  </button>
                </form>
              </motion.div>
            )}

            {/* WARRANTY TAB */}
            {activeTab === 'warranty' && (
              <motion.div key="warranty" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" /> E-Warranty Node
                </h3>
                <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl">
                  <p className="text-slate-400 text-sm font-medium mb-6">Enter your hardware serial key to activate replacement protection.</p>
                  <form onSubmit={handleWarranty} className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="text" 
                      required
                      placeholder="ANR-XXXX-XXXX"
                      value={warrantySerial}
                      onChange={e => setWarrantySerial(e.target.value)}
                      className="flex-1 p-4 bg-slate-900 border border-slate-800 text-white rounded-xl focus:border-emerald-500 outline-none uppercase font-black tracking-widest"
                    />
                    <button type="submit" className="bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center whitespace-nowrap">
                      <CheckCircle2 size={16} className="mr-2"/> Validate
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Heart className="text-emerald-500" /> Arsenal Targets
                </h3>
                {wishlist.length === 0 ? (
                  <div className="text-center py-24 bg-slate-950 rounded-3xl border border-slate-800 border-dashed">
                    <Heart size={48} className="mx-auto text-slate-800 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No targets acquired.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Assuming wishlist items come as an array of products */}
                    {wishlist.map((item, i) => (
                      <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl relative group">
                         <div className="absolute top-4 right-4 text-slate-800 group-hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={18}/></div>
                         <div className="w-full aspect-square bg-slate-900 rounded-xl mb-4 border border-slate-800 overflow-hidden">
                           {/* Replace with actual image url if available */}
                           <img src={item.image_url || '/logo.webp'} alt={item.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <h4 className="text-sm font-black uppercase tracking-widest text-white line-clamp-1">{item.name || 'Hardware Node'}</h4>
                         <p className="text-emerald-500 font-black mt-1">₹{item.price || '0.00'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// --- High-End Skeleton Loader ---
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-slate-950 py-32 px-6 flex justify-center">
    <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-8 animate-pulse">
      <div className="w-full lg:w-80 h-[500px] bg-slate-900 rounded-[2rem] shrink-0 border border-slate-800"></div>
      <div className="flex-1 h-[700px] bg-slate-900 rounded-[2rem] border border-slate-800"></div>
    </div>
  </div>
);
