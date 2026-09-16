import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { ICategory } from '../../../types';
import { Image as ImageIcon, X } from 'lucide-react';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ICategory | null;
  onSave: (id: string, updates: Partial<ICategory>) => Promise<any>;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
  onShowToast,
}) => {
  const [subcategoriesText, setSubcategoriesText] = useState(category?.subcategoriesText || '');
  const [priceLabel, setPriceLabel] = useState(category?.priceLabel || '');
  const [count, setCount] = useState(category?.count || '');
  const [image, setImage] = useState(category?.image || '');
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setImgPreviewError(false);
    if (category) {
      setSubcategoriesText(category.subcategoriesText || '');
      setPriceLabel(category.priceLabel || '');
      setCount(category.count || '');
      setImage(category.image || '');
    }
  }, [category]);

  if (!category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await onSave(category.id, {
        subcategoriesText: subcategoriesText.trim(),
        priceLabel: priceLabel.trim(),
        count: count.trim(),
        image: image.trim() || undefined,
      });
      onShowToast(
        'Category Updated',
        `Metadata & image for ${category.name} synchronized across client apps.`,
        'success'
      );
      onClose();
    } catch (err: any) {
      onShowToast('Update Error', err.message || 'Failed to update category', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${category.name}`}
      subtitle="Edit live brand tags, image URL and starting price indicators"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Category Name
          </label>
          <input
            type="text"
            disabled
            value={category.name}
            className="w-full bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F] px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] opacity-80"
          />
        </div>

        {/* Category Image URL */}
        <div className="bg-[#F9F9FB] rounded-xl p-3 border border-[#E5E5EA]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#1D1D1F] uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#007AFF]" />
              Category Hero Image URL
            </label>
            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setImgPreviewError(false);
                }}
                className="text-[11px] text-[#86868B] hover:text-[#FF3B30] flex items-center gap-0.5"
              >
                <X className="w-3 h-3" /> Clear Image
              </button>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#E5E5EA] shrink-0 flex items-center justify-center relative shadow-sm">
              {image && !imgPreviewError ? (
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setImgPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#86868B]">
                  <ImageIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[8px]">No Image</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="url"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setImgPreviewError(false);
                }}
                placeholder="https://... category banner image URL"
                className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#E5E5EA] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Sub-Categories & Brand Tags *
          </label>
          <textarea
            rows={3}
            value={subcategoriesText}
            onChange={(e) => setSubcategoriesText(e.target.value)}
            placeholder="e.g. UltraTech, ACC, Ambuja, Dalmia, JSW"
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 leading-relaxed"
            required
          />
          <p className="text-[11px] text-[#86868B] mt-1">
            Comma-separated brands or grades displayed as clickable filter chips in consumer apps.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Starting Price Label *
          </label>
          <input
            type="text"
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
            placeholder="e.g. From ₹365 / Bag"
            className="w-full bg-[#F5F5F7] text-sm font-mono px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Variants / Count Tag
          </label>
          <input
            type="text"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="e.g. 7 Top Brands or 5 Sizes"
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E5E5EA]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-2 px-4 rounded-xl border border-[#E5E5EA] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="py-2 px-5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            {isLoading ? 'Saving...' : 'Save Category Metadata'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
