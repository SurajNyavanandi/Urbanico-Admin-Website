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
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Dynamic Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categoryTabs.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#007AFF] text-white shadow-xs'
                      : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search & Add CTA */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="w-full md:w-64">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search product, brand, grade..."
              />
            </div>
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold border border-[#E5E5EA] transition-all"
              title="View how many sub-categories each material contains & services count"
            >
              <Info className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Catalog Details</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-semibold shadow-xs active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Dynamic Sub-Category Pills */}
        {availableSubCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 border-t border-[#F5F5F7] scrollbar-none">
            <span className="text-[11px] font-semibold text-[#86868B] whitespace-nowrap uppercase tracking-wider mr-1">
              Sub-Categories:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubCategory === 'all'
                  ? 'bg-[#1D1D1F] text-white shadow-xs'
                  : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]'
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isSubActive
                      ? 'bg-[#007AFF] text-white shadow-xs'
                      : 'bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]'
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
      <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7]/50 text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
                <th className="p-4">Material SKU & Brand</th>
                <th className="p-4">Origin Yard & GST</th>
                <th className="p-4">Live Unit Price (₹)</th>
                <th className="p-4 text-right">Stock Quantity</th>
                <th className="p-4 text-center">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows count={6} cols={6} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B] mb-3">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[#1D1D1F]">No materials matched</h4>
                      <p className="text-xs text-[#86868B] mt-1 mb-4">
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
                          className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-blue-600 transition-all"
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
        <div className="p-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#86868B]">
          <div>
            Showing <span className="font-semibold text-[#1D1D1F]">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-[#1D1D1F]">{totalItems}</span> products
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={prevPage}
              disabled={!hasPrevPage}
              className="p-1.5 rounded-lg border border-[#E5E5EA] text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextPage}
              disabled={!hasNextPage}
              className="p-1.5 rounded-lg border border-[#E5E5EA] text-[#1D1D1F] hover:bg-[#F5F5F7] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
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
        <div className="space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F5F5F7] p-3 rounded-xl border border-[#E5E5EA]">
              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                Total Materials
              </div>
              <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">
                {materialsBreakdown.length || materials.length} SKUs
              </div>
              <div className="text-[11px] text-[#86868B] mt-0.5">
                {subCategoriesCount} distinct sub-categories
              </div>
            </div>

            <div className="bg-[#F5F5F7] p-3 rounded-xl border border-[#E5E5EA]">
              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                Material Categories
              </div>
              <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">
                {materialCategoriesCount} Groups
              </div>
              <div className="text-[11px] text-[#86868B] mt-0.5">
                Dynamic backend catalogs
              </div>
            </div>

            <div className="bg-[#007AFF]/5 p-3 rounded-xl border border-[#007AFF]/20">
              <div className="text-[11px] font-semibold text-[#007AFF] uppercase tracking-wider">
                Trade Services Count
              </div>
              <div className="text-xl font-bold text-[#007AFF] mt-0.5">
                {servicesCount} Services
              </div>
              <div className="text-[11px] text-[#007AFF]/80 mt-0.5 font-medium">
                No sub-categories
              </div>
            </div>
          </div>

          {/* Trade Services Explanation Note */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <Wrench className="w-5 h-5 text-[#86868B] shrink-0 mt-0.5" />
            <div className="text-xs text-[#555558] space-y-1">
              <span className="font-semibold text-[#1D1D1F] block">
                Trade Services: {servicesCount} Services (No sub-categories)
              </span>
              <p>
                Trade services (Masonry & Bricklaying, Structural Welder, Concealed Electrical Wiring, Sanitary & Core Plumbing) are direct labor listings. They operate as standalone service bookings without any child sub-categories.
              </p>
            </div>
          </div>

          {/* Detailed Materials List & Sub-categories count */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
                Each Material Sub-Category Count & Tags
              </h4>
              <span className="text-[11px] text-[#86868B]">
                {materialsBreakdown.length} materials indexed
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto border border-[#E5E5EA] rounded-xl divide-y divide-[#E5E5EA] bg-white">
              {materialsBreakdown.map((item, index) => (
                <div key={item.id} className="p-3 hover:bg-[#F5F5F7]/70 transition-colors flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#86868B]">{index + 1}.</span>
                      <span className="font-semibold text-xs text-[#1D1D1F] truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#86868B] mt-0.5 ml-4">
                      Category: <span className="text-[#1D1D1F] font-medium">{item.category}</span>
                    </div>
                    {item.subCategories.length > 0 && (
                      <div className="mt-1.5 ml-4 flex flex-wrap gap-1">
                        {item.subCategories.map((sub) => (
                          <span
                            key={sub}
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#F5F5F7] text-[#555558] border border-[#E5E5EA]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        item.subCategoriesCount > 0
                          ? 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'
                          : 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5EA]'
                      }`}
                    >
                      {item.subCategoriesCount} {item.subCategoriesCount === 1 ? 'sub-category' : 'sub-categories'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black transition-colors"
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
