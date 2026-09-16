import { useState, useEffect, useCallback } from 'react';
import { fetchOrdersApi, updateOrderStatusApi } from '../services/orderApi';
import { IOrder, OrderStatus } from '../types';
import { useDebounce } from './useDebounce';

export function useOrders(initialStatus: string = 'all') {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchOrdersApi({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: debouncedSearch.trim() || undefined,
      });
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders from server');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, debouncedSearch]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Optimistic status update with automatic rollback on failure
  const updateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    extraFields?: {
      vehicleNumber?: string;
      driverName?: string;
      driverPhone?: string;
      eWayBillNo?: string;
    }
  ) => {
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) =>
        o._id === orderId
          ? {
              ...o,
              orderStatus: newStatus,
              ...(extraFields?.vehicleNumber ? { vehicleNumber: extraFields.vehicleNumber } : {}),
              ...(extraFields?.driverName ? { driverName: extraFields.driverName } : {}),
              ...(extraFields?.driverPhone ? { driverPhone: extraFields.driverPhone } : {}),
            }
          : o
      )
    );

    try {
      const updated = await updateOrderStatusApi(orderId, newStatus, extraFields);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      return updated;
    } catch (err: any) {
      setOrders(previousOrders); // Rollback state
      throw err;
    }
  };

  return {
    orders,
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    refresh: loadOrders,
    updateStatus,
  };
}
