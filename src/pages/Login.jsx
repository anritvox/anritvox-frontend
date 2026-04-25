import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Mail, ArrowRight, AlertTriangle, Zap, 
  Key, Fingerprint, RefreshCw, CheckCircle2, Eye, EyeOff, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// Note: You will need to add these endpoints to your api.js and backend
// import { auth as authApi } from '../services/api'; 

// --- Animation Variants ---
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

  // --- STATE MACHINE ---
  // Views: 'LOGIN' | '2FA' | 'RECOVER_EMAIL' | 'RECOVER_OTP' | 'RECOVER_NEW_PWD' | 'SEC_QUESTION'
  const [view, setView] = useState('LOGIN'); 
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({ 
    email: '', password: '', newPassword: '', secAnswer: '' 
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  // --- UI STATE ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- TELEMETRY (For Premium Enterprise Feel) ---
  const [telemetry, setTelemetry] = useState('Initializing Secure Handshake...');
  useEffect(() => {
    setTimeout(() => setTelemetry('256-bit SSL Encrypted'), 1000);
    setTimeout(() => setTelemetry('Node Connection Established'), 2500);
  }, []);

  // --- HANDLERS ---
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

    // Auto-advance focus
    if (value !== '' && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // --- PASSWORD STRENGTH ENGINE ---
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 7) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };
  const strength = getPasswordStrength(formData.newPassword);
  const strengthColors = ['bg-slate-800', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const strengthLabels = ['Awaiting Input', 'Weak', 'Moderate', 'Strong', 'Military Grade'];

  // --- SUBMIT SEQUENCES ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;
    setLoading(true); setError('');
    try {
      // Step 1: Standard Auth
      // await login(formData); // Uncomment for real logic
      
      // Simulating a backend response that requires 2FA:
      setTimeout(() => {
        setLoading(false);
        setView('2FA'); // Move to 2FA state instead of logging in directly
        setTelemetry('Awaiting Biometric/MFA Verification');
      }, 1000);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Too many attempts")) {
        setIsRateLimited(true);
        setTimeout(() => setIsRateLimited(false), 60000); 
      }
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError("Complete the 6-digit sequence.");
    setLoading(true); setError('');
    try {
      // await authApi.verify2FA({ email: formData.email, otp: otpString });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      setError("Invalid 2FA Token. Access Denied.");
      setLoading(false);
    }
  };

  const handleRecoverInit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // await authApi.requestPasswordReset({ email: formData.email });
      setTimeout(() => {
        setLoading(false);
        setView('RECOVER_OTP');
        setSuccessMsg(`Recovery token dispatched to ${formData.email}`);
      }, 1000);
    } catch (err) {
      setError("Email not found in node registry.");
      setLoading(false);
    }
  };

  const handleRecoverOtpVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError("Complete the 6-digit sequence.");
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      // await authApi.verifyResetOtp({ email: formData.email, otp: otpString });
      setTimeout(() => {
        setLoading(false);
        setView('RECOVER_NEW_PWD');
      }, 1000);
    } catch (err) {
      setError("Token expired or invalid.");
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (strength < 3) return setError("Password does not meet security protocols.");
    setLoading(true); setError('');
    try {
      // await authApi.resetPassword({ email: formData.email, otp: otp.join(''), newPassword: formData.newPassword });
      setTimeout(() => {
        setLoading(false);
        setView('LOGIN');
        setFormData({ ...formData, password: '', newPassword: '' });
        setOtp(['', '', '', '', '', '']);
        setSuccessMsg("Security key updated. You may now authenticate.");
      }, 1500);
    } catch (err) {
      setError("Failed to update security key.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500 selection:text-black pt-24">
      
      {/* Background Matrix Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Top Telemetry Bar */}
      <div className="absolute top-24 right-6 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70 flex flex-col items-end gap-1">
        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> {telemetry}</span>
        <span className="text-slate-600">IP: {Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.X.X</span>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 bg-[length:200%_auto] animate-gradient"></div>

          <AnimatePresence mode="wait">
            
            {/* ================================================================= */}
            {/* VIEW: LOGIN                                                       */}
            {/* ================================================================= */}
            {view === 'LOGIN' && (
              <motion.div key="LOGIN" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <Shield size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Secure Uplink</h1>
                  <p className="text-slate-400 text-sm font-medium">Authenticate to access network.</p>
                </div>

                {successMsg && <AlertBox type="success" msg={successMsg} />}
                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <InputField icon={<Mail size={18}/>} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Designation" disabled={loading} />
                    <div className="relative">
                      <InputField icon={<Lock size={18}/>} type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Encryption Key (Password)" disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500" />
                      <span className="group-hover:text-white transition-colors">Remember Node</span>
                    </label>
                    <button type="button" onClick={() => setView('RECOVER_INIT')} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                      Recover Key?
                    </button>
                  </div>

                  <SubmitButton loading={loading} text="Initialize" icon={<Zap size={18}/>} disabled={isRateLimited} />
                </form>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* VIEW: TWO FACTOR AUTHENTICATION (2FA)                             */}
            {/* ================================================================= */}
            {view === '2FA' && (
              <motion.div key="2FA" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <Fingerprint size={32} />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">MFA Required</h1>
                <p className="text-slate-400 text-sm font-medium mb-8">Enter the 6-digit code from your Authenticator app.</p>

                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handle2FASubmit}>
                  <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={(el) => (otpRefs.current[idx] = el)} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} className="w-12 h-14 bg-slate-950 border border-slate-800 text-white text-xl font-black text-center rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" />
                    ))}
                  </div>
                  <SubmitButton loading={loading} text="Verify & Enter" icon={<Shield size={18}/>} />
                  <button type="button" onClick={() => setView('LOGIN')} className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Cancel Protocol</button>
                </form>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* VIEW: FORGOT PASSWORD - INITIALIZE EMAIL                          */}
            {/* ================================================================= */}
            {view === 'RECOVER_INIT' && (
              <motion.div key="RECOVER_INIT" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="mb-8">
                  <button onClick={() => setView('LOGIN')} className="text-slate-500 hover:text-emerald-500 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"><ArrowRight size={14} className="rotate-180"/> Back</button>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Key Recovery</h1>
                  <p className="text-slate-400 text-sm font-medium">Provide your registered designation to receive a temporary recovery token.</p>
                </div>

                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleRecoverInit} className="space-y-6">
                  <InputField icon={<Mail size={18}/>} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Designation" disabled={loading} />
                  <SubmitButton loading={loading} text="Dispatch Token" icon={<RefreshCw size={18}/>} />
                  
                  <div className="pt-4 border-t border-slate-800 text-center">
                    <button type="button" onClick={() => setView('SEC_QUESTION')} className="text-xs font-bold text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 w-full">
                      <ShieldAlert size={14} /> Use Security Questions Instead
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* VIEW: FORGOT PASSWORD - ENTER OTP                                 */}
            {/* ================================================================= */}
            {view === 'RECOVER_OTP' && (
              <motion.div key="RECOVER_OTP" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                  <Mail size={32} />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Token Dispatched</h1>
                <p className="text-slate-400 text-sm font-medium mb-8">Enter the 6-digit recovery token sent to {formData.email}</p>

                {successMsg && <AlertBox type="success" msg={successMsg} />}
                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleRecoverOtpVerify}>
                  <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={(el) => (otpRefs.current[idx] = el)} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} className="w-12 h-14 bg-slate-950 border border-slate-800 text-white text-xl font-black text-center rounded-xl focus:border-blue-500 outline-none" />
                    ))}
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-400 text-black font-black uppercase tracking-[0.2em] text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-3">
                    {loading ? 'Verifying...' : 'Validate Token'}
                  </button>
                  <button type="button" onClick={() => setView('RECOVER_INIT')} className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Resend Token</button>
                </form>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* VIEW: FORGOT PASSWORD - NEW PASSWORD                              */}
            {/* ================================================================= */}
            {view === 'RECOVER_NEW_PWD' && (
              <motion.div key="RECOVER_NEW_PWD" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="mb-8">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Forge New Key</h1>
                  <p className="text-slate-400 text-sm font-medium">Authentication token verified. Generate a new master password.</p>
                </div>

                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <InputField icon={<Key size={18}/>} type={showPassword ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="New Encryption Key" disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    
                    {/* Security Strength Engine */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                        <span className="text-slate-500">Key Integrity</span>
                        <span className={strength > 2 ? 'text-emerald-500' : 'text-amber-500'}>{strengthLabels[strength]}</span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full">
                        {[1, 2, 3, 4].map(level => (
                          <div key={level} className={`flex-1 rounded-full transition-colors duration-500 ${level <= strength ? strengthColors[strength] : 'bg-slate-800'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <SubmitButton loading={loading} text="Commit New Key" icon={<CheckCircle2 size={18}/>} disabled={strength < 3} />
                </form>
              </motion.div>
            )}

            {/* ================================================================= */}
            {/* VIEW: SECURITY QUESTIONS FALLBACK                                 */}
            {/* ================================================================= */}
            {view === 'SEC_QUESTION' && (
              <motion.div key="SEC_QUESTION" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                 <div className="mb-8">
                  <button onClick={() => setView('RECOVER_INIT')} className="text-slate-500 hover:text-emerald-500 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"><ArrowRight size={14} className="rotate-180"/> Back</button>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Fallback Identity Verification</h1>
                  <p className="text-slate-400 text-sm font-medium">Answer your primary security node question.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6">
                  <p className="text-emerald-500 font-bold text-sm">"What was the designation of your first hardware build?"</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setView('RECOVER_NEW_PWD'); }} className="space-y-6">
                  <InputField icon={<Key size={18}/>} type="text" name="secAnswer" value={formData.secAnswer} onChange={handleInputChange} placeholder="Your Answer" disabled={loading} />
                  <SubmitButton loading={loading} text="Verify Answer" icon={<Shield size={18}/>} />
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        {view === 'LOGIN' && (
          <div className="mt-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">
            Unregistered Node?{' '}
            <Link to="/register" className="text-emerald-500 hover:text-white transition-colors ml-1">Establish Connection</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Reusable Micro-Components ---

const InputField = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
      {icon}
    </div>
    <input
      required
      {...props}
      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
    />
  </div>
);

const SubmitButton = ({ loading, text, icon, disabled = false }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className={`w-full font-black uppercase tracking-[0.2em] text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group 
      ${disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]'}
    `}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> Processing...
      </div>
    ) : (
      <>
        {icon} {text}
        <ArrowRight size={18} className="absolute right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </>
    )}
  </button>
);

const AlertBox = ({ type, msg }) => (
  <motion.div 
    initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }}
    className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
      type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    }`}
  >
    {type === 'error' ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
    <span className="text-xs font-black uppercase tracking-widest leading-relaxed">{msg}</span>
  </motion.div>
);
