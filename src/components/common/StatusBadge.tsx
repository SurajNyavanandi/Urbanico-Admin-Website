import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string | boolean;
  type?: 'order' | 'payment' | 'stock' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  let label = String(status);
  let bgClass = 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5EA]';

  const normalized = typeof status === 'string' ? status.toLowerCase() : String(status);

  if (type === 'order') {
    switch (normalized) {
      case 'received':
        label = 'Received';
        bgClass = 'bg-blue-50 text-[#007AFF] border-blue-200';
        break;
      case 'confirmed':
        label = 'Confirmed';
        bgClass = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'processing':
        label = 'Processing';
        bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'dispatched':
      case 'in_transit':
        label = normalized === 'dispatched' ? 'Dispatched' : 'In Transit';
        bgClass = 'bg-indigo-50 text-indigo-600 border-indigo-200';
        break;
      case 'delivered':
        label = 'Delivered';
        bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'cancelled':
        label = 'Cancelled';
        bgClass = 'bg-red-50 text-red-600 border-red-200';
        break;
      default:
        label = String(status);
        bgClass = 'bg-gray-50 text-gray-700 border-gray-200';
    }
  } else if (type === 'payment') {
    switch (normalized) {
      case 'paid':
        label = 'Paid';
        bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'pending':
        label = 'Pending';
        bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'partially_paid':
        label = 'Partially Paid';
        bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'refunded':
        label = 'Refunded';
        bgClass = 'bg-gray-100 text-gray-700 border-gray-300';
        break;
      default:
        label = String(status);
    }
  } else if (type === 'stock') {
    if (status === true || normalized === 'true' || normalized === 'in stock') {
      label = 'In Stock';
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else {
      label = 'Out of Stock';
      bgClass = 'bg-red-50 text-red-600 border-red-200';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap tracking-tight ${bgClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {label}
    </span>
  );
};
