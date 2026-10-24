import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { ICategory } from '../../../types';
import { Image as ImageIcon, X } from 'lucide-react';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ICategory | null;
  onSave: (id: string, updates: Partial<ICategory>) => Promise<unknown>;
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
    if (!isOpen) return;
    queueMicrotask(() => {
      setSubcategoriesText(category?.subcategoriesText || '');
      setPriceLabel(category?.priceLabel || '');
      setCount(category?.count || '');
      setImage(category?.image || '');
      setImgPreviewError(false);
    });
  }, [category, isOpen]);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update category';
      onShowToast('Update Error', msg, 'error');
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
      <form onSubmit={handleSubmit} className="space-y-4 text-zinc-50">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
            Category Name
          </label>
          <input
            type="text"
            disabled
            value={category.name}
            className="w-full bg-[#27272A] text-xs font-bold text-zinc-300 px-3.5 py-2.5 rounded-lg border border-[#3F3F46] opacity-80"
          />
        </div>

        {/* Category Image URL */}
        <div className="bg-[#18181B] rounded-xl p-3 border border-[#3F3F46]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
              Category Hero Image URL
            </label>
            {image && (
              <button
                type="button"
                onClick={() => {
                  setImage('');
                  setImgPreviewError(false);
                }}
                className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear Image
              </button>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#27272A] border border-[#3F3F46] shrink-0 flex items-center justify-center relative shadow-sm">
              {image && !imgPreviewError ? (
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setImgPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500">
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
                className="w-full bg-[#27272A] text-xs px-3 py-2 rounded-lg border border-[#3F3F46] text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
            Sub-Categories & Brand Tags *
          </label>
          <textarea
            rows={3}
            value={subcategoriesText}
            onChange={(e) => setSubcategoriesText(e.target.value)}
            placeholder="e.g. UltraTech, ACC, Ambuja, Dalmia, JSW"
            className="w-full bg-[#27272A] text-xs px-3.5 py-2 rounded-lg border border-[#3F3F46] text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:outline-none leading-relaxed"
            required
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Comma-separated brands or grades displayed as clickable filter chips in consumer apps.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
            Starting Price Label *
          </label>
          <input
            type="text"
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
            placeholder="e.g. From ₹365 / Bag"
            className="w-full bg-[#27272A] text-xs font-mono font-bold text-zinc-100 px-3.5 py-2.5 rounded-lg border border-[#3F3F46] focus:border-yellow-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
            Variants / Count Tag
          </label>
          <input
            type="text"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="e.g. 7 Top Brands or 5 Sizes"
            className="w-full bg-[#27272A] text-xs px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:outline-none"
          />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#3F3F46]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto py-2.5 px-6 rounded-lg border border-[#3F3F46] bg-[#27272A] text-xs font-semibold text-zinc-100 hover:bg-zinc-700 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-yellow-500 text-zinc-950 text-xs font-bold hover:bg-yellow-400 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            {isLoading ? 'Saving...' : 'Save Category Metadata'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

