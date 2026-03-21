import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#232f3e] text-white font-sans antialiased mt-auto">
      {/* Back to Top */}
      <button 
        onClick={scrollToTop}
        className="w-full py-4 bg-[#37475a] hover:bg-[#485769] text-sm font-medium transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Get to Know Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/about" className="hover:underline">About Anritvox</Link></li>
            <li><Link to="/about#careers" className="hover:underline">Careers</Link></li>
            <li><Link to="/about" className="hover:underline">Press Releases</Link></li>
            <li><Link to="/about" className="hover:underline">Anritvox Science</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Connect with Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="https://www.instagram.com/the_rsenterprises" target="_blank" rel="noreferrer" className="hover:underline">Instagram</a></li>
            <li><a href="https://facebook.com/anritvox" target="_blank" rel="noreferrer" className="hover:underline">Facebook</a></li>
            <li><a href="https://twitter.com/anritvox" target="_blank" rel="noreferrer" className="hover:underline">X (Twitter)</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Make Money with Us</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/admin/login" className="hover:underline">Sell on Anritvox</Link></li>
            <li><Link to="/contact" className="hover:underline">Become an Affiliate</Link></li>
            <li><Link to="/contact" className="hover:underline">Advertise Your Products</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-base mb-4 text-white">Let Us Help You</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/ewarranty" className="hover:underline">E-Warranty Registration</Link></li>
            <li><Link to="/contact" className="hover:underline">Returns Centre</Link></li>
            <li><Link to="/terms" className="hover:underline">100% Purchase Protection</Link></li>
            <li><Link to="/contact" className="hover:underline">Help</Link></li>
          </ul>
        </div>
      </div>

      {/* Secondary Footer */}
      <div className="border-t border-gray-700 py-10 flex flex-col items-center gap-6">
        <Link to="/">
          <img src={logo} alt="Anritvox" className="h-8 invert brightness-0" />
        </Link>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-300 px-4">
           <span className="border border-gray-600 px-3 py-1 rounded-sm cursor-pointer hover:bg-gray-700 transition-colors">English</span>
           <span className="border border-gray-600 px-3 py-1 rounded-sm cursor-pointer hover:bg-gray-700 transition-colors">🇮🇳 India</span>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="bg-[#131a22] py-8 px-4 text-center">
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium mb-3 text-gray-300">
           <Link to="/terms" className="hover:underline">Conditions of Use & Sale</Link>
           <Link to="/privacy" className="hover:underline">Privacy Notice</Link>
           <Link to="/privacy" className="hover:underline">Interest-Based Ads</Link>
        </div>
        <p className="text-[10px] text-gray-400">
          © {currentYear} Anritvox. All rights reserved. Developed by Pranav Kumar
        </p>
      </div>
    </footer>
  );
}
