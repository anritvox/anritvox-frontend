import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowRight, 
  Filter, 
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List,
  Eye,
  Zap
} from 'lucide-react';
import Card from './Card';
import SkeletonLoader from './SkeletonLoader';

const ProductGrid = ({ products = [], isLoading = false }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <SkeletonLoader key={i} type="product" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
          <span className="text-slate-500 text-sm font-medium">
            Showing <span className="text-white">{products.length}</span> results
          </span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-48 bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Best Rating</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
          
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline font-medium">Filters</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className={`grid gap-8 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {products.map((product) => (
          <div 
            key={product.id} 
            className={`group transition-all duration-500 ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-8 bg-slate-900/40 rounded-3xl p-6 border border-slate-800/50' : ''}`}
          >
            <div className={`${viewMode === 'list' ? 'md:w-72 shrink-0' : 'w-full'} relative aspect-square overflow-hidden rounded-2xl bg-slate-800`}>
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                    New
                  </span>
                )}
                {product.discount && (
                  <span className="bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-950/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all duration-300 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                <Heart size={18} />
              </button>
              
              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:bg-white transition-colors shadow-xl transform translate-y-4 group-hover:translate-y-0 duration-300">
                  <ShoppingBag size={20} />
                </button>
                <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-xl transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <div className={`flex flex-col ${viewMode === 'list' ? 'justify-center py-4' : 'mt-6'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"} 
                      className={i < Math.floor(product.rating) ? "" : "text-slate-600"}
                    />
                  ))}
                </div>
                <span className="text-slate-500 text-xs font-bold">({product.reviews})</span>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-emerald-500 transition-colors">
                {product.name}
              </h3>
              
              <p className={`text-slate-400 text-sm leading-relaxed mb-4 line-clamp-2 ${viewMode === 'grid' ? 'hidden sm:block' : ''}`}>
                {product.description}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-emerald-500 font-black text-2xl tracking-tighter">
                    ${product.price}
                  </span>
                  {product.oldPrice && (
                    <span className="text-slate-500 text-sm line-through decoration-slate-600">
                      ${product.oldPrice}
                    </span>
                  )}
                </div>
                
                {viewMode === 'list' && (
                  <button className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs border border-emerald-500/20 hover:bg-emerald-500 hover:text-black transition-all group/btn">
                    Add to Cart
                    <Zap size={14} className="group-hover/btn:fill-current" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Placeholder */}
      <div className="mt-20 flex justify-center">
        <nav className="flex items-center gap-2">
          <button className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:border-emerald-500 transition-colors disabled:opacity-50" disabled>
            <ArrowRight size={20} className="rotate-180" />
          </button>
          {[1, 2, 3, '...', 12].map((page, i) => (
            <button 
              key={i}
              className={`w-12 h-12 rounded-xl border font-bold transition-all ${
                page === 1 
                  ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
          <button className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:border-emerald-500 transition-colors">
            <ArrowRight size={20} />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProductGrid;
