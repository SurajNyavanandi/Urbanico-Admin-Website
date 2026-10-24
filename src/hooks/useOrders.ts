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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders from server');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, debouncedSearch]);

  useEffect(() => {
    let ignore = false;
    fetchOrdersApi({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search: debouncedSearch.trim() || undefined,
    })
      .then((data) => {
        if (!ignore) {
          setOrders(data.orders || []);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to fetch orders from server');
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedStatus, debouncedSearch]);

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
              ...(extraFields?.eWayBillNo ? { eWayBillNo: extraFields.eWayBillNo } : {}),
            }
          : o
      )
    );

    try {
      const updated = await updateOrderStatusApi(orderId, newStatus, extraFields);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      return updated;
    } catch (err: unknown) {
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
