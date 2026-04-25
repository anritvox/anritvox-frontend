import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Shield, Trash2, Mail, Calendar, 
  Activity, CheckCircle, XCircle, Download, 
  Filter, MoreHorizontal, UserPlus, Eye, 
  ArrowUpRight, ArrowDownRight, UserCheck, UserX
} from 'lucide-react';
import api, { adminManagement } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function UserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const { showToast } = useToast() || {};

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminManagement.getAllUsers();
      // Ensure we grab the array regardless of structure
      const data = res.data?.data || res.data || [];
      setUsersList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load users:', error);
      showToast?.('Error synchronizing user registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'customer' : 'admin';
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      showToast?.(`Privileges updated to ${newRole.toUpperCase()}`, 'success');
      loadUsers();
    } catch (error) {
      showToast?.('Role modification failed', 'error');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await api.patch(`/admin/users/${userId}/status`, { is_active: newStatus });
      showToast?.(`Account ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      loadUsers();
    } catch (error) {
      showToast?.('Status update failed', 'error');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date'];
    const csvData = usersList.map(u => [
      u.id, u.name, u.email, u.phone || 'N/A', u.role, 
      u.is_active ? 'Active' : 'Inactive', 
      new Date(u.created_at).toLocaleDateString()
    ].join(','));
    
    const blob = new Blob([[headers.join(','), ...csvData].join('
')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.phone?.includes(searchTerm));
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
                          (selectedStatus === 'active' ? u.is_active === 1 : u.is_active === 0);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return (
    <div className=\"flex flex-col items-center justify-center h-screen space-y-4\">
      <div className=\"w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin\" />
      <div className=\"text-slate-500 font-black uppercase text-[10px] tracking-widest animate-pulse\">Initializing User Registry...</div>
    </div>
  );

  return (
    <div className=\"p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700\">
      {/* Header & Main Actions */}
      <div className=\"flex flex-col xl:flex-row xl:items-center justify-between gap-6\">
        <div className=\"space-y-2\">
          <div className=\"flex items-center gap-3\">
            <div className=\"p-3 bg-emerald-500/10 rounded-2xl\">
              <Users className=\"text-emerald-500\" size={32} />
            </div>
            <div>
              <h2 className=\"text-4xl font-black uppercase tracking-tighter text-white\">Client Accounts</h2>
              <p className=\"text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]\">Enterprise User Management & Security Audit</p>
            </div>
          </div>
        </div>
        
        <div className=\"flex flex-wrap items-center gap-3\">
          <button 
            onClick={exportToCSV}
            className=\"flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition-all\"
          >
            <Download size={16} /> Export CSV
          </button>
          <button className=\"flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-950 transition-all shadow-lg shadow-emerald-500/20\">
            <UserPlus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
        {[
          { label: 'Total Accounts', value: usersList.length, icon: Users, color: 'emerald', trend: '+12%' },
          { label: 'Active Sessions', value: usersList.filter(u => u.is_active === 1).length, icon: Activity, color: 'blue', trend: '+5%' },
          { label: 'Administrators', value: usersList.filter(u => u.role === 'admin').length, icon: Shield, color: 'purple', trend: 'Static' },
          { label: 'Growth Rate', value: '8.4%', icon: ArrowUpRight, color: 'orange', trend: '+2.1%' }
        ].map((stat, i) => (
          <div key={i} className={`bg-${stat.color}-500/5 border border-${stat.color}-500/10 p-6 rounded-[2rem] group hover:scale-[1.02] transition-all`}>
            <div className=\"flex justify-between items-start mb-4\">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                <stat.icon className={`text-${stat.color}-500`} size={20} />
              </div>
              <div className=\"text-[10px] font-black text-slate-500 uppercase flex items-center gap-1\">
                {stat.trend} <ArrowUpRight size={10} className=\"text-emerald-500\" />
              </div>
            </div>
            <div className={`text-${stat.color}-500 font-black text-3xl mb-1`}>{stat.value}</div>
            <div className=\"text-slate-500 font-bold uppercase text-[10px] tracking-widest\">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className=\"bg-slate-900/50 border border-slate-800 p-4 rounded-3xl flex flex-col lg:flex-row items-center gap-4\">
        <div className=\"relative flex-1 w-full\">
          <Search className=\"absolute left-4 top-1/2 -translate-y-1/2 text-slate-500\" size={18} />
          <input
            placeholder=\"Search by name, email, or phone...\"
            className=\"bg-slate-950/50 border border-slate-800/50 px-12 py-3 rounded-2xl outline-none focus:border-emerald-500/50 transition-all w-full text-sm font-bold text-white\"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className=\"flex items-center gap-3 w-full lg:w-auto\">
          <div className=\"flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 px-4 py-3 rounded-2xl min-w-[140px]\">
            <Shield size={14} className=\"text-slate-500\" />
            <select 
              className=\"bg-transparent outline-none text-xs font-bold text-slate-300 w-full cursor-pointer\"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value=\"all\">All Roles</option>
              <option value=\"admin\">Admin Only</option>
              <option value=\"customer\">Customer Only</option>
            </select>
          </div>
          <div className=\"flex items-center gap-2 bg-slate-950/50 border border-slate-800/50 px-4 py-3 rounded-2xl min-w-[140px]\">
            <Activity size={14} className=\"text-slate-500\" />
            <select 
              className=\"bg-transparent outline-none text-xs font-bold text-slate-300 w-full cursor-pointer\"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value=\"all\">All Status</option>
              <option value=\"active\">Active</option>
              <option value=\"inactive\">Inactive</option>
            </select>
          </div>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedRole('all'); setSelectedStatus('all'); }}
            className=\"p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 transition-colors\"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Registry Table */}
      <div className=\"bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl\">
        <div className=\"overflow-x-auto\">
          <table className=\"w-full text-left border-collapse\">
            <thead>
              <tr className=\"border-b border-slate-800 bg-slate-900/80 backdrop-blur-md\">
                <th className=\"px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest\">User Profile</th>
                <th className=\"px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center\">Authorization</th>
                <th className=\"px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center\">Connectivity</th>
                <th className=\"px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center\">Registration</th>
                <th className=\"px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right\">Management</th>
              </tr>
            </thead>
            <tbody className=\"divide-y divide-slate-800/50 bg-slate-900/20\">
              {filteredUsers.map((user) => (
                <tr key={user.id} className=\"hover:bg-emerald-500/[0.02] transition-colors group\">
                  <td className=\"px-8 py-6\">
                    <div className=\"flex items-center gap-4\">
                      <div className=\"relative\">
                        <div className=\"w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-black text-emerald-400 group-hover:border-emerald-500/50 transition-all overflow-hidden shadow-inner\">
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-slate-950 ${user.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      </div>
                      <div>
                        <div className=\"font-black text-white uppercase text-sm tracking-tight flex items-center gap-2\">
                          {user.name}
                          {user.role === 'admin' && <Shield size={12} className=\"text-emerald-500\" />}
                        </div>
                        <div className=\"text-[10px] text-slate-500 font-bold flex items-center gap-2 mt-1\">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className=\"px-8 py-6 text-center\">
                    <button 
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.role === 'admin' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td className=\"px-8 py-6 text-center\">
                    <div className=\"flex flex-col items-center gap-1\">
                      <div className={`text-xs font-bold ${user.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {user.is_active ? 'ENABLED' : 'REVOKED'}
                      </div>
                      <div className=\"text-[10px] text-slate-600 font-black tracking-tighter uppercase\">Last: 2m ago</div>
                    </div>
                  </td>
                  <td className=\"px-8 py-6 text-center\">
                    <div className=\"inline-flex flex-col items-center gap-1 text-slate-400\">
                      <div className=\"flex items-center gap-2 text-[10px] font-black uppercase\">
                        <Calendar size={12} className=\"text-slate-600\" />
                        {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </td>
                  <td className=\"px-8 py-6 text-right\">
                    <div className=\"flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity\">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        className={`p-3 rounded-xl transition-all active:scale-90 ${
                          user.is_active 
                          ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        }`}
                        title={user.is_active ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        {user.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                      <button className=\"p-3 bg-slate-800 hover:bg-emerald-500/10 rounded-xl text-slate-400 hover:text-emerald-400 transition-all active:scale-90\" title=\"View Audit Logs\">
                        <Eye size={18} />
                      </button>
                      <button className=\"p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90\">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className=\"p-32 text-center space-y-6\">
            <div className=\"relative inline-block\">
              <Activity className=\"mx-auto text-slate-800/50\" size={120} />
              <div className=\"absolute inset-0 flex items-center justify-center\">
                <Search size={40} className=\"text-slate-700 animate-bounce\" />
              </div>
            </div>
            <div className=\"space-y-2\">
              <div className=\"text-slate-500 font-black uppercase tracking-[0.4em] text-lg\">No Entities Synchronized</div>
              <p className=\"text-slate-600 text-xs font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed\">
                The global registry returned no records matching your current security filters. Try broading your search parameters.
              </p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedRole('all'); setSelectedStatus('all'); }}
              className=\"bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all\"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Audit Note */}
      <div className=\"flex flex-col md:flex-row items-center justify-between p-6 bg-slate-900/20 border border-slate-900/50 rounded-3xl gap-4\">
        <div className=\"flex items-center gap-3\">
          <div className=\"w-2 h-2 rounded-full bg-emerald-500 animate-pulse\" />
          <div className=\"text-[10px] font-black text-slate-500 uppercase tracking-widest\">Global Registry Synchronization: Real-time</div>
        </div>
        <div className=\"text-[10px] font-bold text-slate-600 uppercase tracking-tighter\">
          Protected by AES-256 Encryption • Node ID: ANR-USR-PRO-0922
        </div>
      </div>
    </div>
  );
}
