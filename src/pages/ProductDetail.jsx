import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, 
  Heart, Share2, Shield, Plus, Minus, Zap, Tag, Box,
  Truck, RefreshCcw, Lock, CreditCard, Award, Info, MapPin, GitCompare
} from 'lucide-react';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ReviewSection from '../components/ReviewSection';
import QASection from '../components/QASection';
import RecentlyViewed, { addToRecentlyViewed } from '../components/RecentlyViewed';

// IMPORTANT: Assuming you have a CompareContext. If it crashes, remove this import and the useCompare hook below.
import { useCompare } from '../context/CompareContext'; 

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";

const getYouTubeEmbedUrl = (url) => {
  try {
    if (!url) return '';
    const cleanUrl = url.trim();
    if (cleanUrl.includes('youtube.com/embed/')) return cleanUrl;
    let videoId = '';
    if (cleanUrl.includes('youtu.be/')) videoId = cleanUrl.split('youtu.be/')[1].split('?')[0];
    else if (cleanUrl.includes('youtube.com/watch')) videoId = new URLSearchParams(new URL(cleanUrl).search).get('v');
    else if (cleanUrl.includes('youtube.com/shorts/')) videoId = cleanUrl.split('youtube.com/shorts/')[1].split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : cleanUrl;
  } catch (err) {
    return url.replace('watch?v=', 'embed/');
  }
};

const ProductSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse bg-white">
    <div className="w-full aspect-square bg-slate-100 rounded-[2rem]"></div>
    <div className="space-y-6 pt-6">
      <div className="h-10 bg-slate-100 rounded-xl w-3/4"></div>
      <div className="h-6 bg-slate-100 rounded w-1/4"></div>
      <div className="h-32 bg-slate-50 rounded-xl w-full mt-8"></div>
    </div>
  </div>
);

