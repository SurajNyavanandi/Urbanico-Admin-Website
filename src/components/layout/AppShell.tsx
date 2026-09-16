import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { AdminSidebar, NavigationTab } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ToastContainer, ToastMessage } from '../common/Toast';
import { IAdminUser } from '../../types';
import { fetchHealthApi } from '../../services/authApi';
import { fetchOrdersApi } from '../../services/orderApi';
import { verifyUrbanicoBackendCatalog } from '../../services/catalogVerifier';
import { CardSkeletonGrid } from '../common/ShimmerSkeleton';

import { OrdersView } from '../modules/orders/OrdersView';
import { MaterialsView } from '../modules/materials/MaterialsView';
import { CategoriesView } from '../modules/categories/CategoriesView';
import { ServicesView } from '../modules/services/ServicesView';
import { CustomersView } from '../modules/customers/CustomersView';

interface AppShellProps {
  adminUser: IAdminUser;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ adminUser, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('orders');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [dbConnected, setDbConnected] = useState(true);

  const showToast = useCallback(
    (title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
      const newToast: ToastMessage = {
        id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        message,
        type,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check health, count pending orders, and verify backend catalog data
  const loadSystemStatus = useCallback(async () => {
    try {
      const health = await fetchHealthApi();
      setDbConnected(health.database?.isConnected ?? true);

      const ordersData = await fetchOrdersApi({ status: 'received' });
      setPendingOrdersCount(ordersData.count || 0);

      // Verify backend catalog data on admin panel load / sync
      await verifyUrbanicoBackendCatalog();
    } catch {
      setDbConnected(false);
    }
  }, []);

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [loadSystemStatus]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadSystemStatus();
    setRefreshKey((k) => k + 1);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Live Data Synchronized', 'All catalog, queue, and pricing data refreshed.', 'success');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex text-[#1D1D1F]">
      {/* Fixed Desktop & Mobile Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        adminUser={adminUser}
        onLogout={onLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        pendingOrdersCount={pendingOrdersCount}
        dbConnected={dbConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="space-y-6 pt-4">
                <CardSkeletonGrid count={4} />
                <div className="h-64 bg-white rounded-2xl border border-[#E5E5EA] p-6 animate-pulse" />
              </div>
            }
          >
            <div key={refreshKey}>
              {currentTab === 'orders' && <OrdersView onShowToast={showToast} />}
              {currentTab === 'materials' && <MaterialsView onShowToast={showToast} />}
              {currentTab === 'categories' && <CategoriesView onShowToast={showToast} />}
              {currentTab === 'services' && <ServicesView onShowToast={showToast} />}
              {currentTab === 'customers' && <CustomersView onShowToast={showToast} />}
            </div>
          </Suspense>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};
