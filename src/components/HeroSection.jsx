import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Globe, ArrowRight, Play, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    title: "Premium Sound, No Compromises",
    subtitle: "Experience Audio Excellence",
    description: "Upgrade your vehicle with studio-grade amplifiers and basstubes designed for the audiophile in you.",
    image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2070",
    cta: "Shop Audio",
    link: "/shop?category=Audio",
    accent: "emerald"
  },
  {
    title: "Smart Driving, Connected Future",
    subtitle: "Next-Gen Android Players",
    description: "Seamless integration with Carplay and Android Auto. High-definition displays for your dashboard.",
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=2066",
    cta: "Explore Players",
    link: "/shop?category=Android%20Players",
    accent: "blue"
  },
  {
    title: "Illuminate Your Journey",
    subtitle: "High-Intensity LED Systems",
    description: "Safety meets style with our advanced LED headlight kits. Precision engineered for maximum visibility.",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=2066",
    cta: "View Lights",
    link: "/shop?category=Lights",
    accent: "purple"
  }
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-slate-950 group">
      {/* Background Slides */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-all duration-1000 ease-out transform ${
            idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 animate-fade-in`}>
            <Zap size={14} />
            {slides[current].subtitle}
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white leading-tight mb-6 tracking-tighter">
            {slides[current].title.split(',').map((part, i) => (
              <span key={i} className="block last:text-transparent last:bg-clip-text last:bg-gradient-to-r last:from-emerald-400 last:to-cyan-400">
                {part}
              </span>
            ))}
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-xl leading-relaxed font-medium">
            {slides[current].description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to={slides[current].link}
              className="px-8 py-4 bg-emerald-500 hover:bg-white text-black font-black uppercase tracking-wider rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <ShoppingBag size={20} />
              {slides[current].cta}
            </Link>
            <button className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 backdrop-blur-md border border-slate-800 text-white font-black uppercase tracking-wider rounded-2xl transition-all duration-300 flex items-center gap-3">
              <Play size={20} className="fill-current" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-12 z-30 flex items-center gap-6">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                i === current ? 'w-12 bg-emerald-500' : 'w-3 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl text-white hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all duration-300"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl text-white hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all duration-300"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Floating Badges */}
      <div className="absolute bottom-0 left-0 w-full z-20 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-xl py-6 hidden lg:block">
        <div className="container mx-auto px-6 flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-500" />
            2-Year Premium Warranty
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-3">
            <Globe size={18} className="text-emerald-500" />
            PAN India Installation Support
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-emerald-500" />
            Next-Day Dispatch Guaranteed
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-3 group/link">
            Learn More About Our Quality
            <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
