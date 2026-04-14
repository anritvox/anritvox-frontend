import React from 'react';

// Generic animated skeleton bloc
export function SkeletonBlock({ className = '' }) {
  return <div className={`bg-gray-800 animate-pulse rounded ${className}`} />;
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
      <SkeletonBlock className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-4 w-1/2" />
        <SkeletonBlock className="h-6 w-1/3" />
        <SkeletonBlock className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

// Grid of product card skeletons
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Order list skeleton
export function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex justify-between">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-5 w-20" />
          </div>
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

// Profile page skeleton
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-4 w-60" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Banner skeleton
export function BannerSkeleton() {
  return <SkeletonBlock className="w-full h-64 md:h-96 rounded-2xl" />;
}

// Table row skeleton
export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-gray-800">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export default ProductCardSkeleton;
