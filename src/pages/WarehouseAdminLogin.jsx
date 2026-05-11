import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function WarehouseAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast() || {};

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Authenticate with backend
      const res = await api.post('/auth/admin-login', { email, password });
      
      if (res.data.token) {
        localStorage.setItem('warehouseToken', res.data.token);
        localStorage.setItem('ms_token', res.data.token);
        showToast?.('Master Admin Authenticated', 'success');
        
        // THE FIX: Send the user to the Admin HTML Bridge, NOT the standard warehouse
        // Note: If you prefer the React Dashboard we built earlier, change this to: navigate('/warehouse/management');
        navigate('/warehouse/admin'); 
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Invalid Master Credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
            <ShieldCheck size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white text-center mb-2 uppercase tracking-tight">Master Node Login</h2>
        <p className="text-slate-400 text-center text-sm mb-8">Authenticate to access the Warehouse Admin Terminal</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Master Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-colors"
              required 
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Secure Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition-colors"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest p-4 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Access Terminal'}
          </button>
        </form>
      </div>
    </div>
  );
}
