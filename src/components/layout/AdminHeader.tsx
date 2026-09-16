import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import { NavigationTab } from './AdminSidebar';

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
    <header className="h-16 bg-white border-b border-[#E5E5EA] sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#1D1D1F] tracking-tight leading-tight">
            {meta.title}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#86868B] hidden sm:block">
            {meta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sync / Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5EA] bg-white text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] active:scale-[0.98] transition-all"
          title="Synchronize live data with Express backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#007AFF] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync Live</span>
        </button>

        {/* Master Admin Indicator */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#E5E5EA] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#34C759]" />
          <span className="text-[#86868B]">Single Admin Mode:</span>
          <span className="font-mono font-semibold text-[#1D1D1F]">9666635009</span>
        </div>
      </div>
    </header>
  );
};
