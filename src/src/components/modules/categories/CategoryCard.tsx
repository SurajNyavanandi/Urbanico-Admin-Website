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
    <div className="bg-white rounded-[12px] border border-[#E5E5EA] overflow-hidden flex flex-col justify-between hover:border-[#D2D2D7] hover:shadow-sm transition-all duration-300 group">
      {/* Category Image Header */}
      <div className="h-[120px] w-full bg-[#F5F5F7] relative overflow-hidden border-b border-[#E5E5EA]">
        {category.image && !imgError ? (
          <img
            src={category.image}
            alt={category.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#A1A1A6] bg-linear-to-br from-[#F5F5F7] to-[#E5E5EA]">
            <Layers className="w-[28px] h-[28px] mb-2 text-[#A1A1A6]" />
            <span className="text-[12px] font-medium">{category.name}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#0071E3] bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-[6px] border border-[#0071E3]/20 shadow-xs">
            {category.tag || category.id.toUpperCase()}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-1 rounded-[8px] border border-[#E5E5EA]/60 shadow-xs">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-[6px] text-[#555555] hover:text-[#000000] hover:bg-[#F5F5F7] transition-colors"
            title="Edit category tags and pricing"
          >
            <Edit2 className="w-[14px] h-[14px]" />
          </button>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="text-[13px] font-medium text-[#86868B]">{category.count}</span>
              <h3 className="text-[18px] font-semibold text-[#000000] tracking-tight leading-tight mt-1">
                {category.name}
              </h3>
            </div>
          </div>

          {category.description && (
            <p className="text-[14px] text-[#555555] mb-4 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Brand chips */}
          <div className="mt-4">
            <span className="text-[12px] font-semibold text-[#86868B] uppercase tracking-[0.05em] mb-2 flex items-center gap-1.5">
              <Tag className="w-[14px] h-[14px] text-[#86868B]" />
              Sub-Categories & Brands:
            </span>
            <div className="flex flex-wrap gap-2">
              {brands.map((b, i) => (
                <span
                  key={i}
                  className="text-[12px] font-medium bg-[#F5F5F7] text-[#000000] px-3 py-1.5 rounded-[6px] border border-[#E5E5EA]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#E5E5EA] flex items-center justify-between">
          <span className="text-[13px] text-[#86868B]">Live App Display Price:</span>
          <span className="text-[15px] font-bold font-mono text-[#0071E3]">
            {category.priceLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
