import React, { useState, useEffect, useMemo } from 'react';
import { Store, ShieldPlus, Trash2, RefreshCw, Search, Power, UserPlus, Eye, ArrowLeft, Package, Users, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function WarehouseManagement() {
  // --- STATE: Access Portal ---
  const [warehouseUsers, setWarehouseUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [storeName, setStoreName] = useState('');
  const { showToast } = useToast() || {};

  // --- STATE: Node Inspector ---
  const [inspectingUser, setInspectingUser] = useState(null);
  const [nodeData, setNodeData] = useState(null);
  const [nodeSales, setNodeSales] = useState([]);
  const [inspectorLoading, setInspectorLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, aRes] = await Promise.all([
        api.get('/warehouse/admin/users').catch(() => ({ data: { users: [] } })),
        api.get('/warehouse/admin/all-users').catch(() => ({ data: { users: [] } }))
      ]);
      setWarehouseUsers(wRes.data.users || []);
      setAllUsers(aRes.data.users || []);
    } catch (err) { 
      showToast?.('Failed to sync users.', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !storeName) return showToast?.('Select a user and store name.', 'error');
    try {
      await api.post('/warehouse/admin/grant-access', { user_id: selectedUserId, store_name: storeName });
      showToast?.('Access granted.', 'success');
      setStoreName(''); setSelectedUserId(''); fetchData();
    } catch (err) { showToast?.('Failed to grant access.', 'error'); }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await api.patch(`/warehouse/admin/user-status/${userId}`, { is_active: currentStatus === 1 ? 0 : 1 });
      showToast?.(`User ${currentStatus === 1 ? 'suspended' : 'activated'}.`, 'success'); 
      fetchData();
    } catch (err) { showToast?.('Operation failed.', 'error'); }
  };

  const handleRevokeAccess = async (userId) => {
    if (!window.confirm('Delete this user from the warehouse system?')) return;
    try {
      await api.post('/warehouse/admin/revoke-access', { user_id: userId });
      showToast?.('Access revoked.', 'success'); fetchData();
    } catch (err) { showToast?.('Revocation failed.', 'error'); }
  };

  const handleInspectUser = async (user) => {
    setInspectingUser(user);
    setInspectorLoading(true);
    try {
      const [stateRes, salesRes] = await Promise.all([
        api.get(`/warehouse/admin/user-state/${user.user_id}`),
        api.get(`/warehouse/admin/sales?store_user_id=${user.user_id}`)
      ]);
      setNodeData(stateRes.data.state || { i: [], c: [], s: [] });
      setNodeSales(salesRes.data.sales || []);
    } catch (err) {
      showToast?.('Failed to load node data.', 'error');
      setNodeData({ i: [], c: [], s: [] });
      setNodeSales([]);
    } finally {
      setInspectorLoading(false);
    }
  };

  const filteredUsers = useMemo(() => warehouseUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [warehouseUsers, searchQuery]);

  // Derived Metrics for Inspector
  const inventory = nodeData?.i || [];
  const totalInventoryValue = inventory.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysSales = nodeSales.filter(sale => sale.sold_at && sale.sold_at.startsWith(todayStr));
  const todayRevenue = todaysSales.reduce((sum, sale) => sum + parseFloat(sale.total_value || 0), 0);

  // ==========================================
  // VIEW: NODE INSPECTOR (Superadmin Dashboard)
  // ==========================================
  if (inspectingUser) {
    return (
      <div className="p-6 bg-[#020617] min-h-screen text-slate-300">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setInspectingUser(null)} className="p-2 bg-slate-900 rounded-lg hover:text-emerald-400 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
                {inspectingUser.store_name} <span className="text-emerald-500">Inspector</span>
              </h1>
              <p className="text-xs font-mono text-slate-500">Node Operator: {inspectingUser.name} ({inspectingUser.email})</p>
            </div>
          </div>
          <button onClick={() => handleInspectUser(inspectingUser)} className="p-2 bg-slate-900 rounded-lg hover:text-emerald-400">
            <RefreshCw size={20} className={inspectorLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {inspectorLoading ? (
          <div className="flex justify-center py-20"><RefreshCw className="animate-spin text-emerald-500" size={32} /></div>
        ) : !nodeData || inventory.length === 0 ? (
           <div className="bg-slate-900/40 border border-amber-500/30 rounded-3xl p-12 text-center">
             <AlertCircle size={48} className="text-amber-500 mx-auto mb-4 opacity-50"/>
             <h3 className="text-xl font-bold text-white mb-2">No Cloud State Found</h3>
             <p className="text-slate-400">This user has not synced any warehouse data to the server yet, or their inventory is empty.</p>
           </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl"><Package className="text-emerald-400" size={24}/></div>
                </div>
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1">Total Inventory Assets</p>
                <h3 className="text-3xl font-black text-white">₹{totalInventoryValue.toLocaleString()}</h3>
                <p className="text-xs text-slate-400 mt-2">{inventory.length} unique SKUs in stock</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl"><TrendingUp className="text-blue-400" size={24}/></div>
                </div>
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1">Today's Revenue</p>
                <h3 className="text-3xl font-black text-white">₹{todayRevenue.toLocaleString()}</h3>
                <p className="text-xs text-slate-400 mt-2">{todaysSales.length} transactions today</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl"><Users className="text-purple-400" size={24}/></div>
                </div>
                <p className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1">Saved Customers</p>
                <h3 className="text-3xl font-black text-white">{nodeData.c?.length || 0}</h3>
                <p className="text-xs text-slate-400 mt-2">Registered in local node</p>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Live Inventory Snapshot</h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-4">SKU / Product</th>
                      <th className="p-4 text-center">In Stock</th>
                      <th className="p-4 text-right">Price</th>
                      <th className="p-4 text-right">Asset Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {inventory.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/20">
                        <td className="p-4">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-slate-500">{item.cat || 'General'}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${item.qty <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
                            {item.qty}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-sm text-slate-400">₹{parseFloat(item.price || 0).toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-emerald-400 text-sm">₹{(item.qty * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW: ACCESS PORTAL (Main Grid)
  // ==========================================
  return (
    <div className="p-6 bg-[#020617] min-h-screen text-slate-300">
      <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Warehouse <span className="text-emerald-500">Access Portal</span></h1>
        <button onClick={fetchData} className="p-2 bg-slate-900 rounded-lg hover:text-emerald-400">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center gap-2"><UserPlus size={16}/> Grant Access</h2>
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none text-slate-300">
                <option value="">Select a Registered User</option>
                {allUsers.filter(u => !u.has_access).map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
              <input type="text" placeholder="Assigned Store Name" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm outline-none" />
              <button type="submit" className="w-full py-3 bg-emerald-500/10 border border-emerald-500 text-emerald-400 rounded-xl font-bold uppercase text-[10px] hover:bg-emerald-500 hover:text-black transition-all">Authorize Node</button>
            </form>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-3xl flex items-center gap-3">
            <Search size={18} className="text-slate-500" />
            <input type="text" placeholder="SEARCH DISTRIBUTOR..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold uppercase w-full" />
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Distributor</th>
                <th className="p-4">Store</th>
                <th className="p-4 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/20">
                  <td className="p-4">
                    <p className={`font-bold ${user.is_active ? 'text-white' : 'text-slate-600'}`}>{user.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded bg-slate-950 border border-slate-800 ${user.is_active ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {user.store_name}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    {/* NEW INSPECT BUTTON */}
                    <button onClick={() => handleInspectUser(user)} className="p-2 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all" title="Inspect Node">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleStatusToggle(user.user_id, user.is_active)} className={`p-2 rounded-lg border transition-all ${user.is_active ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black' : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black'}`}>
                      <Power size={14} />
                    </button>
                    <button onClick={() => handleRevokeAccess(user.user_id)} className="p-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
