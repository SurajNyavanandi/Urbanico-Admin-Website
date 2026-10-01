import React from 'react';
import { OrderStatus, PaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string | boolean;
  type?: 'order' | 'payment' | 'stock' | 'generic';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  let label = String(status);
  let bgClass = 'bg-[#F5F5F7] text-[#555555]';
  let dotClass = 'bg-[#86868B]';

  const normalized = typeof status === 'string' ? status.toLowerCase() : String(status);

  if (type === 'order') {
    switch (normalized) {
      case 'received':
        label = 'Received';
        bgClass = 'bg-[#0071E3]/10 text-[#0071E3]';
        dotClass = 'bg-[#0071E3]';
        break;
      case 'confirmed':
        label = 'Confirmed';
        bgClass = 'bg-[#0071E3]/10 text-[#0071E3]';
        dotClass = 'bg-[#0071E3]';
        break;
      case 'processing':
        label = 'Processing';
        bgClass = 'bg-[#FFCC00]/20 text-[#D4A300]';
        dotClass = 'bg-[#D4A300]';
        break;
      case 'dispatched':
      case 'in_transit':
        label = normalized === 'dispatched' ? 'Dispatched' : 'In Transit';
        bgClass = 'bg-[#FF9500]/10 text-[#FF9500]';
        dotClass = 'bg-[#FF9500]';
        break;
      case 'delivered':
        label = 'Delivered';
        bgClass = 'bg-[#34C759]/10 text-[#34C759]';
        dotClass = 'bg-[#34C759]';
        break;
      case 'cancelled':
        label = 'Cancelled';
        bgClass = 'bg-[#FF3B30]/10 text-[#FF3B30]';
        dotClass = 'bg-[#FF3B30]';
        break;
      default:
        label = String(status);
        bgClass = 'bg-[#F5F5F7] text-[#555555]';
        dotClass = 'bg-[#A1A1A6]';
    }
  } else if (type === 'payment') {
    switch (normalized) {
      case 'paid':
        label = 'Paid';
        bgClass = 'bg-[#34C759]/10 text-[#34C759]';
        dotClass = 'bg-[#34C759]';
        break;
      case 'pending':
        label = 'Pending';
        bgClass = 'bg-[#FF9500]/10 text-[#FF9500]';
        dotClass = 'bg-[#FF9500]';
        break;
      case 'partially_paid':
        label = 'Partially Paid';
        bgClass = 'bg-[#0071E3]/10 text-[#0071E3]';
        dotClass = 'bg-[#0071E3]';
        break;
      case 'refunded':
        label = 'Refunded';
        bgClass = 'bg-[#E5E5EA] text-[#555555]';
        dotClass = 'bg-[#A1A1A6]';
        break;
      default:
        label = String(status);
    }
  } else if (type === 'stock') {
    if (status === true || normalized === 'true' || normalized === 'in stock') {
      label = 'In Stock';
      bgClass = 'bg-[#34C759]/10 text-[#34C759]';
      dotClass = 'bg-[#34C759]';
    } else {
      label = 'Out of Stock';
      bgClass = 'bg-[#FF3B30]/10 text-[#FF3B30]';
      dotClass = 'bg-[#FF3B30]';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium whitespace-nowrap tracking-tight ${bgClass}`}
    >
      <span className={`w-[6px] h-[6px] rounded-full mr-2 ${dotClass}`} />
      {label}
    </span>
  );
};
