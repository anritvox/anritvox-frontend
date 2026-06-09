import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, User, Search, Menu, X, Car, 
  ChevronDown, Package, Zap, Gift, ShieldCheck, 
  MapPin, Sparkles, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { search } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  

  const [isMenuOpen, setMenuOpen] = useState(false);
  

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isAiPowered, setIsAiPowered] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeout = useRef(null);
  
  const navigate = useNavigate();
  const searchDropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSearchDropdown(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length > 2) {
      setIsSearching(true);
      
      searchTimeout.current = setTimeout(async () => {
        try {
          const res = await search.query(query, 5);
          if (res.data?.success || res.data) {
            setSuggestions(res.data?.data || res.data);
            setIsAiPowered(res.data?.isAiPowered || true);
          }
        } catch (error) {
          console.error("Search Engine Failure:", error);
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      }, 400); 
    } else {
      setSuggestions([]);
      setIsAiPowered(false);
    }
  };

  const executeFullSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  const quickLinks = [
    { label: 'Audio', path: '/shop?category=Audio' },
    { label: 'Lighting', path: '/shop?category=Lights' },
    { label: 'Android Players', path: '/shop?category=Android%20Players' },
    { label: 'All Products', path: '/shop' }
  ];

  return (
    <>
      {}
      <div className="bg-[#050505] text-slate-400 py-1.5 px-6 text-[9px] font-black uppercase tracking-widest hidden md:block border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 hover:text-olive-400 transition-colors cursor-pointer"><ShieldCheck size={12} className="text-olive-400" /> 100% Secure Checkout</span>
            <span className="flex items-center gap-2 hover:text-olive-400 transition-colors cursor-pointer"><MapPin size={12} className="text-olive-400" /> Track Order</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/ewarranty" className="hover:text-olive-400 transition-colors">Warranty Center</Link>
            <Link to="/contact" className="hover:text-olive-400 transition-colors">Help Center</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-olive-400 flex items-center gap-1.5"><Activity size={12}/> Admin Dashboard</Link>
            )}
          </div>
        </div>
      </div>

      {}
      <nav className="bg-slate-950/90 backdrop-blur-xl border-b border-slate-900 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          
          <button onClick={() => setMenuOpen(!isMenuOpen)} className="md:hidden text-slate-400 hover:text-white transition-colors">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="h-10 flex items-center rounded-lg transition-transform duration-300 group-hover:scale-[1.02]">
              <img 
                src="/logo-rect.jpeg" 
                alt="Anritvox Logo" 
                className="h-full w-auto object-contain"
                onError={(e) => { 
                  e.target.style.display = 'none';
                  const fallbackNode = document.getElementById('navbar-brand-fallback-node');
                  if (fallbackNode) fallbackNode.style.display = 'block';
                }}
              />
              <span id="navbar-brand-fallback-node" className="text-2xl font-black tracking-tighter italic uppercase text-white hidden">
                Anritvox
              </span>
            </div>
          </Link>

          {}
          <div className="hidden md:flex flex-1 max-w-2xl relative" ref={searchDropdownRef}>
            <form onSubmit={executeFullSearch} className="w-full relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-olive-400 transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearch}
                onFocus={() => { if(searchQuery.length > 2) setShowSearchDropdown(true); }}
                placeholder="Search products (e.g., 'car speakers', 'LED lights')..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-mono text-white focus:border-olive-400/50 focus:bg-slate-900 transition-all outline-none placeholder:text-slate-600 shadow-inner"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-olive-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-olive-300 transition-colors opacity-0 group-focus-within:opacity-100">
                Search
              </button>
            </form>

            {showSearchDropdown && (searchQuery.length > 2) && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                 <div className="bg-olive-400/5 px-5 py-3 border-b border-olive-400/10 flex items-center justify-between">
                   <div className="flex items-center text-[10px] font-black uppercase text-olive-400 tracking-[0.2em]">
                     <Sparkles size={14} className="mr-2 animate-pulse" />
                     {isAiPowered ? 'Product Suggestions' : 'Standard Search'}
                   </div>
                   {isSearching && <div className="w-4 h-4 border-2 border-olive-400/30 border-t-olive-400 rounded-full animate-spin"></div>}
                 </div>

                 <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                   {suggestions.length === 0 && !isSearching ? (
                     <div className="p-8 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
                       No accessories found matching criteria.
                     </div>
                   ) : (
                     suggestions.map(s => (
                       <Link 
                         key={s.id || s._id} 
                         to={`/product/${s.slug || s.id || s._id}`} 
                         onClick={() => setShowSearchDropdown(false)}
                         className="flex items-center p-4 hover:bg-slate-800/80 transition-colors border-b border-slate-800/50 last:border-none group"
                       >
                          <img 
                            src={s.images?.[0] || s.image_url || '/logo-rect.jpeg'} 
                            className="w-12 h-12 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1 mr-4 group-hover:border-olive-400/30 transition-colors" 
                            alt={s.name} 
                            onError={(e) => { e.target.src = '/logo-rect.jpeg'; }}
                          />
                          <div className="flex-1">
                             <div className="text-sm font-black uppercase text-white group-hover:text-olive-400 transition-colors truncate">{s.name}</div>
                             <div className="text-xs font-mono font-bold text-olive-400 mt-1">₹{s.discount_price || s.price}</div>
                          </div>
                          <ChevronDown size={16} className="-rotate-90 text-slate-600 group-hover:text-olive-400 group-hover:translate-x-1 transition-all" />
                       </Link>
                     ))
                   )}
                 </div>
              </div>
            )}
          </div>

          {}
          <div className="flex items-center space-x-4 sm:space-x-6 shrink-0">
            {user ? (
              <Link to="/profile" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 group-hover:border-olive-400 transition-colors relative">
                   <User size={18} className="text-slate-400 group-hover:text-olive-400 transition-colors" />
                   <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-olive-400 rounded-full border-2 border-slate-950"></span>
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">Account</div>
                  <div className="text-xs font-black text-white truncate max-w-[100px]">{user.name?.split(' ')[0]}</div>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-olive-400 hover:text-slate-950 hover:border-olive-400 transition-all">
                Login
              </Link>
            )}

            <Link to="/cart" className="relative p-2.5 text-slate-400 bg-slate-900 border border-slate-800 rounded-xl hover:text-olive-400 hover:border-olive-400/50 transition-all group">
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              {cartItems?.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-olive-400 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950 shadow-[0_0_10px_rgba(128,141,100,0.5)]">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {}
        <div className="hidden md:flex border-t border-slate-900 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6 w-full flex items-center gap-8">
            <div className="flex items-center gap-8 flex-1">
              {quickLinks.map((link, i) => (
                <Link key={i} to={link.path} className="flex items-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors text-slate-400 hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden p-4 bg-slate-950 border-b border-slate-900">
         <form onSubmit={executeFullSearch} className="relative">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={handleSearch}
             placeholder="Search products..."
             className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white outline-none focus:border-olive-400/50"
           />
         </form>
      </div>
    </>
  );
}

const getImageUrl = (img) => {
  if (!img) return '/logo-rect.jpeg';
  let path = typeof img === 'object' ? (img.file_path || img.url || img.path) : img;
  if (!path) return '/logo-rect.jpeg';
  if (path.startsWith('http')) return path;
  
  const baseUrl = import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_IMAGE_BASE_URL || 'https://pub-22cd43cce9bc475680ad496e199706c4.r2.dev';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};
