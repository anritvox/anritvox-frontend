import React, { useState, useEffect } from 'react';
import { Truck, Search, Plus, Edit2, Trash2, MapPin, X } from 'lucide-react';
import api from '../../services/api';

export default function ShippingManagement() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [formData, setFormData] = useState({ name: '', regions: '', base_charge: '', is_active: 1 });

  useEffect(() => { fetchZones(); }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shipping/zones');
      setZones(Array.isArray(response.data) ? response.data : []);
    } catch (e) { console.error("Fetch error:", e); } finally { setLoading(false); }
  };

  const openModal = (zone = null) => {
    if (zone) {
      setCurrentZone(zone);
      setFormData({ name: zone.name, regions: zone.regions, base_charge: zone.base_charge, is_active: zone.is_active ?? 1 });
    } else {
      setCurrentZone(null);
      setFormData({ name: '', regions: '', base_charge: '', is_active: 1 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentZone) await api.put(`/shipping/zones/${currentZone.id}`, formData);
      else await api.post('/shipping/zones', formData);
      setIsModalOpen(false); fetchZones();
    } catch (e) { alert("Failed to save shipping zone."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this zone?')) {
      try { await api.delete(`/shipping/zones/${id}`); fetchZones(); }
      catch (e) { console.error("Delete error:", e); }
    }
  };

  const filteredZones = zones.filter(z => z.name.toLowerCase().includes(searchTerm.toLowerCase()) || z.regions.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2"><Truck className="text-emerald-500" /> Shipping Zones</h2>
          <p className="text-slate-400 text-sm mt-1">Manage delivery regions and base shipping charges.</p>
        </div>
        <button onClick={() => openModal()} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all"><Plus size={18} /> Add Zone</button>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Configured Zones</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input type="text" placeholder="Search..." className="bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-4 py-2 focus:border-emerald-500 focus:outline-none w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="text-xs uppercase bg-slate-900 text-slate-500 font-bold">
              <tr><th className="px-6 py-4">Zone Name</th><th className="px-6 py-4">Regions Covered</th><th className="px-6 py-4">Base Charge (₹)</th><th className="px-6 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan="4" className="text-center py-8">Loading...</td></tr> : filteredZones.length === 0 ? <tr><td colSpan="4" className="text-center py-8 text-slate-500">No zones found.</td></tr> : filteredZones.map((z) => (
                <tr key={z.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold text-white">{z.name}</td>
                  <td className="px-6 py-4 flex items-center gap-2"><MapPin size={14} className="text-emerald-500" /><span className="truncate max-w-xs">{z.regions}</span></td>
                  <td className="px-6 py-4 font-mono text-emerald-400 font-bold">₹{parseFloat(z.base_charge).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(z)} className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(z.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors ml-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-6">{currentZone ? 'Edit Zone' : 'Add Zone'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-400 mb-1">Zone Name</label><input type="text" required className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:border-emerald-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-slate-400 mb-1">Regions (Comma separated)</label><textarea required rows="3" className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:border-emerald-500 outline-none resize-none" value={formData.regions} onChange={(e) => setFormData({...formData, regions: e.target.value})} /></div>
              <div><label className="block text-xs font-bold text-slate-400 mb-1">Base Charge (₹)</label><input type="number" required step="0.01" className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2 focus:border-emerald-500 outline-none font-mono" value={formData.base_charge} onChange={(e) => setFormData({...formData, base_charge: e.target.value})} /></div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition-all">{currentZone ? 'Update Zone' : 'Create Zone'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
