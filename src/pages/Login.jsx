import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Mail, ArrowRight, AlertTriangle, Zap, 
  Key, Fingerprint, RefreshCw, CheckCircle2, Eye, EyeOff, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth as authApi } from '../services/api';

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

  const [view, setView] = useState('LOGIN'); 
  const [formData, setFormData] = useState({ 
    email: '', password: '', newPassword: '', secAnswer: '' 
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [securityBypass, setSecurityBypass] = useState(false);

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

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 7) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; 
  };
  const strength = getPasswordStrength(formData.newPassword);
  const strengthColors = ['bg-slate-800', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const strengthLabels = ['Awaiting Input', 'Weak', 'Moderate', 'Strong', 'Very Strong'];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (isRateLimited) return;
    setLoading(true); setError('');
    try {
      await login({ email: formData.email, password: formData.password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err.message.includes("MFA Verification Required")) {
        setView('2FA');
      } else {
        setError(err.message);
        if (err.message.includes("Too many attempts")) {
          setIsRateLimited(true);
          setTimeout(() => setIsRateLimited(false), 60000); 
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError("Please enter the 6-digit code.");
    
    setLoading(true); setError('');
    try {
      const res = await authApi.verify2FA({ email: formData.email, otp: otpString });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = from;
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid Code. Access Denied.");
      setLoading(false);
    }
  };

  const handleRecoverInit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.requestPasswordReset({ email: formData.email });
      setView('RECOVER_OTP');
      setSuccessMsg(`Recovery code sent to ${formData.email}`);
    } catch (err) {
      setError(err.response?.data?.message || "Email not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverOtpVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError("Please enter the 6-digit code.");
    
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      await authApi.verifyResetOtp({ email: formData.email, otp: otpString });
      setView('RECOVER_NEW_PWD');
      setSecurityBypass(false);
    } catch (err) {
      setError(err.response?.data?.message || "Code expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityQuestionVerify = async (e) => {
    e.preventDefault();
    if (!formData.secAnswer) return setError("Answer required.");
    
    setLoading(true); setError('');
    try {
      const res = await authApi.verifySecurityQuestion({ email: formData.email, answer: formData.secAnswer });
      if (res.data.success) {
        setSecurityBypass(true);
        setView('RECOVER_NEW_PWD');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Identity verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    if (strength < 2) return setError("Please choose a stronger password.");
    
    setLoading(true); setError('');
    try {
      await authApi.resetPassword({ 
        email: formData.email, 
        otp: otp.join(''), 
        newPassword: formData.newPassword,
        securityBypass: securityBypass
      });
      
      setView('LOGIN');
      setFormData({ email: '', password: '', newPassword: '', secAnswer: '' });
      setOtp(['', '', '', '', '', '']);
      setSuccessMsg("Password updated successfully. You may now log in.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden pt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {view === 'LOGIN' && (
              <motion.div key="LOGIN" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                  <p className="text-slate-400 text-sm">Please enter your details to sign in.</p>
                </div>

                {successMsg && <AlertBox type="success" msg={successMsg} />}
                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <InputField icon={<Mail size={18}/>} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" disabled={loading} />
                    <div className="relative">
                      <InputField icon={<Lock size={18}/>} type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group text-sm text-slate-400">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500" />
                      <span className="group-hover:text-white transition-colors">Remember Me</span>
                    </label>
                    <button type="button" onClick={() => setView('RECOVER_INIT')} className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                      Forgot Password?
                    </button>
                  </div>

                  <SubmitButton loading={loading} text="Sign In" disabled={isRateLimited} />
                </form>
              </motion.div>
            )}

            {view === '2FA' && (
              <motion.div key="2FA" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Two-Factor Auth</h1>
                <p className="text-slate-400 text-sm mb-8">Enter the 6-digit code from your Authenticator app.</p>
                {error && <AlertBox type="error" msg={error} />}
                <form onSubmit={handle2FASubmit}>
                  <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={(el) => (otpRefs.current[idx] = el)} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} className="w-12 h-14 bg-slate-950 border border-slate-800 text-white text-xl font-black text-center rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none" />
                    ))}
                  </div>
                  <SubmitButton loading={loading} text="Verify Code" />
                  <button type="button" onClick={() => setView('LOGIN')} className="mt-6 text-sm font-medium text-slate-500 hover:text-white transition-colors">Cancel</button>
                </form>
              </motion.div>
            )}

            {view === 'RECOVER_INIT' && (
              <motion.div key="RECOVER_INIT" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="mb-8">
                  <button onClick={() => setView('LOGIN')} className="text-slate-500 hover:text-emerald-500 mb-6 flex items-center gap-2 text-sm font-medium transition-colors"><ArrowRight size={14} className="rotate-180"/> Back</button>
                  <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                  <p className="text-slate-400 text-sm">Enter your email to receive a recovery code.</p>
                </div>
                {error && <AlertBox type="error" msg={error} />}
                <form onSubmit={handleRecoverInit} className="space-y-6">
                  <InputField icon={<Mail size={18}/>} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" disabled={loading} />
                  <SubmitButton loading={loading} text="Send Code" />
                  <div className="pt-4 border-t border-slate-800 text-center">
                    <button type="button" onClick={() => {
                      if(!formData.email) return setError("Please enter your email address first.");
                      setError('');
                      setView('SEC_QUESTION');
                    }} className="text-sm font-medium text-cyan-500 hover:text-cyan-400 transition-colors flex items-center justify-center gap-2 w-full">
                      <ShieldAlert size={14} /> Answer Security Question Instead
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'RECOVER_OTP' && (
              <motion.div key="RECOVER_OTP" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                <p className="text-slate-400 text-sm mb-8">Enter the 6-digit code we sent to {formData.email}</p>
                {successMsg && <AlertBox type="success" msg={successMsg} />}
                {error && <AlertBox type="error" msg={error} />}
                <form onSubmit={handleRecoverOtpVerify}>
                  <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={(el) => (otpRefs.current[idx] = el)} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} className="w-12 h-14 bg-slate-950 border border-slate-800 text-white text-xl font-black text-center rounded-xl focus:border-blue-500 outline-none" />
                    ))}
                  </div>
                  <SubmitButton loading={loading} text="Verify Code" />
                  <button type="button" onClick={handleRecoverInit} className="mt-6 text-sm font-medium text-slate-500 hover:text-white transition-colors">Resend Code</button>
                </form>
              </motion.div>
            )}

            {view === 'SEC_QUESTION' && (
              <motion.div key="SEC_QUESTION" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                 <div className="mb-8">
                  <button onClick={() => setView('RECOVER_INIT')} className="text-slate-500 hover:text-emerald-500 mb-6 flex items-center gap-2 text-sm font-medium transition-colors"><ArrowRight size={14} className="rotate-180"/> Back</button>
                  <h1 className="text-2xl font-bold text-white mb-2">Security Question</h1>
                  <p className="text-slate-400 text-sm">Answer your security question for {formData.email}.</p>
                </div>
                {error && <AlertBox type="error" msg={error} />}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6">
                  <p className="text-emerald-500 font-medium text-sm">"What is your mother's maiden name?"</p>
                </div>
                <form onSubmit={handleSecurityQuestionVerify} className="space-y-6">
                  <InputField icon={<Key size={18}/>} type="text" name="secAnswer" value={formData.secAnswer} onChange={handleInputChange} placeholder="Your Answer" disabled={loading} />
                  <SubmitButton loading={loading} text="Submit Answer" />
                </form>
              </motion.div>
            )}

            {view === 'RECOVER_NEW_PWD' && (
              <motion.div key="RECOVER_NEW_PWD" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
                  <p className="text-slate-400 text-sm">Please enter your new password below.</p>
                </div>
                {error && <AlertBox type="error" msg={error} />}
                <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <InputField icon={<Key size={18}/>} type={showPassword ? "text" : "password"} name="newPassword" value={formData.newPassword} onChange={handleInputChange} placeholder="New Password" disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span className="text-slate-500">Password Strength</span>
                        <span className={strength > 2 ? 'text-emerald-500' : 'text-amber-500'}>{strengthLabels[strength]}</span>
                      </div>
                      <div className="flex gap-1 h-1.5 w-full">
                        {[1, 2, 3, 4].map(level => (
                          <div key={level} className={`flex-1 rounded-full transition-colors duration-500 ${level <= strength ? strengthColors[strength] : 'bg-slate-800'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <SubmitButton loading={loading} text="Update Password" disabled={strength < 2} />
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {view === 'LOGIN' && (
          <div className="mt-8 text-center text-sm font-medium text-slate-400 relative z-10">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
}

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

const SubmitButton = ({ loading, text, disabled = false }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className={`w-full font-bold text-sm py-4 rounded-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group 
      ${disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg'}
    `}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> Processing...
      </div>
    ) : (
      text
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
    <span className="text-sm font-medium leading-relaxed">{msg}</span>
  </motion.div>
);
