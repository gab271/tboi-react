/**
 * usePaginatedItems Hook
 * Pagination tradicional para la colección de items
 */
import { useQuery } from '@tanstack/react-query';
import { fetchItemsPage } from '../api/collectionLabApi';
import { useBuildLabContext } from '../context/BuildLabContext';
import { applySmartFilters } from '../lib/filterEngine';
import { useFeatures } from '../../../hooks/useFeatures';
import { useMemo } from 'react';

export function usePaginatedItems(options = {}) {
  const { filters } = useBuildLabContext();
  const { userTier } = useFeatures();
  const { search = '', page = 0, pageSize = 48 } = options;
  
  // ═══════════════════════════════════════════════════════════
  // PAGINATED QUERY
  // ═══════════════════════════════════════════════════════════
  
  const {
    data,
    isFetching,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['collection-items-paginated', filters.type, filters.quality, search, page, pageSize],
    queryFn: async () => {
      const result = await fetchItemsPage({
        page: page + 1, // API uses 1-indexed pages
        pageSize,
        type: filters.type,
        quality: filters.quality,
        search,
      });
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    placeholderData: (prev) => prev,
  });
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS INTELIGENTES (aplicados localmente)
  // ═══════════════════════════════════════════════════════════
  
  const items = useMemo(() => {
    if (!data?.data) return [];
    
    const rawItems = data.data || [];
    
    // Aplicar filtros inteligentes localmente
    if (filters.smart && filters.smart.length > 0) {
      return applySmartFilters(rawItems, filters.smart, userTier);
    }
    
    return rawItems;
  }, [data, filters.smart, userTier]);
  
  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  
  const meta = useMemo(() => {
    const total = data?.meta?.total || 0;
    const ps = data?.meta?.pageSize || pageSize;
    return {
      total,
      page: data?.meta?.page || 1,
      pageSize: ps,
      totalPages: total > 0 ? Math.ceil(total / ps) : 0,
    };
  }, [data, pageSize]);
  
  return {
    items,
    meta,
    
    // Loading states
    isLoading,
    isFetching,
    
    // Error handling
    isError,
    error,
    
    // Actions
    refetch,
  };
}
