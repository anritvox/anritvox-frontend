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
          
          {/* Logo Brand Section - Text Removed, Pure Luxury Logo Only */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center block transition-opacity hover:opacity-90">
              <img 
                src="/logo.jpeg" 
                alt="Anritvox Logo" 
                className="h-11 sm:h-14 w-auto object-contain rounded-xl block border border-gray-100 shadow-sm"
                style={{ display: 'block', visibility: 'visible', opacity: 1 }}
                onError={(e) => {
                  console.error("Navbar logo load failed, ensuring fallback visibility parameters.");
                  e.target.onerror = null;
                  e.target.src = "/logo.jpeg";
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 text-xs font-black uppercase tracking-widest text-gray-600 ml-8">
            <Link to="/shop" className="hover:text-emerald-700 transition-colors">Shop All</Link>
            <Link to="/shop?category=dashboard" className="hover:text-emerald-700 transition-colors">Infotainment Screens</Link>
            <Link to="/shop?category=audio" className="hover:text-emerald-700 transition-colors">Premium Audio</Link>
            <Link to="/shop?category=lighting" className="hover:text-emerald-700 transition-colors">Ambient Modules</Link>
            <Link to="/about" className="hover:text-emerald-700 transition-colors">Our Ethos</Link>
          </nav>

          {/* Search Bar - Premium Matte Field */}
          <div className="hidden lg:block flex-1 max-w-xs mx-6">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search premium upgrades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 font-medium text-gray-900 placeholder-gray-400 text-xs rounded-xl pl-4 pr-10 py-2.5 border border-gray-200/80 focus:outline-none focus:border-emerald-700 focus:bg-white transition-all"
              />
              <button type="submit" className="absolute right-3 top-3 text-gray-400 hover:text-emerald-700 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Icon Actions Matrix */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {user?.role === 'admin' && (
              <Link to="/admin" className="p-2 text-gray-500 hover:text-emerald-700 transition-colors" title="Admin Control Center">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            )}

            <Link to="/profile" className="p-2 text-gray-500 hover:text-emerald-700 transition-colors" title="My Account Profile">
              <User className="h-5 w-5" />
            </Link>

            <Link to="/wishlist" className="p-2 text-gray-500 hover:text-emerald-700 transition-colors relative" title="Saved Upgrades">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-700 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)} 
              className="p-2 text-gray-500 hover:text-emerald-700 transition-colors relative"
              title="Shopping Cart Bundle"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-700 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {user && (
              <button 
                onClick={handleLogout}
                className="hidden sm:inline-flex p-2 text-gray-500 hover:text-rose-600 transition-colors"
                title="Secure Disconnect"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}

            {/* Mobile Menu Activation Node */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-emerald-700 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation System */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-inner">
          <div className="px-4 pt-3 pb-6 space-y-1.5">
            <form onSubmit={handleSearchSubmit} className="relative my-2">
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl pl-3 pr-10 py-2.5 border border-gray-200 focus:outline-none focus:border-emerald-700"
              />
              <button type="submit" className="absolute right-3 top-3 text-gray-400">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-emerald-700">Shop All Hardware</Link>
            <Link to="/shop?category=dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-emerald-700">Infotainment Screens</Link>
            <Link to="/shop?category=audio" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-emerald-700">Premium Audio</Link>
            <Link to="/shop?category=lighting" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-emerald-700">Ambient Modules</Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:text-emerald-700">Our Ethos</Link>
            {user && (
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full text-left block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50"
              >
                Disconnect Session
              </button>
            )}
          </div>
        </div>
      )}

      {/* Slide-out Overlay Drawer Component */}
      <MiniCart />
    </header>
  );
}
