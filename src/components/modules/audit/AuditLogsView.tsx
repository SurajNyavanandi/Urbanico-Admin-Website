import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAuditLogsApi } from '../../../services/auditApi';
import { IAuditLog } from '../../../types';
import { StatCard } from '../../common/StatCard';
import { SearchInput } from '../../common/SearchInput';
import { TableSkeletonRows } from '../../common/ShimmerSkeleton';
import { formatDate, formatTimeAgo, formatCurrency } from '../../../utils/formatters';
import { usePagination } from '../../../hooks/usePagination';
import {
  ShieldCheck,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface AuditLogsViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

type FilterCategory = 'all' | 'prices' | 'orders' | 'security';

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ onShowToast }) => {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLogs = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      const res = await fetchAuditLogsApi(100);
      setLogs(res.logs || []);
    } catch (err: any) {
      onShowToast('Error', err.message || 'Failed to fetch audit ledger', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadLogs(true);
    setTimeout(() => {
      onShowToast('Ledger Refreshed', 'Audit logs updated with the latest security trails.', 'success');
    }, 300);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (selectedCategory === 'prices') {
        if (!log.action.includes('material') && !log.details?.priceChanged) return false;
      } else if (selectedCategory === 'orders') {
        if (!log.action.includes('order') && !log.action.includes('delivery')) return false;
      } else if (selectedCategory === 'security') {
        if (!log.action.includes('partner') && !log.action.includes('role') && !log.action.includes('cache')) {
          return false;
        }
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const actorStr = `${log.actorName || ''} ${log.actorId || ''}`.toLowerCase();
      const actionStr = log.action.toLowerCase();
      const targetStr = `${log.targetType || ''} ${log.targetId || ''}`.toLowerCase();
      const materialStr = (log.details?.materialName || '').toLowerCase();
      const orderStr = (log.details?.orderNumber || '').toLowerCase();
      const partnerStr = (log.details?.partnerName || '').toLowerCase();
      const noteStr = (log.details?.note || '').toLowerCase();

      return (
        actorStr.includes(q) ||
        actionStr.includes(q) ||
        targetStr.includes(q) ||
        materialStr.includes(q) ||
        orderStr.includes(q) ||
        partnerStr.includes(q) ||
        noteStr.includes(q)
      );
    });
  }, [logs, searchQuery, selectedCategory]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    totalItems,
  } = usePagination(filteredLogs, 10);

  const metrics = useMemo(() => {
    const total = logs.length;
    const priceChanges = logs.filter(
      (l) => l.action.includes('material') || l.details?.priceChanged
    ).length;
    const securityEvents = logs.filter(
      (l) =>
        l.action.includes('partner') ||
        l.action.includes('role') ||
        l.action.includes('cache')
    ).length;

    return {
      total,
      priceChanges,
      securityEvents,
    };
  }, [logs]);

  const formatActionBadge = (action: string, details?: IAuditLog['details']) => {
    if (action.includes('material') || details?.priceChanged) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#FFF8EB] text-[#B45309] border border-[#FDE68A]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          Price Updated
        </span>
      );
    }
    if (action.includes('order_status') || action.includes('delivery')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#EBF5FF] text-[#0071E3] border border-[#BFDBFE]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
          {details?.newStatus === 'dispatched'
            ? 'Order Dispatched'
            : details?.newStatus === 'delivered'
            ? 'Delivery Verified'
            : 'Order Updated'}
        </span>
      );
    }
    if (action.includes('partner')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
          Partner Verified
        </span>
      );
    }
    if (action.includes('role')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7]" />
          Role Elevated
        </span>
      );
    }
    if (action.includes('cache')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]/60">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
          Cache Purged
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#F5F5F7] text-[#1D1D1F]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#A1A1A6]" />
        {action.replace('admin.', '').replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Audit Trail Entries"
          value={metrics.total}
          subtitle="Immutable system records"
          icon={ShieldCheck}
        />
        <StatCard
          title="Price Alterations"
          value={metrics.priceChanges}
          subtitle="Catalog rate adjustments"
          icon={TrendingUp}
        />
        <StatCard
          title="Security & Access"
          value={metrics.securityEvents}
          subtitle="KYC, roles & cache events"
          icon={UserCheck}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[#000000]">Security & Operations Ledger</h3>
            <p className="text-[14px] text-[#555555] mt-1">
              Cryptographically verified audit trail for price overrides, dispatching, and administrator actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 h-[44px] rounded-[8px] border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[14px] text-[#000000] font-medium transition-colors"
              title="Refresh audit log"
            >
              <RefreshCw className={`w-[14px] h-[14px] text-[#0071E3] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search actor, item, order, note..."
              />
            </div>
          </div>
        </div>

        {/* Minimalist Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E5EA]">
          <span className="text-[13px] text-[#86868B] mr-2">Filter View:</span>
          {(
            [
              { id: 'all', label: 'All Actions' },
              { id: 'prices', label: 'Price Updates' },
              { id: 'orders', label: 'Orders & Fleet' },
              { id: 'security', label: 'KYC & Security' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'bg-[#F5F5F7] text-[#555555] hover:bg-[#E5E5EA] hover:text-[#000000]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs High-Density Table */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7] text-[13px] font-medium text-[#555555]">
                <th className="p-4 px-6 w-[200px]">Timestamp</th>
                <th className="p-4 w-[220px]">Admin Actor</th>
                <th className="p-4 w-[170px]">Action Type</th>
                <th className="p-4">Details & Value Delta</th>
                <th className="p-4 px-6 text-right w-[150px]">Target</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={5} cols={5} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#A1A1A6] mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-[18px] font-semibold text-[#000000]">No audit entries found</h4>
                      <p className="text-[14px] text-[#86868B] mt-2 mb-6">
                        No events match the current filter or search criteria.
                      </p>
                      {(searchQuery || selectedCategory !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className="px-6 py-[12px] h-[44px] rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((log) => {
                  const details = log.details;
                  const hasPriceDelta =
                    details?.oldPrice !== undefined && details?.newPrice !== undefined;
                  const priceDiff = hasPriceDelta ? (details.newPrice! - details.oldPrice!) : 0;

                  return (
                    <tr
                      key={log._id}
                      className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/80 transition-colors duration-200"
                    >
                      {/* Timestamp */}
                      <td className="p-4 px-6 align-top">
                        <div className="text-[13px] font-medium text-[#000000] whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </div>
                        <div className="text-[12px] text-[#86868B] mt-0.5">
                          {formatTimeAgo(log.createdAt)}
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="p-4 align-top">
                        <div className="font-medium text-[14px] text-[#000000] leading-tight">
                          {log.actorName || (log.actorId.includes('@') ? log.actorId.split('@')[0] : log.actorId)}
                        </div>
                        <div className="text-[12px] text-[#64748B] font-mono mt-0.5 truncate max-w-[200px]" title={log.actorId}>
                          {log.actorId}
                        </div>
                        {log.ip && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-[#86868B] font-mono bg-[#F5F5F7] px-1.5 py-0.5 rounded mt-1">
                            <Terminal className="w-3 h-3 text-[#A1A1A6]" />
                            {log.ip}
                          </div>
                        )}
                      </td>

                      {/* Action Badge */}
                      <td className="p-4 align-top whitespace-nowrap">
                        {formatActionBadge(log.action, details)}
                      </td>

                      {/* Details & Value Delta */}
                      <td className="p-4 align-top">
                        {hasPriceDelta ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-[14px] text-[#000000]">
                              {details?.materialName || 'Material Catalog Item'}
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[13px]">
                              <span className="text-[#64748B] line-through">
                                {formatCurrency(details?.oldPrice || 0)}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-[#86868B]" />
                              <span className="font-semibold text-[#000000]">
                                {formatCurrency(details?.newPrice || 0)}
                              </span>
                              <span
                                className={`text-[11px] px-1.5 py-0.2 rounded font-medium ${
                                  priceDiff >= 0
                                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                                    : 'bg-[#FFEBEE] text-[#C62828]'
                                }`}
                              >
                                {priceDiff >= 0 ? `+${formatCurrency(priceDiff)}` : formatCurrency(priceDiff)}
                              </span>
                            </div>
                            {details?.note && (
                              <p className="text-[12px] text-[#86868B] mt-1">{details.note}</p>
                            )}
                          </div>
                        ) : details?.orderNumber ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-[13px] text-[#0071E3]">
                                {details.orderNumber}
                              </span>
                              {details.vehicleNumber && (
                                <span className="font-mono text-[12px] bg-[#F5F5F7] px-2 py-0.5 rounded text-[#1D1D1F]">
                                  {details.vehicleNumber}
                                </span>
                              )}
                            </div>
                            {details.oldStatus && details.newStatus && (
                              <div className="text-[12px] text-[#555555]">
                                Status changed: <span className="capitalize">{details.oldStatus}</span> →{' '}
                                <span className="font-medium capitalize text-[#000000]">{details.newStatus}</span>
                              </div>
                            )}
                            {details.note && (
                              <p className="text-[12px] text-[#86868B] mt-0.5">{details.note}</p>
                            )}
                          </div>
                        ) : details?.partnerName ? (
                          <div className="space-y-1">
                            <div className="font-medium text-[14px] text-[#000000]">
                              {details.partnerName}
                            </div>
                            {details.partnerRole && (
                              <div className="text-[12px] text-[#555555]">{details.partnerRole}</div>
                            )}
                            {details.note && (
                              <p className="text-[12px] text-[#86868B] mt-0.5">{details.note}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-[13px] text-[#1D1D1F]">
                              {details?.note || `Target ID: ${log.targetId}`}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Target Type */}
                      <td className="p-4 px-6 align-top text-right whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-mono uppercase rounded bg-[#F5F5F7] text-[#555555] border border-[#E5E5EA]">
                          {log.targetType}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-[#E5E5EA] flex items-center justify-between text-[13px] text-[#555555]">
          <div>
            Showing <span className="font-semibold text-[#000000]">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-[#000000]">{totalItems}</span> audit entries
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
                className="p-2 rounded-[8px] border border-[#E5E5EA] text-[#000000] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-[16px] h-[16px]" />
              </button>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage}
                className="p-2 rounded-[8px] border border-[#E5E5EA] text-[#000000] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
