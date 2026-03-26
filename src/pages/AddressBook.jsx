//Address book

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const defaultForm = { label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false };

export default function AddressBook() {
  const { token, user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/api/users/addresses/${editId}` : `${API}/api/users/addresses`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMsg(editId ? 'Address updated!' : 'Address added!');
        setShowForm(false);
        setEditId(null);
        setForm(defaultForm);
        fetchAddresses();
      } else {
        setMsg('Failed to save address');
      }
    } catch { setMsg('Network error'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    await fetch(`${API}/api/users/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAddresses();
  };

  const setDefault = async (id) => {
    await fetch(`${API}/api/users/addresses/${id}/default`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAddresses();
  };

  const startEdit = (addr) => {
    setEditId(addr._id);
    setForm({ label: addr.label || 'Home', fullName: addr.fullName || '', phone: addr.phone || '', addressLine1: addr.addressLine1 || '', addressLine2: addr.addressLine2 || '', city: addr.city || '', state: addr.state || '', pincode: addr.pincode || '', country: addr.country || 'India', isDefault: addr.isDefault || false });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-cyan-400">Address Book</h1>
          <button onClick={() => { setForm(defaultForm); setEditId(null); setShowForm(true); }}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-medium transition-colors">
            + Add Address
          </button>
        </div>

        {msg && <div className="mb-4 p-3 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm">{msg}</div>}

        {showForm && (
          <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 text-cyan-300">{editId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Label</label>
                <select value={form.label} onChange={e => setForm({...form, label: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                <input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Address Line 1</label>
                <input value={form.addressLine1} onChange={e => setForm({...form, addressLine1: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Address Line 2 (Optional)</label>
                <input value={form.addressLine2} onChange={e => setForm({...form, addressLine2: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">City</label>
                <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">State</label>
                <input value={form.state} onChange={e => setForm({...form, state: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Pincode</label>
                <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Country</label>
                <input value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm({...form, isDefault: e.target.checked})} className="w-4 h-4 accent-cyan-500" />
                <label htmlFor="isDefault" className="text-sm text-gray-300">Set as default address</label>
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editId ? 'Update Address' : 'Add Address'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="text-4xl mb-3">📍</div>
            <p className="text-gray-400">No addresses saved yet</p>
            <p className="text-gray-500 text-sm mt-1">Add an address to speed up checkout</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map(addr => (
              <div key={addr._id} className={`bg-gray-900 border rounded-xl p-5 ${addr.isDefault ? 'border-cyan-500/50' : 'border-gray-800'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">{addr.label || 'Home'}</span>
                    {addr.isDefault && <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">Default</span>}
                  </div>
                  <div className="flex gap-2">
                    {!addr.isDefault && (
                      <button onClick={() => setDefault(addr._id)} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Set Default</button>
                    )}
                    <button onClick={() => startEdit(addr)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                    <button onClick={() => deleteAddress(addr._id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                  </div>
                </div>
                <p className="font-semibold text-white">{addr.fullName}</p>
                <p className="text-gray-400 text-sm mt-1">{addr.phone}</p>
                <p className="text-gray-400 text-sm">{addr.addressLine1}{addr.addressLine2 ? ', ' + addr.addressLine2 : ''}</p>
                <p className="text-gray-400 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-gray-400 text-sm">{addr.country}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
