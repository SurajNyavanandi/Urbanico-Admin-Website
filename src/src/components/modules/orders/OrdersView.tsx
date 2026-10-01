import React, { useState, useMemo } from 'react';
import { useOrders } from '../../../hooks/useOrders';
import { OrderRow } from './OrderRow';
import { OrderDetailModal } from './OrderDetailModal';
import { StatCard } from '../../common/StatCard';
import { SearchInput } from '../../common/SearchInput';
import { TableSkeletonRows } from '../../common/ShimmerSkeleton';
import { usePagination } from '../../../hooks/usePagination';
import { IOrder, OrderStatus } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface OrdersViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'received', label: 'Received' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'dispatched', label: 'Dispatched' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export const OrdersView: React.FC<OrdersViewProps> = ({ onShowToast }) => {
  const {
    orders,
    isLoading,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    updateStatus,
  } = useOrders('all');

  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    totalItems,
  } = usePagination(orders, 10);

  // High performance memoized metric calculation
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    let pendingCount = 0;
    let totalRevenue = 0;
    let deliveredCount = 0;

    for (const o of orders) {
      if (o.orderStatus === 'received' || o.orderStatus === 'confirmed') {
        pendingCount++;
      }
      if (o.orderStatus === 'delivered') {
        deliveredCount++;
      }
      if (o.paymentStatus === 'paid') {
        totalRevenue += o.totalAmount;
      }
    }

    return {
      totalCount,
      pendingCount,
      deliveredCount,
      totalRevenue,
    };
  }, [orders]);

  const handleUpdateStatus = async (
    orderId: string,
    status: OrderStatus,
    extraFields?: any
  ) => {
    const updated = await updateStatus(orderId, status, extraFields);
    if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderNumber === orderId)) {
      setSelectedOrder(updated);
    }
    return updated;
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={metrics.totalCount}
          subtitle="All platform orders"
          icon={ShoppingBag}
        />
        <StatCard
          title="Pending Triage"
          value={metrics.pendingCount}
          subtitle="Received & awaiting dispatch"
          icon={Clock}
          badge={{ text: 'Action Required', type: metrics.pendingCount > 0 ? 'warning' : 'neutral' }}
        />
        <StatCard
          title="Delivered Orders"
          value={metrics.deliveredCount}
          subtitle="Signed on site"
          icon={CheckCircle2}
          badge={{ text: 'Completed', type: 'success' }}
        />
        <StatCard
          title="Paid Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          subtitle="Total realized payments"
          icon={TrendingUp}
        />
      </div>

      {/* Triage Controls: Status Segment Pills + Search Input */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Segment Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const isActive = selectedStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedStatus(f.id)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-[#0071E3] text-white shadow-sm'
                    : 'bg-[#F5F5F7] text-[#555555] hover:text-[#000000] hover:bg-[#E5E5EA]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="w-full md:w-[320px] shrink-0">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by order #, client, city..."
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7] text-[13px] font-medium text-[#555555]">
                <th className="p-4 px-6">Order ID & Date</th>
                <th className="p-4">Customer Entity</th>
                <th className="p-4">Delivery Site</th>
                <th className="p-4">Materials</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={5} cols={7} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#A1A1A6] mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-[18px] font-semibold text-[#000000]">No orders found</h4>
                      <p className="text-[14px] text-[#86868B] mt-2 mb-6">
                        {searchQuery || selectedStatus !== 'all'
                          ? 'Try adjusting your search query or clear the status filters.'
                          : 'Orders placed by customers will immediately appear in this live queue.'}
                      </p>
                      {(searchQuery || selectedStatus !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStatus('all');
                            setSearchQuery('');
                          }}
                          className="px-6 py-[12px] h-[44px] rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((order) => (
                  <OrderRow
                    key={order._id || order.orderNumber}
                    order={order}
                    onSelect={(ord) => setSelectedOrder(ord)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-6 py-4 border-t border-[#E5E5EA] flex items-center justify-between text-[13px] text-[#555555]">
          <div>
            Showing <span className="font-semibold text-[#000000]">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-[#000000]">{totalItems}</span> orders
          </div>
          <div className="flex items-center gap-3">
            <span className="mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={prevPage}
                disabled={!hasPrevPage}
                className="p-2 rounded-[8px] border border-[#E5E5EA] text-[#000000] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-[16px] h-[16px]" />
              </button>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage}
                className="p-2 rounded-[8px] border border-[#E5E5EA] text-[#000000] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        onShowToast={onShowToast}
      />
    </div>
  );
};
