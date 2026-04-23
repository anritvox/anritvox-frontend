import React, { lazy, Suspense, Component } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

// Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { CompareProvider } from "./context/CompareContext.jsx";
import "./index.css";

// Lazy load pages - Strict extensions added to prevent deployment missing link
const Home = lazy(() => import("./pages/Home.jsx"));
const Shop = lazy(() => import("./pages/Shop.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const EWarranty = lazy(() => import("./pages/EWarranty.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Checkout = lazy(() => import("./pages/Checkout.jsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const Wishlist = lazy(() => import("./pages/Wishlist.jsx"));
const OrderTracking = lazy(() => import("./pages/OrderTracking.jsx"));
const Compare = lazy(() => import("./pages/Compare.jsx"));
const AddressBook = lazy(() => import("./pages/AddressBook.jsx"));
const Returns = lazy(() => import("./pages/Returns.jsx"));
const Affiliate = lazy(() => import("./pages/Affiliate.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Legal = lazy(() => import("./pages/Legal.jsx"));

const PageLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-gray-950 flex-col items-center justify-center p-8 text-center">
    <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
    <pre className="bg-gray-900 border border-gray-700 p-4 rounded-lg text-gray-300 text-sm mb-6 whitespace-pre-wrap">{error?.message}</pre>
    <div className="flex gap-4 justify-center">
      <button onClick={resetError} className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors">Try Again</button>
      <a href="/" className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">Go to Homepage</a>
    </div>
  </div>
);

class ErrorBoundary extends Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }

  static getDerivedStateFromError(error) { 
    const isChunkLoadFailed = error.message && (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('dynamically imported module')
    );

    if (isChunkLoadFailed) {
      const chunkReloaded = sessionStorage.getItem('chunk_reloaded');
      if (!chunkReloaded) {
        sessionStorage.setItem('chunk_reloaded', 'true');
        window.location.reload();
        return { hasError: false, error: null };
      }
    }
    
    return { hasError: true, error }; 
  }

  componentDidCatch(error, info) { 
    console.error("ErrorBoundary caught:", error, info); 
  }

  componentDidMount() {
    sessionStorage.removeItem('chunk_reloaded');
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth() || { user: null, loading: false };
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth() || { user: null, loading: false };
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
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

          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard/overview" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin/dashboard/overview" replace />} />

          {/* Admin Dashboard Routes - Aliased to prevent sidebar fall-through kicks */}
          <Route path="/admin/:tab" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/dashboard/:tab" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

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
                <CompareProvider>
                  <AppContent />
                </CompareProvider>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
