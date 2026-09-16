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
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Status Segment Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const isActive = selectedStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedStatus(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="w-full md:w-72 shrink-0">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by order #, client, city..."
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]/50 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Entity</th>
                <th className="p-4">Delivery Site</th>
                <th className="p-4">Materials</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={5} cols={7} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B] mb-3">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#1D1D1F]">No orders found</h4>
                      <p className="text-xs text-[#86868B] mt-1 mb-4">
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
                          className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-blue-600 transition-all"
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
        <div className="p-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#86868B]">
          <div>
            Showing <span className="font-semibold text-[#1D1D1F]">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-[#1D1D1F]">{totalItems}</span> orders
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={prevPage}
              disabled={!hasPrevPage}
              className="p-1.5 rounded-lg border border-[#E5E5EA] text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPage}
              disabled={!hasNextPage}
              className="p-1.5 rounded-lg border border-[#E5E5EA] text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
