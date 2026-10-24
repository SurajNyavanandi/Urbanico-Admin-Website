import React, { useState, useMemo } from 'react';
import { useOrders } from '../../../hooks/useOrders';
import { OrderRow } from './OrderRow';
import { OrderDetailModal } from './OrderDetailModal';
import { StatCard } from '../../common/StatCard';
import { SearchInput } from '../../common/SearchInput';
import { TableSkeletonRows } from '../../common/ShimmerSkeleton';
import { usePagination } from '../../../hooks/usePagination';
import { IOrder, OrderStatus } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { downloadCsv } from '../../../utils/exportCsv';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  TrendingUp,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';

interface OrdersViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'received', label: 'Received' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Loading at Quarry' },
  { id: 'in_transit', label: 'En-Route to Site' },
  { id: 'unloading', label: 'Unloading' },
  { id: 'delivered', label: 'Complete' },
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
    extraFields?: {
      vehicleNumber?: string;
      driverName?: string;
      driverPhone?: string;
      eWayBillNo?: string;
    }
  ) => {
    const updated = await updateStatus(orderId, status, extraFields);
    if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.orderNumber === orderId)) {
      setSelectedOrder(updated);
    }
    return updated;
  };

  const handleExportCsv = () => {
    if (orders.length === 0) {
      onShowToast('Export Empty', 'No orders available to export', 'info');
      return;
    }

    const headers = [
      'Order Number',
      'Created At',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'GSTIN',
      'Site Name',
      'Street Address',
      'City',
      'Items Summary',
      'Subtotal (INR)',
      'Tax Amount (INR)',
      'Delivery Charges (INR)',
      'Unloading Charges (INR)',
      'Total Amount (INR)',
      'Payment Status',
      'Payment Method',
      'Order Status',
      'Vehicle Number',
      'Driver Name',
      'Driver Phone',
      'eWay Bill No',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      formatDate(o.createdAt),
      o.customerName,
      o.customerPhone,
      o.customerEmail || '',
      o.gstin || '',
      o.siteAddress?.siteName || '',
      o.siteAddress?.street || '',
      o.siteAddress?.city || '',
      o.items.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join('; '),
      o.subtotal,
      o.taxAmount,
      o.deliveryCharges,
      o.unloadingCharges,
      o.totalAmount,
      o.paymentStatus,
      o.paymentMethod,
      o.orderStatus,
      o.vehicleNumber || '',
      o.driverName || '',
      o.driverPhone || '',
      o.eWayBillNo || '',
    ]);

    downloadCsv('urbanico_orders', headers, rows);
    onShowToast('CSV Downloaded', `Exported ${orders.length} orders to CSV`, 'success');
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

      {/* Triage Controls: Status Filter Buttons + Search Input + Export CSV */}
      <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-md">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const isActive = selectedStatus === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedStatus(f.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-yellow-500 text-zinc-950 shadow-md shadow-yellow-500/10'
                    : 'bg-[#27272A] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 border border-[#3F3F46]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search input & Export CSV Button */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <div className="w-full md:w-[240px]">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search order #, client, city..."
            />
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3.5 h-10 rounded-lg border border-[#3F3F46] bg-[#27272A] hover:bg-zinc-700 text-zinc-100 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shrink-0"
            title="Export filtered orders list as CSV"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3F3F46] bg-[#27272A] text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-4 px-6">Order ID & Date</th>
                <th className="p-4">Customer Entity</th>
                <th className="p-4">Delivery Site</th>
                <th className="p-4">Materials</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 px-6 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F3F46]">
              {isLoading ? (
                <TableSkeletonRows count={5} cols={7} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-xl bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-zinc-500 mb-4">
                        <Inbox className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-zinc-100">No orders found</h4>
                      <p className="text-xs text-zinc-400 mt-2 mb-6">
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
                          className="px-5 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 text-xs font-bold hover:bg-yellow-400 transition-all cursor-pointer"
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
        <div className="px-6 py-4 border-t border-[#3F3F46] bg-[#18181B] flex items-center justify-between text-xs text-zinc-400">
          <div>
            Showing <span className="font-bold text-zinc-100 font-mono">{paginatedItems.length}</span> of{' '}
            <span className="font-bold text-zinc-100 font-mono">{totalItems}</span> orders
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
                className="p-1.5 rounded-lg border border-[#3F3F46] bg-[#27272A] text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage}
                className="p-1.5 rounded-lg border border-[#3F3F46] bg-[#27272A] text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
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

