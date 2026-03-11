import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiEye, FiCheckCircle, FiClock, FiXCircle, FiFilter, FiSearch } from "react-icons/fi";

export default function OrderManagement({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = () => {
      try {
        const storedOrders = JSON.parse(localStorage.getItem("admin_orders") || "[]");
        setOrders(storedOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const updateStatus = (orderId, status) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem("admin_orders", JSON.stringify(updated));
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
      o.customerName?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Order Management
          </h1>
          <p className="text-gray-400 mt-1">Manage and track customer purchases</p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#121620] p-1 rounded-xl border border-white/5">
          {["all", "pending", "shipped", "delivered"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: orders.length, icon: FiShoppingCart, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pending", value: orders.filter(o => o.status === "pending").length, icon: FiClock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, icon: FiCheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Revenue", value: `₹${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}`, icon: FiCheckCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0d1117] border border-white/5 p-4 rounded-2xl hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1 text-white group-hover:text-cyan-400 transition-colors">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={stat.color} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              className="w-full bg-[#161b22] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs font-medium uppercase tracking-wider">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-cyan-400">#{order.id.slice(-6)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "delivered" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      order.status === "shipped" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-white">₹{order.total?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white/5 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 rounded-lg transition-all">
                        <FiEye size={16} />
                      </button>
                      <button className="p-2 bg-white/5 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-400 rounded-lg transition-all">
                        <FiCheckCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <FiShoppingCart size={40} className="text-gray-700" />
                      <p>No orders found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
