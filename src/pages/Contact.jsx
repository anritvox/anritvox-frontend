import React, { useState } from 'react';
import { 
  Send, Mail, Phone, MapPin, MessageSquare, 
  HelpCircle, FileText, AlertCircle, RefreshCw,
  ShieldCheck, Wrench, Package, ArrowRight, CheckCircle, ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const FAQS = [
  {
    q: "How do I check compatibility for my vehicle?",
    a: "Navigate to any hardware node page and use our Guaranteed Fit System. Enter your vehicle's Make, Model, and Year to instantly verify matrix compatibility against our live database."
  },
  {
    q: "What is your warranty policy on LED hardware?",
    a: "Most of our primary lighting nodes include a standard 12-month comprehensive warranty. Your unique RMA Serial Hash is generated upon purchase and acts as your digital warranty card."
  },
  {
    q: "How long does priority shipping take?",
    a: "Orders processed before 14:00 IST are dispatched same-day. Standard transit times are 2-4 business days depending on your regional routing."
  },
  {
    q: "Can I return a component if it doesn't fit?",
    a: "Yes. If the component is uninstalled and in its original packaging, you may initiate a return within 7 days of delivery. Refer to our Returns matrix for full conditions."
  }
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', order_id: '', subject: 'technical_support', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [ticketGenerated, setTicketGenerated] = useState(false);
  const { showToast } = useToast() || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Pushing to the standard contact endpoint
      await api.post('/contact', form);
      setTicketGenerated(true);
      showToast?.('Support ticket injected successfully.', 'success');
      setForm({ name: '', email: '', phone: '', order_id: '', subject: 'technical_support', message: '' });
    } catch (err) {
      showToast?.('Failed to transmit support payload.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">
          <HelpCircle size={12} /> Support Matrix Active
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">
          Client <span className="text-blue-500">Support</span>
        </h1>
        <p className="text-slate-400 font-bold max-w-2xl mx-auto text-sm">
          Need assistance with your hardware, routing, or telemetry? Our engineering and support team is standing by to resolve your queries.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Support Ticket Form */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full pointer-events-none"></div>
            
            {ticketGenerated ? (
              <div className="flex flex-col items-center justify-center text-center py-16 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mb-6">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Ticket Generated</h3>
                <p className="text-slate-400 font-bold mb-8 max-w-md">
                  Your support payload has been securely transmitted to our resolution matrix. An agent will contact you shortly.
                </p>
                <button onClick={() => setTicketGenerated(false)} className="px-8 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                  Submit Another Request
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                  <MessageSquare size={24} className="text-blue-500" /> Transmit Payload
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Generate a secure support ticket</p>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Identity (Name)</label>
                      <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Comms Channel (Email)</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Telemetry (Phone) - Optional</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Order Hash - Optional</label>
                      <input type="text" placeholder="e.g. #001234" value={form.order_id} onChange={e => setForm({...form, order_id: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white font-mono outline-none focus:border-blue-500/50 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Routing Category</label>
                    <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white font-bold outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer">
                      <option value="technical_support">Hardware / Technical Support</option>
                      <option value="order_status">Logistics / Order Tracking</option>
                      <option value="returns_rma">Returns / RMA Generation</option>
                      <option value="general">General Transmission</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 block mb-2">Transmission Data</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Describe the anomaly or request in detail..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 outline-none focus:border-blue-500/50 transition-all resize-none custom-scrollbar" />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 flex items-center justify-center gap-2 group">
                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-1 transition-transform" />} 
                    Execute Transmission
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Info & FAQ Matrix */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
              <Mail className="text-blue-500 mb-4" size={24} />
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Direct Comms</h4>
              <p className="text-sm font-bold text-white">support@anritvox.com</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
              <Phone className="text-emerald-500 mb-4" size={24} />
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Voice Matrix</h4>
              <p className="text-sm font-bold text-white">+91 90000 00000</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
              <FileText size={18} className="text-purple-500" /> FAQ Database
            </h3>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-slate-800 bg-slate-950/50 rounded-2xl overflow-hidden transition-all">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-xs font-bold text-slate-300 pr-4">{faq.q}</span>
                    <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${activeFaq === i ? 'rotate-180 text-blue-500' : ''}`} />
                  </button>
                  <div className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === i ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed border-t border-slate-800/50 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-[2.5rem]">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-2">Enterprise Solutions</h3>
            <p className="text-xs font-bold text-slate-400 mb-6">Looking for bulk hardware acquisitions or B2B dealership matrices? Connect with our wholesale division.</p>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-blue-400 transition-colors">
              Wholesale Portal <ArrowRight size={12} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Ensure you import ChevronDown at the top if it wasn't already in your lucide-react imports:
// import { ..., ChevronDown } from 'lucide-react';
