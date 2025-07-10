import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardOverview from "./admin/DashboardOverview";
import EWarrantyManagement from "./admin/EWarrantyManagement";
import CategoryManagement from "./admin/CategoryManagement";
import ProductManagement from "./admin/ProductManagement";

import {
  FiHome,
  FiFileText,
  FiFolder,
  FiBox,
  FiLogOut,
  FiMenu,
  FiX,
  FiKey,
} from "react-icons/fi";

export default function AdminDashboard() {
  const [section, setSection] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("ms_token");

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("ms_token");
    navigate("/admin/login");
  };

  const handleSectionChange = (sec) => {
    setSection(sec);
    setMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return <DashboardOverview token={token} />;
      case "ewarranty":
        return <EWarrantyManagement token={token} />;
      case "categories":
        return <CategoryManagement token={token} />;
      case "products":
        return <ProductManagement token={token} />;
      default:
        return <DashboardOverview token={token} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-inter antialiased overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-75 sm:hidden transition-opacity duration-300" // Dark overlay for contrast
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 p-6 flex flex-col justify-between
                  transform transition-transform duration-300 ease-in-out
                  ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                  sm:relative sm:translate-x-0 sm:flex sm:min-w-[16rem]`}
      >
        <div>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-extrabold text-lime-700 ">
              Admin<span className="text-gray-900">Panel</span>
            </h2>
            {/* Close button for mobile sidebar */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="sm:hidden text-gray-600 hover:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600 rounded-md p-1"
              aria-label="Close menu"
            >
              <FiX className="h-7 w-7" />
            </button>
          </div>

          <nav className="space-y-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: FiHome },
              { id: "ewarranty", label: "E-Warranty", icon: FiFileText },
              { id: "categories", label: "Categories", icon: FiFolder },
              { id: "products", label: "Products", icon: FiBox },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`flex items-center gap-3 w-full text-left px-5 py-3 rounded-xl transition-all duration-300 ease-in-out font-medium text-lg
                  ${
                    section === item.id
                      ? "bg-lime-700 text-white shadow-lg transform translate-x-1 hover:translate-x-2" // Olive green active state with subtle shift
                      : "text-gray-700 hover:bg-gray-100 hover:text-lime-700" // Lighter hover state
                  }`}
              >
                <item.icon className="h-6 w-6" />
                <span>{item.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                window.open(
                  "https://pranavkumar2601.github.io/serial-number-genrator/",
                  "_blank"
                );
              }}
              className={`flex items-center gap-3 w-full text-left px-5 py-3 rounded-xl transition-all duration-300 ease-in-out font-medium text-lg text-gray-700 hover:bg-gray-100 hover:text-lime-700`}
            >
              <FiKey className="h-6 w-6" />
              <span>Serial No. Generator</span>
            </button>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out mt-8"
        >
          <FiLogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 bg-gray-100 relative overflow-hidden">
        {/* Hamburger menu for mobile */}
        <div className="flex justify-end sm:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-gray-700 hover:text-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600 rounded-md p-1"
            aria-label="Open menu"
          >
            <FiMenu className="h-8 w-8" />
          </button>
        </div>

        {/* Background gradient circles for visual flair */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-lime-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-lime-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-lime-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content of the active section */}
        <div className="relative z-10 animate-fade-in">{renderSection()}</div>
      </main>

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
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.0, 0.99);
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
