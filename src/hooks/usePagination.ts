// src/hooks/usePagination.ts
import { useState, useCallback } from 'react';
import type { PaginationMeta } from '../types/api.types';

export const usePagination = (initialPageSize = 10) => {
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    pageSize: initialPageSize,
    totalRecords: 0,
    totalPages: 0,
  });

  const updatePagination = useCallback((updates: Partial<PaginationMeta>) => {
    setPagination((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      pageSize: initialPageSize,
      totalRecords: 0,
      totalPages: 0,
    });
  }, [initialPageSize]);

  return {
    pagination,
    updatePagination,
    resetPagination,
  };
};
