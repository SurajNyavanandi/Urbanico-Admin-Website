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
      <tr className="border-b border-[#E5E5EA] hover:bg-[#F5F5F7]/80 transition-colors duration-200">
        {/* SKU / Name / Category & Sub-Categories with Image */}
        <td className="p-4 px-6">
          <div className="flex items-start gap-4">
            <div
              onClick={() => onEdit(material)}
              className="w-[48px] h-[48px] rounded-[10px] overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA] shrink-0 flex items-center justify-center cursor-pointer group hover:border-[#0071E3] transition-colors relative"
              title="Click to edit material details & image"
            >
              {material.image && !imgError ? (
                <img
                  src={material.image}
                  alt={material.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Package className="w-[20px] h-[20px] text-[#A1A1A6] group-hover:text-[#0071E3] transition-colors" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="font-semibold text-[15px] text-[#000000] leading-tight flex items-center gap-2">
                <span>{material.name}</span>
                {material.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded border border-[#0071E3]/20">
                    {material.tag}
                  </span>
                )}
              </div>
              <div className="text-[13px] text-[#555555] mt-1 flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-[#000000]">{material.category}</span>
                {material.brand && <span>• {material.brand}</span>}
                {material.hsnCode && <span className="font-mono">• HSN: {material.hsnCode}</span>}
              </div>
              {/* Detailed Sub-Category Count & List */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-[6px] text-[11px] font-medium border ${
                    subCategoriesCount > 0
                      ? 'bg-[#0071E3]/5 text-[#0071E3] border-[#0071E3]/20'
                      : 'bg-[#F5F5F7] text-[#86868B] border-[#E5E5EA]'
                  }`}
                >
                  {subCategoriesCount} {subCategoriesCount === 1 ? 'Sub-category' : 'Sub-categories'}
                </span>
                {subCategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-block px-2 py-1 rounded-[4px] text-[11px] bg-[#F5F5F7] text-[#555555] border border-[#E5E5EA]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </td>

        {/* Origin Yard Depot */}
        <td className="p-4 whitespace-nowrap text-[13px] text-[#555555]">
          <span className="truncate max-w-[160px] block" title={material.originYard}>
            {material.originYard || 'Hyderabad Stockyard'}
          </span>
          <span className="text-[12px] font-mono text-[#86868B] mt-1 block">
            GST: {material.gstRate}%
          </span>
        </td>

        {/* Dynamic Inline Unit Price Editor */}
        <td className="p-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#86868B] font-mono">₹</span>
            <input
              type="number"
              min="0.1"
              step="any"
              value={priceInput}
              onChange={handlePriceChange}
              onKeyDown={handleKeyDown}
              className="w-[100px] text-[14px] font-mono font-medium text-[#000000] bg-[#F5F5F7] px-3 py-1.5 rounded-[6px] border border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0071E3]/50 focus:border-[#0071E3]/50 transition-all"
              title="Edit price and press Enter or Check"
            />
            <span className="text-[13px] text-[#86868B] font-mono">/{material.unit}</span>

            {hasPriceChanged && (
              <button
                type="button"
                onClick={handleSavePrice}
                disabled={isSavingPrice}
                className="w-[28px] h-[28px] rounded-[6px] flex items-center justify-center bg-[#0071E3] text-white hover:bg-blue-600 transition-colors ml-1"
                title="Save updated unit price"
              >
                <Check className="w-[14px] h-[14px]" />
              </button>
            )}
          </div>
        </td>

        {/* Stock Quantity */}
        <td className="p-4 whitespace-nowrap text-right">
          <div className="font-mono font-medium text-[14px] text-[#000000]">
            {material.stockQuantity} {material.unit}
          </div>
          <div className="text-[12px] text-[#86868B] mt-1">
            Min: {material.minOrderQuantity}
          </div>
        </td>

        {/* Stock Status Toggle */}
        <td className="p-4 whitespace-nowrap text-center">
          <button
            type="button"
            onClick={handleStockToggle}
            className="cursor-pointer inline-flex items-center active:scale-95 transition-transform"
            title="Click to toggle in/out of stock"
          >
            <StatusBadge status={material.inStock ? 'In Stock' : 'Out of Stock'} type="stock" />
          </button>
        </td>

        {/* Actions (Edit / Delete) */}
        <td className="p-4 px-6 whitespace-nowrap text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(material)}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[#86868B] hover:text-[#000000] hover:bg-[#E5E5EA] transition-colors"
              title="Edit product specs"
            >
              <Edit2 className="w-[14px] h-[14px]" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(material._id || material.id, material.name)}
              className="w-[32px] h-[32px] rounded-full flex items-center justify-center text-[#86868B] hover:text-[#FF3B30] hover:bg-red-50 transition-colors"
              title="Remove SKU from catalog"
            >
              <Trash2 className="w-[14px] h-[14px]" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);
