// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.webp";
import { ShoppingCart, Search, Menu, X, ChevronDown, User, LogOut, Package } from "lucide-react";
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
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#131921] text-white font-sans antialiased sticky top-0 z-50">
      <div className="max-w-[1500px] mx-auto my-4 p-2 flex items-center gap-4 h-16">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="Anritvox" className="h-10 object-contain" />
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex flex-1 items-center max-w-2xl bg-white rounded overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 text-gray-900 text-sm outline-none"
          />
          <button type="submit" className="bg-[#febd69] hover:bg-[#f3a847] px-4 py-2">
            <Search size={18} className="text-gray-900" />
          </button>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-4 ml-auto">
          {/* User menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1 hover:text-[#febd69] text-sm"
              >
                <User size={20} />
                <span className="hidden md:block max-w-[80px] truncate">{user.name}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded shadow-lg z-50">
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Package size={14} /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-500"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-[#febd69] text-sm">
              <User size={20} />
              <span className="hidden md:block">Sign In</span>
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-1 hover:text-[#febd69] relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#febd69] text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="hidden md:block text-sm">Cart</span>
          </Link>

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-[#232f3e] px-4 py-3 flex flex-col gap-3 text-sm">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Home</Link>
          <Link to="/shop" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Shop</Link>
          <Link to="/e-warranty" onClick={() => setOpen(false)} className="hover:text-[#febd69]">E-Warranty</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Contact</Link>
          {user ? (
            <>
              <Link to="/orders" onClick={() => setOpen(false)} className="hover:text-[#febd69]">My Orders</Link>
              <button onClick={handleLogout} className="text-left text-red-400 hover:text-red-300">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
