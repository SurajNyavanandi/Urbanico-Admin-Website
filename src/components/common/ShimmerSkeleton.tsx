import React from 'react';

export const ShimmerSkeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`bg-[#E5E5EA] rounded animate-pulse ${className}`} />;
};

export const TableSkeletonRows: React.FC<{ count?: number; cols?: number }> = ({ count = 5, cols = 5 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-[#E5E5EA]">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="p-4">
              <div
                className={`h-4 bg-[#E5E5EA] rounded animate-pulse ${
                  j === 0 ? 'w-24' : j === 1 ? 'w-44' : j === cols - 1 ? 'w-16' : 'w-28'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export const CardSkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-3">
          <div className="h-3 w-20 bg-[#E5E5EA] rounded animate-pulse" />
          <div className="h-7 w-32 bg-[#E5E5EA] rounded animate-pulse" />
          <div className="h-3 w-40 bg-[#E5E5EA] rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};
