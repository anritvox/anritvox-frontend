import React, { useState, useEffect, useCallback } from "react";
import { fetchContactsAdmin } from "../../services/api";
import {
  Loader2, Mail, Phone, MessageSquare, Search, Trash2,
  RefreshCw, User, Calendar, Eye, X, CheckCircle
} from "lucide-react";

export default function ContactManagement({ token }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContactsAdmin(token);
      setContacts(data || []);
    } catch (err) {
      console.error("Contact load error:", err);
      setError(err.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-cyan-400" size={32} />
      <span className="ml-3 text-gray-400 font-mono text-sm">Loading messages...</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-red-400 font-mono text-sm">Error: {error}</div>
      <button onClick={loadData} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl text-sm hover:bg-cyan-500/30 transition-all">
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Message <span className="text-cyan-400">Inbox</span></h1>
          <p className="text-gray-500 text-sm mt-1">Customer contact submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            {contacts.length} total messages
          </span>
          <button
            onClick={loadData}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-400 rounded-xl transition-all"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Messages", val: contacts.length, icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-500/5" },
          { label: "Today", val: contacts.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length, icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/5" },
          { label: "Unique Customers", val: new Set(contacts.map(c => c.email)).size, icon: User, color: "text-emerald-400", bg: "bg-emerald-500/5" },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} border border-white/5 rounded-2xl p-4 flex items-center gap-4`}>
            <stat.icon size={20} className={stat.color} />
            <div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.val}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          placeholder="Search by name, email, or message..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full bg-[#0a0c10] border border-white/10 rounded-2xl pl-12 pr-6 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm placeholder:text-gray-700"
        />
      </div>

      {/* Table */}
      <div className="space-y-2">
        {currentRecords.length === 0 ? (
          <div className="text-center text-gray-600 py-16">No messages found.</div>
        ) : (
          currentRecords.map((c, i) => (
            <div key={i} className="bg-white/3 border border-white/5 rounded-2xl p-4 flex items-start justify-between gap-4 hover:border-white/10 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User size={13} className="text-cyan-400 shrink-0" />
                  <span className="text-sm font-semibold text-white">{c.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1"><Mail size={11} />{c.email}</span>
                  {c.phone && <span className="flex items-center gap-1"><Phone size={11} />{c.phone}</span>}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">{c.message}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-gray-600">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                </span>
                <button
                  onClick={() => setSelectedContact(c)}
                  className="p-2 bg-white/5 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-all"
                >
                  <Eye size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-mono transition-all ${
                currentPage === i + 1 ? "bg-cyan-500 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* View Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0f14] border border-white/10 rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Message Detail</h3>
              <button onClick={() => setSelectedContact(null)} className="text-gray-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Name</div>
                <div className="text-white font-medium">{selectedContact.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Email</div>
                <div className="text-cyan-400">{selectedContact.email}</div>
              </div>
              {selectedContact.phone && (
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Phone</div>
                  <div className="text-white">{selectedContact.phone}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Message</div>
                <div className="text-gray-300 leading-relaxed">{selectedContact.message}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase tracking-widest mb-1">Received</div>
                <div className="text-gray-400">
                  {selectedContact.created_at ? new Date(selectedContact.created_at).toLocaleString() : "-"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedContact(null)}
              className="w-full mt-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-bold rounded-2xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
