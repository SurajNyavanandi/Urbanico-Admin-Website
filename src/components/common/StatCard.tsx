import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    type?: 'neutral' | 'success' | 'warning' | 'primary' | 'info';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#AEAEB2] active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#86868B] truncate">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#1D1D1F]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-[#1D1D1F] font-mono">
          {value}
        </div>
        {badge && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
              badge.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : badge.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : badge.type === 'primary'
                ? 'bg-blue-50 text-[#007AFF] border-blue-200'
                : badge.type === 'info'
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5EA]'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-[#86868B] truncate font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
