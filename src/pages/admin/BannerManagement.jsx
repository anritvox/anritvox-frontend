import React, { useState, useEffect } from 'react';
import { FiImage, FiPlus, FiTrash2, FiSave, FiAlertCircle, FiEdit2, FiRefreshCw, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { fetchBannersAdmin, createBannerAdmin, updateBannerAdmin, deleteBannerAdmin } from '../../services/api';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link_url: '',
    position: 'hero',
    sort_order: 0,
    is_active: true,
  });

  const loadBanners = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBannersAdmin();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load banners: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const resetForm = () => {
    setForm({ title: '', subtitle: '', description: '', image_url: '', link_url: '', position: 'hero', sort_order: 0, is_active: true });
    setEditingId(null);
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      position: banner.position || 'hero',
      sort_order: banner.sort_order || 0,
      is_active: banner.is_active === 1 || banner.is_active === true,
    });
  };

  const handleSave = async () => {
    if (!form.image_url.trim()) { setError('Image URL is required.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      if (editingId) {
        await updateBannerAdmin(editingId, form);
        setSuccess('Banner updated successfully!');
      } else {
        await createBannerAdmin(form);
        setSuccess('Banner created successfully!');
      }
      resetForm();
      await loadBanners();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await deleteBannerAdmin(id);
      setSuccess('Banner deleted.');
      await loadBanners();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (banner) => {
    try {
      await updateBannerAdmin(banner.id, { ...banner, is_active: !banner.is_active });
      await loadBanners();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Banner Management</h2>
        <button onClick={loadBanners} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <FiAlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <FiPlus size={16} /> {editingId ? 'Edit Banner' : 'Add New Banner'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title (optional)</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Banner title" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Subtitle (optional)</label>
            <input type="text" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Banner subtitle" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Enter banner description text..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 h-20" />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Image URL *</label>
            <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://example.com/banner.jpg" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Link URL (optional)</label>
            <input type="text" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })}
              placeholder="/shop or https://..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Position</label>
            <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })}
              className="w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500">
              <option value="hero">Hero (Main Slider)</option>
              <option value="promo">Promo Banner</option>
              <option value="sidebar">Sidebar</option>
              <option value="popup">Popup</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">Active</label>
            <button onClick={() => setForm({ ...form, is_active: !form.is_active })} className={`text-lg ${form.is_active ? 'text-green-400' : 'text-gray-500'}`}>
              {form.is_active ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            <FiSave size={14} /> {saving ? 'Saving...' : editingId ? 'Update Banner' : 'Add Banner'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm">Cancel</button>
          )}
        </div>
      </div>

      {/* Banners List */}
      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border border-white/10 rounded-xl">
          <FiImage size={32} className="mx-auto mb-3 opacity-30" />
          <p>No banners yet. Add your first banner above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {banners.map(banner => (
            <div key={banner.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                {banner.image_url ? (
                  <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600"><FiImage size={20} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{banner.title || '(No title)'}</div>
                <div className="text-xs text-gray-400 truncate">{banner.image_url}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded">{banner.position}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${banner.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">Order: {banner.sort_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggle(banner)}
                  className={`p-2 rounded-lg text-sm ${banner.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/5'}`}
                  title={banner.is_active ? 'Deactivate' : 'Activate'}>
                  {banner.is_active ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                </button>
                <button onClick={() => handleEdit(banner)} className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg" title="Edit">
                  <FiEdit2 size={16} />
                </button>
                <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" title="Delete">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
