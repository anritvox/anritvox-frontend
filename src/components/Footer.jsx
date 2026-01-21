import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronUp, 
  ArrowRight, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Truck, 
  RefreshCw 
} from 'lucide-react';

// Assumed Asset - Using placeholder if local file not present in environment
// In your project, keep your original import: import logo from "../assets/images/logo.webp";
const logo = "https://placehold.co/100x100/1f2937/84cc16?text=A"; 

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter logic here
    console.log('Subscribed:', email);
    setEmail('');
  };

  // Data Structures for cleaner JSX
  const footerSections = {
    shop: {
      title: "Shop By Category",
      links: [
        { name: "Android Stereos", path: "/shop/stereos" },
        { name: "Audio Systems", path: "/shop/audio" },
        { name: "Dash Cameras", path: "/shop/cameras" },
        { name: "Lighting Solutions", path: "/shop/lights" },
        { name: "Car Accessories", path: "/shop/accessories" },
        { name: "GPS Navigation", path: "/shop/gps" },
        { name: "Security Systems", path: "/shop/security" },
      ]
    },
    help: {
      title: "Help & Support",
      links: [
        { name: "Track Your Order", path: "/track-order" },
        { name: "Returns & Replacements", path: "/returns" },
        { name: "Shipping Rates", path: "/shipping" },
        { name: "E-Warranty Registration", path: "/ewarranty" },
        { name: "Service Centers", path: "/locations" },
        { name: "Product Manuals", path: "/manuals" },
        { name: "Contact Us", path: "/contact" },
      ]
    },
    policy: {
      title: "Policy & About",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Use", path: "/terms" },
        { name: "Cancellation Policy", path: "/cancellation" },
        { name: "Intellectual Property", path: "/ipr" },
        { name: "Careers", path: "/careers" },
        { name: "Sitemap", path: "/sitemap" },
      ]
    }
  };

  return (
    <footer className="relative bg-[#0f1115] text-white font-inter antialiased overflow-hidden">
      
      {/* 1. Back to Top Strip */}
      <button 
        onClick={scrollToTop}
        className="w-full bg-[#1a1d23] hover:bg-[#252932] py-3 text-sm font-medium text-gray-300 hover:text-lime-400 transition-colors duration-300 flex items-center justify-center gap-2 group border-b border-gray-800"
      >
        <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
        Back to top
      </button>

      {/* Background Animated Blobs (Subtler for readability) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-lime-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-green-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto">
        
        {/* 2. Value Props & Newsletter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-gray-800">
          
          {/* Value Props */}
          <div className="lg:col-span-7 px-6 py-8 sm:px-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-lime-900/20 flex items-center justify-center text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-all duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">1 Year Warranty</h4>
                <p className="text-xs text-gray-400">On all electronics</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-lime-900/20 flex items-center justify-center text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-all duration-300">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">7 Days Return</h4>
                <p className="text-xs text-gray-400">Easy return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-full bg-lime-900/20 flex items-center justify-center text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-all duration-300">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Free Shipping</h4>
                <p className="text-xs text-gray-400">Across India</p>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-5 bg-[#16191f] px-6 py-8 sm:px-12 flex flex-col justify-center border-l border-gray-800 lg:border-t-0 border-t">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span className="w-1 h-5 bg-lime-400 rounded-full"></span>
              Join our Newsletter
            </h3>
            <p className="text-sm text-gray-400 mb-4">Get the latest updates on new launches and exclusive offers.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded px-4 py-2.5 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 transition-all"
                required
              />
              <button 
                type="submit"
                className="bg-lime-500 hover:bg-lime-400 text-black font-semibold px-5 py-2.5 rounded text-sm transition-colors duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* 3. Main Footer Links Grid */}
        <div className="px-6 sm:px-12 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          
          {/* Column 1: Brand & Social */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative group/logo">
                <img src={logo} alt="Anritvox" className="h-10 w-auto" />
                <div className="absolute inset-0 bg-lime-400 blur-lg opacity-0 group-hover/logo:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div>
                <span className="block text-xl font-bold tracking-tight">Anritvox</span>
                <span className="text-[10px] text-lime-400 font-bold tracking-[0.2em]">CAR ELECTRONICS</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Transforming drives with premium car electronics. Experience innovation, connectivity, and control on every journey.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { icon: Instagram, href: "https://www.instagram.com/the_rsenterprises?igsh=MXZkMHRjODkzN3BhNg==", color: "hover:bg-pink-600" },
                { icon: Facebook, href: "#", color: "hover:bg-blue-600" },
                { icon: Youtube, href: "#", color: "hover:bg-red-600" },
                { icon: Twitter, href: "#", color: "hover:bg-sky-500" },
                { icon: Linkedin, href: "#", color: "hover:bg-blue-700" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${social.color} hover:-translate-y-1`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 relative inline-block">
              {footerSections.shop.title}
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-lime-500"></span>
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {footerSections.shop.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-lime-400 hover:pl-1 transition-all duration-200 block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 relative inline-block">
              {footerSections.help.title}
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-lime-500"></span>
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {footerSections.help.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-lime-400 hover:pl-1 transition-all duration-200 block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Policy */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-white mb-6 relative inline-block">
              {footerSections.policy.title}
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-lime-500"></span>
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {footerSections.policy.links.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-lime-400 hover:pl-1 transition-all duration-200 block">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & App */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h4 className="font-bold text-white mb-6 relative inline-block">
                Reach Us
                <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-lime-500"></span>
              </h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-3 group">
                  <MapPin className="w-5 h-5 text-lime-500 shrink-0 mt-0.5 group-hover:animate-bounce" />
                  <span className="group-hover:text-gray-200 transition-colors">
                     1628/1, Madarsa Road, Kashmir Gate, Delhi, India 110006
                  </span>
                </li>
                <li className="flex items-center gap-3 group">
                  <Phone className="w-5 h-5 text-lime-500 shrink-0" />
                  <a href="tel:+919654131435" className="hover:text-lime-400 transition-colors">
                    +91 96541 31435
                  </a>
                </li>
                <li className="flex items-center gap-3 group">
                  <Mail className="w-5 h-5 text-lime-500 shrink-0" />
                  <a href="mailto:Anritvox@gmail.com" className="hover:text-lime-400 transition-colors">
                    Anritvox@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <h5 className="text-xs font-semibold uppercase text-gray-500 mb-3 tracking-wider">Experience Our App</h5>
              <div className="flex flex-wrap gap-2">
                {/* Mock App Store Buttons */}
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-lime-500/50 rounded-lg p-2 flex items-center justify-center gap-2 transition-all duration-300 group">
                  <Smartphone className="w-6 h-6 text-gray-300 group-hover:text-lime-400" />
                  <div className="text-left">
                    <div className="text-[9px] text-gray-400 leading-none">GET IT ON</div>
                    <div className="text-xs font-bold text-white">Google Play</div>
                  </div>
                </button>
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-lime-500/50 rounded-lg p-2 flex items-center justify-center gap-2 transition-all duration-300 group">
                  <Smartphone className="w-6 h-6 text-gray-300 group-hover:text-lime-400" />
                  <div className="text-left">
                    <div className="text-[9px] text-gray-400 leading-none">Download on the</div>
                    <div className="text-xs font-bold text-white">App Store</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Utilities Bar (Flipkart/Amazon style) */}
        <div className="border-t border-gray-800 bg-[#0a0c0f]">
          <div className="px-6 sm:px-12 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-sm"></div>
                <span>Sell on Anritvox</span>
              </span>
              <span className="hidden sm:inline text-gray-700">|</span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                <span>Advertise</span>
              </span>
              <span className="hidden sm:inline text-gray-700">|</span>
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 bg-lime-500 rounded-sm"></div>
                <span>Gift Cards</span>
              </span>
            </div>

            <div className="flex items-center justify-start md:justify-end gap-3">
              <span className="text-xs text-gray-500 uppercase font-semibold">Accepted Payments:</span>
              <div className="flex gap-2">
                {/* CSS-only Payment Icons for visual mockups */}
                <div className="h-6 w-10 bg-white rounded shadow-sm flex items-center justify-center" title="Visa">
                  <div className="font-bold italic text-blue-800 text-[10px]">VISA</div>
                </div>
                <div className="h-6 w-10 bg-white rounded shadow-sm flex items-center justify-center" title="Mastercard">
                  <div className="flex -space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-80"></div>
                  </div>
                </div>
                <div className="h-6 w-10 bg-white rounded shadow-sm flex items-center justify-center" title="UPI">
                  <div className="font-bold text-green-600 text-[8px]">UPI</div>
                </div>
                <div className="h-6 w-10 bg-white rounded shadow-sm flex items-center justify-center" title="NetBanking">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Copyright */}
        <div className="border-t border-gray-800/50 py-6 px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 bg-black/20">
          <div>
            © {currentYear} Anritvox Car Electronics. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <span>Designed & Developed by</span>
            <span className="text-lime-400 font-medium">Pranav Kumar</span>
          </div>
        </div>

      </div>

      {/* Styled JSX for utility animations */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");

        .font-inter {
          font-family: "Inter", sans-serif;
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0, 0.99);
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        /* Custom scrollbar matching theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f1115;
        }
        ::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #84cc16;
        }
      `}</style>
    </footer>
  );
}
