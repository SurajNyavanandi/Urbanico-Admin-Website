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
    <div className="bg-zinc-900 rounded-[12px] border border-zinc-800 overflow-hidden flex flex-col justify-between hover:border-zinc-700 hover:shadow-lg transition-all duration-300 group">
      {/* Service Image Header */}
      <div className="h-[140px] w-full bg-zinc-950 relative overflow-hidden border-b border-zinc-800">
        {service.image && !imgError ? (
          <img
            src={service.image}
            alt={service.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-950">
            <Wrench className="w-[32px] h-[32px] mb-2 text-yellow-500/70" />
            <span className="text-[12px] font-medium text-zinc-400">Urbanico Trade Service</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-yellow-400 bg-yellow-500/10 backdrop-blur-sm px-2.5 py-1 rounded-[6px] border border-yellow-500/30">
            {service.tag || 'SERVICES'}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-900/90 backdrop-blur-sm p-1.5 rounded-[8px] border border-zinc-700 shadow-md">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="p-1.5 rounded-[6px] text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 transition-colors"
            title="Edit service details & image"
          >
            <Edit2 className="w-[14px] h-[14px]" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(service._id || service.id, service.name)}
            className="p-1.5 rounded-[6px] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete service listing"
          >
            <Trash2 className="w-[14px] h-[14px]" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div>
            <h3 className="text-[16px] font-semibold text-zinc-50 tracking-tight leading-tight">
              {service.name}
            </h3>
            <p className="text-[13px] text-zinc-400 mt-1 font-medium">
              {service.subtitle}
            </p>
          </div>

          {service.description && (
            <p className="text-[14px] text-zinc-400 mt-3 leading-relaxed line-clamp-2">
              {service.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-zinc-400">
            <Wrench className="w-[14px] h-[14px] text-yellow-500" />
            <span>Standard Base Rate:</span>
          </div>
          <span className="text-[15px] font-bold font-mono text-yellow-400">
            {service.rate}
          </span>
        </div>
      </div>
    </div>
  );
};
