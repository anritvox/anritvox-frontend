import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Shield, BellRing, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <section className="relative py-24 overflow-hidden bg-slate-900">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="max-w-5xl mx-auto bg-slate-950/50 backdrop-blur-2xl border border-slate-800 p-12 md:p-20 rounded-[3rem] shadow-2xl overflow-hidden group">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <Sparkles size={14} />
                Stay Ahead of the Curve
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6 tracking-tighter">
                Join the <span className="text-emerald-500">Elite Drivers</span> Club
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Get early access to flash sales, expert installation guides, and new arrivals before anyone else.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={18} />
                  </div>
                  Exclusive Weekly Discounts
                </div>
                <div className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <BellRing size={18} />
                  </div>
                  New Product Launch Alerts
                </div>
                <div className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Shield size={18} />
                  </div>
                  Unsubscribe Anytime
                </div>
              </div>
            </div>

            <div className="relative">
              {status === 'success' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-10 rounded-3xl text-center animate-scale-in">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <CheckCircle2 size={40} className="text-black" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">You're on the list!</h3>
                  <p className="text-emerald-400/80 font-medium">Check your inbox for a special welcome gift.</p>
                  <button onClick={() => setStatus('idle')} className="mt-8 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
                    Back to Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-500 transition-colors">
                      <Mail size={24} />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-20 pl-16 pr-6 bg-slate-900/50 border-2 border-slate-800 rounded-2xl text-white text-lg font-medium placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-20 bg-emerald-500 hover:bg-white text-black font-black text-xl uppercase tracking-wider rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.2)]"
                  >
                    {status === 'loading' ? 'Subscribing...' : (
                      <>
                        Subscribe Now
                        <Send size={24} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
