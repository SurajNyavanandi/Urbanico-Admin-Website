import { request } from './api';
import { ICategory, IApiResponse } from '../types';

export async function fetchCategoriesApi(): Promise<ICategory[]> {
  const res = await request<IApiResponse & { categories: ICategory[] }>('/api/materials/categories');
  return res.categories || [];
}

export async function updateCategoryApi(id: string, updates: Partial<ICategory>): Promise<ICategory> {
  const res = await request<{ success: boolean; category: ICategory; message: string }>(
    `/api/materials/categories/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    }
  );
  return res.category;
}
