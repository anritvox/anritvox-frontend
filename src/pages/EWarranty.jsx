import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { validateSerial, registerWarranty } from "../services/api";
import {
  Shield, CheckCircle, User, Mail, Phone, Package,
  ArrowLeft, Loader2, AlertCircle, Search, QrCode,
  Calendar, ShieldCheck, Zap, Sparkles, ExternalLink,
  ChevronRight, Award, MapPin
} from "lucide-react";

export default function EWarranty() {
  const [step, setStep] = useState(1);
  const [serial, setSerial] = useState("");
  const [info, setInfo] = useState(null);
  const [form, setForm] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    purchase_location: "Amazon",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const pre = searchParams.get("serial");
    if (pre) {
      setSerial(pre.trim().toUpperCase());
      setTimeout(() => {
        handleValidate(pre.trim().toUpperCase());
      }, 500);
    }
  }, [searchParams]);

  const handleValidate = async (forcedSerial) => {
    const s = forcedSerial || serial;
    if (!s) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const data = await validateSerial(s);
      setInfo(data);
      if (data.is_registered) {
        setStep(3); // Already registered view
      } else {
        setStep(2); // Registration form
      }
    } catch (e) {
      setError(e.message || "Invalid or unrecognized serial number. Please check the label on your product.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.user_name.trim() || !form.user_email.trim()) {
      setError("Please provide your name and email for the certificate.");
      setLoading(false);
      return;
    }

    try {
      await registerWarranty({
        serial_number: info.serial_number,
        customer_name: form.user_name,
        customer_email: form.user_email,
        customer_phone: form.user_phone,
        purchase_date: new Date().toISOString()
      });
      setSuccessMsg("Hardware authenticated successfully. Your lifetime warranty is now active.");
      setStep(3);
      // Refresh info to show registered state
      const updatedData = await validateSerial(info.serial_number);
      setInfo(updatedData);
    } catch (e) {
      setError(e.message || "Registration failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
          <QrCode size={32} />
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Authenticity Check</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">Enter the unique 12-digit hardware ID found on your product's security label.</p>
      </div>

      <div className="relative group">
        <div className="relative bg-[#0a0f14] border border-white/10 rounded-2xl overflow-hidden flex items-center p-1">
          <div className="pl-4 text-gray-600">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="AX-8800-XXXX-XXXX"
            value={serial}
            onChange={(e) => setSerial(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
            className="flex-1 bg-transparent border-none px-4 py-4 text-white font-mono tracking-widest outline-none placeholder:text-gray-700"
          />
          <button
            onClick={() => handleValidate()}
            disabled={loading || !serial}
            className="px-6 py-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Secure Scan</h4>
          <p className="text-[10px] text-gray-500 leading-relaxed">Encrypted validation against our global hardware database.</p>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <Zap size={18} className="text-amber-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instant Activation</h4>
          <p className="text-[10px] text-gray-500 leading-relaxed">Immediate warranty coverage upon successful ID verification.</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setStep(1)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Product Identified</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Genuine Hardware Detected</p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-black/40 flex items-center justify-center text-purple-400 border border-white/5 shrink-0 overflow-hidden">
          {info.product_image ? (
            <img src={info.product_image} alt={info.product_name} className="w-full h-full object-cover" />
          ) : (
            <Package size={28} />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-white truncate">{info.product_name || "Hardware Unit"}</h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {info.serial_number}</p>
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 ml-1">Full Name</label>
          <div className="relative">
            <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              value={form.user_name}
              onChange={(e) => setForm({...form, user_name: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p1-10 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 ml-1">Email Address</label>
          <div className="relative">
            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="email"
              value={form.user_email}
              onChange={(e) => setForm({...form, user_email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p1-10 pr-4 py-3.5 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 ml-1">Platform of Purchase</label>
          <div className="grid grid-cols-3 gap-2">
            {["Amazon", "Flipkart", "Official Site"].map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() => setForm({...form, purchase_location: loc})}
                className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${form.purchase_location === loc ? 'bg-purple-500 border-purple-500 text-white' : 'border-white/10 text-gray-500 hover:border-white/20'}`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
          Activate Lifetime Warranty
        </button>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-fade-in text-center">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative p-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-500 mb-2">
          <ShieldCheck size={48} />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white border-4 border-[#080a0f]">
          <Award size={16} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Authenticated</h2>
        <p className="text-gray-400 text-sm">Your product is officially protected under the Anritvox ecosystem.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles size={100} />
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Registered Owner</label>
          <div className="text-lg font-bold text-white">{info.customer_name || form.user_name}</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Hardware ID</label>
            <div className="text-sm font-mono text-purple-400">#{info.serial_number}</div>
          </div>
          <div className="space-y-1 text-right">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">Status</label>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Protection</div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-gray-600" />
            <div>
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">Protection Since</div>
              <div className="text-xs text-white">{new Date(info.purchase_date || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>
          <button onClick={() => window.print()} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all">
             <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate('/shop')}
        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center gap-2"
      >
        <Sparkles size={18} className="text-purple-400" /> Explore More Hardware
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080a0f] text-white py-12 px-4 selection:bg-purple-500/30">
      <div className="max-w-xl mx-auto">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-purple-500' : 'w-2 bg-white/10'}`}
            ></div>
          ))}
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-shake">
            <AlertCircle className="text-rose-500 shrink-0" size={18} />
            <p className="text-xs text-rose-200">{error}</p>
          </div>
        )}

        <div className="relative">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-6 mb-4 opacity-30 grayscale">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-4 invert" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Flipkart_logo.png" alt="Flipkart" className="h-5" />
          </div>
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em]">Official Anritvox Authentication Gateway</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-fade-in { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      ` }} />
    </div>
  );
}
