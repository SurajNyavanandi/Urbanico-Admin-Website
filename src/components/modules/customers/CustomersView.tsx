import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCustomersApi } from '../../../services/authApi';
import { ICustomer } from '../../../types';
import { StatCard } from '../../common/StatCard';
import { SearchInput } from '../../common/SearchInput';
import { TableSkeletonRows } from '../../common/ShimmerSkeleton';
import { formatCurrency } from '../../../utils/formatters';
import { usePagination } from '../../../hooks/usePagination';
import {
  Building2,
  Users,
  Wallet,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';

interface CustomersViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onShowToast }) => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await fetchCustomersApi();
      setCustomers(list);
    } catch (err: any) {
      onShowToast('Error', err.message || 'Failed to fetch customer directory', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    totalItems,
  } = usePagination(filteredCustomers, 10);

  const metrics = useMemo(() => {
    const total = customers.length;
    let totalSpendSum = 0;
    let totalOrdersSum = 0;

    for (const c of customers) {
      totalSpendSum += c.totalSpend || 0;
      totalOrdersSum += c.totalOrders || 0;
    }

    return {
      total,
      totalSpendSum,
      totalOrdersSum,
    };
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Registered Builders"
          value={metrics.total}
          subtitle="Active construction developers"
          icon={Building2}
        />
        <StatCard
          title="Procurement Volume"
          value={metrics.totalOrdersSum}
          subtitle="Cumulative site orders placed"
          icon={Users}
        />
        <StatCard
          title="Total Lifetime Spend"
          value={formatCurrency(metrics.totalSpendSum)}
          subtitle="Gross volume processed"
          icon={Wallet}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h3 className="text-sm font-bold text-[#1D1D1F]">Authorized Builder Profiles</h3>
          <p className="text-xs text-[#86868B] mt-0.5">
            Verified construction companies and site delivery credentials.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search company, phone, GSTIN..."
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]/50 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                <th className="p-4">Company Entity & GSTIN</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Primary Delivery Site</th>
                <th className="p-4 text-right">Orders</th>
                <th className="p-4 text-right">Total Spend</th>
                <th className="p-4 text-center">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={4} cols={6} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B] mb-3">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#1D1D1F]">No builders found</h4>
                      <p className="text-xs text-[#86868B] mt-1 mb-4">
                        Try modifying your search criteria.
                      </p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-blue-600 transition-all"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/60 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-sm text-[#1D1D1F] leading-tight">
                        {c.companyName}
                      </div>
                      {c.gstin && (
                        <div className="text-xs font-mono text-[#86868B] mt-0.5">
                          GSTIN: {c.gstin}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="text-xs font-medium text-[#1D1D1F]">{c.name}</div>
                      <div className="text-xs font-mono text-[#86868B] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${c.phone}`} className="hover:text-[#007AFF]">
                          +91 {c.phone}
                        </a>
                      </div>
                      {c.email && (
                        <div className="text-[11px] text-[#AEAEB2] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-start gap-1.5 text-xs text-[#1D1D1F]">
                        <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                        <span className="truncate max-w-55">{c.primarySite}</span>
                      </div>
                      <div className="text-[11px] text-[#86868B] pl-5 mt-0.5">{c.city}</div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#1D1D1F]">
                        {c.totalOrders}
                      </span>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-[#1D1D1F]">
                        {formatCurrency(c.totalSpend)}
                      </span>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#86868B]">
          <div>
            Showing <span className="font-semibold text-[#1D1D1F]">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-[#1D1D1F]">{totalItems}</span> builders
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
    </div>
  );
};
