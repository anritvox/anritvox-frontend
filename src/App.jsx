import About from './pages/About';
import Legal from './pages/Legal';
import React, { lazy, Suspense, Component } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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
const ReturnManagement = lazy(() => import("./pages/admin/ReturnManagement"));
const CouponManagement = lazy(() => import("./pages/admin/CouponManagement"));
const InventoryManagement = lazy(() => import("./pages/admin/InventoryManagement"));

const PageLoader = () => (
  <div style={{minHeight:'100vh',background:'#111',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{width:40,height:40,border:'4px solid #22d3ee',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}} />
  </div>
);

const ErrorFallback = ({ error, resetError }) => (
  <div style={{minHeight:'100vh',background:'#000',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,color:'#fff',padding:32}}>
    <h2 style={{fontSize:24,fontWeight:'bold',color:'#f87171'}}>Something went wrong</h2>
    <pre style={{background:'#1f1f1f',color:'#fbbf24',padding:16,borderRadius:8,maxWidth:800,overflowX:'auto',whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:13}}>{error?.message || "An unexpected error occurred."}{"\n\n"}{error?.stack || ""}</pre>
    <button onClick={resetError} style={{padding:'8px 24px',background:'#06b6d4',color:'#000',border:'none',borderRadius:8,cursor:'pointer',fontWeight:'bold'}}>Try Again</button>
    <a href="/" style={{color:'#22d3ee'}}>Go to Homepage</a>
  </div>
);

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
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Legal />} />
          <Route path="/terms" element={<Legal />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/ewarranty" element={<EWarranty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/address-book" element={<AddressBook />} />
          <Route path="/admin/returns" element={<ReturnManagement />} />
          <Route path="/admin/coupons" element={<CouponManagement />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
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
      <CartProvider>
        <AuthProvider>
          <ToastProvider>
            <WishlistProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
