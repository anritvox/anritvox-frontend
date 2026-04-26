import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  users as usersApi, 
  orders as ordersApi, 
  wishlist as wishlistApi, 
  contact as contactApi 
} from '../services/api';
import { 
  User, Package, Heart, Shield, LifeBuoy, LogOut, 
  Key, Smartphone, AlertTriangle, CheckCircle2, 
  Trash2, XCircle, Clock, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({ name: '', phone: '' });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [secQuestion, setSecQuestion] = useState({ question: "What is your mother's maiden name?", answer: '' });
  const [twoFactor, setTwoFactor] = useState({ isEnabled: false, qrCode: '', secret: '', otp: '' });
  const [supportTicket, setSupportTicket] = useState({ subject: '', message: '' });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard' || activeTab === 'security') {
        const res = await usersApi.getProfile();
        setProfileData({ name: res.data.name || '', phone: res.data.phone || '' });
        setTwoFactor(prev => ({ ...prev, isEnabled: res.data.two_factor_enabled === 1 }));
      }
      if (activeTab === 'dashboard' || activeTab === 'orders') {
        const res = await ordersApi.getMyOrders();
        setOrders(res.data);
      }
      if (activeTab === 'dashboard' || activeTab === 'wishlist') {
        const res = await wishlistApi.get();
        setWishlist(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await usersApi.updateProfile(profileData);
      showMessage('success', 'Profile updated successfully.');
    } catch (err) { showMessage('error', 'Failed to update profile.'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await usersApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      showMessage('success', 'Password updated successfully.');
      setPasswords({ current: '', new: '' });
    } catch (err) { showMessage('error', err.response?.data?.message || 'Failed to update password.'); }
  };

  const handleUpdateSecurityQuestion = async (e) => {
    e.preventDefault();
    try {
      await usersApi.updateSecurityQuestion({ question: secQuestion.question, answer: secQuestion.answer });
      showMessage('success', 'Security question updated.');
      setSecQuestion(prev => ({ ...prev, answer: '' }));
    } catch (err) { showMessage('error', 'Failed to update security question.'); }
  };

  const setup2FA = async () => {
    try {
      const res = await usersApi.generate2FA();
      setTwoFactor(prev => ({ ...prev, qrCode: res.data.qrCode, secret: res.data.secret }));
    } catch (err) { showMessage('error', 'Failed to generate 2FA code.'); }
  };

  const verifyAndEnable2FA = async () => {
    try {
      await usersApi.verifyAndEnable2FA({ token: twoFactor.otp, secret: twoFactor.secret });
      showMessage('success', 'Two-Factor Authentication is now enabled.');
      setTwoFactor({ isEnabled: true, qrCode: '', secret: '', otp: '' });
    } catch (err) { showMessage('error', 'Invalid code. Please try again.'); }
  };

  const disable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA? This makes your account less secure.")) return;
    try {
      await usersApi.disable2FA();
      showMessage('success', '2FA has been disabled.');
      setTwoFactor({ isEnabled: false, qrCode: '', secret: '', otp: '' });
    } catch (err) { showMessage('error', 'Failed to disable 2FA.'); }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await ordersApi.updateStatus(orderId, 'cancelled');
      showMessage('success', 'Order cancelled successfully.');
      fetchDashboardData();
    } catch (err) { showMessage('error', 'Failed to cancel. It may have already been processed. Please contact support.'); }
  };

  const removeFromWishlist = async (id) => {
    try {
      await wishlistApi.remove(id);
      fetchDashboardData();
    } catch (err) { showMessage('error', 'Failed to remove item.'); }
  };

  const submitSupportTicket = async (e) => {
    e.preventDefault();
    try {
      await contactApi.submit({ name: profileData.name, email: user?.email, subject: supportTicket.subject, message: supportTicket.message });
      showMessage('success', 'Support request sent successfully. We will email you shortly.');
      setSupportTicket({ subject: '', message: '' });
    } catch (err) { showMessage('error', 'Failed to send request.'); }
  };

  const TabButton = ({ icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
      ${activeTab === id ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Alerts */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            {message.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2 h-fit">
            <div className="p-4 mb-2 text-center border-b border-slate-800">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500">
                <User size={32} />
              </div>
              <h3 className="text-white font-bold">{profileData.name || 'User'}</h3>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            
            <TabButton icon={<ShoppingBag size={18} />} label="Dashboard" id="dashboard" />
            <TabButton icon={<Package size={18} />} label="My Orders" id="orders" />
            <TabButton icon={<Heart size={18} />} label="Wishlist" id="wishlist" />
            <TabButton icon={<Shield size={18} />} label="Security & 2FA" id="security" />
            <TabButton icon={<LifeBuoy size={18} />} label="Support Tickets" id="support" />
            
            <div className="pt-4 mt-2 border-t border-slate-800">
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 min-h-[600px]">
            
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Welcome to your Account</h2>
                  <p className="text-slate-400 text-sm mt-1">Manage your details, orders, and security preferences.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <Package className="text-emerald-500 mb-2" size={32} />
                    <h3 className="text-3xl font-bold text-white">{orders?.length || 0}</h3>
                    <p className="text-sm text-slate-400">Total Orders</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <Heart className="text-red-500 mb-2" size={32} />
                    <h3 className="text-3xl font-bold text-white">{wishlist?.length || 0}</h3>
                    <p className="text-sm text-slate-400">Wishlist Items</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                    <Shield className={twoFactor.isEnabled ? "text-emerald-500 mb-2" : "text-amber-500 mb-2"} size={32} />
                    <h3 className="text-xl font-bold text-white mt-1">{twoFactor.isEnabled ? 'Secured' : 'Action Needed'}</h3>
                    <p className="text-sm text-slate-400">2FA Status</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
                      <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Phone Number</label>
                      <input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-400 text-sm">Save Changes</button>
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950 rounded-xl border border-slate-800">
                    <Package className="mx-auto text-slate-600 mb-3" size={48} />
                    <p className="text-slate-400">You haven't placed any orders yet.</p>
                    <button onClick={() => navigate('/shop')} className="mt-4 text-emerald-500 hover:text-white font-medium text-sm">Start Shopping</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-white font-bold">Order #{order.id}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 
                              order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>{order.status.toUpperCase()}</span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12}/> {new Date(order.created_at).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-300 mt-2 font-medium">${parseFloat(order.total).toFixed(2)}</p>
                        </div>
                        <div className="flex gap-3">
                          {order.status === 'pending' && (
                            <button onClick={() => cancelOrder(order.id)} className="px-4 py-2 bg-slate-800 hover:bg-red-500 hover:text-white text-slate-300 rounded-lg text-xs font-bold transition-colors">
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Your Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12 bg-slate-950 rounded-xl border border-slate-800">
                    <Heart className="mx-auto text-slate-600 mb-3" size={48} />
                    <p className="text-slate-400">Your wishlist is empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map(item => (
                      <div key={item.product_id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col relative group">
                        <button onClick={() => removeFromWishlist(item.product_id)} className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10">
                          <Trash2 size={16} />
                        </button>
                        <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-full h-40 object-contain mb-3 rounded-lg bg-white" />
                        <h4 className="text-white text-sm font-medium line-clamp-2">{item.name}</h4>
                        <div className="mt-auto pt-3 flex justify-between items-center">
                           <span className="text-emerald-500 font-bold">${item.discount_price || item.price}</span>
                           <button onClick={() => navigate(`/product/${item.product_id}`)} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700">View Item</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                
                {/* 2FA Panel */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Smartphone size={18} className="text-emerald-500"/> Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-400">Protect your account with an extra layer of security using an authenticator app (like Google Authenticator or Authy).</p>
                  
                  {twoFactor.isEnabled ? (
                    <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <div>
                          <p className="text-white font-medium text-sm">2FA is Enabled</p>
                          <p className="text-slate-500 text-xs">Your account is secured.</p>
                        </div>
                      </div>
                      <button onClick={disable2FA} className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all">Disable</button>
                    </div>
                  ) : (
                    <>
                      {!twoFactor.qrCode ? (
                        <button onClick={setup2FA} className="bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-400 text-sm">Setup Authenticator</button>
                      ) : (
                        <div className="space-y-5 p-5 border border-slate-700 bg-slate-900 rounded-xl mt-4">
                          <p className="text-sm text-white font-medium">1. Scan this QR code with your app:</p>
                          <div className="bg-white p-3 rounded-xl inline-block">
                            <img src={twoFactor.qrCode} alt="2FA QR Code" className="w-40 h-40" />
                          </div>
                          <p className="text-sm text-white font-medium">2. Enter the 6-digit code to verify:</p>
                          <div className="flex gap-3">
                            <input type="text" maxLength="6" placeholder="000000" value={twoFactor.otp} onChange={e => setTwoFactor({...twoFactor, otp: e.target.value})} className="w-32 bg-slate-950 border border-slate-700 text-white text-center text-xl tracking-[0.2em] font-bold rounded-xl px-2 py-3 focus:outline-none focus:border-emerald-500" />
                            <button onClick={verifyAndEnable2FA} className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-emerald-400">Enable 2FA</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Password Change */}
                <form onSubmit={handleChangePassword} className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Key size={18} className="text-blue-500"/> Update Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="password" required placeholder="Current Password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                    <input type="password" required placeholder="New Password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
                  </div>
                  <button type="submit" className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700 text-sm">Update Password</button>
                </form>

                {/* Security Question */}
                <form onSubmit={handleUpdateSecurityQuestion} className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Shield size={18} className="text-purple-500"/> Recovery Question</h3>
                  <p className="text-xs text-slate-400">Used as a backup to recover your account.</p>
                  <input type="text" disabled value="What is your mother's maiden name?" className="w-full bg-slate-900/50 border border-slate-800 text-slate-500 text-sm rounded-xl px-4 py-3 cursor-not-allowed" />
                  <input type="text" required placeholder="Your Secret Answer" value={secQuestion.answer} onChange={e => setSecQuestion({...secQuestion, answer: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" />
                  <button type="submit" className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700 text-sm">Save Answer</button>
                </form>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Help & Support</h2>
                <p className="text-slate-400 text-sm">Have a question or a problem with an order? Send us a message and our team will get back to you via email.</p>
                
                <form onSubmit={submitSupportTicket} className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Subject / Order Number</label>
                    <input type="text" required placeholder="e.g. Issue with Order #1234" value={supportTicket.subject} onChange={e => setSupportTicket({...supportTicket, subject: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Message</label>
                    <textarea required rows="5" placeholder="Describe your issue in detail..." value={supportTicket.message} onChange={e => setSupportTicket({...supportTicket, message: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 resize-none"></textarea>
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-emerald-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-emerald-400">Send Message</button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
