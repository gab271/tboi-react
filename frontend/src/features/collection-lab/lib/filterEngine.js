/**
 * Filter Engine
 * Motor de filtros inteligentes para The Collection Lab
 * Los filtros usan datos estructurados, no tags manuales
 */

/**
 * Definición de filtros inteligentes
 * Cada filtro tiene una función que evalúa el item
 */
export const SMART_FILTERS = {
  // ═══════════════════════════════════════════════════════════
  // FILTROS DE DAÑO
  // ═══════════════════════════════════════════════════════════
  
  high_dps_boost: {
    id: 'high_dps_boost',
    name: 'Alto impacto DPS',
    description: 'Items que aumentan significativamente el DPS',
    icon: '⚔️',
    category: 'damage',
    evaluate: (item) => {
      const effects = item.effects || {};
      // Multiplicador de daño > 1.3 o daño flat > 3
      return (effects.damageMultiplier && effects.damageMultiplier > 1.3) ||
             (effects.flatDamage && effects.flatDamage > 3);
    },
    tier: 'free',
  },
  
  damage_multiplier: {
    id: 'damage_multiplier',
    name: 'Multiplicador de daño',
    description: 'Items con multiplicador de daño',
    icon: '✖️',
    category: 'damage',
    evaluate: (item) => {
      return item.effects?.damageMultiplier && item.effects.damageMultiplier > 1;
    },
    tier: 'free',
  },
  
  flat_damage: {
    id: 'flat_damage',
    name: 'Daño plano',
    description: 'Items que añaden daño directo',
    icon: '➕',
    category: 'damage',
    evaluate: (item) => {
      return item.effects?.flatDamage && item.effects.flatDamage > 0;
    },
    tier: 'free',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS DE TEAR TYPE
  // ═══════════════════════════════════════════════════════════
  
  changes_tear_type: {
    id: 'changes_tear_type',
    name: 'Cambia tipo de lágrima',
    description: 'Items que transforman completamente tus disparos',
    icon: '💧',
    category: 'tears',
    evaluate: (item) => {
      return !!item.effects?.tearType;
    },
    tier: 'free',
  },
  
  adds_tear_effects: {
    id: 'adds_tear_effects',
    name: 'Efectos de lágrima',
    description: 'Items que añaden efectos especiales a los disparos',
    icon: '✨',
    category: 'tears',
    evaluate: (item) => {
      return item.effects?.tearFlags && item.effects.tearFlags.length > 0;
    },
    tier: 'free',
  },
  
  homing_tears: {
    id: 'homing_tears',
    name: 'Lágrimas homing',
    description: 'Items que dan lágrimas guiadas',
    icon: '🎯',
    category: 'tears',
    evaluate: (item) => {
      return item.effects?.tearFlags?.includes('homing');
    },
    tier: 'free',
  },
  
  piercing_tears: {
    id: 'piercing_tears',
    name: 'Lágrimas perforantes',
    description: 'Atraviesan enemigos',
    icon: '🗡️',
    category: 'tears',
    evaluate: (item) => {
      return item.effects?.tearFlags?.includes('piercing');
    },
    tier: 'free',
  },
  
  spectral_tears: {
    id: 'spectral_tears',
    name: 'Lágrimas espectrales',
    description: 'Atraviesan obstáculos',
    icon: '👻',
    category: 'tears',
    evaluate: (item) => {
      return item.effects?.tearFlags?.includes('spectral');
    },
    tier: 'free',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS DE ON-HIT
  // ═══════════════════════════════════════════════════════════
  
  on_hit_effect: {
    id: 'on_hit_effect',
    name: 'Efecto al golpear',
    description: 'Items con efectos especiales al impactar',
    icon: '💥',
    category: 'effects',
    evaluate: (item) => {
      return item.effects?.onHit && item.effects.onHit.length > 0;
    },
    tier: 'pro',
  },
  
  poison_effect: {
    id: 'poison_effect',
    name: 'Veneno',
    description: 'Items que envenenan enemigos',
    icon: '☠️',
    category: 'effects',
    evaluate: (item) => {
      return item.effects?.tearFlags?.includes('poison') ||
             item.effects?.onHit?.some(e => e.type === 'poison');
    },
    tier: 'free',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS DE TRANSFORMACIÓN
  // ═══════════════════════════════════════════════════════════
  
  enables_transformation: {
    id: 'enables_transformation',
    name: 'Activa transformación',
    description: 'Items que contribuyen a transformaciones',
    icon: '🔮',
    category: 'transformation',
    evaluate: (item) => {
      return item.transformationTags && item.transformationTags.length > 0;
    },
    tier: 'free',
  },
  
  guppy_item: {
    id: 'guppy_item',
    name: 'Item de Guppy',
    description: 'Contribuye a transformación Guppy',
    icon: '🐱',
    category: 'transformation',
    evaluate: (item) => {
      return item.transformationTags?.includes('guppy');
    },
    tier: 'free',
  },
  
  angel_item: {
    id: 'angel_item',
    name: 'Item de Ángel',
    description: 'Contribuye a Seraphim',
    icon: '👼',
    category: 'transformation',
    evaluate: (item) => {
      return item.transformationTags?.includes('seraphim');
    },
    tier: 'free',
  },
  
  devil_item: {
    id: 'devil_item',
    name: 'Item del Diablo',
    description: 'Contribuye a Leviathan',
    icon: '😈',
    category: 'transformation',
    evaluate: (item) => {
      return item.transformationTags?.includes('leviathan');
    },
    tier: 'free',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS DE FASE DE JUEGO
  // ═══════════════════════════════════════════════════════════
  
  early_game: {
    id: 'early_game',
    name: 'Mejor early game',
    description: 'Items efectivos desde el principio',
    icon: '🌱',
    category: 'phase',
    evaluate: (item) => {
      // Buen early: daño flat o fire rate improvement
      const effects = item.effects || {};
      return (effects.flatDamage && effects.flatDamage > 0) ||
             (effects.tearDelayMultiplier && effects.tearDelayMultiplier < 1) ||
             (item.quality >= 3 && !effects.tearType); // Q3+ sin requisitos
    },
    tier: 'pro',
  },
  
  late_game: {
    id: 'late_game',
    name: 'Mejor late game',
    description: 'Items que escalan bien',
    icon: '🔥',
    category: 'phase',
    evaluate: (item) => {
      // Buen late: multiplicadores, transformaciones, tear types poderosos
      const effects = item.effects || {};
      return (effects.damageMultiplier && effects.damageMultiplier > 1.5) ||
             (effects.tearType && ['brimstone', 'knife', 'techx', 'epic'].includes(effects.tearType)) ||
             (item.transformationTags && item.transformationTags.length > 0);
    },
    tier: 'pro',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS DE RIESGO
  // ═══════════════════════════════════════════════════════════
  
  low_risk: {
    id: 'low_risk',
    name: 'Bajo riesgo',
    description: 'Items seguros sin desventajas',
    icon: '🛡️',
    category: 'risk',
    evaluate: (item) => {
      const effects = item.effects || {};
      // Sin penalizaciones de stats
      if (effects.stats) {
        const hasNegative = Object.values(effects.stats).some(v => v < 0);
        if (hasNegative) return false;
      }
      // Sin multiplicadores negativos de daño
      if (effects.damageMultiplier && effects.damageMultiplier < 1) return false;
      // Quality >= 2 generalmente seguro
      return item.quality >= 2;
    },
    tier: 'pro',
  },
  
  high_risk: {
    id: 'high_risk',
    name: 'Alto riesgo',
    description: 'Items con desventajas pero alto potencial',
    icon: '⚡',
    category: 'risk',
    evaluate: (item) => {
      const effects = item.effects || {};
      // Tiene penalizaciones pero también beneficios altos
      const hasNegative = effects.stats && Object.values(effects.stats).some(v => v < 0);
      const hasDamageReduction = effects.damageMultiplier && effects.damageMultiplier < 1;
      const hasHighReward = (effects.damageMultiplier && effects.damageMultiplier > 1.5) ||
                            (effects.flatDamage && effects.flatDamage > 10) ||
                            effects.tearType;
      return (hasNegative || hasDamageReduction) && hasHighReward;
    },
    tier: 'pro',
  },
  
  // ═══════════════════════════════════════════════════════════
  // FILTROS DE STATS
  // ═══════════════════════════════════════════════════════════
  
  speed_up: {
    id: 'speed_up',
    name: 'Velocidad +',
    description: 'Items que aumentan velocidad',
    icon: '👟',
    category: 'stats',
    evaluate: (item) => {
      return item.effects?.stats?.speed && item.effects.stats.speed > 0;
    },
    tier: 'free',
  },
  
  fire_rate_up: {
    id: 'fire_rate_up',
    name: 'Fire Rate +',
    description: 'Items que aumentan cadencia de disparo',
    icon: '🔫',
    category: 'stats',
    evaluate: (item) => {
      const effects = item.effects || {};
      return (effects.tearDelayMultiplier && effects.tearDelayMultiplier < 1) ||
             (effects.stats?.tears && effects.stats.tears > 0);
    },
    tier: 'free',
  },
  
  multi_shot: {
    id: 'multi_shot',
    name: 'Multi-disparo',
    description: 'Items que disparan múltiples lágrimas',
    icon: '🎇',
    category: 'stats',
    evaluate: (item) => {
      const tc = item.effects?.tearCount;
      return tc && (tc === 'double' || tc === 'triple' || tc > 1);
    },
    tier: 'free',
  },
};

// Categorías de filtros
export const FILTER_CATEGORIES = {
  damage: { name: 'Daño', icon: '⚔️', order: 1 },
  tears: { name: 'Lágrimas', icon: '💧', order: 2 },
  effects: { name: 'Efectos', icon: '✨', order: 3 },
  transformation: { name: 'Transformación', icon: '🔮', order: 4 },
  stats: { name: 'Stats', icon: '📊', order: 5 },
  phase: { name: 'Fase', icon: '⏱️', order: 6 },
  risk: { name: 'Riesgo', icon: '⚡', order: 7 },
};

/**
 * Aplica filtros inteligentes a una lista de items
 * @param {Array} items - Lista de items con efectos
 * @param {Array} activeFilters - IDs de filtros activos
 * @param {string} userTier - Tier del usuario ('free' | 'pro')
 */
export function applySmartFilters(items, activeFilters, userTier = 'free') {
  if (!activeFilters || activeFilters.length === 0) {
    return items;
  }
  
  // Obtener funciones de evaluación
  const evaluators = activeFilters.map(filterId => {
    const filter = SMART_FILTERS[filterId];
    if (!filter) return null;
    // Verificar tier
    if (filter.tier === 'pro' && userTier !== 'pro') return null;
    return filter.evaluate;
  }).filter(Boolean);
  
  if (evaluators.length === 0) {
    return items;
  }
  
  // Aplicar filtros (OR logic - el item pasa si cumple algún filtro)
  return items.filter(item => evaluators.some(evaluate => evaluate(item)));
}

/**
 * Obtiene filtros disponibles según tier del usuario
 */
export function getAvailableFilters(userTier = 'free') {
  return Object.values(SMART_FILTERS).filter(filter => {
    return filter.tier === 'free' || userTier === 'pro';
  });
}

/**
 * Obtiene filtros agrupados por categoría
 */
export function getFiltersByCategory(userTier = 'free') {
  const available = getAvailableFilters(userTier);
  
  const grouped = {};
  for (const filter of available) {
    const cat = filter.category;
    if (!grouped[cat]) {
      grouped[cat] = {
        ...FILTER_CATEGORIES[cat],
        filters: [],
      };
    }
    grouped[cat].filters.push(filter);
  }
  
  // Ordenar por orden de categoría
  return Object.entries(grouped)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, value]) => ({ key, ...value }));
}

/**
 * Clasifica un item según los filtros que cumple
 * Útil para mostrar badges/tags automáticos
 */
export function classifyItem(item) {
  const matchedFilters = [];
  
  for (const [id, filter] of Object.entries(SMART_FILTERS)) {
    if (filter.evaluate(item)) {
      matchedFilters.push({
        id,
        name: filter.name,
        icon: filter.icon,
        category: filter.category,
      });
    }
  }
  
  return matchedFilters;
}

/**
 * Obtiene sugerencias de filtros basadas en la build actual
 */
export function getSuggestedFilters(currentBuild, userTier = 'free') {
  const suggestions = [];
  
  // Analizar build actual
  const hasTransformationProgress = currentBuild.some(item => 
    item.transformationTags && item.transformationTags.length > 0
  );
  
  const hasDamageMultiplier = currentBuild.some(item =>
    item.effects?.damageMultiplier && item.effects.damageMultiplier > 1
  );
  
  const hasTearTypeChange = currentBuild.some(item =>
    item.effects?.tearType
  );
  
  // Sugerir filtros complementarios
  if (hasTransformationProgress) {
    suggestions.push({
      id: 'enables_transformation',
      reason: 'Completa una transformación',
    });
  }
  
  if (!hasDamageMultiplier) {
    suggestions.push({
      id: 'damage_multiplier',
      reason: 'Tu build necesita multiplicadores',
    });
  }
  
  if (!hasTearTypeChange) {
    suggestions.push({
      id: 'changes_tear_type',
      reason: 'Mejora con un nuevo tipo de lágrima',
    });
  }
  
  return suggestions.filter(s => {
    const filter = SMART_FILTERS[s.id];
    return filter && (filter.tier === 'free' || userTier === 'pro');
  });
}
