/* src/pages/ProductDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, 
  Heart, Share2, Truck, Shield, RefreshCcw, 
  MapPin, Minus, Plus, Info
} from 'lucide-react';

import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="max-w-[1500px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[380px_1fr_340px] gap-8 animate-pulse">
    <div className="space-y-4">
      <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
      <div className="flex gap-2 justify-center"><div className="w-14 h-14 bg-gray-200 rounded-md"></div><div className="w-14 h-14 bg-gray-200 rounded-md"></div><div className="w-14 h-14 bg-gray-200 rounded-md"></div></div>
    </div>
    <div className="space-y-4 pt-4">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
      <div className="space-y-2 mt-8"><div className="h-4 bg-gray-200 rounded w-full"></div><div className="h-4 bg-gray-200 rounded w-5/6"></div><div className="h-4 bg-gray-200 rounded w-4/6"></div></div>
    </div>
    <div className="w-full h-[400px] bg-gray-200 rounded-xl"></div>
  </div>
);

// Custom Amazon-Style Image Zoom Component
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
      className="w-full aspect-square relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-crosshair flex items-center justify-center p-4 group"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={imgSrc}
        alt={alt || "Product Image"}
        onError={(e) => { setImgSrc(FALLBACK_IMAGE); e.target.onerror = null; }}
        className={`w-full h-full object-contain transition-opacity duration-300 ${showZoom ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {showZoom && imgSrc !== FALLBACK_IMAGE && (
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-white rounded-2xl"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundPosition: position,
            backgroundSize: '250%', 
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      
      {/* Zoom Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 backdrop-blur-sm">
        <Plus size={14} /> Hover to zoom
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
  
  // Interactive States
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addToCart } = useCart();

  useEffect(() => {
    const getProduct = async () => {
      if (!id || id === 'undefined' || id === 'null') {
        setError('Invalid product ID.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (!data) { setError('Product not found.'); return; }

        // Aggressive Image Reconstruction
        let processedImages = [];
        const rawImages = data.images || data.image || [];
        const imageArray = Array.isArray(rawImages) ? rawImages : [rawImages];
        const cleanBaseUrl = BASE_URL.replace(/\/$/, '');

        imageArray.forEach(img => {
          if (!img) return;
          let cleanImg = typeof img === 'string' ? img : String(img);
          if (cleanImg.startsWith('[')) {
            try { const parsed = JSON.parse(cleanImg); if (Array.isArray(parsed) && parsed.length > 0) cleanImg = parsed[0]; } catch(e) {}
          }
          cleanImg = cleanImg.replace(/^(undefined|null)\/?/, '').replace(/^\//, '');
          if (cleanImg && !cleanImg.startsWith('http') && !cleanImg.startsWith('data:')) {
            const finalPath = cleanImg.startsWith('uploads/') ? cleanImg : `uploads/${cleanImg}`;
            cleanImg = `${cleanBaseUrl}/${finalPath}`;
          }
          if (cleanImg && !processedImages.includes(cleanImg)) processedImages.push(cleanImg);
        });

        if (processedImages.length === 0) processedImages = [FALLBACK_IMAGE];

        setProduct({ ...data, images: processedImages });
        setError('');
        setSelectedImage(0); 
      } catch (err) {
        console.error("Fetch error:", err);
        setError('Failed to fetch product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    getProduct();
    window.scrollTo(0, 0);
  }, [id]);

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

  const toggleWishlist = () => setIsWishlisted(!isWishlisted);

  if (loading) return <ProductSkeleton />;

  if (error || !product) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Info size={28} /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500 mb-6">{error || 'Product not found'}</p>
        <Link to="/shop" className="bg-[#ffa41c] hover:bg-[#fa8900] text-black font-semibold py-3 px-6 rounded-full inline-block transition-colors w-full">Return to Shop</Link>
      </div>
    </div>
  );

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [FALLBACK_IMAGE];
  const originalPrice = Number(product.price || 0);
  const sellingPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = product.discount_price && originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  const descriptionLines = (product.description || '').split('\n').filter(line => line.trim().length > 0);
  
  // Calculate mock delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const dateString = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="bg-[#f2f4f8] min-h-screen pb-16 font-sans antialiased selection:bg-[#ffa41c] selection:text-black">
      
      {/* Premium Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1500px] mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#c45500] hover:underline transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <Link to="/shop" className="hover:text-[#c45500] hover:underline transition-colors">Shop</Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[250px]">{product.name || 'Product'}</span>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[400px_1fr_360px] gap-8">
        
        {/* LEFT: Image Gallery */}
        <div className="flex flex-col items-center gap-4">
          <ImageZoom src={images[selectedImage]} alt={product.name} />
          
          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2 w-full scrollbar-hide justify-center px-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                onClick={() => setSelectedImage(idx)}
                className={`w-16 h-16 rounded-xl p-1.5 flex-shrink-0 transition-all bg-white border-2 ${
                  selectedImage === idx ? 'border-[#ffa41c] ring-2 ring-[#ffa41c]/20 shadow-md scale-105' : 'border-transparent hover:border-gray-300 shadow-sm'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx}`} onError={(e) => { e.target.src = FALLBACK_IMAGE; e.target.onerror = null; }} className="w-full h-full object-contain rounded-lg" />
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Product Details */}
        <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Title & Brand */}
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                {product.name || 'Unknown Product'}
              </h1>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }} className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors" title="Share">
                  <Share2 size={20} />
                </button>
                <button onClick={toggleWishlist} className="p-2.5 rounded-full hover:bg-red-50 transition-colors" title="Add to Wishlist">
                  <Heart size={20} className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>
            <Link to="/shop" className="text-sm text-[#007185] hover:text-[#c7511f] font-medium hover:underline inline-block">
              Visit the {product.brand || 'Anritvox'} Store
            </Link>
          </div>

          {/* Ratings */}
          <div className="flex items-center gap-3">
            <div className="flex text-[#FFA41C]">
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" className="text-gray-300" />
            </div>
            <span className="text-sm text-[#007185] hover:underline cursor-pointer font-medium">1,248 ratings</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-600">100+ bought in past month</span>
          </div>

          <hr className="border-gray-100" />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-end gap-3">
              {discountPercentage > 0 && (
                <span className="text-[#cc0c39] text-3xl font-light">-{discountPercentage}%</span>
              )}
              <div className="flex items-start leading-none">
                <span className="text-sm mt-1 font-medium text-gray-900">₹</span>
                <span className="text-4xl font-bold text-gray-900">{sellingPrice.toLocaleString()}</span>
              </div>
            </div>
            {discountPercentage > 0 && (
              <p className="text-sm text-gray-500 font-medium">
                M.R.P.: <span className="line-through decoration-gray-400">₹{originalPrice.toLocaleString()}</span>
              </p>
            )}
            <p className="text-sm font-medium text-gray-600 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-4 gap-2 py-4 border-y border-gray-100">
            {[
              { icon: <Truck size={20} />, label: "Free Delivery" },
              { icon: <RefreshCcw size={20} />, label: "7 Days Return" },
              { icon: <Shield size={20} />, label: "1 Year Warranty" },
              { icon: <Check size={20} />, label: "Top Brand" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#007185] flex items-center justify-center group-hover:bg-[#007185] group-hover:text-white transition-colors duration-300">
                  {badge.icon}
                </div>
                <span className="text-[11px] leading-tight text-[#007185] font-medium px-1">{badge.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs Section */}
          <div className="pt-2">
            <div className="flex gap-6 border-b border-gray-200">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ffa41c] rounded-t-full"></div>}
                </button>
              ))}
            </div>
            
            <div className="py-6">
              {activeTab === 'description' && (
                <ul className="space-y-3 text-sm text-gray-700">
                  {descriptionLines.length > 0 ? (
                    descriptionLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="min-w-[6px] h-[6px] rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                        <span className="leading-relaxed">{line}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 italic">No description available for this product.</li>
                  )}
                </ul>
              )}
              {activeTab === 'specifications' && (
                <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div className="font-medium text-gray-900">Brand</div><div>{product.brand || 'Anritvox'}</div>
                    <div className="font-medium text-gray-900">Model Name</div><div>{product.name?.split(' ')[0] || 'Premium Model'}</div>
                    <div className="font-medium text-gray-900">Connectivity</div><div>Bluetooth, Wired</div>
                    <div className="font-medium text-gray-900">Compatibility</div><div>Universal Car Fit</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky Buy Box */}
        <div className="relative">
          <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg shadow-gray-200/50 space-y-6">
            
            {/* Price Box */}
            <div>
              <div className="flex items-start leading-none mb-2">
                <span className="text-sm mt-1 font-medium text-gray-900">₹</span>
                <span className="text-3xl font-bold text-gray-900">{sellingPrice.toLocaleString()}</span>
              </div>
              
              {/* Delivery Estimation */}
              <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 space-y-2 mt-4">
                <div className="text-sm flex items-center gap-1.5 font-medium text-gray-900">
                  <Truck size={16} className="text-[#007185]" /> FREE Delivery
                </div>
                <div className="text-sm text-gray-700">
                  Delivery by <span className="font-bold">{dateString}</span>. Order within <span className="text-green-600 font-medium">10 hrs 30 mins</span>.
                </div>
                <div className="flex items-center gap-1 text-xs text-[#007185] hover:text-[#c7511f] hover:underline cursor-pointer font-medium pt-1">
                  <MapPin size={14} /> Deliver to New Delhi 110001
                </div>
              </div>
            </div>
            
            {/* Stock Status */}
            {product.quantity > 0 ? (
               <div className="space-y-1">
                 <p className="text-[15px] text-[#007600] font-bold">In stock</p>
                 {product.quantity < 10 && (
                   <p className="text-xs text-red-600 font-medium">Only {product.quantity} left in stock - order soon.</p>
                 )}
               </div>
            ) : (
               <p className="text-[15px] text-[#cc0c39] font-bold">Currently unavailable.</p>
            )}

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Quantity:</label>
              <div className="flex items-center w-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="px-3 py-2 hover:bg-gray-200 text-gray-600 transition-colors"><Minus size={14}/></button>
                <div className="flex-1 text-center font-semibold text-gray-900 text-sm bg-white py-2 border-x border-gray-200">{quantity}</div>
                <button onClick={() => setQuantity(q => q < 10 ? q + 1 : 10)} className="px-3 py-2 hover:bg-gray-200 text-gray-600 transition-colors"><Plus size={14}/></button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className={`w-full py-3.5 rounded-full font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                  product.quantity <= 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                  addedToCart ? 'bg-[#2ea44f] text-white ring-2 ring-green-500 ring-offset-2' : 'bg-[#ffd814] hover:bg-[#f7ca00] text-gray-900 active:scale-[0.98]'
                }`}
              >
                {addedToCart ? <><Check size={18} /> Added to Cart</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={product.quantity <= 0}
                className={`w-full py-3.5 rounded-full font-bold text-sm shadow-sm transition-all active:scale-[0.98] ${
                  product.quantity <= 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#ffa41c] hover:bg-[#fa8900] text-gray-900'
                }`}
              >
                Buy Now
              </button>
            </div>

            {/* Secure Transaction Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 justify-center pt-2">
              <Shield size={16} className="text-gray-400"/> Secure transaction
            </div>
            
            {/* Sold By Info */}
            <div className="text-xs text-gray-600 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Ships from</span>
                <span className="font-medium text-gray-900">Anritvox Logistics</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sold by</span>
                <Link to="/shop" className="text-[#007185] hover:underline font-medium">Anritvox Store</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
