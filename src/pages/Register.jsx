import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, Mail, AlertTriangle, User, 
  Phone, Key, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const viewVariants = {
  initial: { opacity: 0, x: 30, scale: 0.95 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } }
};

export default function Register() {
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('INIT');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', securityAnswer: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 7) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; 
  };
  const strength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-slate-800', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

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
    if (strength < 2) return setError("Please choose a stronger password.");
    if (!formData.securityAnswer) return setError("Security answer is required.");

    setLoading(true); setError('');
    try {
      await register(formData);
      setView('OTP');
      setSuccessMsg(`Verification code sent to ${formData.email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < 6) return setError("Please enter the 6-digit code.");
    
    setLoading(true); setError('');
    try {
      await verifyEmail({ 
        email: formData.email, 
        otp: otpString, 
        securityAnswer: formData.securityAnswer 
      });
      setSuccessMsg("Account created successfully. Logging you in...");
      setTimeout(() => navigate('/profile', { replace: true }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden pt-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {view === 'INIT' && (
              <motion.div key="INIT" variants={viewVariants} initial="initial" animate="animate" exit="exit">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
                  <p className="text-slate-400 text-sm">Join us and start shopping today.</p>
                </div>

                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleRegisterInit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField icon={<User size={18}/>} type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" disabled={loading} />
                    <InputField icon={<Phone size={18}/>} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone Number" disabled={loading} />
                  </div>
                  
                  <InputField icon={<Mail size={18}/>} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" disabled={loading} />
                  
                  <div className="space-y-2">
                    <InputField icon={<Lock size={18}/>} type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" disabled={loading} />
                    <div className="flex gap-1 h-1 w-full px-2">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`flex-1 rounded-full transition-colors duration-500 ${level <= strength ? strengthColors[strength] : 'bg-slate-800'}`}></div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Security Question</label>
                    <p className="text-xs text-slate-500 mb-3">"What is your mother's maiden name?"</p>
                    <InputField icon={<Key size={18}/>} type="text" name="securityAnswer" value={formData.securityAnswer} onChange={handleInputChange} placeholder="Your Answer" disabled={loading} />
                  </div>

                  <SubmitButton loading={loading} text="Sign Up" disabled={strength < 2} />
                </form>
              </motion.div>
            )}

            {view === 'OTP' && (
              <motion.div key="OTP" variants={viewVariants} initial="initial" animate="animate" exit="exit" className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
                <p className="text-slate-400 text-sm mb-8">Enter the 6-digit code we sent to {formData.email}</p>

                {successMsg && <AlertBox type="success" msg={successMsg} />}
                {error && <AlertBox type="error" msg={error} />}

                <form onSubmit={handleVerifyOtp}>
                  <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, idx) => (
                      <input key={idx} ref={(el) => (otpRefs.current[idx] = el)} type="text" maxLength="1" value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(idx, e)} className="w-12 h-14 bg-slate-950 border border-slate-800 text-white text-xl font-black text-center rounded-xl focus:border-emerald-500 outline-none" />
                    ))}
                  </div>
                  <SubmitButton loading={loading} text="Verify Account" />
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        
        {view === 'INIT' && (
          <div className="mt-8 text-center text-sm font-medium text-slate-400 relative z-10">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1">Log In</Link>
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
    <input required {...props} className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50" />
  </div>
);

const SubmitButton = ({ loading, text, disabled = false }) => (
  <button type="submit" disabled={loading || disabled} className={`w-full font-bold text-sm py-4 rounded-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group mt-4 ${disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg'}`}>
    {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <>{text}</>}
  </button>
);

const AlertBox = ({ type, msg }) => (
  <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
    {type === 'error' ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
    <span className="text-sm font-medium leading-relaxed">{msg}</span>
  </motion.div>
);
