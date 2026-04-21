import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Cpu, Filter } from 'lucide-react';
import Card from '../components/Card';
import api from '../services/api';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products/active'),
          api.get('/categories')
        ]);

        if (isMounted) {
          if (prodRes.status === 'fulfilled') {
            const data = prodRes.value.data?.data || prodRes.value.data || [];
            setProducts(Array.isArray(data) ? data : []);
          }
          if (catRes.status === 'fulfilled') {
            const data = catRes.value.data?.data || catRes.value.data || [];
            setCategories(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error("Shop Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleCategoryClick = (catId) => {
    if (categoryFilter === String(catId)) searchParams.delete('category');
    else searchParams.set('category', catId);
    setSearchParams(searchParams);
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = categoryFilter ? String(p.category_id) === categoryFilter : true;
    const matchesSearch = searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase drop-shadow-lg">
              Asset <span className="text-purple-500">Directory</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium tracking-tight">Deploy premium infrastructure components</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search components..." 
              value={searchQuery}
              onChange={(e) => {
                if (e.target.value) searchParams.set('q', e.target.value);
                else searchParams.delete('q');
                setSearchParams(searchParams);
              }}
              className="w-full pl-11 pr-4 py-3 bg-[#0a0c10] border border-white/10 rounded-2xl text-sm font-bold tracking-wide outline-none focus:border-purple-500/50 text-white transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-[#0a0c10] border border-white/5 rounded-3xl p-6 sticky top-28 shadow-2xl">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <Filter className="w-4 h-4 text-purple-500" /> System Filters
              </h3>
              
              <div className="space-y-2">
                <button 
                  onClick={() => handleCategoryClick('')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    !categoryFilter ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  All Assets
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      categoryFilter === String(cat.id) ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-[#0a0c10] rounded-3xl border border-white/5">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <span className="text-xs font-mono text-purple-400 uppercase tracking-widest animate-pulse">Syncing Database...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Card key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-[#0a0c10] rounded-3xl border border-white/5 text-center px-6">
                <Cpu className="w-16 h-16 text-gray-700 mb-6" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No Assets Found</h3>
                <p className="text-sm text-gray-500 font-medium max-w-md">No infrastructure components match your current filter parameters. Adjust your search to continue.</p>
                <button onClick={() => setSearchParams({})} className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest transition-all">Clear Filters</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
