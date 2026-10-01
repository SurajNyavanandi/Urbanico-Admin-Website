import React, { useState } from 'react';
import { useCategories } from '../../../hooks/useCategories';
import { CategoryCard } from './CategoryCard';
import { EditCategoryModal } from './EditCategoryModal';
import { StatCard } from '../../common/StatCard';
import { CardSkeletonGrid } from '../../common/ShimmerSkeleton';
import { ICategory } from '../../../types';
import { Layers, Sparkles, RefreshCw } from 'lucide-react';

interface CategoriesViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ onShowToast }) => {
  const { categories, isLoading, refresh, updateCategory } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);

  const totalBrandTags = categories.reduce((acc, curr) => {
    return acc + (curr.subcategoriesText ? curr.subcategoriesText.split(',').length : 0);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Active Categories"
          value={categories.length}
          subtitle="Primary civil engineering catalogs"
          icon={Layers}
        />
        <StatCard
          title="Indexed Brand Tags"
          value={totalBrandTags}
          subtitle="Customer filter chips & grades"
          icon={Sparkles}
        />
        <StatCard
          title="Cross-App Sync"
          value="100% Real-Time"
          subtitle="Immediate reflection on Android / PWA"
          icon={RefreshCw}
          badge={{ text: 'Active', type: 'success' }}
        />
      </div>

      {/* Overview explanation banner */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[#000000]">Category Brand & Display Pricing Controls</h3>
            <p className="text-[14px] text-[#555555] mt-1">
              These settings control the top hero carousels and subcategory pill tags that customers see when opening the Urbanico mobile apps.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="self-start sm:self-auto w-full sm:w-auto px-4 h-[44px] rounded-[8px] border border-[#E5E5EA] bg-[#F5F5F7] text-[14px] font-medium text-[#000000] hover:bg-[#E5E5EA] transition-colors shrink-0"
          >
            Reload Categories
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <CardSkeletonGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={(c) => setSelectedCategory(c)}
            />
          ))}
        </div>
      )}

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        onSave={updateCategory}
        onShowToast={onShowToast}
      />
    </div>
  );
};
