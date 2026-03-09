import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/api";
import { FiEye, FiEyeOff, FiAlertCircle, FiLock, FiMail } from "react-icons/fi";
import { Loader2, Shield } from "lucide-react";

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
      const { token } = await loginAdmin(credentials);
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
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse delay-700" />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo / Title Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-[2rem] shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-6 transform hover:rotate-12 transition-transform duration-500">
            <Shield className="h-10 w-10 text-black stroke-[2.5px]" />
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
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Identity Vector</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
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
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Access Protocol</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
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
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 animate-shake">
                <FiAlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 hover:bg-cyan-300 disabled:bg-gray-800 text-black font-black py-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden relative group"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <span>INITIALIZE ACCESS</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <button className="text-[10px] font-black text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
              Request Hardware Key
            </button>
            <div className="text-[10px] text-gray-600 font-medium">
              &copy; 2026 ANRITVOX SECURE SYSTEMS
            </div>
          </div>
        </div>
      </div>

      {/* Login Successful Notification */}
      {showNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0b10]/80 backdrop-blur-sm px-6">
          <div className="bg-[#0f111a] border border-cyan-400/50 rounded-[2.5rem] p-12 text-center shadow-[0_0_50px_rgba(34,211,238,0.2)] animate-scale-in">
            <div className="h-20 w-20 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
              <Shield className="h-10 w-10 text-black" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Access Granted</h2>
            <p className="text-gray-500 font-mono text-xs">Handshaking with terminal... redirecting</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
