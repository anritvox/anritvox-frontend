import React from 'react';
import { Minus, Plus, X } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex gap-6 py-6 border-b border-white/5 group transition-all duration-500 hover:bg-white/[0.02] -mx-4 px-4 rounded-2xl">
      <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors shrink-0">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 py-1">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-emerald-400 transition-colors">{item.name}</h3>
            <p className="text-slate-500 text-xs mt-1 font-medium uppercase tracking-widest">{item.category}</p>
          </div>
          <button 
            onClick={() => onRemove(item.id)}
            className="text-slate-600 hover:text-red-500 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1 group-hover:border-white/10 transition-colors">
            <button 
              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-white font-black text-sm">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <div className="text-right">
            <p className="text-emerald-400 font-black text-xl leading-none italic">${(item.price * item.quantity).toFixed(2)}</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 tracking-wider">${item.price.toFixed(2)} / UNIT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
