import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, User, Search, Menu, X, Mic, Camera, 
  Car, Heart, Bell, ChevronDown, Package, Zap, Gift,
  LogOut, Settings, Award, ShieldCheck, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isGarageActive, setGarageActive] = useState(false);
  const [garageData, setGarageData] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkGarage = () => {
      const stored = localStorage.getItem('anritvox_garage');
      if (stored) {
        setGarageData(JSON.parse(stored));
        setGarageActive(true);
      }
    };
    checkGarage();
    window.addEventListener('storage', checkGarage);
    return () => window.removeEventListener('storage', checkGarage);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      // Mock Predictive Search thumbnails
      setSuggestions([
        { id: 1, name: 'Pro LED Headlight H4', price: 2499, img: 'https://via.placeholder.com/50' },
        { id: 2, name: 'Ambient Light Strip RGB', price: 899, img: 'https://via.placeholder.com/50' },
        { id: 3, name: 'Premium Subwoofer 12"', price: 12500, img: 'https://via.placeholder.com/50' }
      ]);
    } else {
      setSuggestions([]);
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        navigate(`/shop?q=${transcript}`);
      };
      recognition.start();
    } else {
      alert('Voice search not supported in this browser.');
    }
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-900 sticky top-0 z-[100] backdrop-blur-xl bg-opacity-80">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black group-hover:rotate-12 transition-transform">A</div>
          <span className="text-xl font-black tracking-tighter italic uppercase text-white">Anritvox</span>
        </Link>

        {/* SEARCH BAR (Predictive + Voice + Visual) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-12 relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search lights, audio, performance..."
            className="w-full bg-slate-900/50 border-none rounded-2xl pl-12 pr-24 py-3 text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-700"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-3 text-slate-500">
            <button onClick={startVoiceSearch} className={`hover:text-emerald-500 transition-colors ${isListening ? 'text-rose-500 animate-pulse' : ''}`}>
              <Mic size={18} />
            </button>
            <button className="hover:text-emerald-500 transition-colors">
              <Camera size={18} />
            </button>
          </div>

          {/* PREDICTIVE DROPDOWN */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
               {suggestions.map(s => (
                 <Link key={s.id} to={`/product/${s.id}`} className="flex items-center p-4 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-none">
                    <img src={s.img} className="w-10 h-10 rounded-lg object-cover mr-4" alt={s.name} />
                    <div className="flex-1">
                       <div className="text-xs font-black uppercase text-white">{s.name}</div>
                       <div className="text-[10px] font-bold text-emerald-500">₹{s.price}</div>
                    </div>
                    <ChevronDown size={14} className="-rotate-90 text-slate-700" />
                 </Link>
               ))}
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center space-x-6">
          
          {/* FITMENT ENGINE (MY GARAGE) */}
          <Link to="/fitment" className={`hidden lg:flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
            isGarageActive ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-slate-800 text-slate-400 hover:border-emerald-500/50'
          }`}>
            <Car size={18} />
            <div className="text-left">
              <div className="text-[8px] font-black uppercase leading-none">{isGarageActive ? 'My Garage' : 'Select Vehicle'}</div>
              <div className="text-[10px] font-black uppercase tracking-tighter">{isGarageActive ? garageData.model : 'Guaranteed Fit'}</div>
            </div>
          </Link>

          {/* USER / AUTH */}
          {user ? (
            <div className="relative group">
              <Link to="/profile" className="flex items-center space-x-2 text-white font-black uppercase text-xs tracking-tighter">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                   {user.name?.charAt(0)}
                </div>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="text-xs font-black uppercase tracking-tighter text-slate-400 hover:text-white transition-colors">Login</Link>
          )}

          {/* CART (AJAX Mini-Cart Trigger) */}
          <Link to="/cart" className="relative p-2 text-white hover:text-emerald-500 transition-colors">
            <ShoppingCart size={22} />
            {cartItems?.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-950">
                {cartItems.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
