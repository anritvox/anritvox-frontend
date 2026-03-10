import React, { useState, useEffect } from \"react\";
import { Link } from \"react-router-dom\";
import { fetchProducts } from \"../services/api\";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Truck,
  Zap,
  ShoppingBag,
  Award,
  Globe,
  Clock,
  ChevronUp,
  CreditCard,
  Settings,
  Flame,
  Search,
  CheckCircle2,
  Cpu,
  Smartphone,
  Sparkles,
  MousePointer2
} from \"lucide-react\";
import { motion, AnimatePresence } from \"framer-motion\";

// Import hero images
import heroImage1 from \"../assets/images/Home1.webp\";
import heroImage2 from \"../assets/images/Home2.webp\";
import heroImage3 from \"../assets/images/Home3.webp\";
import heroImage4 from \"../assets/images/Home4.webp\";

const heroImages = [heroImage1, heroImage2, heroImage3, heroImage4];

const categories = [
  { name: \"Android Stereo\", icon: <Cpu size={24} />, path: \"/shop?category=stereo\", color: \"from-blue-600 to-indigo-600\" },
  { name: \"LED Lighting\", icon: <Zap size={24} />, path: \"/shop?category=lighting\", color: \"from-amber-400 to-orange-600\" },
  { name: \"Interior\", icon: <ShoppingBag size={24} />, path: \"/shop?category=Interior\", color: \"from-emerald-500 to-teal-700\" },
  { name: \"Exterior\", icon: <Globe size={24} />, path: \"/shop?category=Exterior\", color: \"from-sky-400 to-blue-600\" },
  { name: \"Dash Cams\", icon: <ShieldCheck size={24} />, path: \"/shop?category=dashcam\", color: \"from-rose-500 to-red-700\" },
  { name: \"Accessories\", icon: <Smartphone size={24} />, path: \"/shop?category=Accessories\", color: \"from-violet-500 to-purple-700\" },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState(\"featured\");

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
    }, 8000);

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener(\"scroll\", handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener(\"scroll\", handleScroll);
    };
  }, []);

  const nextHero = () => setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  const prevHero = () => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: \"smooth\" });
  };

  return (
    <div className=\"bg-gray-50 min-h-screen font-sans pb-20 selection:bg-blue-100 selection:text-blue-900\">
      {/* Premium Glassmorphism Navbar Placeholder Logic would go here, using sticky container */}
      
      {/* Interactive Category Navigation - Luxury Aesthetic */}
      <div className=\"bg-white border-b border-gray-100 sticky top-16 z-40 overflow-hidden shadow-sm\">
        <div className=\"max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between overflow-x-auto no-scrollbar\">
          <div className=\"flex items-center gap-8\">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.path}
                className=\"flex items-center gap-2 group cursor-pointer whitespace-nowrap py-2 relative\"
              >
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cat.color} text-white shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-all duration-300`}>
                  {React.cloneElement(cat.icon, { size: 18 })}
                </div>
                <span className=\"text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors\">
                  {cat.name}
                </span>
                <span className=\"absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full\" />
              </Link>
            ))}
          </div>
          <div className=\"hidden lg:flex items-center gap-4 border-l pl-8\">
            <div className=\"flex items-center gap-2 text-rose-500 font-bold text-sm animate-pulse\">
              <Flame size={18} />
              <span>LIVE OFFERS</span>
            </div>
          </div>
        </div>
      </div>

      <div className=\"max-w-[1600px] mx-auto\">
        {/* Cinematic Hero Section */}
        <div className=\"relative h-[650px] md:h-[750px] overflow-hidden group bg-black\">
          <AnimatePresence mode=\"wait\">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: \"easeOut\" }}
              className=\"absolute inset-0\"
            >
              <div className=\"absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10\" />
              <div className=\"absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent z-10 opacity-90\" />
              <img
                src={heroImages[currentIndex]}
                className=\"w-full h-full object-cover\"
                alt=\"Premium Car Tech\"
              />
              
              <div className=\"absolute top-1/2 left-8 md:left-24 -translate-y-1/2 z-20 max-w-3xl\">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <div className=\"flex items-center gap-2 mb-6\">
                    <span className=\"w-12 h-[2px] bg-blue-500 rounded-full\" />
                    <span className=\"text-blue-400 font-black tracking-[0.3em] text-xs uppercase\">The Future of Car Tech</span>
                  </div>
                  
                  <h1 className=\"text-5xl md:text-8xl font-black text-white leading-tight mb-6 tracking-tight\">
                    ELEVATE YOUR <br />
                    <span className=\"text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300\">DRIVING EXPERIENCE</span>
                  </h1>
                  
                  <p className=\"text-xl text-gray-300 mb-10 max-w-xl leading-relaxed font-light\">
                    Experience premium Android infotainment and precision lighting engineered specifically for Indian road conditions.
                  </p>
                  
                  <div className=\"flex flex-wrap gap-5\">
                    <Link
                      to=\"/shop\"
                      className=\"group relative bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold transition-all overflow-hidden shadow-[0_0_30px_rgba(37,99,235,0.4)]\"
                    >
                      <span className=\"relative z-10 flex items-center gap-2\">
                        Explore Collections <ArrowRight size={20} className=\"group-hover:translate-x-1 transition-transform\" />
                      </span>
                    </Link>
                    <Link
                      to=\"/ewarranty\"
                      className=\"bg-white/10 backdrop-blur-xl border border-white/20 text-white px-10 py-4 rounded-full font-bold hover:bg-white/20 transition-all flex items-center gap-2\"
                    >
                      <ShieldCheck size={20} className=\"text-blue-400\" /> E-Warranty
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Precision Controls */}
          <div className=\"absolute bottom-12 right-12 z-30 flex items-center gap-4\">
            <div className=\"flex gap-2 mr-6\">
              {heroImages.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? \"w-10 bg-blue-500\" : \"w-2 bg-white/30\"}`} 
                />
              ))}
            </div>
            <button onClick={prevHero} className=\"p-4 border border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all active:scale-90\">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextHero} className=\"p-4 border border-white/20 bg-white/5 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all active:scale-90\">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Feature Highlights - 3D Card Style */}
        <div className=\"px-6 -mt-24 relative z-30 grid grid-cols-1 md:grid-cols-3 gap-8\">
          {[
            { 
              title: \"Android Infotainment\", 
              desc: \"Ultra HD screens with Wireless CarPlay & Octa-core speed.\", 
              icon: <Smartphone size={32} className=\"text-blue-500\" />,
              tag: \"Best Seller\"
            },
            { 
              title: \"Precision LED Pro\", 
              desc: \"Night-piercing illumination with 2-year warranty coverage.\", 
              icon: <Sparkles size={32} className=\"text-amber-500\" />,
              tag: \"Trending\"
            },
            { 
              title: \"Intelligent Dash Cams\", 
              desc: \"4K loop recording with Sony IMX sensors for evidence-grade video.\", 
              icon: <ShieldCheck size={32} className=\"text-emerald-500\" />,
              tag: \"New Arrival\"
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className=\"bg-white/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 group\"
            >
              <div className=\"flex justify-between items-start mb-6\">
                <div className=\"p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors\">{item.icon}</div>
                <span className=\"px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full\">{item.tag}</span>
              </div>
              <h3 className=\"text-2xl font-black text-gray-900 mb-3\">{item.title}</h3>
              <p className=\"text-gray-500 leading-relaxed mb-6\">{item.desc}</p>
              <Link to=\"/shop\" className=\"flex items-center gap-2 text-blue-600 font-bold group/link\">
                View Series <ArrowRight size={18} className=\"group-hover/link:translate-x-1 transition-transform\" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Product Showcase */}
        <div className=\"mt-24 px-6\">
          <div className=\"flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6\">
            <div>
              <div className=\"flex items-center gap-2 text-blue-600 font-bold mb-2 tracking-widest uppercase text-xs\">
                <CheckCircle2 size={16} /> Verified Performance
              </div>
              <h2 className=\"text-4xl md:text-5xl font-black text-gray-900\">Curated Collection</h2>
            </div>
            
            <div className=\"flex bg-white p-1.5 rounded-2xl shadow-inner border border-gray-100\">
              {[
                { label: \"Featured\", id: \"featured\" },
                { label: \"Newest\", id: \"new\" },
                { label: \"Best Value\", id: \"value\" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? \"bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105\" : \"text-gray-500 hover:text-gray-800\"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8\">
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className=\"h-[450px] bg-white rounded-3xl animate-pulse border border-gray-100\" />
              ))
            ) : (
              products.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  to={'/shop/' + product.id}
                  className=\"group bg-white rounded-3xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col\"
                >
                  <div className=\"relative aspect-square mb-6 overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center p-8\">
                    <img
                      src={product.image || \"https://via.placeholder.com/300\"}
                      className=\"w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply\"
                      alt={product.name}
                    />
                    <div className=\"absolute top-4 right-4\">
                      <div className=\"bg-white/90 backdrop-blur p-2.5 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm\">
                        <Star size={20} />
                      </div>
                    </div>
                  </div>
                  <div className=\"px-2 flex-grow\">
                    <div className=\"flex items-center gap-1 mb-2\">
                      <div className=\"flex text-amber-400\"><Star size={14} fill=\"currentColor\" /><Star size={14} fill=\"currentColor\" /><Star size={14} fill=\"currentColor\" /><Star size={14} fill=\"currentColor\" /><Star size={14} fill=\"currentColor\" /></div>
                      <span className=\"text-[10px] text-gray-400 font-bold ml-1\">(240+)</span>
                    </div>
                    <h3 className=\"font-bold text-gray-900 text-lg line-clamp-2 mb-3 leading-snug group-hover:text-blue-600 transition-colors\">
                      {product.name}
                    </h3>
                    <div className=\"flex items-center justify-between mt-auto\">
                      <div>
                        <span className=\"text-2xl font-black text-gray-900\">₹{product.price.toLocaleString()}</span>
                        <div className=\"flex items-center gap-2\">
                          <span className=\"text-gray-400 text-sm line-through\">₹{(product.price * 1.3).toFixed(0)}</span>
                          <span className=\"text-emerald-500 text-xs font-black\">30% OFF</span>
                        </div>
                      </div>
                      <button className=\"p-3 bg-gray-900 text-white rounded-2xl group-hover:bg-blue-600 transition-colors shadow-xl\">
                        <ShoppingBag size={20} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          <div className=\"mt-16 text-center\">
            <Link 
              to=\"/shop\" 
              className=\"inline-flex items-center gap-3 px-12 py-5 bg-white border-2 border-gray-100 rounded-full font-black text-gray-900 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm\"
            >
              BROWSE ALL PRODUCTS <MousePointer2 size={20} className=\"text-blue-600\" />
            </Link>
          </div>
        </div>

        {/* Immersive Elite Promo */}
        <div className=\"mt-32 mx-6\">
          <div className=\"rounded-[40px] overflow-hidden bg-gray-950 relative\">
            <div className=\"absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent z-10\" />
            <div className=\"absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-blue-600/10 blur-[120px] rounded-full\" />
            
            <div className=\"flex flex-col lg:flex-row items-center relative z-20\">
              <div className=\"p-12 md:p-24 lg:w-3/5\">
                <span className=\"inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase mb-8\">
                  Premium Exclusive
                </span>
                <h2 className=\"text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-8\">
                  THE <span className=\"text-blue-500\">ELITE</span> SERIES
                </h2>
                <p className=\"text-gray-400 text-xl max-w-xl leading-relaxed mb-12\">
                  Engineered with military-grade components and the latest Android 14 architecture. Elevate your cockpit with wireless seamlessness.
                </p>
                <div className=\"grid grid-cols-2 md:grid-cols-3 gap-8 mb-12 border-t border-white/10 pt-12\">
                  {[
                    { label: \"Memory\", val: \"8GB RAM\" },
                    { label: \"Display\", val: \"4K QLED\" },
                    { label: \"Sound\", val: \"DSP 32EQ\" }
                  ].map((spec, i) => (
                    <div key={i}>
                      <p className=\"text-gray-500 text-xs uppercase font-bold tracking-widest mb-1\">{spec.label}</p>
                      <p className=\"text-white font-black text-lg\">{spec.val}</p>
                    </div>
                  ))}
                </div>
                <Link to=\"/shop\" className=\"inline-block bg-white text-black px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105\">
                  Unlock the technology
                </Link>
              </div>
              
              <div className=\"lg:w-2/5 p-12 flex justify-center\">
                <motion.div 
                  initial={{ rotate: 10, y: 50 }}
                  whileInView={{ rotate: -5, y: 0 }}
                  transition={{ duration: 1 }}
                  className=\"relative\"
                >
                  <div className=\"absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full\" />
                  <img 
                    src={heroImage2} 
                    alt=\"Promo Infotainment\" 
                    className=\"max-h-[400px] drop-shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative z-10\" 
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Standards Banner */}
        <div className=\"mt-32 border-y border-gray-100 py-16 bg-white\">
          <div className=\"px-6 grid grid-cols-2 lg:grid-cols-4 gap-12\">
            {[
              { icon: <Award className=\"text-blue-600\" />, title: \"ISO Certified\", desc: \"Global quality standards\" },
              { icon: <Truck className=\"text-blue-600\" />, title: \"Express Shipping\", desc: \"PAN India delivery\" },
              { icon: <CheckCircle2 className=\"text-blue-600\" />, title: \"Tested for India\", desc: \"High heat endurance\" },
              { icon: <Headphones className=\"text-blue-600\" />, title: \"24/7 Concierge\", desc: \"Priority WhatsApp support\" }
            ].map((feature, i) => (
              <div key={i} className=\"flex flex-col items-center text-center\">
                <div className=\"mb-6 p-4 bg-blue-50 rounded-3xl\">{feature.icon}</div>
                <h4 className=\"font-black text-gray-900 mb-2\">{feature.title}</h4>
                <p className=\"text-gray-500 text-sm\">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Slim Back to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className=\"fixed bottom-10 right-10 z-50 bg-gray-900 hover:bg-blue-600 text-white p-5 rounded-3xl shadow-2xl transition-all active:scale-95 group\"
        >
          <ChevronUp size={24} className=\"group-hover:-translate-y-1 transition-transform\" />
        </button>
      )}

      {/* Clean Aesthetic Footer Disclaimer */}
      <footer className=\"mt-32 border-t border-gray-100 pt-20 pb-10 px-6 text-center\">
        <div className=\"flex items-center justify-center gap-2 mb-8\">
          <div className=\"w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black\">A</div>
          <span className=\"text-2xl font-black tracking-tighter text-gray-900\">ANRITVOX</span>
        </div>
        <p className=\"text-gray-400 text-sm max-w-md mx-auto leading-relaxed\">
          Redefining automotive electronics through innovation and reliability. The premier choice for Indian automotive enthusiasts.
        </p>
        <div className=\"mt-12 flex justify-center gap-8 text-xs font-bold text-gray-400\">
          <span className=\"hover:text-blue-600 cursor-pointer transition-colors\">PRIVACY</span>
          <span className=\"hover:text-blue-600 cursor-pointer transition-colors\">TERMS</span>
          <span className=\"hover:text-blue-600 cursor-pointer transition-colors\">SUPPORT</span>
        </div>
        <p className=\"mt-12 text-gray-300 text-[10px] uppercase tracking-widest font-black\">
          © 2026 ANRITVOX GLOBAL. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
