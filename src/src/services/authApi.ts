import { request } from './api';
import { IAdminUser, ICustomer, IApiResponse } from '../types';

export async function sendOtpApi(phone: string): Promise<{ otp: string; phone: string }> {
  const res = await request<IApiResponse & { otp: string; phone: string }>('/api/users/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
  return { otp: res.otp, phone: res.phone };
}

export async function verifyOtpApi(payload: {
  phone: string;
  otp?: string;
  password?: string;
}): Promise<{ user: IAdminUser; token: string }> {
  const res = await request<IApiResponse & { user: IAdminUser; token: string }>('/api/users/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return { user: res.user, token: res.token };
}

export async function fetchAdminProfileApi(): Promise<IAdminUser> {
  const res = await request<IApiResponse & { user: IAdminUser }>('/api/users/profile');
  return res.user;
}

export async function fetchHealthApi(): Promise<{
  status: string;
  database: { isConnected: boolean; host: string; name: string };
  timestamp: string;
}> {
  return await request('/api/health');
}

export async function fetchCustomersApi(): Promise<ICustomer[]> {
  const res = await request<IApiResponse & { customers: ICustomer[] }>('/api/customers');
  return res.customers || [];
}
