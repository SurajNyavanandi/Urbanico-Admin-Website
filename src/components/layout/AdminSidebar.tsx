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
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[260px] bg-white border-r border-[#E5E5EA] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-[64px] px-6 flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <img 
              src="https://res.cloudinary.com/dfr0zghtc/image/upload/v1786533916/logo_b3cxbf.jpg" 
              alt="Urbanico Logo" 
              className="w-8 h-8 rounded-[8px] object-cover" 
            />
            <div>
              <span className="font-bold text-[18px] tracking-[-0.02em] text-[#000000] block leading-tight">
                Urbanico
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-[#86868B] hover:text-[#000000] p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Single Admin Identity Banner */}
        <div className="px-6 py-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5F5F7] text-[#000000] flex items-center justify-center font-medium text-[14px]">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-[#000000] truncate leading-tight">
                {adminUser.name || 'Super Admin'}
              </div>
              <div className="text-[12px] text-[#86868B] truncate mt-0.5">
                Admin
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 mt-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 h-[44px] rounded-[8px] text-[14px] transition-all duration-300 ${
                  isActive
                    ? 'bg-[#0071E3] text-white font-medium'
                    : 'text-[#1D1D1F] hover:bg-[#F5F5F7] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-[18px] h-[18px] ${
                      isActive ? 'text-white' : 'text-[#555555]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-white text-[#0071E3]'
                        : 'bg-[#FF3B30] text-white'
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
        <div className="p-4 space-y-2">
          <div className="px-3 py-2 rounded-[8px] flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 text-[#86868B]">
              <Database className="w-[14px] h-[14px]" />
              <span>Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  dbConnected ? 'bg-[#34C759]' : 'bg-[#FF3B30]'
                }`}
              />
              <span className="text-[12px] text-[#555555]">
                {dbConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 h-[44px] text-[14px] text-[#FF3B30] hover:bg-[#F5F5F7] rounded-[8px] transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
