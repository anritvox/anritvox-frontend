import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { 
  FiStar as Star, 
  FiChevronDown as ChevronDown, 
  FiChevronRight as ChevronRight, 
  FiGrid as LayoutGrid, 
  FiList as List, 
  FiSearch as Search, 
  FiCheck as Check, 
  FiShoppingCart as ShoppingCart,
  FiSliders as Sliders,
  FiArrowRight as ArrowRight
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600";

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
  const [viewType, setViewType] = useState("grid");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [addedToCart, setAddedToCart] = useState({});

  const priceRanges = ["All", "Under ₹1,000", "₹1,000 - ₹5,000", "₹5,000 - ₹10,000", "Over ₹10,000"];

  // Sync URL params to state seamlessly
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const search = searchParams.get("search");
    if (search) setSearchTerm(search);
  }, [searchParams]);

  // Fetch products and dynamically extract real categories
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        const validData = Array.isArray(data) ? data : [];
        setProducts(validData);

        // Dynamically extract exact categories from your actual database
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

  // Bulletproof filtering logic
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

  const handleAddToCart = async (product) => {
    const id = product._id || product.id;
    await addToCart(product, 1);
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
  };

  const updateCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchParams({ category: cat });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5F0]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#6B705C]/20 border-t-[#6B705C] rounded-full animate-spin"></div>
          <p className="text-[#6B705C] font-mono text-sm tracking-widest uppercase font-bold">Synchronizing Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F0] font-sans text-[#2C302E] selection:bg-[#6B705C]/30 relative overflow-hidden">
      
      {/* Background Ambient Fluid Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-white/40 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-[#6B705C]/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        
        {/* Premium Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B705C]/60 mb-8">
          <Link to="/" className="hover:text-[#6B705C] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#6B705C]">Collection</span>
          {selectedCategory !== "All" && (
            <>
              <ChevronRight size={12} />
              <span className="text-[#6B705C]">{selectedCategory}</span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Glassmorphic Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Search Glass */}
            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.02)] relative group">
              <input 
                type="text" 
                placeholder="Search collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm focus:ring-0 outline-none placeholder:text-[#2C302E]/40"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2C302E]/40 group-focus-within:text-[#6B705C] transition-colors" size={18} />
            </div>

            <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
              <h3 className="font-black text-[#2C302E] mb-6 text-[11px] uppercase tracking-[0.2em] flex items-center gap-2">
                <Sliders size={14} className="text-[#6B705C]" /> Classifications
              </h3>
              <div className="space-y-2">
                {dynamicCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => updateCategory(cat)}
                    className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-300 flex items-center justify-between text-sm font-medium ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-[#6B705C] text-white shadow-lg shadow-[#6B705C]/20 translate-x-1"
                        : "text-[#2C302E]/70 hover:bg-white/60 hover:translate-x-1"
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    {selectedCategory.toLowerCase() === cat.toLowerCase() && <Check size={16} />}
                  </button>
                ))}
              </div>

              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#2C302E]/10 to-transparent my-8"></div>

              <h3 className="font-black text-[#2C302E] mb-6 text-[11px] uppercase tracking-[0.2em]">Investment</h3>
              <div className="space-y-3">
                {priceRanges.map(range => (
                  <label key={range} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === range}
                        onChange={() => setPriceRange(range)}
                        className="peer appearance-none w-5 h-5 border-2 border-[#2C302E]/20 rounded-full checked:border-[#6B705C] transition-colors cursor-pointer"
                      />
                      <div className="absolute w-2.5 h-2.5 bg-[#6B705C] rounded-full scale-0 peer-checked:scale-100 transition-transform duration-300"></div>
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${priceRange === range ? 'text-[#6B705C] font-bold' : 'text-[#2C302E]/70 group-hover:text-[#2C302E]'}`}>{range}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Grid Engine */}
          <main className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 bg-white/40 backdrop-blur-2xl border border-white/60 p-4 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl">
                <button onClick={() => setViewType("grid")} className={`p-2.5 rounded-xl transition-all duration-300 ${viewType === "grid" ? "bg-white shadow-sm text-[#6B705C]" : "text-[#2C302E]/40 hover:text-[#2C302E]"}`}><LayoutGrid size={18} /></button>
                <button onClick={() => setViewType("list")} className={`p-2.5 rounded-xl transition-all duration-300 ${viewType === "list" ? "bg-white shadow-sm text-[#6B705C]" : "text-[#2C302E]/40 hover:text-[#2C302E]"}`}><List size={18} /></button>
                <div className="h-6 w-[1px] bg-[#2C302E]/10 mx-2"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6B705C] px-2">{sortedProducts.length} Items</span>
              </div>
              
              <div className="relative w-full sm:w-auto z-20">
                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="w-full sm:w-auto px-6 py-3 bg-white/60 border border-white/60 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold text-[#2C302E] hover:bg-white transition-all">
                  {sortOption} <ChevronDown size={16} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 bg-white/80 backdrop-blur-3xl border border-white/60 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] w-full sm:w-56 overflow-hidden"
                    >
                      {["Featured", "Price: Low to High", "Price: High to Low"].map(opt => (
                        <button 
                          key={opt} 
                          onClick={() => { setSortOption(opt); setShowSortDropdown(false); }} 
                          className={`w-full text-left px-5 py-4 text-sm font-bold transition-all ${sortOption === opt ? "bg-[#6B705C]/10 text-[#6B705C]" : "text-[#2C302E]/70 hover:bg-white hover:text-[#2C302E]"}`}
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
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl p-6 text-center font-bold text-sm">
                {error}
              </div>
            )}

            <motion.div layout className={`grid gap-6 ${viewType === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              <AnimatePresence>
                {sortedProducts.map(product => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    key={product._id || product.id}
                    className={`group bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:bg-white/60 transition-all duration-500 ${viewType === "list" ? "flex flex-col sm:flex-row gap-6" : "flex flex-col"}`}
                  >
                    <div className={`relative bg-white/50 rounded-3xl overflow-hidden flex items-center justify-center ${viewType === "list" ? "w-full sm:w-64 h-64 sm:h-auto flex-shrink-0" : "h-64 mb-6"}`}>
                      <img
                        src={product.images?.[0] || product.image || FALLBACK_IMG}
                        alt={product.name}
                        className="w-4/5 h-4/5 object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-[-2deg] transition-all duration-700"
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; e.currentTarget.onerror = null; }}
                      />
                    </div>

                    <div className="flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6B705C] bg-[#6B705C]/10 px-3 py-1 rounded-full">
                            {typeof product.category === 'object' ? product.category?.name : product.category}
                          </span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="fill-[#6B705C] text-[#6B705C]" />)}
                          </div>
                        </div>
                        <h3 className="font-bold text-[#2C302E] text-base leading-snug mb-4 line-clamp-2">{product.name}</h3>
                      </div>
                      
                      <div className="flex items-end justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-xs text-[#2C302E]/40 font-bold line-through mb-0.5">₹{(product.price * 1.3).toFixed(0)}</span>
                          <span className="text-xl font-black text-[#2C302E] tracking-tight">₹{Number(product.price).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/product/${product._id || product.id}`} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-[#2C302E] hover:bg-[#2C302E] hover:text-white transition-all shadow-sm">
                            <ArrowRight size={18} className="-rotate-45" />
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 shadow-sm ${
                              addedToCart[product._id || product.id]
                                ? 'bg-[#5B6E41] text-white rotate-12 scale-110'
                                : 'bg-[#6B705C] text-white hover:bg-[#4d582e] hover:shadow-lg hover:shadow-[#6B705C]/30'
                            }`}
                          >
                            {addedToCart[product._id || product.id] ? <Check size={20} /> : <ShoppingCart size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {sortedProducts.length === 0 && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem]"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search size={32} className="text-[#6B705C]/40" />
                </div>
                <p className="text-2xl font-black text-[#2C302E] mb-2 tracking-tight">Zero Hardware Located</p>
                <p className="text-[#2C302E]/50 font-medium">Try adjusting your parameters or resetting filters.</p>
                <button onClick={() => updateCategory("All")} className="mt-6 px-8 py-3 bg-white text-[#6B705C] font-bold rounded-xl shadow-sm hover:shadow-md transition-all">
                  Reset Nexus
                </button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
