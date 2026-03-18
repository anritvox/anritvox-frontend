// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.webp";
import { FiShoppingCart, FiSearch, FiMenu, FiX, FiChevronDown, FiUser, FiLogOut, FiPackage } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setOpen(false); 
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#131921] text-white font-sans antialiased sticky top-0 z-50">
      {/* Top Row: Logo and Icons */}
      <div className="max-w-[1500px] mx-auto p-2 flex items-center justify-between gap-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Anritvox" className="h-10 object-contain" />
        </Link>
        
        {/* SHARED SEARCH BAR: Visible on Desktop middle, Hidden on Mobile middle */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 items-center max-w-2xl bg-[#232f3e] border border-gray-700 rounded overflow-hidden mx-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 bg-transparent text-white text-sm outline-none placeholder-gray-400"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-4 py-2">
            <FiSearch size={18} className="text-gray-900" />
          </button>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-4">
          {/* User menu logic - Keep as is */}
          {user ? (
             <div className="relative">
               <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-1 hover:text-[#febd69] text-sm">
                 <FiUser size={20} />
                 <span className="hidden sm:inline">{user.name?.split(" ")[0]}</span>
                 <FiChevronDown size={14} className="hidden sm:block" />
               </button>
               {/* ... (User dropdown content) */}
             </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-[#febd69] text-sm">
              <FiUser size={20} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          <Link to="/cart" className="flex items-center gap-1 hover:text-[#febd69] relative">
            <FiShoppingCart size={24} />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-[#febd69] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>}
          </Link>

          <button onClick={() => setOpen(!open)} className="md:hidden ml-2">
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH BAR: Visible only on mobile, below the logo row */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Anritvox"
            className="flex-1 px-3 py-2 bg-transparent text-black text-sm outline-none placeholder-gray-500"
          />
          <button type="submit" className="bg-[#febd69] px-4 py-2">
            <FiSearch size={18} className="text-gray-900" />
          </button>
        </form>
      </div>

      {/* Mobile nav links ONLY (No search bar here anymore) */}
      {open && (
        <div className="md:hidden bg-[#232f3e] px-4 py-3 flex flex-col gap-3 border-t border-gray-700">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Home</Link>
          <Link to="/shop" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Shop</Link>
          <Link to="/e-warranty" onClick={() => setOpen(false)} className="hover:text-[#febd69]">E-Warranty</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Contact</Link>
          {/* ... (Rest of your profile/logout links) */}
        </div>
      )}
    </nav>
  );
}
