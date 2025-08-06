// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { fetchProductById } from "../services/api";

// export default function ProductDetail() {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchProductById(id)
//       .then((data) => setProduct(data))
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 font-inter antialiased">
//         <p className="text-xl animate-pulse">Loading product details…</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white text-red-600 font-inter antialiased">
//         <p className="text-xl">Error: {error}</p>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white text-gray-600 font-inter antialiased">
//         <p className="text-xl">Product not found.</p>
//       </div>
//     );
//   }
//   //

//   return (
//     // Main container with white background and dark text
//     <div className="min-h-screen bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-inter antialiased">
//       <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
//         {/* Back to Shop Link */}
//         <Link
//           to="/shop"
//           className="inline-flex items-center text-lime-700 hover:text-lime-800 transition-colors duration-300 font-medium mb-6"
//         >
//           <svg
//             className="w-4 h-4 mr-2"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M10 19l-7-7m0 0l7-7m-7 7h18"
//             ></path>
//           </svg>
//           Back to Shop
//         </Link>

//         <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
//           {product.name}
//         </h1>
//         <p className="text-3xl font-bold text-lime-700 mb-6">
//           ₹{Number(product.price).toFixed(2)}
//         </p>

//         {/* Image Gallery */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//           {product.images && product.images.length > 0 ? (
//             product.images.map((src, idx) => (
//               <div
//                 key={idx}
//                 className="relative overflow-hidden rounded-lg shadow-md border border-gray-200"
//               >
//                 <img
//                   src={src}
//                   alt={`${product.name} ${idx + 1}`}
//                   className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src =
//                       "https://placehold.co/600x400/E0E0E0/888888?text=Image+Not+Found";
//                   }}
//                 />
//               </div>
//             ))
//           ) : (
//             <div className="col-span-full text-center text-gray-600 p-4 border border-dashed border-gray-300 rounded-lg">
//               No images available for this product.
//             </div>
//           )}
//         </div>

//         <h2 className="text-2xl font-bold text-gray-900 mb-3">Description</h2>
//         <p className="text-gray-700 leading-relaxed mb-8">
//           {product.description}
//         </p>

//         {/* Register Warranty Button */}
//         <Link
//           to={`/ewarranty?product_id=${product.id}`}
//           className="inline-block bg-lime-700 hover:bg-lime-800 text-white font-semibold py-3 px-8 rounded-full shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out"
//         >
//           Register Warranty
//         </Link>
//       </div>
//       {/* Tailwind CSS custom font import (if not already global) */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

//         .font-inter {
//           font-family: 'Inter', sans-serif;
//         }
//       `}</style>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../services/api";
import {
  ArrowLeft,
  Tag,
  Shield,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Package,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductById(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
          <Loader2 className="h-12 w-12 text-lime-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-2xl border border-red-200 shadow-lg max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-red-800 mb-4">
            Error: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-md">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-600">
            Product not found
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-5xl mx-auto">
        {/* Back to Shop Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-lime-600 hover:text-lime-700 transition-colors duration-200 font-medium mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Shop
        </Link>

        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Product Header */}
          <div className="bg-gradient-to-r from-lime-50 to-green-50 p-8 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-lime-600" />
                  <span className="text-sm text-gray-600">
                    Product ID: {product.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                ₹{Number(product.price).toFixed(2)}
              </span>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Available
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Image Gallery */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-lime-600" />
                Product Images
              </h2>

              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.images.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative group overflow-hidden rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <img
                        src={src}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/600x400/E0E0E0/888888?text=Image+Not+Found";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-md text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Image {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    No images available for this product
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Product Description
              </h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Register Warranty Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={`/ewarranty?product_id=${product.id}`}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-lime-700 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <Shield className="h-5 w-5 relative z-10" />
                <span className="relative z-10">Register Warranty</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 text-sm">
            Have questions about this product? Contact our support team for
            assistance with warranty registration, product information, or any
            other inquiries.
          </p>
        </div>
      </div>

      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
