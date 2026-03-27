/* src/pages/ProductDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, 
  Heart, Share2, Truck, Shield, RefreshCcw, 
  MapPin, Minus, Plus, Info, Award
} from 'lucide-react';

import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";

const ProductSkeleton = () => (
  <div className="max-w-[1500px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[450px_1fr_380px] gap-10 animate-pulse bg-white">
    <div className="space-y-4"><div className="w-full aspect-square bg-slate-100 rounded-3xl"></div><div className="flex gap-3 justify-center"><div className="w-16 h-16 bg-slate-100 rounded-xl"></div><div className="w-16 h-16 bg-slate-100 rounded-xl"></div><div className="w-16 h-16 bg-slate-100 rounded-xl"></div></div></div>
    <div className="space-y-5 pt-4"><div className="h-10 bg-slate-100 rounded-lg w-3/4"></div><div className="h-5 bg-slate-100 rounded w-1/4"></div><div className="h-12 bg-slate-100 rounded-lg w-1/3 mt-8"></div><div className="space-y-3 mt-10"><div className="h-4 bg-slate-100 rounded w-full"></div><div className="h-4 bg-slate-100 rounded w-5/6"></div><div className="h-4 bg-slate-100 rounded w-4/6"></div></div></div>
    <div className="w-full h-[500px] bg-slate-50 rounded-3xl border border-slate-100"></div>
  </div>
);

const ImageZoom = ({ src, alt }) => {
  const [position, setPosition] = useState('0% 0%');
  const [showZoom, setShowZoom] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => { setImgSrc(src || FALLBACK_IMAGE); }, [src]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition(`${x}% ${y}%`);
  };

  return (
    <div
      className="w-full aspect-square relative bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden cursor-crosshair flex items-center justify-center p-6 group transition-all duration-500"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={imgSrc}
        alt={alt || "Product"}
        onError={(e) => { setImgSrc(FALLBACK_IMAGE); e.target.onerror = null; }}
        className={`w-full h-full object-contain transition-opacity duration-300 ${showZoom ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {showZoom && imgSrc !== FALLBACK_IMAGE && (
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-white rounded-3xl"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundPosition: position,
            backgroundSize: '200%', 
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs font-medium px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 backdrop-blur-md shadow-lg translate-y-2 group-hover:translate-y-0">
        <Plus size={14} /> Hover to magnify
      </div>
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (!data) throw new Error('Product not found');

        // Bulletproof Image Parser
        let processedImages = [];
        const rawImages = data.images || data.image || [];
        const imageArray = Array.isArray(rawImages) ? rawImages : [rawImages];
        
        imageArray.forEach(img => {
          if (!img) return;
          let cleanImg = typeof img === 'string' ? img : String(img);
          try { 
            if (cleanImg.startsWith('[')) {
              const parsed = JSON.parse(cleanImg); 
              if (Array.isArray(parsed)) cleanImg = parsed[0];
            }
          } catch(e) {}
          
          cleanImg = cleanImg.replace(/^(undefined|null)\/?/, '').replace(/^\//, '');
          
          if (cleanImg && !cleanImg.startsWith('http') && !cleanImg.startsWith('data:')) {
            cleanImg = `${BASE_URL.replace(/\/$/, '')}/${cleanImg.startsWith('uploads/') ? '' : 'uploads/'}${cleanImg}`;
          }
          if (cleanImg && !processedImages.includes(cleanImg)) processedImages.push(cleanImg);
        });

        setProduct({ ...data, images: processedImages.length > 0 ? processedImages : [FALLBACK_IMAGE] });
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    getProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // Floating Bar Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const buyBox = document.getElementById('main-buy-box');
      if (buyBox) {
        const rect = buyBox.getBoundingClientRect();
        setShowFloatingBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) return <ProductSkeleton />;
  if (error || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link to="/shop" className="bg-gray-900 text-white font-bold py-3.5 px-8 rounded-full hover:bg-[#ffa41c] hover:text-gray-900 transition-colors">Return to Shop</Link>
      </div>
    </div>
  );

  const images = product.images;
  const originalPrice = Number(product.price || 0);
  const sellingPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = product.discount_price && originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  const descriptionLines = (product.description || '').split('\n').filter(line => line.trim().length > 0);

  return (
    <div className="bg-white min-h-screen pb-24 font-sans antialiased text-gray-900 selection:bg-[#ffa41c] selection:text-black">
      
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-gray-100">
        <div className="max-w-[1500px] mx-auto px-6 py-4 text-sm font-medium text-gray-500 flex items-center gap-3">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900 truncate max-w-[300px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[450px_1fr_380px] gap-10">
        
        {/* LEFT: Futuristic Image Gallery */}
        <div className="flex flex-col gap-6">
          <ImageZoom src={images[selectedImage]} alt={product.name} />
          
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center px-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 rounded-2xl p-2 flex-shrink-0 transition-all duration-300 bg-white ${
                  selectedImage === idx 
                  ? 'border-2 border-gray-900 shadow-md scale-105' 
                  : 'border border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-contain rounded-xl" onError={(e) => { e.target.src = FALLBACK_IMAGE; e.target.onerror = null; }} />
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Premium Product Details */}
        <div className="space-y-8">
          
          <div className="space-y-4">
            <Link to="/shop" className="text-[#007185] hover:text-[#c7511f] font-bold text-sm uppercase tracking-wider hover:underline">
              {product.brand || 'Premium Brand'}
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-between">
              <a href="#reviews-section" className="flex items-center gap-3 group cursor-pointer">
                <div className="flex text-[#ffa41c]">
                  {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" className={i===4 ? "text-gray-200" : ""} />)}
                </div>
                <span className="text-sm font-semibold text-[#007185] group-hover:underline">Read Reviews</span>
              </a>
              
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                  <Share2 size={20} />
                </button>
                <button onClick={() => setIsWishlisted(!isWishlisted)} className="p-3 rounded-full bg-gray-50 hover:bg-red-50 transition-colors">
                  <Heart size={20} className={`transition-all duration-300 ${isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {discountPercentage > 0 && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-lg font-bold tracking-wide">-{discountPercentage}%</span>
              )}
              <div className="flex items-start">
                <span className="text-xl mt-1.5 font-bold text-gray-900 mr-1">₹</span>
                <span className="text-5xl font-black text-gray-900 tracking-tighter">{sellingPrice.toLocaleString()}</span>
              </div>
            </div>
            {discountPercentage > 0 && (
              <p className="text-gray-500 font-medium pt-2">
                M.R.P.: <span className="line-through decoration-gray-400">₹{originalPrice.toLocaleString()}</span>
              </p>
            )}
            <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Inclusive of all taxes</p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-4 gap-4 py-6">
            {[
              { icon: <Truck size={24} />, label: "Free Delivery" },
              { icon: <RefreshCcw size={24} />, label: "7 Days Return" },
              { icon: <Shield size={24} />, label: "1 Year Warranty" },
              { icon: <Award size={24} />, label: "Top Brand" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center justify-start text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-gray-900 flex items-center justify-center shadow-sm">
                  {badge.icon}
                </div>
                <span className="text-xs font-bold text-gray-700 leading-tight">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Modern Tabs */}
          <div className="pt-4">
            <div className="flex gap-8 border-b border-gray-200">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-base font-bold capitalize transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900 rounded-t-full"></div>}
                </button>
              ))}
            </div>
            
            <div className="py-8">
              {activeTab === 'description' && (
                <ul className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
                  {descriptionLines.length > 0 ? descriptionLines.map((line, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="min-w-[8px] h-[8px] rounded-full bg-[#ffa41c] mt-2 flex-shrink-0 shadow-sm"></span>
                      <span>{line}</span>
                    </li>
                  )) : <p className="italic text-gray-400">No description provided.</p>}
                </ul>
              )}
              {activeTab === 'specifications' && (
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div className="font-bold text-gray-500 uppercase tracking-wide text-xs">Brand</div><div className="font-semibold text-gray-900">{product.brand || 'Anritvox'}</div>
                    <div className="font-bold text-gray-500 uppercase tracking-wide text-xs">Model</div><div className="font-semibold text-gray-900">{product.name?.split(' ')[0] || 'Premium'}</div>
                    <div className="font-bold text-gray-500 uppercase tracking-wide text-xs">Category</div><div className="font-semibold text-gray-900 capitalize">{product.category || 'Accessories'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Advanced Sticky Buy Box */}
        <div className="relative">
          <div id="main-buy-box" className="sticky top-24 bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] space-y-8">
            
            {/* Stock Pulse Indicator */}
            <div className="flex items-center gap-3 bg-green-50/50 border border-green-100 p-4 rounded-2xl">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
              </span>
              <div>
                <p className="text-[15px] text-green-700 font-bold leading-tight">In Stock & Ready to Ship</p>
                {product.quantity < 10 && <p className="text-xs text-red-600 font-semibold mt-1">High Demand: Only {product.quantity} left!</p>}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="space-y-3 border-y border-gray-100 py-6">
              <div className="flex items-start gap-3">
                <Truck size={20} className="text-gray-900 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Free Express Delivery</div>
                  <div className="text-sm text-gray-600 mt-1">Get it by <span className="font-bold text-gray-900">Tomorrow, 5 PM</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#007185] cursor-pointer hover:underline pt-2">
                <MapPin size={16} /> Deliver to New Delhi 110001
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 block uppercase tracking-wide">Quantity</label>
              <div className="flex items-center w-full border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm h-14">
                <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="px-5 h-full hover:bg-gray-50 text-gray-900 transition-colors border-r border-gray-100"><Minus size={18}/></button>
                <div className="flex-1 text-center font-black text-gray-900 text-lg">{quantity}</div>
                <button onClick={() => setQuantity(q => q < 10 ? q + 1 : 10)} className="px-5 h-full hover:bg-gray-50 text-gray-900 transition-colors border-l border-gray-100"><Plus size={18}/></button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button onClick={handleAddToCart} disabled={product.quantity <= 0} className={`w-full h-14 rounded-2xl font-bold text-base shadow-sm transition-all duration-300 flex items-center justify-center gap-2 ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : addedToCart ? 'bg-green-500 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white hover:shadow-lg active:scale-[0.98]'}`}>
                {addedToCart ? <><Check size={20} /> Added to Cart</> : <><ShoppingCart size={20} /> Add to Cart</>}
              </button>
              
              <button onClick={handleBuyNow} disabled={product.quantity <= 0} className={`w-full h-14 rounded-2xl font-black text-base transition-all duration-300 active:scale-[0.98] ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900 shadow-lg shadow-[#ffa41c]/20'}`}>
                Buy Now
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pt-4">
              <Shield size={14} /> Secure Encrypted Transaction
            </div>
          </div>
        </div>
      </div>

      {/* RENDER THE REVIEWS SECTION */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-12 border-t border-gray-100">
         <ReviewSection productId={id} />
      </div>

      {/* Floating Action Bar (Glassmorphism) */}
      <div className={`fixed bottom-0 left-0 w-full z-50 transform transition-transform duration-500 ease-in-out ${showFloatingBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-[0_-10px_40px_rgb(0,0,0,0.1)] py-4 px-6 flex items-center justify-between md:justify-center md:gap-12">
          <div className="hidden md:flex items-center gap-4">
            <img src={images[0]} alt="Product" className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100" />
            <div>
              <div className="font-bold text-gray-900 truncate max-w-[200px]">{product.name}</div>
              <div className="font-black text-gray-900">₹{sellingPrice.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button onClick={handleAddToCart} className="flex-1 md:w-48 h-12 rounded-xl bg-gray-900 text-white font-bold flex items-center justify-center gap-2">
               {addedToCart ? <Check size={18} /> : <ShoppingCart size={18} />} Add to Cart
             </button>
             <button onClick={handleBuyNow} className="flex-1 md:w-48 h-12 rounded-xl bg-[#ffa41c] text-gray-900 font-black">Buy Now</button>
          </div>
        </div>
      </div>

    </div>
  );
}
