import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Turnstile } from '@marsidev/react-turnstile';
import { FiEye, FiEyeOff, FiAlertCircle, FiLock, FiMail, FiShield, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  
  const turnstileRef = useRef(null);
  const navigate = useNavigate();
  const { adminLogin } = useAuth(); // CRITICAL: Uses specific admin context

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleTurnstileSuccess = useCallback((token) => {
    setError("");
    setTurnstileToken(token);
  }, []);

  const handleTurnstileError = useCallback((errorCode) => {
    setError("Security check failed. Please verify your connection.");
    setTurnstileToken("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!turnstileToken) {
      setError("Please complete the security verification.");
      return;
    }

    setLoading(true);
    try {
      // Simulate real-world terminal delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));

      const user = await adminLogin({ ...credentials, turnstileToken });
      
      if (!user || user.role !== "admin") {
        throw new Error("Access Denied: Terminal privileges required.");
      }

      setShowNotification(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);

    } catch (e) {
      // Cleanly output wrong password / missing email errors
      const errorMessage = e.response?.data?.message || e.message || "Invalid Authentication Credentials.";
      setError(errorMessage);
      
      setTurnstileToken("");
      if (turnstileRef.current) turnstileRef.current.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" style={{animationDelay: '700ms'}} />

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-6 transform hover:rotate-12 transition-transform duration-500">
            <FiShield className="h-10 w-10 text-white stroke-[2px]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Anritvox<span className="text-cyan-400">OS</span>
          </h1>
          <p className="text-gray-500 font-medium uppercase tracking-[0.3em] text-[10px]">Secure Terminal Access</p>
        </div>

        <div className="bg-[#0f111a]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Admin Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/60 h-4 w-4" />
                <input
                  type="email" name="email" value={credentials.email} onChange={handleChange} required
                  placeholder="admin@anritvox.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/60 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"} name="password" value={credentials.password} onChange={handleChange} required
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Captcha */}
            <div className="flex justify-center w-full min-h-[65px] pt-2">
              <Turnstile
                ref={turnstileRef}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <FiAlertCircle className="text-red-400 h-5 w-5 flex-shrink-0" />
                <p className="text-red-400 text-sm font-semibold">{error}</p>
              </div>
            )}

            {showNotification && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <FiCheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0 animate-pulse" />
                <p className="text-emerald-400 text-sm font-semibold">Decryption successful. Loading modules...</p>
              </div>
            )}

            <button
              type="submit" disabled={loading || showNotification}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiShield className="h-4 w-4" />}
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
