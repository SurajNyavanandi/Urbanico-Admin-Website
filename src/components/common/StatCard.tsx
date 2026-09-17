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
      className={`bg-[#F5F5F7] rounded-[8px] border-0 p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-semibold tracking-[-0.01em] text-[#555555]">
          {title}
        </span>
        {Icon && (
          <div className="w-[32px] h-[32px] rounded-[8px] bg-white flex items-center justify-center text-[#000000] shadow-sm">
            <Icon className="w-[16px] h-[16px]" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[34px] font-semibold tracking-[-0.02em] leading-tight text-[#000000]">
          {value}
        </div>
        {badge && (
          <span
            className={`text-[12px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
              badge.type === 'success'
                ? 'bg-[#34C759] text-white'
                : badge.type === 'warning'
                ? 'bg-[#FF9500] text-white'
                : badge.type === 'primary'
                ? 'bg-[#0071E3] text-white'
                : badge.type === 'info'
                ? 'bg-[#0071E3] text-white'
                : 'bg-[#E5E5EA] text-[#555555]'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-[14px] text-[#A1A1A6] font-normal truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
