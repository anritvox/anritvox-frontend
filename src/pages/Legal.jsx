import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Legal() {
  const location = useLocation();
  const isPrivacy = location.pathname.includes('privacy');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-white py-16 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
          {isPrivacy ? "Privacy Notice" : "Conditions of Use & Sale"}
        </h1>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
          <p className="text-sm font-bold text-gray-900">Last Updated: {new Date().getFullYear()}</p>
          
          {isPrivacy ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mt-8">1. Information We Collect</h2>
              <p>We collect information to provide better services to our users. This includes basic details like your IP address, to more complex things like the Anritvox products you register via our E-Warranty system.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8">2. How We Use Your Data</h2>
              <p>Your data helps us authenticate your premium hardware, process returns efficiently, and ensure you have 100% purchase protection. We never sell your personal data to third parties.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mt-8">1. Acceptance of Terms</h2>
              <p>By using Anritvox services or purchasing our automotive and audio products, you agree to these conditions. Please read them carefully.</p>
              
              <h2 className="text-2xl font-bold text-gray-900 mt-8">2. E-Warranty & Returns</h2>
              <p>All authentic Anritvox products come with a manufacturer warranty. Serial numbers must be registered in our nexus to claim 100% purchase protection. Unregistered or tampered serials void this agreement.</p>
            </>
          )}
          
          <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2">Need further clarification?</h3>
            <p>If you have any questions regarding these policies, please reach out to our legal and support team via the <a href="/contact" className="text-blue-600 hover:underline">Contact Center</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
