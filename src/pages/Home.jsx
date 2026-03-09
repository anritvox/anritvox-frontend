import React, { useState, useEffect } from \"react\";
import { Link } from \"react-router-dom\";
import { fetchProducts } from \"../services/api\";
import { ChevronLeft, ChevronRight, Star, ArrowRight, ShieldCheck, Headphones, Truck } from \"lucide-react\";
import { motion, AnimatePresence } from \"framer-motion\";

// Import hero images
import heroImage1 from \"../assets/images/Home1.webp\";
import heroImage2 from \"../assets/images/Home2.webp\";
import heroImage3 from \"../assets/images/Home3.webp\";
import heroImage4 from \"../assets/images/Home4.webp\";

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(\"Failed to fetch products:\", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextHero = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  return (
    <div className=\"bg-white text-gray-900 font-sans\">
      {/* Hero Section */}
      <section className=\"relative h-[85vh] overflow-hidden bg-black\">
        <AnimatePresence mode=\"wait\">
          <motion.img
            key={currentIndex}
            src={heroImages[currentIndex]}
            alt=\"Hero\"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className=\"absolute inset-0 w-full h-full object-cover\"
          />
        </AnimatePresence>

        <div className=\"absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent\" />

        <div className=\"relative h-full flex flex-col justify-center items-center text-center px-6\">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className=\"text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-2xl\"
          >
            Evolution of <span className=\"text-[#7CFC00]\">Audio</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className=\"text-lg md:text-2xl text-gray-200 max-w-2xl mb-10\"
          >
            Premium car electronics and audio gear designed for the ultimate driving experience.
          </motion.p>
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className=\"flex gap-4\"
          >
            <Link to=\"/shop\" className=\"bg-[#7CFC00] hover:bg-[#6edc00] text-black px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl\">
              Shop Collection
            </Link>
            <Link to=\"/ewarranty\" className=\"bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all\">
              E-Warranty
            </Link>
          </motion.div>
        </div>

        {/* Carousel Nav */}
        <button onClick={prevHero} className=\"absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all\">
          <ChevronLeft size={32} />
        </button>
        <button onClick={nextHero} className=\"absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md text-white transition-all\">
          <ChevronRight size={32} />
        </button>
      </section>

      {/* Trust Badges */}
      <div className=\"bg-gray-50 py-10 border-b\">
        <div className=\"max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8\">
          <div className=\"flex items-center gap-4\">
            <ShieldCheck className=\"text-[#7CFC00]\" size={40} />
            <div>
              <h4 className=\"font-bold text-lg\">100% E-Warranty</h4>
              <p className=\"text-sm text-gray-500\">Paperless registration in seconds.</p>
            </div>
          </div>
          <div className=\"flex items-center gap-4\">
            <Truck className=\"text-[#7CFC00]\" size={40} />
            <div>
              <h4 className=\"font-bold text-lg\">Fast Shipping</h4>
              <p className=\"text-sm text-gray-500\">Delivering excellence across India.</p>
            </div>
          </div>
          <div className=\"flex items-center gap-4\">
            <Headphones className=\"text-[#7CFC00]\" size={40} />
            <div>
              <h4 className=\"font-bold text-lg\">Premium Support</h4>
              <p className=\"text-sm text-gray-500\">Dedicated help for your audio setup.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <section className=\"py-24 max-w-7xl mx-auto px-6\">
        <div className=\"flex justify-between items-end mb-12\">
          <div>
            <h2 className=\"text-4xl font-black uppercase tracking-tighter\">Top Rated Gear</h2>
            <div className=\"h-1.5 w-20 bg-[#7CFC00] mt-2 rounded-full\" />
          </div>
          <Link to=\"/shop\" className=\"text-gray-500 hover:text-black font-bold flex items-center gap-2 group\">
            View All <ArrowRight size={18} className=\"group-hover:translate-x-1 transition-transform\" />
          </Link>
        </div>

        {loading ? (
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-8\">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className=\"h-80 bg-gray-100 animate-pulse rounded-2xl\" />
            ))}
          </div>
        ) : (
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-8\">
            {products.slice(0, 4).map((product) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={product._id} 
                className=\"group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all\"
              >
                <div className=\"relative h-64 overflow-hidden bg-gray-50\">
                  <img 
                    src={product.images?.[0] || heroImage1} 
                    alt={product.name} 
                    className=\"w-full h-full object-contain group-hover:scale-110 transition-transform duration-500\"
                  />
                  <div className=\"absolute top-4 left-4 bg-black text-white px-3 py-1 rounded-full text-xs font-bold\">
                    NEW
                  </div>
                </div>
                <div className=\"p-6\">
                  <div className=\"flex items-center gap-1 text-yellow-400 mb-2\">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} fill=\"currentColor\" />)}
                  </div>
                  <h3 className=\"font-bold text-xl mb-2 line-clamp-1\">{product.name}</h3>
                  <p className=\"text-[#7CFC00] font-black text-2xl\">₹{product.price.toLocaleString()}</p>
                  <Link to={\`/shop/\${product._id}\`} className=\"mt-4 block w-full text-center py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors\">
                    Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Powerful Promo Banner */}
      <section className=\"max-w-7xl mx-auto px-6 mb-24\">
        <div className=\"relative rounded-3xl overflow-hidden bg-gray-900 h-[400px] flex items-center\">
          <img src={heroImage3} className=\"absolute inset-0 w-full h-full object-cover opacity-40\" alt=\"Banner\" />
          <div className=\"relative z-10 px-12\">
            <h2 className=\"text-4xl md:text-5xl font-black text-white mb-6 uppercase\">Experience <br/> The Future</h2>
            <p className=\"text-gray-300 text-lg max-w-md mb-8\">Upgrade your ride with the latest android car systems and high-fidelity speakers.</p>
            <Link to=\"/shop\" className=\"inline-flex items-center gap-3 bg-[#7CFC00] px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform\">
              Explore Collection <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
