import React, { useState, useEffect } from 'react';
import { loyalty as loyaltyApi } from '../../services/api';
import { Gift, TrendingUp, Users, Award, Settings, Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';

export default function LoyaltyManagement() {
  const [config, setConfig] = useState({ points_per_rupee: 1, min_redeem_points: 100 });
  const [tiers, setTiers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTierForm, setShowTierForm] = useState(false);
  const [editingTierId, setEditingTierId] = useState(null);
  const [tierForm, setTierForm] = useState({ name: '', min_points: 0, benefits: '', discount_percent: 0 });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [configRes, tiersRes, membersRes] = await Promise.all([loyaltyApi.getConfig(), loyaltyApi.getTiers(), loyaltyApi.getAllMembers()]);
      setConfig(configRes.data?.config || configRes.data || { points_per_rupee: 1, min_redeem_points: 100 });
      setTiers(tiersRes.data?.tiers || tiersRes.data || []);
      setMembers(membersRes.data?.members || membersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      await loyaltyApi.updateConfig(config);
      alert('Config saved!');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const saveTier = async () => {
    try {
      if (editingTierId) {
        await loyaltyApi.updateTier(editingTierId, tierForm);
      } else {
        await loyaltyApi.createTier(tierForm);
      }
      setShowTierForm(false);
      setEditingTierId(null);
      setTierForm({ name: '', min_points: 0, benefits: '', discount_percent: 0 });
      fetchAll();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const deleteTier = async (id) => {
    if (!window.confirm('Delete tier?')) return;
    try {
      await loyaltyApi.deleteTier(id);
      fetchAll();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Loyalty Program Config</h2>
          <p className="text-slate-500 font-medium mt-1">Manage rewards, tiers, and member points</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Config */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2"><Settings size={20} /> Global Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Points per ₹1 spent</label>
            <input type="number" value={config.points_per_rupee} onChange={e => setConfig({...config, points_per_rupee: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Min points to redeem</label>
            <input type="number" value={config.min_redeem_points} onChange={e => setConfig({...config, min_redeem_points: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <button onClick={saveConfig} className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm">Save Config</button>
      </div>

      {/* Tiers */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2"><Award size={20} /> Loyalty Tiers</h3>
          <button onClick={() => { setShowTierForm(true); setTierForm({ name: '', min_points: 0, benefits: '', discount_percent: 0 }); setEditingTierId(null); }} className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold">
            <Plus size={14} /> New Tier
          </button>
        </div>

        {showTierForm && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Tier Name" value={tierForm.name} onChange={e => setTierForm({...tierForm, name: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="number" placeholder="Min Points" value={tierForm.min_points} onChange={e => setTierForm({...tierForm, min_points: parseInt(e.target.value)})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="number" placeholder="Discount %" value={tierForm.discount_percent} onChange={e => setTierForm({...tierForm, discount_percent: parseFloat(e.target.value)})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <input type="text" placeholder="Benefits" value={tierForm.benefits} onChange={e => setTierForm({...tierForm, benefits: e.target.value})} className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={saveTier} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm">{editingTierId ? 'Update' : 'Create'}</button>
              <button onClick={() => setShowTierForm(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold text-sm">Cancel</button>
            </div>
          </div>
        )}

        {loading ? <div className="text-center py-8 text-slate-400">Loading...</div> : tiers.length === 0 ? <div className="text-center py-8 text-slate-400">No tiers yet</div> : (
          <div className="grid grid-cols-1 gap-3">
            {tiers.map(tier => (
              <div key={tier.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <div className="font-black text-slate-900">{tier.name}</div>
                  <div className="text-xs text-slate-500">Min: {tier.min_points} pts • {tier.discount_percent}% discount</div>
                  <div className="text-xs text-slate-600 mt-1">{tier.benefits}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingTierId(tier.id); setTierForm(tier); setShowTierForm(true); }} className="p-2 hover:bg-slate-200 rounded-lg"><Edit2 size={14} className="text-blue-500" /></button>
                  <button onClick={() => deleteTier(tier.id)} className="p-2 hover:bg-slate-200 rounded-lg"><Trash2 size={14} className="text-rose-500" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2"><Users size={20} /> Members ({members.length})</h3>
        {loading ? <div className="text-center py-8 text-slate-400">Loading...</div> : members.length === 0 ? <div className="text-center py-8 text-slate-400">No members yet</div> : (
          <div className="space-y-2">
            {members.slice(0, 10).map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-sm text-slate-900">{m.user_name || m.name || 'User #' + m.id}</div>
                  <div className="text-xs text-slate-500">{m.user_email || m.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-600">{m.points || 0} pts</div>
                  <div className="text-xs text-slate-400">{m.tier_name || 'Bronze'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
