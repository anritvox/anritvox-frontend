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

const PageLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-gray-950 flex-col items-center justify-center p-8 text-center">
    <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
    <pre className="bg-gray-900 border border-gray-700 p-4 rounded-lg text-gray-300 text-sm mb-6">{error?.message}</pre>
    <div className="flex gap-4 justify-center">
      <button onClick={resetError} className="px-6 py-2 bg-cyan-600 text-white rounded-full">Try Again</button>
      <a href="/" className="px-6 py-2 bg-gray-700 text-white rounded-full">Go to Homepage</a>
    </div>
  </div>
);

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

// Protected user route - redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin route - redirects to /admin (admin login) if not admin
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin" replace />;
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
          <Route path="/product/slug/:slug" element={<ProductDetail />} />
          <Route path="/ewarranty" element={<EWarranty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/affiliate" element={<Affiliate />} />
          <Route path="/compare" element={<Compare />} />

          {/* User Feature Routes */}
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
          <Route path="/address-book" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Auth Route - shows admin login form */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/dashboard/:tab" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/returns" element={<AdminRoute><ReturnManagement /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><CouponManagement /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><InventoryManagement /></AdminRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {!isAdminPath && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
