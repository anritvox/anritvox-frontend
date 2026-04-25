import React, { useState, useEffect, useCallback } from "react";
import { loyalty } from "../../services/api";
import {
  Award, Settings, Users, Gift, Loader2, Search, Edit3, Save, AlertCircle
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function LoyaltyManagement() {
  const [members, setMembers] = useState([]);
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showToast } = useToast() || {};

  const loadLoyaltyData = useCallback(async () => {
    setLoading(true);
    try {
      // Execute mapped requests concurrently
      const [membersRes, configRes] = await Promise.all([
        loyalty.getMembers(),
        loyalty.getSystemConfig().catch(() => ({ data: {} })) // Safe fallback if settings are empty
      ]);
      
      const usersData = membersRes.data?.data || membersRes.data;
      setMembers(Array.isArray(usersData) ? usersData : []);
      
      // Default config structure if none exists in backend
      setSystemConfig(configRes.data?.loyalty || {
        enabled: true,
        pointsPerDollar: 1,
        redemptionValue: 0.01,
        tierThresholds: { gold: 1000, platinum: 5000 }
      });
    } catch (err) {
      console.error("Loyalty initialization error:", err);
      showToast?.("Failed to synchronize loyalty matrix", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadLoyaltyData();
  }, [loadLoyaltyData]);

  const handleConfigUpdate = async () => {
    setSaving(true);
    try {
      await loyalty.updateSystemConfig({ loyalty: systemConfig });
      showToast?.("Loyalty matrix updated securely", "success");
    } catch (err) {
      showToast?.("Failed to update matrix", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-cyan-400" size={32} />
      <span className="ml-3 text-gray-400 font-mono text-sm">Synchronizing Loyalty Matrix...</span>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Award className="text-cyan-400" size={32} /> Loyalty <span className="text-cyan-400">Matrix</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs mt-1 uppercase tracking-widest">Rewards & Tier System Control</p>
        </div>
        <button
          onClick={handleConfigUpdate}
          disabled={saving}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Deploy Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex items-center gap-4">
          <Users size={32} className="text-emerald-400" />
          <div>
            <div className="text-3xl font-black text-emerald-400">{members.length}</div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Enrolled Members</div>
          </div>
        </div>
        <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-6 flex items-center gap-4">
          <Gift size={32} className="text-cyan-400" />
          <div>
            <div className="text-3xl font-black text-cyan-400">
               {members.reduce((acc, curr) => acc + (curr.loyalty_points || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total Points Circulating</div>
          </div>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-6 flex items-center gap-4">
          <Settings size={32} className="text-purple-400" />
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Matrix Status</span>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${systemConfig?.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {systemConfig?.enabled ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-lg font-bold text-white uppercase tracking-wide">Member Roster</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white focus:ring-1 focus:ring-cyan-500 outline-none w-48"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">Current Points</th>
                  <th className="px-6 py-4">Est. Tier</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredMembers.map((m, i) => {
                  const pts = m.loyalty_points || 0;
                  const tier = pts >= (systemConfig?.tierThresholds?.platinum || 5000) ? 'Platinum' : 
                               pts >= (systemConfig?.tierThresholds?.gold || 1000) ? 'Gold' : 'Silver';
                  
                  return (
                    <tr key={m.id || i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-300">{m.name}</div>
                        <div className="text-xs text-gray-600">{m.email}</div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-cyan-400">{pts.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${
                          tier === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                          tier === 'Gold' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-500 hover:text-cyan-400 bg-white/5 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#0a0c10] border border-white/10 rounded-3xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-6">Engine Rules</h2>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Accumulation Rate</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={systemConfig?.pointsPerDollar || 1}
                  onChange={e => setSystemConfig({...systemConfig, pointsPerDollar: Number(e.target.value)})}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 text-center"
                />
                <span className="text-xs text-gray-400 font-bold">Points per ₹1 spent</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Redemption Value</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  value={systemConfig?.redemptionValue || 0.01}
                  onChange={e => setSystemConfig({...systemConfig, redemptionValue: Number(e.target.value)})}
                  className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 text-center"
                />
                <span className="text-xs text-gray-400 font-bold">Value (₹) per 1 Point</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block">Tier Thresholds</label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase">Gold Tier</span>
                  <input
                    type="number"
                    value={systemConfig?.tierThresholds?.gold || 1000}
                    onChange={e => setSystemConfig({
                      ...systemConfig, 
                      tierThresholds: { ...systemConfig.tierThresholds, gold: Number(e.target.value) }
                    })}
                    className="w-24 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1 text-amber-400 font-mono text-sm text-right outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase">Platinum Tier</span>
                  <input
                    type="number"
                    value={systemConfig?.tierThresholds?.platinum || 5000}
                    onChange={e => setSystemConfig({
                      ...systemConfig, 
                      tierThresholds: { ...systemConfig.tierThresholds, platinum: Number(e.target.value) }
                    })}
                    className="w-24 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-1 text-purple-400 font-mono text-sm text-right outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
