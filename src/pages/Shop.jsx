import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
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

  // Reset page when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, sortOption]);

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

  // Derive filter options
  const categoryOptions = Array.from(
    new Set(products.map((p) => p.category_name).filter(Boolean))
  );
  const subcategoryOptions = Array.from(
    new Set(
      products
        .filter((p) =>
          selectedCategory ? p.category_name === selectedCategory : true
        )
        .map((p) => p.subcategory_name)
        .filter(Boolean)
    )
  );

  // 1) Filter by search, category, subcategory
  let filtered = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) =>
      selectedCategory ? p.category_name === selectedCategory : true
    )
    .filter((p) =>
      selectedSubcategory ? p.subcategory_name === selectedSubcategory : true
    );

  // 2) Sort
  if (sortOption === "priceAsc") {
    filtered = filtered.sort((a, b) => a.price - b.price);
  } else if (sortOption === "priceDesc") {
    filtered = filtered.sort((a, b) => b.price - a.price);
  }

  // 3) Pagination
  const totalPages = Math.ceil(filtered.length / productsPerPage);
  const idxLast = currentPage * productsPerPage;
  const idxFirst = idxLast - productsPerPage;
  const currentProducts = filtered.slice(idxFirst, idxLast);

  const paginate = (page) => setCurrentPage(page);

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxButtons = 5;
    let start = 1,
      end = totalPages;
    if (totalPages > maxButtons) {
      const half = Math.floor(maxButtons / 2);
      if (currentPage <= half) end = maxButtons;
      else if (currentPage + half >= totalPages)
        start = totalPages - maxButtons + 1;
      else {
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
          className="px-3 py-1 text-sm rounded bg-white border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          ‹ Prev
        </button>
        {start > 1 && (
          <>
            <button
              onClick={() => paginate(1)}
              className="px-3 py-1 text-sm rounded bg-white border"
            >
              1
            </button>
            {start > 2 && <span className="px-1">…</span>}
          </>
        )}
        {pages.map((num) => (
          <button
            key={num}
            onClick={() => paginate(num)}
            className={`px-3 py-1 text-sm rounded ${
              num === currentPage
                ? "bg-lime-600 text-white"
                : "bg-white border text-gray-700 hover:bg-gray-50"
            }`}
          >
            {num}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1">…</span>}
            <button
              onClick={() => paginate(totalPages)}
              className="px-3 py-1 text-sm rounded bg-white border"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm rounded bg-white border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next ›
        </button>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      {/* <h2 className="text-4xl md:text-5xl font-bold text-center mb-8">
        Explore Our <span className="text-lime-700">Products</span>
      </h2> */}

      {/* Search + Filter/Sort Bar */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-1/2">
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
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:border-lime-600 focus:ring-lime-600 transition duration-200"
          />
        </div>

        {/* Filter & Sort */}
        <div className="w-full md:w-auto flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory("");
            }}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCategory}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50"
          >
            <option value="">All Subcategories</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {currentProducts.length > 0 ? (
          currentProducts.map((p) => (
            <div
              key={`${p.id}-${p.displaySerial}`}
              className="bg-white rounded-2xl shadow-lg border hover:border-lime-600 transition transform hover:-translate-y-1 duration-200 group overflow-hidden"
            >
              <Link to={`/shop/${p.id}`}>
                <img
                  src={
                    p.images?.[0] ||
                    "https://placehold.co/600x400/E0E0E0/888888?text=No+Image"
                  }
                  alt={p.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/600x400/E0E0E0/888888?text=Image+Not+Found";
                  }}
                />
              </Link>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
                <p className="text-lime-700 font-bold text-2xl">
                  ₹{Number(p.price).toFixed(2)}
                </p>
                <Link
                  to={`/shop/${p.id}`}
                  className="mt-4 inline-block bg-lime-700 hover:bg-lime-800 text-white font-semibold py-2 px-5 rounded-full text-sm transition transform hover:scale-105"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            No products found.
          </p>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      `}</style>
    </div>
  );
}
