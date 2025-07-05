import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/api"; // Keep existing import

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false); // New state for notification
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
      setShowNotification(true); // Show notification on success

      // Delay navigation to allow notification to be seen
      setTimeout(() => {
        navigate("/admin/dashboard", {
          state: { from: "login", animation: "slide-left" },
        }); // Pass animation type
      }, 1500); // Wait for 1.5 seconds before navigating
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Common Tailwind CSS classes for inputs and buttons (adapted for white theme)
  const commonInputClasses =
    "mt-1 w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm";
  const commonButtonClasses =
    "w-full bg-lime-700 hover:bg-lime-800 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    // Main container with white background and Inter font
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 font-inter antialiased py-12 px-4 sm:px-6 lg:px-8">
      {/* Login Form Card */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6 animate-fade-in">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          <span className="text-lime-700">Admin</span> Login
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1" // Adjusted text color for white background
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={credentials.email}
              onChange={handleChange}
              className={commonInputClasses}
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1" // Adjusted text color for white background
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className={commonInputClasses}
              disabled={loading}
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm text-center animate-fade-in">
              {" "}
              {/* Adjusted text color for contrast */}
              {error}
            </p>
          )}
          <div>
            <button
              type="submit"
              className={commonButtonClasses}
              disabled={loading || !credentials.email || !credentials.password} // Disable if fields are empty or loading
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-lime-700 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
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
          <span>Login Successful! Redirecting...</span>
        </div>
      )}

      {/* Tailwind CSS custom animations and font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        /* Slide-in animation for notification */
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out forwards;
        }

        /* Page transition animation (will need to be applied on the destination component if using a router's state for transitions) */
        @keyframes slideOutLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .page-slide-out-left {
          animation: slideOutLeft 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
