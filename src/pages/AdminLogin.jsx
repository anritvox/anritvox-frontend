import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff, FiAlertCircle, FiLock, FiMail, FiShield, FiRefreshCw } from "react-icons/fi";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Use AuthContext.login() so user state is set correctly - fixes the double redirect bug
      const user = await login(credentials);
      if (!user || user.role !== "admin") {
        // Not an admin - clear auth and show error
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Access Denied: Admin privileges required.");
        setLoading(false);
        return;
      }
      setShowNotification(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
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
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Admin Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/60 h-4 w-4" />
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@anritvox.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/60 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors">
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <FiAlertCircle className="text-red-400 h-5 w-5 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success */}
            {showNotification && (
              <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <FiShield className="text-green-400 h-5 w-5 flex-shrink-0" />
                <p className="text-green-400 text-sm">Access Granted! Redirecting...</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiShield className="h-4 w-4" />}
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">
          Anritvox Admin Terminal &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
