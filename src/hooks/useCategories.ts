import { useState, useEffect, useCallback } from 'react';
import { fetchCategoriesApi, updateCategoryApi } from '../services/categoryApi';
import { ICategory } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const list = await fetchCategoriesApi();
      setCategories(list);
      console.log(`[Backend Data] Categories found: ${list.length}`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const updateCategory = async (id: string, updates: Partial<ICategory>) => {
    const prev = [...categories];
    setCategories((list) => list.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    try {
      const updated = await updateCategoryApi(id, updates);
      setCategories((list) => list.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      setCategories(prev);
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refresh: loadCategories,
    updateCategory,
  };
}
