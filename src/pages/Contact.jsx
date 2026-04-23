import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
// 100% PROPER IMPORT: Using the strictly mapped contact object
import { contact } from "../services/api";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });
    try {
      // REWRITTEN: Proper object-oriented API call
      await contact.submit(formData);
      setStatus({ loading: false, success: true, error: "" });
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setStatus({ 
        loading: false, 
        success: false, 
        error: err.response?.data?.message || "Transmission failed. Please verify your connection and try again." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">Command Center</h1>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto">Initiate contact with the Anritvox support nexus. We prioritize rapid deployment of solutions for all hardware and order inquiries.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FiMapPin size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 mb-1">Headquarters</h3>
                <p className="text-slate-900 font-bold">Anritvox Electronics<br/>Industrial Sector 4<br/>New Delhi, India 110001</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FiPhone size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 mb-1">Direct Line</h3>
                <p className="text-slate-900 font-bold">+91 1800-ANRITVOX<br/><span className="text-xs text-slate-500 font-medium">Mon-Sat, 09:00 - 18:00 IST</span></p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4 hover:border-emerald-500 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                <FiMail size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-400 mb-1">Digital Support</h3>
                <p className="text-slate-900 font-bold">support@anritvox.com<br/><span className="text-xs text-slate-500 font-medium">24/7 Automated Ticketing</span></p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              
              <AnimatePresence>
                {status.success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                    <FiCheckCircle className="text-emerald-500 mt-0.5 text-lg" />
                    <div>
                      <p className="font-black text-emerald-900 uppercase text-sm tracking-widest">Message Transmitted</p>
                      <p className="text-emerald-700 text-sm font-medium">Our support nexus has received your data. Expect a response within 24 hours.</p>
                    </div>
                  </motion.div>
                )}
                
                {status.error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                    <FiAlertCircle className="text-rose-500 mt-0.5 text-lg" />
                    <div>
                      <p className="font-black text-rose-900 uppercase text-sm tracking-widest">Transmission Failure</p>
                      <p className="text-rose-700 text-sm font-medium">{status.error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 pl-2">Full Designation</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 pl-2">Network Identity (Email)</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@domain.com" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 pl-2">Directive Subject</label>
                <input required type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Order Inquiry #12345" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 pl-2">Data Payload</label>
                <textarea required name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Detail your operational requirements here..." className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold outline-none transition-all resize-none"></textarea>
              </div>

              <button disabled={status.loading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group">
                {status.loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Transfer <FiSend className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
