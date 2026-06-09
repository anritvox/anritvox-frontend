import React, { useState } from 'react';
import { Ruler, X } from 'lucide-react';

const sizeData = [
  { size: 'XS', chest: '32-34', waist: '26-28', hips: '34-36' },
  { size: 'S',  chest: '34-36', waist: '28-30', hips: '36-38' },
  { size: 'M',  chest: '36-38', waist: '30-32', hips: '38-40' },
  { size: 'L',  chest: '38-40', waist: '32-34', hips: '40-42' },
  { size: 'XL', chest: '40-42', waist: '34-36', hips: '42-44' },
  { size: 'XXL',chest: '42-44', waist: '36-38', hips: '44-46' },
];

export default function SizeChart() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors"
      >
        <Ruler size={14} /> Size Chart
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Ruler size={20} /> Size Guide (inches)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 rounded-xl">
                    {['Size','Chest','Waist','Hips'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-black text-gray-900">{row.size}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{row.chest}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{row.waist}</td>
                      <td className="px-4 py-3 text-gray-600 font-medium">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-[11px] text-gray-400 font-bold italic">All measurements are in inches. If between sizes, size up for comfort.</p>
          </div>
        </div>
      )}
    </>
  );
}
