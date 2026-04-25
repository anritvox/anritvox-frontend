import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Mic, Camera, SlidersHorizontal, Grid, List, 
  ChevronDown, Star, ShoppingCart, Heart, Eye, X, Filter, Zap, Award
} from 'lucide-react';
import { products as productsApi, categories as categoriesApi } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <div className="group relative flex flex-col bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
      <Link to={`/product/${product.slug || product.id}`} className="relative aspect-square overflow-hidden bg-black/20">
        <img 
          src={product.image_url || 'https://www.anritvox.com/logo.webp'} 
          className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" 
          alt={product.name} 
        />
        <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <button className="p-4 bg-white text-black rounded-full hover:bg-emerald-400 transition-all">
            <Heart size={18} />
          </button>
          <button className="p-4 bg-white text-black rounded-full hover:bg-emerald-400 transition-all">
            <Eye size={18} />
          </button>
        </div>
        {product.is_featured && (
          <div className="absolute top-6 left-6 px-4 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            Elite Gear
          </div>
        )}
      </Link>
      
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{product.category_name}</span>
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-black">{product.rating || '5.0'}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-black uppercase tracking-tight line-clamp-2 mb-6 group-hover:text-emerald-500 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-white">₹{product.discount_price || product.price}</span>
            {product.discount_price && (
              <span className="text-xs font-bold text-slate-600 line-through">₹{product.price}</span>
            )}
          </div>
          <button 
            onClick={() => addToCart(product)}
            className="p-4 bg-emerald-500 text-black rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productsApi.getAllActive(),
          categoriesApi.getAll()
        ]);
        setProducts(prodRes.data?.data || prodRes.data || []);
        setCategories(catRes.data?.data || catRes.data || []);
      } catch (err) {
        console.error("Shop fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || p.category_id?.toString() === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice search not supported in this browser.");
    
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header & Search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="max-w-xl">
            <h1 className="text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
              Hardware <span className="text-emerald-500">Registry.</span>
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Showing {filteredProducts.length} high-performance modules in active inventory
            </p>
          </div>

          <div className="flex-1 max-w-2xl w-full">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search by model, brand, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl pl-16 pr-32 py-6 text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
              />
              <div className="absolute inset-y-2 right-2 flex gap-2">
                <button 
                  onClick={startVoiceSearch}
                  className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  <Mic size={20} />
                </button>
                <button className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:text-white hover:bg-slate-700 transition-all">
                  <Camera size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-8 py-8 border-y border-slate-900 mb-12">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex-shrink-0 ${selectedCategory === 'all' ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-800 text-slate-500 hover:border-white hover:text-white'}`}
            >
              All Gear
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex-shrink-0 ${selectedCategory === cat.id.toString() ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-800 text-slate-500 hover:border-white hover:text-white'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-900 border border-slate-800 rounded-2xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-xl' : 'text-slate-500'}`}
              >
                <List size={18} />
              </button>
            </div>
            <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-emerald-500 transition-all">
              <SlidersHorizontal size={18} /> Filter
            </button>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-900 rounded-[2.5rem] animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" : "flex flex-col gap-6"}>
            {filteredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <div className="inline-flex p-12 bg-slate-900/50 rounded-[4rem] text-slate-700 mb-8">
              <Search size={80} />
            </div>
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Registry Null</h3>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No hardware matching "{searchTerm}" found in selected sectors.</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-8 text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-all">Reset All Filters</button>
          </div>
        )}

      </div>
    </div>
  );
}
