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
  };

  const meta = titles[currentTab] || { title: 'Dashboard', subtitle: 'Overview' };

  return (
    <header className="h-[64px] bg-white/80 backdrop-blur-md border-b border-[#E5E5EA] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 -ml-2 rounded-[8px] text-[#555555] hover:text-[#000000] hover:bg-[#F5F5F7] transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-[20px] h-[20px]" />
        </button>
        <div>
          <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#000000] tracking-[-0.02em] leading-tight">
            {meta.title}
          </h2>
          <p className="text-[13px] text-[#555555] hidden sm:block mt-0.5">
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
          className="flex items-center gap-2 px-4 h-[32px] rounded-[8px] bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[13px] font-medium text-[#000000] active:scale-[0.98] transition-all"
          title="Synchronize live data with Express backend"
        >
          <RefreshCw className={`w-[14px] h-[14px] text-[#0071E3] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Live</span>
        </button>

        {/* Master Admin Indicator */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E5E5EA] text-[13px]">
          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
          <span className="text-[#555555]">Single Admin Mode:</span>
          <span className="font-medium text-[#000000]">9666635009</span>
        </div>
      </div>
    </header>
  );
};
