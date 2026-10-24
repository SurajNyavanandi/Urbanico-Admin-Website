import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import type { NavigationTab } from './AdminSidebar';

interface AdminHeaderProps {
  currentTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onRefresh,
  isRefreshing = false,
}) => {
  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    orders: {
      title: 'Orders Triage Queue',
      subtitle: 'Dispatch, lifecycle management & invoice dispatching',
    },
    materials: {
      title: 'Materials & Dynamic Pricing',
      subtitle: 'Instant price editing, stock flags & catalog specifications',
    },
    categories: {
      title: 'Categories & Sub-Categories',
      subtitle: 'Live brand tags, starting rates & category metadata',
    },
    services: {
      title: 'Trade Contractor Services',
      subtitle: 'Verified masonry, fabrication, electrical & plumbing team rates',
    },
    customers: {
      title: 'Registered Builders Directory',
      subtitle: 'Client entities, GSTIN credentials & active delivery sites',
    },
    'partner-kyc': {
      title: 'Field Partner & Technician KYC',
      subtitle: 'Aadhaar validation, trade licenses, bank verification & dispatch clearance',
    },
    'audit-logs': {
      title: 'Security & Price Audit Logs',
      subtitle: 'Immutable record of price alterations, role elevations & system actions',
    },
  };

  const meta = titles[currentTab] || { title: 'Dashboard', subtitle: 'Overview' };

  return (
    <header className="h-[64px] bg-[#18181B]/90 backdrop-blur-md border-b border-[#3F3F46] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between text-zinc-50">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-[#27272A] transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-50 tracking-tight leading-tight">
            {meta.title}
          </h2>
          <p className="text-xs text-zinc-400 hidden sm:block mt-0.5">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Sync / Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 h-8 rounded-lg bg-[#27272A] hover:bg-zinc-700 border border-[#3F3F46] text-xs font-semibold text-zinc-100 active:scale-[0.98] transition-all cursor-pointer"
          title="Synchronize live data with Express backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-yellow-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Live</span>
        </button>

        {/* Master Admin Indicator */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#3F3F46] text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-zinc-400">Master Session:</span>
          <span className="font-semibold text-yellow-400">9666635009</span>
        </div>
      </div>
    </header>
  );
};

