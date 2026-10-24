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
import { downloadCsv } from '../../../utils/exportCsv';
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
  Download,
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      onShowToast('Delete Error', msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (materials.length === 0) {
      onShowToast('Export Empty', 'No materials available to export', 'info');
      return;
    }

    const headers = [
      'Material Name',
      'Category',
      'Brand',
      'Grade',
      'Default Price (INR)',
      'Unit',
      'HSN Code',
      'GST Rate (%)',
      'In Stock',
      'Stock Quantity',
      'Min Order Quantity',
      'Origin Yard',
    ];

    const rows = materials.map((m) => [
      m.name,
      m.category,
      m.brand || '',
      m.grade || '',
      m.defaultPrice,
      m.unit,
      m.hsnCode || '',
      m.gstRate,
      m.inStock ? 'Yes' : 'No',
      m.stockQuantity,
      m.minOrderQuantity || 1,
      m.originYard || '',
    ]);

    downloadCsv('urbanico_materials', headers, rows);
    onShowToast('CSV Downloaded', `Exported ${materials.length} catalog items to CSV`, 'success');
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

      {/* Action Controls: Category Tabs, Subcategories, Search, Export CSV & Add Product */}
      <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] p-4 space-y-4 shadow-md">
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-yellow-500 text-zinc-950 shadow-md shadow-yellow-500/10'
                      : 'bg-[#27272A] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 border border-[#3F3F46]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search, Export CSV & Add CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="w-full sm:w-[220px] md:w-[260px]">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search product, brand, grade..."
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex-1 sm:flex-none shrink-0 flex items-center justify-center gap-2 px-3.5 h-10 rounded-lg border border-[#3F3F46] bg-[#27272A] hover:bg-zinc-700 text-zinc-100 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
                title="Export filtered materials list as CSV"
              >
                <Download className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(true)}
                className="flex-1 sm:flex-none shrink-0 flex items-center justify-center gap-2 px-3.5 h-10 rounded-lg bg-[#27272A] hover:bg-zinc-700 border border-[#3F3F46] text-zinc-100 text-xs font-semibold transition-all cursor-pointer"
                title="View sub-category counts and trade service listings"
              >
                <Info className="w-4 h-4 text-yellow-400" />
                <span className="hidden sm:inline">Details</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex-1 sm:flex-none shrink-0 flex items-center justify-center gap-2 px-5 h-10 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-zinc-950 text-xs font-bold shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-zinc-950" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Sub-Category Pills */}
        {availableSubCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#3F3F46] scrollbar-none">
            <span className="text-xs font-bold text-zinc-400 whitespace-nowrap uppercase tracking-wider mr-2">
              Sub-Categories:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubCategory === 'all'
                  ? 'bg-yellow-500 text-zinc-950'
                  : 'bg-[#27272A] text-zinc-400 hover:text-zinc-100 border border-[#3F3F46]'
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
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSubActive
                      ? 'bg-yellow-500 text-zinc-950'
                      : 'bg-[#27272A] text-zinc-400 hover:text-zinc-100 border border-[#3F3F46]'
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
      <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#3F3F46] bg-[#27272A] text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-4 px-6">Material SKU & Brand</th>
                <th className="p-4">Origin Yard & GST</th>
                <th className="p-4">Live Unit Price (₹)</th>
                <th className="p-4 text-right">Stock Quantity</th>
                <th className="p-4 text-center">Availability</th>
                <th className="p-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3F3F46]">
              {isLoading ? (
                <TableSkeletonRows count={6} cols={6} />
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-xl bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-zinc-500 mb-4">
                        <Inbox className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-zinc-100">No materials matched</h4>
                      <p className="text-xs text-zinc-400 mt-2 mb-6">
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
                          className="px-5 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 text-xs font-bold hover:bg-yellow-400 transition-all cursor-pointer"
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
        <div className="px-6 py-4 border-t border-[#3F3F46] bg-[#18181B] flex items-center justify-between text-xs text-zinc-400">
          <div>
            Showing <span className="font-bold text-zinc-100 font-mono">{paginatedItems.length}</span> of{' '}
            <span className="font-bold text-zinc-100 font-mono">{totalItems}</span> products
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
                className="p-1.5 rounded-lg border border-[#3F3F46] bg-[#27272A] text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage}
                className="p-1.5 rounded-lg border border-[#3F3F46] bg-[#27272A] text-zinc-100 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
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
        <div className="space-y-6 text-zinc-50">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#27272A] p-4 rounded-xl border border-[#3F3F46]">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Total Materials
              </div>
              <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                {materialsBreakdown.length || materials.length} SKUs
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {subCategoriesCount} distinct sub-categories
              </div>
            </div>

            <div className="bg-[#27272A] p-4 rounded-xl border border-[#3F3F46]">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Material Categories
              </div>
              <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                {materialCategoriesCount} Groups
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Dynamic backend catalogs
              </div>
            </div>

            <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                Trade Services Count
              </div>
              <div className="text-xl font-bold font-mono text-yellow-400 mt-1">
                {servicesCount} Services
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                No sub-categories
              </div>
            </div>
          </div>

          {/* Trade Services Explanation Note */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#27272A] border border-[#3F3F46]">
            <Wrench className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300 space-y-1">
              <span className="font-bold text-zinc-100 block">
                Trade Services: {servicesCount} Services (No sub-categories)
              </span>
              <p className="leading-relaxed text-zinc-400">
                Trade services (Masonry, Welding, Electrical, Plumbing) are direct labor listings. They operate as standalone service bookings without any child sub-categories.
              </p>
            </div>
          </div>

          {/* Detailed Materials List & Sub-categories count */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Material Sub-Category Count & Tags
              </h4>
              <span className="text-xs font-mono text-zinc-400">
                {materialsBreakdown.length} materials indexed
              </span>
            </div>

            <div className="max-h-[320px] overflow-y-auto border border-[#3F3F46] rounded-xl divide-y divide-[#3F3F46] bg-[#18181B]">
              {materialsBreakdown.map((item, index) => (
                <div key={item.id} className="p-3.5 hover:bg-[#27272A] transition-colors flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-500">{index + 1}.</span>
                      <span className="font-bold text-xs text-zinc-100 truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 ml-[22px]">
                      Category: <span className="text-zinc-200 font-semibold">{item.category}</span>
                    </div>
                    {item.subCategories.length > 0 && (
                      <div className="mt-2 ml-[22px] flex flex-wrap gap-1.5">
                        {item.subCategories.map((sub) => (
                          <span
                            key={sub}
                            className="inline-block px-2 py-0.5 rounded text-[11px] bg-[#27272A] text-zinc-300 border border-[#3F3F46]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        item.subCategoriesCount > 0
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          : 'bg-[#27272A] text-zinc-400 border-[#3F3F46]'
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
              className="px-6 py-2 rounded-lg bg-yellow-500 text-zinc-950 text-xs font-bold hover:bg-yellow-400 transition-colors cursor-pointer"
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

