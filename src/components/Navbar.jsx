import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";

export default function NavBar() {
  const [open, setOpen] = useState(false);

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
          <svg className="w-5 h-5 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 leading-none">Deliver to</span>
            <span className="text-sm font-bold leading-none">India</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 hidden md:flex bg-white rounded-md overflow-hidden h-10 ml-2">
          <select className="bg-gray-100 text-gray-600 px-3 border-r text-xs outline-none cursor-pointer hover:bg-gray-200">
            <option>All</option>
          </select>
          <input 
            type="text" 
            className="flex-1 px-4 py-1 text-black text-sm outline-none"
            placeholder="Search Anritvox..."
          />
          <button className="bg-[#febd69] hover:bg-[#f3a847] px-5 text-gray-800 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
        </div>

        {/* Account & Lists */}
        <Link to="/admin/login" className="flex flex-col border border-transparent hover:border-white p-1 rounded-sm ml-2">
          <span className="text-xs leading-none">Hello, Admin</span>
          <span className="text-sm font-bold leading-none">Account & Lists</span>
        </Link>

        {/* Returns & Orders */}
        <div className="hidden md:flex flex-col border border-transparent hover:border-white p-1 rounded-sm ml-2 cursor-pointer">
          <span className="text-xs leading-none">Returns</span>
          <span className="text-sm font-bold leading-none">& Orders</span>
        </div>

        {/* Cart */}
        <div className="flex items-end border border-transparent hover:border-white p-1 rounded-sm ml-2 cursor-pointer relative">
          <div className="relative">
            <span className="absolute -top-1 left-3 text-[#f08804] font-bold text-base">0</span>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <span className="font-bold text-sm hidden sm:block">Cart</span>
        </div>
        
        {/* Hamburger for mobile */}
        <button className="md:hidden p-1" onClick={() => setOpen(!open)}>
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#232f3e] px-4 py-1 flex items-center gap-4 text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button className="flex items-center gap-1 border border-transparent hover:border-white px-2 py-1 rounded-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          All
        </button>
        <Link to="/" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">Home</Link>
        <Link to="/shop" className="border border-transparent hover:border-white px-2 py-1 rounded-sm font-bold">Shop</Link>
        <Link to="/ewarranty" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">E-Warranty</Link>
        <Link to="/contact" className="border border-transparent hover:border-white px-2 py-1 rounded-sm">Contact Us</Link>
        <span className="border border-transparent hover:border-white px-2 py-1 rounded-sm cursor-pointer text-gray-300">Best Sellers</span>
        <span className="border border-transparent hover:border-white px-2 py-1 rounded-sm cursor-pointer text-gray-300">Electronics</span>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white text-black absolute top-full left-0 w-full shadow-2xl z-50 p-4 border-t">
           <div className="flex flex-col gap-4">
              <Link to="/" onClick={() => setOpen(false)} className="font-bold text-lg">Home</Link>
              <Link to="/shop" onClick={() => setOpen(false)} className="font-bold text-lg">Shop</Link>
              <Link to="/ewarranty" onClick={() => setOpen(false)} className="font-bold text-lg">E-Warranty</Link>
              <Link to="/contact" onClick={() => setOpen(false)} className="font-bold text-lg">Contact</Link>
           </div>
        </div>
      )}
    </nav>
  );
}
