import React, { useState, useEffect } from 'react';
import { IMaterial } from '../../../types';
import { StatusBadge } from '../../common/StatusBadge';
import { formatCurrency } from '../../../utils/formatters';
import { Check, Edit2, Trash2, Package } from 'lucide-react';

interface MaterialRowProps {
  material: IMaterial;
  onUpdatePrice: (id: string, newPrice: number) => Promise<unknown>;
  onToggleStock: (id: string, inStock: boolean) => Promise<unknown>;
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error updating price';
        onShowToast('Price Update Failed', msg, 'error');
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
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to toggle stock';
        onShowToast('Error', msg, 'error');
      }
    };

    // Subcategories breakdown for this material
    const subCategories = material.subCategory && typeof material.subCategory === 'string'
      ? material.subCategory.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const subCategoriesCount = subCategories.length;

    return (
      <tr className="border-b border-[#3F3F46] hover:bg-[#27272A] transition-colors duration-200 text-zinc-50">
        {/* SKU / Name / Category & Sub-Categories with Image */}
        <td className="p-4 px-6">
          <div className="flex items-start gap-4">
            <div
              onClick={() => onEdit(material)}
              className="w-12 h-12 rounded-lg overflow-hidden bg-[#27272A] border border-[#3F3F46] shrink-0 flex items-center justify-center cursor-pointer group hover:border-yellow-500 transition-colors relative"
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
                <Package className="w-5 h-5 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <div className="font-bold text-sm text-zinc-100 leading-tight flex items-center gap-2">
                <span>{material.name}</span>
                {material.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                    {material.tag}
                  </span>
                )}
              </div>
              <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-zinc-200">{material.category}</span>
                {material.brand && <span>• {material.brand}</span>}
                {material.hsnCode && <span className="font-mono">• HSN: {material.hsnCode}</span>}
              </div>
              {/* Detailed Sub-Category Count & List */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                    subCategoriesCount > 0
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      : 'bg-[#27272A] text-zinc-500 border-[#3F3F46]'
                  }`}
                >
                  {subCategoriesCount} {subCategoriesCount === 1 ? 'Sub-category' : 'Sub-categories'}
                </span>
                {subCategories.map((sub) => (
                  <span
                    key={sub}
                    className="inline-block px-2 py-0.5 rounded text-[11px] bg-[#27272A] text-zinc-300 border border-[#3F3F46]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </td>

        {/* Origin Yard Depot */}
        <td className="p-4 whitespace-nowrap text-xs text-zinc-400">
          <span className="truncate max-w-[160px] block text-zinc-200 font-medium" title={material.originYard}>
            {material.originYard || 'Hyderabad Stockyard'}
          </span>
          <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
            GST: {material.gstRate}%
          </span>
        </td>

        {/* Dynamic Inline Unit Price Editor */}
        <td className="p-4 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-mono">₹</span>
            <input
              type="number"
              min="0.1"
              step="any"
              value={priceInput}
              onChange={handlePriceChange}
              onKeyDown={handleKeyDown}
              className="w-24 text-xs font-mono font-bold text-zinc-100 bg-[#27272A] px-2.5 py-1 rounded-md border border-[#3F3F46] focus:outline-none focus:border-yellow-500 transition-all"
              title="Edit price and press Enter or Check"
            />
            <span className="text-xs text-zinc-400 font-mono">/{material.unit}</span>

            {hasPriceChanged && (
              <button
                type="button"
                onClick={handleSavePrice}
                disabled={isSavingPrice}
                className="w-7 h-7 rounded-md flex items-center justify-center bg-yellow-500 text-zinc-950 hover:bg-yellow-400 transition-colors ml-1 cursor-pointer font-bold"
                title="Save updated unit price"
              >
                <Check className="w-3.5 h-3.5 text-zinc-950" />
              </button>
            )}
          </div>
        </td>

        {/* Stock Quantity */}
        <td className="p-4 whitespace-nowrap text-right">
          <div className="font-mono font-bold text-xs text-zinc-100">
            {material.stockQuantity} {material.unit}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
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
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(material)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-[#27272A] transition-colors cursor-pointer"
              title="Edit product specs"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(material._id || material.id, material.name)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Remove SKU from catalog"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

