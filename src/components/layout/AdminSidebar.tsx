import React from 'react';
import {
  ShoppingBag,
  Package,
  Layers,
  Wrench,
  Users,
  LogOut,
  X,
  Database,
  ShieldCheck,
  UserCheck,
  HardHat,
} from 'lucide-react';
import { IAdminUser } from '../../types';

export type NavigationTab = 'orders' | 'materials' | 'categories' | 'services' | 'customers' | 'partner-kyc' | 'audit-logs';

interface AdminSidebarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  adminUser: IAdminUser;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingOrdersCount?: number;
  dbConnected?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onTabChange,
  adminUser,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  pendingOrdersCount = 0,
  dbConnected = true,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ElementType; count?: number }[] = [
    {
      id: 'orders',
      label: 'Orders Queue',
      icon: ShoppingBag,
      count: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'materials', label: 'Materials & Pricing', icon: Package },
    { id: 'categories', label: 'Categories & Brands', icon: Layers },
    { id: 'services', label: 'Trade Services', icon: Wrench },
    { id: 'customers', label: 'Builder Directory', icon: Users },
    { id: 'partner-kyc', label: 'Partner KYC', icon: UserCheck },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck },
  ];

  const handleSelect = (tab: NavigationTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-[#18181B] border-r border-[#3F3F46] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-[64px] px-6 flex items-center justify-between border-b border-[#3F3F46]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-yellow-500/10">
              <HardHat className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-zinc-50 block leading-tight">
                Urbanico
              </span>
              <span className="text-[11px] text-zinc-400 font-medium tracking-wide uppercase">
                Admin Portal
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-zinc-400 hover:text-zinc-100 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single Admin Identity Banner */}
        <div className="px-5 py-4 border-b border-[#3F3F46] bg-[#27272A]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center font-bold text-xs shrink-0">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-zinc-100 truncate leading-tight">
                {adminUser.name || 'Super Admin'}
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                {adminUser.email || 'admin@urbanico.in'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 h-11 text-sm transition-all duration-200 rounded-r-lg ${
                  isActive
                    ? 'bg-yellow-500 text-zinc-950 font-semibold border-l-4 border-yellow-500 shadow-sm'
                    : 'text-zinc-300 hover:bg-[#27272A] hover:text-zinc-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-zinc-950' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-zinc-950 text-yellow-400'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Live Backend Connection Indicator & Logout */}
        <div className="p-4 border-t border-[#3F3F46] space-y-2 bg-[#18181B]">
          <div className="px-3 py-2 rounded-lg bg-[#27272A]/60 flex items-center justify-between text-xs border border-[#3F3F46]">
            <div className="flex items-center gap-2 text-zinc-400">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              <span>API Gateway</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-red-400'
                }`}
              />
              <span className="text-xs text-zinc-300 font-medium">
                {dbConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 h-10 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 cursor-pointer font-medium"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

