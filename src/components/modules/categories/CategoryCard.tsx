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
    <div className="bg-[#18181B] rounded-xl border border-[#3F3F46] overflow-hidden flex flex-col justify-between hover:border-yellow-500/50 shadow-md transition-all duration-200 group text-zinc-50">
      {/* Category Image Header */}
      <div className="h-[120px] w-full bg-[#27272A] relative overflow-hidden border-b border-[#3F3F46]">
        {category.image && !imgError ? (
          <img
            src={category.image}
            alt={category.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-[#27272A]">
            <Layers className="w-7 h-7 mb-1 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-400">{category.name}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 bg-zinc-950/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-yellow-500/30 shadow-sm">
            {category.tag || category.id.toUpperCase()}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-zinc-950/90 backdrop-blur-md p-1 rounded-lg border border-[#3F3F46]">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-[#27272A] transition-colors cursor-pointer"
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
              <span className="text-xs font-mono text-zinc-400">{category.count}</span>
              <h3 className="text-base font-bold text-zinc-100 tracking-tight leading-tight mt-0.5">
                {category.name}
              </h3>
            </div>
          </div>

          {category.description && (
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Brand chips */}
          <div className="mt-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              Sub-Categories & Brands:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b, i) => (
                <span
                  key={i}
                  className="text-xs font-medium bg-[#27272A] text-zinc-200 px-2.5 py-1 rounded-md border border-[#3F3F46]"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#3F3F46] flex items-center justify-between">
          <span className="text-xs text-zinc-400">Live App Display Price:</span>
          <span className="text-sm font-bold font-mono text-yellow-400">
            {category.priceLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

