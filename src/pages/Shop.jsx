import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import {
  Star,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Filter,
  LayoutGrid,
  List,
  Search,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [sortOption, setSortOption] = useState("Featured");
  const [viewType, setViewType] = useState("grid");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter options
  const categories = ["All", "Interior", "Exterior", "Accessories", "Performance", "Electronics"];
  const priceRanges = ["All", "Under \u20b91,000", "\u20b91,000 - \u20b95,000", "\u20b95,000 - \u20b910,000", "Over \u20b910,000"];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    let matchesPrice = true;
    if (priceRange === "Under \u20b91,000") matchesPrice = product.price < 1000;
    else if (priceRange === "\u20b91,000 - \u20b95,000") matchesPrice = product.price >= 1000 && product.price <= 5000;
    else if (priceRange === "\u20b95,000 - \u20b910,000") matchesPrice = product.price >= 5000 && product.price <= 10000;
    else if (priceRange === "Over \u20b910,000") matchesPrice = product.price > 10000;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "Price: Low to High") return a.price - b.price;
    if (sortOption === "Price: High to Low") return b.price - a.price;
    return 0; // Featured
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-[#c45500] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans">
      {/* Top Results Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-700">
          <span className="font-bold">1-{sortedProducts.length}</span> of{" "}
          <span className="font-bold">{sortedProducts.length}</span> results for{" "}
          <span className="text-[#c45500] font-bold">"{searchTerm || "All Products"}"</span>
        </span>
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-sm text-sm bg-white hover:bg-gray-50"
          >
            Sort by: <span className="font-bold">{sortOption}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg z-10 rounded-sm">
              {["Featured", "Price: Low to High", "Price: High to Low", "Avg. Customer Review"].map(option => (
                <button
                  key={option}
                  onClick={() => { setSortOption(option); setShowSortDropdown(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
        {/* Left Sidebar Filters */}
        <aside className="w-56 shrink-0">
          <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-6">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#c45500]"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="font-bold text-sm text-[#0F1111] mb-3 border-b pb-2">Category</h3>
              <ul className="space-y-1.5">
                {categories.map(cat => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-sm hover:text-[#c45500] ${selectedCategory === cat ? 'font-bold text-[#c45500]' : 'text-[#0F1111]'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="font-bold text-sm text-[#0F1111] mb-3 border-b pb-2">Price</h3>
              <ul className="space-y-1.5">
                {priceRanges.map(range => (
                  <li key={range}>
                    <button
                      onClick={() => setPriceRange(range)}
                      className={`text-sm hover:text-[#c45500] ${priceRange === range ? 'font-bold text-[#c45500]' : 'text-[#0F1111]'}`}
                    >
                      {range}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <h2 className="text-2xl font-bold text-[#0F1111] mb-4">Results</h2>

          {error && (
            <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded">{error}</div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedProducts.map((product) => (
              <Link
                key={product._id || product.id}
                to={`/product/${product._id || product.id}`}
                className="bg-white border border-gray-200 rounded-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Badges */}
                {product.mrp > product.price && (
                  <div className="px-2 pt-2">
                    <span className="text-xs bg-[#c45500] text-white px-1.5 py-0.5 rounded-sm font-bold">Limited time deal</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-2">
                  <p className="text-sm text-[#0F1111] font-medium line-clamp-2 mb-1">{product.name}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-[#f3a847] text-[#f3a847]' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-xs text-[#007185] ml-1">426</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs align-top mt-1">\u20b9</span>
                    <span className="text-xl font-bold text-[#0F1111]">{product.price?.toLocaleString()}</span>
                  </div>

                  {product.mrp > product.price && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      M.R.P: <span className="line-through">\u20b9{product.mrp?.toLocaleString()}</span>{" "}
                      <span className="text-[#c45500] font-medium">({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off)</span>
                    </p>
                  )}

                  {/* Delivery */}
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-bold">FREE delivery</span> by <span className="font-bold">Tomorrow</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-gray-700">No results found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
