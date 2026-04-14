// src/components/Navbar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.webp";
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiPackage, FiHeart, FiTrendingUp, FiGift } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { searchProductSuggestions } from "../services/api";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      setSuggestionsLoading(true);
      const data = await searchProductSuggestions(q);
      const list = Array.isArray(data) ? data : (data?.suggestions || []);
      setSuggestions(list.slice(0, 6));
      setShowSuggestions(list.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setOpen(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const term = suggestion.name || suggestion;
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    setSearchQuery("");
    setShowSuggestions(false);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#131921] text-white font-sans antialiased sticky top-0 z-50">
      {/* Main Header Container */}
      <div className="max-w-[1500px] mx-auto p-2 flex items-center gap-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Anritvox" className="h-10 object-contain" />
        </Link>

        {/* Desktop Smart Search Bar */}
        <div ref={searchRef} className="hidden md:flex flex-1 items-center max-w-2xl relative mx-4">
          <form onSubmit={handleSearch} className="flex flex-1 items-center bg-[#232f3e] border border-gray-700 rounded overflow-hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search products..."
              className="flex-1 px-3 py-2 bg-transparent text-white text-sm outline-none placeholder-gray-400"
            />
            <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-4 py-2">
              <FiSearch size={18} className="text-gray-900" />
            </button>
          </form>
          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b shadow-lg z-50 max-h-72 overflow-y-auto">
              {suggestionsLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500 animate-pulse">Searching...</div>
              ) : (
                suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 text-left transition-colors"
                  >
                    <FiSearch size={13} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{s.name || s}</span>
                    {s.category && <span className="ml-auto text-xs text-gray-400 flex-shrink-0">{typeof s.category === 'object' ? s.category.name : s.category}</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" className="hidden md:flex items-center gap-1 hover:text-[#febd69] text-sm">
              <FiHeart size={20} />
              <span className="text-xs">Wishlist</span>
            </Link>
          )}

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 hover:text-[#febd69] text-sm">
                <FiUser size={20} />
                <span>{user.name?.split(" ")[0]}</span>
                <FiChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-white text-gray-800 rounded shadow-lg z-50 py-1">
                  <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"><FiUser size={14} /> Dashboard</Link>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"><FiUser size={14} /> My Profile</Link>
                  <Link to="/order-tracking" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"><FiPackage size={14} /> My Orders</Link>
                  <Link to="/loyalty" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"><FiTrendingUp size={14} /> Loyalty Points</Link>
                  <Link to="/referral" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"><FiGift size={14} /> Refer & Earn</Link>
                  <hr className="my-1" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-red-500"><FiLogOut size={14} /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-[#febd69] text-sm"><FiUser size={20} /> Sign In</Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-1 hover:text-[#febd69] relative">
            <FiShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#febd69] text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            )}
            <span className="hidden md:inline text-sm">Cart</span>
          </Link>

          {/* Mobile Toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden ml-2">
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div ref={searchRef} className="md:hidden px-2 pb-2 relative">
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 bg-transparent text-black text-sm outline-none placeholder-gray-500"
          />
          <button type="submit" className="bg-[#febd69] px-4 py-2">
            <FiSearch size={16} className="text-gray-900" />
          </button>
        </form>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-2 right-2 bg-white border border-gray-200 rounded-b shadow-lg z-50 max-h-56 overflow-y-auto">
            {suggestions.map((s, i) => (
              <button key={i} onMouseDown={() => handleSuggestionClick(s)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 text-left">
                <FiSearch size={12} className="text-gray-400" />
                <span className="truncate">{s.name || s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Nav Links */}
      {open && (
        <div className="md:hidden bg-[#232f3e] px-4 py-3 flex flex-col gap-3 text-sm">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Home</Link>
          <Link to="/shop" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Shop</Link>
          <Link to="/compare" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Compare</Link>
          <Link to="/ewarranty" onClick={() => setOpen(false)} className="hover:text-[#febd69]">E-Warranty</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Contact</Link>
          {user ? (
            <>
              <hr className="border-gray-600" />
              <Link to="/dashboard" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Dashboard</Link>
              <Link to="/wishlist" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Wishlist</Link>
              <Link to="/order-tracking" onClick={() => setOpen(false)} className="hover:text-[#febd69]">My Orders</Link>
              <Link to="/loyalty" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Loyalty Points</Link>
              <Link to="/referral" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Refer & Earn</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-red-400 hover:text-red-300">Logout</button>
            </>
          ) : (
            <>
              <hr className="border-gray-600" />
              <Link to="/login" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Sign In</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
