import React from 'react';
import { IOrder } from '../../../types';
import { StatusBadge } from '../../common/StatusBadge';
import { formatCurrency, formatTimeAgo } from '../../../utils/formatters';
import { ChevronRight, MapPin, Truck } from 'lucide-react';

interface OrderRowProps {
  order: IOrder;
  onSelect: (order: IOrder) => void;
}

export const OrderRow: React.FC<OrderRowProps> = React.memo(({ order, onSelect }) => {
  const firstItem = order.items[0];

  return (
    <tr
      onClick={() => onSelect(order)}
      className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/70 cursor-pointer transition-colors group"
    >
      {/* Order ID & Time */}
      <td className="p-4 whitespace-nowrap">
        <div className="font-mono font-bold text-xs text-[#1D1D1F] group-hover:text-[#007AFF] transition-colors">
          #{order.orderNumber}
        </div>
        <div className="text-[11px] text-[#86868B] mt-0.5 font-medium">
          {formatTimeAgo(order.createdAt)}
        </div>
      </td>

      {/* Customer Entity & Phone */}
      <td className="p-4">
        <div className="font-semibold text-sm text-[#1D1D1F] leading-tight">
          {order.customerName}
        </div>
        <div className="text-xs text-[#86868B] font-mono mt-0.5">
          +91 {order.customerPhone}
        </div>
      </td>

      {/* Destination Site & City */}
      <td className="p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#1D1D1F]">
          <MapPin className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
          <span className="truncate max-w-[180px]">
            {order.siteAddress?.siteName || order.siteAddress?.street || 'Site'}
          </span>
        </div>
        <div className="text-[11px] text-[#86868B] pl-5 mt-0.5">
          {order.siteAddress?.city || 'Hyderabad'}
        </div>
      </td>

      {/* Material Summary */}
      <td className="p-4">
        <div className="text-xs font-medium text-[#1D1D1F] truncate max-w-[200px]">
          {firstItem ? firstItem.name : 'Material item'}
        </div>
        <div className="text-[11px] text-[#86868B] mt-0.5 font-mono">
          {order.items.length > 1
            ? `+${order.items.length - 1} other item${order.items.length > 2 ? 's' : ''}`
            : `${firstItem?.quantity} ${firstItem?.unit}`}
        </div>
      </td>

      {/* Total Amount & Payment */}
      <td className="p-4 whitespace-nowrap text-right">
        <div className="text-sm font-bold font-mono text-[#1D1D1F]">
          {formatCurrency(order.totalAmount)}
        </div>
        <div className="mt-0.5">
          <StatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </td>

      {/* Lifecycle Status Pill */}
      <td className="p-4 whitespace-nowrap text-center">
        <StatusBadge status={order.orderStatus} type="order" />
        {order.vehicleNumber && (
          <div className="text-[10px] font-mono text-[#86868B] mt-1 flex items-center justify-center gap-1">
            <Truck className="w-3 h-3 text-[#86868B]" />
            <span>{order.vehicleNumber}</span>
          </div>
        )}
      </td>

      {/* Inspect action chevron */}
      <td className="p-4 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(order);
          }}
          className="p-1.5 rounded-lg text-[#86868B] group-hover:text-[#1D1D1F] group-hover:bg-[#E5E5EA] transition-colors"
          aria-label={`View order ${order.orderNumber}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});
