import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { IMaterial, ICategory } from '../../../types';
import { Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface AddEditMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: IMaterial | null;
  categories?: ICategory[];
  onSave: (data: Partial<IMaterial>, isEdit: boolean, id?: string) => Promise<any>;
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
    setImgPreviewError(false);
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
    } catch (err: any) {
      onShowToast('Save Error', err.message || 'Failed to save product', 'error');
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Product Title *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. UltraTech Super Cement"
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            required
          />
        </div>

        {/* Product Image URL with Live Preview and Quick Presets */}
        <div className="bg-[#F9F9FB] rounded-xl p-3 border border-[#E5E5EA]">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#1D1D1F] uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#007AFF]" />
              Material Image URL
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
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#E5E5EA] shrink-0 flex items-center justify-center relative shadow-sm">
              {image && !imgPreviewError ? (
                <img
                  src={image}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  onError={() => setImgPreviewError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#86868B] p-1 text-center">
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
                placeholder="https://... image url (Cloudinary, Unsplash, etc.)"
                className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-[#E5E5EA] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 font-mono"
              />

              {/* Quick Image Presets */}
              <div className="mt-2">
                <span className="text-[10px] text-[#86868B] mb-1 flex items-center gap-1 font-medium">
                  <Sparkles className="w-2.5 h-2.5 text-[#007AFF]" /> Quick Presets:
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
                      className="px-2 py-0.5 rounded text-[10px] bg-white text-[#555558] hover:text-[#007AFF] hover:border-[#007AFF] border border-[#E5E5EA] transition-colors"
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
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              Category (Dynamic Backend) *
            </label>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. UltraTech, ACC, JSW"
              className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
          </div>
        </div>

        {/* Sub-Category Input with dynamic suggestions */}
        <div>
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Sub-Category / Specification Tags
          </label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder="e.g. Crushed Stone, M-Sand, UltraTech, ACC"
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
          {suggestedSubCategories.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[#86868B]">Suggested:</span>
              {suggestedSubCategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSubCategorySelect(sub)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                    subCategory.includes(sub)
                      ? 'bg-[#007AFF]/10 border-[#007AFF] text-[#007AFF]'
                      : 'bg-white border-[#E5E5EA] text-[#86868B] hover:text-[#1D1D1F]'
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
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              Unit Price (₹) *
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#F5F5F7] text-sm font-mono font-semibold px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              Unit of Measure *
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="50kg Bag, Ton, etc."
              className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              GST Rate (%)
            </label>
            <input
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(parseInt(e.target.value, 10) || 0)}
              placeholder="28, 18, 5"
              className="w-full bg-[#F5F5F7] text-sm font-mono px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              HSN Code
            </label>
            <input
              type="text"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="e.g. 252329"
              className="w-full bg-[#F5F5F7] text-sm font-mono px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
              Stock Quantity
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-[#F5F5F7] text-sm font-mono px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#F5F5F7] rounded-xl border border-[#E5E5EA]">
          <div>
            <span className="text-xs font-bold text-[#1D1D1F] block">Available in Stock</span>
            <span className="text-[11px] text-[#86868B]">
              Controls whether customers can place orders for this SKU
            </span>
          </div>
          <button
            type="button"
            onClick={() => setInStock(!inStock)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
              inStock ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
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
          <label className="block text-xs font-semibold text-[#86868B] uppercase mb-1">
            Origin Yard / Dispatch Depot
          </label>
          <input
            type="text"
            value={originYard}
            onChange={(e) => setOriginYard(e.target.value)}
            placeholder="e.g. Miyapur Depot, Patancheru Quarry"
            className="w-full bg-[#F5F5F7] text-sm px-3.5 py-2.5 rounded-xl border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
          />
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#E5E5EA]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto py-[10px] px-6 rounded-[8px] border border-[#E5E5EA] text-[14px] font-medium text-[#000000] hover:bg-[#F5F5F7] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto py-[10px] px-6 rounded-[8px] bg-[#0071E3] text-white text-[14px] font-medium hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            {isLoading ? 'Saving to Database...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
