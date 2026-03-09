import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { Star, ChevronDown, ChevronRight, ChevronLeft, Filter, LayoutGrid, List, Search, Check, ShoppingCart } from "lucide-react";
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
  const [addedToCart, setAddedToCart] = useState({});

  const categories = ["All", "Interior", "Exterior", "Accessories", "Performance", "Electronics"];
  const priceRanges = ["All", "Under ₹1,000", "₹1,000 - ₹5,000", "₹5,000 - ₹10,000", "Over ₹10,000"];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    let matchesPrice = true;
    if (priceRange === "Under ₹1,000") matchesPrice = product.price < 1000;
    else if (priceRange === "₹1,000 - ₹5,000") matchesPrice = product.price >= 1000 && product.price <= 5000;
    else if (priceRange === "₹5,000 - ₹10,000") matchesPrice = product.price >= 5000 && product.price <= 10000;
    else if (priceRange === "Over ₹10,000") matchesPrice = product.price > 10000;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "Price: Low to High") return a.price - b.price;
    if (sortOption === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  const handleAddToCart = (productId) => {
    setAddedToCart(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [productId]: false })), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#39d353] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f2]">

      {/* Top Results Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#0F1111]">
          Showing <strong>{sortedProducts.length}</strong> results
          {searchTerm && <> for <strong>"{searchTerm}"</strong></>}
        </p>
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-sm text-sm bg-white hover:bg-gray-50"
          >
            Sort by: <strong>{sortOption}</strong> <ChevronDown className="h-4 w-4" />
          </button>
          {showSortDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 w-48">
              {["Featured", "Price: Low to High", "Price: High to Low", "Avg. Customer Review"].map(option => (
                <button
                  key={option}
                  onClick={() => { setSortOption(option); setShowSortDropdown(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs flex items-center gap-2"
                >
                  {sortOption === option && <Check className="h-3 w-3 text-[#39d353]" />}
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex">

        {/* Left Sidebar Filters */}
        <aside className="hidden md:block w-60 bg-white border-r border-gray-200 p-4 min-h-screen">

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-[#39d353]"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-[#0F1111] mb-3 border-b pb-2">Category</h3>
            <ul className="space-y-1">
              {categories.map(cat => (
                <li key={cat}>
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left text-sm py-1 px-2 rounded hover:bg-[#39d353]/10 ${
                      selectedCategory === cat ? "font-bold text-[#1a7a2e] bg-[#39d353]/10" : "text-[#0F1111]"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-[#0F1111] mb-3 border-b pb-2">Price</h3>
            <ul className="space-y-1">
              {priceRanges.map(range => (
                <li key={range}>
                  <button
                    onClick={() => setPriceRange(range)}
                    className={`w-full text-left text-sm py-1 px-2 rounded hover:bg-[#39d353]/10 ${
                      priceRange === range ? "font-bold text-[#1a7a2e] bg-[#39d353]/10" : "text-[#0F1111]"
                    }`}
                  >
                    {range}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Product Area */}
        <main className="flex-1 p-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Filter className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setPriceRange("All"); }}
                className="mt-4 bg-[#39d353] text-black font-bold px-6 py-2 rounded-full text-sm hover:bg-[#2cb544] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={viewType === "grid" ?
              "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" :
              "flex flex-col gap-4"
            }>
              {sortedProducts.map((product) => (
                <motion.div
                  key={product._id || product.id}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden"
                >
                  <Link to={`/shop/${product._id || product.id}`}>
                    {/* Product Image */}
                    <div className="h-48 overflow-hidden flex items-center justify-center bg-gray-50 relative">
                      <img
                        src={product.image || product.images?.[0]}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/200x200?text=No+Image"; }}
                      />
                      {product.mrp > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                          {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-[#0F1111] line-clamp-2 mb-1">{product.name}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${
                            i < 4 ? "fill-[#FFA500] text-[#FFA500]" : "text-gray-300"
                          }`} />
                        ))}
                        <span className="text-xs text-[#007185] ml-1">426</span>
                      </div>

                      {/* Price */}
                      <div className="mb-2">
                        <span className="text-lg font-bold text-[#0F1111]">
                          ₹{product.price?.toLocaleString("en-IN")}
                        </span>
                        {product.mrp > product.price && (
                          <p className="text-xs text-gray-500">
                            M.R.P: <span className="line-through">₹{product.mrp?.toLocaleString("en-IN")}</span>
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-[#007600] font-medium">FREE delivery Tomorrow</p>
                    </div>
                  </Link>

                  {/* Add to Cart Button */}
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => handleAddToCart(product._id || product.id)}
                      className={`w-full py-1.5 rounded-full text-sm font-bold transition-all ${
                        addedToCart[product._id || product.id]
                          ? "bg-[#39d353] text-black"
                          : "bg-[#FFD814] text-black hover:bg-[#F7CA00]"
                      }`}
                    >
                      {addedToCart[product._id || product.id] ? (
                        <span className="flex items-center justify-center gap-1">
                          <Check className="h-3 w-3" /> Added!
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <ShoppingCart className="h-3 w-3" /> Add to Cart
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
