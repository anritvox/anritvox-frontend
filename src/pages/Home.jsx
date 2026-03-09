import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import heroImage1 from "../assets/images/Home1.webp";
import heroImage2 from "../assets/images/Home2.webp";
import heroImage3 from "../assets/images/Home3.webp";
import heroImage4 from "../assets/images/Home4.webp";
import heroImage5 from "../assets/images/Home5.webp";
import heroImage6 from "../assets/images/Home6.webp";
import heroImage7 from "../assets/images/Home7.webp";
import heroImage8 from "../assets/images/Home8.webp";

const heroImages = [
  heroImage1,
  heroImage2,
  heroImage3,
  heroImage4,
  heroImage5,
  heroImage6,
  heroImage7,
  heroImage8,
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImages[currentImageIndex]}
            alt="Hero"
            className="w-full h-full object-cover opacity-60 transition-opacity duration-1000 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Experience Audio <br />
              <span className="text-lime-500">Like Never Before</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Premium high-fidelity audio gear and advanced car electronics 
              engineered for performance. Backed by our seamless digital warranty.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="px-8 py-4 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-xl shadow-lime-900/20"
              >
                Explore Catalog
              </Link>
              <Link
                to="/ewarranty"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg backdrop-blur-sm border border-white/20 transition-all"
              >
                Register Warranty
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center text-lime-700">
                <ShoppingBagIcon />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Wide Selection</h3>
                <p className="text-sm text-slate-500">Curated premium audio gear</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center text-lime-700">
                <CertificateIcon />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Easy E-Warranty</h3>
                <p className="text-sm text-slate-500">Paperless digital registration</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center text-lime-700">
                <SupportIcon />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Premium Support</h3>
                <p className="text-sm text-slate-500">Expert help across India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Car Electronics Spotlight */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 p-12 lg:p-20">
              <span className="text-lime-500 font-bold tracking-widest uppercase text-sm mb-4 block">New Arrival</span>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Car Electronics Evolution</h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Transform your drive with our cutting-edge infotainment systems and 
                advanced audio solutions. Innovation that keeps you connected and in control.
              </p>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircleIcon /> Smart Infotainment Integration
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircleIcon /> Hi-Res Audio Performance
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircleIcon /> Seamless Control Systems
                </li>
              </ul>
              <Link
                to="/shop"
                className="inline-block px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-slate-900 transition-all"
              >
                View Collections
              </Link>
            </div>
            <div className="md:w-1/2 h-[400px] md:h-full relative overflow-hidden">
               <img 
                 src={heroImage8} 
                 alt="Car Electronics" 
                 className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
               />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Minimal Icons
function ShoppingBagIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lime-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}
