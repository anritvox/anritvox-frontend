import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { 
  FiStar, FiChevronDown, FiSearch, FiCheck, FiShoppingCart, FiSliders, FiHeart, FiX
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [priceRange, setPriceRange] = useState("All");
  const [sortOption, setSortOption] = useState("Featured");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState({});

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
        const validData = Array.isArray(data) ? data : [];
        setProducts(validData);

        const extractedCats = validData.map(p => {
          if (typeof p.category === 'object' && p.category !== null) return p.category.name;
          return p.category;
        }).filter(Boolean);
        
        const uniqueCats = ["All", ...new Set(extractedCats)];
        setDynamicCategories(uniqueCats);
      } catch (err) {
        setError("Network anomaly. Please refresh the nexus.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const productName = product.name || "";
      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const catName = typeof product.category === 'object' && product.category !== null 
        ? product.category.name 
        : product.category || "";
      
      const matchesCategory = selectedCategory === "All" || 
        catName.toLowerCase() === selectedCategory.toLowerCase();

      let matchesPrice = true;
      const price = Number(product.price) || 0;
      if (priceRange === "Under ₹1,000") matchesPrice = price < 1000;
      else if (priceRange === "₹1,000 - ₹5,000") matchesPrice = price >= 1000 && price <= 5000;
      else if (priceRange === "₹5,000 - ₹10,000") matchesPrice = price >= 5000 && price <= 10000;
      else if (priceRange === "Over ₹10,000") matchesPrice = price > 10000;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortOption === "Price: Low to High") return (a.price || 0) - (b.price || 0);
      if (sortOption === "Price: High to Low") return (b.price || 0) - (a.price || 0);
      return 0;
    });
  }, [filteredProducts, sortOption]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const id = product._id || product.id;
    await addToCart(product, 1);
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
  };

  const updateCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchParams(cat === "All" ? {} : { category: cat });
    setShowMobileFilters(false);
  };

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-olive-500/20 border-t-olive-500 rounded-full animate-spin shadow-lg shadow-olive-500/20"></div>
          <p className="text-gray-900 font-bold tracking-widest uppercase text-sm animate-pulse">Initializing Collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-gray-900 selection:bg-olive-500 selection:text-white relative overflow-hidden">
      
      {/* 🌪️ FLUID DYNAMIC BACKGROUND BLOBS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[80vw] h-[80vw] rounded-full bg-olive-500/10 blur-[120px] -top-20 -left-20 mix-blend-multiply" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[60vw] h-[60vw] rounded-full bg-emerald-500/10 blur-[120px] bottom-0 right-0 mix-blend-multiply" 
        />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6 lg:py-10 relative z-10">
        
        {/* 📱 Mobile Sticky Search & Category Pills */}
        <div className="lg:hidden sticky top-[72px] z-40 bg-[#FDFDFD]/90 backdrop-blur-xl pt-2 pb-4 -mx-4 px-4 border-b border-gray-100 shadow-sm">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative group">
              <input 
                type="text" 
                placeholder="Search hardware..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/80 border border-gray-200 focus:border-olive-500 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none shadow-sm transition-all"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-olive-500" size={18} />
            </div>
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="p-3 bg-gray-900 text-white rounded-2xl shadow-md active:scale-95 transition-transform flex items-center justify-center"
            >
              <FiSliders size={20} />
            </button>
          </div>
          
          {/* Mobile Category Horizontal Scroll */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 snap-x">
            {dynamicCategories.map(cat => (
              <button
                key={cat}
                onClick={() => updateCategory(cat)}
                className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-olive-600 text-white shadow-olive-500/30"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 📱 Mobile Fullscreen Filter Modal */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div 
              initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-white/95 backdrop-blur-3xl p-6 lg:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-gray-900">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><FiX size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs text-olive-600">Investment Range</h3>
                <div className="space-y-3 mb-8">
                  {priceRanges.map(range => (
                    <label key={range} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="font-bold text-gray-700">{range}</span>
                      <input type="radio" name="priceMobile" checked={priceRange === range} onChange={() => setPriceRange(range)} className="w-5 h-5 accent-olive-600" />
                    </label>
                  ))}
                </div>

                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs text-olive-600">Sort By</h3>
                <div className="space-y-3">
                  {["Featured", "Price: Low to High", "Price: High to Low"].map(opt => (
                    <label key={opt} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <span className="font-bold text-gray-700">{opt}</span>
                      <input type="radio" name="sortMobile" checked={sortOption === opt} onChange={() => setSortOption(opt)} className="w-5 h-5 accent-olive-600" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={() => { setPriceRange("All"); setSortOption("Featured"); }} className="flex-1 py-4 bg-gray-100 text-gray-900 font-bold rounded-2xl">Reset</button>
                <button onClick={() => setShowMobileFilters(false)} className="flex-[2] py-4 bg-olive-600 text-white font-bold rounded-2xl shadow-lg shadow-olive-500/30">Apply Filters</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* 💻 Desktop Glassmorphic Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0 space-y-8">
            <div className="bg-white/60 backdrop-blur-3xl border border-white rounded-[2.5rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.04)] sticky top-[100px]">
              
              <div className="relative group mb-8">
                <input 
                  type="text" 
                  placeholder="Search collection..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/80 border border-gray-100 py-4 pl-12 pr-4 text-sm font-bold rounded-2xl focus:border-olive-500 focus:ring-4 focus:ring-olive-500/10 outline-none transition-all shadow-sm"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-olive-500" size={18} />
              </div>

              <h3 className="font-black text-gray-900 mb-4 text-[11px] uppercase tracking-[0.25em] flex items-center gap-2">
                <FiSliders size={14} className="text-olive-600" /> Classifications
              </h3>
              <div className="space-y-1.5 mb-8">
                {dynamicCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 flex items-center justify-between text-sm font-bold ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-olive-600 text-white shadow-md shadow-olive-500/20 translate-x-1"
                        : "text-gray-500 hover:bg-white hover:text-gray-900 hover:translate-x-1"
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    {selectedCategory.toLowerCase() === cat.toLowerCase() && <FiCheck size={16} />}
                  </button>
                ))}
              </div>

              <h3 className="font-black text-gray-900 mb-4 text-[11px] uppercase tracking-[0.25em] text-olive-600">Investment</h3>
              <div className="space-y-1">
                {priceRanges.map(range => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl hover:bg-white transition-colors">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === range}
                        onChange={() => setPriceRange(range)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-olive-600 transition-colors cursor-pointer"
                      />
                      <div className="absolute w-2.5 h-2.5 bg-olive-600 rounded-full scale-0 peer-checked:scale-100 transition-transform duration-300"></div>
                    </div>
                    <span className={`text-sm transition-colors duration-300 font-bold ${priceRange === range ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Grid Engine */}
          <main className="flex-1">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-8 bg-white/60 backdrop-blur-3xl border border-white p-4 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h1 className="text-3xl font-black text-gray-900 px-4">Elite Hardware <span className="text-gray-400 text-lg ml-2 font-medium">({sortedProducts.length})</span></h1>
              
              <div className="relative z-30">
                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 text-sm font-bold text-gray-900 hover:border-olive-200 transition-all shadow-sm">
                  {sortOption} <FiChevronDown size={16} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 bg-white/95 backdrop-blur-3xl border border-gray-100 rounded-2xl shadow-2xl w-56 overflow-hidden"
                    >
                      {["Featured", "Price: Low to High", "Price: High to Low"].map(opt => (
                        <button 
                          key={opt} onClick={() => { setSortOption(opt); setShowSortDropdown(false); }} 
                          className={`w-full text-left px-5 py-4 text-sm font-bold transition-all ${sortOption === opt ? "bg-olive-50 text-olive-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-3xl p-6 text-center font-bold mb-8">
                {error}
              </div>
            )}

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8"
            >
              <AnimatePresence>
                {sortedProducts.map(product => (
                  <motion.div
                    variants={itemVariants}
                    layout
                    key={product._id || product.id}
                    className="group bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-4 border border-white shadow-xl hover:shadow-[0_40px_80px_rgba(132,204,22,0.15)] hover:border-olive-200 transition-all duration-500 flex flex-col h-[460px] md:h-[500px] overflow-hidden"
                  >
                    <div className="absolute top-6 left-6 z-10">
                      {product.discount && (
                        <span className="bg-gray-900 text-olive-400 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg tracking-widest uppercase">
                          {product.discount}% OFF
                        </span>
                      )}
                    </div>

                    <button className="absolute top-6 right-6 z-10 p-3 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:scale-110">
                      <FiHeart size={20} />
                    </button>

                    {/* Massive Auto Part Image */}
                    <Link to={`/product/${product._id || product.id}`} className="block relative h-[55%] mb-5 bg-gray-50/80 rounded-[2rem] overflow-hidden group-hover:bg-olive-50/50 transition-colors">
                      <motion.img 
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        src={product.images?.[0] || product.image || FALLBACK_IMG} 
                        className="w-full h-full object-contain p-4 mix-blend-multiply drop-shadow-xl" 
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; e.currentTarget.onerror = null; }}
                      />
                    </Link>

                    <div className="flex flex-col flex-1 px-3">
                      <div className="flex items-center gap-1 text-olive-500 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} size={14} className={i < 4 ? "fill-current" : "text-gray-300"} />
                        ))}
                      </div>

                      <Link to={`/product/${product._id || product.id}`}>
                        <h3 className="text-gray-900 font-black mb-1 line-clamp-2 text-lg leading-tight group-hover:text-olive-600 transition-colors">
                          {product.name || "Beast Auto Accessory"}
                        </h3>
                      </Link>

                      <div className="pt-4 flex items-end justify-between mt-auto">
                        <div>
                          {product.oldPrice && (
                            <div className="text-sm text-gray-400 line-through mb-0.5 font-bold">
                              ₹{Number(product.oldPrice).toLocaleString()}
                            </div>
                          )}
                          <div className="font-black text-2xl md:text-3xl text-gray-900 tracking-tighter">
                            ₹{Number(product.price || 999).toLocaleString()}
                          </div>
                        </div>
                        
                        <button 
                          onClick={(e) => handleAddToCart(e, product)} 
                          className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-[1.5rem] transition-all duration-300 shadow-md ${
                            addedToCart[product._id || product.id] 
                            ? 'bg-olive-600 text-white scale-110 shadow-olive-500/40' 
                            : 'bg-gray-900 text-white hover:bg-olive-600 hover:-translate-y-2 hover:shadow-xl hover:shadow-olive-500/30'
                          }`}
                        >
                          {addedToCart[product._id || product.id] ? <FiCheck size={26} /> : <FiShoppingCart size={26} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {sortedProducts.length === 0 && !loading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32 bg-white/40 backdrop-blur-xl border border-white rounded-[3rem] shadow-xl">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                  <FiSearch size={32} className="text-gray-400" />
                </div>
                <p className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Zero Hardware Located</p>
                <p className="text-gray-500 font-medium text-lg">Try adjusting your parameters or resetting filters.</p>
                <button onClick={() => updateCategory("All")} className="mt-8 px-10 py-4 bg-gray-900 text-white font-bold rounded-full shadow-lg hover:bg-olive-600 hover:-translate-y-1 transition-all">
                  Reset Filters
                </button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
