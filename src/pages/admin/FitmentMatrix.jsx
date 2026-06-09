import React from 'react';
import { Wrench } from 'lucide-react';

export default function FitmentMatrix() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-white flex items-center gap-2">
        <Wrench className="text-emerald-500" /> Compatibility Matrix (Fitment)
      </h2>
      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl flex items-center justify-center h-64">
        <p className="text-slate-500 font-mono text-sm">Fitment Engine Mounted. Awaiting vehicle data integration...</p>
      </div>
    </div>
  );
}
