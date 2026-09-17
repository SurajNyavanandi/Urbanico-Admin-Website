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
    <div className="bg-white rounded-[12px] border border-[#E5E5EA] overflow-hidden flex flex-col justify-between hover:border-[#D2D2D7] hover:shadow-sm transition-all duration-300 group">
      {/* Service Image Header */}
      <div className="h-[140px] w-full bg-[#F5F5F7] relative overflow-hidden border-b border-[#E5E5EA]">
        {service.image && !imgError ? (
          <img
            src={service.image}
            alt={service.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#A1A1A6] bg-linear-to-br from-[#F5F5F7] to-[#E5E5EA]">
            <Wrench className="w-[32px] h-[32px] mb-2 text-[#A1A1A6]" />
            <span className="text-[12px] font-medium">Urbanico Trade Service</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#0071E3] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-[6px] border border-[#0071E3]/20 shadow-xs">
            {service.tag || 'SERVICES'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1.5 rounded-[8px] border border-[#E5E5EA]/60 shadow-xs">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="p-1.5 rounded-[6px] text-[#555555] hover:text-[#000000] hover:bg-[#F5F5F7] transition-colors"
            title="Edit service details & image"
          >
            <Edit2 className="w-[14px] h-[14px]" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(service._id || service.id, service.name)}
            className="p-1.5 rounded-[6px] text-[#555555] hover:text-[#FF3B30] hover:bg-red-50 transition-colors"
            title="Delete service listing"
          >
            <Trash2 className="w-[14px] h-[14px]" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#000000] tracking-tight leading-tight">
              {service.name}
            </h3>
            <p className="text-[13px] text-[#555555] mt-1 font-medium">
              {service.subtitle}
            </p>
          </div>

          {service.description && (
            <p className="text-[14px] text-[#555555] mt-3 leading-relaxed line-clamp-2">
              {service.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-[#E5E5EA] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-[#86868B]">
            <Wrench className="w-[14px] h-[14px]" />
            <span>Standard Base Rate:</span>
          </div>
          <span className="text-[15px] font-bold font-mono text-[#000000]">
            {service.rate}
          </span>
        </div>
      </div>
    </div>
  );
};
