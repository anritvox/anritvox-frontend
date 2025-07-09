import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/api";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
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

      // Delay navigation to allow notification to be seen
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

  const commonInputClasses =
    "mt-1 w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm";
  const commonButtonClasses =
    "w-full bg-lime-700 hover:bg-lime-800 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"; // No longer need flex/justify-center here, spinner is in overlay

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
              className="block text-sm font-medium text-gray-700 mb-1"
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
              disabled={loading} // Disable input while loading
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              disabled={loading} // Disable input while loading
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm text-center animate-fade-in">
              {error}
            </p>
          )}
          <div>
            <button
              type="submit"
              className={commonButtonClasses}
              disabled={loading || !credentials.email || !credentials.password}
            >
              Sign In
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

      {/* Full-page Loading Overlay with Blur and Spinner */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-3d-container-fullpage">
            <div className="spinner-3d-inner-fullpage"></div>
          </div>
          <p className="loading-text">Authenticating...</p>
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

        /* Full-page Loading Overlay */
        .loading-overlay {
          position: fixed; /* Fixed to cover the whole viewport */
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.4); /* Semi-transparent dark background */
          display: flex;
          flex-direction: column; /* Stack spinner and text vertically */
          align-items: center;
          justify-content: center;
          z-index: 9999; /* High z-index to be on top of everything */
          backdrop-filter: blur(5px); /* Apply blur to the content behind */
          -webkit-backdrop-filter: blur(5px); /* For Safari support */
          animation: overlayFadeIn 0.3s ease-out forwards;
        }

        @keyframes overlayFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .loading-text {
            color: white;
            margin-top: 1rem;
            font-size: 1.25rem; /* text-xl */
            font-weight: 600; /* semi-bold */
        }

        /* 3D Spinner Styles for Fullpage Overlay */
        .spinner-3d-container-fullpage {
          width: 60px; /* Larger size for the full-page spinner */
          height: 60px;
          perspective: 150px; /* Adjust perspective for larger size */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-3d-inner-fullpage {
          width: 40px; /* Size of the inner cube/shape */
          height: 40px;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate3dCube 2.5s infinite ease-in-out; /* Main rotation animation, slightly slower */
        }

        .spinner-3d-inner-fullpage::before,
        .spinner-3d-inner-fullpage::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid white; /* Thicker white borders */
          box-sizing: border-box;
          opacity: 0.8;
        }

        .spinner-3d-inner-fullpage::before {
          transform: rotateY(0deg) translateZ(20px); /* Front face (half of inner size) */
          animation: spin3dFront 2.5s infinite ease-in-out;
        }

        .spinner-3d-inner-fullpage::after {
          transform: rotateY(90deg) translateZ(20px); /* Side face - rotated */
          animation: spin3dSide 2.5s infinite ease-in-out;
        }

        /* Keyframes remain the same, but you might adjust animation durations for the larger spinner */
        @keyframes rotate3dCube {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          25% { transform: rotateX(90deg) rotateY(45deg) rotateZ(0deg); }
          50% { transform: rotateX(180deg) rotateY(90deg) rotateZ(180deg); }
          75% { transform: rotateX(270deg) rotateY(135deg) rotateZ(270deg); }
          100% { transform: rotateX(360deg) rotateY(180deg) rotateZ(360deg); }
        }

        @keyframes spin3dFront {
            0%, 100% { transform: rotateY(0deg) translateZ(20px); }
            50% { transform: rotateY(180deg) translateZ(20px); }
        }

        @keyframes spin3dSide {
            0%, 100% { transform: rotateY(90deg) translateZ(20px); }
            50% { transform: rotateY(270deg) translateZ(20px); }
        }
      `}</style>
    </div>
  );
}
