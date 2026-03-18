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
            <FiSearch size={18} className="text-gray-900" />
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
                <FiUser size={20} />
                {user.name?.split(" ")[0]}
                <FiChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50 py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    <FiUser size={16} /> My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    <FiPackage size={16} /> My Orders
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full text-left text-red-600"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-[#febd69] text-sm">
              <FiUser size={20} />
              Sign In
            </Link>
          )}
          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-1 hover:text-[#febd69] relative">
            <FiShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#febd69] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
            <span className="text-sm hidden md:inline">Cart</span>
          </Link>
          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden">
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile nav */}
      {open && (
        <div className="md:hidden bg-[#232f3e] px-4 py-3 flex flex-col gap-3">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Home</Link>
          <Link to="/shop" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Shop</Link>
          <Link to="/e-warranty" onClick={() => setOpen(false)} className="hover:text-[#febd69]">E-Warranty</Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Contact</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setOpen(false)} className="hover:text-[#febd69]">My Profile</Link>
              <Link to="/my-orders" onClick={() => setOpen(false)} className="hover:text-[#febd69]">My Orders</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-red-400 hover:text-red-300">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="hover:text-[#febd69]">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
