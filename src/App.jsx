import React, { lazy, Suspense, Component } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

// Components & Contexts
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext";
import { WishlistProvider } from "./context/WishlistContext";
import "./index.css";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const EWarranty = lazy(() => import("./pages/EWarranty"));
const Contact = lazy(() => import("./pages/Contact"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Compare = lazy(() => import("./pages/Compare"));
const AddressBook = lazy(() => import("./pages/AddressBook"));
const Returns = lazy(() => import("./pages/Returns"));
const Affiliate = lazy(() => import("./pages/Affiliate"));
const About = lazy(() => import("./pages/About"));
const Legal = lazy(() => import("./pages/Legal"));

// Admin Specific Pages
const ReturnManagement = lazy(() => import("./pages/admin/ReturnManagement"));
const CouponManagement = lazy(() => import("./pages/admin/CouponManagement"));
const InventoryManagement = lazy(() => import("./pages/admin/InventoryManagement"));

// --- UI Helpers (Light Themed) ---

const PageLoader = () => (
  <div className="min-h-screen bg-alabaster flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-olive-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-alabaster flex flex-col items-center justify-center p-8 text-center">
    <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
    <pre className="bg-white border border-gray-200 text-gray-700 p-4 rounded-lg max-w-2xl overflow-x-auto text-sm mb-6 shadow-sm">
      {error?.message || "An unexpected error occurred."}
    </pre>
    <div className="flex gap-4">
      <button 
        onClick={resetError} 
        className="px-6 py-2 bg-olive-600 text-white rounded-full font-medium hover:bg-olive-700 transition-colors"
      >
        Try Again
      </button>
      <a href="/" className="px-6 py-2 border border-olive-600 text-olive-600 rounded-full font-medium">
        Go to Homepage
      </a>
    </div>
  </div>
);

// --- Logic Components ---

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPath && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/terms" element={<Legal />} />
          
          {/* User Feature Routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/ewarranty" element={<EWarranty />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/address-book" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/returns" element={<ProtectedRoute><ReturnManagement /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute><CouponManagement /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      {!isAdminPath && <Footer />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <WishlistProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </WishlistProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
