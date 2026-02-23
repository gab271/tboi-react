/**
 * Subscription & Feature Configuration
 * 
 * Tiers:
 * - FREE: Acceso básico, lectura ilimitada
 * - PRO: Features predictivos (€4.99/mes)
 * - SUPPORTER: Todo + beneficios sociales (€8.99/mes)
 */

export const TIERS = {
  FREE: 'free',
  PRO: 'pro', 
  SUPPORTER: 'supporter'
};

export const TIER_CONFIG = {
  [TIERS.FREE]: {
    name: 'Free',
    price: 0,
    priceId: null, // Stripe price ID
    features: [
      'browse_items',
      'browse_bosses',
      'browse_characters', 
      'search',
      'save_parser_basic',
      'synergy_basic', // Ver sinergias básicas (sin explicación detallada)
      'builds_view',
      'comments_read'
    ],
    limits: {
      saveParsesPerDay: 3,
      synergyAnalysesPerDay: 5,
      favoritesCount: 20,
      buildsCount: 3
    },
    badge: null,
    color: '#666'
  },
  
  [TIERS.PRO]: {
    name: 'PRO',
    price: 4.99,
    priceId: 'price_pro_monthly', // TODO: Replace with real Stripe ID
    yearlyPrice: 39.99,
    yearlyPriceId: 'price_pro_yearly',
    features: [
      // All FREE features plus:
      'save_parser_full', // Análisis completo con predicciones
      'synergy_full', // Explicaciones detalladas, win probability
      'synergy_suggestions', // "Con X item llegarías a Guppy"
      'optimal_path', // Mejor camino sugerido
      'item_priority', // "Toma este primero"
      'builds_unlimited',
      'favorites_unlimited',
      'export_data',
      'no_ads'
    ],
    limits: {
      saveParsesPerDay: Infinity,
      synergyAnalysesPerDay: Infinity,
      favoritesCount: Infinity,
      buildsCount: Infinity
    },
    badge: {
      text: 'PRO',
      color: '#FFD700',
      icon: '⚡'
    },
    color: '#FFD700'
  },
  
  [TIERS.SUPPORTER]: {
    name: 'Supporter',
    price: 8.99,
    priceId: 'price_supporter_monthly',
    yearlyPrice: 79.99,
    yearlyPriceId: 'price_supporter_yearly',
    features: [
      // All PRO features plus:
      'profile_customization', // Avatar, banner, bio
      'profile_badge', // Badge visible en comentarios
      'early_access', // Acceso a features beta
      'supporter_discord', // Canal privado Discord
      'vote_features', // Votar próximas features
      'priority_support'
    ],
    limits: {
      saveParsesPerDay: Infinity,
      synergyAnalysesPerDay: Infinity,
      favoritesCount: Infinity,
      buildsCount: Infinity
    },
    badge: {
      text: 'SUPPORTER',
      color: '#FF6B6B',
      icon: '❤️'
    },
    color: '#FF6B6B'
  }
};

/**
 * Features que disparan el upgrade prompt
 */
export const PREMIUM_TRIGGERS = {
  // PRO triggers
  synergy_full: {
    requiredTier: TIERS.PRO,
    message: 'Desbloquea explicaciones detalladas de sinergias',
    benefit: 'Entiende POR QUÉ tus items funcionan juntos'
  },
  optimal_path: {
    requiredTier: TIERS.PRO,
    message: 'Ve el camino óptimo para tu build',
    benefit: 'Maximiza tu DPS con el orden correcto'  
  },
  synergy_suggestions: {
    requiredTier: TIERS.PRO,
    message: 'Recibe sugerencias de items',
    benefit: '"Con Dead Cat serías Guppy"'
  },
  save_parser_full: {
    requiredTier: TIERS.PRO,
    message: 'Desbloquea análisis completo de tu save',
    benefit: 'Ve estadísticas detalladas y predicciones'
  },
  
  // SUPPORTER triggers
  profile_customization: {
    requiredTier: TIERS.SUPPORTER,
    message: 'Personaliza tu perfil',
    benefit: 'Avatar, banner y bio únicos'
  },
  profile_badge: {
    requiredTier: TIERS.SUPPORTER,
    message: 'Muestra tu badge de Supporter',
    benefit: 'Destaca en la comunidad'
  }
};

/**
 * Check if a feature requires a specific tier
 */
export function getRequiredTier(feature) {
  for (const [tier, config] of Object.entries(TIER_CONFIG)) {
    if (config.features.includes(feature)) {
      return tier;
    }
  }
  return TIERS.FREE;
}

/**
 * Check if tier has access to feature
 */
export function tierHasFeature(userTier, feature) {
  const tierOrder = [TIERS.FREE, TIERS.PRO, TIERS.SUPPORTER];
  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTier = getRequiredTier(feature);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  return userTierIndex >= requiredTierIndex;
}

/**
 * Get upgrade suggestion for feature
 */
export function getUpgradeSuggestion(currentTier, feature) {
  if (tierHasFeature(currentTier, feature)) {
    return null;
  }
  
  const trigger = PREMIUM_TRIGGERS[feature];
  if (!trigger) {
    return {
      requiredTier: TIERS.PRO,
      message: 'Esta función requiere PRO',
      benefit: 'Acceso completo a todas las herramientas'
    };
  }
  
  return trigger;
}

export default TIER_CONFIG;
