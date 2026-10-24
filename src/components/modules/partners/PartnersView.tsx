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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch partner directory';
      onShowToast('Error', msg, 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    let ignore = false;
    fetchPartnersApi()
      .then((list) => {
        if (!ignore) {
          setPartners(list);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch partner directory';
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
    } catch (err: unknown) {
      setPartners(prev);
      const msg = err instanceof Error ? err.message : 'Could not update KYC';
      onShowToast('Update Failed', msg, 'error');
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
    } catch (err: unknown) {
      setPartners(prev);
      const msg = err instanceof Error ? err.message : 'Could not set status';
      onShowToast('Update Failed', msg, 'error');
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            Rejected
          </span>
        );
    }
  };

  const renderSpecialtyBadge = (specialty: PartnerSpecialty) => {
    const colors: Record<PartnerSpecialty, { bg: string; text: string; border: string }> = {
      'RCC Masonry': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
      Electrical: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
      Plumbing: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
      Driver: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      'Excavator Operator': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
      'Structural Fabrication': { bg: 'bg-zinc-800', text: 'text-zinc-300', border: 'border-zinc-700' },
    };
    const c = colors[specialty] || { bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700' };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] font-medium border ${c.bg} ${c.text} ${c.border}`}>
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
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-zinc-50">Trade Partner & Field Technician Registry</h3>
            <p className="text-[14px] text-zinc-400 mt-1">
              KYC documents, trade licenses, bank account verification, and dispatch credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 h-[44px] rounded-lg border border-zinc-700 hover:bg-zinc-800 text-[14px] text-zinc-200 font-medium transition-colors cursor-pointer"
              title="Refresh partner list"
            >
              <RefreshCw className={`w-[14px] h-[14px] text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} />
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
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800">
          <span className="text-[13px] text-zinc-400 mr-2">Category:</span>
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
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                selectedFilter === filter.id
                  ? 'bg-yellow-500 text-zinc-950 font-semibold shadow-md shadow-yellow-500/10'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Partners Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-[13px] font-medium text-zinc-400">
                <th className="p-4 px-6 w-[240px]">Partner Identity</th>
                <th className="p-4">Contact & Hub</th>
                <th className="p-4">Trade Specialty</th>
                <th className="p-4">Rating & Jobs</th>
                <th className="p-4 text-center">KYC Status</th>
                <th className="p-4 px-6 text-center w-[120px]">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <TableSkeletonRows count={5} cols={6} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                        <Inbox className="w-8 h-8 text-yellow-500/60" />
                      </div>
                      <h4 className="text-[18px] font-semibold text-zinc-100">No partners found</h4>
                      <p className="text-[14px] text-zinc-400 mt-2 mb-6">
                        No partners match your selected criteria.
                      </p>
                      {(searchQuery || selectedFilter !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedFilter('all');
                          }}
                          className="px-6 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 text-[14px] font-semibold hover:bg-yellow-400 transition-all flex items-center justify-center cursor-pointer"
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
                      className="hover:bg-zinc-800/60 transition-colors duration-200 cursor-pointer"
                    >
                      {/* Name & Aadhaar */}
                      <td className="p-4 px-6">
                        <div className="font-semibold text-[14px] text-zinc-100 leading-tight">
                          {p.name}
                        </div>
                        {p.aadhaarNumber && (
                          <div
                            className="text-[12px] text-zinc-400 font-mono mt-1 flex items-center gap-1.5"
                          >
                            <span>Aadhaar: {p.aadhaarNumber}</span>
                          </div>
                        )}
                        {p.bankVerified && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded mt-1">
                            <CreditCard className="w-3 h-3 text-emerald-400" />
                            Bank Penny-Drop Verified
                          </div>
                        )}
                      </td>

                      {/* Contact & Zone */}
                      <td className="p-4">
                        <div className="text-[13px] font-mono text-zinc-200 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-yellow-500/80" />
                          <a
                            href={`tel:${p.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-yellow-400 transition-colors"
                          >
                            +91 {p.phone}
                          </a>
                        </div>
                        <div className="text-[12px] text-zinc-400 flex items-center gap-1 mt-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-yellow-500 shrink-0" />
                          <span>{p.city}</span>
                        </div>
                      </td>

                      {/* Trade Specialty & License */}
                      <td className="p-4">
                        <div>{renderSpecialtyBadge(p.specialty)}</div>
                        {p.licenseNumber && (
                          <div className="text-[11px] text-zinc-400 font-mono mt-1 truncate max-w-[240px]" title={p.licenseNumber}>
                            {p.licenseNumber}
                          </div>
                        )}
                        {p.vehicleNumber && (
                          <div className="text-[11px] text-yellow-400 font-mono mt-0.5 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-yellow-400" />
                            <span>{p.vehicleNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Rating & Jobs */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[13px] font-semibold text-zinc-100">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span>{p.rating.toFixed(1)}</span>
                        </div>
                        <div className="text-[12px] text-zinc-400 mt-0.5 font-mono">
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
                              isApproved ? 'bg-emerald-500' : 'bg-zinc-700'
                            } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            <span
                              className={`block w-[22px] h-[22px] bg-zinc-950 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
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
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between text-[13px] text-zinc-400 bg-zinc-900">
          <div>
            Showing <span className="font-semibold text-zinc-100">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-zinc-100">{totalItems}</span> partners
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
            <div className="bg-zinc-950 rounded-lg p-5 border border-zinc-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[18px] font-bold text-zinc-50">{selectedPartner.name}</h3>
                  {renderSpecialtyBadge(selectedPartner.specialty)}
                </div>
                <div className="flex items-center gap-3 text-[13px] text-zinc-400 mt-1.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-yellow-500/80" />
                    +91 {selectedPartner.phone}
                  </span>
                  {selectedPartner.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      {selectedPartner.email}
                    </span>
                  )}
                </div>
                <div className="text-[13px] text-zinc-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-yellow-500" />
                  <span>{selectedPartner.city}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 text-[15px] font-bold text-zinc-100">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{selectedPartner.rating.toFixed(1)}</span>
                </div>
                <div className="text-[12px] text-zinc-400 mt-0.5">
                  {selectedPartner.completedJobs} Site Jobs
                </div>
              </div>
            </div>

            {/* KYC & Credential Details */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-4">
              <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-zinc-400 block">
                Verification Credentials
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
                <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  <span className="text-[11px] text-zinc-400 block mb-1">Aadhaar Card (UIDAI)</span>
                  <div
                    className="font-mono font-semibold text-zinc-100 text-[14px]"
                  >
                    {selectedPartner.aadhaarNumber || 'Not Submitted'}
                  </div>
                </div>

                <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                  <span className="text-[11px] text-zinc-400 block mb-1">Trade Certification / License</span>
                  <div className="font-semibold text-zinc-100 truncate">
                    {selectedPartner.licenseNumber || 'Under Verification'}
                  </div>
                </div>
              </div>

              {selectedPartner.vehicleNumber && (
                <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Vehicle Plate Number (Commercial HMV)</span>
                    <span
                      className="font-mono font-bold text-yellow-400 text-[15px]"
                    >
                      {selectedPartner.vehicleNumber}
                    </span>
                  </div>
                  <span className="text-[12px] px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-medium">
                    Fleet Assigned
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-[13px]">
                <span className="text-zinc-400">Bank Account Penny-Drop Test:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[12px] font-medium ${
                    selectedPartner.bankVerified
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {selectedPartner.bankVerified ? 'Verified & Linked' : 'Pending Penny-Drop Verification'}
                </span>
              </div>
            </div>

            {/* KYC Status Decision Control */}
            <div className="bg-zinc-950 rounded-lg p-5 border border-zinc-800 space-y-3">
              <span className="text-[12px] font-semibold tracking-[0.05em] uppercase text-zinc-400 block">
                Administrative Verification Decision
              </span>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSetExplicitStatus(selectedPartner._id, 'approved')}
                  disabled={updatingId === selectedPartner._id}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPartner.kycStatus === 'approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-zinc-900 border border-zinc-700 text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Partner
                </button>

                <button
                  type="button"
                  onClick={() => handleSetExplicitStatus(selectedPartner._id, 'pending')}
                  disabled={updatingId === selectedPartner._id}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPartner.kycStatus === 'pending'
                      ? 'bg-yellow-500 text-zinc-950 font-semibold shadow-sm'
                      : 'bg-zinc-900 border border-zinc-700 text-yellow-400 hover:bg-yellow-500/10'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Hold (Pending)
                </button>

                <button
                  type="button"
                  onClick={() => handleSetExplicitStatus(selectedPartner._id, 'rejected')}
                  disabled={updatingId === selectedPartner._id}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedPartner.kycStatus === 'rejected'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-zinc-900 border border-zinc-700 text-red-400 hover:bg-red-500/10'
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
                className="py-2.5 px-8 bg-yellow-500 text-zinc-950 text-[14px] font-semibold rounded-lg hover:bg-yellow-400 transition-all cursor-pointer shadow-md shadow-yellow-500/10"
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
