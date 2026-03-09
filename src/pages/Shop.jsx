import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../services/api";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 16;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, sortOption]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        <p className="text-xl animate-pulse font-bold">Loading Anritvox Products...</p>
      </div>
    );
  }

  const categoryOptions = Array.from(new Set(products.map((p) => p.category_name).filter(Boolean)));
  
  const subcategoryOptions = Array.from(
    new Set(
      products
        .filter((p) => (selectedCategory ? p.category_name === selectedCategory : true))
        .map((p) => p.subcategory_name)
        .filter(Boolean)
    )
  );

  let filtered = products
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => (selectedCategory ? p.category_name === selectedCategory : true))
    .filter((p) => (selectedSubcategory ? p.subcategory_name === selectedSubcategory : true));

  if (sortOption === "priceAsc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortOption === "priceDesc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  const totalPages = Math.ceil(filtered.length / productsPerPage);
  const currentProducts = filtered.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans antialiased">
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row gap-6 p-4">
        
        {/* Amazon-style Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white p-4 border rounded-sm shadow-sm self-start">
          <h3 className="font-bold text-sm mb-3 border-b pb-2">Department</h3>
          <ul className="space-y-2 text-sm text-[#007185]">
            <li 
              className={`cursor-pointer hover:text-[#c45500] ${!selectedCategory ? 'font-bold text-black' : ''}`}
              onClick={() => { setSelectedCategory(""); setSelectedSubcategory(""); }}
            >
              All Departments
            </li>
            {categoryOptions.map(cat => (
              <li 
                key={cat} 
                className={`cursor-pointer hover:text-[#c45500] ${selectedCategory === cat ? 'font-bold text-black' : ''}`}
                onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(""); }}
              >
                {cat}
              </li>
            ))}
          </ul>

          <h3 className="font-bold text-sm mt-6 mb-3 border-b pb-2">Avg. Customer Review</h3>
          <div className="space-y-2">
            {[4,3,2,1].map(star => (
              <div key={star} className="flex items-center gap-2 cursor-pointer text-sm hover:text-[#c45500]">
                <span className="text-[#ffa41c] font-bold">
                  {"★".repeat(star)}{"☆".repeat(5-star)}
                </span>
                <span className="text-gray-700">& Up</span>
              </div>
            ))}
          </div>

          <h3 className="font-bold text-sm mt-6 mb-3 border-b pb-2">Price</h3>
          <ul className="space-y-2 text-sm text-[#007185]">
             <li className="cursor-pointer hover:text-[#c45500]">Under ₹5,000</li>
             <li className="cursor-pointer hover:text-[#c45500]">₹5,000 - ₹10,000</li>
             <li className="cursor-pointer hover:text-[#c45500]">₹10,000 - ₹20,000</li>
             <li className="cursor-pointer hover:text-[#c45500]">Over ₹20,000</li>
          </ul>
        </aside>

        {/* Main Product Feed */}
        <main className="flex-1">
          {/* Results Info Bar */}
          <div className="bg-white border p-3 mb-4 rounded-sm shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm">
              1-{currentProducts.length} of {filtered.length} results for <span className="text-[#c45500] font-bold">"{searchTerm || 'All Products'}"</span>
            </span>
            <div className="flex items-center gap-2">
               <label className="text-xs text-gray-600">Sort by:</label>
               <select 
                className="text-xs bg-gray-100 border rounded-md px-2 py-1 outline-none hover:bg-gray-200 cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentProducts.map((p) => (
              <div key={p.id} className="bg-white border rounded-sm p-4 flex flex-col hover:shadow-lg transition-shadow duration-200 group">
                <Link to={`/shop/${p.id}`} className="h-52 flex items-center justify-center mb-4 relative overflow-hidden">
                  <img 
                    src={p.images?.[0] || "https://placehold.co/400x400?text=No+Image"} 
                    alt={p.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/shop/${p.id}`} className="text-[#007185] hover:text-[#c45500] font-medium text-sm line-clamp-3 mb-1 leading-snug">
                    {p.name}
                  </Link>
                  <div className="flex items-center gap-1 mb-1">
                    <div className="flex text-[#ffa41c] text-xs">★★★★★</div>
                    <span className="text-xs text-[#007185] font-medium">2,308</span>
                  </div>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-xs font-bold self-start mt-1">₹</span>
                    <span className="text-2xl font-medium">{Math.floor(p.price).toLocaleString()}</span>
                    <span className="text-xs font-bold">00</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    M.R.P: <span className="line-through">₹{(p.price * 1.4).toFixed(0)}</span> (40% off)
                  </div>
                  <p className="text-xs mt-3 font-bold text-gray-900">Get it by Tomorrow</p>
                  <p className="text-xs text-gray-600">FREE Delivery by Anritvox</p>
                </div>
                <button className="mt-4 bg-[#ffd814] hover:bg-[#f7ca00] text-black text-xs py-2 rounded-full font-medium border border-[#fcd200] transition-colors shadow-sm">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 mb-8">
              <div className="flex border rounded-md overflow-hidden bg-white shadow-sm">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 border-r last:border-r-0 text-sm ${currentPage === i + 1 ? 'bg-gray-100 font-bold' : 'hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
