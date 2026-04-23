import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Trash2, Mail, Calendar, Activity, CheckCircle, XCircle } from 'lucide-react';
// 100% STRICT IMPORT: Using default api and adminManagement object
import api, { adminManagement } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function UserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast() || {};

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminManagement.getAllUsers();
      setUsersList(res.data?.data || res.data || []);
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
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      // Raw route is fine here because the base api handles the interceptor accurately
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      showToast?.(`Privileges updated to ${newRole.toUpperCase()}`, 'success');
      loadUsers();
    } catch (error) {
      showToast?.('Role modification failed', 'error');
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
            <Users className="text-emerald-500" /> Client Accounts
          </h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Global User Registry & Privilege Management</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-emerald-500 transition-colors" size={18} />
          <input 
            placeholder="Filter by name or email..." 
            className="bg-slate-900/50 border border-slate-800 px-12 py-4 rounded-2xl outline-none focus:border-emerald-500/50 transition-all w-full md:w-80 text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] space-y-2">
          <div className="text-emerald-500 font-black text-4xl">{usersList.length}</div>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Registered Entities</div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2rem] space-y-2">
          <div className="text-blue-500 font-black text-4xl">{usersList.filter(u => u.role === 'admin').length}</div>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Privileged Administrators</div>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/10 p-8 rounded-[2rem] space-y-2">
          <div className="text-purple-500 font-black text-4xl">{usersList.filter(u => u.is_active !== 0).length}</div>
          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active Sessions Live</div>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Privileges</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Activity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-emerald-400 group-hover:scale-110 transition-transform">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-black text-white uppercase text-sm tracking-tight">{user.name}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                          <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                      user.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      <Shield size={10} /> {user.role}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Calendar size={14} className="text-slate-600" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="p-3 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all active:scale-90"
                        title="Toggle Admin Rights"
                      >
                        <Shield size={18} />
                      </button>
                      <button className="p-3 hover:bg-rose-500/10 rounded-xl text-slate-500 hover:text-rose-400 transition-all active:scale-90" title="Revoke Access">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <Activity className="mx-auto text-slate-800" size={64} />
            <div className="text-slate-600 font-black uppercase tracking-[0.3em]">No Entities Found in Registry</div>
          </div>
        )}
      </div>
    </div>
  );
}
