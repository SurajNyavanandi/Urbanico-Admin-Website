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
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1D1D1F]">Category Brand & Display Pricing Controls</h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              These settings control the top hero carousels and subcategory pill tags that customers see when opening the Urbanico mobile apps.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-[#E5E5EA] bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] hover:bg-[#E5E5EA] transition-colors"
          >
            Reload Categories
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <CardSkeletonGrid count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
