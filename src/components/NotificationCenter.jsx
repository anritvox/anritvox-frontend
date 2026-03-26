//notification

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NotificationCenter() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (user) { fetchNotifications(); }
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const notifs = data.notifications || data || [];
        setNotifications(notifs);
        setUnread(notifs.filter(n => !n.read).length);
      }
    } catch (e) {
      // Fallback to local demo notifications
      const demo = [
        { _id: '1', title: 'Order Confirmed', message: 'Your order #12345 has been confirmed!', read: false, createdAt: new Date().toISOString(), type: 'order' },
        { _id: '2', title: 'New Offer', message: 'Use code SAVE20 for 20% off your next purchase', read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), type: 'promo' },
        { _id: '3', title: 'Order Shipped', message: 'Your order #12344 has been shipped!', read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'order' }
      ];
      setNotifications(demo);
      setUnread(demo.filter(n => !n.read).length);
    }
    setLoading(false);
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({...n, read: true})));
    setUnread(0);
  };

  const markRead = async (id) => {
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {}
    setNotifications(prev => prev.map(n => n._id === id ? {...n, read: true} : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const typeIcon = { order: '📦', promo: '🎉', system: 'ℹ️', review: '⭐', default: '🔔' };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 text-gray-400 hover:text-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Mark all read</button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="text-3xl mb-2">🔔</div>
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div key={n._id}
                onClick={() => !n.read && markRead(n._id)}
                className={`px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-cyan-900/10' : ''}`}>
                <div className="flex gap-3 items-start">
                  <span className="text-xl mt-0.5">{typeIcon[n.type] || typeIcon.default}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium truncate ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1 ml-2" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-700">
              <button onClick={() => setNotifications([])} className="w-full text-xs text-gray-500 hover:text-gray-400 transition-colors py-1">Clear all</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
