import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [s/* Shop.jsx - Amazon Style Redesign */
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

  // Filter options
  const categories = ["All", "Interior", "Exterior", "Accessories", "Performance", "Electronics"];
  const priceRanges = ["All", "Under ₹1,000", "₹1,000 - ₹5,000", "₹5,000 - ₹10,000", "Over ₹10,000"];

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
    if (priceRange === "Under ₹1,000") matchesPrice = product.price < 1000;
    else if (priceRange === "₹1,000 - ₹5,000") matchesPrice = product.price >= 1000 && product.price <= 5000;
    else if (priceRange === "₹5,000 - ₹10,000") matchesPrice = product.price >= 5000 && product.price <= 10000;
    else if (priceRange === "Over ₹10,000") matchesPrice = product.price > 10000;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "Price: Low to High") return a.price - b.price;
    if (sortOption === "Price: High to Low") return b.price - a.price;
    if (sortOption === "Avg. Customer Review") return 4 - 4; // Mock
    return 0; // Featured
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-[#FFD814] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#0F1111] font-medium">Loading results...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Top Results Bar */}
      <div className="border-b border-gray-200 shadow-sm sticky top-0 bg-white z-40">
        <div className="max-w-[1500px] mx-auto px-4 h-12 flex items-center justify-between text-sm">
          <div className="text-[#0F1111]">
            <span className="font-bold">1-{sortedProducts.length}</span> of {sortedProducts.length} results for 
            <span className="text-[#c45500] font-bold ml-1">"{searchTerm || "All Products"}"</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md border border-gray-300 text-xs shadow-sm">
                Sort by: {sortOption} <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg hidden group-hover:block z-50">
                {["Featured", "Price: Low to High", "Price: High to Low", "Avg. Customer Review"].map(option => (
                  <button 
                    key={option}
                    onClick={() => setSortOption(option)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-xs"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto flex py-4">
        {/* Left Sidebar Filters */}
        <aside className="w-64 flex-shrink-0 px-4 hidden lg:block border-r border-gray-100">
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-bold text-[#0F1111] mb-2 uppercase tracking-tight">Category</h3>
              <ul className="space-y-1">
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

            {/* Customer Review Filter */}
            <div>
              <h3 className="text-sm font-bold text-[#0F1111] mb-2 uppercase tracking-tight">Customer Review</h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map(stars => (
                  <button key={stars} className="flex items-center gap-1 group">
                    <div className="flex text-[#ffa41c]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill={i < stars ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-sm text-[#0F1111] group-hover:text-[#c45500]">& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-sm font-bold text-[#0F1111] mb-2 uppercase tracking-tight">Price</h3>
              <ul className="space-y-1">
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
        <main className="flex-1 px-4">
          <h1 className="text-xl font-bold text-[#0F1111] mb-4">Results</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedProducts.map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={product.id} 
                className="flex flex-col border border-gray-200 rounded p-2 hover:shadow-xl transition-shadow bg-white relative group"
              >
                {/* Product Image */}
                <Link to={`/shop/${product.id}`} className="block h-48 mb-2 overflow-hidden bg-gray-50 rounded">
                  <img 
                    src={product.image || "/api/placeholder/400/320"} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105"
                  />
                </Link>

                {/* Badges */}
                {product.mrp > product.price && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                    Limited time deal
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <Link to={`/shop/${product.id}`} className="text-sm font-medium text-[#0F1111] hover:text-[#c45500] line-clamp-3 mb-1">
                    {product.name}
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex text-[#ffa41c]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <ChevronDown size={12} className="text-gray-400" />
                    <span className="text-xs text-[#007185]">426</span>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-medium self-start mt-0.5">₹</span>
                      <span className="text-2xl font-medium">{product.price.toLocaleString()}</span>
                    </div>
                    {product.mrp > product.price && (
                      <div className="text-xs text-gray-500">
                        M.R.P: <span className="line-through">₹{product.mrp.toLocaleString()}</span>
                        <span className="ml-1 text-gray-600">({Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off)</span>
                      </div>
                    )}
                  </div>

                  {/* Delivery */}
                  <div className="mt-auto space-y-1">
                    <div className="flex items-center gap-1 text-xs text-[#0F1111]">
                      <span className="font-bold">FREE delivery</span> by <span className="font-bold">Tomorrow, Mar 10</span>
                    </div>
                    <div className="text-[10px] text-gray-600">
                      Service at <span className="text-[#007185]">Pune 411001</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-lg font-bold">No results found</h2>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
electedSubcategory, setSelectedSubcategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, sortOption]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <p className="text-xl animate-pulse font-bold">Loading Anritvox Products...</p>
      </div>
    );
  }

  const categoryOptions = Array.from(new Set(products.map((p) => p.category_name).filter(Boolean)));
  
  const subcategoryOptions = Array.from(
    new Set(
      products
        .filter((p) => (selectedCategory ? p.category_name === selectedCategory : true))
        .map((p) => p.subcategory_name)
        .filter(Boolean)
    )
  );

  let filtered = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => (selectedCategory ? p.category_name === selectedCategory : true))
    .filter((p) => (selectedSubcategory ? p.subcategory_name === selectedSubcategory : true));

  if (sortOption === "priceAsc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortOption === "priceDesc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  const totalPages = Math.ceil(filtered.length / productsPerPage);
  const currentProducts = filtered.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans antialiased">
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row gap-6 p-4">
        
        {/* Amazon-style Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white p-4 border rounded-sm shadow-sm self-start">
          <h3 className="font-bold text-sm mb-3 border-b pb-2">Department</h3>
          <ul className="space-y-2 text-sm text-[#007185]">
            <li 
              className={`cursor-pointer hover:text-[#c45500] ${!selectedCategory ? 'font-bold text-black' : ''}`}
              onClick={() => { setSelectedCategory(""); setSelectedSubcategory(""); }}
            >
              All Departments
            </li>
            {categoryOptions.map(cat => (
              <li 
                key={cat} 
                className={`cursor-pointer hover:text-[#c45500] ${selectedCategory === cat ? 'font-bold text-black' : ''}`}
                onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(""); }}
              >
                {cat}
              </li>
            ))}
          </ul>

          <h3 className="font-bold text-sm mt-6 mb-3 border-b pb-2">Avg. Customer Review</h3>
          <div className="space-y-2">
            {[4,3,2,1].map(star => (
              <div key={star} className="flex items-center gap-2 cursor-pointer text-sm hover:text-[#c45500]">
                <span className="text-[#ffa41c] font-bold">
                  {"★".repeat(star)}{"☆".repeat(5-star)}
                </span>
                <span className="text-gray-700">& Up</span>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-sm mt-6 mb-3 border-b pb-2">Price</h3>
          <ul className="space-y-2 text-sm text-[#007185]">
             <li className="cursor-pointer hover:text-[#c45500]">Under ₹5,000</li>
             <li className="cursor-pointer hover:text-[#c45500]">₹5,000 - ₹10,000</li>
             <li className="cursor-pointer hover:text-[#c45500]">₹10,000 - ₹20,000</li>
             <li className="cursor-pointer hover:text-[#c45500]">Over ₹20,000</li>
          </ul>
        </aside>

        {/* Main Product Feed */}
        <main className="flex-1">
          {/* Results Info Bar */}
          <div className="bg-white border p-3 mb-4 rounded-sm shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm">
              1-{currentProducts.length} of {filtered.length} results for <span className="text-[#c45500] font-bold">"{searchTerm || 'All Products'}"</span>
            </span>
            <div className="flex items-center gap-2">
               <label className="text-xs text-gray-600">Sort by:</label>
               <select 
                className="text-xs bg-gray-100 border rounded-md px-2 py-1 outline-none hover:bg-gray-200 cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentProducts.map((p) => (
              <div key={p.id} className="bg-white border rounded-sm p-4 flex flex-col hover:shadow-lg transition-shadow duration-200 group">
                <Link to={`/shop/${p.id}`} className="h-52 flex items-center justify-center mb-4 relative overflow-hidden">
                  <img 
                    src={p.images?.[0] || "https://placehold.co/400x400?text=No+Image"} 
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/shop/${p.id}`} className="text-[#007185] hover:text-[#c45500] font-medium text-sm line-clamp-3 mb-1 leading-snug">
                    {p.name}
                  </Link>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex text-[#ffa41c] text-xs">★★★★★</div>
                    <span className="text-xs text-[#007185] font-medium">2,308</span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-xs font-bold self-start mt-1">₹</span>
                    <span className="text-2xl font-medium">{Math.floor(p.price).toLocaleString()}</span>
                    <span className="text-xs font-bold">00</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    M.R.P: <span className="line-through">₹{(p.price * 1.4).toFixed(0)}</span> (40% off)
                  </div>
                  <p className="text-xs mt-3 font-bold text-gray-900">Get it by Tomorrow</p>
                  <p className="text-xs text-gray-600">FREE Delivery by Anritvox</p>
                </div>
                <button className="mt-4 bg-[#ffd814] hover:bg-[#f7ca00] text-black text-xs py-2 rounded-full font-medium border border-[#fcd200] transition-colors shadow-sm">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 mb-8">
              <div className="flex border rounded-md overflow-hidden bg-white shadow-sm">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 border-r last:border-r-0 text-sm ${currentPage === i + 1 ? 'bg-gray-100 font-bold' : 'hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
