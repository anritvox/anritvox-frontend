// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/users`, { headers });
      const data = await res.json();
      setUsers(data);
    } catch { setError('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await fetch(`${BASE_URL}/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ is_active: currentStatus ? 0 : 1 }),
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: currentStatus ? 0 : 1 } : u));
    } catch { setError('Failed to update user status'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`${BASE_URL}/api/admin/users/${id}`, { method: 'DELETE', headers });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { setError('Failed to delete user'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>
      {error && <div className="bg-red-900 text-red-300 px-4 py-3 rounded mb-4">{error}</div>}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded w-80 focus:outline-none focus:ring-2 focus:ring-[#39d353]"
        />
        <span className="text-gray-400 text-sm">{filtered.length} users</span>
      </div>
      {loading ? (
        <div className="text-gray-400">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-t border-gray-700 text-sm text-gray-300 hover:bg-gray-750">
                  <td className="px-4 py-3">#{u.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      u.role === 'admin' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(u.id, u.is_active)}
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        u.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-gray-500 text-sm py-8 text-center">No users found.</p>}
        </div>
      )}
    </div>
  );
}
