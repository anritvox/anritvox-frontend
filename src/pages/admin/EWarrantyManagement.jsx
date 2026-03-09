import React, { useState, useEffect } from "react";
import { fetchWarrantyAdmin, updateWarrantyAdmin, deleteWarrantyAdmin } from "../../services/api";
import { 
  Loader2, Search, Trash2, Edit3, CheckCircle, Clock, XCircle, 
  ChevronDown, Filter, FileText, Download, User, ShieldCheck
} from "lucide-react";

export default function EWarrantyManagement({ token }) {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWarrantyAdmin(token);
      setWarranties(data);
    } catch (err) {
      console.error("Warranty load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this warranty record?")) {
      try {
        await deleteWarrantyAdmin(id, token);
        loadData();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const filteredWarranties = warranties.filter(w => {
    const matchesSearch = w.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         w.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="h-10 w-10 text-[#c45500] animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Retrieving security records...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#232f3e] rounded-xl shadow-lg">
            <ShieldCheck className="h-8 w-8 text-[#febd69]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#111]">E-Warranty Database</h2>
            <p className="text-xs text-gray-500 font-medium">Protecting customer purchases through registration</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
          <Download className="h-4 w-4" /> Export records
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#d5d9d9] flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by customer or serial number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#888c8c] rounded-[3px] focus:shadow-[0_0_0_3px_rgba(0,113,133,.5)] focus:border-[#007185] outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-[#888c8c] rounded-[3px] text-sm bg-white focus:border-[#007185] outline-none"
          >
            <option value="all">All Records</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-[#d5d9d9] rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f0f2f2] border-b border-[#e7e9ec]">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Customer Details</th>
                <th className="px-6 py-4 font-bold text-gray-700">Serial Number</th>
                <th className="px-6 py-4 font-bold text-gray-700">Purchase Date</th>
                <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWarranties.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-gray-400 group-hover:bg-[#febd69] group-hover:text-[#131921] transition-colors">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#007185] group-hover:text-[#c45500] transition-colors">{w.customer_name}</div>
                        <div className="text-[10px] text-gray-400 font-mono tracking-tighter">{w.customer_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-600">{w.serial_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">{new Date(w.purchase_date).toLocaleDateString()}</span>
                      <span className="text-[10px] text-gray-400">Via {w.purchase_source || 'Direct'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      w.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                      w.status === 'expired' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                      {w.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-[#007185] hover:underline font-bold text-xs uppercase tracking-tighter">Edit</button>
                    <button 
                      onClick={() => handleDelete(w.id)}
                      className="text-[#af2a2a] hover:underline font-bold text-xs uppercase tracking-tighter"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredWarranties.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <FileText className="h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-gray-500 font-medium italic">No warranty records match your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-[#f0f2f2] p-4 flex items-center justify-between border-t border-[#e7e9ec]">
          <p className="text-xs text-gray-500 font-medium">Showing {filteredWarranties.length} of {warranties.length} records</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm text-xs font-bold hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded shadow-sm text-xs font-bold hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
