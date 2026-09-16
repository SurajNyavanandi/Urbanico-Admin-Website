import { useState, useMemo } from 'react';

export function usePagination<T>(items: T[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 if items change and currentPage exceeds totalPages
  const activePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, activePage, pageSize]);

  return {
    currentPage: activePage,
    setCurrentPage,
    totalPages,
    pageSize,
    paginatedItems,
    totalItems: items.length,
    hasNextPage: activePage < totalPages,
    hasPrevPage: activePage > 1,
    nextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    prevPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
  };
}
