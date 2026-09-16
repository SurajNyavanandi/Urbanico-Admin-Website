import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-[#86868B] absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#F5F5F7] text-sm text-[#1D1D1F] placeholder-[#AEAEB2] rounded-xl pl-9 pr-8 py-2 border border-transparent focus:border-[#E5E5EA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 text-[#86868B] hover:text-[#1D1D1F] p-0.5 rounded-full hover:bg-[#E5E5EA] transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
