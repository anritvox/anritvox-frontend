import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-inter antialiased overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img
                  src={logo}
                  alt="Anritvox Logo"
                  className="h-12 w-auto transition-all duration-300 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-lime-400 rounded-lg blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Anritvox</h3>
                <p className="text-xs text-lime-400 font-medium tracking-wider">
                  CAR ELECTRONICS
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">
              Transform your driving experience with our premium car
              electronics. From cutting-edge infotainment systems to advanced
              audio solutions, we deliver innovation that keeps you connected,
              entertained, and in control on every journey.
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.347-1.051-2.347-2.347s1.051-2.347 2.347-2.347 2.347 1.051 2.347 2.347-1.05 2.347-2.347 2.347zm7.718 0c-1.297 0-2.347-1.051-2.347-2.347s1.051-2.347 2.347-2.347 2.347 1.051 2.347 2.347-1.05 2.347-2.347 2.347z" />
                  <path d="M12 8.877c-1.711 0-3.102 1.39-3.102 3.101s1.39 3.101 3.102 3.101 3.101-1.39 3.101-3.101-1.39-3.101-3.101-3.101z" />
                  <path d="M18.406 6.594h-1.25c-.345 0-.625-.28-.625-.625V4.719c0-.345.28-.625.625-.625h1.25c.345 0 .625.28.625.625V5.97c0 .345-.28.624-.625.624z" />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-xl flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg"
                aria-label="YouTube"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-lime-400 to-green-400 rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Shop Products", path: "/shop" },
                { name: "E-Warranty", path: "/ewarranty" },
                { name: "Contact Us", path: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-gray-300 hover:text-lime-400 transition-all duration-300 ease-in-out"
                  >
                    <svg
                      className="w-4 h-4 text-lime-500 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-lime-400 to-green-400 rounded-full"></span>
              Contact Info
            </h4>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="group flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-lime-600/20 rounded-lg flex items-center justify-center group-hover:bg-lime-600/30 transition-colors duration-300">
                  <svg
                    className="w-4 h-4 text-lime-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email Us</p>
                  <a
                    href="mailto:Anritvox@gmail.com"
                    className="text-sm text-lime-400 hover:text-lime-300 transition-colors duration-300 font-medium"
                  >
                    Anritvox@gmail.com
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-lime-600/20 rounded-lg flex items-center justify-center group-hover:bg-lime-600/30 transition-colors duration-300">
                  <svg
                    className="w-4 h-4 text-lime-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Call Us</p>
                  <a
                    href="tel:+919876543210"
                    className="text-sm text-lime-400 hover:text-lime-300 transition-colors duration-300 font-medium"
                  >
                    +91 96541 31435
                  </a>
                </div>
              </div>

              <div className="group flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-lime-600/20 rounded-lg flex items-center justify-center group-hover:bg-lime-600/30 transition-colors duration-300">
                  <svg
                    className="w-4 h-4 text-lime-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Visit Us</p>
                  <p className="text-sm text-gray-300">
                    123, Main Street
                    <br />
                    New Delhi, India 110001
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-400">
              <p>© {currentYear} Anritvox. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link
                  to="/privacy"
                  className="hover:text-lime-400 transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
                <span className="text-gray-600">•</span>
                <Link
                  to="/terms"
                  className="hover:text-lime-400 transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </div>
            </div>

            {/* Developer Credit */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Developed</span>

              <span>by Pranav Kumar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        .font-inter {
          font-family: "Inter", sans-serif;
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0, 0.99);
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        /* Hover effects */
        @media (hover: hover) {
          .group:hover .group-hover\:scale-110 {
            transform: scale(1.1);
          }

          .group:hover .group-hover\:translate-x-1 {
            transform: translateX(0.25rem);
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #84cc16, #22c55e);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #65a30d, #16a34a);
        }
      `}</style>
    </footer>
  );
}
