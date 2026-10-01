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
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-[#000000]">Contractor & Labor Services Directory ({services.length} Total)</h3>
          <p className="text-[14px] text-[#555555] mt-1">
            Direct trade bookings for civil sites. Note: Trade services do not have sub-categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-6 h-[44px] w-full sm:w-auto shrink-0 rounded-[8px] bg-[#0071E3] hover:bg-blue-600 text-white text-[14px] font-medium shadow-sm active:scale-[0.98] transition-all"
        >
          <Plus className="w-[16px] h-[16px]" />
          <span>Add Trade Service</span>
        </button>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <CardSkeletonGrid count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
