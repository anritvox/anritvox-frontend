import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Store } from 'lucide-react';
import api from '../services/api';

export default function WarehouseLogin() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { warehouseLoginVerify } = useAuth();
  const { showToast } = useToast() || {};

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      await api.post('/auth/warehouse/request-otp', { email });
      showToast?.('Security Token Sent to Email', 'success');
      setStep(2);
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Access Denied or Unauthorized Node', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

      const res = await api.post('/auth/warehouse/verify-otp', { email, otp });
      
      if (res.data && res.data.token) {

        warehouseLoginVerify(res.data);
        
        showToast?.('Node Connection Established', 'success');
        navigate('/warehouse'); 
      } else {
        showToast?.('Authentication failed: Missing token payload.', 'error');
      }
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Invalid or Expired Token', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
            <Store size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-white text-center mb-2 uppercase tracking-tight">Node Operator Access</h2>
        <p className="text-slate-400 text-center text-sm mb-8">Authenticate to link with the central warehouse matrix</p>
        
        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="Authorized Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-colors"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black uppercase tracking-widest p-4 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Transmitting...' : 'Request Node Access'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">Token sent to {email}</div>
              <input 
                type="text" 
                placeholder="6-Digit Code" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black uppercase tracking-widest p-4 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Establish Link'}
            </button>
            <button 
              type="button"
              onClick={() => { setStep(1); setOtp(''); }}
              className="w-full bg-transparent text-slate-500 font-bold text-xs uppercase hover:text-white transition-colors pt-2"
            >
              Cancel / Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
