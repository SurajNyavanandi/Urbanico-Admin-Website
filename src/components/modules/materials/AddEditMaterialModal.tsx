import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { IMaterial, ICategory } from '../../../types';
import { Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface AddEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: IMaterial | null;
  categories?: ICategory[];
  onSave: (data: Partial<IMaterial>, isEdit: boolean, id?: string) => Promise<unknown>;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const MATERIAL_IMAGE_PRESETS = [
  { label: 'Cement', url: 'https://res.cloudinary.com/dfr0zghtc/image/upload/v1786614395/cement2_s1pf60.jpg' },
  { label: 'Bricks', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Sand', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80' },
  { label: 'Stone Aggregates', url: 'https://res.cloudinary.com/dfr0zghtc/image/upload/v1786614394/stones2_i0cjzq.jpg' },
  { label: 'Steel & Rebar', url: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=80' },
  { label: 'Centring / Formwork', url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80' },
  { label: 'Tiles & Flooring', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80' },
];

export const AddEditMaterialModal: React.FC<AddEditMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
  categories = [],
  onSave,
  onShowToast,
}) => {
  const isEdit = Boolean(material);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cement');
  const [subCategory, setSubCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [grade, setGrade] = useState('');
  const [image, setImage] = useState('');
  const [imgPreviewError, setImgPreviewError] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState<number>(100);
  const [unit, setUnit] = useState('50kg Bag');
  const [hsnCode, setHsnCode] = useState('252329');
  const [gstRate, setGstRate] = useState<number>(18);
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState<number>(500);
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(10);
  const [originYard, setOriginYard] = useState('Hyderabad Main Depot');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      if (material) {
        setName(material.name || '');
        setCategoryId(material.categoryId || (categories[0]?.id || 'cement'));
        setSubCategory(material.subCategory || '');
        setBrand(material.brand || '');
        setGrade(material.grade || '');
        setImage(material.image || '');
        setDefaultPrice(material.defaultPrice || 100);
        setUnit(material.unit || '50kg Bag');
        setHsnCode(material.hsnCode || '252329');
        setGstRate(material.gstRate || 18);
        setInStock(material.inStock ?? true);
        setStockQuantity(material.stockQuantity || 0);
        setMinOrderQuantity(material.minOrderQuantity || 1);
        setOriginYard(material.originYard || 'Hyderabad Main Depot');
        setDescription(material.description || '');
      } else {
        const firstCat = categories[0];
        setName('');
        setCategoryId(firstCat?.id || 'cement');
        setSubCategory('');
        setBrand('');
        setGrade('');
        setImage(firstCat?.image || 'https://res.cloudinary.com/dfr0zghtc/image/upload/v1786614395/cement2_s1pf60.jpg');
        setDefaultPrice(firstCat?.basePrice || 385);
        setUnit(firstCat?.unit || '50kg Bag');
        setHsnCode('252329');
        setGstRate(firstCat?.gstRate || 18);
        setInStock(true);
        setStockQuantity(1000);
        setMinOrderQuantity(10);
        setOriginYard('Hyderabad Main Depot');
        setDescription('');
      }
    });
  }, [material, isOpen, categories]);

  const activeCategory = categories.find((c) => c.id === categoryId);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCatId = e.target.value;
    setCategoryId(newCatId);
    const found = categories.find((c) => c.id === newCatId);
    if (found) {
      if (found.unit) setUnit(found.unit);
      if (found.gstRate) setGstRate(found.gstRate);
      if (found.basePrice) setDefaultPrice(found.basePrice);
      if (!isEdit && found.image && !image) {
        setImage(found.image);
      }
    }
  };

  const handleSubCategorySelect = (sub: string) => {
    setSubCategory(sub);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onShowToast('Validation Error', 'Product name is required', 'error');
      return;
    }

    if (defaultPrice <= 0 || isNaN(defaultPrice)) {
      onShowToast('Validation Error', 'Unit price must be greater than zero', 'error');
      return;
    }

    const payload: Partial<IMaterial> = {
      name: name.trim(),
      category: activeCategory ? activeCategory.name : 'General Construction',
      categoryId,
      subCategory: subCategory.trim(),
      brand: brand.trim() || 'Urbanico Assured',
      grade: grade.trim() || 'Standard',
      image: image.trim() || undefined,
      defaultPrice: Number(defaultPrice),
      basePrice: Number(defaultPrice),
      unit,
      hsnCode: hsnCode.trim(),
      gstRate: Number(gstRate),
      inStock,
      stockQuantity: Number(stockQuantity),
      minOrderQuantity: Number(minOrderQuantity),
      originYard: originYard.trim(),
      description: description.trim(),
    };

    try {
      setIsLoading(true);
      await onSave(payload, isEdit, material?._id || material?.id);
      onShowToast(
        isEdit ? 'Product Updated' : 'Product Added',
        `${name} has been saved to the live catalog with image URL.`,
        'success'
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      onShowToast('Save Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Subcategory suggestions from active category
  const suggestedSubCategories = activeCategory?.subcategoriesText
    ? activeCategory.subcategoriesText.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product & Image URL' : 'Add New Material SKU'}
      subtitle="Direct sync with dynamic backend catalog"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-zinc-50">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
            Product Title *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. UltraTech Super Cement"
            className="w-full bg-[#27272A] text-xs px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:outline-none"
            required
          />
        </div>

        {/* Product Image URL with Live Preview and Quick Presets */}
        <div className="bg-[#18181B] rounded-xl p-3 border border-[#3F3F46]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-zinc-300 uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
              Material Image URL
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
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#27272A] border border-[#3F3F46] shrink-0 flex items-center justify-center relative shadow-sm">
              {image && !imgPreviewError ? (
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setImgPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500 p-1 text-center">
                  <ImageIcon className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] leading-tight">No Image</span>
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
                placeholder="https://... image url"
                className="w-full bg-[#27272A] text-xs px-3 py-2 rounded-lg border border-[#3F3F46] text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:outline-none font-mono"
              />

              {/* Quick Image Presets */}
              <div className="mt-2">
                <span className="text-[10px] text-zinc-400 mb-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-400" /> Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1">
                  {MATERIAL_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setImage(preset.url);
                        setImgPreviewError(false);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#27272A] text-zinc-300 hover:text-yellow-400 hover:border-yellow-500 border border-[#3F3F46] transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="w-full bg-[#27272A] text-xs px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 focus:border-yellow-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#18181B] text-zinc-100">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. UltraTech, ACC, JSW"
              className="w-full bg-[#27272A] text-xs px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Sub-Category Input with dynamic suggestions */}
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
            Sub-Category / Specification Tags
          </label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder="e.g. Crushed Stone, M-Sand, UltraTech"
            className="w-full bg-[#27272A] text-xs px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 placeholder-zinc-500 focus:border-yellow-500 focus:outline-none"
          />
          {suggestedSubCategories.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-zinc-400">Suggested:</span>
              {suggestedSubCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSubCategorySelect(sub)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                    subCategory.includes(sub)
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                      : 'bg-[#27272A] border-[#3F3F46] text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  +{sub}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              Unit Price (₹) *
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#27272A] text-xs font-mono font-bold text-zinc-100 px-3.5 py-2.5 rounded-lg border border-[#3F3F46] focus:border-yellow-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              Unit of Measure *
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="50kg Bag, Ton, etc."
              className="w-full bg-[#27272A] text-xs px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 focus:border-yellow-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              GST Rate (%)
            </label>
            <input
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(parseInt(e.target.value, 10) || 0)}
              placeholder="28, 18, 5"
              className="w-full bg-[#27272A] text-xs font-mono px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              HSN Code
            </label>
            <input
              type="text"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="e.g. 252329"
              className="w-full bg-[#27272A] text-xs font-mono px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#27272A] text-xs font-mono px-3.5 py-2.5 rounded-lg border border-[#3F3F46] text-zinc-100 focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#27272A] rounded-lg border border-[#3F3F46]">
          <div>
            <span className="text-xs font-bold text-zinc-100 block">Available in Stock</span>
            <span className="text-[11px] text-zinc-400">
              Controls whether customers can place orders for this SKU
            </span>
          </div>
          <button
            type="button"
            onClick={() => setInStock(!inStock)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
              inStock ? 'bg-emerald-500' : 'bg-[#3F3F46]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                inStock ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
            Origin Yard / Dispatch Depot
          </label>
          <input
            type="text"
            value={originYard}
            onChange={(e) => setOriginYard(e.target.value)}
            placeholder="e.g. Miyapur Depot, Patancheru Quarry"
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
            {isLoading ? 'Saving to Database...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

