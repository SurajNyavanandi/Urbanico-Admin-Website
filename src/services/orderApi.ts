import { request } from './api';
import { IOrder, IApiResponse } from '../types';

export interface FetchOrdersParams {
  status?: string;
  search?: string;
}

export async function fetchOrdersApi(params?: FetchOrdersParams): Promise<{ orders: IOrder[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== 'all') query.append('status', params.status);
  if (params?.search) query.append('search', params.search);

  const qs = query.toString();
  const res = await request<IApiResponse & { orders: IOrder[]; count: number }>(`/api/orders${qs ? `?${qs}` : ''}`);
  return {
    orders: res.orders || [],
    count: res.count || (res.orders ? res.orders.length : 0),
  };
}

export async function fetchOrderByIdApi(id: string): Promise<IOrder> {
  const res = await request<{ success: boolean; order: IOrder }>(`/api/orders/${id}`);
  return res.order;
}

export async function updateOrderStatusApi(
  id: string,
  status: string,
  extraFields?: {
    vehicleNumber?: string;
    driverName?: string;
    driverPhone?: string;
    eWayBillNo?: string;
  }
): Promise<IOrder> {
  const res = await request<{ success: boolean; order: IOrder }>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, extraFields }),
  });
  return res.order;
}

export async function emailTaxInvoiceApi(payload: {
  orderNumber: string;
  invoiceNumber?: string;
  recipientEmail: string;
  recipientName?: string;
  recipientBusinessName?: string;
  recipientGstin?: string;
  totalAmount: number;
}): Promise<{ trackingId: string; message: string }> {
  return await request<{ success: boolean; trackingId: string; message: string }>('/api/orders/email-invoice', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
