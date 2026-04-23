import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/category/${category.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800/50 transition-all duration-700 hover:border-emerald-500/30 hover:shadow-[0_0_80px_-20px_rgba(16,185,129,0.15)]"
    >
      {/* Background Image */}
      <img 
        src={category.image} 
        alt={category.name}
        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
      
      {/* Top Badge */}
      <div className="absolute top-6 left-6 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
          <Sparkles size={10} />
          <span>New Collection</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-8 transform transition-transform duration-500 group-hover:translate-y-[-8px]">
        <div className="relative z-10">
          <span className="block text-emerald-500 text-xs font-black uppercase tracking-[0.3em] mb-3">
            {category.count}+ Products
          </span>
          <h3 className="text-3xl font-black text-white leading-tight mb-4 tracking-tighter group-hover:text-emerald-500 transition-colors duration-300">
            {category.name}
          </h3>
          
          <div className="flex items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
            <span>Explore Collection</span>
            <ArrowRight size={16} className="text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="absolute inset-0 border-[3px] border-emerald-500/0 rounded-[2.5rem] transition-all duration-700 group-hover:border-emerald-500/10 group-hover:m-2" />
    </Link>
  );
};

export default CategoryCard;
