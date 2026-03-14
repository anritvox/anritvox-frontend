/* src/pages/ProductDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, MemoryRouter, Routes, Route } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// Inline SVGs for the preview (Guarantees no "Could not resolve" errors)
const Icon = {
  Star: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  ShoppingCart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Heart: ({ filled }) => <svg className={`w-5 h-5 ${filled ? 'fill-red-500 text-red-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Truck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>,
  Shield: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Minus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>,
  ChevronRight: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
};
// ==========================================

const FALLBACK_IMAGE = "https://via.placeholder.com/600x600?text=No+Image+Available";

const ProductSkeleton = () => (
  <div className="max-w-[1500px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[380px_1fr_340px] gap-8 animate-pulse">
    <div className="space-y-4">
      <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
      <div className="flex gap-2 justify-center"><div className="w-14 h-14 bg-gray-200 rounded-lg"></div><div className="w-14 h-14 bg-gray-200 rounded-lg"></div><div className="w-14 h-14 bg-gray-200 rounded-lg"></div></div>
    </div>
    <div className="space-y-4 pt-4">
      <div className="h-10 bg-gray-200 rounded w-3/4"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      <div className="h-12 bg-gray-200 rounded w-1/3 mt-6"></div>
      <div className="space-y-2 mt-8"><div className="h-4 bg-gray-200 rounded w-full"></div><div className="h-4 bg-gray-200 rounded w-5/6"></div><div className="h-4 bg-gray-200 rounded w-4/6"></div></div>
    </div>
    <div className="w-full h-[400px] bg-gray-200 rounded-2xl"></div>
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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 backdrop-blur-sm">
        <Icon.Plus /> Hover to zoom
      </div>
    </div>
  );
};

export function ProductDetailComponent() {
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
        const data = await fetchProductById(id || 'mock-id');
        if (!data) { setError('Product not found.'); return; }

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
      } catch (err) {
        setError('Failed to fetch product details.');
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

  if (loading) return <ProductSkeleton />;

  const images = product?.images || [FALLBACK_IMAGE];
  const originalPrice = Number(product?.price || 0);
  const sellingPrice = product?.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = discountPricePercentage(originalPrice, sellingPrice);
  const descriptionLines = (product?.description || '').split('\n').filter(l => l.trim().length > 0);

  function discountPricePercentage(orig, sell) {
    if (!sell || orig <= sell) return 0;
    return Math.round(((orig - sell) / orig) * 100);
  }

  return (
    <div className="bg-[#f2f4f8] min-h-screen pb-16 font-sans">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1500px] mx-auto px-4 py-3 text-sm text-gray-500 flex items-center gap-2 overflow-x-auto">
          <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
          <Icon.ChevronRight />
          <Link to="/shop" className="hover:text-orange-600 transition-colors">Shop</Link>
          <Icon.ChevronRight />
          <span className="text-gray-900 font-medium truncate max-w-[250px]">{product?.name}</span>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[400px_1fr_360px] gap-8 items-start">
        
        <div className="flex flex-col items-center gap-4">
          <ImageZoom src={images[selectedImage]} alt={product?.name} />
          <div className="flex gap-3 overflow-x-auto pb-2 w-full justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                className={`w-16 h-16 rounded-xl p-1 transition-all bg-white border-2 ${
                  selectedImage === idx ? 'border-orange-400 ring-2 ring-orange-100 scale-105' : 'border-transparent hover:border-gray-200 shadow-sm'
                }`}
              >
                <img src={img} className="w-full h-full object-contain rounded-lg" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{product?.name}</h1>
              <button onClick={() => setIsWishlisted(!isWishlisted)} className="p-2 rounded-full hover:bg-red-50 transition-colors">
                <Icon.Heart filled={isWishlisted} />
              </button>
            </div>
            <p className="text-sm font-medium text-teal-700">Brand: {product?.brand}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex text-orange-400">
              <Icon.Star /><Icon.Star /><Icon.Star /><Icon.Star /><Icon.Star />
            </div>
            <span className="text-sm text-gray-500 font-medium hover:underline cursor-pointer">1,248 ratings</span>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-1">
            <div className="flex items-end gap-3">
              {discountPercentage > 0 && <span className="text-red-600 text-3xl font-light">-{discountPercentage}%</span>}
              <div className="flex items-start">
                <span className="text-sm mt-1 font-medium text-gray-900">₹</span>
                <span className="text-4xl font-bold text-gray-900">{sellingPrice.toLocaleString()}</span>
              </div>
            </div>
            {discountPercentage > 0 && (
              <p className="text-sm text-gray-400 line-through">M.R.P.: ₹{originalPrice.toLocaleString()}</p>
            )}
            <p className="text-xs text-gray-500 font-medium mt-1">Inclusive of all taxes</p>
          </div>

          <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100">
            {[
              { icon: <Icon.Truck />, label: "Free Delivery" },
              { icon: <Icon.Shield />, label: "Warranty" },
              { icon: <Icon.Check />, label: "Top Brand" },
              { icon: <Icon.Star />, label: "Highly Rated" }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                  {badge.icon}
                </div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{badge.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex gap-8 border-b border-gray-200">
              {['description', 'specifications'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full"></div>}
                </button>
              ))}
            </div>
            <div className="py-6 min-h-[120px]">
              {activeTab === 'description' ? (
                <ul className="space-y-3">
                  {descriptionLines.map((line, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0"></div>
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="font-bold text-gray-800">Brand</div><div>{product?.brand}</div>
                  <div className="font-bold text-gray-800">Model</div><div>V8 Premium</div>
                  <div className="font-bold text-gray-800">Connection</div><div>Bluetooth 5.0</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky top-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl shadow-gray-200/40 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-sm mt-1 font-bold">₹</span>
              <span className="text-3xl font-bold">{sellingPrice.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-green-700 text-sm font-bold">In Stock</p>
              <p className="text-xs text-green-600 mt-0.5">Ships within 24 hours from Anritvox Warehouse</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
            <div className="flex items-center justify-between border border-gray-200 rounded-xl p-1 bg-gray-50">
              <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Icon.Minus /></button>
              <span className="font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(10, q+1))} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Icon.Plus /></button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md ${
                addedToCart ? 'bg-green-600 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
              }`}
            >
              {addedToCart ? 'Added to Cart ✓' : 'Add to Cart'}
            </button>
            <button className="w-full py-4 rounded-xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all">
              Buy Now
            </button>
          </div>

          <div className="flex items-center gap-2 justify-center py-2 text-gray-400 text-xs font-medium">
            <Icon.Shield /> Secure Payment & Warranty
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export as App for the preview environment
export default function App() {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<ProductDetailComponent />} />
        <Route path="/shop" element={<div className="p-10">Shop Page Mockup</div>} />
        <Route path="/cart" element={<div className="p-10">Cart Page Mockup</div>} />
      </Routes>
    </MemoryRouter>
  );
}
