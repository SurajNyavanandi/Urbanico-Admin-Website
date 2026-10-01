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
      <td className="p-4 px-6 whitespace-nowrap">
        <div className="font-medium text-[13px] text-[#000000] group-hover:text-[#0071E3] transition-colors">
          #{order.orderNumber}
        </div>
        <div className="text-[12px] text-[#86868B] mt-1 font-normal">
          {formatTimeAgo(order.createdAt)}
        </div>
      </td>

      {/* Customer Entity & Phone */}
      <td className="p-4">
        <div className="font-semibold text-[14px] text-[#000000] leading-tight">
          {order.customerName}
        </div>
        <div className="text-[13px] text-[#86868B] mt-1">
          +91 {order.customerPhone}
        </div>
      </td>

      {/* Destination Site & City */}
      <td className="p-4">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#000000]">
          <MapPin className="w-[14px] h-[14px] text-[#86868B] shrink-0" />
          <span className="truncate max-w-[180px]">
            {order.siteAddress?.siteName || order.siteAddress?.street || 'Site'}
          </span>
        </div>
        <div className="text-[12px] text-[#86868B] pl-[20px] mt-1">
          {order.siteAddress?.city || 'Hyderabad'}
        </div>
      </td>

      {/* Material Summary */}
      <td className="p-4">
        <div className="text-[13px] font-medium text-[#000000] truncate max-w-[200px]">
          {firstItem ? firstItem.name : 'Material item'}
        </div>
        <div className="text-[12px] text-[#86868B] mt-1">
          {order.items.length > 1
            ? `+${order.items.length - 1} other item${order.items.length > 2 ? 's' : ''}`
            : `${firstItem?.quantity} ${firstItem?.unit}`}
        </div>
      </td>

      {/* Total Amount & Payment */}
      <td className="p-4 whitespace-nowrap text-right">
        <div className="text-[14px] font-semibold text-[#000000]">
          {formatCurrency(order.totalAmount)}
        </div>
        <div className="mt-1 flex justify-end">
          <StatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </td>

      {/* Lifecycle Status Pill */}
      <td className="p-4 whitespace-nowrap text-center">
        <StatusBadge status={order.orderStatus} type="order" />
        {order.vehicleNumber && (
          <div className="text-[11px] text-[#86868B] mt-1.5 flex items-center justify-center gap-1.5">
            <Truck className="w-[12px] h-[12px] text-[#86868B]" />
            <span>{order.vehicleNumber}</span>
          </div>
        )}
      </td>

      {/* Inspect action chevron */}
      <td className="p-4 px-6 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(order);
          }}
          className="p-2 rounded-[8px] text-[#86868B] group-hover:text-[#000000] group-hover:bg-[#E5E5EA] transition-colors inline-flex"
          aria-label={`View order ${order.orderNumber}`}
        >
          <ChevronRight className="w-[16px] h-[16px]" />
        </button>
      </td>
    </tr>
  );
});
