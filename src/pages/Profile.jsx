// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders, changePassword, updateProfile } from '../services/api';
import { User, Package, Lock, LogOut, Edit2, Save, X } from 'lucide-react';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password change state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setName(user.name || '');
    setPhone(user.phone || '');
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await fetchMyOrders(token);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(token, { name, phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    }
    setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    try {
      await changePassword(token, currentPwd, newPwd);
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.message });
    }
    setTimeout(() => setPwdMsg({ type: '', text: '' }), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">My Account</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="bg-yellow-400 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {[{ id: 'profile', icon: <User size={16} />, label: 'Profile Info' },
                  { id: 'orders', icon: <Package size={16} />, label: 'My Orders' },
                  { id: 'password', icon: <Lock size={16} />, label: 'Change Password' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition ${
                      activeTab === tab.id ? 'bg-yellow-400 text-black font-semibold' : 'hover:bg-gray-100 text-gray-700'
                    }`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
                <hr className="my-2" />
                <button onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50">
                  <LogOut size={16} /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Profile Information</h2>
                  {!editing ? (
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                      <Edit2 size={14} /> Edit
                    </button>
                  ) : (
                    <button onClick={() => setEditing(false)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:underline">
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>
                {profileMsg.text && (
                  <div className={`mb-4 p-3 rounded text-sm ${
                    profileMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{profileMsg.text}</div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                    {editing ? (
                      <input value={name} onChange={e => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
                    ) : (
                      <p className="text-gray-800">{user.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Phone</label>
                    {editing ? (
                      <input value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
                    ) : (
                      <p className="text-gray-800">{user.phone || 'Not provided'}</p>
                    )}
                  </div>
                  {editing && (
                    <button onClick={handleProfileSave}
                      className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded">
                      <Save size={16} /> Save Changes
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">My Orders</h2>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link to="/shop" className="mt-3 inline-block bg-yellow-400 text-black px-6 py-2 rounded font-semibold">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id || order.order_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">Order #{(order.id || order.order_id)?.toString().slice(-6)}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">₹{Number(order.total_amount || order.total).toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                {pwdMsg.text && (
                  <div className={`mb-4 p-3 rounded text-sm ${
                    pwdMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{pwdMsg.text}</div>
                )}
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                    <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                      required className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">New Password</label>
                    <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                      required minLength={6} className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                    <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                      required className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
                  </div>
                  <button type="submit"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded">
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
