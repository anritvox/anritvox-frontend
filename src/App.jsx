import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Lazy load all pages for performance
const Home           = lazy(() => import("./pages/Home"));
const Shop           = lazy(() => import("./pages/Shop"));
const ProductDetail  = lazy(() => import("./pages/ProductDetail"));
const EWarranty      = lazy(() => import("./pages/EWarranty"));
const Contact        = lazy(() => import("./pages/Contact"));
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const AdminLogin     = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound       = lazy(() => import("./pages/NotFound"));
const Terms          = lazy(() => import("./pages/Terms"));
const Privacy        = lazy(() => import("./pages/Privacy"));

import "./index.css";

const PageLoader = () => (
  <div className="min-h-screen bg-[#eaeded] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#39d353] border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const location = useLocation();
  // Hide Navbar & Footer on ALL /admin/* paths including /admin/login
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPath && <Navbar />}
      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/shop"            element={<Shop />} />
            <Route path="/shop/:id"        element={<ProductDetail />} />
            <Route path="/ewarranty"       element={<EWarranty />} />
            <Route path="/e-warranty"      element={<EWarranty />} />
            <Route path="/contact"         element={<Contact />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/terms"           element={<Terms />} />
            <Route path="/privacy"         element={<Privacy />} />
            <Route path="/admin/login"     element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/*"         element={<AdminDashboard />} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPath && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
