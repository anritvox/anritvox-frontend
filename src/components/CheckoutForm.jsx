import React, { useState } from 'react';
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  ChevronRight,
  Lock,
  PackageCheck
} from 'lucide-react';

const CheckoutForm = ({ onSubmit, totalAmount }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Steps Header */}
      <div className="flex border-b border-slate-800">
        {[
          { id: 1, label: 'Shipping', icon: Truck },
          { id: 2, label: 'Payment', icon: CreditCard },
          { id: 3, label: 'Confirm', icon: PackageCheck }
        ].map((s) => (
          <div 
            key={s.id}
            className={`flex-1 flex items-center justify-center gap-3 py-6 transition-all ${
              step === s.id ? 'bg-emerald-500/10 text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-500'
            }`}
          >
            <s.icon size={18} className={step >= s.id ? 'text-emerald-500' : ''} />
            <span className="text-sm font-black uppercase tracking-widest hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if(step === 3) onSubmit(formData); else nextStep(); }} className="p-8 md:p-12">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                <MapPin size={20} />
              </div>
              Shipping Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    name="firstName"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter first name"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                <input 
                  name="lastName"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="Enter last name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  name="email"
                  type="email"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="name@example.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
              <input 
                name="address"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:border-emerald-500 outline-none transition-all"
                placeholder="Street address"
                onChange={handleChange}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                <input 
                  name="city"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="City"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Postal Code</label>
                <input 
                  name="postalCode"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:border-emerald-500 outline-none transition-all"
                  placeholder="000000"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-black">
                <CreditCard size={20} />
              </div>
              Payment Method
            </h2>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-[2rem] space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Card Number</label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                  <input 
                    name="cardNumber"
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all"
                    placeholder="0000 0000 0000 0000"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                  <input 
                    name="expiry"
                    required
                    placeholder="MM/YY"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:border-cyan-500 outline-none transition-all"
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">CVV</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
                    <input 
                      name="cvv"
                      type="password"
                      required
                      placeholder="***"
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm">
              <ShieldCheck size={20} />
              <p className="font-medium">Your payment is secured with 256-bit encryption.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-center py-10">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8">
              <PackageCheck size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Ready to place order?</h2>
            <p className="text-slate-400 text-lg">
              Order Total: <span className="text-white font-black text-2xl ml-2">${totalAmount}</span>
            </p>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl text-left max-w-md mx-auto mt-8">
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Shipping To:</p>
              <p className="text-white font-bold">{formData.firstName} {formData.lastName}</p>
              <p className="text-slate-400 text-sm">{formData.address}, {formData.city}, {formData.postalCode}</p>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="mt-12 flex items-center justify-between gap-6">
          {step > 1 ? (
            <button 
              type="button"
              onClick={prevStep}
              className="text-slate-500 hover:text-white font-black uppercase tracking-[0.2em] text-xs transition-colors"
            >
              Go Back
            </button>
          ) : (
            <div />
          )}
          
          <button 
            type="submit"
            className="flex items-center gap-3 bg-emerald-500 hover:bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl shadow-emerald-500/20 group"
          >
            {step === 3 ? 'Place Order' : 'Continue'}
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;
