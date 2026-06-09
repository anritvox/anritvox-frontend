import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Turnstile } from '@marsidev/react-turnstile';

const viewVariants = {
  initial: { opacity: 0, x: 30, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
};

export default function Login() {
  const { login } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';


  const turnstileRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const TURNSTILE_SITE_KEY = "0x4AAAAAADBENLaxaG5Y9r6D";

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!turnstileToken) return setError('Please complete the bot verification.');
    
    setLoading(true);
    setError('');
    
    try {
      await login({ email: formData.email, password: formData.password, turnstileToken });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      

      setTurnstileToken(''); 
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative font-sans overflow-hidden">
      
      {}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-olive-400/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-olive-500/5 rounded-full blur-[120px] translate-y-1/2"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_-20px_rgba(128,141,100,0.15)] relative z-10">
        
        {}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="h-10 overflow-hidden flex items-center rounded-lg mb-4">
            <img 
              src="/logo-rect.jpeg" 
              alt="Anritvox Logo" 
              className="h-full w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-olive-50 border border-olive-100 text-olive-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
            <Sparkles size={10} className="animate-pulse" /> Hardware Registry Secure Access
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key="LOGIN" variants={viewVariants} initial="initial" animate="animate" exit="exit">
            <div className="text-left mb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Welcome Back</h2>
              <p className="text-slate-400 text-xs font-semibold mt-1">Sign in with your registered account credentials.</p>
            </div>
            
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 font-medium rounded-2xl mb-6 text-xs leading-relaxed animate-in fade-in duration-200">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <InputField icon={<Mail size={16} />} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" />
              
              <div className="relative">
                <InputField icon={<Lock size={16} />} type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-olive-500 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <div className="flex justify-center mb-2 pt-2">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                />
              </div>
              
              <SubmitButton loading={loading} text="Sign In" disabled={!turnstileToken} />
            </form>

            <div className="mt-8 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-t border-slate-100 pt-6">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-olive-500 hover:text-olive-600 transition-colors ml-1 underline decoration-2 underline-offset-4">Sign Up</Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const InputField = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-olive-500 transition-colors pointer-events-none">{icon}</div>
    <input 
      required 
      {...props} 
      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-olive-400 focus:bg-white focus:ring-4 focus:ring-olive-500/5 transition-all disabled:opacity-50 placeholder:text-slate-400" 
    />
  </div>
);

const SubmitButton = ({ loading, text, disabled }) => (
  <button 
    type="submit" 
    disabled={loading || disabled} 
    className={`w-full font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
      disabled 
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60' 
        : 'bg-slate-900 text-white hover:bg-olive-400 shadow-md shadow-slate-950/10'
    }`}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    ) : (
      text
    )}
  </button>
);
