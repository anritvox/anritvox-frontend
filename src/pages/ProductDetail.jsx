/* src/pages/ProductDetail.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const FALLBACK_IMAGE = "https://via.placeholder.com/600x600?text=No+Image+Available";

// Custom Amazon-Style Image Zoom Component
const ImageZoom = ({ src, alt }) => {
  const [position, setPosition] = useState('0% 0%');
  const [showZoom, setShowZoom] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);

  // Update image when props change
  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
  }, [src]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition(`${x}% ${y}%`);
  };

  const handleError = () => {
    setImgSrc(FALLBACK_IMAGE);
  };

  return (
    <div
      className="w-full aspect-square relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-crosshair flex items-center justify-center p-4"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Standard Image with Error Handling */}
      <img
        src={imgSrc}
        alt={alt || "Product Image"}
        onError={handleError}
        className={`w-full h-full object-contain transition-opacity duration-200 ${showZoom ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Zoomed Magnifier Overlay */}
      {showZoom && imgSrc !== FALLBACK_IMAGE && (
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-white"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundPosition: position,
            backgroundSize: '250%', 
            backgroundRepeat: 'no-repeat',
          }}
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
        
        if (!data) {
          setError('Product not found.');
          return;
        }

        // --- AGGRESSIVE IMAGE PATH RECONSTRUCTION ---
        let processedImages = [];
        const rawImages = data.images || data.image || [];
        const imageArray = Array.isArray(rawImages) ? rawImages : [rawImages];

        imageArray.forEach(img => {
          if (!img) return;
          let cleanImg = typeof img === 'string' ? img : String(img);
          
          // 1. Unpack stringified JSON arrays if present
          if (cleanImg.startsWith('[')) {
            try {
              const parsed = JSON.parse(cleanImg);
              if (Array.isArray(parsed) && parsed.length > 0) cleanImg = parsed[0];
            } catch(e) {}
          }
          
          // 2. Strip out 'undefined/' or 'null/' prefixes caused by missing env variables
          cleanImg = cleanImg.replace(/^(undefined|null)\/?/, '');
          
          // 3. Remove leading slashes
          cleanImg = cleanImg.replace(/^\//, '');

          // 4. Force valid URL structure if it's a local file
          if (cleanImg && !cleanImg.startsWith('http') && !cleanImg.startsWith('data:')) {
            // Ensure the 'uploads/' folder is in the path
            const finalPath = cleanImg.startsWith('uploads/') ? cleanImg : `uploads/${cleanImg}`;
            cleanImg = `${BASE_URL}/${finalPath}`;
          }

          if (cleanImg && !processedImages.includes(cleanImg)) {
            processedImages.push(cleanImg);
          }
        });

        // Fallback if absolutely no valid paths were extracted
        if (processedImages.length === 0) {
          processedImages = [FALLBACK_IMAGE];
        }

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-[#ffa41c] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !product) return (
    <div className="p-10 text-center min-h-screen flex flex-col items-center justify-center">
      <p className="text-red-500 font-bold mb-4">{error || 'Product not found'}</p>
      <Link to="/shop" className="text-[#007185] hover:underline">Back to Shop</Link>
    </div>
  );

  const images = Array.isArray(product.images) ? product.images : [FALLBACK_IMAGE];
  
  const originalPrice = Number(product.price || 0);
  const sellingPrice = product.discount_price ? Number(product.discount_price) : originalPrice;
  const discountPercentage = product.discount_price && originalPrice > 0 
    ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) 
    : 0;

  const descriptionLines = (product.description || '')
    .split('\n')
    .filter(line => line.trim().length > 0);

  return (
    <div className="bg-white min-h-screen pb-12 font-sans antialiased">
      {/* Breadcrumb */}
      <div className="max-w-[1500px] mx-auto px-4 py-3 text-xs text-gray-600 flex items-center gap-2 overflow-x-auto whitespace-nowrap border-b border-gray-100">
        <Link to="/" className="hover:text-[#c45500] hover:underline">Home</Link>
        <span className="text-gray-400">/</span>
        <Link to="/shop" className="hover:text-[#c45500] hover:underline">Shop</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-400 truncate max-w-[200px]">{product.name || 'Product'}</span>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[380px_1fr_300px] gap-6 lg:gap-12">
        
        {/* Left: Images with Amazon Zoom */}
        <div className="flex flex-col items-center gap-4">
          <ImageZoom src={images[selectedImage]} alt={product.name} />

          {/* Thumbnail List */}
          <div className="flex gap-2 overflow-x-auto pb-2 w-full scrollbar-hide justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                onClick={() => setSelectedImage(idx)}
                className={`w-14 h-14 border-2 rounded-md p-1 flex-shrink-0 transition-all bg-white ${
                  selectedImage === idx ? 'border-[#e77600] shadow-sm' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${idx}`} 
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }} // Fail-safe for thumbnails
                  className="w-full h-full object-contain" 
                />
              </button>
            ))}
          </div>
        </div>

        {/* Center: Product Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl md:text-2xl font-medium text-[#0f1111] leading-tight mb-1">
              {product.name || 'Unknown Product'}
            </h1>
            <p className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer">
              Visit the {product.brand || 'Anritvox'} Store
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex text-[#FFA41C]">
              ⭐⭐⭐⭐⭐
            </div>
            <span className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer"> 426 ratings </span>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              {discountPercentage > 0 && (
                <span className="text-[#cc0c39] text-2xl font-light">-{discountPercentage}%</span>
              )}
              <div className="flex items-start">
                <span className="text-sm mt-1 font-medium">₹</span>
                <span className="text-3xl font-medium text-[#0f1111]">
                  {sellingPrice.toLocaleString()}
                </span>
              </div>
            </div>
            {discountPercentage > 0 && (
              <p className="text-sm text-gray-500">
                M.R.P.: <span className="line-through">₹{originalPrice.toLocaleString()}</span>
              </p>
            )}
            <p className="text-sm font-medium mt-2">Inclusive of all taxes</p>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-2">
            <h3 className="font-bold text-sm">About this item</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#0f1111]">
              {descriptionLines.length > 0 ? (
                descriptionLines.map((line, i) => <li key={i} className="leading-relaxed">{line}</li>)
              ) : (
                <li>High-quality premium car accessory designed for durability and performance.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right: Buy Box */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-start">
              <span className="text-sm mt-1">₹</span>
              <span className="text-2xl font-medium">{sellingPrice.toLocaleString()}</span>
            </div>
            
            <p className="text-sm text-[#007600] font-bold">In stock</p>

            <div className="flex items-center gap-2 text-sm text-[#0f1111]">
              <span>Quantity:</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 bg-[#f0f2f2] focus:ring-1 focus:ring-cyan-500 outline-none shadow-sm"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleAddToCart}
                className={`w-full py-2 rounded-full font-medium text-sm shadow-sm transition-colors flex items-center justify-center gap-2 ${
                  addedToCart 
                    ? 'bg-[#2ea44f] text-white' 
                    : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111]'
                }`}
              >
                {addedToCart ? '✓ Added' : '🛒 Add to Cart'}
              </button>
              
              <button
                onClick={handleBuyNow}
                className="w-full py-2 rounded-full font-medium text-sm bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] shadow-sm transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
