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
} from 'lucide-react';
import { IAdminUser } from '../../types';

export type NavigationTab = 'orders' | 'materials' | 'categories' | 'services' | 'customers';
export const NavigationTab = {};

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
  const navItems: { id: NavigationTab; label: string; icon: any; count?: number }[] = [
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#E5E5EA] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-[#E5E5EA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm">
              U
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1D1D1F] block leading-tight">
                Urbanico
              </span>
              <span className="text-[11px] font-medium text-[#86868B] block">
                Admin Control
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-[#86868B] hover:text-[#1D1D1F] p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single Admin Identity Banner (Per specification: strictly single admin) */}
        <div className="p-4 border-b border-[#E5E5EA] bg-[#F5F5F7]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#1D1D1F] truncate leading-tight">
                {adminUser.name || 'Super Admin'}
              </div>
              <div className="text-[11px] font-mono text-[#86868B] truncate mt-0.5">
                +91 {adminUser.phone || '9666635009'}
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black text-white">
              MASTER
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#007AFF] text-white shadow-xs font-semibold'
                    : 'text-[#1D1D1F] hover:bg-[#F5F5F7] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-[#86868B]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-[#007AFF]'
                        : 'bg-red-50 text-[#FF3B30] border border-red-200'
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
        <div className="p-3 border-t border-[#E5E5EA] space-y-2">
          <div className="px-3 py-2 rounded-xl bg-[#F5F5F7] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#86868B]">
              <Database className="w-3.5 h-3.5" />
              <span>Express + Mongo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbConnected ? 'bg-[#34C759] animate-pulse' : 'bg-[#FF3B30]'
                }`}
              />
              <span className="font-semibold text-[11px] text-[#1D1D1F]">
                {dbConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#FF3B30] hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Administrator</span>
          </button>
        </div>
      </aside>
    </>
  );
};
