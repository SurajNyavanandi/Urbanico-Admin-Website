import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    let ignore = false;
    fetchServicesApi()
      .then((list) => {
        if (!ignore) {
          setServices(list);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to fetch contractor services';
          onShowToast('Error', msg, 'error');
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [onShowToast]);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete service';
      onShowToast('Delete Error', msg, 'error');
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
      <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-zinc-50 shadow-md">
        <div>
          <h3 className="text-base font-bold text-zinc-100">Contractor & Labor Services Directory ({services.length} Total)</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Direct trade bookings for civil sites. Note: Trade services do not have sub-categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-5 h-10 w-full sm:w-auto shrink-0 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-zinc-950 text-xs font-bold shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-zinc-950" />
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

