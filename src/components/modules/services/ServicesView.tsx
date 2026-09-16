import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchServicesApi,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
} from '../../../services/serviceApi';
import { ServiceCard } from './ServiceCard';
import { AddEditServiceModal } from './AddEditServiceModal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { StatCard } from '../../common/StatCard';
import { CardSkeletonGrid } from '../../common/ShimmerSkeleton';
import { IService } from '../../../types';
import { Wrench, Plus, Users, ShieldCheck } from 'lucide-react';

interface ServicesViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onShowToast }) => {
  const [services, setServices] = useState<IService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await fetchServicesApi();
      setServices(list);
    } catch (err: any) {
      onShowToast('Error', err.message || 'Failed to fetch contractor services', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSaveService = async (data: Partial<IService>, isEdit: boolean, id?: string) => {
    if (isEdit && id) {
      const updated = await updateServiceApi(id, data);
      setServices((prev) => prev.map((s) => (s._id === id || s.id === id ? updated : s)));
      return updated;
    } else {
      const created = await createServiceApi(data);
      setServices((prev) => [...prev, created]);
      return created;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteServiceApi(deleteTarget.id);
      setServices((prev) => prev.filter((s) => s._id !== deleteTarget.id && s.id !== deleteTarget.id));
      onShowToast('Service Removed', `${deleteTarget.name} has been archived.`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      onShowToast('Delete Error', err.message || 'Failed to delete service', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Trade Services"
          value={services.length}
          subtitle="Direct contractor trades (no sub-categories)"
          icon={Wrench}
          badge={{ text: `${services.length} Direct Trades`, type: 'info' }}
        />
        <StatCard
          title="Contractor Verification"
          value="100% Background Checked"
          subtitle="ID verified site workers"
          icon={ShieldCheck}
          badge={{ text: 'Verified', type: 'success' }}
        />
        <StatCard
          title="Demo Visits"
          value="From ₹99"
          subtitle="Initial inspection booking fee"
          icon={Users}
        />
      </div>

      {/* Header controls banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h3 className="text-sm font-bold text-[#1D1D1F]">Contractor & Labor Services Directory ({services.length} Total)</h3>
          <p className="text-xs text-[#86868B] mt-0.5">
            Direct trade bookings for civil sites. Note: Trade services do not have sub-categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade Service</span>
        </button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <ServiceCard
              key={srv._id || srv.id}
              service={srv}
              onEdit={(s) => {
                setEditingService(s);
                setIsModalOpen(true);
              }}
              onDelete={(id, name) => setDeleteTarget({ id, name })}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddEditServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingService(null);
        }}
        service={editingService}
        onSave={handleSaveService}
        onShowToast={onShowToast}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Service"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from trade services?`}
        confirmLabel="Remove Listing"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
