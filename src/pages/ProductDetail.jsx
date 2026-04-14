import React, { useState, useEffect } from 'react';
import QASection from '../components/QASection';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, 
  Heart, Share2, Shield, Plus, Zap, Tag, MonitorPlay, Box,
  Truck, RefreshCcw, Lock, CreditCard, Award, Info, MapPin
} from 'lucide-react';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import RecentlyViewed, { addToRecentlyViewed } from '../components/RecentlyViewed';
import SizeChart from '../components/SizeChart';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%2394a3b8' text-anchor='middle' dominant-baseline='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E";

const ProductSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse bg-white">
    <div className="lg:col-span-5 space-y-4"><div className="w-full aspect-square bg-slate-100 rounded-[2rem]"></div></div>
    <div className="lg:col-span-4 space-y-6 pt-6"><div className="h-10 bg-slate-100 rounded-xl w-3/4"></div><div className="h-6 bg-slate-100 rounded w-1/4"></div></div>
    <div className="lg:col-span-3 w-full h-[500px] bg-slate-50 rounded-[2.5rem] border border-slate-100"></div>
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
      className="w-full aspect-square relative bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden cursor-zoom-in group transition-all duration-500 hover:shadow-xl"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={imgSrc}
        alt={alt || "Product"}
        onError={(e) => { setImgSrc(FALLBACK_IMAGE); e.target.onerror = null; }}
        className={`w-full h-full object-contain p-4 transition-opacity duration-200 ${showZoom && imgSrc !== FALLBACK_IMAGE ? 'opacity-0' : 'opacity-100'}`}
      />
      {showZoom && imgSrc !== FALLBACK_IMAGE && (
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-white"
          style={{ backgroundImage: `url("${imgSrc}")`, backgroundPosition: position, backgroundSize: '250%', backgroundRepeat: 'no-repeat' }}
        />
      )}
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
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  
  const { addToCart } = useCart();

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
          video_urls: data.video_urls ? data.video_urls.split(',') : [],
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
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    navigate('/cart');
  };

  const checkDelivery = () => {
    if (pincode.length === 6) {
      const today = new Date();
      const delivery = new Date(today.setDate(today.getDate() + 3));
      setDeliveryDate(delivery.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
    }
  };

  if (loading) return <ProductSkeleton />;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">{error}</div>;

  const images = product.images;
  const originalPrice = Number(product.price || 0);
  const sellingPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = product.discount_price && originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  
  // Fixed the broken newline split here
  const descriptionLines = (product.description || '').split('\n').filter(line => line.trim().length > 0);

  return (
    <div className="bg-white min-h-screen pb-32 font-sans antialiased text-gray-900">
      
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 text-[13px] font-bold text-gray-400 flex items-center gap-3 uppercase">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-gray-900">Shop</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Gallery */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ImageZoom src={images[selectedImage]} alt={product.name} />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`min-w-[80px] h-20 rounded-2xl p-2 transition-all ${selectedImage === idx ? 'border-2 border-gray-900 scale-105 shadow-md' : 'border border-gray-100 opacity-60'}`}>
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-amber-600" />
              <h4 className="font-black uppercase text-xs tracking-widest text-gray-900">Anritvox Certified</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Check size={14} className="text-green-500" /> 100% Genuine Product
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Check size={14} className="text-green-500" /> Quality Inspected
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Check size={14} className="text-green-500" /> Secure Packaging
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600">
                <Check size={14} className="text-green-500" /> Fast Fulfillment
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Info & Tabs */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-gray-900 text-white text-[10px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter">Top Rated</span>
              {product.brand && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.brand}</span>}
            </div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-black text-yellow-700">{product.rating || '4.8'}</span>
                <span className="text-xs text-yellow-600 font-bold ml-1">(120+ Reviews)</span>
              </div>
              <button onClick={() => setIsWishlisted(!isWishlisted)} className={`flex items-center gap-2 px-4 py-1 rounded-full border transition-all ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900'}`}>
                <Heart size={16} className={isWishlisted ? 'fill-red-500' : ''} />
                <span className="text-xs font-black uppercase tracking-widest">Wishlist</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Tag size={40} className="text-slate-200 -rotate-12 opacity-50" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gray-900">₹{sellingPrice.toLocaleString()}</span>
              {discountPercentage > 0 && (
                <div className="mb-1.5">
                  <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                  <span className="ml-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black">Save {discountPercentage}%</span>
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inclusive of all taxes</p>
          </div>

          {/* Delivery Check */}
          <div className="p-6 rounded-[2rem] border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">Check Delivery</h4>
              <MapPin size={16} className="text-gray-400" />
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                maxLength={6}
                placeholder="Enter Pincode" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-gray-900 transition-all"
              />
              <button onClick={checkDelivery} className="px-6 py-2 bg-gray-900 text-white rounded-xl text-xs font-black uppercase">Check</button>
            </div>
            {deliveryDate ? (
              <div className="flex items-center gap-2 text-green-700 text-xs font-bold">
                <Truck size={14} /> Delivering by <span>{deliveryDate}</span>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 font-bold italic">Enter pincode to see delivery estimate</p>
            )}
          </div>

          <div className="pt-4">
            <div className="flex gap-6 border-b border-gray-200">
              {['description', 'specifications', 'media'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-gray-900 border-b-4 border-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="py-6">
              {activeTab === 'description' && (
                <div className="space-y-4 text-sm font-medium text-gray-600">
                  {descriptionLines.map((line, i) => <div key={i} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all"><Check className="text-green-500 shrink-0" size={18}/><span className="text-gray-800 leading-relaxed">{line}</span></div>)}
                  {product.product_links?.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Info size={16}/> External Retailers</h4>
                      <div className="flex flex-wrap gap-3">
                        {product.product_links.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-100 hover:bg-gray-900 hover:text-white rounded-lg text-sm font-bold text-gray-900 transition-all">
                            {link.label || 'Buy Here'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Brand</div>
                    <div className="font-black text-gray-900">{product.brand || 'Anritvox'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">SKU</div>
                    <div className="font-black text-gray-900">{product.sku || 'N/A'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Category</div>
                    <div className="font-black text-gray-900">{typeof product.category === 'object' ? product.category.name : product.category}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Stock Status</div>
                    <div className="font-black text-green-600">{product.quantity > 0 ? 'In Stock' : 'Out of Stock'}</div>
                  </div>
                </div>
              )}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {product.model_3d_url && (
                    <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group flex items-center justify-center">
                      <Box className="absolute text-gray-300 w-20 h-20 opacity-50" />
                      <iframe title="3D Model Viewer" className="w-full h-full relative z-10" src={product.model_3d_url} allow="autoplay; fullscreen; xr-spatial-tracking" />
                    </div>
                  )}
                  {product.video_urls?.length > 0 ? product.video_urls.map((vid, i) => (
                    <div key={i} className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                      <iframe src={vid.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title={`Video ${i}`} />
                    </div>
                  )) : !product.model_3d_url && <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200"><p className="text-gray-400 italic font-bold">No additional media available.</p></div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Buy Panel */}
        <div className="lg:col-span-3 relative z-10 w-full">
          <div className="lg:sticky lg:top-28 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-green-50 border border-green-100 p-4 rounded-3xl">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative rounded-full h-4 w-4 bg-green-500"></span>
                </span>
                <div>
                  <p className="text-base text-green-800 font-black">Available Now</p>
                  {product.quantity < 10 && <p className="text-xs text-red-600 font-black mt-1 bg-red-100 px-2 py-0.5 rounded-md w-fit">Selling Fast! {product.quantity} left</p>}
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl flex items-center gap-3">
                <Zap size={18} className="text-amber-600 fill-amber-600 animate-pulse" />
                <p className="text-[11px] font-black text-amber-800 uppercase tracking-wider">45 people added this to cart today</p>
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={handleAddToCart} disabled={product.quantity <= 0} className={`w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-900/20 active:scale-95'}`}>
                {addedToCart ? <Check /> : <ShoppingCart size={20} />}
                {addedToCart ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={product.quantity <= 0} className={`w-full h-16 rounded-2xl font-black text-lg transition-all ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-amber-400 text-gray-900 hover:bg-amber-500 shadow-xl shadow-amber-400/20 active:scale-95'}`}>
                Buy It Now
              </button>
            </div>

            {/* Trust Signals */}
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Truck size={20}/></div>
                  <div><p className="text-xs font-black text-gray-900">Free Shipping</p><p className="text-[10px] text-gray-400 font-bold">On orders over ₹499</p></div>
                </div>
                <div className="flex items-center gap-4 p-2">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><RefreshCcw size={20}/></div>
                  <div><p className="text-xs font-black text-gray-900">7-Day Returns</p><p className="text-[10px] text-gray-400 font-bold">Easy hassle-free policy</p></div>
                </div>
                <div className="flex items-center gap-4 p-2">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><Lock size={20}/></div>
                  <div><p className="text-xs font-black text-gray-900">Secure Payment</p><p className="text-[10px] text-gray-400 font-bold">SSL encrypted checkout</p></div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guaranteed Safe Checkout</p>
                <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
                  <CreditCard size={24} />
                  <div className="font-black text-xl italic">VISA</div>
                  <div className="font-black text-xl italic">GPay</div>
                  <div className="font-black text-xl italic text-blue-800">PAYPAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
        <ReviewSection productId={id} />
        <QASection productId={id} />
      </div>
      <RecentlyViewed currentId={id} />
    </div>
  );
}
