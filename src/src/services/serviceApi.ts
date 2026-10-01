import { request } from './api';
import { IService, IApiResponse } from '../types';

export async function fetchServicesApi(): Promise<IService[]> {
  const res = await request<IApiResponse & { services: IService[] }>('/api/services');
  return res.services || [];
}

export async function createServiceApi(data: Partial<IService>): Promise<IService> {
  const res = await request<{ success: boolean; service: IService; message: string }>('/api/services', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.service;
}

export async function updateServiceApi(id: string, updates: Partial<IService>): Promise<IService> {
  const res = await request<{ success: boolean; service: IService; message: string }>(`/api/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return res.service;
}

export async function deleteServiceApi(id: string): Promise<IService> {
  const res = await request<{ success: boolean; service: IService; message: string }>(`/api/services/${id}`, {
    method: 'DELETE',
  });
  return res.service;
}
