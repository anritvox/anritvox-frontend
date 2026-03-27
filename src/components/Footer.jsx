import { Link } from "react-router-dom";
import logo from "../assets/images/logo.webp";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#0a0a0c]/90 backdrop-blur-2xl border-t border-white/10 text-white font-sans antialiased mt-auto overflow-hidden">
      
      {/* Ambient Glassmorphism Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>

      {/* Back to Top - Glass Button */}
      <button 
        onClick={scrollToTop}
        className="relative z-10 w-full py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border-b border-white/5 text-xs tracking-widest uppercase text-cyan-400 font-bold transition-all active:bg-white/20"
      >
        Back to top
      </button>

      {/* Main Footer Links - 2x2 Grid on Mobile for App-like feel */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-200">Get to Know Us</h3>
          <ul className="space-y-3 text-xs md:text-sm text-slate-400">
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About Anritvox</Link></li>
            <li><Link to="/about#careers" className="hover:text-cyan-400 transition-colors">Careers</Link></li>
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">Press Releases</Link></li>
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">Anritvox Science</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-200">Connect with Us</h3>
          <ul className="space-y-3 text-xs md:text-sm text-slate-400">
            <li><a href="https://www.instagram.com/the_rsenterprises" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Instagram</a></li>
            <li><a href="https://facebook.com/anritvox" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">Facebook</a></li>
            <li><a href="https://twitter.com/anritvox" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">X (Twitter)</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-200">Make Money</h3>
          <ul className="space-y-3 text-xs md:text-sm text-slate-400">
            <li><Link to="/admin/login" className="hover:text-cyan-400 transition-colors">Sell on Anritvox</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Become an Affiliate</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Advertise Products</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-slate-200">Let Us Help You</h3>
          <ul className="space-y-3 text-xs md:text-sm text-slate-400">
            <li><Link to="/ewarranty" className="hover:text-cyan-400 transition-colors">E-Warranty</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Returns Centre</Link></li>
            <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Purchase Protection</Link></li>
            <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Help & Support</Link></li>
          </ul>
        </div>
      </div>

      {/* Secondary Footer - App Icon Logo & Settings */}
      <div className="relative z-10 border-t border-white/10 py-10 flex flex-col items-center gap-6">
        <Link to="/" className="group">
          {/* Framed App-Icon Style Logo Treatment */}
          <div className="p-2 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl group-hover:bg-white/10 group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20 transition-all duration-500 ease-out transform group-active:scale-95">
             <img src={logo} alt="Anritvox" className="h-10 md:h-12 w-auto object-contain rounded-xl" />
          </div>
        </Link>
        <div className="flex flex-wrap justify-center gap-3 text-[11px] font-bold tracking-widest uppercase text-slate-400 px-4">
           <span className="border border-white/10 bg-white/5 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10 hover:text-white transition-all active:scale-95">English</span>
           <span className="border border-white/10 bg-white/5 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10 hover:text-white transition-all active:scale-95">🇮🇳 India</span>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="relative z-10 bg-[#050505]/80 py-8 px-4 text-center border-t border-white/5 pb-10 md:pb-8">
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium mb-4 text-slate-500">
           <Link to="/terms" className="hover:text-cyan-400 transition-colors">Conditions of Use</Link>
           <span className="hidden sm:inline opacity-30">|</span>
           <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Notice</Link>
           <span className="hidden sm:inline opacity-30">|</span>
           <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Interest-Based Ads</Link>
        </div>
        <p className="text-[10px] text-slate-600 font-mono tracking-tight">
          © {currentYear} ANRITVOX. ALL RIGHTS RESERVED. <br className="sm:hidden" /> DEVELOPED BY AKASH PRASAD
        </p>
      </div>
      
    </footer>
  );
}
