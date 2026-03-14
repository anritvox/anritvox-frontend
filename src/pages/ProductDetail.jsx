/* ProductDetail.jsx - Amazon Style Redesign with Fixed Fetching Logic */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { 
  FiStar as Star, 
  FiChevronRight as ChevronRight, 
  FiCheck as Check, 
  FiShoppingCart as ShoppingCart 
} from 'react-icons/fi';

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
      // 1. Guard against 'undefined' or missing ID in URL
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

        // 2. Safely parse images (MySQL often sends them as strings)
        let processedImages = [];
        if (Array.isArray(data.images)) {
          processedImages = data.images;
        } else if (typeof data.images === 'string') {
          try {
            processedImages = JSON.parse(data.images);
          } catch (e) {
            processedImages = [data.images]; // Fallback to single string URL
          }
        } else if (data.image) {
          processedImages = [data.image];
        }

        setProduct({ ...data, images: processedImages });
        setError('');
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

  const images = product.images || [];
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className="bg-white min-h-screen pb-12 font-sans antialiased">
      {/* Breadcrumb */}
      <div className="max-w-[1500px] mx-auto px-4 py-3 text-xs text-gray-600 flex items-center gap-1 overflow-x-auto whitespace-nowrap border-b border-gray-100">
        <Link to="/" className="hover:text-[#c45500] hover:underline">Home</Link>
        <ChevronRight size={12} className="text-gray-400" />
        <Link to="/shop" className="hover:text-[#c45500] hover:underline">Shop</Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[340px_1fr_300px] gap-6 lg:gap-12">
        
        {/* Left: Images */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-full aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center relative">
            <img
              src={images[selectedImage] || "https://via.placeholder.com/400?text=No+Image"}
              alt={product.name}
              className="w-full h-full object-contain p-2 hover:scale-105 transition-transform cursor-zoom-in"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full scrollbar-hide justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                onClick={() => setSelectedImage(idx)}
                className={`w-14 h-14 border-2 rounded-md p-1 flex-shrink-0 transition-all ${selectedImage === idx ? 'border-[#e77600] shadow-sm' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <img src={img} alt="" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Center: Product Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl md:text-2xl font-medium text-[#0f1111] leading-tight mb-1">{product.name}</h1>
            <p className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer">Visit the Anritvox Store</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-[#FFA41C] text-[#FFA41C]" />)}
            </div>
            <span className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer"> 426 ratings </span>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              {discount > 0 && <span className="text-[#cc0c39] text-2xl font-light">-{discount}%</span>}
              <div className="flex items-start">
                <span className="text-sm mt-1 font-medium">₹</span>
                <span className="text-3xl font-medium text-[#0f1111]">{product.price?.toLocaleString()}</span>
              </div>
            </div>
            {product.mrp && (
              <p className="text-sm text-gray-500">
                M.R.P.: <span className="line-through">₹{product.mrp?.toLocaleString()}</span>
              </p>
            )}
            <p className="text-sm font-medium mt-2">Inclusive of all taxes</p>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-2">
            <h3 className="font-bold text-sm">About this item</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#0f1111]">
              {product.description?.split('\n').filter(l => l.trim().length > 0).map((line, i) =>
                <li key={i} className="leading-relaxed">{line}</li>
              ) || <li>High-quality premium car accessory.</li>}
            </ul>
          </div>
        </div>

        {/* Right: Buy Box */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-start">
              <span className="text-sm mt-1">₹</span>
              <span className="text-2xl font-medium">{product.price?.toLocaleString()}</span>
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
                {addedToCart ? <><Check size={16} /> Added</> : <><ShoppingCart size={16} /> Add to Cart</>}
              </button>
              
              <button
                onClick={handleBuyNow}
                className="w-full py-2 rounded-full font-medium text-sm bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] shadow-sm transition-colors"
              >
                Buy Now
              </button>
            </div>

            <div className="text-xs text-gray-600 pt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Ships from</span>
                <span className="text-[#007185]">Anritvox</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sold by</span>
                <span className="text-[#007185]">Anritvox Store</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
