import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, Shield, ShieldAlert, ShieldCheck, Mail, Phone, MapPin, 
  Search, Filter, Download, RefreshCw, Eye, Ban, CheckCircle, 
  Trash2, Activity, Calendar, ShoppingBag, CreditCard, XCircle,
  Database
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Deep Inspector State
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { showToast } = useToast() || {};

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Adapting to standard REST conventions for admin user fetching
      const res = await api.get('/admin/users').catch(() => api.get('/users'));
      setUsers(res.data?.users || res.data?.data || res.data || []);
    } catch (err) {
      showToast?.('Failed to sync Identity Matrix.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- SECURITY & MUTATION PROTOCOLS ---
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'REVOKE' : 'RESTORE';
    
    if (!window.confirm(`SECURITY OVERRIDE: ${action} network access for this client?`)) return;
    
    setIsUpdating(true);
    try {
      await api.patch(`/users/${userId}/status`, { status: newStatus }).catch(() => 
        api.put(`/users/${userId}/status`, { status: newStatus })
      );
      showToast?.(`Client access ${newStatus === 'active' ? 'restored' : 'revoked'}.`, 'success');
      
      // Optimistic update
      setUsers(users.map(u => (u.id === userId || u._id === userId) ? { ...u, status: newStatus } : u));
      if (selectedUser) setSelectedUser({ ...selectedUser, status: newStatus });
    } catch (err) {
      showToast?.('Security protocol failed.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePromoteRole = async (userId, currentRole) => {
    if (currentRole === 'admin') return;
    if (!window.confirm('CRITICAL: Grant Administrative Clearance to this client?')) return;
    
    setIsUpdating(true);
    try {
      await api.patch(`/users/${userId}/role`, { role: 'admin' });
      showToast?.('Administrative clearance granted.', 'success');
      fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      showToast?.('Clearance upgrade failed.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('CRITICAL WARNING: Permanently purge this identity node from the database? This action is irreversible.')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      showToast?.('Identity purged from records.', 'success');
      fetchUsers();
    } catch (err) {
      showToast?.('Purge sequence failed.', 'error');
    }
  };

  // --- CRM DATA EXPORT ---
  const exportToExcel = () => {
    const worksheetData = users.map(u => ({
      'Identity Hash (ID)': u.id || u._id,
      'Full Name': u.name || u.full_name || 'Unknown',
      'Email Vector': u.email,
      'Phone': u.phone || 'N/A',
      'Clearance Level': u.role || 'user',
      'Network Status': u.status || 'active',
      'Registration Date': new Date(u.created_at).toLocaleString(),
      'Total Orders': u.total_orders || u.orders_count || 0,
      'Lifetime Value (₹)': u.total_spent || u.ltv || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Client Identity Matrix");
    XLSX.writeFile(workbook, `Anritvox_CRM_Dump_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast?.('CRM Matrix Exported', 'success');
  };

  // --- ANALYTICS & FILTERING ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const searchStr = `${u.name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || (u.role || 'user') === roleFilter;
      const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CRM KPIs
  const totalClients = users.length;
  const activeClients = users.filter(u => (u.status || 'active') === 'active').length;
  const suspendedClients = users.filter(u => u.status === 'suspended' || u.status === 'banned').length;
  const adminClearances = users.filter(u => u.role === 'admin').length;

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
          <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500 animate-pulse" size={24} />
        </div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] animate-pulse">Decrypting Identity Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#020617] min-h-screen text-slate-300 font-sans animate-in fade-in duration-500">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Client <span className="text-cyan-500">Identity Matrix</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
            <Shield size={12} className="text-cyan-500" /> Advanced CRM & Access Control
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchUsers} className="p-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl hover:bg-slate-800 hover:text-cyan-400 transition-all shadow-lg">
            <RefreshCw size={18} />
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-3 bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Download size={16} /> Export CRM Dump
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-500 z-10"><Users size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Total Identities</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{totalClients}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-500 z-10"><Activity size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Active Networks</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{activeClients}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-rose-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-rose-500 z-10"><Ban size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Quarantined / Suspended</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{suspendedClients}</h4>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-[2rem] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 blur-2xl -mr-6 -mt-6 group-hover:bg-purple-500/20 transition-all"></div>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-purple-500 z-10"><ShieldCheck size={22} /></div>
          <div className="z-10">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Admin Clearances</p>
            <h4 className="text-2xl font-black text-white tracking-tight mt-1">{adminClearances}</h4>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-[2rem] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
          <input 
            type="text" placeholder="Scan by Name, Email Vector, or Phone Hash..." 
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl py-3.5 pl-12 pr-4 text-white font-bold text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            <select 
              value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl py-3.5 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Clearances</option>
              <option value="user">Standard User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="relative flex-1 md:w-48">
            <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            <select 
              value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-xl py-3.5 pl-10 pr-4 text-white font-bold text-xs outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Network States</option>
              <option value="active">Active Online</option>
              <option value="suspended">Suspended / Quarantined</option>
            </select>
          </div>
        </div>
      </div>

      {/* CRM DENSE TABLE */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 backdrop-blur-md">
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Identity Payload</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Network Clearance</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Telemetry (LTV)</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">State</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <Users size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No identities match current matrices</p>
                  </td>
                </tr>
              ) : paginatedUsers.map(user => {
                const isActive = (user.status || 'active') === 'active';
                const isAdmin = user.role === 'admin';
                const initials = (user.name || user.email || 'U').substring(0, 2).toUpperCase();

                return (
                  <tr key={user.id || user._id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border ${isAdmin ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{user.name || user.full_name || 'Guest Identity'}</p>
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate max-w-[200px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'bg-purple-500/10 text-purple-500' : 'bg-slate-900 text-slate-400'}`}>
                        {isAdmin ? <ShieldCheck size={10} /> : <Shield size={10} />}
                        {isAdmin ? 'Administrator' : 'Standard User'}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black text-emerald-400">₹{(user.total_spent || user.ltv || 0).toLocaleString()}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{user.orders_count || user.total_orders || 0} Orders</p>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                        {isActive ? <CheckCircle size={10} /> : <Ban size={10} />}
                        {isActive ? 'Active' : 'Suspended'}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedUser(user)} className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-cyan-500 hover:bg-cyan-500 hover:text-slate-950 transition-all text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                          <Eye size={12} /> Dossier
                        </button>
                        {!isAdmin && (
                          <button 
                            onClick={() => handleToggleStatus(user.id || user._id, user.status || 'active')}
                            className={`p-2 border rounded-lg transition-all ${isActive ? 'bg-slate-950 border-slate-800 text-amber-500 hover:bg-amber-500 hover:text-slate-950' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950'}`}
                            title={isActive ? 'Suspend Access' : 'Restore Access'}
                          >
                            {isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                          </button>
                        )}
                        {!isAdmin && (
                          <button onClick={() => handleDeleteUser(user.id || user._id)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex items-center gap-2 mr-4">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:bg-slate-800 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* CLIENT DOSSIER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto custom-scrollbar">
          <div className="bg-[#0a0c10] border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-300 relative flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-start bg-cyan-500/5 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${selectedUser.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30'}`}>
                  {(selectedUser.name || selectedUser.email || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {selectedUser.name || selectedUser.full_name || 'Unverified Identity'}
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Mail size={10}/> {selectedUser.email}</span>
                    <span>|</span>
                    <span className="flex items-center gap-1 text-cyan-400">ID: {selectedUser.id || selectedUser._id}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-3 bg-slate-950 border border-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-2xl transition-all shadow-md">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: Telemetry & Contact */}
              <div className="space-y-6">
                
                {/* LTV Dashboard */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><Activity size={14}/> Value Telemetry</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Lifetime Value (LTV)</p>
                      <p className="text-2xl font-black text-emerald-400">₹{(selectedUser.total_spent || selectedUser.ltv || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Hardware Procured</p>
                      <p className="text-2xl font-black text-white">{selectedUser.orders_count || selectedUser.total_orders || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Vector */}
                <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><MapPin size={14}/> Communication & Origin</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                      <Phone size={16} className="text-cyan-500" />
                      {selectedUser.phone || 'Phone vector missing'}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
                      <Calendar size={16} className="text-cyan-500" />
                      Node Creation: {new Date(selectedUser.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Security Clearance */}
              <div className="space-y-6">
                
                <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] p-6 h-full flex flex-col">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2"><ShieldAlert size={14}/> Security & Clearance Console</h3>
                  
                  <div className="flex-1 space-y-4">
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Network Status</p>
                        <p className={`text-sm font-black uppercase tracking-widest mt-1 ${(selectedUser.status || 'active') === 'active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {(selectedUser.status || 'active') === 'active' ? 'Online & Active' : 'Quarantined'}
                        </p>
                      </div>
                      {selectedUser.role !== 'admin' && (
                        <button 
                          disabled={isUpdating}
                          onClick={() => handleToggleStatus(selectedUser.id || selectedUser._id, selectedUser.status || 'active')}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            (selectedUser.status || 'active') === 'active' 
                            ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30' 
                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30'
                          }`}
                        >
                          {(selectedUser.status || 'active') === 'active' ? 'Revoke Access' : 'Restore Access'}
                        </button>
                      )}
                    </div>

                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Clearance Level</p>
                        <p className={`text-sm font-black uppercase tracking-widest mt-1 ${selectedUser.role === 'admin' ? 'text-purple-500' : 'text-slate-400'}`}>
                          {selectedUser.role === 'admin' ? 'Master Admin' : 'Standard User'}
                        </p>
                      </div>
                      {selectedUser.role !== 'admin' && (
                        <button 
                          disabled={isUpdating}
                          onClick={() => handlePromoteRole(selectedUser.id || selectedUser._id, selectedUser.role)}
                          className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all"
                        >
                          Grant Admin
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-4 border border-dashed border-rose-500/30 bg-rose-500/5 rounded-2xl">
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest leading-relaxed text-center">
                      Security Notice: Mutating access levels or revoking network access will instantly terminate active sessions for this client node.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
