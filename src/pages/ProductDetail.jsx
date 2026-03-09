/* ProductDetail.jsx – Amazon Style Redesign */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById } from '../services/api';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  MapPin,
  Check,
  Info,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    getProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] bg-white'>
        <div className='w-12 h-12 border-4 border-[#febd69] border-t-transparent rounded-full animate-spin mb-4'></div>
        <p className='text-gray-600 font-medium'>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className='max-w-7xl mx-auto px-4 py-16 text-center bg-white'>
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4'>
          <Info size={32} />
        </div>
        <h2 className='text-2xl font-bold text-gray-900 mb-2'>Oops!</h2>
        <p className='text-gray-600 mb-6'>{error || 'Product not found'}</p>
        <Link to='/shop' className='text-[#007185] hover:text-[#c45500] hover:underline font-medium'>
          Return to Shop
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <div className='bg-white min-h-screen pb-12 font-sans antialiased'>
      {/* Breadcrumbs */}
      <div className='max-w-[1500px] mx-auto px-4 py-3 text-xs text-gray-600 flex items-center gap-1 overflow-x-auto whitespace-nowrap'>
        <Link to='/' className='hover:text-[#c45500] hover:underline'>Home</Link>
        <ChevronRight size={12} />
        <Link to='/shop' className='hover:text-[#c45500] hover:underline'>Shop</Link>
        <ChevronRight size={12} />
        <span className='text-gray-400 truncate'>{product.name}</span>
      </div>

      <div className='max-w-[1500px] mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 relative'>
        {/* Left Column: Gallery */}
        <div className='lg:col-span-5 flex flex-col-reverse md:flex-row gap-4 sticky top-4 self-start'>
          <div className='flex md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0'>
            {images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => setSelectedImage(idx)}
                onClick={() => setSelectedImage(idx)}
                className={`w-12 h-12 md:w-14 md:h-14 border-2 rounded p-1 flex-shrink-0 transition-all ${
                  selectedImage === idx ? 'border-[#e77600] ring-2 ring-[#e77600]/20' : 'border-gray-200 hover:border-[#e77600]'
                }`}
              >
                <img src={img} alt='' className='w-full h-full object-contain' />
              </button>
            ))}
          </div>
          <div className='flex-1 relative bg-gray-50 rounded-lg overflow-hidden group cursor-zoom-in min-h-[400px] flex items-center justify-center border border-gray-100'>
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[selectedImage]}
              alt={product.name}
              className='max-h-[500px] w-auto object-contain p-4'
            />
          </div>
        </div>

        {/* Middle Column: Info */}
        <div className='lg:col-span-4 flex flex-col gap-4'>
          <div className='border-b border-gray-200 pb-4'>
            <h1 className='text-xl md:text-2xl font-medium text-[#0F1111] mb-2'>{product.name}</h1>
            <Link to='/shop' className='text-[#007185] hover:text-[#c45500] hover:underline text-sm font-medium'>Visit the Anritvox Store</Link>
            <div className='flex items-center gap-2 mt-2'>
              <div className='flex items-center text-[#ffa41c]'>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < 4 ? 'currentColor' : 'none'} />)}
                <ChevronDown size={14} className='ml-1 text-gray-500' />
              </div>
              <span className='text-[#007185] text-sm'>426 ratings</span>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-light text-red-600'>-{discount}%</span>
              <div className='flex font-medium'><span className='text-sm mt-1'>₹</span><span className='text-3xl'>{product.price.toLocaleString()}</span></div>
            </div>
            <div className='text-xs text-gray-500'>M.R.P.: <span className='line-through'>₹{product.mrp?.toLocaleString()}</span></div>
            <div className='bg-[#f0f2f2] px-3 py-1.5 rounded-sm inline-block self-start text-xs font-bold text-gray-700 mt-2'>FREE delivery</div>
          </div>
          <div className='flex flex-col gap-2 mt-4'>
            <h3 className='font-bold text-base'>About this item</h3>
            <ul className='list-disc ml-5 text-sm text-[#0F1111] space-y-1.5'>
              {product.description?.split('\
').filter(l => l.trim()).map((line, i) => <li key={i}>{line}</li>) || <li>Premium quality.</li>}
            </ul>
          </div>
        </div>

        {/* Right Column: Buy Box */}
        <div className='lg:col-span-3'>
          <div className='border border-gray-300 rounded-lg p-4 sticky top-4 self-start bg-white'>
            <div className='flex items-baseline gap-1 font-medium mb-4'><span className='text-sm mt-1'>₹</span><span className='text-2xl'>{product.price.toLocaleString()}</span></div>
            <p className='text-lg text-green-700 font-medium mb-4'>In stock</p>
            <div className='flex flex-col gap-3'>
              <button className='w-full bg-[#FFD814] hover:bg-[#F7CA00] text-black py-2 rounded-full text-sm font-medium shadow-sm border border-[#FCD200]'>Add to Cart</button>
              <button className='w-full bg-[#FFA41C] hover:bg-[#FA8900] text-black py-2 rounded-full text-sm font-medium shadow-sm border border-[#FF8F00]'>Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
