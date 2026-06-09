import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Mail, AlertTriangle, User, 
  Key, CheckCircle2, Sparkles 
} from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../context/AuthContext';

const viewVariants = {
  initial: { opacity: 0, x: 30, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
};

export default function Register() {
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();


  const turnstileRef = useRef(null);

  const [view, setView] = useState('INIT');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', securityAnswer: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const TURNSTILE_SITE_KEY = "0x4AAAAAADBENLaxaG5Y9r6D";

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 7) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; 
  };

  const strength = getPasswordStrength(formData.password);
  

  const strengthColors = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-olive-300', 'bg-olive-500'];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value !== '' && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleRegisterInit = async (e) => {
    e.preventDefault();

    if (!turnstileToken) return setError('Please complete the bot verification.');
    if (strength < 2) return setError("Please choose a stronger password.");
    if (!formData.securityAnswer) return setError("Security answer is required.");

    setLoading(true); 
    setError('');
    
    try {
      await register({ ...formData, turnstileToken }); 
      setView('OTP');
      setSuccessMsg(`Verification code sent to ${formData.email}`);
    } catch (err) {
      setError(err.message || 'Registration failed');
      

      setTurnstileToken('');
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }

    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError("Please enter the 6-digit code.");
    
    setLoading(true); 
    setError('');
    
    try {
      await verifyEmail({ 
        email: formData.email, 
        otp: otpString, 
        securityAnswer: formData.securityAnswer 
      });
      setSuccessMsg("Account created successfully. Logging you in...");
      setTimeout(() => navigate('/profile', { replace: true }), 1500);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden pt-24 font-sans">
      
      {}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-olive-400/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-olive-500/5 rounded-full blur-[120px] translate-y-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_-20px_rgba(128,141,100,0.15)] relative overflow-hidden">
          
          {}
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="h-10 overflow-hidden flex items-center rounded-lg mb-3">
              <img 
                src="/logo-rect.jpeg" 
                alt="Anritvox Logo" 
                className="h-full w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-olive-50 border border-olive-100 text-olive-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
              <Sparkles size={10} className="animate-pulse" /> Hardware Registry Registration
            </span>
          </div>

          <AnimatePresence mode="wait">
            
            {view === 'INIT' && (
              <motion.div key="INIT" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="text-left mb-6">
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create Account</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Set up your store user identity profile to begin shopping.</p>
                </div>

                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleRegisterInit} className="space-y-4">
                  <InputField icon={<User size={16}/>} type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" disabled={loading} />
                  
                  <InputField icon={<Mail size={16}/>} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" disabled={loading} />
                  
                  <div className="space-y-2">
                    <InputField icon={<Lock size={16}/>} type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Choose Password" disabled={loading} />
                    <div className="flex gap-1 h-1 w-full px-1">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`flex-1 h-1 rounded-full transition-colors duration-500 ${level <= strength ? strengthColors[strength] : 'bg-slate-100'}`}></div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Security Identification Question</label>
                    <p className="text-[11px] font-bold text-slate-400 italic mb-3">"What is your mother's maiden name?"</p>
                    <InputField icon={<Key size={16}/>} type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleInputChange} placeholder="Your Answer String" disabled={loading} />
                  </div>

                  <div className="flex justify-center mb-2 pt-2">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setTurnstileToken(token)}
                    />
                  </div>
                  
                  <SubmitButton loading={loading} text="Create Account" disabled={strength < 2 || !turnstileToken} />
                </form>
              </motion.div>
            )}

            {view === 'OTP' && (
              <motion.div key="OTP" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                <div className="text-left mb-6">
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Verify Your Email</h1>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Enter the 6-digit verification code sent to {formData.email}</p>
                </div>

                {successMsg && <AlertBox type="success" msg={successMsg} />}
                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleVerifyOtp}>
                  <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} 
                        ref={(el) => (otpRefs.current[idx] = el)} 
                        type="text" 
                        maxLength="1" 
                        value={digit} 
                        onChange={(e) => handleOtpChange(idx, e.target.value)} 
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)} 
                        className="w-12 h-14 bg-slate-50 border border-slate-200 text-slate-900 text-xl font-mono font-black text-center rounded-xl focus:border-olive-400 focus:bg-white focus:ring-4 focus:ring-olive-500/5 outline-none transition-all" 
                      />
                    ))}
                  </div>
                  <SubmitButton loading={loading} text="Verify & Activate" />
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        {view === 'INIT' && (
          <div className="mt-8 text-center text-xs font-bold uppercase tracking-wider text-slate-400 relative z-10">
            Already have an account?{' '}
            <Link to="/login" className="text-olive-500 hover:text-olive-600 transition-colors ml-1 underline decoration-2 underline-offset-4">Log In</Link>
          </div>
        )}
      </div>
    </div>
  );
}

const InputField = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-olive-500 transition-colors">
      {icon}
    </div>
    <input 
      required 
      {...props} 
      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-olive-400 focus:bg-white focus:ring-4 focus:ring-olive-500/5 transition-all disabled:opacity-50 placeholder:text-slate-400" 
    />
  </div>
);

const SubmitButton = ({ loading, text, disabled = false }) => (
  <button 
    type="submit" 
    disabled={loading || disabled} 
    className={`w-full font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 ${
      disabled 
        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60' 
        : 'bg-slate-900 text-white hover:bg-olive-400 shadow-md shadow-slate-950/10'
    }`}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
    ) : (
      <>{text}</>
    )}
  </button>
);

const AlertBox = ({ type, msg }) => (
  <motion.div 
    initial={{ opacity: 0, height: 0, y: -10 }} 
    animate={{ opacity: 1, height: 'auto', y: 0 }} 
    exit={{ opacity: 0, height: 0, y: -10 }} 
    className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
      type === 'error' 
        ? 'bg-red-50 border-red-100 text-red-600' 
        : 'bg-olive-50 border-olive-100 text-olive-600'
    }`}
  >
    {type === 'error' ? (
      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
    ) : (
      <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
    )}
    <span className="text-xs font-medium leading-relaxed">{msg}</span>
  </motion.div>
);