const ImageZoom = ({ src, alt }) => {
  const [position, setPosition] = useState('0% 0%');
  const [showZoom, setShowZoom] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  
  useEffect(() => { setImgSrc(src || FALLBACK_IMAGE); }, [src]);
  
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setPosition(`${x}% ${y}%`);
  };
  
  return (
    <div
      className="w-full aspect-square relative bg-[#f8fafc] rounded-[2rem] border border-gray-100 overflow-hidden cursor-zoom-in transition-all duration-500 hover:shadow-2xl hover:border-gray-200"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={imgSrc}
        alt={alt || "Product"}
        onError={(e) => { setImgSrc(FALLBACK_IMAGE); e.target.onerror = null; }}
        className={`w-full h-full object-contain p-8 transition-opacity duration-200 ${showZoom && imgSrc !== FALLBACK_IMAGE ? 'opacity-0' : 'opacity-100'}`}
      />
      {showZoom && imgSrc !== FALLBACK_IMAGE && (
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-white"
          style={{ backgroundImage: `url("${imgSrc}")`, backgroundPosition: position, backgroundSize: '200%', backgroundRepeat: 'no-repeat' }}
        />
      )}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  
  // Try to use CompareContext if it exists, otherwise provide a fallback
  let addToCompare = () => showToast("Compare feature coming soon", "info");
  try {
    const compareCtx = useCompare();
    if (compareCtx && compareCtx.addToCompare) addToCompare = compareCtx.addToCompare;
  } catch (e) { /* Fallback used */ }

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  
  // Sticky bottom bar logic
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const res = await fetchProductById(id);
        const data = res.data || res;
        if (!data) throw new Error('Product not found');
        
        let parsedImages = [];
        if (Array.isArray(data.images)) {
          parsedImages = data.images.map(img => typeof img === 'string' ? img : img.url);
        } else if (data.image) {
          parsedImages = [data.image];
        }
        setProduct({ 
          ...data, 
          images: parsedImages.length > 0 ? parsedImages : [FALLBACK_IMAGE],
          video_urls: data.video_urls ? data.video_urls.split(',').filter(url => url.trim() !== '') : [],
          product_links: data.product_links ? JSON.parse(data.product_links) : []
        });
        addToRecentlyViewed({ ...data, images: parsedImages.length > 0 ? parsedImages : [FALLBACK_IMAGE] });
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };
    getProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    showToast(`Added ${quantity} to cart`, "success");
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    navigate('/cart');
  };

  const handleCompare = () => {
    if(product) {
      addToCompare(product);
      showToast("Added to compare list", "success");
    }
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      const today = new Date();
      const delivery = new Date(today.setDate(today.getDate() + 3));
      setDeliveryDate(delivery.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
    } else {
      showToast("Enter a valid 6-digit pincode", "error");
    }
  };

  if (loading) return <ProductSkeleton />;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">{error}</div>;

  const images = product.images;
  const originalPrice = Number(product.price || 0);
  const sellingPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = product.discount_price && originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  
  const descriptionLines = (product.description || '').split('\n').filter(line => line.trim().length > 0);

  return (
    <div className="bg-white min-h-screen pb-32 font-sans antialiased text-gray-900 selection:bg-gray-900 selection:text-white">
      
      {/* Breadcrumbs */}
      <div className="bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-gray-900 transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>
      </div>

      {/* Main Top Section: 2 Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        
        {/* LEFT: Premium Gallery */}
        <div className="flex flex-col gap-4">
          <ImageZoom src={images[selectedImage]} alt={product.name} />
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)} 
                  className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${selectedImage === idx ? 'border-2 border-gray-900 ring-4 ring-gray-100' : 'border border-gray-200 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain p-2 bg-[#f8fafc]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Information & Buying Actions */}
        <div className="flex flex-col">
          {/* Badges */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Premium</span>
            {product.brand && <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{product.brand}</span>}
            <span className="text-[11px] font-bold text-gray-400 uppercase">SKU: {product.sku || 'N/A'}</span>
          </div>

          {/* Title & Ratings */}
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-black text-gray-900 ml-2">{product.rating || '5.0'}</span>
              <span className="text-xs text-gray-400 font-bold ml-1 hover:underline cursor-pointer">(Read Reviews)</span>
            </div>
            
            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              {product.quantity > 0 ? 'In Stock Ready to Ship' : 'Out of Stock'}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="mb-8">
            <div className="flex items-end gap-4 mb-2">
              <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{sellingPrice.toLocaleString()}</span>
              {discountPercentage > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through font-bold mb-1">₹{originalPrice.toLocaleString()}</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-black mb-1">Save {discountPercentage}%</span>
                </>
              )}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inclusive of all taxes</p>
          </div>

          {/* Quantity & Add to Cart Container */}
          <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 sm:w-32 h-14">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-gray-900"><Minus size={18} /></button>
                <span className="font-black text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.quantity} className="text-gray-400 hover:text-gray-900 disabled:opacity-30"><Plus size={18} /></button>
              </div>

              {/* Main Actions */}
              <button 
                onClick={handleAddToCart} 
                disabled={product.quantity <= 0} 
                className="flex-1 h-14 bg-gray-900 text-white rounded-2xl font-black text-lg transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:transform-none flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </div>
            
            <button 
              onClick={handleBuyNow} 
              disabled={product.quantity <= 0} 
              className="w-full mt-4 h-14 bg-amber-400 text-gray-900 rounded-2xl font-black text-lg transition-all hover:bg-amber-500 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:transform-none"
            >
              Buy It Now
            </button>
          </div>

          {/* Secondary Actions (Wishlist, Compare, Share) */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-8">
            <button onClick={() => setIsWishlisted(!isWishlisted)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors group">
              <Heart size={18} className={`transition-all ${isWishlisted ? 'fill-red-500 text-red-500' : 'group-hover:scale-110'}`} /> 
              {isWishlisted ? 'Saved' : 'Wishlist'}
            </button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button onClick={handleCompare} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors group">
              <GitCompare size={18} className="group-hover:scale-110 transition-transform" /> Compare
            </button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-600 transition-colors group">
              <Share2 size={18} className="group-hover:scale-110 transition-transform" /> Share
            </button>
          </div>

          {/* Delivery & Trust */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={18} className="text-gray-900" />
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Delivery Estimate</h4>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" maxLength={6} placeholder="Enter Pincode" 
                  value={pincode} onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-gray-900 transition-all"
                />
                <button onClick={checkDelivery} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-black uppercase transition-colors">Verify</button>
              </div>
              {deliveryDate && (
                <p className="mt-3 text-sm font-bold text-green-700 flex items-center gap-2">
                  <Truck size={16} /> Delivery by {deliveryDate}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3">
                <Award className="text-blue-600 mt-1 shrink-0" size={20} />
                <div><p className="text-xs font-black uppercase text-gray-900">1 Year Warranty</p><p className="text-[10px] text-gray-500 font-medium mt-1">Official brand protection</p></div>
              </div>
              <div className="flex items-start gap-3 p-3">
                <RefreshCcw className="text-purple-600 mt-1 shrink-0" size={20} />
                <div><p className="text-xs font-black uppercase text-gray-900">7-Day Returns</p><p className="text-[10px] text-gray-500 font-medium mt-1">Hassle-free replacement</p></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Deep Details Section (Full Width Tabs) */}
      <div className="bg-gray-50/50 border-y border-gray-100 mt-12 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-12 border-b border-gray-200 mb-12">
            {['description', 'specifications', 'media'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`pb-4 text-sm sm:text-base font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900 rounded-t-lg" />}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
                {descriptionLines.map((line, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <Check className="text-green-500 shrink-0 mt-1" size={20}/>
                    <span className="font-medium leading-relaxed">{line}</span>
                  </div>
                ))}
                
                {product.product_links?.length > 0 && (
                  <div className="mt-12 p-8 bg-white rounded-3xl border border-gray-200 text-center">
                    <h4 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">Available at External Retailers</h4>
                    <div className="flex flex-wrap justify-center gap-4">
                      {product.product_links.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-gray-50 hover:bg-gray-900 hover:text-white border border-gray-200 rounded-xl text-sm font-bold transition-all shadow-sm">
                          {link.label || 'Purchase Link'} <ChevronRight size={16} className="inline ml-1" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Brand", value: product.brand || 'Anritvox' },
                  { label: "SKU", value: product.sku || 'N/A' },
                  { label: "Category", value: typeof product.category === 'object' ? product.category.name : product.category },
                  { label: "Base Warranty", value: product.warranty_period || 'Standard 12 Months' }
                ].map((spec, i) => (
                  <div key={i} className="flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <span className="text-xs text-gray-400 font-black uppercase tracking-widest mb-2">{spec.label}</span>
                    <span className="text-lg font-bold text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-8">
                {product.model_3d_url && (
                  <div className="w-full aspect-video bg-gray-100 rounded-[2rem] overflow-hidden relative shadow-inner border border-gray-200">
                    <iframe title="3D Model Viewer" className="w-full h-full relative z-10" src={product.model_3d_url} allow="autoplay; fullscreen; xr-spatial-tracking" />
                  </div>
                )}
                {product.video_urls?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {product.video_urls.map((vid, i) => (
                      <div key={i} className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border border-gray-200">
                        <iframe src={getYouTubeEmbedUrl(vid)} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`Video ${i}`} />
                      </div>
                    ))}
                  </div>
                ) : !product.model_3d_url && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Box size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest">No additional media uploaded</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews & QA */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ReviewSection productId={id} />
        <div className="mt-16">
          <QASection productId={id} />
        </div>
      </div>
      
      <RecentlyViewed currentId={id} />

      {/* Sticky Bottom Cart Bar (Appears on Scroll) */}
      <div className={`fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 transform transition-transform duration-500 z-50 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-full max-w-4xl flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-4 flex-1">
            <img src={images[0]} alt="Thumb" className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-100" />
            <div className="truncate pr-4">
              <h4 className="text-sm font-black text-gray-900 truncate">{product.name}</h4>
              <p className="text-xs font-bold text-gray-500">₹{sellingPrice.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleAddToCart} 
              disabled={product.quantity <= 0} 
              className="flex-1 sm:w-40 h-12 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-gray-800 disabled:bg-gray-300 transition-all flex items-center justify-center gap-2"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleBuyNow} 
              disabled={product.quantity <= 0} 
              className="flex-1 sm:w-40 h-12 bg-amber-400 text-gray-900 rounded-xl font-black text-sm hover:bg-amber-500 disabled:bg-gray-200 transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
