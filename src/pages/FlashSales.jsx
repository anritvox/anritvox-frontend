import React, { useState, useEffect } from 'react';
import { flashSales } from '../services/api';
import { Zap, Timer, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FlashSales() {
  const [sales, setSales] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    flashSales.getActive().then(res => setSales(res.data.data || []));
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const updatedTime = {};
      
      sales.forEach(sale => {
        const distance = new Date(sale.end_time).getTime() - now;
        if (distance < 0) return;
        updatedTime[sale.id] = {
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        };
      });
      setTimeLeft(updatedTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [sales.length]);

  return (
    <div className="bg-slate-950 py-12 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-amber-500 rounded-2xl animate-pulse">
            <Zap className="text-black fill-black" size={24} />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic">Live Flash Drops</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sales.map(sale => (
            <div key={sale.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group">
              <div className="relative aspect-square">
                <img src={JSON.parse(sale.images)?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={sale.name} />
                <div className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                  -{Math.round((1 - sale.sale_price / sale.original_price) * 100)}% OFF
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter truncate w-2/3">{sale.name}</h3>
                  <div className="text-right">
                    <p className="text-slate-500 line-through text-xs">₹{sale.original_price}</p>
                    <p className="text-emerald-500 font-black text-xl">₹{sale.sale_price}</p>
                  </div>
                </div>

                {}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>Stock Remaining</span>
                    <span className="text-amber-500">{100 - sale.stock_percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500" 
                      style={{ width: `${sale.stock_percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-rose-500">
                    <Timer size={16} />
                    <span className="font-mono font-bold text-sm">
                      {timeLeft[sale.id]?.h || '0'}h : {timeLeft[sale.id]?.m || '0'}m : {timeLeft[sale.id]?.s || '0'}s
                    </span>
                  </div>
                  <Link to={`/product/${sale.slug}`} className="bg-white text-black px-6 py-2 rounded-xl font-black text-xs uppercase hover:bg-emerald-500 transition-colors">
                    Grab Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
