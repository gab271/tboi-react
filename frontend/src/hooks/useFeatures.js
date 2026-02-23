/**
 * useFeatures Hook
 * 
 * Gestiona acceso a features según tier del usuario.
 * Proporciona helpers para mostrar upgrade prompts.
 */
import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { 
  TIERS, 
  TIER_CONFIG, 
  tierHasFeature, 
  getUpgradeSuggestion,
  getRequiredTier 
} from '../config/subscriptions';

export function useFeatures() {
  const { user, isLoading } = useAuth();
  
  // El tier del usuario (default: FREE)
  const userTier = useMemo(() => {
    if (!user) return TIERS.FREE;
    return user.subscription_tier || TIERS.FREE;
  }, [user]);
  
  const tierConfig = useMemo(() => TIER_CONFIG[userTier], [userTier]);
  
  /**
   * Check if user has access to a feature
   */
  const hasFeature = useCallback((feature) => {
    return tierHasFeature(userTier, feature);
  }, [userTier]);
  
  /**
   * Check if user is within their limit
   */
  const checkLimit = useCallback((limitKey, currentCount) => {
    const limit = tierConfig.limits[limitKey];
    return currentCount < limit;
  }, [tierConfig]);
  
  /**
   * Get remaining uses for a limit
   */
  const getRemainingUses = useCallback((limitKey, currentCount) => {
    const limit = tierConfig.limits[limitKey];
    if (limit === Infinity) return Infinity;
    return Math.max(0, limit - currentCount);
  }, [tierConfig]);
  
  /**
   * Get upgrade info if feature is locked
   */
  const getUpgradeInfo = useCallback((feature) => {
    return getUpgradeSuggestion(userTier, feature);
  }, [userTier]);
  
  /**
   * Convenience: is PRO or higher?
   */
  const isPro = useMemo(() => {
    return userTier === TIERS.PRO || userTier === TIERS.SUPPORTER;
  }, [userTier]);
  
  /**
   * Convenience: is Supporter?
   */
  const isSupporter = useMemo(() => {
    return userTier === TIERS.SUPPORTER;
  }, [userTier]);
  
  /**
   * Get user's badge if any
   */
  const userBadge = useMemo(() => {
    return tierConfig.badge;
  }, [tierConfig]);
  
  return {
    // Estado
    userTier,
    tierConfig,
    isLoading,
    
    // Checks
    hasFeature,
    checkLimit,
    getRemainingUses,
    getUpgradeInfo,
    
    // Conveniences
    isPro,
    isSupporter,
    userBadge,
    
    // Constants for external use
    TIERS,
    TIER_CONFIG
  };
}

/**
 * Hook para un feature específico con upgrade prompt automático
 */
export function useFeatureGate(feature) {
  const { hasFeature, getUpgradeInfo, userTier } = useFeatures();
  
  const hasAccess = hasFeature(feature);
  const upgradeInfo = !hasAccess ? getUpgradeInfo(feature) : null;
  
  return {
    hasAccess,
    upgradeInfo,
    currentTier: userTier,
    requiredTier: getRequiredTier(feature)
  };
}

/**
 * Hook para límites de uso
 */
export function useUsageLimit(limitKey, currentCount) {
  const { checkLimit, getRemainingUses, tierConfig, userTier } = useFeatures();
  
  const withinLimit = checkLimit(limitKey, currentCount);
  const remaining = getRemainingUses(limitKey, currentCount);
  const maxLimit = tierConfig.limits[limitKey];
  
  return {
    withinLimit,
    remaining,
    maxLimit,
    currentCount,
    isUnlimited: maxLimit === Infinity,
    percentUsed: maxLimit === Infinity ? 0 : (currentCount / maxLimit) * 100,
    currentTier: userTier
  };
}

export default useFeatures;
