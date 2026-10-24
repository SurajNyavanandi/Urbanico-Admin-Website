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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch audit ledger';
      onShowToast('Error', msg, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    let ignore = false;
    fetchAuditLogsApi(100)
      .then((res) => {
        if (!ignore) {
          setLogs(res.logs || []);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch audit ledger';
          onShowToast('Error', msg, 'error');
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [onShowToast]);

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
      const materialStr = ((log.details?.materialName as string) || '').toLowerCase();
      const orderStr = ((log.details?.orderNumber as string) || '').toLowerCase();
      const partnerStr = ((log.details?.partnerName as string) || '').toLowerCase();
      const noteStr = ((log.details?.note as string) || '').toLowerCase();

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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          Price Updated
        </span>
      );
    }
    if (action.includes('order_status') || action.includes('delivery')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Partner Verified
        </span>
      );
    }
    if (action.includes('role')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Role Elevated
        </span>
      );
    }
    if (action.includes('cache')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Cache Purged
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-zinc-800 text-zinc-200">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
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
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-50">Security & Operations Ledger</h3>
            <p className="text-[14px] text-zinc-400 mt-1">
              Cryptographically verified audit trail for price overrides, dispatching, and administrator actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 h-[44px] rounded-lg border border-zinc-700 hover:bg-zinc-800 text-[14px] text-zinc-200 font-medium transition-colors cursor-pointer"
              title="Refresh audit log"
            >
              <RefreshCw className={`w-[14px] h-[14px] text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} />
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
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800">
          <span className="text-[13px] text-zinc-400 mr-2">Filter View:</span>
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
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-yellow-500 text-zinc-950 font-semibold shadow-md shadow-yellow-500/10'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs High-Density Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-[13px] font-medium text-zinc-400">
                <th className="p-4 px-6 w-[200px]">Timestamp</th>
                <th className="p-4 w-[220px]">Admin Actor</th>
                <th className="p-4 w-[170px]">Action Type</th>
                <th className="p-4">Details & Value Delta</th>
                <th className="p-4 px-6 text-right w-[150px]">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <TableSkeletonRows count={5} cols={5} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                        <Inbox className="w-8 h-8 text-yellow-500/60" />
                      </div>
                      <h4 className="text-[18px] font-semibold text-zinc-100">No audit entries found</h4>
                      <p className="text-[14px] text-zinc-400 mt-2 mb-6">
                        No events match the current filter or search criteria.
                      </p>
                      {(searchQuery || selectedCategory !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          className="px-6 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 text-[14px] font-semibold hover:bg-yellow-400 transition-all flex items-center justify-center cursor-pointer"
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
                  const oldPrice = details?.oldPrice as number | undefined;
                  const newPrice = details?.newPrice as number | undefined;
                  const hasPriceDelta = oldPrice !== undefined && newPrice !== undefined;
                  const priceDiff = hasPriceDelta ? newPrice - oldPrice : 0;
                  const materialName = (details?.materialName as string) || '';
                  const orderNumber = (details?.orderNumber as string) || '';
                  const vehicleNumber = (details?.vehicleNumber as string) || '';
                  const oldStatus = (details?.oldStatus as string) || '';
                  const newStatus = (details?.newStatus as string) || '';
                  const partnerName = (details?.partnerName as string) || '';
                  const partnerRole = (details?.partnerRole as string) || '';
                  const note = (details?.note as string) || '';

                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-zinc-800/60 transition-colors duration-200"
                    >
                      {/* Timestamp */}
                      <td className="p-4 px-6 align-top">
                        <div className="text-[13px] font-medium text-zinc-100 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </div>
                        <div className="text-[12px] text-zinc-400 mt-0.5">
                          {formatTimeAgo(log.createdAt)}
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="p-4 align-top">
                        <div className="font-medium text-[14px] text-zinc-100 leading-tight">
                          {log.actorName || (log.actorId.includes('@') ? log.actorId.split('@')[0] : log.actorId)}
                        </div>
                        <div className="text-[12px] text-zinc-400 font-mono mt-0.5 truncate max-w-[200px]" title={log.actorId}>
                          {log.actorId}
                        </div>
                        {log.ip && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-mono bg-zinc-800 border border-zinc-700/60 px-1.5 py-0.5 rounded mt-1">
                            <Terminal className="w-3 h-3 text-zinc-400" />
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
                            <div className="font-semibold text-[14px] text-zinc-100">
                              {materialName || 'Material Catalog Item'}
                            </div>
                            <div className="flex items-center gap-2 font-mono text-[13px]">
                              <span className="text-zinc-500 line-through">
                                {formatCurrency(oldPrice || 0)}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="font-semibold text-yellow-400">
                                {formatCurrency(newPrice || 0)}
                              </span>
                              <span
                                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                                  priceDiff >= 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {priceDiff >= 0 ? `+${formatCurrency(priceDiff)}` : formatCurrency(priceDiff)}
                              </span>
                            </div>
                            {note && (
                              <p className="text-[12px] text-zinc-400 mt-1">{note}</p>
                            )}
                          </div>
                        ) : orderNumber ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-[13px] text-zinc-100">
                                {orderNumber}
                              </span>
                              {vehicleNumber && (
                                <span className="font-mono text-[12px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-yellow-400">
                                  {vehicleNumber}
                                </span>
                              )}
                            </div>
                            {oldStatus && newStatus && (
                              <div className="text-[12px] text-zinc-400">
                                Status changed: <span className="capitalize text-zinc-400">{oldStatus}</span> →{' '}
                                <span className="font-medium capitalize text-yellow-400">{newStatus}</span>
                              </div>
                            )}
                            {note && (
                              <p className="text-[12px] text-zinc-400 mt-0.5">{note}</p>
                            )}
                          </div>
                        ) : partnerName ? (
                          <div className="space-y-1">
                            <div className="font-medium text-[14px] text-zinc-100">
                              {partnerName}
                            </div>
                            {partnerRole && (
                              <div className="text-[12px] text-zinc-400">{partnerRole}</div>
                            )}
                            {note && (
                              <p className="text-[12px] text-zinc-400 mt-0.5">{note}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-[13px] text-zinc-200">
                              {note || `Target ID: ${log.targetId}`}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Target Type */}
                      <td className="p-4 px-6 align-top text-right whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-mono uppercase rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
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
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between text-[13px] text-zinc-400 bg-zinc-900">
          <div>
            Showing <span className="font-semibold text-zinc-100">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-zinc-100">{totalItems}</span> audit entries
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
                className="p-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-[16px] h-[16px]" />
              </button>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage}
                className="p-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
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
