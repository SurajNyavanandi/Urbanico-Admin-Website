import { request } from './api';
import { IMaterial, IApiResponse } from '../types';

export interface FetchMaterialsParams {
  category?: string;
  subCategory?: string;
  search?: string;
}

export async function fetchMaterialsApi(params?: FetchMaterialsParams): Promise<{
  materials: IMaterial[];
  count: number;
  categoriesCount?: number;
  materialCategoriesCount?: number;
  subCategoriesCount?: number;
  servicesCount?: number;
  materialsBreakdown?: Array<{
    id: string;
    name: string;
    category: string;
    subCategoriesCount: number;
    subCategories: string[];
  }>;
}> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.subCategory && params.subCategory !== 'all') query.append('subCategory', params.subCategory);
  if (params?.search) query.append('search', params.search);

  const qs = query.toString();
  const res = await request<
    IApiResponse & {
      materials: IMaterial[];
      count: number;
      meta?: {
        categoriesCount?: number;
        materialCategoriesCount?: number;
        subCategoriesCount?: number;
        servicesCount?: number;
        materialsBreakdown?: Array<{
          id: string;
          name: string;
          category: string;
          subCategoriesCount: number;
          subCategories: string[];
        }>;
      };
    }
  >(`/api/materials${qs ? `?${qs}` : ''}`);

  return {
    materials: res.materials || [],
    count: res.count || (res.materials ? res.materials.length : 0),
    categoriesCount: res.meta?.categoriesCount,
    materialCategoriesCount: res.meta?.materialCategoriesCount,
    subCategoriesCount: res.meta?.subCategoriesCount,
    servicesCount: res.meta?.servicesCount,
    materialsBreakdown: res.meta?.materialsBreakdown,
  };
}

export async function fetchMaterialByIdApi(id: string): Promise<IMaterial> {
  const res = await request<{ success: boolean; material: IMaterial }>(`/api/materials/${id}`);
  return res.material;
}

export async function createMaterialApi(data: Partial<IMaterial>): Promise<IMaterial> {
  const res = await request<{ success: boolean; material: IMaterial; message: string }>('/api/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.material;
}

export async function updateMaterialApi(id: string, updates: Partial<IMaterial>): Promise<IMaterial> {
  const res = await request<{ success: boolean; material: IMaterial; message: string }>(`/api/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return res.material;
}

export async function deleteMaterialApi(id: string): Promise<IMaterial> {
  const res = await request<{ success: boolean; material: IMaterial; message: string }>(`/api/materials/${id}`, {
    method: 'DELETE',
  });
  return res.material;
}
