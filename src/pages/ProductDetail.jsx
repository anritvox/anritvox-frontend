import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, ChevronRight, Check, ShoppingCart, 
  Heart, Share2, Shield, Plus, Zap, Tag, MonitorPlay, Box
} from 'lucide-react';

import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';

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
  
  const { addToCart } = useCart();

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const res = await fetchProductById(id);
        const data = res.data || res;
        if (!data) throw new Error('Product not found');
        
        // CloudFront logic handles URLs backend side. Just extract strings cleanly.
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

  if (loading) return <ProductSkeleton />;
  if (error || !product) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">{error}</div>;

  const images = product.images;
  const originalPrice = Number(product.price || 0);
  const sellingPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = product.discount_price && originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
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
          <div className="flex gap-4 overflow-x-auto pb-4">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-20 h-20 rounded-2xl p-2 transition-all ${selectedImage === idx ? 'border-2 border-gray-900 scale-105' : 'border border-gray-100 opacity-60'}`}>
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Info & Tabs */}
        <div className="lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
            <div className="flex gap-3">
              <button onClick={() => setIsWishlisted(!isWishlisted)} className={`w-10 h-10 rounded-full flex items-center justify-center border ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400'}`}>
                <Heart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
              </button>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gray-900">₹{sellingPrice.toLocaleString()}</span>
              {discountPercentage > 0 && <span className="bg-green-100 text-green-700 px-3 py-1 mb-1.5 rounded-lg text-xs font-black">Save {discountPercentage}%</span>}
            </div>
          </div>

          <div className="pt-4">
            <div className="flex gap-6 border-b border-gray-200">
              {['description', 'specifications', 'media'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-xs font-black uppercase tracking-widest ${activeTab === tab ? 'text-gray-900 border-b-4 border-gray-900' : 'text-gray-400'}`}>
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="py-6">
              {activeTab === 'description' && (
                <div className="space-y-4 text-sm font-medium text-gray-600">
                  {descriptionLines.map((line, i) => <div key={i} className="flex gap-4 p-3 hover:bg-slate-50"><Check className="text-green-500" size={18}/><span className="text-gray-800">{line}</span></div>)}
                  
                  {/* Phase 4: Product Links Addition */}
                  {product.product_links?.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-bold text-gray-900 mb-3">External Retailers</h4>
                      <div className="flex flex-wrap gap-3">
                        {product.product_links.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-900">
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
                  <div><div className="text-xs text-gray-400 font-bold uppercase">Brand</div><div className="font-black">{product.brand || 'Anritvox'}</div></div>
                  <div><div className="text-xs text-gray-400 font-bold uppercase">SKU</div><div className="font-black">{product.sku || 'N/A'}</div></div>
                </div>
              )}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* Phase 4: Media Gallery */}
                  {product.model_3d_url && (
                    <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden relative group flex items-center justify-center">
                      <Box className="absolute text-gray-300 w-20 h-20 opacity-50" />
                      <iframe title="3D Model Viewer" className="w-full h-full relative z-10" src={product.model_3d_url} allow="autoplay; fullscreen; xr-spatial-tracking" />
                    </div>
                  )}
                  {product.video_urls?.length > 0 ? product.video_urls.map((vid, i) => (
                     <div key={i} className="w-full aspect-video bg-black rounded-2xl overflow-hidden">
                       <iframe src={vid.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title={`Video ${i}`} />
                     </div>
                  )) : !product.model_3d_url && <p className="text-gray-400 italic">No external media available for this product.</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Buy Panel */}
        <div className="lg:col-span-3 relative z-10 w-full">
          <div className="lg:sticky lg:top-28 bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-xl flex flex-col gap-8">
            <div className="flex items-center gap-4 bg-green-50 border border-green-100 p-4 rounded-3xl">
              <span className="relative flex h-4 w-4"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative rounded-full h-4 w-4 bg-green-500"></span></span>
              <div>
                <p className="text-base text-green-800 font-black">In Stock & Ready</p>
                {product.quantity < 10 && <p className="text-xs text-red-600 font-bold mt-1 bg-red-100 px-2 py-1 rounded-md">Only {product.quantity} left!</p>}
              </div>
            </div>

            <div className="space-y-4">
              <button onClick={handleAddToCart} disabled={product.quantity <= 0} className={`w-full h-16 rounded-2xl font-black text-lg transition-all ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                {addedToCart ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={product.quantity <= 0} className={`w-full h-16 rounded-2xl font-black text-lg ${product.quantity <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-amber-400 text-gray-900 hover:bg-amber-500'}`}>
                Buy It Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
         <ReviewSection productId={id} />
      </div>
    </div>
  );
}
