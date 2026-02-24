/**
 * useInfiniteItems Hook
 * Infinite scroll para la colección de items
 */
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchItemsPage } from '../api/collectionLabApi';
import { useBuildLabContext } from '../context/BuildLabContext';
import { applySmartFilters } from '../lib/filterEngine';
import { useFeatures } from '../../../hooks/useFeatures';
import { useMemo } from 'react';

export function useInfiniteItems(options = {}) {
  const { filters } = useBuildLabContext();
  const { userTier } = useFeatures();
  const { search = '' } = options;
  
  const PAGE_SIZE = 48;
  
  // ═══════════════════════════════════════════════════════════
  // INFINITE QUERY
  // ═══════════════════════════════════════════════════════════
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['collection-items', filters.type, filters.quality, search],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchItemsPage({
        page: pageParam,
        pageSize: PAGE_SIZE,
        type: filters.type,
        quality: filters.quality,
        search,
      });
      return result;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // ═══════════════════════════════════════════════════════════
  // FLATTEN Y FILTROS INTELIGENTES
  // ═══════════════════════════════════════════════════════════
  
  const allItems = useMemo(() => {
    if (!data?.pages) return [];
    
    // Flatten todas las páginas
    const flat = data.pages.flatMap(page => page.data || []);
    
    // Aplicar filtros inteligentes localmente
    if (filters.smart && filters.smart.length > 0) {
      return applySmartFilters(flat, filters.smart, userTier);
    }
    
    return flat;
  }, [data, filters.smart, userTier]);
  
  // ═══════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════
  
  const meta = useMemo(() => {
    const lastPage = data?.pages?.[data.pages.length - 1];
    return {
      total: lastPage?.meta?.total || allItems.length,
      loaded: allItems.length,
      hasMore: hasNextPage,
    };
  }, [data, allItems.length, hasNextPage]);
  
  return {
    items: allItems,
    meta,
    
    // Infinite scroll
    fetchNextPage,
    hasNextPage,
    
    // Loading states
    isLoading,
    isFetching,
    isFetchingNextPage,
    isLoadingMore: isFetchingNextPage,
    
    // Error handling
    isError,
    error,
    
    // Actions
    refetch,
  };
}
