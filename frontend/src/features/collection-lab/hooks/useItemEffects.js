/**
 * useItemEffects Hook
 * Hook para obtener items con sus efectos estructurados
 */
import { useQuery } from '@tanstack/react-query';
import { fetchItemsWithEffects, fetchItemEffects } from '../api/collectionLabApi';

/**
 * Obtiene items con efectos para el motor de sinergias
 */
export function useItemEffects() {
  return useQuery({
    queryKey: ['items-effects'],
    queryFn: fetchItemsWithEffects,
    staleTime: 1000 * 60 * 30, // 30 minutos - datos estáticos
    gcTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Obtiene efectos de un item específico
 */
export function useItemEffect(itemId) {
  return useQuery({
    queryKey: ['item-effects', itemId],
    queryFn: () => fetchItemEffects(itemId),
    enabled: !!itemId,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Hook para merge de datos de item con sus efectos
 */
export function useEnrichedItem(item) {
  const { data: effects } = useItemEffect(item?.id);
  
  if (!item) return null;
  if (!effects) return item;
  
  return {
    ...item,
    effects: effects.effects,
    priority: effects.priority,
    transformationTags: effects.transformationTags,
  };
}
