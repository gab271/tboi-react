/**
 * useUserItemProgress Hook
 * Gestiona el progreso del usuario con cada item
 * (desbloqueados, usados, frecuencia en builds)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { 
  fetchUserItemProgress, 
  updateItemProgress,
  fetchUnlockableItems 
} from '../api/collectionLabApi';

export function useUserItemProgress() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // ═══════════════════════════════════════════════════════════
  // PROGRESO GENERAL DEL USUARIO
  // ═══════════════════════════════════════════════════════════
  
  const { 
    data: progress, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['user-item-progress', user?.id],
    queryFn: () => fetchUserItemProgress(user.id),
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // ═══════════════════════════════════════════════════════════
  // ITEMS DESBLOQUEABLES AHORA
  // ═══════════════════════════════════════════════════════════
  
  const { data: unlockable } = useQuery({
    queryKey: ['unlockable-items', user?.id],
    queryFn: () => fetchUnlockableItems(user.id),
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
  
  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Obtiene el estado de un item específico
   */
  const getItemStatus = (itemId) => {
    if (!progress) {
      return {
        state: 'unknown',
        isLocked: false, // Por defecto mostrar como desbloqueado
        usageCount: 0,
        isFrequent: false,
        inUserBuilds: 0,
      };
    }
    
    const itemProgress = progress.items?.[itemId];
    
    if (!itemProgress) {
      return {
        state: 'locked',
        isLocked: true,
        usageCount: 0,
        isFrequent: false,
        inUserBuilds: 0,
      };
    }
    
    return {
      state: itemProgress.unlocked ? 'unlocked' : 'locked',
      isLocked: !itemProgress.unlocked,
      usageCount: itemProgress.usageCount || 0,
      isFrequent: (itemProgress.usageCount || 0) >= 10, // Usado 10+ veces
      inUserBuilds: itemProgress.buildCount || 0,
      lastUsed: itemProgress.lastUsed,
      firstUnlocked: itemProgress.firstUnlocked,
    };
  };
  
  /**
   * Verifica si un item está desbloqueado
   */
  const isItemUnlocked = (itemId) => {
    const status = getItemStatus(itemId);
    return !status.isLocked;
  };
  
  /**
   * Obtiene conteo de uso de un item
   */
  const getItemUsageCount = (itemId) => {
    return getItemStatus(itemId).usageCount;
  };
  
  /**
   * Verifica si item es desbloqueable ahora
   */
  const isItemUnlockableNow = (itemId) => {
    return unlockable?.items?.includes(itemId);
  };
  
  /**
   * Obtiene estadísticas globales de progreso
   */
  const getProgressStats = () => {
    if (!progress) {
      return {
        totalItems: 0,
        unlockedItems: 0,
        percentComplete: 0,
        mostUsedItems: [],
      };
    }
    
    const items = Object.values(progress.items || {});
    const unlocked = items.filter(i => i.unlocked);
    
    return {
      totalItems: progress.totalItems || 700,
      unlockedItems: unlocked.length,
      percentComplete: progress.totalItems 
        ? Math.round((unlocked.length / progress.totalItems) * 100) 
        : 0,
      mostUsedItems: items
        .filter(i => i.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 10)
        .map(i => ({
          itemId: i.itemId,
          usageCount: i.usageCount,
        })),
    };
  };
  
  // ═══════════════════════════════════════════════════════════
  // MUTACIÓN PARA ACTUALIZAR PROGRESO
  // ═══════════════════════════════════════════════════════════
  
  const updateProgress = useMutation({
    mutationFn: ({ itemId, action }) => updateItemProgress(user.id, itemId, action),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-item-progress', user?.id]);
    },
  });
  
  /**
   * Marca un item como usado (para tracking)
   */
  const markItemUsed = (itemId) => {
    if (!isAuthenticated) return;
    updateProgress.mutate({ itemId, action: 'used' });
  };
  
  return {
    // Estado
    progress,
    unlockableItems: unlockable?.items || [],
    isLoading,
    hasSaveData: !!progress && Object.keys(progress.items || {}).length > 0,
    
    // Helpers por item
    getItemStatus,
    isItemUnlocked,
    getItemUsageCount,
    isItemUnlockableNow,
    
    // Helpers globales
    getProgressStats,
    
    // Acciones
    markItemUsed,
    refetch,
  };
}
