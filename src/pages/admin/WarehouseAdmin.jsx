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
  
  // Edit Modal State
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', store_name: '', password: '' });

  useEffect(() => {
    const currentToken = localStorage.getItem('warehouseToken') || localStorage.getItem('ms_token') || localStorage.getItem('token');
    if (currentToken) {
      setToken(currentToken);
      fetchMasterData(currentToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMasterData = async (authToken) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const [usersRes, salesRes, summaryRes] = await Promise.all([
        fetch(`${BASE_URL}/api/warehouse/admin/users`, { headers }),
        fetch(`${BASE_URL}/api/warehouse/admin/sales`, { headers }),
        fetch(`${BASE_URL}/api/warehouse/admin/sales-summary`, { headers })
      ]);

      const usersData = await usersRes.json();
      const salesData = await salesRes.json();
      const summaryData = await summaryRes.json();

      if (usersData.success) setDistributors(usersData.users);
      if (salesData.success) setSales(salesData.sales);
      if (summaryData.success) setSummary(summaryData.summary);
      
    } catch (err) {
      console.error("Failed to fetch warehouse core data", err);
    } finally {
      setLoading(false);
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
        alert('User profile deeply updated successfully.');
        setEditUser(null);
        fetchMasterData(token); // Refresh data
      } else {
        alert('Failed to update: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating user.');
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, store_name: user.store_name, password: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) return <Navigate to="/warehouseadmin" />;

  // Calculate top metrics
  const totalRevenue = sales.reduce((acc, curr) => acc + parseFloat(curr.total_value), 0);
  const totalItemsSold = sales.reduce((acc, curr) => acc + curr.quantity, 0);
  const topSellingProduct = summary.length > 0 ? summary[0] : null;
  const leastSellingProduct = summary.length > 0 ? summary[summary.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Master Operations Control</h1>
            <p className="text-slate-400 mt-1">Deep Dive Architectural Overview of all Warehouse Nodes.</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            {['dashboard', 'distributors', 'ledger', 'analytics'].map(tab => (
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

        {/* TAB: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-slate-400 text-sm font-medium">Total Network Revenue</h3>
              <p className="text-3xl font-bold text-white mt-2">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
              <h3 className="text-slate-400 text-sm font-medium">Active Distributors</h3>
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

        {/* TAB: Distributors Control */}
        {activeTab === 'distributors' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold">Node Distributors (Deep Access)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-300">
                  <tr>
                    <th className="px-6 py-4">Name / Store</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Total Sales Logged</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {distributors.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-emerald-500 mt-1">{user.store_name}</div>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.total_sales} Logs</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {user.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white hover:bg-emerald-600 rounded transition-colors text-xs font-medium"
                        >
                          Deep Edit User
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Sales Ledger */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Raw Global Ledger</h2>
              <p className="text-xs text-slate-500">Every single comma logged across the network.</p>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-xs uppercase text-slate-300 sticky top-0">
                  <tr>
                    <th className="px-6 py-4">Date/Time</th>
                    <th className="px-6 py-4">Distributor/Store</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Qty</th>
                    <th className="px-6 py-4">Sale Price</th>
                    <th className="px-6 py-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sales.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4">{new Date(log.sold_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-emerald-400">{log.distributor_name}</td>
                      <td className="px-6 py-4 text-white font-medium">{log.product_name}</td>
                      <td className="px-6 py-4">{log.quantity}</td>
                      <td className="px-6 py-4">₹{log.sale_price}</td>
                      <td className="px-6 py-4 font-bold text-white">₹{log.total_value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Analytics Deep Dive */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-emerald-400">🔥 Top Selling Products</h2>
              <div className="space-y-4">
                {summary.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <p className="text-white font-medium">{item.product_name}</p>
                      <p className="text-xs text-slate-500">From: {item.store_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">{item.total_qty} units</p>
                      <p className="text-xs text-slate-400">₹{item.total_revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-red-400">🧊 Least Selling Products</h2>
              <div className="space-y-4">
                {[...summary].reverse().slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div>
                      <p className="text-white font-medium">{item.product_name}</p>
                      <p className="text-xs text-slate-500">From: {item.store_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold">{item.total_qty} units</p>
                      <p className="text-xs text-slate-400">₹{item.total_revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Deep Edit Modal Overlay */}
      {editUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Override User Data</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleDeepEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Warehouse Store Name</label>
                <input 
                  type="text" 
                  value={editForm.store_name} 
                  onChange={(e) => setEditForm({...editForm, store_name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Force Password Reset (Leave blank to keep current)</label>
                <input 
                  type="text" 
                  placeholder="New password override"
                  value={editForm.password} 
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="w-full bg-slate-800 border border-red-900/50 rounded-md px-3 py-2 text-white outline-none focus:border-red-500 placeholder:text-slate-600"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 font-medium">Force Update Details</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
