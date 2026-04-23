import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, ChevronRight, Search, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function FitmentEngine() {
  const [makes, setMakes] = useState(['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Kia']);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [models, setModels] = useState([]);
  const [years, setYears] = useState(['2024', '2023', '2022', '2021', '2020', '2019', '2018']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMakeChange = (make) => {
    setSelectedMake(make);
    // Dynamic Model
    const mockModels = {
      'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Ertiga'],
      'Hyundai': ['Creta', 'Verna', 'i20', 'Venue'],
      'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch'],
      'Mahindra': ['Thar', 'XUV700', 'Scorpio-N']
    };
    setModels(mockModels[make] || []);
    setSelectedModel('');
  };

  const handleSaveGarage = () => {
    if (selectedMake && selectedModel && selectedYear) {
      const garageData = { make: selectedMake, model: selectedModel, year: selectedYear };
      localStorage.setItem('anritvox_garage', JSON.stringify(garageData));
      window.dispatchEvent(new Event('storage')); // Trigger update in other components
      navigate('/shop?fitment=active');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-6">
          <div className="inline-flex p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 text-emerald-500 mb-4 animate-bounce">
            <Car size={48} />
          </div>
          <h1 className="text-7xl font-black uppercase tracking-tighter italic italic leading-none">
            Anritvox <br /> <span className="text-emerald-500">Fitment</span> Engine
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">
            Configure your vehicle to see products guaranteed to fit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Make */}
           <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-4">01 Select Make</label>
             <div className="grid grid-cols-1 gap-2">
               {makes.map(m => (
                 <button 
                  key={m}
                  onClick={() => handleMakeChange(m)}
                  className={`p-6 rounded-3xl border text-left font-black uppercase tracking-tighter transition-all ${
                    selectedMake === m ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-emerald-500/50'
                  }`}
                 >
                   {m}
                 </button>
               ))}
             </div>
           </div>

           {/* Model */}
           <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-4">02 Select Model</label>
             <div className="grid grid-cols-1 gap-2">
               {models.length > 0 ? models.map(m => (
                 <button 
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={`p-6 rounded-3xl border text-left font-black uppercase tracking-tighter transition-all ${
                    selectedModel === m ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-emerald-500/50'
                  }`}
                 >
                   {m}
                 </button>
               )) : (
                 <div className="p-8 text-center text-slate-700 border-2 border-dashed border-slate-900 rounded-3xl font-bold uppercase text-xs">
                   Select Make First
                 </div>
               )}
             </div>
           </div>

           {/* Year */}
           <div className="space-y-4">
             <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest px-4">03 Select Year</label>
             <div className="grid grid-cols-1 gap-2">
               {selectedModel ? years.map(y => (
                 <button 
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`p-6 rounded-3xl border text-left font-black uppercase tracking-tighter transition-all ${
                    selectedYear === y ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-emerald-500/50'
                  }`}
                 >
                   {y}
                 </button>
               )) : (
                 <div className="p-8 text-center text-slate-700 border-2 border-dashed border-slate-900 rounded-3xl font-bold uppercase text-xs">
                   Select Model First
                 </div>
               )}
             </div>
           </div>
        </div>

        {selectedYear && (
          <div className="pt-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center space-x-4 bg-emerald-500/10 px-8 py-4 rounded-full border border-emerald-500/20">
               <CheckCircle size={20} className="text-emerald-500" />
               <span className="font-black uppercase tracking-widest text-sm text-emerald-400">Configuration Verified</span>
            </div>
            <button 
              onClick={handleSaveGarage}
              className="px-20 py-8 bg-emerald-500 text-black font-black text-3xl uppercase tracking-tighter hover:bg-white hover:scale-105 transition-all shadow-[0_0_80px_rgba(16,185,129,0.4)]"
            >
              Enter My Garage <ChevronRight className="inline ml-2" size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
