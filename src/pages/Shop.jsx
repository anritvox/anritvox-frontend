import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { FiStar as Star, FiChevronDown as ChevronDown, FiChevronRight as ChevronRight, FiChevronLeft as ChevronLeft, FiFilter as Filter, FiGrid as LayoutGrid, FiList as List, FiSearch as Search, FiCheck as Check, FiShoppingCart as ShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [priceRange, setPriceRange] = useState("All");
  const [sortOption, setSortOption] = useState("Featured");
  const [viewType, setViewType] = useState("grid");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [addedToCart, setAddedToCart] = useState({});
  const categories = ["All", "Interior", "Exterior", "Accessories", "Performance", "Electronics"];
  const priceRanges = ["All", "Under ₹1,000", "₹1,000 - ₹5,000", "₹5,000 - ₹10,000", "Over ₹10,000"];
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const search = searchParams.get("search");
    if (search) setSearchTerm(search);
  }, [searchParams]);
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
  const handleAddToCart = async (product) => {
    const id = product._id || product.id;
    await addToCart(product, 1);
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-3 text-xs text-gray-500 flex items-center gap-1">
        <Link to="/" className="hover:text-[#c45500] hover:underline">Home</Link>
        <ChevronRight size={12} />
        <span className="text-gray-400">Shop</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Categories</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSearchParams({ category: cat }); }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between text-sm ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white font-bold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                  {selectedCategory === cat && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Price Range</h3>
            <div className="space-y-2">
              {priceRanges.map(range => (
                <label key={range} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === range}
                    onChange={() => setPriceRange(range)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  {range}
                </label>
              ))}
            </div>
          </div>
        </aside>
        <main className="md:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setViewType("grid")} className={`p-2 rounded-md transition-all ${viewType === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}><LayoutGrid size={18} /></button>
              <button onClick={() => setViewType("list")} className={`p-2 rounded-md transition-all ${viewType === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}><List size={18} /></button>
              <span className="text-sm text-gray-500 ml-2">{sortedProducts.length} Products Found</span>
            </div>
            <div className="relative">
              <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Sort: {sortOption} <ChevronDown size={14} />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-48">
                  {["Featured", "Price: Low to High", "Price: High to Low"].map(opt => (
                    <button key={opt} onClick={() => { setSortOption(opt); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${sortOption === opt ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {error && <div className="text-red-500 text-center py-8">{error}</div>}
          <AnimatePresence>
            <div className={`grid gap-4 ${viewType === "grid" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {sortedProducts.map(product => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={product._id || product.id}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className={`${viewType === "list" ? "w-48 h-36 flex-shrink-0" : "h-48"} relative bg-gray-50 overflow-hidden`}>
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <span className="text-lg font-bold text-[#232f3e]">{product.price?.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                      <div className="flex gap-2">
                        <Link to={`/shop/${product._id || product.id}`} className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all">
                          Details
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            addedToCart[product._id || product.id]
                              ? 'bg-green-600 text-white'
                              : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111]'
                          }`}
                        >
                          {addedToCart[product._id || product.id] ? <><Check size={13} /> Added</> : <><ShoppingCart size={13} /> Add</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
          {sortedProducts.length === 0 && !loading && (
            <div className="text-center py-16 text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
