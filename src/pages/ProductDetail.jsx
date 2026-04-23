import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, Heart, Share2, 
  Shield, Plus, Minus, Zap, Tag, Box, Truck, RefreshCw, 
  Lock, CreditCard, Award, Info, MapPin, Youtube, Play,
  RotateCcw, Eye, Settings, Terminal, Cpu, Clock
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Advanced Sub-Component: 360
const Product360Viewer = ({ images }) => {
  const [frame, setFrame] = useState(0);
  const totalFrames = images?.length || 8;

  return (
    <div className="relative aspect-square bg-slate-900 rounded-[3rem] overflow-hidden group border border-slate-800">
      <img src={images?.[frame] || images?.[0]} className="w-full h-full object-contain" alt="360 view" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-8">
         <div className="flex items-center space-x-4 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10">
            <RotateCcw size={16} className="text-emerald-500 animate-spin-slow" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Interactive 360° Vision</span>
         </div>
      </div>
      {/* Slider for rotation */}
      <input 
        type="range" min="0" max={totalFrames - 1} value={frame} 
        onChange={(e) => setFrame(parseInt(e.target.value))}
        className="absolute bottom-20 left-10 right-10 accent-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast() || {};
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [activeTab, setActiveTab] = useState('specs');
  const [garage, setGarage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
    
    const stored = localStorage.getItem('anritvox_garage');
    if (stored) setGarage(JSON.parse(stored));
  }, [id]);

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryDate('Estimated delivery by Tuesday, 28th April');
    }
  };

  if (!product) return <div className="p-20 text-emerald-500 font-black uppercase animate-pulse">Scanning Product Node...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* LEFT: VISUALS */}
        <div className="space-y-8">
           <Product360Viewer images={product.images} />
           
           {/* Visual Search Hook */}
           <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Play size={20} />
                 </div>
                 <div>
                    <div className="text-xs font-black uppercase text-white tracking-tighter">Installation Guide</div>
                    <div className="text-[10px] font-bold text-slate-500">View Tutorial on YouTube</div>
                 </div>
              </div>
              <button className="bg-white text-black px-6 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-emerald-500 transition-all">Watch Now</button>
           </div>
        </div>

        {/* RIGHT: DATA */}
        <div className="space-y-10">
          
          {/* Header & Fitment */}
          <div className="space-y-4">
             {garage && (
               <div className="inline-flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 text-emerald-400">
                  <Check size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified Fit for {garage.year} {garage.model}</span>
               </div>
             )}
             <h1 className="text-6xl font-black uppercase tracking-tighter leading-none italic italic">
                {product.name}
             </h1>
             <div className="flex items-center space-x-4">
                <div className="text-4xl font-black text-emerald-500 font-mono italic">₹{product.price}</div>
                <div className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase rounded-lg border border-rose-500/20">-20% OFF</div>
             </div>
          </div>

          {/* EMI Widget */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
             <div className="flex items-center space-x-4">
                <CreditCard size={24} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
                <div>
                   <div className="text-xs font-black uppercase text-white">EMI starting from ₹1,250/mo</div>
                   <div className="text-[10px] font-bold text-slate-500 tracking-tighter">0% Interest schemes available</div>
                </div>
             </div>
             <ChevronRight size={18} className="text-slate-700" />
          </div>

          {/* Pin-Code Estimator */}
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-4">Delivery Node Check</label>
             <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Pincode" 
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-slate-900 border-slate-800 rounded-2xl pl-12 pr-28 py-4 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  onClick={checkDelivery}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase"
                >
                  Check
                </button>
             </div>
             {deliveryDate && <div className="text-[10px] font-bold text-emerald-400 ml-4 animate-in fade-in slide-in-from-left-2">{deliveryDate}</div>}
          </div>

          {/* Core Specs Toggles */}
          <div className="border-t border-slate-900 pt-10">
             <div className="flex space-x-8 mb-8 border-b border-slate-900 pb-4">
                {['specs', 'details', 'shipping'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === t ? 'text-emerald-500 border-b-2 border-emerald-500 pb-4' : 'text-slate-600 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
             </div>
             <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Lumens', val: '8000 LM' },
                  { label: 'Wattage', val: '50W' },
                  { label: 'Voltage', val: '12V DC' },
                  { label: 'IP Rating', val: 'IP67' }
                ].map((spec, i) => (
                  <div key={i} className="flex flex-col">
                     <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{spec.label}</span>
                     <span className="text-sm font-black text-white">{spec.val}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex space-x-4 pt-8">
             <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-white text-black py-6 rounded-[2rem] font-black uppercase tracking-tighter text-xl hover:bg-emerald-400 transition-all flex items-center justify-center group"
             >
                Add to Cart <ShoppingCart size={24} className="ml-4 group-hover:translate-x-2 transition-transform" />
             </button>
             <button className="p-6 bg-slate-900 rounded-full border border-slate-800 hover:border-rose-500 hover:text-rose-500 transition-all">
                <Heart size={28} />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
