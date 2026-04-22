// src/pages/Register.jsx
import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Register() {
  const [step, setStep] = useState(1); // 1 = register form, 2 = OTP verification
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  
  // 1. Added reference to manage Turnstile lifecycle manually
  const turnstileRef = useRef(null); 
  
  const { register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // 2. Memoized Turnstile callbacks to prevent widget reset on every keystroke
  const handleTurnstileSuccess = useCallback((token) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileError = useCallback(() => {
    console.warn('Turnstile failed to load');
    setError('Failed to load security check. Please refresh the page.');
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.password !== form.confirm) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    
    if (!turnstileToken) {
      return setError('Please complete the bot verification');
    }
    
    setLoading(true);
    try {
      await register({ 
        name: form.name, 
        email: form.email, 
        password: form.password, 
        phone: form.phone,
        turnstileToken 
      });
      setStep(2); // Move to OTP verification step
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      // 3. CRITICAL FIX: Reset Turnstile on API failure because tokens are single-use
      setTurnstileToken('');
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      return setError('Please enter the 6-digit OTP');
    }
    
    setLoading(true);
    try {
      await verifyEmail({ email: form.email, otp });
      navigate('/'); // Redirect to home after successful registration
    } catch (err) {
      setError(err.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        required={key !== 'phone'}
        value={form[key]}
        onChange={set(key)}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#39d353]"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h1>
            {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleRegister} className="space-y-4">
              {field('Full Name', 'name', 'text', 'Your full name')}
              {field('Email', 'email', 'email', 'you@example.com')}
              {field('Phone (optional)', 'phone', 'tel', '+91 XXXXX XXXXX')}
              {field('Password', 'password', 'password', 'Min 8 characters')}
              {field('Confirm Password', 'confirm', 'password', 'Re-enter password')}
              
              <div className="pt-2">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                  onSuccess={handleTurnstileSuccess}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileExpire}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#39d353] text-white py-2 rounded font-semibold hover:bg-[#2db844] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-[#39d353] hover:underline">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
            <p className="text-gray-600 mb-6">We've sent a 6-digit code to <strong>{form.email}</strong></p>
            {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#39d353]"
                  placeholder="000000"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#39d353] text-white py-2 rounded font-semibold hover:bg-[#2db844] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-600 text-sm hover:underline"
              >
                &larr; Back to registration
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
