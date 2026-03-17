import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Cpu, 
  Award,
  ArrowRight,
  Download
} from 'lucide-react';
import { checkSerialAvailability, registerWarranty } from '../services/api';

export default function EWarranty() {
  const [serial, setSerial] = useState('');
  const [step, setStep] = useState(1); // 1: Check, 2: Register, 3: Success
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    purchaseDate: '',
    invoiceNumber: ''
  });

  const handleCheckSerial = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // In your api.js, ensure checkSerialAvailability calls GET /api/serials/check/:serial
      const data = await checkSerialAvailability(serial);
      
      if (data.status === 'registered') {
        setError('This product is already registered for warranty.');
      } else {
        setProductData(data);
        setStep(2);
      }
    } catch (err) {
      setError(err.message || 'Serial number not found in our database.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWarranty({
        serialNumber: serial,
        productId: productData.product_id,
        ...formData
      });
      setStep(3);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">E-Warranty Activation</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Protect your premium Anritvox investment. Activate your official manufacturer warranty in seconds.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-10 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                step >= i ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > i ? <CheckCircle size={16} /> : i}
              </div>
              {i < 3 && <div className={`w-12 h-1 ${step > i ? 'bg-blue-600' : 'bg-slate-200'} mx-2 rounded-full transition-all duration-500`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Verification */}
        {step === 1 && (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Search className="text-blue-600" /> Verify Your Product
            </h2>
            <form onSubmit={handleCheckSerial} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Serial Number (S/N)</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={serial}
                    onChange={(e) => setSerial(e.target.value.toUpperCase())}
                    placeholder="e.g. AV-2405-7X2P9"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-mono focus:border-blue-500 focus:bg-white outline-none transition-all"
                    required
                  />
                  <div className="absolute right-4 top-4 text-slate-400">
                    <Cpu size={24} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-400">You can find the serial number on the product packaging or the device body.</p>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-shake">
                  <AlertCircle size={20} />
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Validate Serial Number'}
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Registration */}
        {step === 2 && productData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Product Found</p>
                <img 
                  src={productData.images?.[0] || 'https://via.placeholder.com/300'} 
                  alt={productData.product_name}
                  className="w-full aspect-square object-contain bg-slate-50 rounded-2xl mb-4"
                />
                <h3 className="font-bold text-slate-900 leading-tight">{productData.product_name}</h3>
                <p className="text-sm text-slate-500 mt-2">{productData.brand}</p>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Warranty</span>
                    <span className="font-bold text-slate-800">{productData.warranty_period} Months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Batch</span>
                    <span className="font-mono text-slate-800">{productData.batch_number || 'Standard'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Customer Details</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Purchase Date</label>
                      <input 
                        type="date" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Invoice No.</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Activating...' : 'Activate Warranty'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success Certificate */}
        {step === 3 && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
            <div className="bg-slate-900 p-8 text-center text-white">
              <Award className="mx-auto mb-4 text-blue-400" size={64} />
              <h2 className="text-3xl font-bold">Warranty Activated</h2>
              <p className="text-slate-400 mt-2">Product Serial: <span className="font-mono text-white">{serial}</span></p>
            </div>
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center border-b border-dashed border-slate-200 pb-10 mb-10">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle />
                    <span className="font-bold text-lg">Manufacturer Protection Active</span>
                  </div>
                  <p className="text-slate-600">
                    Thank you, <span className="font-bold text-slate-900">{formData.customerName}</span>. Your {productData.product_name} is now covered under our official warranty program.
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl text-center min-w-[200px]">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Valid Until</p>
                  <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-xl">
                    <Calendar className="text-blue-600" size={20} />
                    {new Date(new Date(formData.purchaseDate).setMonth(new Date(formData.purchaseDate).getMonth() + productData.warranty_period)).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <Download size={20} /> Download PDF
                </button>
                <button 
                  onClick={() => window.location.href = '/shop'}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
