// NotificationCenter - Revamped with premium neon dark Ui
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Trash2, Package, Tag, Info, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'https://service.anritvox.com';

const TYPE_CONFIG = {
  order:   { icon: Package,     color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30' },
  promo:   { icon: Tag,         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  system:  { icon: Info,        color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  alert:   { icon: AlertCircle, color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
  review:  { icon: Star,        color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  default: { icon: Bell,        color: 'text-gray-400',   bg: 'bg-gray-500/10',   border: 'border-gray-500/30' },
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const DEMO_NOTIFICATIONS = [
  { _id: '1', title: 'Order Confirmed', message: 'Your order has been confirmed and is being processed!', read: false, createdAt: new Date().toISOString(), type: 'order' },
  { _id: '2', title: 'Flash Sale Live!', message: 'Use code SAVE20 for flat 20% off on all electronics.', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), type: 'promo' },
  { _id: '3', title: 'Order Shipped', message: 'Your order is on the way! Track it in My Orders.', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'order' },
];

export default function NotificationCenter() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Animate bell when new unread appears
  useEffect(() => {
    if (unread > 0) {
      setAnimateBell(true);
      const t = setTimeout(() => setAnimateBell(false), 1000);
      return () => clearTimeout(t);
    }
  }, [unread]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const notifs = Array.isArray(data) ? data : (data.notifications || DEMO_NOTIFICATIONS);
        setNotifications(notifs);
        setUnread(notifs.filter(n => !n.read).length);
      } else {
        setNotifications(DEMO_NOTIFICATIONS);
        setUnread(DEMO_NOTIFICATIONS.filter(n => !n.read).length);
      }
    } catch {
      setNotifications(DEMO_NOTIFICATIONS);
      setUnread(DEMO_NOTIFICATIONS.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAllRead = async () => {
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const markRead = async (id) => {
    if (!id) return;
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
    setNotifications(prev => prev.filter(n => n._id !== id));
    setUnread(prev => {
      const wasUnread = notifications.find(n => n._id === id && !n.read);
      return wasUnread ? Math.max(0, prev - 1) : prev;
    });
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        className="relative p-2 text-gray-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
        aria-label="Notifications"
      >
        <Bell
          size={22}
          className={animateBell ? 'animate-bounce text-cyan-400' : ''}
        />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-cyan-500/50 animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0d0d0d] border border-gray-800 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-[#0d0d0d]">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-cyan-400" />
              <span className="text-white font-semibold text-sm tracking-wide">Notifications</span>
              {unread > 0 && (
                <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>All read</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                  <Bell size={24} className="text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-700 text-xs">We'll notify you when something arrives</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {notifications.map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
                  const IconComp = cfg.icon;
                  return (
                    <div
                      key={n._id}
                      onClick={() => !n.read && markRead(n._id)}
                      className={`group relative flex gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-white/3 ${
                        !n.read ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center mt-0.5`}>
                        <IconComp size={16} className={cfg.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold leading-tight ${!n.read ? 'text-white' : 'text-gray-300'}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-1.5 shadow-sm shadow-cyan-400/50" />
                          )}
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-gray-600 text-[10px] mt-1">{timeAgo(n.createdAt)}</p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => deleteNotif(n._id, e)}
                        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-800 bg-gray-950/50">
              <button
                onClick={() => setNotifications([])}
                className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors py-1 flex items-center justify-center gap-1"
              >
                <Trash2 size={11} />
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
