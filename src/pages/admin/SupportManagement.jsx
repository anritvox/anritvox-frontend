import React, { useState, useEffect, useRef } from 'react';
import { support as supportApi } from '../../services/api';
import { Headphones, MessageCircle, Send, Paperclip, X, Clock, CheckCircle, AlertCircle, RefreshCw, Search, Image as ImageIcon, Video, FileText } from 'lucide-react';

const STATUS_COLORS = {
  open: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  closed: { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200' },
};

export default function SupportManagement() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchTickets(); const interval = setInterval(fetchTickets, 15000); return () => clearInterval(interval); }, []);
  useEffect(() => { if (selectedTicket) { fetchMessages(selectedTicket.id); const interval = setInterval(() => fetchMessages(selectedTicket.id), 5000); return () => clearInterval(interval); } }, [selectedTicket]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchTickets = async () => {
    try {
      const res = await supportApi.getAllTickets();
      const data = res.data?.tickets || res.data?.data || res.data || [];
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId) => {
    try {
      const res = await supportApi.getTicket(ticketId);
      setMessages(res.data?.messages || res.data?.data?.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    try {
      const res = await supportApi.uploadAttachment(formData);
      const urls = res.data?.urls || [];
      setAttachments(prev => [...prev, ...urls.map(url => ({ url, type: files.find(f => url.includes(f.name.split('.')[0]))?.type || 'file' }))]);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() && attachments.length === 0) return;
    setSending(true);
    try {
      await supportApi.replyToTicket(selectedTicket.id, { message: reply, attachments: attachments.map(a => a.url) });
      setReply('');
      setAttachments([]);
      fetchMessages(selectedTicket.id);
      fetchTickets();
    } catch (err) {
      alert('Failed to send: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (ticketId, status) => {
    try {
      await supportApi.updateTicketStatus(ticketId, status);
      fetchTickets();
      if (selectedTicket?.id === ticketId) setSelectedTicket({...selectedTicket, status});
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const filtered = tickets.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.subject?.toLowerCase().includes(search.toLowerCase()) && !t.user_email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-12rem)]">
      {/* Tickets List */}
      <div className="w-96 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
            <Headphones size={24} /> Support Tickets
          </h2>
          <div className="mt-4 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition ${filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {f === 'all' ? 'All' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No tickets found</div>
          ) : (
            filtered.map(t => {
              const color = STATUS_COLORS[t.status] || STATUS_COLORS.open;
              return (
                <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-4 rounded-2xl border cursor-pointer transition ${selectedTicket?.id === t.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white hover:bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-bold text-sm text-slate-900 truncate flex-1">{t.subject || '(No Subject)'}</div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color.bg} ${color.text}`}>{t.status || 'open'}</span>
                  </div>
                  <div className="text-xs text-slate-500">{t.user_email || t.user_name || 'Unknown User'}</div>
                  <div className="text-xs text-slate-400 mt-1">{t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN') : 'Recently'}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 text-lg">{selectedTicket.subject || '(No Subject)'}</h3>
                  <div className="text-xs text-slate-500 mt-1">{selectedTicket.user_email || selectedTicket.user_name} • Ticket #{selectedTicket.id}</div>
                </div>
                <select value={selectedTicket.status || 'open'} onChange={e => updateStatus(selectedTicket.id, e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => {
                const isAdmin = m.sender_role === 'admin' || m.is_admin;
                return (
                  <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${isAdmin ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-900'} rounded-2xl px-4 py-3`}>
                      <div className="text-sm leading-relaxed">{m.content || m.message}</div>
                      {m.attachments?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {m.attachments.map((att, idx) => (
                            <a key={idx} href={att} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs underline">
                              <Paperclip size={10} /> {att.split('/').pop()}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className={`text-xs mt-2 ${isAdmin ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {m.created_at ? new Date(m.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'Now'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100">
              {attachments.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-xs">
                      {att.type?.startsWith('image') ? <ImageIcon size={12} /> : att.type?.startsWith('video') ? <Video size={12} /> : <FileText size={12} />}
                      <span className="text-slate-700 max-w-[120px] truncate">{att.url.split('/').pop()}</span>
                      <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-slate-600">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                  <Paperclip size={16} className="text-slate-600" />
                </button>
                <input type="text" value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()} placeholder="Type your reply..." className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button onClick={sendReply} disabled={sending} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition disabled:opacity-50">
                  {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold">Select a ticket to view conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
