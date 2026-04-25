import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Extract redirect path if user was pushed here from Checkout/Cart
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear errors on typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;
    
    setLoading(true);
    setError('');

    try {
      await login(formData);
      // Success sequence
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Too many attempts")) {
        setIsRateLimited(true);
        // Auto-unlock after 60 seconds
        setTimeout(() => setIsRateLimited(false), 60000); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500 selection:text-black pt-24">
      
      {/* Background Matrix Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 sm:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-50"></div>

          <div className="mb-10 text-center">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner text-emerald-500">
              <Shield size={32} />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Secure Uplink</h1>
            <p className="text-slate-400 text-sm font-medium">Authenticate to access your hardware arsenal.</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: -10 }}
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
                  isRateLimited ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span className="text-xs font-black uppercase tracking-widest leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || isRateLimited}
                  required
                  placeholder="Email Designation"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || isRateLimited}
                  required
                  placeholder="Encryption Key (Password)"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Remember Node</span>
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                Recover Key?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || isRateLimited}
              className={`w-full font-black uppercase tracking-[0.2em] text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                isRateLimited 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-70 disabled:cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Authenticating...
                </div>
              ) : isRateLimited ? (
                <div className="flex items-center gap-2">
                  <Lock size={18} /> System Locked
                </div>
              ) : (
                <>
                  <Zap size={18} /> Initialize
                  <ArrowRight size={18} className="absolute right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-800 pt-8">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Unregistered Node?{' '}
              <Link to="/register" className="text-emerald-500 hover:text-white transition-colors ml-1">
                Establish Connection
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
