import React, { useState, useEffect } from "react";
import { FiImage, FiPlus, FiTrash2, FiSave, FiAlertCircle } from "react-icons/fi";

export default function BannerManagement({ token }) {
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({ image: "", link: "", title: "" });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("admin_banners") || "[]");
    setBanners(stored);
  }, []);

  const addBanner = () => {
    if (!newBanner.image) return;
    const updated = [...banners, { ...newBanner, id: Date.now() }];
    setBanners(updated);
    localStorage.setItem("admin_banners", JSON.stringify(updated));
    setNewBanner({ image: "", link: "", title: "" });
  };

  const removeBanner = (id) => {
    const updated = banners.filter(b => b.id !== id);
    setBanners(updated);
    localStorage.setItem("admin_banners", JSON.stringify(updated));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Banner Management
        </h1>
        <p className="text-gray-400 mt-1">Control hero sliders and promotional banners</p>
      </div>

      <div className="bg-[#0d1117] border border-white/5 p-6 rounded-2xl mb-8">
        <h2 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
          <FiPlus className="text-cyan-400" /> Add New Hero Slide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Image URL (Direct link)"
            className="bg-[#161b22] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            value={newBanner.image}
            onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })}
          />
          <input
            type="text"
            placeholder="Link URL (Optional)"
            className="bg-[#161b22] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
            value={newBanner.link}
            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
          />
          <input
            type="text"
            placeholder="Banner Title (Optional)"
            className="bg-[#161b22] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all md:col-span-2"
            value={newBanner.title}
            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
          />
        </div>
        <button
          onClick={addBanner}
          className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
        >
          Add to Slider
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {banners.length > 0 ? banners.map((banner) => (
          <div key={banner.id} className="relative group bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all">
            <img src={banner.image} alt={banner.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="text-sm font-bold text-white truncate">{banner.title || "Untitled Banner"}</h3>
              <p className="text-xs text-gray-500 truncate mt-1">{banner.link || "No link"}</p>
            </div>
            <button
              onClick={() => removeBanner(banner.id)}
              className="absolute top-2 right-2 p-2 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        )) : (
          <div className="col-span-full border-2 border-dashed border-white/5 rounded-2xl py-12 flex flex-col items-center text-gray-600">
            <FiImage size={48} className="mb-3 opacity-20" />
            <p>No active banners. Add one above.</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
        <FiAlertCircle className="text-yellow-400 mt-0.5" />
        <p className="text-xs text-yellow-200/80 leading-relaxed">
          <strong>Pro Tip:</strong> Ensure images are optimized (recommended size: 1920x600 for wide desktop) and use direct links from CDNs like Cloudinary or Imgur for best performance.
        </p>
      </div>
    </div>
  );
}
