import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BASE_URL } from '../../services/api';

export default function WarehouseAdmin() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [distributors, setDistributors] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
  const [stocks, setStocks] = useState([]);
  
  // God Mode Edit Modal State
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: '', email: '', store_name: '', password: '', 
    wallet_balance: '', role: '', is_active: 1 
  });

  useEffect(() => {
    const currentToken = localStorage.getItem('warehouseToken') || localStorage.getItem('ms_token') || localStorage.getItem('token');
    if (currentToken) {
      setToken(currentToken);
      fetchMasterData(currentToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchSafe = async (url, headers) => {
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      return data; // Trust the backend's graceful failure JSON
    } catch (e) {
      return { success: false };
    }
  };

  const fetchMasterData = async (authToken) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const [usersData, salesData, summaryData, invData] = await Promise.all([
        fetchSafe(`${BASE_URL}/api/warehouse/admin/users`, headers),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/sales`, headers),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/sales-summary`, headers),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/inventory`, headers)
      ]);

      setDistributors(usersData?.users || []);
      setSales(salesData?.sales || []);
      setSummary(summaryData?.summary || []);
      setStocks(invData?.inventory || []);
      
    } catch (err) {
      console.error("Critical failure bypassed.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/warehouse/admin/user-deep-edit/${editUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('User God Mode profile updated successfully.');
        setEditUser(null);
        fetchMasterData(token);
      } else {
        alert('Failed to update: ' + data.message);
      }
    } catch (err) {
      alert('Network error updating user.');
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ 
      name: user.name || '', 
      email: user.email || '', 
      store_name: user.store_name || '', 
      password: '',
      wallet_balance: user.wallet_balance || 0,
      role: user.role || 'warehouse_admin',
      is_active: user.user_status !== undefined ? user.user_status : 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) return <Navigate to="/warehouseadmin" />;

  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.quantity * curr.sale_price || 0), 0);
  const totalItemsSold = sales.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Master Operations Control</h1>
            <p className="text-slate-400 mt-1">100% Granular Control Architecture.</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            {['dashboard', 'distributors', 'stocks', 'ledger', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-slate-400 text-sm font-medium">Total Network Revenue</h3>
              <p className="text-3xl font-bold text-white mt-2">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-slate-400 text-sm font-medium">Active Nodes</h3>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{distributors.filter(d => d.is_active).length}</p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-slate-400 text-sm font-medium">Total Units Sold</h3>
              <p className="text-3xl font-bold text-white mt-2">{totalItemsSold}</p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-slate-400 text-sm font-medium">Total Transactions</h3>
              <p className="text-3xl font-bold text-white mt-2">{sales.length}</p>
            </div>
          </div>
        )}

        {/* TAB: Live Stocks (CRASH-PROOFED) */}
        {activeTab === 'stocks' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {stocks.map((node) => {
                  let parsedState = {};
                  // BUG FIX: Indestructible JSON Parsing preventing the React TypeError
                  try {
                     const raw = node.app_state;
                     const temp = typeof raw === 'string' ? JSON.parse(raw) : raw;
                     parsedState = temp || {};
                  } catch(e) { parsedState = {}; }
                  
                  let items = [];
                  if (parsedState && typeof parsedState === 'object') {
                      Object.values(parsedState).forEach(val => {
                         if (Array.isArray(val) && val.length > 0 && (val[0].n || val[0].name)) {
                            items = val;
                         }
                      });
                  }

                  return (
                     <div key={node.user_id} className="bg-slate-800 rounded-lg p-5 border border-slate-700 shadow-lg">
                        <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-3">
                           <div>
                              <h3 className="font-bold text-emerald-400 truncate w-40">{node.store_name || 'Unknown Store'}</h3>
                              <p className="text-xs text-slate-400 mt-1">{node.distributor_name}</p>
                           </div>
                        </div>

                        {items.length > 0 ? (
                           <div className="max-h-60 overflow-y-auto pr-2">
                              <table className="w-full text-xs text-left">
                                 <thead className="text-slate-400 sticky top-0 bg-slate-800 py-2">
                                    <tr>
                                       <th className="font-medium pb-2">Product</th>
                                       <th className="font-medium pb-2 text-right">Qty</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-700/50">
                                    {items.map((item, idx) => (
                                       <tr key={idx} className="hover:bg-slate-700/30">
                                          <td className="py-2 text-slate-300 font-medium">{item.n || item.name || 'Unnamed'}</td>
                                          <td className="py-2 text-right text-emerald-400 font-bold">{item.q || item.quantity || item.qty || 0}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        ) : (
                           <div className="text-center py-6 text-slate-500 text-sm italic">No active inventory found.</div>
                        )}
                     </div>
                  );
               })}
            </div>
          </div>
        )}

        {/* TAB: Distributors Control */}
        {activeTab === 'distributors' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Node / Email</th>
                    <th className="px-6 py-4">Wallet Balance</th>
                    <th className="px-6 py-4">System Role</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {distributors.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.name} <span className="text-emerald-500">({user.store_name})</span></div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">₹{user.wallet_balance}</td>
                      <td className="px-6 py-4 uppercase text-xs tracking-wider">{user.role}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => openEditModal(user)} className="px-3 py-1 bg-red-900/50 text-red-400 hover:text-white hover:bg-red-600 rounded text-xs font-medium border border-red-800 transition-all">
                          God Mode Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Ledger & Analytics remain same logic, just rendering safely */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in p-6">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-300 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Distributor</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4 text-emerald-400">{log.distributor_name}</td>
                      <td className="px-6 py-4 text-white font-medium">{log.product_name}</td>
                      <td className="px-6 py-4">{log.quantity}</td>
                      <td className="px-6 py-4 font-bold text-white">₹{log.quantity * log.sale_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* GOD MODE MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-red-400">God Mode: Override User Profile</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleDeepEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Basic Info */}
              <div className="space-y-4 col-span-1">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Store / Node Name</label>
                    <input type="text" value={editForm.store_name} onChange={(e) => setEditForm({...editForm, store_name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none" />
                 </div>
              </div>

              {/* Master Controls */}
              <div className="space-y-4 col-span-1 bg-slate-950 p-4 rounded-lg border border-red-900/30">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Wallet Balance (₹)</label>
                    <input type="number" step="0.01" value={editForm.wallet_balance} onChange={(e) => setEditForm({...editForm, wallet_balance: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-emerald-400 font-bold outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">System Role</label>
                    <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none">
                       <option value="customer">Customer</option>
                       <option value="warehouse_admin">Warehouse Admin</option>
                       <option value="admin">Admin</option>
                       <option value="superadmin">Superadmin</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Account Status</label>
                    <select value={editForm.is_active} onChange={(e) => setEditForm({...editForm, is_active: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none">
                       <option value={1}>Active</option>
                       <option value={0}>Suspended</option>
                    </select>
                 </div>
              </div>

              {/* Danger Zone */}
              <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-red-400 mb-1">Force Password Reset (Leave blank to keep current)</label>
                <input type="text" placeholder="Type new password here to override..." value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className="w-full bg-slate-800 border border-red-900/50 rounded-md px-3 py-2 text-white outline-none focus:border-red-500 placeholder:text-slate-600" />
              </div>
              
              <div className="col-span-1 md:col-span-2 pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditUser(null)} className="px-6 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 font-bold shadow-lg shadow-red-900/20">Execute Override</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
