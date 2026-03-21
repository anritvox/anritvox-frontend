import React, { useEffect } from 'react';
import { RefreshCcw, ShieldCheck, Package, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Returns() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-[#232f3e] text-white py-20 px-4 text-center">
        <RefreshCcw className="w-16 h-16 mx-auto mb-6 text-blue-500" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Returns & Replacements</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          We stand by the quality of our premium audio systems. If your Anritvox product doesn't meet your expectations, we are here to make it right.
        </p>
      </div>

      {/* Return Process */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            { step: "01", icon: ShieldCheck, title: "Verify Warranty", desc: "Ensure your product serial number is registered in our E-Warranty Nexus." },
            { step: "02", icon: HeadphonesIcon, title: "Contact Support", desc: "Reach out to our technical team to troubleshoot or authorize a return." },
            { step: "03", icon: Package, title: "Pack & Ship", desc: "Securely pack the hardware in its original packaging and ship it to our facility." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative z-10 hover:shadow-md transition-all">
              <div className="text-6xl font-black text-gray-50 absolute top-4 right-4 z-0">{item.step}</div>
              <item.icon className="w-10 h-10 text-blue-600 mx-auto mb-4 relative z-10" />
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">{item.title}</h3>
              <p className="text-gray-500 text-sm relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="max-w-4xl mx-auto px-4 mt-20 text-center bg-white p-12 rounded-3xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to start a return?</h2>
        <p className="text-gray-600 mb-8 max-w-xl mx-auto">
          Our specialized support team is ready to assist you with hardware diagnostics and the RMA (Return Merchandise Authorization) process.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/ewarranty" className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
            Check E-Warranty
          </Link>
          <Link to="/contact" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Contact Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}
