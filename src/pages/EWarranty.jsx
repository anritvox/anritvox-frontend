// import React, { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
// import { validateSerial, registerWarranty } from "../services/api"; // Ensure these are correctly imported

// export default function EWarranty() {
//   const [step, setStep] = useState(1);
//   const [serial, setSerial] = useState("");
//   const [info, setInfo] = useState(null); // Stores product info after validation
//   const [form, setForm] = useState({
//     user_name: "",
//     user_email: "",
//     user_phone: "",
//   });
//   const [error, setError] = useState("");
//   const [successMsg, setSuccessMsg] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [searchParams] = useSearchParams();

//   // Prefill serial if passed in query string (Existing Logic)
//   useEffect(() => {
//     const pre = searchParams.get("serial");
//     if (pre) setSerial(pre.trim().toUpperCase());
//   }, [searchParams]);

//   // Step 1: Validate the serial number
//   const handleValidate = async () => {
//     setLoading(true);
//     setError("");
//     setSuccessMsg("");
//     try {
//       const data = await validateSerial(serial);
//       setInfo(data);
//       setStep(2);
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: Register the warranty
//   const handleRegister = async () => {
//     setLoading(true);
//     setError("");
//     setSuccessMsg("");

//     // Basic form validation: Name and Email are required
//     if (!form.user_name.trim()) {
//       setError("Name is required.");
//       setLoading(false);
//       return;
//     }

//     // Email format validation
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email regex
//     if (!form.user_email.trim()) {
//       setError("Email address is required.");
//       setLoading(false);
//       return;
//     }
//     if (!emailRegex.test(form.user_email)) {
//       setError("Please enter a valid email address.");
//       setLoading(false);
//       return;
//     }

//     // Phone number validation: Must be exactly 10 digits if provided
//     const phoneRegex = /^\d{10}$/; // Regex to match exactly 10 digits
//     if (form.user_phone.trim() !== "" && !phoneRegex.test(form.user_phone)) {
//       setError("Phone number must be exactly 10 digits.");
//       setLoading(false);
//       return;
//     }

//     try {
//       await registerWarranty({
//         serial,
//         product_id: info.product_id, // Use info.product_id
//         user_name: form.user_name,
//         user_email: form.user_email,
//         user_phone: form.user_phone,
//       });

//       // --- BUG FIX START ---
//       setSuccessMsg("Warranty registered successfully!"); // Set success message

//       // Immediately reset form states to clear details
//       setInfo(null);
//       setSerial("");
//       setForm({ user_name: "", user_email: "", user_phone: "" });
//       setLoading(false); // Stop loading immediately
//       setStep(1); // Redirect back to step 1 immediately

//       // Use a timeout ONLY to clear the success message after it's shown for a duration
//       setTimeout(() => {
//         setSuccessMsg("");
//       }, 2500); // Matches the animation duration so it fades out with the message
//       // --- BUG FIX END ---
//     } catch (e) {
//       setError(e.message);
//       setLoading(false); // Ensure loading is off on error
//     }
//   };

//   // Adjusted classes for white background theme
//   const commonInputClasses =
//     "w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-200 placeholder-gray-500 shadow-sm";
//   const commonButtonClasses =
//     "w-full bg-lime-700 hover:bg-lime-800 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";

//   return (
//     // Main container with white background and Inter font
//     <div className="min-h-screen bg-white text-gray-900 font-inter antialiased flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       {/* Central card container */}
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6 animate-fade-in">
//         <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
//           Product <span className="text-lime-700">E-Warranty</span>
//         </h1>

//         {/* Success Message display (moved to top for persistent display after redirect) */}
//         {successMsg && (
//           <div className="text-center space-y-4 animate-fade-in-out bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg shadow-sm">
//             <svg
//               className="mx-auto h-16 w-16 text-green-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//               ></path>
//             </svg>
//             <h2 className="text-2xl font-bold text-green-700">{successMsg}</h2>
//             <p className="text-gray-700">Ready for the next registration!</p>
//           </div>
//         )}

