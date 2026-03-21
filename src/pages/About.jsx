import React from 'react';
import { Shield, Zap, Award, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-[#232f3e] text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Anritvox</h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          Pioneering premium car audio systems, enterprise asset authentication, and high-fidelity automotive accessories.
        </p>
      </div>

      {/* Core Values */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: "Anritvox Science", desc: "Relentless innovation in acoustic engineering and hardware design." },
            { icon: Shield, title: "100% Protection", desc: "Every product is secured with our enterprise-grade E-Warranty system." },
            { icon: Award, title: "Premium Quality", desc: "Built with uncompromising standards for the ultimate in-car experience." },
            { icon: Users, title: "Our Community", desc: "Dedicated to providing exceptional support to our global customer base." }
          ].map((val, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <val.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{val.title}</h3>
              <p className="text-gray-500 text-sm">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Careers & Press section */}
      <div id="careers" className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Join the Revolution</h2>
        <p className="text-gray-600 mb-8">
          We are always looking for passionate engineers, designers, and visionaries to join the Anritvox team. 
          Check back soon for open positions or contact our press team for media inquiries.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/contact" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Contact Press Team</a>
          <a href="/contact" className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">View Openings</a>
        </div>
      </div>
    </div>
  );
}
