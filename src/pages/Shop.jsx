// src/pages/Shop.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <p className="text-xl animate-pulse">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-600">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  // 1) Filter by search
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2) Pagination calculations
  const totalPages = Math.ceil(filtered.length / productsPerPage);
  const idxLastProduct = currentPage * productsPerPage;
  const idxFirstProduct = idxLastProduct - productsPerPage;
  const currentProducts = filtered.slice(idxFirstProduct, idxLastProduct);

  const paginate = (page) => setCurrentPage(page);

  // 3) Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxButtons = 5;
    let start = 1,
      end = totalPages;

    if (totalPages > maxButtons) {
      const half = Math.floor(maxButtons / 2);
      if (currentPage <= half) {
        end = maxButtons;
      } else if (currentPage + half >= totalPages) {
        start = totalPages - maxButtons + 1;
      } else {
        start = currentPage - half;
        end = currentPage + half;
      }
    }

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <nav className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => paginate(1)}
              className="px-4 py-2 text-sm rounded-md bg-white border text-gray-700"
            >
              1
            </button>
            {start > 2 && <span className="text-gray-700">…</span>}
          </>
        )}

        {pages.map((num) => (
          <button
            key={num}
            onClick={() => paginate(num)}
            className={`px-4 py-2 text-sm rounded-md ${
              num === currentPage
                ? "bg-lime-600 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {num}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-700">…</span>}
            <button
              onClick={() => paginate(totalPages)}
              className="px-4 py-2 text-sm rounded-md bg-white border text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-inter antialiased">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-gray-900">
        Explore Our <span className="text-lime-700">Products</span>
      </h2>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24">
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 focus:border-lime-600 focus:ring-lime-600 rounded-full shadow-sm transition duration-200"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {currentProducts.length > 0 ? (
          currentProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-lg border hover:border-lime-600 transition transform hover:-translate-y-2 duration-300 group overflow-hidden"
            >
              <Link to={`/shop/${p.id}`}>
                <img
                  src={
                    p.images?.[0] ||
                    "https://placehold.co/600x400/E0E0E0/888888?text=No+Image"
                  }
                  alt={p.name}
                  className="w-full h-48 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400/E0E0E0/888888?text=Image+Not+Found";
                  }}
                />
              </Link>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {p.name}
                </h3>
                <p className="mt-1 text-lime-700 font-bold text-2xl">
                  ₹{(+p.price).toFixed(2)}
                </p>
                <Link
                  to={`/shop/${p.id}`}
                  className="mt-6 inline-block bg-lime-700 hover:bg-lime-800 text-white font-semibold py-2 px-6 rounded-full shadow transition transform hover:scale-105 duration-300 text-sm"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-600">
            No products found matching "{searchTerm}".
          </p>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5}}
        .animate-pulse { animation: pulse 1.5s infinite; }
      `}</style>
    </div>
  );
}