//         {/* Step 1: Enter Serial Number */}
//         {step === 1 && (
//           <div className="space-y-6">
//             <p className="text-gray-700 text-center">
//               Please enter your product's serial number to validate its
//               eligibility for warranty registration.
//             </p>
//             <input
//               type="text"
//               value={serial}
//               onChange={(e) => setSerial(e.target.value.trim().toUpperCase())}
//               placeholder="e.g. WH1001"
//               className={commonInputClasses}
//               disabled={loading}
//             />
//             <button
//               onClick={handleValidate}
//               className={commonButtonClasses}
//               disabled={loading || !serial.trim()} // Ensure serial is not just whitespace
//             >
//               {loading ? "Validating..." : "Validate Serial Number"}
//             </button>
//             {error && (
//               <p className="text-red-600 text-center mt-4 animate-fade-in">
//                 {error}
//               </p>
//             )}
//           </div>
//         )}

//         {/* Step 2: Register Warranty Form */}
//         {step === 2 && info && (
//           <div className="space-y-6 animate-fade-in">
//             <div className="flex flex-col items-center justify-center text-center mb-4 p-4 border border-gray-100 rounded-lg bg-gray-50 shadow-sm">
//               <p className="text-gray-700 text-base mb-2">
//                 Serial Number:{" "}
//                 <strong className="text-gray-800 font-semibold">
//                   {serial}
//                 </strong>
//               </p>
//               {info.product_image_url && ( // Display image if available
//                 <img
//                   src={info.product_image_url}
//                   alt={info.product_name}
//                   className="w-28 h-28 object-contain rounded-lg mb-2 shadow-md" // Adjust size as needed
//                 />
//               )}
//               <p className="text-xl font-bold text-lime-700">
//                 {info.product_name} {/* Display product name prominently */}
//               </p>
//               <p className="text-sm text-gray-600 mt-1">
//                 Model:{" "}
//                 <span className="font-medium">
//                   {info.product_model || "N/A"}
//                 </span>
//               </p>
//             </div>

//             <input
//               type="text"
//               placeholder="Your Full Name"
//               value={form.user_name}
//               onChange={(e) => setForm({ ...form, user_name: e.target.value })}
//               className={commonInputClasses}
//               disabled={loading}
//               required
//             />
//             <input
//               type="email"
//               placeholder="Your Email Address"
//               value={form.user_email}
//               onChange={(e) => setForm({ ...form, user_email: e.target.value })}
//               className={commonInputClasses}
//               disabled={loading}
//               required
//             />
//             <input
//               type="tel"
//               placeholder="Your Mobile Number (10 digits)"
//               value={form.user_phone}
//               onChange={(e) =>
//                 setForm({
//                   ...form,
//                   user_phone: e.target.value.replace(/[^0-9]/g, ""),
//                 })
//               }
//               className={commonInputClasses}
//               maxLength="10"
//               disabled={loading}
//               required
//             />
//             <button
//               onClick={handleRegister}
//               className={commonButtonClasses}
//               disabled={
//                 loading ||
//                 !form.user_name.trim() ||
//                 !form.user_email.trim() ||
//                 !form.user_phone.trim()
//               }
//             >
//               {loading ? "Registering..." : "Submit Registration"}
//             </button>
//             {error && (
//               <p className="text-red-600 text-center mt-4 animate-fade-in">
//                 {error}
//               </p>
//             )}
//             <button
//               onClick={() => {
//                 setStep(1);
//                 setError("");
//                 setInfo(null);
//                 setSerial("");
//                 setForm({ user_name: "", user_email: "", user_phone: "" });
//                 setLoading(false);
//               }}
//               className="w-full text-gray-600 hover:text-lime-700 mt-4 transition-colors duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               Go Back
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Tailwind CSS custom animations and font import (Existing, but included for completeness) */}
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

