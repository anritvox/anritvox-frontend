/* ProductDetail.jsx – improved readability and color contrast */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../services/api";
import {
  ArrowLeft,
  Shield,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Package,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  CheckCircle,
  X,
  Store,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  /* ---------- data ---------- */
  useEffect(() => {
    fetchProductById(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Navigation functions for mobile gallery
  const nextImage = () => {
    if (product.images?.length) {
      setImgIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images?.length) {
      setImgIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  /* ---------- skeleton ---------- */
  if (loading)
    return (
      <div className="min-h-screen grid place-content-center bg-white">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
          <Loader2 className="h-12 w-12 animate-spin text-lime-700" />
          <span className="text-lg font-medium text-gray-600">
            Loading product details...
          </span>
        </div>
      </div>
    );

  /* ---------- error ---------- */
  if (error)
    return (
      <div className="min-h-screen grid place-content-center bg-white px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center w-full max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-lime-700 hover:bg-lime-800 text-white rounded-lg transition font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  /* ---------- empty ---------- */
  if (!product)
    return (
      <div className="min-h-screen grid place-content-center bg-white px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center w-full max-w-md">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600 mb-4">
            Product not found
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-lime-700 hover:text-lime-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );

  /* ---------- sub-components ---------- */
  const ContactModal = () =>
    showContactModal && (
      <div className="fixed inset-0 z-50 grid place-content-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-lime-700 p-6 text-white relative">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <h3 className="text-xl font-bold text-white">
              Contact for Purchase
            </h3>
            <p className="text-white/90 text-sm mt-1">
              Get in touch to place your order
            </p>
          </div>

          <div className="p-6">
            {/* Product Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime-700 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    Price: ₹{Number(product.price).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Online Purchase Not Available
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    We currently sell through offline stores only. Contact us to
                    place your order.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Options */}
            <div className="space-y-3">
              <ContactRow
                icon={<Phone className="h-5 w-5 text-white" />}
                title="Call Us"
                href="tel:+919654131435"
                value="+91 9654131435"
              />
              <ContactRow
                icon={<Mail className="h-5 w-5 text-white" />}
                title="Email Us"
                href="mailto:Anritvox@gmail.com"
                value="Anritvox@gmail.com"
              />
              <ContactRow
                icon={<MapPin className="h-5 w-5 text-white" />}
                title="Visit Store"
                value="New Delhi, India"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Mention this product when contacting us</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const ContactRow = ({ icon, title, href, value }) => (
    <a
      href={href || "#"}
      className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-200 hover:border-lime-600 shadow-md hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-lime-700 rounded-full group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="font-semibold text-gray-900">{value}</p>
      </div>
    </a>
  );

  /* ---------- desktop gallery ---------- */
  const Gallery = () =>
    product.images?.length ? (
      <div className="w-full">
        {/* Desktop: Large image + thumbnails */}
        <div className="hidden md:block">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-gray-300 mb-4 bg-white">
            <img
              src={product.images[imgIndex]}
              alt={`${product.name} ${imgIndex + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              onError={(e) =>
                (e.target.src =
                  "https://placehold.co/600x600/f8f8f8/999999?text=Image+Not+Found")
              }
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    i === imgIndex
                      ? "border-lime-700 shadow-lg ring-2 ring-lime-200"
                      : "border-gray-300 hover:border-lime-500 hover:shadow-md"
                  }`}
                >
                  <img
                    src={src}
                    alt={`Thumb ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile: Swipeable with navigation buttons */}
        <div className="md:hidden">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-300 bg-white">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${imgIndex * 100}%)` }}
            >
              {product.images.map((src, i) => (
                <div key={i} className="w-full flex-shrink-0 aspect-square">
                  <img
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src =
                        "https://placehold.co/600x400/f8f8f8/999999?text=Image+Not+Found")
                    }
                  />
                </div>
              ))}
            </div>

            {/* Navigation arrows for mobile */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="h-5 w-5 text-gray-700" />
                </button>
              </>
            )}

            {/* Image counter */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {imgIndex + 1} / {product.images.length}
            </div>

            {/* Dots indicator */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      i === imgIndex
                        ? "w-8 bg-white shadow-lg"
                        : "w-2 bg-white/60 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    ) : (
      <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 grid place-content-center shadow-lg">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <span className="text-gray-500 text-sm">No images available</span>
        </div>
      </div>
    );

  /* ---------- render ---------- */
  return (
    <>
      <main className="bg-white min-h-screen font-inter text-gray-900 antialiased">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Link */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-lime-700 hover:text-lime-800 font-medium mb-8 group transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </Link>

          {/* Main Content - Desktop Layout */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Gallery */}
            <div>
              <Gallery />
            </div>

            {/* Product Details */}
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl lg:text-5xl font-black text-lime-700">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
                    ✓ Available
                  </span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Product Description
                </h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="inline-block bg-lime-700 hover:bg-lime-800 text-white font-bold py-4 px-8 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Contact for Purchase</span>
                </button>

                <Link
                  to={`/ewarranty?product_id=${product.id}`}
                  className="bg-white border-2 border-lime-700 text-lime-700 hover:bg-lime-50 hover:border-lime-800 font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center justify-center gap-2"
                >
                  <Shield className="h-5 w-5" />
                  <span>Register Warranty</span>
                </Link>
              </div>

              {/* Offline Notice */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:border-lime-600 transform hover:-translate-y-1 transition-all duration-300 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-lime-700 rounded-full flex-shrink-0">
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Offline Store Purchase
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Online purchasing is currently not available. We operate
                      through authorized offline stores to ensure the best
                      customer experience and product authenticity.
                    </p>
                    <p className="text-gray-700 text-sm font-medium">
                      📞 Connect with us through the contact details to place
                      your order and get detailed product information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warranty Notice */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:border-lime-600 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-lime-700 rounded-full flex-shrink-0">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Already Purchased This Product?
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      If you've purchased this product from our authorized
                      stores, register your warranty to enjoy complete
                      protection and priority support.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Quick registration process</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Instant confirmation via email</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ContactModal />

      {/* Enhanced styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        main { 
          animation: fadeIn 0.8s ease forwards; 
        }

        /* Custom scrollbar for thumbnails */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #84cc16;
          border-radius: 2px;
        }
      `}</style>
    </>
  );
}
