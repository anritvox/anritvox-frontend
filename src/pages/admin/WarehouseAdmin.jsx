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
  const [activityLog, setActivityLog] = useState([]);
  
  // NEW: Node Impersonation State (Volatile memory)
  const [nodeView, setNodeView] = useState({ active: false, userName: '', data: null, activeTab: 'inventory' });
  
  // God Mode Edit Modal State
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', email: '', store_name: '', password: '',
    wallet_balance: '', role: '', is_active: 1
  });
  
  // Add New User Modal State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '', email: '', password: '', store_name: '', role: 'customer', wallet_balance: 0
  });
  
  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
  
  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');

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
      return data;
    } catch (e) {
      return { success: false };
    }
  };

  const fetchMasterData = async (authToken) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const [usersData, salesData, summaryData, invData, activityData] = await Promise.all([
        fetchSafe(`${BASE_URL}/api/warehouse/admin/users`, headers),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/sales`, headers),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/sales-summary`, headers),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/inventory`, headers),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/activity-log`, headers)
      ]);
      
      setDistributors(usersData?.users || []);
      setSales(salesData?.sales || []);
      setSummary(summaryData?.summary || []);
      setStocks(invData?.inventory || []);
      setActivityLog(activityData?.logs || []);
    } catch (err) {
      console.error("Critical failure bypassed.", err);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Front-End Aggressive Extraction Logic
  const handleRetrieveData = async (userId, userName) => {
    try {
        const res = await fetch(`${BASE_URL}/api/warehouse/admin/retrieve-node/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.app_state) {
            let stateObj = data.app_state;
            
            // Aggressive string unwrap
            for(let i=0; i<5; i++) {
                if (typeof stateObj === 'string') {
                    try { stateObj = JSON.parse(stateObj); } catch(e) { break; }
                }
            }
            
            let inv = [];
            let sls = [];
            
            // Dynamic object scan
            const scan = (obj) => {
                if (Array.isArray(obj)) {
                    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
                        const first = obj[0];
                        if (first.n || first.name || first.product_name) {
                            if (first.t || first.date || first.sold_at || first.timestamp) {
                                if(sls.length === 0) sls = obj;
                            } else {
                                if(inv.length === 0) inv = obj;
                            }
                        }
                    }
                } else if (typeof obj === 'object' && obj !== null) {
                    Object.values(obj).forEach(scan);
                }
            };
            
            // Standard Paths Priority
            if (stateObj?.AV?.d?.i) inv = stateObj.AV.d.i;
            if (stateObj?.AV?.d?.s) sls = stateObj.AV.d.s;
            
            // Fallback Scan if empty
            if (inv.length === 0 || sls.length === 0) scan(stateObj);
            
            setNodeView({ 
                active: true, 
                userName, 
                data: { inventory: inv, sales: sls }, 
                activeTab: 'inventory' 
            });
        } else {
            alert('❌ No warehouse data found for this user/node.');
        }
    } catch (e) {
        alert('❌ Network error retrieving node data.');
    }
  };

  const handleDeepEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/warehouse/admin/user-deep-edit/${editUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ User profile updated successfully.');
        setEditUser(null);
        fetchMasterData(token);
      } else {
        alert('❌ Failed to update: ' + data.message);
      }
    } catch (err) {
      alert('❌ Network error updating user.');
    }
  };
  
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/warehouse/admin/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ New user added successfully.');
        setShowAddUser(false);
        setNewUserForm({ name: '', email: '', password: '', store_name: '', role: 'customer', wallet_balance: 0 });
        fetchMasterData(token);
      } else {
        alert('❌ Failed to add user: ' + data.message);
      }
    } catch (err) {
      alert('❌ Network error adding user.');
    }
  };
  
  const handleDeleteUser = (userId, userName) => {
    setConfirmDialog({
      show: true,
      message: `⚠️ Are you absolutely sure you want to DELETE user "${userName}"? This action CANNOT be undone and will remove all associated data.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/warehouse/admin/user/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            alert('✅ User deleted successfully.');
            fetchMasterData(token);
          } else {
            alert('❌ Failed to delete: ' + data.message);
          }
        } catch (err) {
          alert('❌ Network error deleting user.');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };
  
  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const newStatus = currentStatus ? 0 : 1;
    const action = newStatus ? 'ACTIVATE' : 'SUSPEND';
    setConfirmDialog({
      show: true,
      message: `Are you sure you want to ${action} user "${userName}"?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/warehouse/admin/toggle-status/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_active: newStatus })
          });
          const data = await res.json();
          if (data.success) {
            alert(`✅ User ${action}D successfully.`);
            fetchMasterData(token);
          } else {
            alert('❌ Failed: ' + data.message);
          }
        } catch (err) {
          alert('❌ Network error.');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };
  
  const handleWalletAdjust = (userId, currentBalance, userName) => {
    const adjustment = prompt(`Current balance: ₹${currentBalance}\n\nEnter amount to ADD (+100) or DEDUCT (-50):`);
    if (adjustment === null) return;
    const amount = parseFloat(adjustment);
    if (isNaN(amount)) {
      alert('❌ Invalid amount.');
      return;
    }
    
    setConfirmDialog({
      show: true,
      message: `Adjust wallet for "${userName}" by ₹${amount}?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/warehouse/admin/wallet-adjust/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ adjustment: amount })
          });
          const data = await res.json();
          if (data.success) {
            alert(`✅ Wallet adjusted. New balance: ₹${data.new_balance}`);
            fetchMasterData(token);
          } else {
            alert('❌ Failed: ' + data.message);
          }
        } catch (err) {
          alert('❌ Network error.');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };
  
  const handleGrantAccess = (userId, userName) => {
    const storeName = prompt(`Grant warehouse access to "${userName}"\n\nEnter store/node name:`);
    if (!storeName || storeName.trim() === '') return;
    
    setConfirmDialog({
      show: true,
      message: `Grant warehouse access to "${userName}" for store "${storeName}"?`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/warehouse/admin/grant-access`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: userId, store_name: storeName })
          });
          const data = await res.json();
          if (data.success) {
            alert('✅ Warehouse access granted successfully.');
            fetchMasterData(token);
          } else {
            alert('❌ Failed: ' + data.message);
          }
        } catch (err) {
          alert('❌ Network error.');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };
  
  const handleRevokeAccess = (userId, userName) => {
    setConfirmDialog({
      show: true,
      message: `⚠️ REVOKE warehouse access for "${userName}"? They will lose all warehouse permissions.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/warehouse/admin/revoke-access/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            alert('✅ Warehouse access revoked successfully.');
            fetchMasterData(token);
          } else {
            alert('❌ Failed: ' + data.message);
          }
        } catch (err) {
          alert('❌ Network error.');
        }
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
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
  
  const filteredDistributors = distributors.filter(user => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.store_name && user.store_name.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-400 text-xl font-mono">⏳ Loading Master Control Panel...</div>
      </div>
    );
  }

  if (!token) return <Navigate to="/warehouse" />;

  // IMPERSONATION OVERLAY RENDERER (Total View of Downloaded User Data)
  if (nodeView.active) {
      return (
          <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-mono text-white overflow-hidden">
              <div className="bg-emerald-900 border-b border-emerald-700 px-6 py-4 flex justify-between items-center shadow-lg">
                  <div>
                    <h2 className="text-2xl font-bold text-white">🟢 LIVE CONNECTION ESTABLISHED</h2>
                    <p className="text-emerald-300 text-sm">Intercepting feed from Node: <span className="font-bold text-white uppercase">{nodeView.userName}</span></p>
                  </div>
                  <button 
                      onClick={() => setNodeView({ active: false, userName: '', data: null, activeTab: 'inventory' })} 
                      className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-xl transition-all"
                  >
                      🔌 TERMINATE CONNECTION
                  </button>
              </div>

              <div className="flex bg-slate-900 border-b border-slate-800">
                  <button onClick={() => setNodeView({...nodeView, activeTab: 'inventory'})} className={`px-6 py-3 font-bold transition-all ${nodeView.activeTab === 'inventory' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white'}`}>📦 RAW INVENTORY FEED</button>
                  <button onClick={() => setNodeView({...nodeView, activeTab: 'sales'})} className={`px-6 py-3 font-bold transition-all ${nodeView.activeTab === 'sales' ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}>📓 SALES LEDGER FEED</button>
              </div>

              <div className="flex-1 overflow-auto p-6 bg-slate-900/50">
                  {nodeView.activeTab === 'inventory' && (
                      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                          <table className="w-full text-left">
                              <thead className="bg-slate-800">
                                  <tr>
                                      <th className="p-4 text-emerald-400 font-bold uppercase text-xs">Product Name</th>
                                      <th className="p-4 text-emerald-400 font-bold uppercase text-xs text-right">Quantity</th>
                                      <th className="p-4 text-emerald-400 font-bold uppercase text-xs text-right">Cost Price</th>
                                      <th className="p-4 text-emerald-400 font-bold uppercase text-xs text-right">Sale Price</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                  {nodeView.data.inventory.length > 0 ? nodeView.data.inventory.map((item, i) => (
                                      <tr key={i} className="hover:bg-slate-800/50">
                                          <td className="p-4 text-slate-200 font-medium">{item.n || item.name || item.product_name}</td>
                                          <td className="p-4 text-right text-emerald-300 font-bold">{item.q || item.quantity || item.qty || 0}</td>
                                          <td className="p-4 text-right text-slate-400">₹{item.c || item.cost || item.cost_price || 0}</td>
                                          <td className="p-4 text-right text-blue-400">₹{item.p || item.price || item.sale_price || 0}</td>
                                      </tr>
                                  )) : (
                                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">No inventory nodes detected in signal.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  )}

                  {nodeView.activeTab === 'sales' && (
                      <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                          <table className="w-full text-left">
                              <thead className="bg-slate-800">
                                  <tr>
                                      <th className="p-4 text-cyan-400 font-bold uppercase text-xs">Timestamp</th>
                                      <th className="p-4 text-cyan-400 font-bold uppercase text-xs">Product</th>
                                      <th className="p-4 text-cyan-400 font-bold uppercase text-xs text-right">Qty</th>
                                      <th className="p-4 text-cyan-400 font-bold uppercase text-xs text-right">Total Price</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800">
                                  {nodeView.data.sales.length > 0 ? nodeView.data.sales.map((sale, i) => {
                                      const d = new Date(sale.t || sale.timestamp || sale.date || sale.sold_at || Date.now());
                                      return (
                                      <tr key={i} className="hover:bg-slate-800/50">
                                          <td className="p-4 text-slate-400 text-sm">{d.toLocaleString()}</td>
                                          <td className="p-4 text-slate-200 font-medium">{sale.n || sale.name || sale.product_name}</td>
                                          <td className="p-4 text-right text-cyan-300 font-bold">{sale.q || sale.quantity || sale.qty || 0}</td>
                                          <td className="p-4 text-right text-emerald-400 font-bold">₹{sale.pr || (sale.q * sale.p) || sale.price || sale.sale_price || 0}</td>
                                      </tr>
                                  )}) : (
                                      <tr><td colSpan="4" className="p-8 text-center text-slate-500 italic">No transaction nodes detected in signal.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.quantity * curr.sale_price || 0), 0);
  const totalItemsSold = sales.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            🔧 God Mode: Master Operations Control
          </h1>
          <p className="text-slate-400 text-sm">100% Granular Control over Warehouse Network Architecture.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-8">
          {['dashboard', 'users', 'stocks', 'ledger', 'activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* TAB: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-slate-400 text-sm mb-2">Total Network Revenue</h3>
              <p className="text-3xl font-bold text-emerald-400">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-slate-400 text-sm mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-cyan-400">{distributors.filter(d => d.is_active || d.user_status).length}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-slate-400 text-sm mb-2">Total Units Sold</h3>
              <p className="text-3xl font-bold text-purple-400">{totalItemsSold}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 shadow-xl">
              <h3 className="text-slate-400 text-sm mb-2">Total Transactions</h3>
              <p className="text-3xl font-bold text-orange-400">{sales.length}</p>
            </div>
          </div>
        )}

        {/* TAB: Users (God Mode Control) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search & Add User */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="🔍 Search by name, email, or store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => setShowAddUser(true)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-lg transition-all"
              >
                ➕ Add New User
              </button>
            </div>
            
            {/* User Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">User / Store</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Wallet</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredDistributors.map((user) => (
                      <tr key={user.user_id} className="hover:bg-slate-800/30 transition-all">
                        <td className="px-4 py-4">
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-sm text-slate-400">{user.store_name || 'No Store'}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-emerald-400 font-bold">₹{user.wallet_balance || 0}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 text-xs font-medium bg-slate-800 text-cyan-400 rounded">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            user.user_status || user.is_active
                              ? 'bg-emerald-900/30 text-emerald-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {user.user_status || user.is_active ? '✓ Active' : '✕ Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {/* NEW: DIRECT RETRIEVAL BUTTON */}
                            <button
                              onClick={() => handleRetrieveData(user.user_id, user.name)}
                              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded shadow-lg transition-all animate-pulse"
                            >
                              👁️ Retrieve Data
                            </button>
                            
                            <button
                              onClick={() => openEditModal(user)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-all"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user.user_id, user.user_status || user.is_active, user.name)}
                              className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                                user.user_status || user.is_active
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {user.user_status || user.is_active ? '⏸️ Suspend' : '▶️ Activate'}
                            </button>
                            <button
                              onClick={() => handleWalletAdjust(user.user_id, user.wallet_balance || 0, user.name)}
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-all"
                            >
                              💰 Wallet
                            </button>
                            {user.store_name ? (
                              <button
                                onClick={() => handleRevokeAccess(user.user_id, user.name)}
                                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded transition-all"
                              >
                                🔒 Revoke Access
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGrantAccess(user.user_id, user.name)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-all"
                              >
                                🔓 Grant Access
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user.user_id, user.name)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-all"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Live Stocks */}
        {activeTab === 'stocks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {(() => {
      const grouped = {};
      stocks.forEach(item => {
        const key = `${item.user_id}_${item.store_name || 'unknown'}`;
        if (!grouped[key]) {
          grouped[key] = {
            user_id: item.user_id,
            distributor_name: item.distributor_name,
            store_name: item.store_name,
            items: []
          };
        }
        grouped[key].items.push(item);
      });
      
      return Object.values(grouped).map((group) => (
        <div key={group.user_id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-1">
            {group.store_name || 'Unknown Store'}
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            {group.distributor_name}
          </p>
          
          {group.items.length > 0 ? (
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-2 text-xs text-slate-400">Product</th>
                  <th className="text-right py-2 text-xs text-slate-400">Qty</th>
                  <th className="text-right py-2 text-xs text-slate-400">Cost</th>
                  <th className="text-right py-2 text-xs text-slate-400">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {group.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 text-sm text-slate-300">
                      {item.product_name || 'Unnamed'}
                    </td>
                    <td className="py-2 text-sm text-right text-emerald-400 font-bold">
                      {item.quantity || 0} {item.unit || ''}
                    </td>
                    <td className="py-2 text-sm text-right text-slate-400">
                      ₹{item.cost_price || 0}
                    </td>
                    <td className="py-2 text-sm text-right text-blue-400">
                      ₹{item.sale_price || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-slate-500 text-sm italic">
              No active inventory found.
            </p>
          )}
        </div>
      ));
    })()}
          </div>
        )}

        {/* TAB: Ledger */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/70">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Distributor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-sm text-white">{log.distributor_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{log.product_name}</td>
                      <td className="px-4 py-3 text-sm text-cyan-400">{log.quantity}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400 font-bold">₹{log.quantity * log.sale_price}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{new Date(log.sold_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* TAB: Activity Log */}
        {activeTab === 'activity' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">🔍 Activity & Audit Log</h2>
            {activityLog.length > 0 ? (
              <div className="space-y-3">
                {activityLog.map((log, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm text-slate-300">{log.action}</span>
                        <p className="text-xs text-slate-500 mt-1">by {log.admin_name} • {log.target_user}</p>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Activity logging feature requires backend implementation.</p>
            )}
          </div>
        )}
      </div>

      {/* GOD MODE EDIT MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">⚙️ God Mode: Override User Profile</h2>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleDeepEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Store / Node Name</label>
                <input
                  type="text"
                  value={editForm.store_name}
                  onChange={(e) => setEditForm({...editForm, store_name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Wallet Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.wallet_balance}
                  onChange={(e) => setEditForm({...editForm, wallet_balance: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-emerald-400 font-bold outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">System Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="customer">Customer</option>
                  <option value="warehouse_admin">Warehouse Admin</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Account Status</label>
                <select
                  value={editForm.is_active}
                  onChange={(e) => setEditForm({...editForm, is_active: parseInt(e.target.value)})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value={1}>✓ Active</option>
                  <option value={0}>✕ Suspended</option>
                </select>
              </div>
              
              <div className="border-t border-red-900/30 pt-4">
                <label className="block text-sm font-medium text-red-400 mb-1">⚠️ Force Password Reset</label>
                <p className="text-xs text-slate-500 mb-2">Leave blank to keep current password</p>
                <input
                  type="text"
                  placeholder="Type new password here to override..."
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="w-full bg-slate-800 border border-red-900/50 rounded-md px-3 py-2 text-white outline-none focus:border-red-500 placeholder:text-slate-600"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 px-6 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded shadow-lg transition-all"
                >
                  ⚡ Execute Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* ADD USER MODAL */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">➕ Add New User</h2>
              <button onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Store / Node Name</label>
                <input
                  type="text"
                  value={newUserForm.store_name}
                  onChange={(e) => setNewUserForm({...newUserForm, store_name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">System Role</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="customer">Customer</option>
                  <option value="warehouse_admin">Warehouse Admin</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Initial Wallet Balance (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newUserForm.wallet_balance}
                  onChange={(e) => setNewUserForm({...newUserForm, wallet_balance: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-emerald-400 font-bold outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-6 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded shadow-lg transition-all"
                >
                  ✓ Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* CONFIRM DIALOG */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-white mb-4">⚠️ Confirm Action</h3>
            <p className="text-slate-300 text-sm mb-6 whitespace-pre-line">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
                className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
