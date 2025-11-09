/* ProductDetail.jsx – */
import React, { useState, useEffect, useRef } from "react";
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
  ZoomIn,
  Heart,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const galleryRef = useRef(null);

  /* ---------- Fetch ---------- */
  useEffect(() => {
    fetchProductById(id)
      .then(setProduct)
      .catch((err) => setError(err.message || "Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  /* ---------- Image Nav ---------- */
  const nextImage = () => setImgIndex((i) => (i + 1) % product.images.length);
  const prevImage = () =>
    setImgIndex((i) => (i - 1 + product.images.length) % product.images.length);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 via-white to-emerald-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50"
        >
          <Loader2 className="h-16 w-16 animate-spin text-lime-600 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-800 animate-pulse">
            Loading masterpiece...
          </p>
        </motion.div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 p-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-red-100 max-w-md w-full text-center"
        >
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-5" />
          <h3 className="text-2xl font-bold text-red-700 mb-2">Oops!</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-gray-100 text-center max-w-md"
        >
          <Package className="h-20 w-20 text-gray-400 mx-auto mb-5" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Not Found</h3>
          <Link
            to="/shop"
            className="text-lime-600 hover:text-lime-700 font-bold flex items-center justify-center gap-2 mt-4"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Shop
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ---------- Contact Modal ---------- */
  const ContactModal = () => (
    <AnimatePresence>
      {showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          onClick={() => setShowContactModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-lime-500 to-emerald-600 p-6 text-white">
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-5 right-5 p-2.5 rounded-full bg-white/20 hover:bg-white/30 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-2xl font-black">Let’s Get You This!</h3>
              <p className="text-sm opacity-90 mt-1">
                Offline purchase — we’ll guide you
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gradient-to-r from-lime-50 to-emerald-50 border border-lime-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-lime-600 rounded-xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {product.name}
                  </p>
                  <p className="text-2xl font-black text-lime-700">
                    ₹{Number(product.price).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 text-sm">
                    Offline Only
                  </p>
                  <p className="text-xs text-amber-700">
                    Sold via authorized stores for authenticity
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ContactRow
                  icon={<Phone />}
                  title="Call"
                  href="tel:+919654131435"
                  value="+91 96541 31435"
                />
                <ContactRow
                  icon={<Mail />}
                  title="Email"
                  href="mailto:Anritvox@gmail.com"
                  value="Anritvox@gmail.com"
                />
                <ContactRow
                  icon={<MapPin />}
                  title="Visit"
                  value="New Delhi, India"
                />
              </div>

              <p className="text-xs text-gray-500 flex items-center gap-1.5 pt-3 border-t">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Mention product name for instant help
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const ContactRow = ({ icon, title, href, value }) => (
    <a
      href={href || "#"}
      className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="font-bold text-gray-900">{value}</p>
      </div>
    </a>
  );

  /* ---------- Interactive Gallery ---------- */
  const Gallery = () => {
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
      if (touchStart - touchEnd > 50) nextImage();
      if (touchStart - touchEnd < -50) prevImage();
    };

    return product.images?.length ? (
      <div className="space-y-4">
        {/* Desktop */}
        <div className="hidden md:block">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl cursor-zoom-in group"
            onClick={() => setIsZoomed(true)}
          >
            <img
              src={product.images[imgIndex]}
              alt={`${product.name} - ${imgIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          </motion.div>

          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-500 pb-2">
              {product.images.map((src, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setImgIndex(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${
                    i === imgIndex
                      ? "border-emerald-500 ring-4 ring-emerald-200 shadow-xl"
                      : "border-gray-300 hover:border-emerald-400"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Carousel */}
        <div
          className="md:hidden relative rounded-3xl overflow-hidden shadow-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${imgIndex * 100}%)` }}
          >
            {product.images.map((src, i) => (
              <div key={i} className="w-full flex-shrink-0 aspect-square">
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover"
                  onClick={() => setIsZoomed(true)}
                />
              </div>
            ))}
          </div>

          {/* Mobile Nav */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-xl hover:scale-110 transition"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-full shadow-xl hover:scale-110 transition"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>
            </>
          )}

          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur">
            {imgIndex + 1} / {product.images.length}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === imgIndex ? "w-10 bg-white shadow-lg" : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="aspect-square rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-400 flex flex-col items-center justify-center space-y-3">
        <ImageIcon className="h-20 w-20 text-gray-400" />
        <p className="font-bold text-gray-600">No images</p>
      </div>
    );
  };

  /* ---------- Lightbox Zoom ---------- */
  const Lightbox = () =>
    isZoomed && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={() => setIsZoomed(false)}
      >
        <motion.img
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          src={product.images[imgIndex]}
          alt=""
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
        />
        <button
          onClick={() => setIsZoomed(false)}
          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </motion.div>
    );

  /* ---------- Sticky Price Bar (Mobile) ---------- */
  const StickyBar = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 p-4 shadow-2xl z-40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-black text-emerald-600">
            ₹{Number(product.price).toFixed(2)}
          </p>
          <p className="text-xs text-gray-600">In Stock</p>
        </div>
        <button
          onClick={() => setShowContactModal(true)}
          className="bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
        >
          <ShoppingCart className="h-5 w-5" />
          Buy Now
        </button>
      </div>
    </div>
  );

  /* ---------- Main Render ---------- */
  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-br from-lime-50 via-white to-emerald-50 min-h-screen font-inter text-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Back + Actions */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/shop"
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-sm group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition" />
              Back
            </Link>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="p-3 rounded-full bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-all hover:scale-110"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                  } transition`}
                />
              </button>
              {/* <button className="p-3 rounded-full bg-white/80 backdrop-blur shadow-lg hover:shadow-xl transition-all hover:scale-110">
                <Share2 className="h-5 w-5 text-gray-600" />
              </button> */}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 pb-24 md:pb-8">
            {/* Gallery */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Gallery />
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Hero Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-5xl font-black text-emerald-600">
                    ₹{Number(product.price).toFixed(2)}
                  </span>
                  <span className="px-5 py-2.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> In Stock
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="h-6 w-6 text-emerald-600" /> About This
                  Product
                </h2>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {product.description || "No description available."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowContactModal(true)}
                  className="relative overflow-hidden bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-bold py-5 px-8 rounded-full shadow-2xl flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>Contact to Buy</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`/ewarranty?product_id=${product.id}`}
                  className="bg-white border-4 border-emerald-600 text-emerald-700 font-bold py-5 px-8 rounded-full shadow-2xl flex items-center justify-center gap-3 hover:bg-emerald-50 transition"
                >
                  <Shield className="h-6 w-6" />
                  Register Warranty
                </motion.a>
              </div>

              {/* Offline Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-r from-amber-50 to-orange-50 p-7 rounded-3xl shadow-xl border border-amber-200"
              >
                <div className="flex gap-5">
                  <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Store Exclusive
                    </h3>
                    <p className="text-sm text-gray-700">
                      Available only at authorized outlets. Contact us for
                      nearest location.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Warranty Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 p-7 rounded-3xl shadow-xl border border-emerald-200"
              >
                <div className="flex gap-5">
                  <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Warranty Ready
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Register in 30 seconds for full coverage.
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {[
                        "Instant Confirmation",
                        "Priority Support",
                        "Genuine Parts",
                      ].map((t, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Mobile Bar */}
        <StickyBar />
      </motion.main>

      <ContactModal />
      <Lightbox />

      {/* Global Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
        .font-inter {
          font-family: "Inter", sans-serif;
        }

        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </>
  );
}
