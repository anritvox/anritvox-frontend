import React, { useEffect } from 'react';
import { DollarSign, TrendingUp, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Affiliate() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-slate-900 to-[#232f3e] text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Anritvox Partner Program</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
          Monetize your audience by partnering with the industry leader in premium car audio and automotive accessories.
        </p>
        <div className="mt-10">
          <Link to="/contact" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30">
            Apply Now
          </Link>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: DollarSign, title: "High Commissions", desc: "Earn highly competitive rates on every authentic Anritvox product sold through your links." },
            { icon: Award, title: "Premium Brand", desc: "Promote a brand recognized for uncompromising quality and scientific acoustic engineering." },
            { icon: Target, title: "High Conversion", desc: "Benefit from our optimized checkout process, E-Warranty security, and brand trust." },
            { icon: TrendingUp, title: "Dedicated Support", desc: "Get access to exclusive marketing materials, product sheets, and partner support." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                <item.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
