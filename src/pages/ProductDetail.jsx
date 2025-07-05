// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import { fetchProductById, BASE_URL } from "../services/api"; // Assuming these are defined in ../services/api

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

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-black text-white font-inter">
//         <p className="text-xl animate-pulse">Loading product…</p>
//       </div>
//     );
//   if (error)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-black text-white font-inter">
//         <p className="text-xl text-red-500">Error: {error}</p>
//       </div>
//     );
//   if (!product)
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 to-black text-white font-inter">
//         <p className="text-xl text-gray-400">Product not found.</p>
//       </div>
//     );

//   return (
//     // Main container with dark background and Inter font
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-white font-inter antialiased py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl mx-auto animate-fade-in">
//         <Link
//           to="/shop"
//           className="text-orange-400 hover:text-orange-500 transition-colors duration-300 text-sm font-medium flex items-center mb-6"
//         >
//           <svg
//             className="w-4 h-4 mr-1"
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

//         <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 space-y-8">
//           <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
//             {product.name}
//           </h1>
//           <p className="text-3xl md:text-4xl text-orange-500 font-bold">
//             ${Number(product.price).toFixed(2)}
//           </p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             {product.images && product.images.length > 0 ? (
//               product.images.map((src, idx) => (
//                 <img
//                   key={idx}
//                   src={`${BASE_URL}${src}`} // full URL
//                   alt={`${product.name} ${idx + 1}`}
//                   className="w-full h-64 object-cover rounded-xl shadow-lg border border-gray-600 transform hover:scale-105 transition-transform duration-300"
//                   onError={(e) => {
//                     e.target.onerror = null;
//                     e.target.src =
//                       "https://placehold.co/600x400/333333/FFFFFF?text=Image+Not+Found";
//                   }} // Fallback
//                 />
//               ))
//             ) : (
//               <div className="col-span-full w-full h-64 bg-gray-700 flex items-center justify-center rounded-xl border border-gray-600 text-gray-400">
//                 <span>No images available</span>
//               </div>
//             )}
//           </div>

//           <div className="space-y-6">
//             <p className="text-gray-300 leading-relaxed text-lg">
//               {product.description}
//             </p>
//             <Link
//               to={`/ewarranty?product_id=${product.id}`}
//               className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
//             >
//               Register Warranty
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Tailwind CSS custom animations and font import */}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

//         .font-inter {
//           font-family: 'Inter', sans-serif;
//         }

//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fade-in {
//           animation: fadeIn 0.5s ease-out forwards;
//         }

//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
//         .animate-pulse {
//           animation: pulse 1.5s infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../services/api"; // Assuming this path is correct

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
  }, [id]); // Existing logic for fetching data based on ID

  // --- Existing Logic, only styling changed ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 font-inter antialiased">
        <p className="text-xl animate-pulse">Loading product details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-600 font-inter antialiased">
        <p className="text-xl">Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-600 font-inter antialiased">
        <p className="text-xl">Product not found.</p>
      </div>
    );
  }
  // --- End Existing Logic ---

  return (
    // Main container with white background and dark text
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-inter antialiased">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        {/* Back to Shop Link */}
        <Link
          to="/shop"
          className="inline-flex items-center text-lime-700 hover:text-lime-800 transition-colors duration-300 font-medium mb-6"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Shop
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          {product.name}
        </h1>
        <p className="text-3xl font-bold text-lime-700 mb-6">
          ₹{Number(product.price).toFixed(2)}
        </p>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {product.images && product.images.length > 0 ? (
            product.images.map((src, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-lg shadow-md border border-gray-200"
              >
                <img
                  src={src}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400/E0E0E0/888888?text=Image+Not+Found";
                  }}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600 p-4 border border-dashed border-gray-300 rounded-lg">
              No images available for this product.
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed mb-8">
          {product.description}
        </p>

        {/* Register Warranty Button */}
        <Link
          to={`/ewarranty?product_id=${product.id}`}
          className="inline-block bg-lime-700 hover:bg-lime-800 text-white font-semibold py-3 px-8 rounded-full shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out"
        >
          Register Warranty
        </Link>
      </div>
      {/* Tailwind CSS custom font import (if not already global) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
