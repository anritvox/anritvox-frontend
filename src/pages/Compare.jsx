import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import { useCart } from '../context/CartContext';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
const FALLBACK = 'https://via.placeholder.com/200x200?text=No+Image';

function getImg(product) {
  const raw = product.images || product.image || [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const img = arr[0];
  if (!img) return FALLBACK;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  const clean = img.replace(/^\//, '');
  return `${BASE_URL.replace(/\/$/, '')}/${clean.startsWith('uploads/') ? clean : 'uploads/' + clean}`;
}

const MAX_COMPARE = 4;

export default function Compare() {
  const [products, setProducts] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addToCompare = (product) => {
    if (compareList.length >= MAX_COMPARE) return;
    if (!compareList.find(p => (p.id || p._id) === (product.id || product._id))) {
      setCompareList(prev => [...prev, product]);
    }
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(p => (p.id || p._id) !== id));
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const attrs = [
    { key: 'price', label: 'Price', render: p => `₹${Number(p.discount_price || p.price || 0).toLocaleString()}` },
    { key: 'original_price', label: 'Original Price', render: p => p.discount_price ? `₹${Number(p.price || 0).toLocaleString()}` : '-' },
    { key: 'discount', label: 'Discount', render: p => {
      if (!p.discount_price || !p.price) return '-';
      return `${Math.round(((p.price - p.discount_price) / p.price) * 100)}%`;
    }},
    { key: 'brand', label: 'Brand', render: p => p.brand || 'Anritvox' },
    { key: 'category', label: 'Category', render: p => p.category?.name || p.category || '-' },
    { key: 'stock', label: 'Availability', render: p => (
      <span className={p.quantity > 0 ? 'text-green-400' : 'text-red-400'}>
        {p.quantity > 0 ? `In Stock (${p.quantity})` : 'Out of Stock'}
      </span>
    )},
    { key: 'warranty', label: 'Warranty', render: p => p.warranty || '1 Year' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Compare Products</h1>
          <p className="text-gray-400 mt-1">Add up to {MAX_COMPARE} products to compare side by side</p>
        </div>

        {/* Search & Add */}
        <div className="bg-gray-900 rounded-2xl p-5 mb-8 border border-gray-800">
          <h3 className="text-white font-semibold mb-3">Search products to add</h3>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name..."
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-cyan-500 outline-none mb-4"
          />
          {search && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {filteredProducts.slice(0, 9).map(p => {
                const pid = p.id || p._id;
                const inList = compareList.find(cp => (cp.id || cp._id) === pid);
                return (
                  <div key={pid} className="flex items-center gap-2 bg-gray-800 rounded-xl p-2">
                    <img src={getImg(p)} alt={p.name} className="w-10 h-10 object-contain bg-white rounded-lg flex-shrink-0" onError={e => e.target.src = FALLBACK} />
                    <span className="text-white text-sm flex-1 truncate">{p.name}</span>
                    <button
                      onClick={() => inList ? removeFromCompare(pid) : addToCompare(p)}
                      className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors flex-shrink-0 ${
                        inList ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                      }`}
                    >
                      {inList ? 'Remove' : 'Add'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {compareList.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl p-16 text-center border border-gray-800">
            <div className="text-6xl mb-4">🔄</div>
            <h3 className="text-xl font-bold text-white mb-2">No products to compare</h3>
            <p className="text-gray-400 mb-6">Search for products above and add them to start comparing.</p>
            <Link to="/shop" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-gray-900 text-left p-4 text-gray-400 text-sm font-semibold w-40 sticky left-0 z-10 border-b border-gray-800">Feature</th>
                  {compareList.map(p => {
                    const pid = p.id || p._id;
                    return (
                      <th key={pid} className="bg-gray-900 p-4 border-b border-gray-800 min-w-[200px]">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => removeFromCompare(pid)}
                            className="self-end text-gray-500 hover:text-red-400 text-xs mb-1"
                          >
                            ✕ Remove
                          </button>
                          <img src={getImg(p)} alt={p.name} className="w-20 h-20 object-contain bg-white rounded-xl" onError={e => e.target.src = FALLBACK} />
                          <Link to={`/product/${pid}`} className="text-white font-semibold text-sm text-center hover:text-cyan-400 line-clamp-2">
                            {p.name}
                          </Link>
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors w-full"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {attrs.map(attr => (
                  <tr key={attr.key} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="bg-gray-900/80 p-4 text-gray-400 text-sm font-medium sticky left-0 z-10">{attr.label}</td>
                    {compareList.map(p => (
                      <td key={p.id || p._id} className="p-4 text-white text-sm text-center">
                        {attr.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
