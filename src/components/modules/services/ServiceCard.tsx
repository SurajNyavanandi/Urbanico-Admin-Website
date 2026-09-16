import React, { useState } from 'react';
import { IService } from '../../../types';
import { Edit2, Trash2, Wrench } from 'lucide-react';

interface ServiceCardProps {
  service: IService;
  onEdit: (service: IService) => void;
  onDelete: (id: string, name: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#AEAEB2] transition-colors group">
      {/* Service Image Header */}
      <div className="h-32 w-full bg-[#F5F5F7] relative overflow-hidden border-b border-[#E5E5EA]">
        {service.image && !imgError ? (
          <img
            src={service.image}
            alt={service.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#86868B] bg-linear-to-br from-[#F5F5F7] to-[#E5E5EA]">
            <Wrench className="w-8 h-8 mb-1 text-[#86868B]" />
            <span className="text-[11px] font-medium">Urbanico Trade Service</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-blue-200/60 shadow-xs">
            {service.tag || 'SERVICES'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-white/60 shadow-xs">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            title="Edit service details & image"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(service._id || service.id, service.name)}
            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#FF3B30] hover:bg-red-50 transition-colors"
            title="Delete service listing"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div>
            <h3 className="text-base font-bold text-[#1D1D1F] tracking-tight leading-tight">
              {service.name}
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5 font-medium">
              {service.subtitle}
            </p>
          </div>

          {service.description && (
            <p className="text-xs text-[#86868B] mt-2.5 leading-relaxed line-clamp-2">
              {service.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#86868B]">
            <Wrench className="w-3.5 h-3.5" />
            <span>Standard Base Rate:</span>
          </div>
          <span className="text-sm font-bold font-mono text-[#1D1D1F]">
            {service.rate}
          </span>
        </div>
      </div>
    </div>
  );
};
