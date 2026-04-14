import React, { useState, useEffect, useMemo } from \"react\";
import { Link, useSearchParams } from \"react-router-dom\";
import { fetchProducts } from \"../services/api\";
import { useCart } from \"../context/CartContext\";
import { FiStar, FiChevronDown, FiSearch, FiCheck, FiShoppingCart, FiSliders, FiHeart, FiX, FiEye, FiTrash2 } from \"react-icons/fi\";
import { motion, AnimatePresence } from \"framer-motion\";
import QuickViewModal from \"../components/QuickViewModal\";

const FALLBACK_IMG = \"https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80\";

const SkeletonCard = () => (
  <div className=\"bg-white rounded-3xl border border-gray-100 p-4 animate-pulse\">
    <div className=\"aspect-square bg-gray-100 rounded-2xl mb-4\"></div>
    <div className=\"h-3 bg-gray-100 rounded w-1/3 mb-2\"></div>
    <div className=\"h-4 bg-gray-100 rounded w-3/4 mb-4\"></div>
    <div className=\"flex justify-between items-center\">
      <div className=\"h-6 bg-gray-100 rounded w-1/4\"></div>
      <div className=\"h-10 w-10 bg-gray-100 rounded-xl\"></div>
    </div>
  </div>
);

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([\"All\"]);
  const [brands, setBrands] = useState([\"All\"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(\"\");
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get(\"search\") || \"\");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get(\"category\") || \"All\");
  const [selectedBrand, setSelectedBrand] = useState(\"All\");
  const [priceRange, setPriceRange] = useState(\"All\");
  const [stockStatus, setStockStatus] = useState(\"All\");
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortOption, setSortOption] = useState(\"Featured\");
  
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const priceRanges = [\"All\", \"Under ₹1,000\", \"₹1,000 - ₹5,000\", \"₹5,000 - ₹10,000\", \"Over ₹10,000\"];

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
        
        const cats = [\"All\", ...new Set(validData.map(p => typeof p.category === 'object' ? p.category.name : p.category).filter(Boolean))];
        setDynamicCategories(cats);
        
        const bnd = [\"All\", ...new Set(validData.map(p => p.brand).filter(Boolean))];
        setBrands(bnd);
      } catch (err) {
        setError(\"Network anomaly. Please refresh the nexus.\");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const name = (product.name || \"\").toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase());
      
      const cat = (typeof product.category === 'object' ? product.category.name : product.category || \"\").toLowerCase();
      const matchesCategory = selectedCategory === \"All\" || cat === selectedCategory.toLowerCase();
      
      const matchesBrand = selectedBrand === \"All\" || product.brand === selectedBrand;
      
      const price = Number(product.price) || 0;
      let matchesPrice = true;
      if (priceRange === \"Under ₹1,000\") matchesPrice = price < 1000;
      else if (priceRange === \"₹1,000 - ₹5,000\") matchesPrice = price >= 1000 && price <= 5000;
      else if (priceRange === \"₹5,000 - ₹10,000\") matchesPrice = price >= 5000 && price <= 10000;
      else if (priceRange === \"Over ₹10,000\") matchesPrice = price > 10000;

      const matchesStock = stockStatus === \"All\" || (stockStatus === \"In Stock\" ? product.stock > 0 : product.stock === 0);
      const matchesRating = selectedRating === 0 || (product.rating || 0) >= selectedRating;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesStock && matchesRating;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, stockStatus, selectedRating]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortOption === \"Price: Low to High\") return (a.price || 0) - (b.price || 0);
      if (sortOption === \"Price: High to Low\") return (b.price || 0) - (a.price || 0);
      if (sortOption === \"Newest\") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === \"Rating\") return (b.rating || 0) - (a.rating || 0);
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
    const updated = [product, ...recentlyViewed.filter(p => (p._id || p.id) !== (product._id || product.id))].slice(0, 5);
    setRecentlyViewed(updated);
    localStorage.setItem('recently_viewed', JSON.stringify(updated));
  };

  const clearAllFilters = () => {
    setSelectedCategory(\"All\");
    setSelectedBrand(\"All\");
    setPriceRange(\"All\");
    setStockStatus(\"All\");
    setSelectedRating(0);
    setSearchTerm(\"\");
  };

  const activeFilterCount = [
    selectedCategory !== \"All\",
    selectedBrand !== \"All\",
    priceRange !== \"All\",
    stockStatus !== \"All\",
    selectedRating !== 0,
    searchTerm !== \"\"
  ].filter(Boolean).length;

  return (
    <div className=\"min-h-screen bg-gray-50 flex flex-col md:flex-row gap-6 p-4 md:p-8\">
      {/* Sidebar Filters */}
      <aside className=\"w-full md:w-64 space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hidden md:block h-fit sticky top-24\">
        <div className=\"flex items-center justify-between\">
          <h3 className=\"text-sm font-black uppercase tracking-widest text-gray-900\">Filters</h3>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className=\"text-[10px] font-black uppercase text-red-500 hover:text-red-600 flex items-center gap-1\">
              <FiTrash2 /> Reset
            </button>
          )}
        </div>

        <div>
          <h3 className=\"text-xs font-black uppercase tracking-widest text-gray-400 mb-4\">Classifications</h3>
          <div className=\"space-y-1\">
            {dynamicCategories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-olive-600 text-white shadow-lg shadow-olive-600/20' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className=\"text-xs font-black uppercase tracking-widest text-gray-400 mb-4\">Rating Threshold</h3>
          <div className=\"space-y-2\">
            {[4, 3, 2].map(star => (
              <button 
                key={star}
                onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-bold transition-all ${selectedRating === star ? 'bg-olive-50 text-olive-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className=\"flex items-center text-yellow-400\">
                  {[...Array(5)].map((_, i) => <FiStar key={i} size={14} className={i < star ? 'fill-yellow-400' : 'text-gray-200'} />)}
                </div>
                <span>& Up</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className=\"text-xs font-black uppercase tracking-widest text-gray-400 mb-4\">Brands</h3>
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
            className=\"w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-olive-500 transition-all\"
          >
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <h3 className=\"text-xs font-black uppercase tracking-widest text-gray-400 mb-4\">Price Window</h3>
          <div className=\"space-y-2\">
            {priceRanges.map(range => (
              <label key={range} className=\"flex items-center gap-3 py-1 cursor-pointer group\">
                <input type=\"radio\" name=\"price\" checked={priceRange === range} onChange={() => setPriceRange(range)} className=\"w-4 h-4 accent-olive-600\" />
                <span className={`text-sm font-bold ${priceRange === range ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>{range}</span>
              </label>
            ))}
          </div>
        </div>

        {recentlyViewed.length > 0 && (
          <div className=\"pt-6 border-t border-gray-100\">
            <h3 className=\"text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2\"><FiEye size={14}/> Recent</h3>
            <div className=\"space-y-3\">
              {recentlyViewed.map((p, i) => (
                <Link key={i} to={`/product/${p._id || p.id}`} className=\"flex items-center gap-3 group\">
                  <div className=\"w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100\">
                    <img src={p.image || FALLBACK_IMG} className=\"w-full h-full object-contain p-1 group-hover:scale-110 transition-transform\" />
                  </div>
                  <span className=\"text-xs font-bold text-gray-500 group-hover:text-olive-600 truncate\">{p.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className=\"flex-1\">
        <div className=\"flex flex-col gap-6 mb-8\">
          <div className=\"flex flex-col md:flex-row justify-between items-start md:items-center gap-4\">
            <div>
              <h1 className=\"text-3xl font-black text-gray-900 tracking-tight italic\">Elite Hardware</h1>
              <p className=\"text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest\">
                {loading ? 'Scanning Inventory...' : `${sortedProducts.length} Results Located`}
              </p>
            </div>

            <div className=\"flex items-center gap-3 w-full md:w-auto\">
              <div className=\"relative flex-1 md:w-64\">
                <FiSearch className=\"absolute left-4 top-1/2 -translate-y-1/2 text-gray-400\" />
                <input 
                  type=\"text\" 
                  placeholder=\"Search inventory...\" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=\"w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:border-olive-500 outline-none shadow-sm transition-all\"
                />
              </div>

              <div className=\"relative\">
                <button 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className=\"px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-3 text-sm font-bold text-gray-900 shadow-sm hover:border-gray-200 transition-all\"
                >
                  {sortOption} <FiChevronDown />
                </button>
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className=\"absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1\"
                    >
                      {[\"Featured\", \"Newest\", \"Price: Low to High\", \"Price: High to Low\", \"Rating\"].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => { setSortOption(opt); setShowSortDropdown(false); }}
                          className={`w-full text-left px-5 py-3 text-sm font-bold transition-all ${sortOption === opt ? 'bg-olive-50 text-olive-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className=\"flex flex-wrap gap-2\">
              {selectedCategory !== \"All\" && (
                <button onClick={() => setSelectedCategory(\"All\")} className=\"flex items-center gap-2 px-3 py-1.5 bg-olive-100 text-olive-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-olive-200 transition-all\">
                  Cat: {selectedCategory} <FiX />
                </button>
              )}
              {selectedBrand !== \"All\" && (
                <button onClick={() => setSelectedBrand(\"All\")} className=\"flex items-center gap-2 px-3 py-1.5 bg-olive-100 text-olive-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-olive-200 transition-all\">
                  Brand: {selectedBrand} <FiX />
                </button>
              )}
              {priceRange !== \"All\" && (
                <button onClick={() => setPriceRange(\"All\")} className=\"flex items-center gap-2 px-3 py-1.5 bg-olive-100 text-olive-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-olive-200 transition-all\">
                   {priceRange} <FiX />
                </button>
              )}
              {selectedRating > 0 && (
                <button onClick={() => setSelectedRating(0)} className=\"flex items-center gap-2 px-3 py-1.5 bg-olive-100 text-olive-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-olive-200 transition-all\">
                  {selectedRating}+ Stars <FiX />
                </button>
              )}
              {searchTerm && (
                <button onClick={() => setSearchTerm(\"\")} className=\"flex items-center gap-2 px-3 py-1.5 bg-olive-100 text-olive-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-olive-200 transition-all\">
                  Search: {searchTerm} <FiX />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6\">
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            sortedProducts.map(product => {
              const id = product._id || product.id;
              return (
                <motion.div 
                  layout
                  key={id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className=\"group bg-white rounded-3xl border border-gray-100 p-4 relative flex flex-col hover:shadow-2xl hover:border-olive-200 transition-all duration-500\"
                >
                  {product.discount_price && (
                    <span className=\"absolute top-6 left-6 z-10 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-red-500/20\">Sale</span>
                  )}
                  
                  <div className=\"relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4\">
                    <img src={product.image || FALLBACK_IMG} alt={product.name} className=\"w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700\" />
                    
                    {/* Overlay Actions */}
                    <div className=\"absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2\">
                      <button 
                        onClick={(e) => openQuickView(e, product)}
                        className=\"w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:bg-olive-600 hover:text-white transition-all shadow-xl active:scale-90\"
                      >
                        <FiEye size={20} />
                      </button>
                      <button className=\"w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 hover:text-red-500 transition-all shadow-xl active:scale-90\">
                        <FiHeart size={20} />
                      </button>
                    </div>
                  </div>

                  <div className=\"flex-1\">
                    <div className=\"flex justify-between items-start mb-1\">
                      <p className=\"text-[10px] font-black text-gray-400 uppercase tracking-widest\">{product.brand || 'Original'}</p>
                      <div className=\"flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full\">
                        <FiStar size={10} className=\"text-yellow-500 fill-yellow-500\" />
                        <span className=\"text-[10px] font-black text-yellow-700\">{product.rating || 4.0}</span>
                      </div>
                    </div>
                    <Link to={`/product/${id}`} className=\"text-sm font-bold text-gray-900 hover:text-olive-600 line-clamp-2 mb-4 leading-snug\">{product.name}</Link>
                    
                    <div className=\"flex items-center justify-between mt-auto pt-4 border-t border-gray-50\">
                      <div>
                        {product.discount_price && <p className=\"text-[10px] text-gray-400 line-through\">₹{Number(product.price).toLocaleString()}</p>}
                        <p className=\"text-lg font-black text-gray-900 tracking-tighter italic\">₹{Number(product.discount_price || product.price || 999).toLocaleString()}</p>
                      </div>
                      
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stock === 0}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${addedToCart[id] ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-olive-600 active:scale-95 shadow-lg shadow-gray-900/10'}`}
                      >
                        {product.stock === 0 ? <span className=\"text-[8px] font-black uppercase\">Sold</span> : (addedToCart[id] ? <FiCheck size={18}/> : <FiShoppingCart size={18}/>)}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {!loading && sortedProducts.length === 0 && (
          <div className=\"text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200\">
            <div className=\"w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6\">
              <FiSearch size={32} className=\"text-gray-300\" />
            </div>
            <h3 className=\"text-xl font-bold text-gray-900\">Zero Inventory Located</h3>
            <p className=\"text-gray-500 mt-2 max-w-xs mx-auto\">Your current parameters yielded no matches. Adjust your filters or reset to baseline.</p>
            <button onClick={clearAllFilters} className=\"mt-8 px-10 py-4 bg-gray-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-olive-600 transition-all\">Reset Parameters</button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}
