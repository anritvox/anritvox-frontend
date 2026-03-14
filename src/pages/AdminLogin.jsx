import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api";
import { FiEye, FiEyeOff, FiAlertCircle, FiLock, FiMail, FiShield, FiRefreshCw } from "react-icons/fi";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token } = await adminLogin(credentials);
      localStorage.setItem("ms_token", token);
      setShowNotification(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1500);
    } catch (e) {
      setError(e.message || "Access Denied: Invalid Authentication Credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Animated Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" style={{animationDelay: '700ms'}} />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo / Title Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-6 transform hover:rotate-12 transition-transform duration-500">
            <FiShield className="h-10 w-10 text-white stroke-[2px]" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Anritvox<span className="text-cyan-400">OS</span>
          </h1>
          <p className="text-gray-500 font-medium uppercase tracking-[0.3em] text-[10px]">Secure Terminal Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f111a]/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs text-gray-500 font-medium uppercase tracking-[0.2em] mb-3">Identity Vector</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@anritvox.com"
                  value={credentials.email}
                  onChange={handleChange}
                  className="w-full bg-[#161b22]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs text-gray-500 font-medium uppercase tracking-[0.2em] mb-3">Access Protocol</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 h-4 w-4" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full bg-[#161b22]/50 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <FiAlertCircle className="text-red-400 h-4 w-4 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl hover:from-cyan-400 hover:to-purple-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FiRefreshCw className="animate-spin h-4 w-4" /> Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiShield className="h-4 w-4" /> INITIALIZE ACCESS
                </span>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 text-center">
            <p className="text-gray-700 text-xs">Request Hardware Key</p>
            <p className="text-gray-800 text-[10px] mt-4">© 2026 ANRITVOX SECURE SYSTEMS</p>
          </div>
        </div>
      </div>

      {/* Login Successful Notification */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f111a] border border-cyan-500/30 rounded-3xl p-10 text-center shadow-2xl">
            <div className="h-16 w-16 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiShield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Granted</h2>
            <p className="text-gray-400">Handshaking with terminal... redirecting</p>
          </div>
        </div>
      )}
    </div>
  );
}
