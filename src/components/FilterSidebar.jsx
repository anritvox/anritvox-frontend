import React, { useState } from 'react';
import { 
  Filter, X, ChevronDown, Zap, Sun, Speaker, 
  DollarSign, Check, RotateCcw, SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSection = ({ title, icon: Icon, children, isOpen, onToggle }) => (
  <div className="border-b border-slate-900 pb-6 mb-6">
    <button 
      onClick={onToggle}
      className="flex items-center justify-between w-full mb-4 group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all">
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white">{title}</span>
      </div>
      <ChevronDown 
        size={16} 
        className={`text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const RangeSlider = ({ label, min, max, unit, value, onChange }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-end">
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="text-xs font-black text-emerald-500 font-mono italic">
        {value}{unit}
      </div>
    </div>
    <div className="relative h-1 bg-slate-900 rounded-full">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div 
        className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full"
        style={{ left: `calc(${((value - min) / (max - min)) * 100}% - 6px)` }}
      />
    </div>
  </div>
);

export default function FilterSidebar({ onFilterChange }) {
  const [openSections, setOpenSections] = useState({
    price: true,
    specs: true,
    categories: true
  });

  const [filters, setFilters] = useState({
    price: 50000,
    lumens: 8000,
    wattage: 150,
    rms: 1200,
    categories: []
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleCategory = (cat) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    updateFilter('categories', newCats);
  };

  const resetFilters = () => {
    const defaults = { price: 50000, lumens: 8000, wattage: 150, rms: 1200, categories: [] };
    setFilters(defaults);
    onFilterChange?.(defaults);
  };

  return (
    <div className="w-full lg:w-80 bg-slate-950/50 backdrop-blur-3xl border border-slate-900 rounded-[2.5rem] p-8 h-fit sticky top-32">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <SlidersHorizontal size={20} className="text-emerald-500" />
          <h2 className="text-lg font-black uppercase tracking-tighter">Filters</h2>
        </div>
        <button 
          onClick={resetFilters}
          className="p-2 hover:bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="custom-scrollbar pr-2">
        <FilterSection 
          title="Price Range" 
          icon={DollarSign} 
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
        >
          <RangeSlider 
            label="Max Budget" 
            min={1000} 
            max={100000} 
            unit="₹" 
            value={filters.price} 
            onChange={(v) => updateFilter('price', v)}
          />
        </FilterSection>

        <FilterSection 
          title="Advanced Specs" 
          icon={Zap} 
          isOpen={openSections.specs}
          onToggle={() => toggleSection('specs')}
        >
          <div className="space-y-8">
            <RangeSlider 
              label="Brightness (Lumens)" 
              min={1000} 
              max={20000} 
              unit=" lm" 
              value={filters.lumens} 
              onChange={(v) => updateFilter('lumens', v)}
            />
            <RangeSlider 
              label="Power (Wattage)" 
              min={20} 
              max={500} 
              unit="W" 
              value={filters.wattage} 
              onChange={(v) => updateFilter('wattage', v)}
            />
            <RangeSlider 
              label="RMS Power Output" 
              min={50} 
              max={5000} 
              unit=" RMS" 
              value={filters.rms} 
              onChange={(v) => updateFilter('rms', v)}
            />
          </div>
        </FilterSection>

        <FilterSection 
          title="Categories" 
          icon={Filter} 
          isOpen={openSections.categories}
          onToggle={() => toggleSection('categories')}
        >
          <div className="grid grid-cols-1 gapAdd FilterSidebar with advanced spec sliders (Lumens, Wattage, RMS)
            {['LED Headlights', 'Basstubes', 'Amplifiers', 'Android Players', 'Wiring Kits'].map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`group flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  filters.categories.includes(cat)
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{cat}</span>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  filters.categories.includes(cat)
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-700'
                }`}>
                  {filters.categories.includes(cat) && <Check size={10} className="text-black" />}
                </div>
              </button>
            ))}
          </div>
        </FilterSection>
      </div>

      <button className="w-full mt-8 py-5 bg-emerald-500 text-black font-black uppercase tracking-tighter rounded-2xl hover:bg-white transition-all shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
        Apply Filters
      </button>
    </div>
  );
}
