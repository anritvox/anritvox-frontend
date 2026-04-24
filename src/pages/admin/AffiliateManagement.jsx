import React, { useState, useEffect } from 'react';
import { affiliate as affiliateApi } from '../../services/api';
import { Share2, DollarSign, Users, TrendingUp, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';

export default function AffiliateManagement() {
  const [partners, setPartners] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [config, setConfig] = useState({ commission_percent: 10, min_payout: 500 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [partnersRes, withdrawalsRes, configRes] = await Promise.all([affiliateApi.getAllPartners(), affiliateApi.getAllWithdrawals(), affiliateApi.getConfig()]);
      setPartners(partnersRes.data?.partners || partnersRes.data || []);
      setWithdrawals(withdrawalsRes.data?.withdrawals || withdrawalsRes.data || []);
      setConfig(configRes.data?.config || configRes.data || { commission_percent: 10, min_payout: 500 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePartnerStatus = async (id, status) => {
    try {
      await affiliateApi.updatePartnerStatus(id, status);
      fetchAll();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const approveWithdrawal = async (id) => {
    try {
      await affiliateApi.approveWithdrawal(id);
      fetchAll();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const saveConfig = async () => {
    try {
      await affiliateApi.updateConfig(config);
      alert('Config saved!');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Affiliate Network</h2>
          <p className="text-slate-500 font-medium mt-1">Manage affiliate partners and commissions</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-black text-slate-900">{partners.length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Partners</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-black text-emerald-600">{partners.filter(p => p.status === 'active').length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Active</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-black text-amber-600">{withdrawals.filter(w => w.status === 'pending').length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Pending Payouts</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-black text-blue-600">{config.commission_percent}%</div>
          <div className="text-xs font-bold text-slate-400 uppercase mt-1">Commission</div>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-lg mb-4">Commission Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Commission Percentage</label>
            <input type="number" value={config.commission_percent} onChange={e => setConfig({...config, commission_percent: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Min Payout (₹)</label>
            <input type="number" value={config.min_payout} onChange={e => setConfig({...config, min_payout: parseFloat(e.target.value)})} className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <button onClick={saveConfig} className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm">Save Config</button>
      </div>

      {/* Partners */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-lg mb-4">Affiliate Partners</h3>
        {loading ? <div className="text-center py-8 text-slate-400">Loading...</div> : partners.length === 0 ? <div className="text-center py-8 text-slate-400">No partners yet</div> : (
          <div className="space-y-3">
            {partners.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex-1">
                  <div className="font-black text-slate-900">{p.name || p.user_name || 'Partner #' + p.id}</div>
                  <div className="text-xs text-slate-500">{p.email || p.user_email} • Code: {p.affiliate_code}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    Total Earned: ₹{p.total_earnings || 0} • Pending: ₹{p.pending_amount || 0}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {p.status || 'pending'}
                  </span>
                  {p.status === 'active' ? (
                    <button onClick={() => updatePartnerStatus(p.id, 'suspended')} className="p-2 hover:bg-slate-200 rounded-lg" title="Suspend">
                      <XCircle size={16} className="text-rose-500" />
                    </button>
                  ) : (
                    <button onClick={() => updatePartnerStatus(p.id, 'active')} className="p-2 hover:bg-slate-200 rounded-lg" title="Activate">
                      <CheckCircle size={16} className="text-emerald-500" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawals */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-black text-slate-900 text-lg mb-4">Withdrawal Requests</h3>
        {loading ? <div className="text-center py-8 text-slate-400">Loading...</div> : withdrawals.length === 0 ? <div className="text-center py-8 text-slate-400">No requests</div> : (
          <div className="space-y-3">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-900">{w.partner_name || 'Partner #' + w.partner_id}</div>
                  <div className="text-xs text-slate-500">Requested: {new Date(w.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-emerald-600">₹{w.amount}</div>
                    <div className={`text-xs font-bold ${w.status === 'approved' ? 'text-emerald-600' : w.status === 'pending' ? 'text-amber-600' : 'text-slate-400'}`}>
                      {w.status}
                    </div>
                  </div>
                  {w.status === 'pending' && (
                    <button onClick={() => approveWithdrawal(w.id)} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold">
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
