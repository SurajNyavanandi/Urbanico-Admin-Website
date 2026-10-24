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
      className={`bg-[#18181B] rounded-xl border border-[#3F3F46] p-6 shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-yellow-500/50 hover:bg-[#27272A]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-yellow-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <div className="text-3xl font-bold tracking-tight text-zinc-50 font-mono">
          {value}
        </div>
        {badge && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap border ${
              badge.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : badge.type === 'warning'
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                : badge.type === 'primary' || badge.type === 'info'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-zinc-400 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};

