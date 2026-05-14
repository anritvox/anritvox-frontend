import React, { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { BASE_URL } from '../../services/api';

export default function WarehouseAdmin() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [distributors, setDistributors] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState([]);
  const [stocks, setStocks] = useState([]);
  
  // Sleek User Impersonation View
  const [userView, setUserView] = useState({ active: false, userName: '', data: null, activeTab: 'inventory', search: '' });
  
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', store_name: '', password: '', wallet_balance: '', role: '', is_active: 1 });
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', store_name: '', role: 'customer', wallet_balance: 0 });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('warehouseToken') || localStorage.getItem('ms_token') || localStorage.getItem('token');
    if (t) { setToken(t); fetchMasterData(t); } else setLoading(false);
  }, []);

  const fetchSafe = async (url, headers) => { try { return await (await fetch(url, { headers })).json(); } catch { return { success: false }; } };

  const fetchMasterData = async (authToken) => {
    try {
      const h = { 'Authorization': `Bearer ${authToken}` };
      const [u, s, sum, inv] = await Promise.all([
        fetchSafe(`${BASE_URL}/api/warehouse/admin/users`, h),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/sales`, h),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/sales-summary`, h),
        fetchSafe(`${BASE_URL}/api/warehouse/admin/inventory`, h)
      ]);
      setDistributors(u?.users || []); setSales(s?.sales || []); setSummary(sum?.summary || []); setStocks(inv?.inventory || []);
    } catch(e) {} finally { setLoading(false); }
  };

  const handleRetrieveData = async (userId, userName) => {
    try {
        const res = await fetch(`${BASE_URL}/api/warehouse/admin/retrieve-node/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        
        if (data.success) {
            let stateObj = data.app_state;
            for(let i=0; i<5; i++) if (typeof stateObj === 'string') try { stateObj = JSON.parse(stateObj); } catch(e) { break; }
            let inv = [], sls = data.db_sales || []; // Pre-load guaranteed DB sales!
            
            const scan = (obj) => {
                if (Array.isArray(obj)) {
                    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
                        const f = obj[0];
                        if (f.n || f.name || f.product_name) {
                            if (f.t || f.date || f.sold_at || f.timestamp) { if(sls.length === (data.db_sales?.length||0)) sls = [...sls, ...obj]; } 
                            else { if(inv.length === 0) inv = obj; }
                        }
                    }
                } else if (typeof obj === 'object' && obj !== null) Object.values(obj).forEach(scan);
            };
            if (stateObj?.AV?.d?.i) inv = stateObj.AV.d.i;
            if (stateObj?.AV?.d?.s) sls = [...sls, ...stateObj.AV.d.s]; // Combine DB + State sales
            if (inv.length === 0 || sls.length === (data.db_sales?.length||0)) scan(stateObj);
            
            setUserView({ active: true, userName, data: { inventory: inv, sales: sls }, activeTab: 'inventory', search: '' });
        } else alert('❌ Data unretrievable.');
    } catch { alert('❌ Network Error.'); }
  };

  const filteredUserViewInventory = useMemo(() => {
      if(!userView.data) return [];
      return userView.data.inventory.filter(i => (i.n||i.name||i.product_name||'').toLowerCase().includes(userView.search.toLowerCase()));
  }, [userView.data, userView.search]);

  const filteredUserViewSales = useMemo(() => {
      if(!userView.data) return [];
      return userView.data.sales.filter(s => (s.n||s.name||s.product_name||'').toLowerCase().includes(userView.search.toLowerCase()));
  }, [userView.data, userView.search]);

  const execAction = async (url, method, body, successMsg) => {
      try {
          const res = await fetch(`${BASE_URL}${url}`, { method, headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` }, body: body ? JSON.stringify(body) : null });
          const d = await res.json();
          if (d.success) { alert(`✅ ${successMsg}`); fetchMasterData(token); return true; } 
          else alert(`❌ ${d.message}`);
      } catch { alert('❌ Action failed.'); } return false;
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-blue-600 text-xl font-bold">Loading System...</div></div>;
  if (!token) return <Navigate to="/warehouse" />;

  // REDESIGNED: User Impersonation Overlay (Sleek, Non-Jargon, Filterable)
  if (userView.active) return (
      <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col font-sans text-slate-100 overflow-hidden">
          <div className="bg-slate-950 border-b border-slate-800 px-8 py-5 flex justify-between items-center shadow-xl">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center border border-blue-500/30">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">User Workspace</h2>
                    <p className="text-slate-400 text-sm font-medium">Viewing real-time data for <span className="text-white font-semibold">{userView.userName}</span></p>
                  </div>
              </div>
              <div className="flex items-center gap-4">
                  <input type="text" placeholder="Search inventory or sales..." value={userView.search} onChange={e => setUserView({...userView, search: e.target.value})} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-blue-500 w-64 shadow-inner text-sm" />
                  <button onClick={() => setUserView({ active: false, userName: '', data: null, activeTab: 'inventory', search: '' })} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg shadow transition-all border border-slate-700">Close Viewer ✕</button>
              </div>
          </div>
          <div className="flex bg-slate-900 border-b border-slate-800 px-6">
              <button onClick={() => setUserView({...userView, activeTab: 'inventory'})} className={`px-6 py-4 font-semibold text-sm transition-all relative ${userView.activeTab === 'inventory' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>Inventory List {userView.activeTab==='inventory' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}</button>
              <button onClick={() => setUserView({...userView, activeTab: 'sales'})} className={`px-6 py-4 font-semibold text-sm transition-all relative ${userView.activeTab === 'sales' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>Sales History {userView.activeTab==='sales' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}</button>
          </div>
          <div className="flex-1 overflow-auto p-8 bg-slate-900">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm">
                  {userView.activeTab === 'inventory' && (
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-800 border-b border-slate-700">
                              <tr><th className="p-4 text-slate-300 font-semibold">Product Name</th><th className="p-4 text-slate-300 font-semibold text-right">Stock Qty</th><th className="p-4 text-slate-300 font-semibold text-right">Cost Price</th><th className="p-4 text-slate-300 font-semibold text-right">Selling Price</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                              {filteredUserViewInventory.length > 0 ? filteredUserViewInventory.map((item, i) => (
                                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                      <td className="p-4 text-white font-medium">{item.n || item.name || item.product_name}</td>
                                      <td className="p-4 text-right"><span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md font-bold">{item.q || item.quantity || item.qty || 0}</span></td>
                                      <td className="p-4 text-right text-slate-400">₹{item.c || item.cost || item.cost_price || 0}</td>
                                      <td className="p-4 text-right text-emerald-400 font-medium">₹{item.p || item.price || item.sale_price || 0}</td>
                                  </tr>
                              )) : <tr><td colSpan="4" className="p-12 text-center text-slate-500">No matching inventory items found.</td></tr>}
                          </tbody>
                      </table>
                  )}
                  {userView.activeTab === 'sales' && (
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-800 border-b border-slate-700">
                              <tr><th className="p-4 text-slate-300 font-semibold">Date & Time</th><th className="p-4 text-slate-300 font-semibold">Product Sold</th><th className="p-4 text-slate-300 font-semibold text-right">Qty</th><th className="p-4 text-slate-300 font-semibold text-right">Total Value</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                              {filteredUserViewSales.length > 0 ? filteredUserViewSales.map((sale, i) => {
                                  const d = new Date(sale.sold_at || sale.t || sale.timestamp || sale.date || Date.now());
                                  return (
                                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                      <td className="p-4 text-slate-400">{d.toLocaleString()}</td>
                                      <td className="p-4 text-white font-medium">{sale.product_name || sale.n || sale.name}</td>
                                      <td className="p-4 text-right text-slate-300 font-bold">{sale.quantity || sale.q || sale.qty || 0}</td>
                                      <td className="p-4 text-right text-emerald-400 font-bold">₹{sale.sale_price * sale.quantity || sale.pr || (sale.q * sale.p) || sale.price || 0}</td>
                                  </tr>
                              )}) : <tr><td colSpan="4" className="p-12 text-center text-slate-500">No recent sales found.</td></tr>}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="bg-white border-b border-slate-200 shadow-sm px-8 py-6 flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">God Mode Console</h1><p className="text-slate-500 text-sm">Global Operations Management</p></div>
      </div>
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-2 mb-8 bg-white p-1 rounded-lg inline-flex shadow-sm border border-slate-200">
          {['dashboard', 'users', 'stocks', 'ledger'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-md text-sm font-semibold capitalize transition-all ${activeTab===tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>{tab}</button>
          ))}
        </div>
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"><p className="text-slate-500 text-sm font-medium mb-1">Network Revenue</p><p className="text-3xl font-bold text-slate-800">₹{sales.reduce((a,c)=>a+(c.quantity*c.sale_price||0),0).toLocaleString()}</p></div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"><p className="text-slate-500 text-sm font-medium mb-1">Active Accounts</p><p className="text-3xl font-bold text-blue-600">{distributors.filter(d=>d.is_active||d.user_status).length}</p></div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"><p className="text-slate-500 text-sm font-medium mb-1">Units Sold</p><p className="text-3xl font-bold text-emerald-600">{sales.reduce((a,c)=>a+(c.quantity||0),0)}</p></div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between"><input type="text" placeholder="Search users..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg w-72 text-sm outline-none focus:border-blue-500" /><button onClick={()=>setShowAddUser(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Add User</button></div>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold"><tr><th className="p-4">User</th><th className="p-4">Wallet</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {distributors.filter(u=>!searchQuery||(u.name+u.email).toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                  <tr key={u.user_id} className="hover:bg-slate-50">
                    <td className="p-4"><p className="font-bold text-slate-800">{u.name}</p><p className="text-slate-500">{u.email}</p><span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">{u.role}</span></td>
                    <td className="p-4 font-bold text-slate-700">₹{u.wallet_balance||0}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.is_active?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{u.is_active?'Active':'Suspended'}</span></td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={()=>handleRetrieveData(u.user_id, u.name)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded font-semibold transition-colors">View Store</button>
                      <button onClick={()=>setEditUser(u)} className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded font-semibold transition-colors">Edit</button>
                      <button onClick={()=>{if(confirm(`Adjust wallet for ${u.name}?`)){const a=prompt('Amount (+ or -):'); if(a) execAction(`/api/warehouse/admin/wallet-adjust/${u.user_id}`,'PATCH',{adjustment:parseFloat(a)},'Wallet adjusted')}}} className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded font-semibold transition-colors">Wallet</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={e=>{e.preventDefault(); if(execAction(`/api/warehouse/admin/user-deep-edit/${editUser.user_id}`,'PUT',editForm,'Updated')) setEditUser(null)}} className="space-y-4">
              <input type="text" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})} className="w-full p-2 border rounded" placeholder="Name" />
              <input type="email" value={editForm.email} onChange={e=>setEditForm({...editForm, email:e.target.value})} className="w-full p-2 border rounded" placeholder="Email" />
              <input type="number" value={editForm.wallet_balance} onChange={e=>setEditForm({...editForm, wallet_balance:e.target.value})} className="w-full p-2 border rounded" placeholder="Wallet Balance" />
              <select value={editForm.role} onChange={e=>setEditForm({...editForm, role:e.target.value})} className="w-full p-2 border rounded"><option value="customer">Customer</option><option value="warehouse_admin">Admin</option></select>
              <div className="flex gap-2"><button type="button" onClick={()=>setEditUser(null)} className="flex-1 p-2 bg-slate-100 rounded font-bold">Cancel</button><button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded font-bold">Save</button></div>
            </form>
          </div>
        </div>
      )}
      
      {showAddUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Add User</h2>
            <form onSubmit={e=>{e.preventDefault(); if(execAction('/api/warehouse/admin/add-user','POST',newUserForm,'Created')) setShowAddUser(false)}} className="space-y-4">
              <input type="text" required value={newUserForm.name} onChange={e=>setNewUserForm({...newUserForm, name:e.target.value})} className="w-full p-2 border rounded" placeholder="Name *" />
              <input type="email" required value={newUserForm.email} onChange={e=>setNewUserForm({...newUserForm, email:e.target.value})} className="w-full p-2 border rounded" placeholder="Email *" />
              <input type="text" required value={newUserForm.password} onChange={e=>setNewUserForm({...newUserForm, password:e.target.value})} className="w-full p-2 border rounded" placeholder="Password *" />
              <input type="number" value={newUserForm.wallet_balance} onChange={e=>setNewUserForm({...newUserForm, wallet_balance:parseFloat(e.target.value)})} className="w-full p-2 border rounded" placeholder="Wallet Balance" />
              <div className="flex gap-2"><button type="button" onClick={()=>setShowAddUser(false)} className="flex-1 p-2 bg-slate-100 rounded font-bold">Cancel</button><button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded font-bold">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
