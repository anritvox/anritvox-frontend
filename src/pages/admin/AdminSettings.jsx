import React, { useState } from 'react';
import { users } from '../../services/api';
import { FiLock, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function AdminSettings({ token }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await users.changePassword({ currentPassword, newPassword });
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <FiLock className="text-cyan-400" />
          Admin Settings
        </h2>
        <p className="text-gray-400">Manage your admin account settings</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
          <FiCheckCircle />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
          <FiAlertCircle />
          {error}
        </div>
      )}

      <div className="bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 bg-[#0f1419] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-[#0f1419] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-[#0f1419] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" disabled={loading} />
          </div>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <FiSave /> {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="mt-6 bg-[#1a1f2e] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Site Information</h3>
        <div className="space-y-3 text-gray-400">
          <div className="flex justify-between"><span>Site Name:</span><span className="text-white">Anritvox</span></div>
          <div className="flex justify-between"><span>Domain:</span><span className="text-white">anritvox.com</span></div>
          <div className="flex justify-between"><span>Payment Method:</span><span className="text-white">Cash on Delivery (COD)</span></div>
          <div className="flex justify-between"><span>Delivery Types:</span><span className="text-white">Standard, Express</span></div>
        </div>
      </div>
    </div>
  );
}
