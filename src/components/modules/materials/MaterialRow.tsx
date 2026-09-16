import React, { useState, useEffect } from 'react';
import { IMaterial } from '../../../types';
import { StatusBadge } from '../../common/StatusBadge';
import { formatCurrency } from '../../../utils/formatters';
import { Check, Edit2, Trash2, Package } from 'lucide-react';

interface MaterialRowProps {
  material: IMaterial;
  onUpdatePrice: (id: string, newPrice: number) => Promise<any>;
  onToggleStock: (id: string, inStock: boolean) => Promise<any>;
  onEdit: (material: IMaterial) => void;
  onDelete: (id: string, name: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const MaterialRow: React.FC<MaterialRowProps> = React.memo(
  ({ material, onUpdatePrice, onToggleStock, onEdit, onDelete, onShowToast }) => {
    const [priceInput, setPriceInput] = useState(material.defaultPrice.toString());
    const [isSavingPrice, setIsSavingPrice] = useState(false);
    const [hasPriceChanged, setHasPriceChanged] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
      setPriceInput(material.defaultPrice.toString());
      setHasPriceChanged(false);
    }, [material.defaultPrice]);

    useEffect(() => {
      setImgError(false);
    }, [material.image]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPriceInput(val);
      const parsed = parseFloat(val);
      setHasPriceChanged(!isNaN(parsed) && parsed !== material.defaultPrice && parsed > 0);
    };

    const handleSavePrice = async () => {
      const parsed = parseFloat(priceInput);
      if (isNaN(parsed) || parsed <= 0) {
        onShowToast('Invalid Price', 'Please enter a price greater than 0', 'error');
        setPriceInput(material.defaultPrice.toString());
        setHasPriceChanged(false);
        return;
      }

      try {
        setIsSavingPrice(true);
        await onUpdatePrice(material._id || material.id, parsed);
        setHasPriceChanged(false);
        onShowToast(
          'Price Updated',
          `${material.name} updated to ${formatCurrency(parsed)}`,
          'success'
        );
      } catch (err: any) {
        onShowToast('Price Update Failed', err.message || 'Error updating price', 'error');
        setPriceInput(material.defaultPrice.toString());
      } finally {
        setIsSavingPrice(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSavePrice();
      }
    };

    const handleStockToggle = async () => {
      const newStock = !material.inStock;
      try {
        await onToggleStock(material._id || material.id, newStock);
        onShowToast(
          'Stock Status Updated',
          `${material.name} is now ${newStock ? 'In Stock' : 'Out of Stock'}`,
          'info'
        );
      } catch (err: any) {
        onShowToast('Error', err.message || 'Failed to toggle stock', 'error');
      }
    };

    // Subcategories breakdown for this material
    const subCategories = material.subCategory && typeof material.subCategory === 'string'
      ? material.subCategory.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const subCategoriesCount = subCategories.length;

    return (
      <tr className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/60 transition-colors">
        {/* SKU / Name / Category & Sub-Categories with Image */}
        <td className="p-4">
          <div className="flex items-start gap-3">
            <div
              onClick={() => onEdit(material)}
              className="w-12 h-12 rounded-xl overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA] shrink-0 flex items-center justify-center cursor-pointer group hover:border-[#007AFF] transition-colors relative"
              title="Click to edit material details & image"
            >
              {material.image && !imgError ? (
                <img
                  src={material.image}
                  alt={material.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <Package className="w-5 h-5 text-[#86868B] group-hover:text-[#007AFF] transition-colors" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[#1D1D1F] leading-tight flex items-center gap-2">
                <span>{material.name}</span>
                {material.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                    {material.tag}
                  </span>
                )}
              </div>
              <div className="text-xs text-[#86868B] mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-[#1D1D1F]">{material.category}</span>
                {material.brand && <span>• {material.brand}</span>}
                {material.hsnCode && <span className="font-mono">• HSN: {material.hsnCode}</span>}
              </div>
              {/* Detailed Sub-Category Count & List */}
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                    subCategoriesCount > 0
                      ? 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/20'
                      : 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5EA]'
                  }`}
                >
                  {subCategoriesCount} {subCategoriesCount === 1 ? 'Sub-category' : 'Sub-categories'}
                </span>
                {subCategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#F5F5F7] text-[#555558] border border-[#E5E5EA]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </td>

        {/* Origin Yard Depot */}
        <td className="p-4 whitespace-nowrap text-xs text-[#86868B]">
          <span className="truncate max-w-40 block" title={material.originYard}>
            {material.originYard || 'Hyderabad Stockyard'}
          </span>
          <span className="text-[11px] font-mono text-[#AEAEB2]">
            GST: {material.gstRate}%
          </span>
        </td>

        {/* Dynamic Inline Unit Price Editor */}
        <td className="p-4 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#86868B] font-mono">₹</span>
            <input
              type="number"
              min="0.1"
              step="any"
              value={priceInput}
              onChange={handlePriceChange}
              onKeyDown={handleKeyDown}
              className="w-24 text-sm font-mono font-bold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-1 rounded-lg border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20"
              title="Edit price and press Enter or Check"
            />
            <span className="text-xs text-[#86868B] font-mono">/{material.unit}</span>

            {hasPriceChanged && (
              <button
                type="button"
                onClick={handleSavePrice}
                disabled={isSavingPrice}
                className="p-1 rounded-md bg-[#007AFF] text-white hover:bg-blue-600 transition-colors"
                title="Save updated unit price"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>

        {/* Stock Quantity */}
        <td className="p-4 whitespace-nowrap text-right">
          <div className="font-mono font-semibold text-xs text-[#1D1D1F]">
            {material.stockQuantity} {material.unit}
          </div>
          <div className="text-[11px] text-[#86868B]">
            Min: {material.minOrderQuantity}
          </div>
        </td>

        {/* Stock Status Toggle */}
        <td className="p-4 whitespace-nowrap text-center">
          <button
            type="button"
            onClick={handleStockToggle}
            className="cursor-pointer inline-flex items-center"
            title="Click to toggle in/out of stock"
          >
            <StatusBadge status={material.inStock ? 'In Stock' : 'Out of Stock'} type="stock" />
          </button>
        </td>

        {/* Actions (Edit / Delete) */}
        <td className="p-4 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(material)}
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5EA] transition-colors"
              title="Edit product specs"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(material._id || material.id, material.name)}
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#FF3B30] hover:bg-red-50 transition-colors"
              title="Remove SKU from catalog"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);
