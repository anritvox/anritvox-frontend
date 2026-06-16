import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Heart, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import MiniCart from './MiniCart';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img 
                src="/logo.jpeg" 
                alt="Anritvox Logo" 
                className="h-10 sm:h-12 w-auto object-contain rounded-md block"
                style={{ display: 'block', visibility: 'visible', opacity: 1 }}
                onError={(e) => {
                  console.error("Navbar logo load failed, ensuring fallback visibility parameters.");
                  e.target.onerror = null;
                  e.target.src = "/logo.jpeg";
                }}
              />
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                Anritvox
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            <Link to="/shop" className="hover:text-emerald-600 transition-colors">Shop All</Link>
            <Link to="/shop?category=soap" className="hover:text-emerald-600 transition-colors">Natural Soaps</Link>
            <Link to="/shop?category=facewash" className="hover:text-emerald-600 transition-colors">Face Washes</Link>
            <Link to="/about" className="hover:text-emerald-600 transition-colors">Our Story</Link>
            <Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search natural skincare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 text-sm rounded-full pl-4 pr-10 py-2 border border-gray-200 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-emerald-600">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Icon Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user?.role === 'admin' && (
              <Link to="/admin" className="p-2 text-gray-600 hover:text-emerald-600 transition-colors" title="Admin Dashboard">
                <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            )}

            <Link to="/profile" className="p-2 text-gray-600 hover:text-emerald-600 transition-colors" title="My Account">
              <User className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>

            <Link to="/wishlist" className="p-2 text-gray-600 hover:text-emerald-600 transition-colors relative" title="Wishlist">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)} 
              className="p-2 text-gray-600 hover:text-emerald-600 transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {user && (
              <button 
                onClick={handleLogout}
                className="hidden sm:inline-flex p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fadeIn">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <form onSubmit={handleSearchSubmit} className="relative my-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 text-sm rounded-md pl-3 pr-10 py-2 border border-gray-200 focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600">Shop All</Link>
            <Link to="/shop?category=soap" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600">Natural Soaps</Link>
            <Link to="/shop?category=facewash" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600">Face Washes</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600">Our Story</Link>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-emerald-600">Contact</Link>
            {user && (
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Logout Account
              </button>
            )}
          </div>
        </div>
      )}

      {/* Slide-out Overlay Mini Cart Component */}
      <MiniCart />
    </header>
  );
}
