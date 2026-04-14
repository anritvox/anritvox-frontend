import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { useCart } from "../context/CartContext";
import { FiStar, FiChevronDown, FiSearch, FiCheck, FiShoppingCart, FiSliders, FiHeart, FiX, FiEye } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import QuickViewModal from "../components/QuickViewModal";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState(["All"]);
  const [brands, setBrands] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");
  const [sortOption, setSortOption] = useState("Featured");
  
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const priceRanges = ["All", "Under ₹1,000", "₹1,000 - ₹5,000", "₹5,000 - ₹10,000", "Over ₹10,000"];

  useEffect(() => {
    const saved = localStorage.getItem('recently_viewed');
    if (saved) setRecentlyViewed(JSON.parse(saved).slice(0, 5));
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        const validData = Array.isArray(data) ? data : [];
        setProducts(validData);

        const cats = ["All", ...new Set(validData.map(p => typeof p.category === 'object' ? p.category.name : p.category).filter(Boolean))];
        setDynamicCategories(cats);

        const bnd = ["All", ...new Set(validData.map(p => p.brand).filter(Boolean))];
        setBrands(bnd);
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
      const name = (product.name || "").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      
      const cat = (typeof product.category === 'object' ? product.category.name : product.category || "").toLowerCase();
      const matchesCategory = selectedCategory === "All" || cat === selectedCategory.toLowerCase();
      
      const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
      
      const price = Number(product.price) || 0;
      let matchesPrice = true;
      if (priceRange === "Under ₹1,000") matchesPrice = price < 1000;
      else if (priceRange === "₹1,000 - ₹5,000") matchesPrice = price >= 1000 && price <= 5000;
      else if (priceRange === "₹5,000 - ₹10,000") matchesPrice = price >= 5000 && price <= 10000;
      else if (priceRange === "Over ₹10,000") matchesPrice = price > 10000;

      const matchesStock = stockStatus === "All" || (stockStatus === "In Stock" ? product.stock > 0 : product.stock === 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, stockStatus]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortOption === "Price: Low to High") return (a.price || 0) - (b.price || 0);
      if (sortOption === "Price: High to Low") return (b.price || 0) - (a.price || 0);
      if (sortOption === "Newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "Rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [filteredProducts, sortOption]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault(); e.stopPropagation();
    await addToCart(product, 1);
    const id = product._id || product.id;
    setAddedToCart(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [id]: false })), 2000);
  };

  const openQuickView = (e, product) => {
    e.preventDefault(); e.stopPropagation();
    setQuickViewProduct(product);
    // Add to recently viewed
    const updated = [product, ...recentlyViewed.filter(p => (p._id || p.id) !== (product._id || product.id))].slice(0, 5);
    setRecentlyViewed(updated);
    localStorage.setItem('recently_viewed', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row gap-6 p-4 md:p-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden md:block">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Classifications</h3>
          <div className="space-y-2">
            {dynamicCategories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-olive-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Brands</h3>
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm font-bold outline-none"
          >
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Investment</h3>
          {priceRanges.map(range => (
            <label key={range} className="flex items-center gap-3 py-1 cursor-pointer group">
              <input type="radio" name="price" checked={priceRange === range} onChange={() => setPriceRange(range)} className="w-4 h-4 accent-olive-600" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{range}</span>
            </label>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Availability</h3>
          {["All", "In Stock", "Out of Stock"].map(status => (
            <label key={status} className="flex items-center gap-3 py-1 cursor-pointer group">
              <input type="radio" name="stock" checked={stockStatus === status} onChange={() => setStockStatus(status)} className="w-4 h-4 accent-olive-600" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{status}</span>
            </label>
          ))}
        </div>

        {recentlyViewed.length > 0 && (
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2"><FiEye size={14}/> Recent</h3>
            <div className="space-y-3">
              {recentlyViewed.map((p, i) => (
                <Link key={i} to={`/product/${p._id || p.id}`} className="flex items-center gap-3 group">
                  <img src={p.image || FALLBACK_IMG} className="w-10 h-10 object-cover rounded-lg bg-gray-50" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-olive-600 truncate">{p.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Elite Hardware</h1>
            <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">{sortedProducts.length} Results Found</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:border-olive-500 outline-none shadow-sm transition-all"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 text-sm font-bold text-gray-900 shadow-sm"
              >
                {sortOption} <FiChevronDown />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 overflow-hidden py-1">
                  {["Featured", "Newest", "Price: Low to High", "Price: High to Low", "Rating"].map(opt => (
                    <button 
                      key={opt}
                      onClick={() => { setSortOption(opt); setShowSortDropdown(false); }}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-all ${sortOption === opt ? 'bg-olive-50 text-olive-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => {
            const id = product._id || product.id;
            return (
              <motion.div 
                layout
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-3xl border border-gray-100 p-4 relative flex flex-col hover:shadow-xl transition-all duration-500"
              >
                {product.discount_price && (
                  <span className="absolute top-6 left-6 z-10 bg-olive-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-olive-500/20">Sale</span>
                )}
                
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
                  <img src={product.image || FALLBACK_IMG} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={(e) => openQuickView(e, product)}
                      className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:bg-olive-600 hover:text-white transition-all shadow-xl"
                    >
                      <FiEye size={20} />
                    </button>
                    <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:text-red-500 transition-all shadow-xl">
                      <FiHeart size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{product.brand || 'Original'}</p>
                  <Link to={`/product/${id}`} className="text-sm font-bold text-gray-900 hover:text-olive-600 line-clamp-2 mb-2 leading-snug">{product.name}</Link>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => <FiStar key={i} size={12} className={i < Math.round(product.rating || 4) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-lg font-black text-gray-900 tracking-tighter">₹{Number(product.discount_price || product.price || 999).toLocaleString()}</p>
feat: Upgrade Shop page with brand/stock filters, rating sort, quick view, and recently viewed integration                    </div>
                    
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${addedToCart[id] ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-olive-600 active:scale-95 shadow-lg shadow-gray-900/10'}`}
                    >
                      {product.stock === 0 ? <span className="text-[8px] font-black uppercase">Sold</span> : (addedToCart[id] ? <FiCheck size={18}/> : <FiShoppingCart size={18}/>)}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-20">
            <FiSearch size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Zero Inventory Located</h3>
            <p className="text-gray-500 mt-2">Adjust your parameters or reset to baseline.</p>
            <button onClick={() => { setSelectedCategory("All"); setPriceRange("All"); setSelectedBrand("All"); setStockStatus("All"); setSearchTerm(""); }} className="mt-6 px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl shadow-xl">Reset All</button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}
