import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string | boolean;
  type?: 'order' | 'payment' | 'stock' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  let label = String(status);
  let badgeClass = 'bg-zinc-800 text-zinc-400 border border-zinc-700';
  let dotClass = 'bg-zinc-400';

  const normalized = typeof status === 'string' ? status.toLowerCase() : String(status);

  if (type === 'order') {
    switch (normalized) {
      case 'received':
        label = 'Received';
        badgeClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
        dotClass = 'bg-yellow-400';
        break;
      case 'confirmed':
        label = 'Confirmed';
        badgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
        dotClass = 'bg-blue-400';
        break;
      case 'processing':
        label = 'Loading Quarry';
        badgeClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
        dotClass = 'bg-amber-400';
        break;
      case 'dispatched':
      case 'in_transit':
        label = normalized === 'dispatched' ? 'Dispatched' : 'In Transit';
        badgeClass = 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
        dotClass = 'bg-purple-400';
        break;
      case 'unloading':
        label = 'Unloading';
        badgeClass = 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
        dotClass = 'bg-purple-400';
        break;
      case 'delivered':
        label = 'Delivered';
        badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        dotClass = 'bg-emerald-400';
        break;
      case 'cancelled':
        label = 'Cancelled';
        badgeClass = 'bg-red-500/10 text-red-400 border border-red-500/30';
        dotClass = 'bg-red-400';
        break;
      default:
        label = String(status);
        badgeClass = 'bg-zinc-800 text-zinc-400 border border-zinc-700';
        dotClass = 'bg-zinc-400';
    }
  } else if (type === 'payment') {
    switch (normalized) {
      case 'paid':
        label = 'Paid';
        badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
        dotClass = 'bg-emerald-400';
        break;
      case 'pending':
        label = 'Pending';
        badgeClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
        dotClass = 'bg-yellow-400';
        break;
      case 'partially_paid':
        label = 'Partially Paid';
        badgeClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
        dotClass = 'bg-blue-400';
        break;
      case 'refunded':
        label = 'Refunded';
        badgeClass = 'bg-zinc-800 text-zinc-400 border border-zinc-700';
        dotClass = 'bg-zinc-400';
        break;
      default:
        label = String(status);
    }
  } else if (type === 'stock') {
    if (status === true || normalized === 'true' || normalized === 'in stock') {
      label = 'In Stock';
      badgeClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      dotClass = 'bg-emerald-400';
    } else {
      label = 'Out of Stock';
      badgeClass = 'bg-red-500/10 text-red-400 border border-red-500/30';
      dotClass = 'bg-red-400';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotClass}`} />
      {label}
    </span>
  );
};

