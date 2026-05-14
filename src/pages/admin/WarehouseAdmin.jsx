import React, { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { BASE_URL } from '../../services/api';

export default function WarehouseAdmin() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [distributors, setDistributors] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  
  // Modal Views
  const [storeView, setStoreView] = useState({ active: false, userName: '', data: null, activeTab: 'inventory' });
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', store_name: '', password: '', wallet_balance: '', role: '', is_active: 1 });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', store_name: '', role: 'customer', wallet_balance: 0 });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStore, setFilterStore] = useState('');

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
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  };

  const fetchMasterData = async (authToken) => {
    setRefreshing(true);
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
      console.error("Data synchronization failed.", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRetrieveData = async (userId, userName) => {
    try {
        // [FIX APPLIED]: Reverted to /retrieve-node/ to align with the active Railway backend deployment
        const res = await fetch(`${BASE_URL}/api/warehouse/admin/retrieve-node/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success && data.app_state) {
            let stateObj = data.app_state;
            for(let i=0; i<5; i++) {
                if (typeof stateObj === 'string') {
                    try { stateObj = JSON.parse(stateObj); } catch(e) { break; }
                }
            }
            
            let inv = [], sls = [];
            const scan = (obj) => {
                if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
                    const first = obj[0];
                    if (first.n || first.name || first.product_name) {
                        if (first.t || first.date || first.sold_at || first.timestamp || first.created_at) {
                            if(sls.length === 0) sls = obj;
                        } else {
                            if(inv.length === 0) inv = obj;
                        }
                    }
                } else if (typeof obj === 'object' && obj !== null) {
                    Object.values(obj).forEach(scan);
                }
            };
            
            if (stateObj?.AV?.d?.i) inv = stateObj.AV.d.i;
            if (stateObj?.AV?.d?.s) sls = stateObj.AV.d.s;
            if (inv.length === 0 || sls.length === 0) scan(stateObj);
            
            setStoreView({ active: true, userName, data: { inventory: inv, sales: sls }, activeTab: 'inventory' });
        } else {
            alert('No store data available for this user.');
        }
    } catch (e) {
        alert('Network error retrieving store data.');
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
        alert('User profile updated successfully.');
        setEditUser(null);
        fetchMasterData(token);
      } else alert('Update failed: ' + data.message);
    } catch (err) { alert('Network error updating user.'); }
  };
  
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/warehouse/admin/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUserForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('User created successfully.');
        setShowAddUser(false);
        setNewUserForm({ name: '', email: '', password: '', store_name: '', role: 'customer', wallet_balance: 0 });
        fetchMasterData(token);
      } else alert('Creation failed: ' + data.message);
    } catch (err) { alert('Network error adding user.'); }
  };
  
  const executeAction = (actionLabel, apiCall) => {
    setConfirmDialog({
      show: true,
      message: `Are you sure you want to ${actionLabel}?`,
      onConfirm: async () => {
        await apiCall();
        setConfirmDialog({ show: false, message: '', onConfirm: null });
        fetchMasterData(token);
      }
    });
  };

  const handleDeleteUser = (id, name) => executeAction(`delete user ${name}`, () => 
    fetch(`${BASE_URL}/api/warehouse/admin/user/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }})
  );

  const handleToggleStatus = (id, status, name) => executeAction(`${status ? 'suspend' : 'activate'} user ${name}`, () => 
    fetch(`${BASE_URL}/api/warehouse/admin/toggle-status/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ is_active: status ? 0 : 1 })})
  );

  const handleWalletAdjust = (id, balance, name) => {
    const adj = prompt(`Current balance: ₹${balance}\nEnter adjustment amount (+ or -):`);
    if (!adj || isNaN(adj)) return;
    executeAction(`adjust wallet for ${name} by ₹${adj}`, () => 
      fetch(`${BASE_URL}/api/warehouse/admin/wallet-adjust/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ adjustment: parseFloat(adj) })})
    );
  };

  const handleGrantAccess = (id, name) => {
    const store = prompt(`Enter Store Name for ${name}:`);
    if (!store) return;
    executeAction(`grant access to ${store}`, () => 
      fetch(`${BASE_URL}/api/warehouse/admin/grant-access`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ user_id: id, store_name: store })})
    );
  };

  const handleRevokeAccess = (id, name) => executeAction(`revoke access for ${name}`, () => 
    fetch(`${BASE_URL}/api/warehouse/admin/revoke-access/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }})
  );

  const openEditModal = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name||'', email: u.email||'', store_name: u.store_name||'', password: '', wallet_balance: u.wallet_balance||0, role: u.role||'warehouse_admin', is_active: u.user_status!==undefined?u.user_status:1 });
  };
  
  const filteredDistributors = useMemo(() => distributors.filter(u => !searchQuery || (u.name+u.email+u.store_name).toLowerCase().includes(searchQuery.toLowerCase())), [distributors, searchQuery]);
  const filteredSales = useMemo(() => sales.filter(s => (!filterDate || new Date(s.sold_at).toISOString().startsWith(filterDate)) && (!filterStore || s.store_name?.toLowerCase().includes(filterStore.toLowerCase()))), [sales, filterDate, filterStore]);
  
  const totalRevenue = sales.reduce((a, c) => a + ((parseFloat(c.quantity)||0) * (parseFloat(c.sale_price)||0)), 0);
  const totalItemsSold = sales.reduce((a, c) => a + (parseFloat(c.quantity)||0), 0);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-indigo-600 text-xl font-semibold">Loading Administration Panel...</div></div>;
  if (!token) return <Navigate to="/warehouse" />;

  if (storeView.active) {
      return (
          <div className="fixed inset-0 z-[100] bg-gray-100 flex flex-col font-sans text-gray-900 overflow-hidden">
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Live Store Synchronization</h2>
                    <p className="text-gray-500 text-sm">Accessing data for: <span className="font-semibold text-indigo-600 uppercase">{storeView.userName}</span></p>
                  </div>
                  <button onClick={() => setStoreView({ active: false, userName: '', data: null, activeTab: 'inventory' })} className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow transition">Close View</button>
              </div>
              <div className="flex bg-white border-b border-gray-200 px-6">
                  <button onClick={() => setStoreView({...storeView, activeTab: 'inventory'})} className={`px-4 py-3 font-medium transition-all ${storeView.activeTab === 'inventory' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Inventory</button>
                  <button onClick={() => setStoreView({...storeView, activeTab: 'sales'})} className={`px-4 py-3 font-medium transition-all ${storeView.activeTab === 'sales' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>Sales Ledger</button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                  {storeView.activeTab === 'inventory' && (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                      <th className="p-4 font-semibold text-gray-600">Product Name</th>
                                      <th className="p-4 font-semibold text-gray-600 text-right">Quantity</th>
                                      <th className="p-4 font-semibold text-gray-600 text-right">Cost Price</th>
                                      <th className="p-4 font-semibold text-gray-600 text-right">Sale Price</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {storeView.data.inventory.length > 0 ? storeView.data.inventory.map((item, i) => (
                                      <tr key={i} className="hover:bg-gray-50">
                                          <td className="p-4 font-medium text-gray-800">{item.n || item.name || item.product_name}</td>
                                          <td className="p-4 text-right font-semibold text-gray-800">{item.q || item.quantity || item.qty || 0}</td>
                                          <td className="p-4 text-right text-gray-500">₹{item.c || item.cost || item.cost_price || 0}</td>
                                          <td className="p-4 text-right text-gray-500">₹{item.p || item.price || item.sale_price || 0}</td>
                                      </tr>
                                  )) : (<tr><td colSpan="4" className="p-8 text-center text-gray-500">No inventory available.</td></tr>)}
                              </tbody>
                          </table>
                      </div>
                  )}
                  {storeView.activeTab === 'sales' && (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                  <tr>
                                      <th className="p-4 font-semibold text-gray-600">Timestamp</th>
                                      <th className="p-4 font-semibold text-gray-600">Product</th>
                                      <th className="p-4 font-semibold text-gray-600 text-right">Qty</th>
                                      <th className="p-4 font-semibold text-gray-600 text-right">Total Price</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {storeView.data.sales.length > 0 ? storeView.data.sales.map((sale, i) => (
                                      <tr key={i} className="hover:bg-gray-50">
                                          <td className="p-4 text-gray-500">{new Date(sale.t || sale.timestamp || sale.date || sale.sold_at || Date.now()).toLocaleString()}</td>
                                          <td className="p-4 font-medium text-gray-800">{sale.n || sale.name || sale.product_name}</td>
                                          <td className="p-4 text-right font-semibold text-gray-800">{sale.q || sale.quantity || sale.qty || 0}</td>
                                          <td className="p-4 text-right font-semibold text-indigo-600">₹{sale.pr || ((sale.q||1) * (sale.p||sale.price||sale.sale_price||0)) || 0}</td>
                                      </tr>
                                  )) : (<tr><td colSpan="4" className="p-8 text-center text-gray-500">No transactions available.</td></tr>)}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="bg-white border-b border-gray-200 px-6 py-5 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration Console</h1>
          <p className="text-gray-500 text-sm">Centralized Store & User Management</p>
        </div>
        <button onClick={() => fetchMasterData(token)} disabled={refreshing} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium shadow-sm transition flex items-center gap-2">
          {refreshing ? 'Syncing...' : '↻ Refresh Data'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {['dashboard', 'users', 'stocks', 'ledger', 'activity'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-500 font-medium text-sm mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-500 font-medium text-sm mb-1">Active Accounts</h3>
              <p className="text-3xl font-bold text-gray-900">{distributors.filter(d => d.is_active || d.user_status).length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-500 font-medium text-sm mb-1">Units Distributed</h3>
              <p className="text-3xl font-bold text-gray-900">{totalItemsSold}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-gray-500 font-medium text-sm mb-1">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900">{sales.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input type="text" placeholder="Search by name, email, or store..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <button onClick={() => setShowAddUser(true)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition">Add User</button>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-600">User Details</th>
                      <th className="px-6 py-4 font-semibold text-gray-600">Wallet</th>
                      <th className="px-6 py-4 font-semibold text-gray-600">Role & Status</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDistributors.map((u) => (
                      <tr key={u.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className="font-semibold text-gray-900">{u.name}</div><div className="text-gray-500">{u.email}</div><div className="text-xs font-medium text-indigo-600 mt-1">{u.store_name || 'No Assigned Store'}</div></td>
                        <td className="px-6 py-4 font-semibold text-gray-900">₹{u.wallet_balance || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold capitalize">{u.role}</span>
                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${u.user_status || u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.user_status || u.is_active ? 'Active' : 'Suspended'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <button onClick={() => handleRetrieveData(u.user_id, u.name)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md border border-indigo-200 transition">View Store</button>
                            <button onClick={() => openEditModal(u)} className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md border border-gray-300 transition">Edit</button>
                            <button onClick={() => handleWalletAdjust(u.user_id, u.wallet_balance||0, u.name)} className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md border border-gray-300 transition">Wallet</button>
                            <button onClick={() => handleToggleStatus(u.user_id, u.user_status||u.is_active, u.name)} className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-md border border-gray-300 transition">{u.user_status || u.is_active ? 'Suspend' : 'Activate'}</button>
                            {u.store_name ? <button onClick={() => handleRevokeAccess(u.user_id, u.name)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-md border border-red-200 transition">Revoke Access</button> : <button onClick={() => handleGrantAccess(u.user_id, u.name)} className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-md border border-green-200 transition">Grant Access</button>}
                            <button onClick={() => handleDeleteUser(u.user_id, u.name)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition">Delete</button>
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

        {activeTab === 'stocks' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.values(stocks.reduce((acc, item) => {
              const k = `${item.user_id}_${item.store_name||'unknown'}`;
              if (!acc[k]) acc[k] = { ...item, items: [] };
              acc[k].items.push(item);
              return acc;
            }, {})).map(group => (
              <div key={group.user_id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">{group.store_name || 'Unassigned Store'}</h3>
                <p className="text-sm text-gray-500 mb-4">Manager: {group.distributor_name}</p>
                {group.items.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 text-gray-600">
                      <tr><th className="text-left py-2 font-medium">Product</th><th className="text-right py-2 font-medium">Qty</th><th className="text-right py-2 font-medium">Cost</th><th className="text-right py-2 font-medium">Price</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.items.map((it, i) => (
                        <tr key={i}>
                          <td className="py-3 font-medium text-gray-800">{it.product_name||'Unnamed'}</td>
                          <td className="py-3 text-right font-semibold text-gray-900">{it.quantity||0} {it.unit||''}</td>
                          <td className="py-3 text-right text-gray-500">₹{it.cost_price||0}</td>
                          <td className="py-3 text-right text-indigo-600 font-medium">₹{it.sale_price||0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-gray-400 text-sm">No inventory recorded.</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Filter by Date</label>
                <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-900 outline-none focus:border-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Filter by Store</label>
                <input type="text" placeholder="Type store name..." value={filterStore} onChange={(e) => setFilterStore(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-900 outline-none focus:border-indigo-500" />
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-gray-600">Store / Distributor</th>
                      <th className="px-6 py-4 font-semibold text-gray-600">Product</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 text-right">Qty</th>
                      <th className="px-6 py-4 font-semibold text-gray-600 text-right">Total</th>
                      <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSales.map((log, idx) => {
                      const qty = parseFloat(log.quantity) || 0;
                      const price = parseFloat(log.sale_price) || 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{log.store_name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs">{log.distributor_name}</div>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{log.product_name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">{qty}</td>
                          <td className="px-6 py-4 text-right font-bold text-indigo-600">₹{qty * price}</td>
                          <td className="px-6 py-4 text-gray-500">{new Date(log.sold_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                    {filteredSales.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No sales data found matching criteria.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Audit Logs</h2>
            {activityLog.length > 0 ? (
              <div className="space-y-3">
                {activityLog.map((log, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-800">{log.action}</span>
                      <p className="text-sm text-gray-500 mt-1">Authorized by {log.admin_name} • Target: {log.target_user}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm text-center py-8">Audit logging feature pending backend initialization.</p>}
          </div>
        )}
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold text-gray-900">Edit User Profile</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-gray-900 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleDeepEdit} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label><input type="text" value={editForm.store_name} onChange={(e) => setEditForm({...editForm, store_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Role</label><select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"><option value="customer">Customer</option><option value="warehouse_admin">Warehouse Admin</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option></select></div>
              <div className="pt-4 border-t border-gray-200"><label className="block text-sm font-semibold text-gray-700 mb-1">Reset Password</label><input type="password" placeholder="Leave blank to keep current" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-gray-400" /></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setEditUser(null)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}
      
      {showAddUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-bold text-gray-900">Create New User</h2>
              <button onClick={() => setShowAddUser(false)} className="text-gray-400 hover:text-gray-900 text-xl font-bold">✕</button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label><input type="text" required value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label><input type="email" required value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Password *</label><input type="password" required value={newUserForm.password} onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label><input type="text" value={newUserForm.store_name} onChange={(e) => setNewUserForm({...newUserForm, store_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Role</label><select value={newUserForm.role} onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"><option value="customer">Customer</option><option value="warehouse_admin">Warehouse Admin</option><option value="admin">Admin</option><option value="superadmin">Superadmin</option></select></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowAddUser(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition">Create</button></div>
            </form>
          </div>
        </div>
      )}
      
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"><span className="text-red-600 text-xl font-bold">!</span></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-500 text-sm mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3"><button onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">Cancel</button><button onClick={confirmDialog.onConfirm} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">Confirm</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
