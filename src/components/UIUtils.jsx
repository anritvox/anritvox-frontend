import React, { useState, useEffect } from 'react';

// ========== BACK TO TOP BUTTON =========
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-xl flex items-center justify-center text-xl transition-all duration-300 hover:scale-110"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

// ========== COOKIE CONSENT BANNER ==========
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] bg-gray-900 border-t border-gray-700 px-6 py-4 shadow-2xl">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex-1">
          <p className="text-white text-sm font-medium mb-1">🍪 We use cookies</p>
          <p className="text-gray-400 text-xs">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
            By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white text-sm rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== COUNTDOWN TIMER (Flash Sale) ==========
export function CountdownTimer({ endTime, label = 'Sale ends in' }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft.expired) return null;

  const pad = (n) => String(n || 0).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm font-medium">{label}:</span>
      <div className="flex items-center gap-1">
        {[['h', timeLeft.hours], ['m', timeLeft.minutes], ['s', timeLeft.seconds]].map(([unit, val], i) => (
          <React.Fragment key={unit}>
            {i > 0 && <span className="text-cyan-400 font-bold">:</span>}
            <div className="bg-gray-800 text-cyan-400 font-mono font-bold text-sm px-2 py-1 rounded-lg min-w-[36px] text-center">
              {pad(val)}
              <span className="text-gray-500 text-[10px] block leading-none">{unit}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ========== FLASH SALE BANNER ==========
export function FlashSaleBanner({ discount = 30, endTime }) {
  const saleEnd = endTime || new Date(Date.now() + 6 * 3600 * 1000).toISOString();

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <span className="font-bold text-lg">FLASH SALE</span>
            <span className="ml-2 bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">UP TO {discount}% OFF</span>
          </div>
        </div>
        <CountdownTimer endTime={saleEnd} label="Ends in" />
        <a href="/shop" className="bg-white text-red-600 font-bold text-sm px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
          Shop Now
        </a>
      </div>
    </div>
  );
}

// ========== MOBILE BOTTOM NAV ==========
export function MobileBottomNav() {
  const path = window.location.pathname;

  const navItems = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/shop', icon: '🛒', label: 'Shop' },
    { href: '/cart', icon: '🛝', label: 'Cart' },
    { href: '/wishlist', icon: '❤️', label: 'Wishlist' },
    { href: '/profile', icon: '👤', label: 'Account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 md:hidden safe-area-pb">
      <div className="flex">
        {navItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              path === item.href ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export default BackToTop;
