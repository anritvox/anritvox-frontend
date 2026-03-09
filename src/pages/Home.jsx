/* Home.jsx - Amazon Style Redesign */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import hero images
import heroImage1 from "../assets/images/Home1.webp";
import heroImage2 from "../assets/images/Home2.webp";
import heroImage3 from "../assets/images/Home3.webp";
import heroImage4 from "../assets/images/Home4.webp";
import heroImage5 from "../assets/images/Home5.webp";
import heroImage6 from "../assets/images/Home6.webp";
import heroImage7 from "../assets/images/Home7.webp";
import heroImage8 from "../assets/images/Home8.webp";

const heroImages = [
  heroImage1, heroImage2, heroImage3, heroImage4,
  heroImage5, heroImage6, heroImage7, heroImage8,
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextHero = () => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div className="bg-[#eaeded] min-h-screen pb-10">
      {/* Hero Carousel */}
      <div className="relative h-[600px] overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={heroImages[currentImageIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Amazon Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#eaeded] via-transparent to-transparent opacity-100 h-full"></div>

        {/* Carousel Controls */}
        <button onClick={nextHero} className="absolute left-0 top-0 bottom-1/2 flex items-center justify-center w-12 hover:border-2 border-transparent hover:border-white focus:outline-none z-10">
          <ChevronLeft className="w-10 h-10 text-white" />
        </button>
        <button onClick={nextHero} className="absolute right-0 top-0 bottom-1/2 flex items-center justify-center w-12 hover:border-2 border-transparent hover:border-white focus:outline-none z-10">
          <ChevronRight className="w-10 h-10 text-white" />
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1500px] mx-auto px-4 -mt-64 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Top Categories */}
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">Top categories</h2>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { name: "Electronics", img: heroImage1, link: "/shop?category=electronics" },
                { name: "Car Audio", img: heroImage2, link: "/shop?category=audio" },
                { name: "Android Stereo", img: heroImage3, link: "/shop?category=stereo" },
                { name: "Accessories", img: heroImage4, link: "/shop?category=accessories" }
              ].map((cat, i) => (
                <Link key={i} to={cat.link} className="flex flex-col group">
                  <div className="h-24 bg-gray-100 overflow-hidden mb-1">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <span className="text-xs text-gray-700">{cat.name}</span>
                </Link>
              ))}
            </div>
            <Link to="/shop" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline mt-4">Shop all categories</Link>
          </div>

          {/* Card 2: Featured Deal */}
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">Latest Arrivals</h2>
            <div className="flex-1 overflow-hidden">
               <img src={heroImage5} alt="Latest" className="w-full h-full object-cover" />
            </div>
            <Link to="/shop" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline mt-4">Explore now</Link>
          </div>

          {/* Card 3: Warranty Registration */}
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">E-Warranty</h2>
            <div className="flex-1 bg-[#f7f8f8] p-4 flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-10 h-10 text-green-600 fill-current" />
               </div>
               <p className="text-sm text-gray-600 mb-4">Register your Anritvox product for hassle-free service and updates.</p>
               <Link to="/e-warranty" className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black py-2 rounded-lg text-sm font-medium shadow-sm">Register Now</Link>
            </div>
            <Link to="/contact" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline mt-4">Contact support</Link>
          </div>

          {/* Card 4: Sign In Promo */}
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">Sign in for best experience</h2>
            <div className="flex-1 flex flex-col items-center pt-4">
               <Link to="/login" className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-black py-2 rounded-lg text-center text-sm font-medium shadow-sm mb-4">Sign in securely</Link>
               <p className="text-xs text-gray-500 self-start">New customer? <Link to="/register" className="text-[#007185] hover:underline">Start here.</Link></p>
            </div>
            <div className="mt-auto border-t pt-4">
               <h3 className="font-bold text-sm mb-2">Exclusive Benefits</h3>
               <p className="text-xs text-gray-600">Get early access to deals and manage your orders efficiently.</p>
            </div>
          </div>
        </div>

        {/* Best Sellers Slider */}
        <div className="bg-white mt-5 p-5">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold">Best Sellers in Electronics</h2>
            <Link to="/shop" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline">Shop all</Link>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="min-w-[200px] h-[200px] bg-gray-100 animate-pulse"></div>
              ))
            ) : (
              products.slice(0, 10).map((product) => (
                <Link key={product.id} to={`/shop/${product.id}`} className="min-w-[180px] max-w-[180px] group">
                  <div className="h-[180px] flex items-center justify-center bg-white mb-2 overflow-hidden">
                    <img src={product.images?.[0]} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                  </div>
                  <h3 className="text-xs text-[#007185] group-hover:text-[#c45500] line-clamp-2 h-8 leading-4 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 text-orange-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#007185]">{Math.floor(Math.random() * 500) + 100}</span>
                  </div>
                  <p className="text-lg font-medium">₹{product.price.toLocaleString()}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Second Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">Latest Car Stereos</h2>
            <img src={heroImage6} className="flex-1 object-cover" alt="Stereo" />
            <Link to="/shop" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline mt-4">Shop now</Link>
          </div>
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">Ambient Lighting</h2>
            <img src={heroImage7} className="flex-1 object-cover" alt="Lighting" />
            <Link to="/shop" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline mt-4">Explore collection</Link>
          </div>
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">Customer Support</h2>
            <img src={heroImage8} className="flex-1 object-cover" alt="Support" />
            <Link to="/contact" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline mt-4">Get help</Link>
          </div>
          <div className="bg-white p-5 flex flex-col h-[420px]">
            <h2 className="text-xl font-bold mb-4">Premium Quality</h2>
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-1/2 bg-gray-50 p-2 flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-blue-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold">Tested & Certified</p>
                    <p className="text-xs text-gray-500">Every product goes through rigorous quality checks.</p>
                 </div>
              </div>
              <div className="h-1/2 bg-gray-50 p-2 flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-orange-600" />
                 </div>
                 <div>
                    <p className="text-sm font-bold">1 Year Warranty</p>
                    <p className="text-xs text-gray-500">Standard warranty on all electronics.</p>
                 </div>
              </div>
            </div>
            <Link to="/e-warranty" className="text-sm text-[#007185] hover:text-[#c45500] hover:underline mt-4">Learn more</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
