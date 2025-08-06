import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/api";
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from "react-icons/fi";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // NEW: State to track if the email input has been focused
  const [isEmailFocused, setIsEmailFocused] = useState(false);

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
        navigate("/admin/dashboard", {
          state: { from: "login", animation: "slide-left" },
        });
      }, 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const commonInputClasses =
    "mt-1 w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm hover:shadow-md group";

  const commonButtonClasses =
    "w-full bg-lime-700 hover:bg-lime-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 font-inter antialiased py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-lime-50 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 p-10 space-y-8 animate-fade-in relative z-10">
        {/* Header with enhanced styling */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-lime-600 to-lime-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <FiUser className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Welcome to <span className="text-lime-700">Anritvox</span>
          </h2>
          <p className="text-gray-500 font-medium">Admin Portal Access</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          {/* Enhanced Email Input */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
              </div>
              <input
                id="email"
                name="email"
                type={isEmailFocused ? "email" : "text"}
                required
                value={credentials.email}
                onChange={handleChange}
                className={commonInputClasses}
                disabled={loading}
                autoComplete="off"
                placeholder="Enter your admin email"
                onFocus={() => setIsEmailFocused(true)}
              />
              {/* Input focus ring enhancement */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-lime-600/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10"></div>
            </div>
          </div>

          {/* Enhanced Password Input with Show/Hide */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={credentials.password}
                onChange={handleChange}
                className={commonInputClasses}
                disabled={loading}
                placeholder="Enter your password"
                autoComplete="new-password"
              />
              {/* Show/Hide Password Button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-gray-100 rounded-r-lg px-2 transition-colors duration-200"
                disabled={loading}
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
              {/* Input focus ring enhancement */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-lime-600/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10"></div>
            </div>
          </div>

          {/* Error message with enhanced styling */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center animate-fade-in flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Enhanced Submit Button */}
          <div>
            <button
              type="submit"
              className={commonButtonClasses}
              disabled={loading || !credentials.email || !credentials.password}
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-lime-800 to-green-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>

              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <FiUser className="h-5 w-5" />
                    Sign In to Dashboard
                  </>
                )}
              </span>

              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
            </button>
          </div>
        </form>
      </div>

      {/* Enhanced Success Notification */}
      {showNotification && (
        <div className="fixed bottom-8 right-8 bg-gradient-to-r from-lime-700 to-green-700 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-slide-in backdrop-blur-xl border border-lime-600/50">
          <div className="relative">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
          </div>
          <div>
            <p className="font-bold">Login Successful!</p>
            <p className="text-sm opacity-90">Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      {/* Enhanced Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-3d-container-fullpage">
            <div className="spinner-3d-inner-fullpage"></div>
          </div>
          <p className="loading-text">Authenticating...</p>
          <div className="loading-progress">
            <div className="loading-progress-bar"></div>
          </div>
        </div>
      )}

      <style>{`
         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
         .font-inter { font-family: 'Inter', sans-serif; }
         
         @keyframes fadeIn { 
           from { opacity: 0; transform: translateY(20px); } 
           to { opacity: 1; transform: translateY(0); } 
         }
         .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
         
         @keyframes slideIn { 
           from { transform: translateX(100%) translateY(20px); opacity: 0; } 
           to { transform: translateX(0) translateY(0); opacity: 1; } 
         }
         .animate-slide-in { animation: slideIn 0.6s ease-out forwards; }
         
         @keyframes blob {
           0% { transform: translate(0px, 0px) scale(1); }
           33% { transform: translate(30px, -50px) scale(1.1); }
           66% { transform: translate(-20px, 20px) scale(0.9); }
           100% { transform: translate(0px, 0px) scale(1); }
         }
         .animate-blob { animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.0, 0.99); }
         .animation-delay-2000 { animation-delay: 2s; }
         .animation-delay-4000 { animation-delay: 4s; }
         
         .loading-overlay { 
           position: fixed; 
           top: 0; 
           left: 0; 
           width: 100vw; 
           height: 100vh; 
           background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
           display: flex; 
           flex-direction: column; 
           align-items: center; 
           justify-content: center; 
           z-index: 9999; 
           backdrop-filter: blur(8px); 
           -webkit-backdrop-filter: blur(8px); 
           animation: overlayFadeIn 0.4s ease-out forwards; 
         }
         
         @keyframes overlayFadeIn { 
           from { opacity: 0; backdrop-filter: blur(0px); } 
           to { opacity: 1; backdrop-filter: blur(8px); } 
         }
         
         .loading-text { 
           color: white; 
           margin-top: 2rem; 
           font-size: 1.5rem; 
           font-weight: 700; 
           text-align: center;
         }
         
         .loading-progress {
           width: 200px;
           height: 4px;
           background: rgba(255, 255, 255, 0.2);
           border-radius: 2px;
           margin-top: 1rem;
           overflow: hidden;
         }
         
         .loading-progress-bar {
           width: 100%;
           height: 100%;
           background: linear-gradient(90deg, #65a30d, #84cc16);
           border-radius: 2px;
           animation: loadingBar 2s ease-in-out infinite;
         }
         
         @keyframes loadingBar {
           0% { transform: translateX(-100%); }
           50% { transform: translateX(0%); }
           100% { transform: translateX(100%); }
         }
         
         .spinner-3d-container-fullpage { 
           width: 80px; 
           height: 80px; 
           perspective: 200px; 
           display: flex; 
           align-items: center; 
           justify-content: center; 
         }
         
         .spinner-3d-inner-fullpage { 
           width: 60px; 
           height: 60px; 
           position: relative; 
           transform-style: preserve-3d; 
           animation: rotate3dCube 3s infinite ease-in-out; 
         }
         
         .spinner-3d-inner-fullpage::before, .spinner-3d-inner-fullpage::after { 
           content: ''; 
           position: absolute; 
           width: 100%; 
           height: 100%; 
           border: 4px solid #84cc16; 
           border-radius: 8px;
           box-sizing: border-box; 
           opacity: 0.9; 
         }
         
         .spinner-3d-inner-fullpage::before { 
           transform: rotateY(0deg) translateZ(30px); 
           animation: spin3dFront 3s infinite ease-in-out; 
         }
         
         .spinner-3d-inner-fullpage::after { 
           transform: rotateY(90deg) translateZ(30px); 
           animation: spin3dSide 3s infinite ease-in-out; 
         }
         
         @keyframes rotate3dCube { 
           0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); } 
           25% { transform: rotateX(90deg) rotateY(45deg) rotateZ(0deg); } 
           50% { transform: rotateX(180deg) rotateY(90deg) rotateZ(180deg); } 
           75% { transform: rotateX(270deg) rotateY(135deg) rotateZ(270deg); } 
           100% { transform: rotateX(360deg) rotateY(180deg) rotateZ(360deg); } 
         }
         
         @keyframes spin3dFront { 
           0%, 100% { transform: rotateY(0deg) translateZ(30px); } 
           50% { transform: rotateY(180deg) translateZ(30px); } 
         }
         
         @keyframes spin3dSide { 
           0%, 100% { transform: rotateY(90deg) translateZ(30px); } 
           50% { transform: rotateY(270deg) translateZ(30px); } 
         }
       `}</style>
    </div>
  );
}
