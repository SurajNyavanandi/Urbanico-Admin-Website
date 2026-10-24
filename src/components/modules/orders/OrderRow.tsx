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
      className="border-b border-[#3F3F46] hover:bg-[#27272A] cursor-pointer transition-colors group text-zinc-50"
    >
      {/* Order ID & Time */}
      <td className="p-4 px-6 whitespace-nowrap">
        <div className="font-mono font-bold text-xs text-yellow-400 group-hover:text-yellow-300 transition-colors">
          #{order.orderNumber}
        </div>
        <div className="text-xs text-zinc-400 mt-1 font-normal">
          {formatTimeAgo(order.createdAt)}
        </div>
      </td>

      {/* Customer Entity & Phone */}
      <td className="p-4">
        <div className="font-semibold text-sm text-zinc-100 leading-tight">
          {order.customerName}
        </div>
        <div className="text-xs text-zinc-400 font-mono mt-1">
          +91 {order.customerPhone}
        </div>
      </td>

      {/* Destination Site & City */}
      <td className="p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="truncate max-w-[180px]">
            {order.siteAddress?.siteName || order.siteAddress?.street || 'Site'}
          </span>
        </div>
        <div className="text-xs text-zinc-400 pl-5 mt-0.5">
          {order.siteAddress?.city || 'Hyderabad'}
        </div>
      </td>

      {/* Material Summary */}
      <td className="p-4">
        <div className="text-xs font-medium text-zinc-200 truncate max-w-[200px]">
          {firstItem ? firstItem.name : 'Material item'}
        </div>
        <div className="text-xs text-zinc-400 mt-0.5 font-mono">
          {order.items.length > 1
            ? `+${order.items.length - 1} other item${order.items.length > 2 ? 's' : ''}`
            : `${firstItem?.quantity} ${firstItem?.unit}`}
        </div>
      </td>

      {/* Total Amount & Payment */}
      <td className="p-4 whitespace-nowrap text-right">
        <div className="text-sm font-bold font-mono text-zinc-100">
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
          <div className="text-[11px] text-zinc-400 mt-1.5 flex items-center justify-center gap-1.5 font-mono">
            <Truck className="w-3.5 h-3.5 text-zinc-400" />
            <span>{order.vehicleNumber}</span>
          </div>
        )}
        {order.eWayBillNo && (
          <div
            className="text-[10px] text-zinc-500 font-mono mt-0.5 tracking-wider"
            title={`GST e-Way Bill: ${order.eWayBillNo}`}
          >
            e-Way: {order.eWayBillNo}
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
          className="p-1.5 rounded-lg text-zinc-400 group-hover:text-zinc-100 group-hover:bg-[#27272A] transition-colors inline-flex cursor-pointer"
          aria-label={`View order ${order.orderNumber}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

