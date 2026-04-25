import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { products as productsApi } from "../services/api";
import { useCart } from "../context/CartContext";
import { 
  FiStar, FiChevronDown, FiSearch, FiCheck, 
  FiShoppingCart, FiSliders, FiHeart, FiX, FiEye, 
  FiGrid, FiList, FiArrowRight 
} from "react-icons/fi";
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
  const [sortOption, setSortOption] = useState("Featured");

  const [showFilters, setShowFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const priceRanges = ["All", "Under ₹1,000", "₹1,000 - ₹5,000", "₹5,000 - ₹10,000", "Over ₹10,000"];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getAllActive();
        const data = response.data;
        const validData = Array.isArray(data) ? data : (data?.data || []);
        setProducts(validData);

        const cats = ["All", ...new Set(validData.map(p => p.category_name).filter(Boolean))];
        setDynamicCategories(cats);
        
        const bnd = ["All", ...new Set(validData.map(p => p.brand).filter(Boolean))];
        setBrands(bnd);
      } catch (err) {
        setError("Failed to load catalog. System offline.");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category_name === selectedCategory;
      const matchesBrand = selectedBrand === "All" || p.brand === selectedBrand;
      
      let matchesPrice = true;
      if (priceRange === "Under ₹1,000") matchesPrice = p.price < 1000;
      else if (priceRange === "₹1,000 - ₹5,000") matchesPrice = p.price >= 1000 && p.price <= 5000;
      else if (priceRange === "₹5,000 - ₹10,000") matchesPrice = p.price > 5000 && p.price <= 10000;
      else if (priceRange === "Over ₹10,000") matchesPrice = p.price > 10000;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    if (sortOption === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    else if (sortOption === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    else if (sortOption === "Newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortOption]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product, 1);
    const prodId = product.id || product._id;
    setAddedToCart(prev => ({ ...prev, [prodId]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [prodId]: false })), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Scanning Inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">The Nexus Catalog</h1>
          <p className="text-slate-400 max-w-xl">Deploy high-performance hardware for your vehicle. Precision filters for ultimate results.</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className={`lg:w-64 space-y-10 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Filters block remains unchanged */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Hardware ID</h3>
              <div className="relative">
                <input type="text" placeholder="Search parts..." className="w-full bg-slate-50 border-none px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Deployment Category</h3>
              <div className="space-y-2">
                {dynamicCategories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`block w-full text-left px-3 py-2 text-sm transition-all ${selectedCategory === cat ? 'bg-emerald-500 text-black font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Price Bracket</h3>
              <div className="space-y-2">
                {priceRanges.map(range => (
                  <button key={range} onClick={() => setPriceRange(range)} className={`block w-full text-left px-3 py-2 text-sm transition-all ${priceRange === range ? 'bg-emerald-500 text-black font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>{range}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Manufacturer</h3>
              <div className="space-y-2">
                {brands.map(brand => (
                  <button key={brand} onClick={() => setSelectedBrand(brand)} className={`block w-full text-left px-3 py-2 text-sm transition-all ${selectedBrand === brand ? 'bg-emerald-500 text-black font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>{brand}</button>
                ))}
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="text-sm text-slate-500">Displaying <span className="text-slate-900 font-bold">{filteredProducts.length}</span> units found in sector</div>
              <div className="flex items-center gap-4">
                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-widest"><FiSliders /> Filters</button>
                <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-transparent border-none text-sm font-bold uppercase tracking-widest focus:ring-0 cursor-pointer">
                  <option>Featured</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => {
                  const prodId = product.id || product._id || `shop-prod-${index}`;
                  const productLink = product.slug ? `/product/slug/${product.slug}` : `/product/${prodId}`;
                  const parsedImage = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;

                  return (
                    <motion.div layout key={prodId} className="group border border-slate-100 hover:border-emerald-500/30 transition-all p-4 bg-white">
                      <Link to={productLink} className="block relative aspect-square overflow-hidden bg-slate-50 mb-4">
                        <img src={parsedImage?.[0] || FALLBACK_IMG} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        {product.flash_sale_active && <div className="absolute top-3 left-3 bg-emerald-500 text-black text-[10px] font-black px-2 py-1 uppercase tracking-tighter">Limited Stock</div>}
                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent flex gap-2">
                          <button onClick={(e) => { e.preventDefault(); setQuickViewProduct(product); }} className="flex-1 bg-white text-black py-2 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-colors">Scan</button>
                          <button onClick={(e) => handleAddToCart(e, product)} className={`flex-1 py-2 text-xs font-black uppercase tracking-widest transition-all ${addedToCart[prodId] ? 'bg-emerald-500 text-black' : 'bg-black text-white hover:bg-slate-800'}`}>
                            {addedToCart[prodId] ? <FiCheck className="mx-auto" /> : 'Deploy'}
                          </button>
                        </div>
                      </Link>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.brand}</span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500"><FiStar className="fill-current" /> {product.rating || "4.8"}</div>
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase leading-tight truncate">{product.name}</h4>
                        <div className="text-lg font-mono text-slate-900">₹{product.price?.toLocaleString()}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-slate-100">
                <FiSearch className="mx-auto text-4xl text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 uppercase">No Hardware Found</h3>
                <p className="text-slate-400">Try adjusting your deployment filters.</p>
                <button onClick={() => { setSearchTerm(""); setSelectedCategory("All"); setSelectedBrand("All"); setPriceRange("All"); }} className="mt-6 text-emerald-500 font-bold uppercase tracking-widest text-sm hover:underline">Reset Nexus</button>
              </div>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {quickViewProduct && <QuickViewModal product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}