//         @keyframes fadeInOut {
//           0% { opacity: 0; transform: translateY(10px); }
//           10% { opacity: 1; transform: translateY(0); }
//           90% { opacity: 1; transform: translateY(0); }
//           100% { opacity: 0; transform: translateY(10px); }
//         }
//         .animate-fade-in-out {
//           animation: fadeInOut 2.5s ease-in-out forwards;
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
import { useSearchParams } from "react-router-dom";
import { validateSerial, registerWarranty } from "../services/api";
import {
  Shield,
  CheckCircle,
  User,
  Mail,
  Phone,
  Package,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";

export default function EWarranty() {
  const [step, setStep] = useState(1);
  const [serial, setSerial] = useState("");
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const pre = searchParams.get("serial");
    if (pre) setSerial(pre.trim().toUpperCase());
  }, [searchParams]);

  const handleValidate = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const data = await validateSerial(serial);
      setInfo(data);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    if (!form.user_name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.user_email.trim()) {
      setError("Email address is required.");
      setLoading(false);
      return;
    }
    if (!emailRegex.test(form.user_email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (form.user_phone.trim() !== "" && !phoneRegex.test(form.user_phone)) {
      setError("Phone number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    try {
      await registerWarranty({
        serial,
        product_id: info.product_id,
        user_name: form.user_name,
        user_email: form.user_email,
        user_phone: form.user_phone,
      });

      setSuccessMsg("Warranty registered successfully!");
      setInfo(null);
      setSerial("");
      setForm({ user_name: "", user_email: "", user_phone: "" });
      setLoading(false);
      setStep(1);

      setTimeout(() => {
        setSuccessMsg("");
      }, 2500);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50 font-inter antialiased flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-green-200/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-lime-100/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Central card container */}
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-lime-200/50 p-8 space-y-6 animate-fade-in relative z-10">
        {/* Header with icon */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-lime-600 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-lime-700 to-green-700 bg-clip-text text-transparent">
            E-Warranty Registration
          </h1>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="text-center space-y-4 animate-fade-in-out bg-gradient-to-r from-green-50 to-lime-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-500 to-lime-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-green-700">{successMsg}</h2>
            <p className="text-gray-600">Ready for next registration</p>
          </div>
        )}

        {/* Step 1: Enter Serial Number */}
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-gray-600 text-center text-sm">
              Enter your product's serial number to validate warranty
              eligibility
            </p>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
              </div>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value.trim().toUpperCase())}
                placeholder="e.g. WH1001"
                className="w-full bg-white text-gray-900 border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm hover:shadow-md"
                disabled={loading}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-lime-600/20 to-green-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10"></div>
            </div>

            <button
              onClick={handleValidate}
              disabled={loading || !serial.trim()}
              className="w-full bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-lime-700 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Validate Serial Number
                  </>
                )}
              </span>
            </button>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl animate-fade-in flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Register Warranty Form */}
        {step === 2 && info && (
          <div className="space-y-6 animate-fade-in">
            {/* Product Info Card */}
            <div className="bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-200 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Package className="h-5 w-5 text-lime-600" />
                <span className="text-sm font-medium text-gray-600">
                  Serial: {serial}
                </span>
              </div>

              {info.product_image_url && (
                <img
                  src={info.product_image_url}
                  alt={info.product_name}
                  className="w-24 h-24 object-contain rounded-xl mx-auto mb-3 shadow-md bg-white p-2"
                />
              )}

              <h3 className="text-lg font-bold text-lime-700 mb-1">
                {info.product_name}
              </h3>
              <p className="text-sm text-gray-600">
                Model:{" "}
                <span className="font-medium">
                  {info.product_model || "N/A"}
                </span>
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={form.user_name}
                  onChange={(e) =>
                    setForm({ ...form, user_name: e.target.value })
                  }
                  className="w-full bg-white text-gray-900 border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm hover:shadow-md"
                  disabled={loading}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={form.user_email}
                  onChange={(e) =>
                    setForm({ ...form, user_email: e.target.value })
                  }
                  className="w-full bg-white text-gray-900 border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm hover:shadow-md"
                  disabled={loading}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-lime-600 transition-colors duration-200" />
                </div>
                <input
                  type="tel"
                  placeholder="Your Mobile Number (10 digits)"
                  value={form.user_phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      user_phone: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                  className="w-full bg-white text-gray-900 border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-lime-600 focus:border-transparent transition-all duration-300 placeholder-gray-500 shadow-sm hover:shadow-md"
                  maxLength="10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={
                loading ||
                !form.user_name.trim() ||
                !form.user_email.trim() ||
                !form.user_phone.trim()
              }
              className="w-full bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-lime-700 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Submit Registration
                  </>
                )}
              </span>
            </button>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl animate-fade-in flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={() => {
                setStep(1);
                setError("");
                setInfo(null);
                setSerial("");
                setForm({ user_name: "", user_email: "", user_phone: "" });
                setLoading(false);
              }}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-lime-700 py-3 transition-colors duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(20px); }
        }
        .animate-fade-in-out {
          animation: fadeInOut 2.5s ease-in-out forwards;
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite cubic-bezier(0.6, 0.01, 0.0, 0.99); }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
