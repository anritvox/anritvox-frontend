import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/api";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import logo from "../assets/images/logo.webp";

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
      setError(e.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10 px-4 font-sans text-[#0f1111] animate-fade-in text-left">
      {/* Amazon Logo Header */}
      <div className="mb-6 flex flex-col items-center">
        <img src={logo} alt="Anritvox Logo" className="h-10 mb-1" />
        <span className="text-[13px] font-bold text-[#c45500]">Admin Central</span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[350px] border border-gray-300 rounded-lg p-6 shadow-sm mb-6 bg-white">
        <h1 className="text-[28px] font-normal mb-4">Sign in</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-[13px] font-bold pl-0.5">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-400 rounded-sm focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-[13px] transition-all"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center pr-0.5">
              <label htmlFor="password" className="block text-[13px] font-bold pl-0.5">
                Password
              </label>
              <button type="button" className="text-xs text-[#0066c0] hover:text-[#c45500] hover:underline">
                Forgot your password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={credentials.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-400 rounded-sm focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none text-[13px] transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 border border-red-400 bg-white rounded text-[#c40000] text-sm shadow-sm">
              <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} />
              <div>
                <span className="font-bold">There was a problem</span>
                <p className="text-[12px] mt-1">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-[#f7dfa1] to-[#f0c14b] border border-[#a88734] border-b-[#9c7e31] hover:from-[#f5d181] hover:to-[#edb92e] active:from-[#f0c14b] active:to-[#f0c14b] py-1.5 rounded-sm shadow-sm text-[13px] font-normal text-[#111] transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <p className="text-[12px] mt-4 leading-tight text-gray-600">
          By signing in, you agree to Anritvox's <span className="text-[#0066c0] hover:text-[#c45500] hover:underline cursor-pointer">Conditions of Use</span> and <span className="text-[#0066c0] hover:text-[#c45500] hover:underline cursor-pointer">Privacy Notice</span>.
        </p>
      </div>

      <div className="w-full max-w-[350px] flex items-center gap-2 mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-[12px] text-gray-500 whitespace-nowrap">New to Anritvox?</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <button className="w-full max-w-[350px] bg-gradient-to-b from-[#f7f8fa] to-[#e7e9ec] border border-[#adb1b8] border-b-[#a2a6ac] hover:from-[#e7eaf0] hover:to-[#d8dbe0] py-1.5 rounded-sm shadow-sm text-[13px] font-normal text-[#111] transition-all">
        Create your Anritvox account
      </button>

      <div className="mt-8 w-full border-t border-gray-200 pt-6 text-center">
        <div className="flex justify-center gap-6 text-[11px] text-[#0066c0] mb-3">
          <span className="hover:text-[#c45500] hover:underline cursor-pointer">Conditions of Use</span>
          <span className="hover:text-[#c45500] hover:underline cursor-pointer">Privacy Notice</span>
          <span className="hover:text-[#c45500] hover:underline cursor-pointer">Help</span>
        </div>
        <p className="text-[11px] text-gray-500">
          © 2024, Anritvox.com, Inc. or its affiliates
        </p>
      </div>

      {showNotification && (
        <div className="fixed top-4 right-4 bg-white border-l-4 border-green-500 shadow-xl p-4 animate-slide-in z-50">
          <p className="font-bold text-sm text-green-700">Login Successful!</p>
          <p className="text-xs text-gray-500">Redirecting to dashboard...</p>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
