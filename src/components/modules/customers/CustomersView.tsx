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
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#000000]">Authorized Builder Profiles</h3>
          <p className="text-[14px] text-[#555555] mt-1">
            Verified construction companies and site delivery credentials.
          </p>
        </div>

        <div className="w-full sm:w-[280px]">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search company, phone, GSTIN..."
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7] text-[13px] font-medium text-[#555555]">
                <th className="p-4 px-6">Company Entity & GSTIN</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Primary Delivery Site</th>
                <th className="p-4 text-right">Orders</th>
                <th className="p-4 text-right">Total Spend</th>
                <th className="p-4 px-6 text-center">Account Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={4} cols={6} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#A1A1A6] mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-[18px] font-semibold text-[#000000]">No builders found</h4>
                      <p className="text-[14px] text-[#86868B] mt-2 mb-6">
                        Try modifying your search criteria.
                      </p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="px-6 py-[12px] h-[44px] rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
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
                    className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/80 transition-colors duration-200"
                  >
                    <td className="p-4 px-6">
                      <div className="font-semibold text-[15px] text-[#000000] leading-tight">
                        {c.companyName}
                      </div>
                      {c.gstin && (
                        <div className="text-[13px] font-mono text-[#86868B] mt-1">
                          GSTIN: {c.gstin}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="text-[14px] font-medium text-[#000000]">{c.name}</div>
                      <div className="text-[13px] font-mono text-[#555555] flex items-center gap-1.5 mt-1">
                        <Phone className="w-[14px] h-[14px] text-[#86868B]" />
                        <a href={`tel:${c.phone}`} className="hover:text-[#0071E3] transition-colors">
                          +91 {c.phone}
                        </a>
                      </div>
                      {c.email && (
                        <div className="text-[12px] text-[#86868B] flex items-center gap-1.5 mt-1">
                          <Mail className="w-[14px] h-[14px]" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-start gap-2 text-[14px] text-[#000000]">
                        <MapPin className="w-[16px] h-[16px] text-[#0071E3] shrink-0 mt-0.5" />
                        <span className="truncate max-w-[220px]">{c.primarySite}</span>
                      </div>
                      <div className="text-[13px] text-[#86868B] pl-[24px] mt-1">{c.city}</div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <span className="font-mono font-medium text-[15px] text-[#000000]">
                        {c.totalOrders}
                      </span>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <span className="font-mono font-medium text-[15px] text-[#000000]">
                        {formatCurrency(c.totalSpend)}
                      </span>
                    </td>

                    <td className="p-4 px-6 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#E8F5E9] text-[#2E7D32]">
                        <span className="w-1.5 h-1.5 rounded-full mr-2 bg-[#4CAF50]" />
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
        <div className="px-6 py-4 border-t border-[#E5E5EA] flex items-center justify-between text-[13px] text-[#555555]">
          <div>
            Showing <span className="font-semibold text-[#000000]">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-[#000000]">{totalItems}</span> builders
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
    </div>
  );
};
