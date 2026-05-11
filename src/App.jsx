import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";
import { CompareProvider } from "./context/CompareContext.jsx";
import "./index.css";

const Home = lazy(() => import("./pages/Home.jsx"));
const Warehouse = lazy(() => import("./pages/Warehouse.jsx"));
const WarehouseAdmin = lazy(() => import("./pages/admin/WarehouseAdmin.jsx"));
const WarehouseManagement = lazy(() => import("./pages/admin/WarehouseManagement.jsx"));
const WarehouseAdminLogin = lazy(() => import("./pages/WarehouseAdminLogin.jsx"));
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

const PageLoader = () => <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>;

function ProtectedRoute({ children }) {
  const a = useAuth() || {}; const u = a.user || JSON.parse(localStorage.getItem('user') || 'null'); const t = localStorage.getItem('token');
  if (a.loading) return <PageLoader />; if (!u || !t) return <Navigate to="/login" />; return children;
}

function AdminRoute({ children }) {
  const a = useAuth() || {}; const u = a.user || JSON.parse(localStorage.getItem('user') || 'null'); const t = localStorage.getItem('token');
  if (a.loading) return <PageLoader />; if (!u || !t || (u.role !== 'admin' && u.role !== 'superadmin')) return <Navigate to="/admin-login" />; return children;
}

function WarehouseRoute({ children }) {
  const t = localStorage.getItem('token') || localStorage.getItem('warehouseToken');
  if (!t) return <Navigate to="/login" />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isWarehousePath = location.pathname.startsWith("/warehouse") || location.pathname.startsWith("/warehouseadmin");

  return (
    <>
      {!isAdminPath && !isWarehousePath && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/ewarranty" element={<EWarranty />} />
          <Route path="/warranty" element={<EWarranty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/address-book" element={<ProtectedRoute><AddressBook /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
          <Route path="/affiliate" element={<ProtectedRoute><Affiliate /></ProtectedRoute>} />
          
          {/* WAREHOUSE POS BRIDGE (Frontend -> Backend HTML) */}
          <Route path="/warehouse" element={<WarehouseRoute><Warehouse /></WarehouseRoute>} />
          
          {/* MASTER WAREHOUSE ADMIN DASHBOARD */}
          <Route path="/warehouseadmin" element={<AdminRoute><WarehouseManagement /></AdminRoute>} />
          <Route path="/warehouseadmin/login" element={<WarehouseAdminLogin />} />
          
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/dashboard/:tab" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
      {!isAdminPath && !isWarehousePath && <Footer />}
    </>
  );
}

function App() {
  return <BrowserRouter><AuthProvider><CartProvider><WishlistProvider><CompareProvider><ToastProvider><AppContent /></ToastProvider></CompareProvider></WishlistProvider></CartProvider></AuthProvider></BrowserRouter>;
}

export default App;
