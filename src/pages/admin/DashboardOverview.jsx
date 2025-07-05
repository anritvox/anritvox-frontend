import React, { useState, useEffect } from "react";
import Card from "../../components/Card"; // Import the new Card component
import {
  fetchWarrantyAdmin,
  fetchCategories,
  fetchProductsAdmin,
} from "../../services/api";

export default function DashboardOverview({ token }) {
  const [reqCount, setReqCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [prodCount, setProdCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [warrantyData, categoryData, productData] = await Promise.all([
          fetchWarrantyAdmin(token),
          fetchCategories(token),
          fetchProductsAdmin(token),
        ]);
        setReqCount(warrantyData.length);
        setCatCount(categoryData.length);
        setProdCount(productData.length);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later."); // More user-friendly error
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // --- Loading and Error States ---
  if (loading)
    return (
      <div className="text-center py-12 text-gray-700">
        <p className="text-2xl font-semibold animate-pulse">
          Loading dashboard data...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg border border-red-200 shadow-md">
        <p className="text-xl font-medium mb-4">{error}</p>
        <button
          onClick={() => {
            // Optional: Add a retry mechanism
            setError(null);
            setLoading(true);
            // Calling fetchData directly might lead to infinite loops if error persists
            // For production, consider debouncing or limiting retries
            // For now, simply indicating the error. User can refresh page.
          }}
          className="px-6 py-2 bg-lime-600 text-white rounded-md shadow-sm hover:bg-lime-700 transition-colors"
        >
          Dismiss Error
        </button>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
        Dashboard <span className="text-lime-700">Overview</span>
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {" "}
        {/* Adjusted gap */}
        <Card title="Warranty Requests" count={reqCount} />
        <Card title="Categories" count={catCount} />
        <Card title="Products" count={prodCount} />
      </div>

      {/* Tailwind CSS custom animations and font import (moved to a global CSS file or layout component for better practice) */}
      {/* Keeping it here for direct example, but typically these belong elsewhere */}
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
