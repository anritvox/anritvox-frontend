import React, { useState, useEffect } from 'react';
import { coupons as couponsApi } from '../../services/api';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '', discountType: 'percentage', discountValue: '',
    minOrderAmount: '', maxUses: '', expiresAt: '', isActive: true
  });
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await couponsApi.getAllAdmin();
      setCoupons(res.data.coupons || res.data || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCoupon) {
        await couponsApi.update(editCoupon._id || editCoupon.id, form);
        setMsg('Coupon updated!');
      } else {
        await couponsApi.create(form);
        setMsg('Coupon created!');
      }
      setShowForm(false); setEditCoupon(null); resetForm(); fetchCoupons();
    } catch (e) { 
      setMsg(e.response?.data?.message || 'Error saving coupon'); 
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await couponsApi.delete(id);
      fetchCoupons();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const resetForm = () => setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxUses: '', expiresAt: '', isActive: true });

  const startEdit = (c) => {
    setEditCoupon(c);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxUses: c.maxUses || '',
      expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '', isActive: c.isActive
    });
    setShowForm(true);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400">Coupon Management</h1>
        <button onClick={() => { resetForm(); setEditCoupon(null); setShowForm(true); }} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm font-medium transition-colors">+ New Coupon</button>
      </div>

      {msg && <div className="mb-4 p-3 bg-cyan-900/30 border border-cyan-500/30 rounded-lg text-cyan-300 text-sm">{msg}</div>}

      {showForm && (
        <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-cyan-300">{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-400 mb-1 block">Coupon Code</label><input value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Discount Type</label><select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount</option></select></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Discount Value</label><input type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" /></div>
            <div><label className="text-xs text-gray-400 mb-1 block">Expires At</label><input type="date" value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500" /></div>
            <div className="flex items-center gap-3 md:col-span-2"><input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-cyan-500" /><label htmlFor="isActive" className="text-sm text-gray-300">Active</label></div>
            <div className="md:col-span-2 flex gap-3"><button type="submit" className="px-4 py-2 bg-cyan-500 rounded-lg text-sm">{editCoupon ? 'Update' : 'Create'}</button><button type="button" onClick={() => { setShowForm(false); setEditCoupon(null); }} className="px-4 py-2 bg-gray-700 rounded-lg text-sm">Cancel</button></div>
          </form>
        </div>
      )}

      {loading ? <div className="text-center py-12 text-gray-400">Loading coupons...</div> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400"><tr><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Discount</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-800">
              {coupons.map(c => (
                <tr key={c._id || c.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-300">{c.code}</td>
                  <td className="px-4 py-3">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3"><button onClick={() => startEdit(c)} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded mr-2">Edit</button><button onClick={() => deleteCoupon(c._id || c.id)} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
