import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { Star, ChevronDown, ChevronRight, ChevronLeft, Filter, LayoutGrid, List, Search, Check, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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

  const handleAddToCart = (productId) => {
    setAddedToCart(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [productId]: false })), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="bg-white border-b py-8 mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">Shop</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Explore Collection</h1>
          <p className="text-gray-500">Discover premium audio gear and car electronics.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
              <Filter size={18} /> Categories
            </h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchParams({ category: cat });
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                    selectedCategory === cat ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium">{cat}</span>
                  {selectedCategory === cat && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Price Range</h3>
            <div className="space-y-2">
              {priceRanges.map(range => (
                <label key={range} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white cursor-pointer group transition-colors">
                  <input
                    type="radio"
                    name="price"
                    checked={priceRange === range}
                    onChange={() => setPriceRange(range)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${priceRange === range ? "text-blue-600" : "text-gray-600 group-hover:text-gray-900"}`}>{range}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-2xl shadow-sm border mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setViewType("grid")} className={`p-2 rounded-md transition-all ${viewType === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewType("list")} className={`p-2 rounded-md transition-all ${viewType === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}><List size={20} /></button>
              </div>
              <span className="text-sm text-gray-500 font-medium">{sortedProducts.length} Products Found</span>
            </div>

            <div className="relative">
              <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="px-6 py-2.5 bg-gray-50 border rounded-xl flex items-center gap-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all">
                Sort by: {sortOption} <ChevronDown size={16} />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-2xl z-50 overflow-hidden">
                  {["Featured", "Price: Low to High", "Price: High to Low"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSortOption(opt); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${sortOption === opt ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div layout className={viewType === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}>
              {sortedProducts.map(product => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={product._id || product.id}
                  className={`group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden ${viewType === "list" ? "flex gap-6 p-4" : ""}`}
                >
                  <div className={`${viewType === "list" ? "w-64 h-48 flex-shrink-0" : "h-64"} relative bg-gray-50 overflow-hidden`}>
                    <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{product.category}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-2xl font-black text-blue-600">₹{product.price.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Link to={`/shop/${product._id || product.id}`} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all">Details</Link>
                        <button onClick={() => handleAddToCart(product._id || product.id)} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${addedToCart[product._id || product.id] ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"}`}>
                          {addedToCart[product._id || product.id] ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add</>}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
