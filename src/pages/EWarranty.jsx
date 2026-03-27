import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  ArrowRight,
  Printer,
  ExternalLink
} from 'lucide-react';
import api, { BASE_URL } from '../services/api';

export default function EWarranty() {
  const [serial, setSerial] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState('');
  const [registrationId, setRegistrationId] = useState(null);
  const [registrationDate, setRegistrationDate] = useState(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    purchaseDate: '',
    invoiceNumber: ''
  });

  const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

  const handleCheckSerial = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.get(`/warranty/validate/${encodeURIComponent(serial)}`);
      const data = response.data;

      if (data.status === 'registered') {
        setError('This product is already registered for warranty.');
      } else {
        setProductData(data);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Serial number not found in our database.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        serialNumber: serial,
        productId: productData.product_id,
        ...formData
      };
      
      const response = await api.post('/warranty/register', payload);
      
      // Save registration data for the certificate
      setRegistrationId(response.data.registration_id || Math.floor(100000 + Math.random() * 900000));
      setRegistrationDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      setStep(3);
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 font-sans print:bg-white print:py-0 print:px-0">
      
      {/* Print-specific styles to hide navbar/footer and format the page */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #certificate-area, #certificate-area * {
              visibility: visible;
            }
            #certificate-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            /* Hide print button during printing */
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
        
        {step !== 3 && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 mb-6">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">E-Warranty Activation</h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Protect your premium Anritvox investment. Activate your official manufacturer warranty in seconds.
            </p>
          </div>
        )}

        {step !== 3 && (
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
        )}

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
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                  <AlertCircle size={20} />
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Validate Serial Number'}
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {step === 2 && productData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Product Found</p>
                <img 
                  src={
                    productData.images?.[0] 
                      ? (productData.images[0].startsWith('http') 
                          ? productData.images[0] 
                          : `${BASE_URL}/${productData.images[0].replace(/^[\/\\]/, '').startsWith('uploads/') ? '' : 'uploads/'}${productData.images[0].replace(/^[\/\\]/, '')}`)
                      : FALLBACK_IMAGE
                  } 
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
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Customer Details</h2>
                
                {error && (
                  <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                    <AlertCircle size={20} />
                    <span className="font-medium text-sm">{error}</span>
                  </div>
                )}

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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex justify-center items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Activate Warranty'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            
            <div className="no-print bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600" size={28} />
                <div>
                  <h3 className="font-bold text-lg">Registration Successful!</h3>
                  <p className="text-sm opacity-80">Your product is now officially protected.</p>
                </div>
              </div>
              <button 
                onClick={() => window.print()} 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all whitespace-nowrap"
              >
                <Printer size={20} /> Print / Download Certificate
              </button>
            </div>

            {/* The Certificate Container */}
            <div id="certificate-area" className="bg-white p-2 md:p-8 print:p-0">
              <div className="border-[12px] border-double border-slate-800 p-6 md:p-12 rounded-lg relative overflow-hidden bg-white min-h-[800px] flex flex-col justify-between">
                
                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                   <img src="/logo.webp" alt="Watermark" className="w-[80%] max-w-[600px] grayscale" />
                </div>

                <div>
                  {/* Certificate Header */}
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 border-slate-200 pb-8 mb-8 text-center md:text-left relative z-10">
                    <img src="/logo.webp" alt="Anritvox Logo" className="h-16 md:h-20 mb-4 md:mb-0" />
                    <div className="md:text-right">
                      <h1 className="text-3xl md:text-4xl font-serif text-slate-800 tracking-widest font-bold uppercase">E-Warranty</h1>
                      <p className="text-yellow-600 font-bold tracking-widest uppercase text-sm md:text-md mt-1">Certificate of Authenticity</p>
                      <p className="text-slate-500 text-xs mt-2 font-mono bg-slate-100 inline-block px-3 py-1 rounded">REG ID: ANR-{registrationId}</p>
                    </div>
                  </div>

                  {/* Certificate Body */}
                  <div className="text-center py-6 relative z-10">
                    <p className="text-slate-500 italic text-lg mb-2">This is to certify that the premium product</p>
                    <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-wide">{productData.product_name}</h2>
                    <p className="text-slate-500 italic text-lg mt-8 mb-2">has been successfully registered and is protected by the official warranty of</p>
                    <h3 className="text-2xl font-bold text-slate-800 uppercase border-b border-slate-300 inline-block pb-1 px-8">{formData.customerName}</h3>
                  </div>

                  {/* Certificate Details Grid */}
                  <div className="mt-12 grid grid-cols-2 gap-y-6 gap-x-12 max-w-3xl mx-auto relative z-10">
                    <div className="col-span-2 md:col-span-1 border-b border-dotted border-slate-300 pb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Serial Number</p>
                      <p className="font-mono text-slate-800 font-bold text-lg">{serial}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 border-b border-dotted border-slate-300 pb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Warranty Period</p>
                      <p className="text-slate-800 font-bold text-lg text-yellow-600">{productData.warranty_period} Months</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 border-b border-dotted border-slate-300 pb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Registration</p>
                      <p className="text-slate-800 font-bold">{registrationDate}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1 border-b border-dotted border-slate-300 pb-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Invoice Reference</p>
                      <p className="text-slate-800 font-bold">{formData.invoiceNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Footer */}
                <div className="mt-16 pt-8 border-t-2 border-slate-200 flex flex-col md:flex-row justify-between items-end relative z-10">
                  <div className="text-left mb-6 md:mb-0">
                    <div className="flex items-center gap-2 text-slate-800 font-bold mb-1">
                      <ExternalLink size={16} className="text-blue-600"/> 
                      <a href="https://www.anritvox.com" target="_blank" rel="noreferrer" className="hover:underline">www.anritvox.com</a>
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                      This digital certificate verifies the authenticity of your product. For support, warranty claims, and exclusive accessories, visit our official website.
                    </p>
                  </div>

                  <div className="text-center text-slate-800">
                    <div className="font-signature text-3xl text-slate-800 mb-2 italic">Anritvox Auth</div>
                    <div className="w-48 h-px bg-slate-800 mx-auto mb-2"></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Authorized Signatory</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="no-print text-center pt-8">
               <a href="/" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center justify-center gap-2">
                 Return to Homepage <ArrowRight size={16} />
               </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
