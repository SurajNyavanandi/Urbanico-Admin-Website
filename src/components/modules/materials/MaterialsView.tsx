import React, { useState, useMemo } from 'react';
import { useMaterials } from '../../../hooks/useMaterials';
import { MaterialRow } from './MaterialRow';
import { AddEditMaterialModal } from './AddEditMaterialModal';
import { StatCard } from '../../common/StatCard';
import { SearchInput } from '../../common/SearchInput';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { Modal } from '../../common/Modal';
import { TableSkeletonRows } from '../../common/ShimmerSkeleton';
import { usePagination } from '../../../hooks/usePagination';
import { IMaterial } from '../../../types';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Layers,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Info,
} from 'lucide-react';

interface MaterialsViewProps {
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({ onShowToast }) => {
  const {
    materials,
    categories,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    availableSubCategories,
    searchQuery,
    setSearchQuery,
    updatePrice,
    toggleStock,
    saveMaterial,
    removeMaterial,
    categoriesCount,
    materialCategoriesCount,
    subCategoriesCount,
    servicesCount,
    materialsBreakdown,
  } = useMaterials('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<IMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dynamic category tabs derived strictly from backend categories
  const categoryTabs = useMemo(() => {
    return [
      { id: 'all', label: 'All Materials' },
      ...categories.map((c) => ({ id: c.id, label: c.name })),
    ];
  }, [categories]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    totalItems,
  } = usePagination(materials, 12);

  // High performance memoized metrics
  const metrics = useMemo(() => {
    const total = materials.length;
    let inStockCount = 0;
    let outOfStockCount = 0;
    const categoriesSet = new Set<string>();

    for (const m of materials) {
      if (m.inStock && m.stockQuantity > 0) {
        inStockCount++;
      } else {
        outOfStockCount++;
      }
      if (m.category) categoriesSet.add(m.category);
    }

    return {
      total,
      inStockCount,
      outOfStockCount,
      categoryCount: categories.length > 0 ? categories.length : categoriesSet.size,
    };
  }, [materials, categories]);

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: IMaterial) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await removeMaterial(deleteTarget.id);
      onShowToast('Product Deleted', `${deleteTarget.name} has been removed from catalog`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      onShowToast('Delete Error', err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Catalog SKUs"
          value={metrics.total}
          subtitle="Civil construction items"
          icon={Package}
        />
        <StatCard
          title="In Stock"
          value={metrics.inStockCount}
          subtitle="Ready for same-day dispatch"
          icon={CheckCircle2}
          badge={{ text: 'Available', type: 'success' }}
        />
        <StatCard
          title="Out / Low Stock"
          value={metrics.outOfStockCount}
          subtitle="Items requiring replenishment"
          icon={AlertTriangle}
          badge={{
            text: metrics.outOfStockCount > 0 ? 'Review Needed' : 'Healthy',
            type: metrics.outOfStockCount > 0 ? 'warning' : 'neutral',
          }}
        />
        <StatCard
          title="Active Categories"
          value={metrics.categoryCount}
          subtitle={`${materialCategoriesCount} groups · ${subCategoriesCount} sub-categories`}
          icon={Layers}
          badge={{ text: `${categoriesCount} Dynamic`, type: 'info' }}
        />
        <StatCard
          title="Trade Services"
          value={servicesCount}
          subtitle="Direct contractor trades"
          icon={Wrench}
          badge={{ text: 'No Sub-Categories', type: 'neutral' }}
        />
      </div>

      {/* Action Controls: Category Tabs, Subcategories, Search, Add Product */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Dynamic Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categoryTabs.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'bg-[#F5F5F7] text-[#555555] hover:text-[#000000] hover:bg-[#E5E5EA]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search & Add CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-[240px] md:w-[280px]">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search product, brand, grade..."
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(true)}
                className="flex-1 sm:flex-none shrink-0 flex items-center justify-center gap-2 px-4 h-[44px] rounded-[8px] bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#000000] text-[14px] font-medium transition-all"
                title="View how many sub-categories each material contains & services count"
              >
                <Info className="w-[16px] h-[16px] text-[#0071E3]" />
                <span className="hidden sm:inline">Catalog Details</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex-1 sm:flex-none shrink-0 flex items-center justify-center gap-2 px-6 h-[44px] rounded-[8px] bg-[#0071E3] hover:bg-blue-600 text-white text-[14px] font-medium shadow-sm active:scale-[0.98] transition-all"
              >
                <Plus className="w-[16px] h-[16px]" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sub-Category Pills */}
        {availableSubCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#F5F5F7] scrollbar-none">
            <span className="text-[12px] font-semibold text-[#86868B] whitespace-nowrap uppercase tracking-[0.05em] mr-2">
              Sub-Categories:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium whitespace-nowrap transition-all ${
                selectedSubCategory === 'all'
                  ? 'bg-[#000000] text-white shadow-sm'
                  : 'bg-[#F5F5F7] text-[#555555] hover:text-[#000000] hover:bg-[#E5E5EA]'
              }`}
            >
              All ({availableSubCategories.length})
            </button>
            {availableSubCategories.map((sub) => {
              const isSubActive = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubCategory(isSubActive ? 'all' : sub)}
                  className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium whitespace-nowrap transition-all ${
                    isSubActive
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'bg-[#F5F5F7] text-[#555555] hover:text-[#000000] hover:bg-[#E5E5EA]'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-[8px] border border-[#E5E5EA] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7] text-[13px] font-medium text-[#555555]">
                <th className="p-4 px-6">Material SKU & Brand</th>
                <th className="p-4">Origin Yard & GST</th>
                <th className="p-4">Live Unit Price (₹)</th>
                <th className="p-4 text-right">Stock Quantity</th>
                <th className="p-4 text-center">Availability</th>
                <th className="p-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={6} cols={6} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#A1A1A6] mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h4 className="text-[18px] font-semibold text-[#000000]">No materials matched</h4>
                      <p className="text-[14px] text-[#86868B] mt-2 mb-6">
                        {searchQuery || selectedCategory !== 'all'
                          ? 'Try clearing the search query or select another category.'
                          : 'Click Add Product above to register your first construction material.'}
                      </p>
                      {(searchQuery || selectedCategory !== 'all') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('all');
                            setSearchQuery('');
                          }}
                          className="px-6 py-[12px] h-[44px] rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 transition-all flex items-center justify-center"
                        >
                          Reset Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((mat) => (
                  <MaterialRow
                    key={mat._id || mat.id}
                    material={mat}
                    onUpdatePrice={updatePrice}
                    onToggleStock={toggleStock}
                    onEdit={handleOpenEdit}
                    onDelete={(id, name) => setDeleteTarget({ id, name })}
                    onShowToast={onShowToast}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-[#E5E5EA] flex items-center justify-between text-[13px] text-[#555555]">
          <div>
            Showing <span className="font-semibold text-[#000000]">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-[#000000]">{totalItems}</span> products
          </div>
          <div className="flex items-center gap-3">
            <span className="mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={prevPage}
                disabled={!hasPrevPage}
                className="p-2 rounded-[8px] border border-[#E5E5EA] text-[#000000] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-[16px] h-[16px]" />
              </button>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage}
                className="p-2 rounded-[8px] border border-[#E5E5EA] text-[#000000] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-[16px] h-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Details Breakdown Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Material Sub-Categories & Services Breakdown"
        subtitle="Dynamic catalog breakdown retrieved directly from backend API"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#F5F5F7] p-5 rounded-[8px] border border-[#E5E5EA]">
              <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-[0.05em]">
                Total Materials
              </div>
              <div className="text-[24px] font-semibold text-[#000000] mt-1 tracking-tight">
                {materialsBreakdown.length || materials.length} SKUs
              </div>
              <div className="text-[13px] text-[#555555] mt-1">
                {subCategoriesCount} distinct sub-categories
              </div>
            </div>

            <div className="bg-[#F5F5F7] p-5 rounded-[8px] border border-[#E5E5EA]">
              <div className="text-[12px] font-semibold text-[#86868B] uppercase tracking-[0.05em]">
                Material Categories
              </div>
              <div className="text-[24px] font-semibold text-[#000000] mt-1 tracking-tight">
                {materialCategoriesCount} Groups
              </div>
              <div className="text-[13px] text-[#555555] mt-1">
                Dynamic backend catalogs
              </div>
            </div>

            <div className="bg-[#0071E3]/5 p-5 rounded-[8px] border border-[#0071E3]/20">
              <div className="text-[12px] font-semibold text-[#0071E3] uppercase tracking-[0.05em]">
                Trade Services Count
              </div>
              <div className="text-[24px] font-semibold text-[#0071E3] mt-1 tracking-tight">
                {servicesCount} Services
              </div>
              <div className="text-[13px] text-[#0071E3] mt-1">
                No sub-categories
              </div>
            </div>
          </div>

          {/* Trade Services Explanation Note */}
          <div className="flex items-start gap-4 p-5 rounded-[8px] bg-[#F5F5F7] border border-[#E5E5EA]">
            <Wrench className="w-[20px] h-[20px] text-[#86868B] shrink-0 mt-0.5" />
            <div className="text-[14px] text-[#555555] space-y-2">
              <span className="font-semibold text-[#000000] block">
                Trade Services: {servicesCount} Services (No sub-categories)
              </span>
              <p className="leading-relaxed">
                Trade services (Masonry & Bricklaying, Structural Welder, Concealed Electrical Wiring, Sanitary & Core Plumbing) are direct labor listings. They operate as standalone service bookings without any child sub-categories.
              </p>
            </div>
          </div>

          {/* Detailed Materials List & Sub-categories count */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[13px] font-semibold text-[#000000] uppercase tracking-[0.05em]">
                Each Material Sub-Category Count & Tags
              </h4>
              <span className="text-[13px] text-[#86868B]">
                {materialsBreakdown.length} materials indexed
              </span>
            </div>

            <div className="max-h-[320px] overflow-y-auto border border-[#E5E5EA] rounded-[8px] divide-y divide-[#E5E5EA] bg-white">
              {materialsBreakdown.map((item, index) => (
                <div key={item.id} className="p-4 hover:bg-[#F5F5F7]/70 transition-colors flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] text-[#86868B]">{index + 1}.</span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-[13px] text-[#555555] mt-1 ml-[22px]">
                      Category: <span className="text-[#000000] font-medium">{item.category}</span>
                    </div>
                    {item.subCategories.length > 0 && (
                      <div className="mt-2 ml-[22px] flex flex-wrap gap-2">
                        {item.subCategories.map((sub) => (
                          <span
                            key={sub}
                            className="inline-block px-2 py-1 rounded-[4px] text-[12px] bg-[#F5F5F7] text-[#555555] border border-[#E5E5EA]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[12px] font-medium border ${
                        item.subCategoriesCount > 0
                          ? 'bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20'
                          : 'bg-[#F5F5F7] text-[#555555] border-[#E5E5EA]'
                      }`}
                    >
                      {item.subCategoriesCount} {item.subCategoriesCount === 1 ? 'sub-category' : 'sub-categories'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-6 py-[12px] h-[44px] rounded-[8px] bg-[#000000] text-white text-[14px] font-medium hover:bg-[#333333] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Modal */}
      <AddEditMaterialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMaterial(null);
        }}
        material={editingMaterial}
        categories={categories}
        onSave={saveMaterial}
        onShowToast={onShowToast}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Product"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the active materials catalog? This action will immediately remove it from customer ordering apps.`}
        confirmLabel="Delete SKU"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
