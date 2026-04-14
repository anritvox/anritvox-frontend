import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS = {
  shop: 'Shop',
  product: 'Product',
  cart: 'Cart',
  checkout: 'Checkout',
  wishlist: 'Wishlist',
  compare: 'Compare',
  profile: 'Profile',
  orders: 'Orders',
  about: 'About',
  contact: 'Contact',
};

export default function Breadcrumbs({ productName }) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;
    const isId = /^[a-f0-9]{24}$|^\d+$/.test(seg);
    let label = isId ? (productName || 'Detail') : (ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1));
    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-[13px] font-bold text-gray-400 uppercase tracking-wide flex-wrap">
        <Link to="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
          <Home size={13} /> Home
        </Link>
        {crumbs.map(({ path, label, isLast }) => (
          <React.Fragment key={path}>
            <ChevronRight size={13} className="shrink-0" />
            {isLast ? (
              <span className="text-gray-900 truncate max-w-[200px]">{label}</span>
            ) : (
              <Link to={path} className="hover:text-gray-900 transition-colors truncate max-w-[120px]">{label}</Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
