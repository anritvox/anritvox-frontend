import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#050505]/80 backdrop-blur-2xl border-t border-white/10 text-white font-sans antialiased mt-auto overflow-hidden">
      
      {/* Decorative ambient background glows for glassmorphism */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Back to Top - Glassmorphic */}
      <button 
        onClick={scrollToTop}
        className="relative w-full py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border-b border-white/5 text-sm font-medium transition-all duration-300 z-10"
      >
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="relative max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 z-10">
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Get to Know Us</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/about" className="hover:text-yellow-500 hover:underline transition-colors">About Anritvox</Link></li>
            <li><Link to="/about#careers" className="hover:text-yellow-500 hover:underline transition-colors">Careers</Link></li>
            <li><Link to="/about" className="hover:text-yellow-500 hover:underline transition-colors">Press Releases</Link></li>
            <li><Link to="/about" className="hover:text-yellow-500 hover:underline transition-colors">Anritvox Science</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Connect with Us</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="https://www.instagram.com/the_rsenterprises" target="_blank" rel="noreferrer" className="hover:text-yellow-500 hover:underline transition-colors">Instagram</a></li>
            <li><a href="https://facebook.com/anritvox" target="_blank" rel="noreferrer" className="hover:text-yellow-500 hover:underline transition-colors">Facebook</a></li>
            <li><a href="https://twitter.com/anritvox" target="_blank" rel="noreferrer" className="hover:text-yellow-500 hover:underline transition-colors">X (Twitter)</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Make Money with Us</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/admin/login" className="hover:text-yellow-500 hover:underline transition-colors">Sell on Anritvox</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-500 hover:underline transition-colors">Become an Affiliate</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-500 hover:underline transition-colors">Advertise Your Products</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Let Us Help You</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/ewarranty" className="hover:text-yellow-500 hover:underline transition-colors">E-Warranty Registration</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-500 hover:underline transition-colors">Returns Centre</Link></li>
            <li><Link to="/terms" className="hover:text-yellow-500 hover:underline transition-colors">100% Purchase Protection</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-500 hover:underline transition-colors">Help</Link></li>
          </ul>
        </div>
      </div>

      {/* Secondary Footer */}
      <div className="relative border-t border-white/10 py-10 flex flex-col items-center gap-6 z-10">
        <Link to="/">
          {/* mix-blend-screen instantly removes the black background from the image, keeping only the gold/white elements visible! */}
          <img src={logo} alt="Anritvox" className="h-16 object-contain mix-blend-screen opacity-90 hover:opacity-100 transition-opacity" />
        </Link>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 px-4">
           <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full cursor-pointer hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all shadow-sm">English</span>
           <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full cursor-pointer hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all shadow-sm">🇮🇳 India</span>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="relative bg-black/80 backdrop-blur-md py-8 px-4 text-center z-10 border-t border-white/5">
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium mb-3 text-gray-400">
           <Link to="/terms" className="hover:text-white transition-colors">Conditions of Use & Sale</Link>
           <Link to="/privacy" className="hover:text-white transition-colors">Privacy Notice</Link>
           <Link to="/privacy" className="hover:text-white transition-colors">Interest-Based Ads</Link>
        </div>
        <p className="text-[10px] text-gray-500">
          © {currentYear} Anritvox. All rights reserved. Developed by Akash Prasad
        </p>
      </div>
    </footer>
  );
}
