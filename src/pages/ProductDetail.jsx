import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api, { BASE_URL } from '../services/api';
import { Loader2, ShoppingCart, ShieldCheck, Truck, RotateCcw, AlertTriangle, ArrowLeft, Heart, CheckCircle } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [safeImages, setSafeImages] = useState([]);

  // Bulletproof image resolver
  const resolveImageUrl = (path) => {
    if (!path || typeof path !== 'string') return '/logo.webp';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^[\/\\]/, '').replace(/^uploads[\/\\]/, '');
    return `${BASE_URL}/uploads/${cleanPath}`;
  };

  useEffect(() => {
    let isMounted = true;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        const data = res.data?.data || res.data;
        
        if (isMounted) {
          setProduct(data);
          
          // CRITICAL FIX: Safe Image Array Extraction
          let imagesArray = [];
          if (Array.isArray(data.images)) {
             imagesArray = data.images.map(resolveImageUrl);
          } else if (typeof data.image_url === 'string') {
             imagesArray = [resolveImageUrl(data.image_url)];
          } else {
             imagesArray = ['/logo.webp'];
          }
          
          setSafeImages(imagesArray);
          setSelectedImage(imagesArray[0]);
        }
      } catch (err) {
        console.error("Product Load Error:", err);
        if (isMounted) setError("ASSET_NOT_FOUND");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProduct();
    return () => { isMounted = false; };
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity}x ${product.name} to ledger`, "success");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Asset Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">The requested infrastructure component does not exist or has been removed from the directory.</p>
      <button onClick={() => navigate('/shop')} className="flex items-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-bold uppercase tracking-widest transition-all">
        <ArrowLeft className="w-4 h-4" /> Return to Directory
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">
          <button onClick={() => navigate('/shop')} className="hover:text-purple-400 transition-colors">Directory</button>
          <span>/</span>
          <span className="text-purple-400 truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          
          {/* --- LEFT: Image Gallery --- */}
          <div className="space-y-6">
            <div className="aspect-square bg-[#0a0c10] border border-white/5 rounded-[40px] flex items-center justify-center p-8 relative overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent opacity-50" />
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.src = '/logo.webp'; }}
              />
            </div>
            
            {safeImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                {safeImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`shrink-0 w-24 h-24 rounded-2xl bg-[#0a0c10] border p-2 overflow-hidden transition-all ${
                      selectedImage === img ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain opacity-80 hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT: Product Details --- */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 w-fit">
              {product.brand || 'ANRITVOX CORE'}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-end gap-4 mb-8 pb-8 border-b border-white/5">
              <span className="text-4xl font-black text-white">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
              {product.quantity > 0 ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2"><CheckCircle className="w-4 h-4"/> In Stock</span>
              ) : (
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Offline / Out of Stock</span>
              )}
            </div>

            <div className="prose prose-invert prose-sm text-gray-400 mb-10 max-w-none">
              <p>{product.description}</p>
            </div>

            {/* Purchase Interface */}
            <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-6 mb-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-black border border-white/10 rounded-2xl p-2 w-full sm:w-32 shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">-</button>
                  <span className="font-mono font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))} disabled={quantity >= product.quantity} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-30">+</button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:shadow-none h-14"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.quantity > 0 ? 'Initialize Deployment' : 'Unavailable'}
                </button>
                
                <button className="w-14 h-14 shrink-0 flex items-center justify-center bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400 rounded-2xl transition-all text-gray-400">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Value Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <ShieldCheck className="w-6 h-6 text-purple-400 mb-2" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">E-Warranty Ready</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <Truck className="w-6 h-6 text-emerald-400 mb-2" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Express Shipping</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <RotateCcw className="w-6 h-6 text-blue-400 mb-2" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">7-Day Returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
