import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchPartnersApi, updatePartnerKycApi } from '../../../services/partnerApi';
import { IPartner, type KycStatus, type PartnerSpecialty } from '../../../types';
import { StatCard } from '../../common/StatCard';
import { SearchInput } from '../../common/SearchInput';
import { TableSkeletonRows } from '../../common/ShimmerSkeleton';
import { usePagination } from '../../../hooks/usePagination';
import { Modal } from '../../common/Modal';
import {
  Users,
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CreditCard,
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface PartnersViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

type FilterTab = 'all' | 'technicians' | 'drivers' | 'pending' | 'approved';

export const PartnersView: React.FC<PartnersViewProps> = ({ onShowToast }) => {
  const [partners, setPartners] = useState<IPartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('all');
  const [selectedPartner, setSelectedPartner] = useState<IPartner | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPartners = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      const list = await fetchPartnersApi();
      setPartners(list);
    } catch (err: any) {
      onShowToast('Error', err.message || 'Failed to fetch partner directory', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadPartners(true);
    setTimeout(() => {
      onShowToast('Registry Synced', 'Field technicians and driver list refreshed.', 'success');
    }, 300);
  };

  const handleToggleKyc = async (partner: IPartner, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus: KycStatus = partner.kycStatus === 'approved' ? 'pending' : 'approved';
    const prev = [...partners];

    // Optimistic UI update
    setPartners((curr) =>
      curr.map((p) => (p._id === partner._id ? { ...p, kycStatus: newStatus } : p))
    );
    if (selectedPartner?._id === partner._id) {
      setSelectedPartner((p) => (p ? { ...p, kycStatus: newStatus } : null));
    }

    try {
      setUpdatingId(partner._id);
      await updatePartnerKycApi(partner._id, newStatus);
      onShowToast(
        'KYC Status Updated',
        `${partner.name} is now ${newStatus.toUpperCase()}`,
        newStatus === 'approved' ? 'success' : 'info'
      );
    } catch (err: any) {
      setPartners(prev);
      onShowToast('Update Failed', err.message || 'Could not update KYC', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSetExplicitStatus = async (partnerId: string, status: KycStatus) => {
    const partner = partners.find((p) => p._id === partnerId);
    if (!partner) return;

    const prev = [...partners];
    setPartners((curr) =>
      curr.map((p) => (p._id === partnerId ? { ...p, kycStatus: status } : p))
    );
    if (selectedPartner?._id === partnerId) {
      setSelectedPartner((p) => (p ? { ...p, kycStatus: status } : null));
    }

    try {
      setUpdatingId(partnerId);
      await updatePartnerKycApi(partnerId, status);
      onShowToast(
        'KYC Status Set',
        `${partner.name} marked as ${status.toUpperCase()}`,
        status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info'
      );
    } catch (err: any) {
      setPartners(prev);
      onShowToast('Update Failed', err.message || 'Could not set status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      // Filter tab
      if (selectedFilter === 'technicians' && p.role !== 'technician') return false;
      if (selectedFilter === 'drivers' && p.role !== 'driver') return false;
      if (selectedFilter === 'pending' && p.kycStatus !== 'pending') return false;
      if (selectedFilter === 'approved' && p.kycStatus !== 'approved') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.specialty.toLowerCase().includes(q) ||
        (p.licenseNumber && p.licenseNumber.toLowerCase().includes(q)) ||
        (p.vehicleNumber && p.vehicleNumber.toLowerCase().includes(q)) ||
        p.city.toLowerCase().includes(q)
      );
    });
  }, [partners, searchQuery, selectedFilter]);

  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    totalItems,
  } = usePagination(filteredPartners, 10);

  const metrics = useMemo(() => {
    const total = partners.length;
    const approved = partners.filter((p) => p.kycStatus === 'approved').length;
    const pending = partners.filter((p) => p.kycStatus === 'pending').length;
    const drivers = partners.filter((p) => p.role === 'driver').length;

    return { total, approved, pending, drivers };
  }, [partners]);

  const renderKycBadge = (status: KycStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#FFF8EB] text-[#B45309] border border-[#FDE68A]/60">
            <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]/60">
            <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />
            Rejected
          </span>
        );
    }
  };

  const renderSpecialtyBadge = (specialty: PartnerSpecialty) => {
    const colors: Record<PartnerSpecialty, { bg: string; text: string; border: string }> = {
      'RCC Masonry': { bg: 'bg-[#FFF8EB]', text: 'text-[#B45309]', border: 'border-[#FDE68A]' },
      Electrical: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' },
      Plumbing: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', border: 'border-[#BAE6FD]' },
      Driver: { bg: 'bg-[#EBF5FF]', text: 'text-[#0071E3]', border: 'border-[#BFDBFE]' },
      'Excavator Operator': { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]', border: 'border-[#E9D5FF]' },
      'Structural Fabrication': { bg: 'bg-[#F1F5F9]', text: 'text-[#334155]', border: 'border-[#CBD5E1]' },
    };
    const c = colors[specialty] || { bg: 'bg-[#F5F5F7]', text: 'text-[#555555]', border: 'border-[#E5E5EA]' };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[12px] font-medium border ${c.bg} ${c.text} ${c.border}`}>
        {specialty}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Verified Field Partners"
          value={metrics.approved}
          subtitle="Aadhaar & trade license approved"
          icon={ShieldCheck}
        />
        <StatCard
          title="Pending KYC Queue"
          value={metrics.pending}
          subtitle="Technicians awaiting verification"
          icon={Users}
        />
        <StatCard
          title="Active Logistics Drivers"
          value={metrics.drivers}
          subtitle="Patancheru & Shamshabad fleet"
          icon={Truck}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[#000000]">Trade Partner & Field Technician Registry</h3>
            <p className="text-[14px] text-[#555555] mt-1">
              KYC documents, trade licenses, bank account verification, and dispatch credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 h-[44px] rounded-[8px] border border-[#E5E5EA] hover:bg-[#F5F5F7] text-[14px] text-[#000000] font-medium transition-colors cursor-pointer"
              title="Refresh partner list"
            >
              <RefreshCw className={`w-[14px] h-[14px] text-[#0071E3] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search name, phone, trade, license..."
              />
            </div>
          </div>
        </div>

        {/* Minimalist Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E5EA]">
          <span className="text-[13px] text-[#86868B] mr-2">Category:</span>
          {(
            [
              { id: 'all', label: `All Partners (${metrics.total})` },
              { id: 'technicians', label: 'Technicians' },
              { id: 'drivers', label: 'Fleet Drivers' },
              { id: 'pending', label: `Pending KYC (${metrics.pending})` },
              { id: 'approved', label: 'Approved' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                selectedFilter === filter.id
                  ? 'bg-[#0071E3] text-white shadow-sm'
                  : 'bg-[#F5F5F7] text-[#555555] hover:bg-[#E5E5EA] hover:text-[#000000]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Partners Table */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7] text-[13px] font-medium text-[#555555]">
                <th className="p-4 px-6 w-[240px]">Partner Identity</th>
                <th className="p-4">Contact & Hub</th>
                <th className="p-4">Trade Specialty</th>
                <th className="p-4">Rating & Jobs</th>
                <th className="p-4 text-center">KYC Status</th>
                <th className="p-4 px-6 text-center w-[120px]">Verification</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={5} cols={6} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#A1A1A6] mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-[18px] font-semibold text-[#000000]">No partners found</h4>
                      <p className="text-[14px] text-[#86868B] mt-2 mb-6">
                        No partners match your selected criteria.
                      </p>
                      {(searchQuery || selectedFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedFilter('all');
                          }}
                          className="px-6 py-[12px] h-[44px] rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 transition-all flex items-center justify-center cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((p) => {
                  const isApproved = p.kycStatus === 'approved';
                  const isUpdating = updatingId === p._id;

                  return (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedPartner(p)}
                      className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/80 transition-colors duration-200 cursor-pointer"
                    >
                      {/* Name & Aadhaar */}
                      <td className="p-4 px-6">
                        <div className="font-semibold text-[14px] text-[#000000] leading-tight">
                          {p.name}
                        </div>
                        {p.aadhaarNumber && (
                          <div
                            className="text-[12px] text-[#86868B] font-mono mt-1 flex items-center gap-1.5"
                            style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace' }}
                          >
                            <span>Aadhaar: {p.aadhaarNumber}</span>
                          </div>
                        )}
                        {p.bankVerified && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-1.5 py-0.2 rounded mt-1">
                            <CreditCard className="w-3 h-3 text-[#4CAF50]" />
                            Bank Penny-Drop Verified
                          </div>
                        )}
                      </td>

                      {/* Contact & Zone */}
                      <td className="p-4">
                        <div className="text-[13px] font-mono text-[#000000] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#86868B]" />
                          <a
                            href={`tel:${p.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-[#0071E3] transition-colors"
                          >
                            +91 {p.phone}
                          </a>
                        </div>
                        <div className="text-[12px] text-[#64748B] flex items-center gap-1 mt-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-[#0071E3] shrink-0" />
                          <span>{p.city}</span>
                        </div>
                      </td>

                      {/* Trade Specialty & License */}
                      <td className="p-4">
                        <div>{renderSpecialtyBadge(p.specialty)}</div>
                        {p.licenseNumber && (
                          <div className="text-[11px] text-[#86868B] font-mono mt-1 truncate max-w-[240px]" title={p.licenseNumber}>
                            {p.licenseNumber}
                          </div>
                        )}
                        {p.vehicleNumber && (
                          <div className="text-[11px] text-[#0071E3] font-mono mt-0.5 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>{p.vehicleNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Rating & Jobs */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[13px] font-semibold text-[#000000]">
                          <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{p.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-[12px] text-[#86868B] mt-0.5 font-mono">
                          {p.completedJobs} verified jobs
                        </div>
                      </td>

                      {/* KYC Status Badge */}
                      <td className="p-4 text-center whitespace-nowrap">
                        {renderKycBadge(p.kycStatus)}
                      </td>

                      {/* Apple-style iOS Verification Switch */}
                      <td className="p-4 px-6 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isApproved}
                            disabled={isUpdating}
                            onClick={(e) => handleToggleKyc(p, e)}
                            title={isApproved ? 'Click to set Pending Review' : 'Click to Approve KYC'}
                            className={`w-[44px] h-[26px] rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer relative focus:outline-none ${
                              isApproved ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <span
                              className={`block w-[22px] h-[22px] bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                isApproved ? 'translate-x-[18px]' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
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
            <span className="font-semibold text-[#000000]">{totalItems}</span> partners
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

      {/* Partner Inspection & KYC Verification Detail Modal */}
      {selectedPartner && (
        <Modal
          isOpen={Boolean(selectedPartner)}
          onClose={() => setSelectedPartner(null)}
          title={`Partner Profile: ${selectedPartner.name}`}
          subtitle={`Registered on ${new Date(selectedPartner.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Header Identity Card */}
            <div className="bg-[#F5F5F7] rounded-[8px] p-5 border border-[#E5E5EA] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[18px] font-bold text-[#000000]">{selectedPartner.name}</h3>
                  {renderSpecialtyBadge(selectedPartner.specialty)}
                </div>
                <div className="flex items-center gap-3 text-[13px] text-[#555555] mt-1.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#86868B]" />
                    +91 {selectedPartner.phone}
                  </span>
                  {selectedPartner.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#86868B]" />
                      {selectedPartner.email}
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-[#86868B] flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span>{selectedPartner.city}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 text-[15px] font-bold text-[#000000]">
                  <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{selectedPartner.rating.toFixed(1)}</span>
                </div>
                <div className="text-[12px] text-[#86868B] mt-0.5">
                  {selectedPartner.completedJobs} Site Jobs
                </div>
              </div>
            </div>

            {/* KYC & Credential Details */}
            <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 space-y-4">
              <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B] block">
                Verification Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="p-3 bg-[#F5F5F7] rounded-[8px] border border-[#E5E5EA]">
                  <span className="text-[11px] text-[#86868B] block mb-1">Aadhaar Card (UIDAI)</span>
                  <div
                    className="font-mono font-semibold text-[#000000] text-[14px]"
                    style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace' }}
                  >
                    {selectedPartner.aadhaarNumber || 'Not Submitted'}
                  </div>
                </div>

                <div className="p-3 bg-[#F5F5F7] rounded-[8px] border border-[#E5E5EA]">
                  <span className="text-[11px] text-[#86868B] block mb-1">Trade Certification / License</span>
                  <div className="font-semibold text-[#000000] truncate">
                    {selectedPartner.licenseNumber || 'Under Verification'}
                  </div>
                </div>
              </div>

              {selectedPartner.vehicleNumber && (
                <div className="p-3 bg-[#F5F5F7] rounded-[8px] border border-[#E5E5EA] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#86868B] block">Vehicle Plate Number (Commercial HMV)</span>
                    <span
                      className="font-mono font-bold text-[#0071E3] text-[15px]"
                      style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace' }}
                    >
                      {selectedPartner.vehicleNumber}
                    </span>
                  </div>
                  <span className="text-[12px] px-2.5 py-1 rounded bg-[#EBF5FF] text-[#0071E3] font-medium">
                    Fleet Assigned
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-[13px]">
                <span className="text-[#555555]">Bank Account Penny-Drop Test:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-medium ${
                    selectedPartner.bankVerified
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : 'bg-[#FFF8EB] text-[#B45309]'
                  }`}
                >
                  {selectedPartner.bankVerified ? 'Verified & Linked' : 'Pending Penny-Drop Verification'}
                </span>
              </div>
            </div>

            {/* KYC Status Decision Control */}
            <div className="bg-[#F5F5F7] rounded-[8px] p-5 border border-[#E5E5EA] space-y-3">
              <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-[#86868B] block">
                Administrative Verification Decision
              </span>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSetExplicitStatus(selectedPartner._id, 'approved')}
                  disabled={updatingId === selectedPartner._id}
                  className={`flex-1 py-2.5 px-4 rounded-[8px] text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPartner.kycStatus === 'approved'
                      ? 'bg-[#34C759] text-white shadow-sm'
                      : 'bg-white border border-[#E5E5EA] text-[#2E7D32] hover:bg-[#E8F5E9]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Partner
                </button>

                <button
                  type="button"
                  onClick={() => handleSetExplicitStatus(selectedPartner._id, 'pending')}
                  disabled={updatingId === selectedPartner._id}
                  className={`flex-1 py-2.5 px-4 rounded-[8px] text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPartner.kycStatus === 'pending'
                      ? 'bg-[#F59E0B] text-white shadow-sm'
                      : 'bg-white border border-[#E5E5EA] text-[#B45309] hover:bg-[#FFF8EB]'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Hold (Pending)
                </button>

                <button
                  type="button"
                  onClick={() => handleSetExplicitStatus(selectedPartner._id, 'rejected')}
                  disabled={updatingId === selectedPartner._id}
                  className={`flex-1 py-2.5 px-4 rounded-[8px] text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPartner.kycStatus === 'rejected'
                      ? 'bg-[#EF4444] text-white shadow-sm'
                      : 'bg-white border border-[#E5E5EA] text-[#C62828] hover:bg-[#FFEBEE]'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="py-2.5 px-8 bg-[#0071E3] text-white text-[14px] font-medium rounded-[8px] hover:bg-blue-600 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
