import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.webp";
import { ShoppingCart, Search, Menu, X, ChevronDown, User, Package } from "lucide-react";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Read user from localStorage if logged in
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
    // Read cart count
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + (item.qty || 1), 0));
    } catch {}
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="bg-[#131921] text-white font-sans antialiased sticky top-0 z-50">

      {/* Top Bar */}
      <div className="max-w-[1500px] mx-auto px-4 py-2 flex items-center gap-4 h-16">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 border border-transparent hover:border-white p-1 rounded-sm">
          <img src={logo} alt="Anritvox" className="h-8 w-auto invert brightness-0" />
        </Link>

        {/* Deliver to India */}
        <div className="hidden lg:flex items-center gap-1 border border-transparent hover:border-white p-1 rounded-sm cursor-pointer ml-2">
          <svg className="w-5 h-5 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 leading-none">Deliver to</span>
            <span className="text-sm font-bold leading-none">India</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex bg-white rounded-md overflow-hidden h-10 ml-2">
          <select className="bg-gray-100 text-gray-600 px-3 border-r text-xs outline-none cursor-pointer hover:bg-gray-200">
            <option>All</option>
            <option>Interior</option>
            <option>Exterior</option>
            <option>Accessories</option>
            <option>Electronics</option>
          </select>
          <input
            type="text"
            className="flex-1 px-4 py-1 text-black text-sm outline-none"
            placeholder="Search Anritvox..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-[#39d353] hover:bg-[#2cb544] px-4 flex items-center justify-center transition-colors">
            <Search className="h-5 w-5 text-black" />
          </button>
        </form>

        {/* Account & Lists */}
        <Link to={user ? "/account" : "/login"} className="hidden md:flex flex-col border border-transparent hover:border-white p-1 rounded-sm cursor-pointer">
          <span className="text-xs text-gray-400 leading-none">
            {user ? `Hello, ${user.name?.split(" ")[0] || "User"}` : "Hello, Sign in"}
          </span>
          <span className="text-sm font-bold leading-none flex items-center gap-1">
            Account & Lists <ChevronDown className="h-3 w-3" />
          </span>
        </Link>

        {/* Returns & Orders */}
        <Link to="/orders" className="hidden md:flex flex-col border border-transparent hover:border-white p-1 rounded-sm cursor-pointer">
          <span className="text-xs text-gray-400 leading-none">Returns</span>
          <span className="text-sm font-bold leading-none">&amp; Orders</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className="flex items-end gap-1 border border-transparent hover:border-white p-1 rounded-sm">
          <div className="relative">
            <ShoppingCart className="h-8 w-8" />
            <span className="absolute -top-1 -right-1 bg-[#39d353] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <span className="text-sm font-bold hidden sm:block">Cart</span>
        </Link>

        {/* Hamburger for mobile */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 hover:bg-white/10 rounded">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#232f3e] px-4 py-1.5 flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap">
        <button className="flex items-center gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm font-bold">
          <Menu className="h-4 w-4" /> All
        </button>
        <Link to="/" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">Home</Link>
        <Link to="/shop" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">Shop</Link>
        <Link to="/ewarranty" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">E-Warranty</Link>
        <Link to="/contact" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">Contact Us</Link>
        <Link to="/shop?category=Electronics" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">Electronics</Link>
        <Link to="/shop?sort=bestsellers" className="border border-transparent hover:border-white px-2 py-1 rounded-sm text-[#39d353] font-bold">Best Sellers</Link>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#232f3e] px-4 py-3 flex flex-col gap-3 border-t border-gray-600">
          <form onSubmit={handleSearch} className="flex bg-white rounded-md overflow-hidden h-10">
            <input
              type="text"
              className="flex-1 px-4 py-1 text-black text-sm outline-none"
              placeholder="Search Anritvox..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-[#39d353] px-4"><Search className="h-5 w-5 text-black" /></button>
          </form>
          <Link to="/" onClick={() => setOpen(false)} className="font-bold text-lg hover:text-[#39d353]">Home</Link>
          <Link to="/shop" onClick={() => setOpen(false)} className="font-bold text-lg hover:text-[#39d353]">Shop</Link>
          <Link to="/ewarranty" onClick={() => setOpen(false)} className="font-bold text-lg hover:text-[#39d353]">E-Warranty</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="font-bold text-lg hover:text-[#39d353]">Contact</Link>
          <Link to={user ? "/account" : "/login"} onClick={() => setOpen(false)} className="font-bold text-lg hover:text-[#39d353]">
            {user ? `My Account` : "Sign In"}
          </Link>
          <Link to="/cart" onClick={() => setOpen(false)} className="font-bold text-lg hover:text-[#39d353]">Cart ({cartCount})</Link>
        </div>
      )}
    </nav>
  );
}
