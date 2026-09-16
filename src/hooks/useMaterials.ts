import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchMaterialsApi,
  createMaterialApi,
  updateMaterialApi,
  deleteMaterialApi,
} from '../services/materialApi';
import { fetchCategoriesApi } from '../services/categoryApi';
import { fetchServicesApi } from '../services/serviceApi';
import { IMaterial, ICategory } from '../types';
import { useDebounce } from './useDebounce';

export interface IMaterialSubCategoryDetail {
  id: string;
  name: string;
  category: string;
  subCategoriesCount: number;
  subCategories: string[];
}

export function useMaterials(initialCategory: string = 'all') {
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stats for verification
  const [categoriesCount, setCategoriesCount] = useState<number>(0);
  const [materialCategoriesCount, setMaterialCategoriesCount] = useState<number>(0);
  const [subCategoriesCount, setSubCategoriesCount] = useState<number>(0);
  const [servicesCount, setServicesCount] = useState<number>(0);
  const [materialsBreakdown, setMaterialsBreakdown] = useState<IMaterialSubCategoryDetail[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const loadMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dynamic categories, materials, and services in parallel from backend
      const [cats, data, srvs] = await Promise.all([
        fetchCategoriesApi(),
        fetchMaterialsApi({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          subCategory: selectedSubCategory === 'all' ? undefined : selectedSubCategory,
          search: debouncedSearch.trim() || undefined,
        }),
        fetchServicesApi(),
      ]);

      setCategories(cats);
      const fetchedMaterials = data.materials || [];
      setMaterials(fetchedMaterials);

      // Calculate verification metrics directly from dynamic backend data
      const catsFound = cats.length;
      const matCatsSet = new Set(
        fetchedMaterials.map((m) => m.category || m.categoryId).filter(Boolean)
      );
      const matCatsFound = matCatsSet.size;

      const subCatsSet = new Set<string>();
      fetchedMaterials.forEach((m) => {
        if (m.subCategory && typeof m.subCategory === 'string') {
          m.subCategory.split(',').forEach((sub) => {
            const trimmed = sub.trim();
            if (trimmed) subCatsSet.add(trimmed);
          });
        }
      });
      const subCatsFound = subCatsSet.size;
      const totalServicesCount = data.servicesCount ?? srvs.length;

      setCategoriesCount(catsFound);
      setMaterialCategoriesCount(matCatsFound);
      setSubCategoriesCount(subCatsFound);
      setServicesCount(totalServicesCount);

      // Generate per-material subcategory breakdown
      const breakdown: IMaterialSubCategoryDetail[] = fetchedMaterials.map((m) => {
        const subs = m.subCategory && typeof m.subCategory === 'string'
          ? m.subCategory.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        return {
          id: m._id || m.id,
          name: m.name,
          category: m.category,
          subCategoriesCount: subs.length,
          subCategories: subs,
        };
      });
      setMaterialsBreakdown(breakdown);

      // Minimalistic & comprehensive console log for backend verification
      console.log(
        `[Backend Data] Categories: ${catsFound} | Material Categories: ${matCatsFound} | Distinct Sub-Categories: ${subCatsFound} | Services: ${totalServicesCount} (services have no sub-categories)`
      );
      console.log('--- Details: Each Material Sub-Categories & Services Count ---');
      breakdown.forEach((item, index) => {
        console.log(
          `  ${index + 1}. "${item.name}" [${item.category}] contains ${item.subCategoriesCount} sub-categor${item.subCategoriesCount === 1 ? 'y' : 'ies'}: [${item.subCategories.join(', ') || 'None'}]`
        );
      });
      console.log(`--- Services Summary: ${totalServicesCount} Services registered (Services do not have any sub-categories) ---`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch materials from backend');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedSubCategory, debouncedSearch]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // When selectedCategory changes, reset selectedSubCategory to 'all'
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('all');
  };

  // Derive available subcategories related to materials for the currently active category
  const availableSubCategories = useMemo(() => {
    const subSet = new Set<string>();
    materials.forEach((m) => {
      if (m.subCategory) {
        m.subCategory.split(',').forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) subSet.add(trimmed);
        });
      }
    });
    return Array.from(subSet);
  }, [materials]);

  // Fast inline price update with rollback
  const updatePrice = async (materialId: string, newPrice: number) => {
    const prev = [...materials];
    setMaterials((list) =>
      list.map((m) => (m._id === materialId || m.id === materialId ? { ...m, defaultPrice: newPrice } : m))
    );

    try {
      const updated = await updateMaterialApi(materialId, { defaultPrice: newPrice });
      setMaterials((list) =>
        list.map((m) => (m._id === materialId || m.id === materialId ? updated : m))
      );
      return updated;
    } catch (err) {
      setMaterials(prev);
      throw err;
    }
  };

  // Fast inline stock toggle with rollback
  const toggleStock = async (materialId: string, inStock: boolean) => {
    const prev = [...materials];
    setMaterials((list) =>
      list.map((m) => (m._id === materialId || m.id === materialId ? { ...m, inStock } : m))
    );

    try {
      const updated = await updateMaterialApi(materialId, { inStock });
      setMaterials((list) =>
        list.map((m) => (m._id === materialId || m.id === materialId ? updated : m))
      );
      return updated;
    } catch (err) {
      setMaterials(prev);
      throw err;
    }
  };

  const saveMaterial = async (data: Partial<IMaterial>, isEdit: boolean, id?: string) => {
    if (isEdit && id) {
      const updated = await updateMaterialApi(id, data);
      setMaterials((list) => list.map((m) => (m._id === id || m.id === id ? updated : m)));
      await loadMaterials();
      return updated;
    } else {
      const created = await createMaterialApi(data);
      setMaterials((list) => [created, ...list]);
      await loadMaterials();
      return created;
    }
  };

  const removeMaterial = async (id: string) => {
    await deleteMaterialApi(id);
    setMaterials((list) => list.filter((m) => m._id !== id && m.id !== id));
  };

  return {
    materials,
    categories,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    selectedSubCategory,
    setSelectedSubCategory,
    availableSubCategories,
    searchQuery,
    setSearchQuery,
    refresh: loadMaterials,
    updatePrice,
    toggleStock,
    saveMaterial,
    removeMaterial,
    categoriesCount,
    materialCategoriesCount,
    subCategoriesCount,
    servicesCount,
    materialsBreakdown,
  };
}
