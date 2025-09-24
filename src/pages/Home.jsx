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
  const [activeFeature, setActiveFeature] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Effect to change hero image every 4 seconds (slower)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // Change image every 4000 milliseconds (4 seconds)

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Function to handle feature card clicks
  const handleFeatureClick = (feature) => {
    setActiveFeature(activeFeature === feature ? null : feature); // Toggle feature details
  };

  // Icon components (using inline SVG for simplicity and direct styling)
  const ShoppingBagIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      ></path>
    </svg>
  );

  const CertificateIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002 12c0 2.83 1.555 5.317 3.819 6.792A12.001 12.001 0 0012 22c2.83 0 5.317-1.555 6.792-3.819A12.001 12.001 0 0022 12c0-4.97-3.99-9-9-9z"
      ></path>
    </svg>
  );

  const SupportIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18.364 5.636l-3.536 3.536m0 0A9.953 9.953 0 0112 5c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8c0-1.782-.584-3.424-1.586-4.757m-3.536-3.536A9.953 9.953 0 0119 12c0 4.418-3.582 8-8 8s8-3.582 8-8c0-1.782-.584-3.424-1.586-4.757M12 12h.01"
      ></path>
    </svg>
  );

  return (
    // Main container with white background and Inter font
    <div className="min-h-screen bg-white text-gray-900 font-inter antialiased overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col-reverse lg:flex-row items-center justify-between flex-grow max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)]">
        {/* Background gradient circles for visual flair */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Adjusted colors and opacity for a white background */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Text Block */}
        <div className="relative z-10 mt-8 lg:mt-0 lg:w-1/2 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight animate-fade-in-up">
            Experience Product Like {/* Accent color remains olive green */}
            <span className="text-lime-700">Never Before</span>
          </h1>
          <p className="mt-4 text-gray-700 text-base sm:text-lg md:text-xl animate-fade-in-up animation-delay-500">
            Welcome to Anritvox—your destination for high-fidelity audio gear
            backed by seamless warranty service. Dive into our catalog of
            headphones, speakers, and more.
          </p>
          <div className="mt-6 animate-fade-in-up animation-delay-1000">
            <Link
              to="/shop"
              // Button colors in olive green, text dark for contrast
              className="inline-block bg-lime-700 hover:bg-lime-800 text-white font-bold py-3 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Image Block with Carousel functionality */}
        <div className="relative z-10 lg:w-1/2 flex justify-center lg:justify-end mt-8 lg:mt-0 animate-fade-in-up animation-delay-1500">
          <img
            src={heroImages[currentImageIndex]}
            alt="High quality audio gear"
            key={heroImages[currentImageIndex]}
            // Border color adjusted for white background
            className="w-full max-w-md object-cover rounded-2xl shadow-2xl border border-gray-300 transition-opacity duration-1000 ease-in-out animate-image-fade-in-slow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x400/CCCCCC/666666?text=Image+Not+Found"; // Placeholder for white background
            }}
          />
        </div>
      </section>

      {/* Optional Features Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50 relative z-10">
        {" "}
        {/* Light gray section background */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          Our <span className="text-lime-700">Commitment</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Feature Card 1 */}
          <div
            // Card background and hover border colors adjusted for white theme
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-lime-600 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            onClick={() => handleFeatureClick("selection")}
          >
            <div
              // Icon background in olive green, text white
              className="flex items-center justify-center w-16 h-16 bg-lime-700 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
            >
              <ShoppingBagIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Wide Selection
            </h3>
            <p className="text-gray-700 text-center">
              Browse a diverse catalog of premium products.
            </p>
            {activeFeature === "selection" && (
              <div className="mt-4 text-sm text-gray-700 transition-all duration-500 ease-in-out opacity-100 max-h-40 overflow-hidden">
                <p className="mt-2">
                  Details: From headphones to home theater systems, find your
                  perfect sound & product.
                </p>
              </div>
            )}
          </div>

          {/* Feature Card 2 */}
          <div
            // Card background and hover border colors adjusted for white theme
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-lime-600 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            onClick={() => handleFeatureClick("warranty")}
          >
            <div
              // Icon background in olive green, text white
              className="flex items-center justify-center w-16 h-16 bg-lime-700 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
            >
              <CertificateIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Easy Warranty
            </h3>
            <p className="text-gray-700 text-center">
              Register your product warranty in just a few clicks.
            </p>
            {activeFeature === "warranty" && (
              <div className="mt-4 text-sm text-gray-700 transition-all duration-500 ease-in-out opacity-100 max-h-40 overflow-hidden">
                <p className="mt-2">
                  Details: Hassle-free registration and claim process for peace
                  of mind.
                </p>
              </div>
            )}
          </div>

          {/* Feature Card 3 */}
          <div
            // Card background and hover border colors adjusted for white theme
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:border-lime-600 transform hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
            onClick={() => handleFeatureClick("support")}
          >
            <div
              // Icon background in olive green, text white
              className="flex items-center justify-center w-16 h-16 bg-lime-700 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform duration-300"
            >
              <SupportIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Premium Support
            </h3>
            <p className="text-gray-700 text-center">
              Expert assistance available whenever you need it.
            </p>
            {activeFeature === "support" && (
              <div className="mt-4 text-sm text-gray-700 transition-all duration-500 ease-in-out opacity-100 max-h-40 overflow-hidden">
                <p className="mt-2">
                  Details: Our dedicated team is ready to help with any
                  technical or product queries.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tailwind CSS custom animations and font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeInFromBottom {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInFromBottom 0.8s ease-out forwards;
          opacity: 0; /* Ensures element is hidden before animation starts */
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.0, 0.99);
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes imageFadeInSlow {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-image-fade-in-slow {
          animation: imageFadeInSlow 1.5s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>
    </div>
  );
}
