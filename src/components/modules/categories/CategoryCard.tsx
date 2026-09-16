import React, { useState } from 'react';
import { ICategory } from '../../../types';
import { Edit2, Tag, Layers } from 'lucide-react';

interface CategoryCardProps {
  category: ICategory;
  onEdit: (category: ICategory) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit }) => {
  const [imgError, setImgError] = useState(false);
  const brands = category.subcategoriesText
    ? category.subcategoriesText.split(',').map((s) => s.trim())
    : [];

  return (
    <div className="bg-white rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#AEAEB2] transition-colors group">
      {/* Category Image Header */}
      <div className="h-28 w-full bg-[#F5F5F7] relative overflow-hidden border-b border-[#E5E5EA]">
        {category.image && !imgError ? (
          <img
            src={category.image}
            alt={category.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#86868B] bg-linear-to-br from-[#F5F5F7] to-[#E5E5EA]">
            <Layers className="w-7 h-7 mb-1 text-[#86868B]" />
            <span className="text-[10px] font-medium">{category.name}</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#007AFF] bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md border border-blue-200/60 shadow-xs">
            {category.tag || category.id.toUpperCase()}
          </span>
        </div>
        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm p-1 rounded-lg border border-white/60 shadow-xs">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="p-1 rounded text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
            title="Edit category tags and pricing"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-xs font-medium text-[#86868B]">{category.count}</span>
              <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight leading-tight mt-0.5">
                {category.name}
              </h3>
            </div>
          </div>

          {category.description && (
            <p className="text-xs text-[#86868B] mb-3 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Brand chips */}
          <div className="mt-2">
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#86868B]" />
              Sub-Categories & Brands:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-[#F5F5F7] text-[#1D1D1F] px-2.5 py-1 rounded-lg border border-[#E5E5EA]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-[#E5E5EA] flex items-center justify-between">
          <span className="text-xs text-[#86868B]">Live App Display Price:</span>
          <span className="text-sm font-bold font-mono text-[#007AFF]">
            {category.priceLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
