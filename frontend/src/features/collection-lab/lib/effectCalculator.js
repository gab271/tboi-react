/**
 * Effect Calculator
 * Motor de cálculo de efectos acumulativos para el frontend
 * Sincronizado con el backend synergyEngine.js
 */

// Estado base del personaje (sincronizado con backend)
export const BASE_STATE = {
  damage: 3.5,
  tears: 2.73,
  range: 6.5,
  speed: 1.0,
  shotSpeed: 1.0,
  luck: 0,
  
  tearType: 'normal',
  tearFlags: [],
  tearCount: 1,
  tearPattern: null,
  
  damageMultiplier: 1.0,
  tearDelayMultiplier: 1.0,
  tearDelayCap: 5,
  
  onHitEffects: [],
  transformations: [],
  activeOverrides: [],
};

// Umbrales de transformación
export const TRANSFORMATION_THRESHOLDS = {
  guppy: 3,
  beelzebub: 3,
  conjoined: 3,
  leviathan: 3,
  spun: 3,
  bookworm: 3,
  mom: 3,
  seraphim: 3,
  oh_crap: 3,
  fun_guy: 3,
  super_bum: 3,
  spider_baby: 3,
};

// Multiplicadores DPS por tipo de lágrima
export const TEAR_TYPE_MULTIPLIERS = {
  normal: 1,
  brimstone: 10,
  laser: 1,
  knife: 2,
  techx: 8,
  ludovico: 0.5,
  epic: 20,
  dr_fetus: 5,
  spirit: 1.5,
  mini_brimstone: 6,
  fetus: 8,
};

// Información de transformaciones
export const TRANSFORMATION_INFO = {
  guppy: {
    name: 'Guppy',
    description: 'Vuelo + Moscas al golpear',
    icon: '🐱',
    color: '#FF6B6B',
  },
  leviathan: {
    name: 'Leviathan',
    description: '+2 Daño + Vuelo + Corazones Negros',
    icon: '😈',
    color: '#2D1B69',
  },
  conjoined: {
    name: 'Conjoined',
    description: 'Triple disparo',
    icon: '👥',
    color: '#8B4513',
  },
  beelzebub: {
    name: 'Beelzebub',
    description: 'Vuelo + Moscas aliadas',
    icon: '🪰',
    color: '#228B22',
  },
  spun: {
    name: 'Spun',
    description: '+2 Daño + Velocidad',
    icon: '💉',
    color: '#FF1493',
  },
  seraphim: {
    name: 'Seraphim',
    description: 'Vuelo + Lágrimas homing',
    icon: '👼',
    color: '#FFD700',
  },
  bookworm: {
    name: 'Bookworm',
    description: 'Triple disparo ocasional',
    icon: '📚',
    color: '#8B0000',
  },
  mom: {
    name: 'Mom',
    description: '+1 Daño + Rango + Contacto',
    icon: '👩',
    color: '#C71585',
  },
  oh_crap: {
    name: 'Oh Crap',
    description: 'Regeneración en salas sin enemigos',
    icon: '💩',
    color: '#8B4513',
  },
  fun_guy: {
    name: 'Fun Guy',
    description: '+1 Corazón rojo',
    icon: '🍄',
    color: '#FF6347',
  },
};

/**
 * Calcula el estado de una build en el cliente
 * @param {Array} items - Items con efectos
 * @param {Object} character - Personaje base (opcional)
 */
export function calculateBuildState(items, character = null) {
  // Estado inicial
  const state = {
    ...JSON.parse(JSON.stringify(BASE_STATE)),
    tearFlags: [],
    transformations: [],
    onHitEffects: [],
    activeOverrides: [],
  };
  
  // Aplicar stats de personaje
  if (character?.baseStats) {
    Object.entries(character.baseStats).forEach(([key, value]) => {
      if (state[key] !== undefined) {
        state[key] = value;
      }
    });
  }
  
  // Ordenar por prioridad
  const sortedItems = [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  // Recolectar overrides y transformaciones
  const overrides = new Set();
  const transformationCounts = {};
  
  for (const item of sortedItems) {
    if (item.effects?.overrides) {
      item.effects.overrides.forEach(o => overrides.add(o));
    }
    
    if (item.transformationTags) {
      item.transformationTags.forEach(tag => {
        transformationCounts[tag] = (transformationCounts[tag] || 0) + 1;
      });
    }
  }
  
  // Detectar transformaciones
  for (const [tag, count] of Object.entries(transformationCounts)) {
    const threshold = TRANSFORMATION_THRESHOLDS[tag] || 3;
    if (count >= threshold) {
      state.transformations.push(tag);
    }
  }
  
  // Progreso hacia transformaciones (para UI)
  state.transformationProgress = Object.entries(transformationCounts).map(([tag, count]) => ({
    tag,
    current: count,
    threshold: TRANSFORMATION_THRESHOLDS[tag] || 3,
    complete: count >= (TRANSFORMATION_THRESHOLDS[tag] || 3),
    info: TRANSFORMATION_INFO[tag] || { name: tag, icon: '❓' },
  }));
  
  // Aplicar efectos de items
  let tearTypePriority = -1;
  
  for (const item of sortedItems) {
    const effects = item.effects || {};
    
    // Verificar override
    if (effects.overriddenBy) {
      const isOverridden = effects.overriddenBy.some(o => overrides.has(o));
      if (isOverridden) continue;
    }
    
    // Tear Type
    if (effects.tearType && !overrides.has('tearType')) {
      const priority = item.priority || 0;
      if (priority > tearTypePriority) {
        state.tearType = effects.tearType;
        tearTypePriority = priority;
      }
    }
    
    // Tear Flags (acumulativos)
    if (effects.tearFlags) {
      effects.tearFlags.forEach(flag => {
        if (!state.tearFlags.includes(flag)) {
          state.tearFlags.push(flag);
        }
      });
    }
    
    // Damage
    if (effects.flatDamage) {
      state.damage += effects.flatDamage;
    }
    if (effects.damageMultiplier) {
      state.damageMultiplier *= effects.damageMultiplier;
    }
    
    // Tear Delay
    if (effects.flatTearDelay) {
      state.tears += effects.flatTearDelay;
    }
    if (effects.tearDelayMultiplier) {
      state.tearDelayMultiplier *= effects.tearDelayMultiplier;
    }
    if (effects.tearDelayCap !== undefined) {
      state.tearDelayCap = effects.tearDelayCap;
    }
    
    // Stats
    if (effects.stats) {
      for (const [stat, value] of Object.entries(effects.stats)) {
        if (typeof state[stat] === 'number') {
          state[stat] += value;
        }
      }
    }
    
    // Tear Count
    if (effects.tearCount) {
      if (effects.tearCount === 'double') {
        state.tearCount *= 2;
      } else if (effects.tearCount === 'triple') {
        state.tearCount *= 3;
      } else if (typeof effects.tearCount === 'number') {
        state.tearCount = Math.max(state.tearCount, effects.tearCount);
      }
    }
    
    // On-Hit Effects
    if (effects.onHit) {
      state.onHitEffects.push(...effects.onHit);
    }
  }
  
  // Aplicar efectos de transformaciones
  applyTransformationEffects(state);
  
  // Calcular métricas finales
  state.finalDamage = state.damage * state.damageMultiplier;
  state.finalTearDelay = Math.max(
    state.tears * state.tearDelayMultiplier,
    state.tearDelayCap || 0
  );
  state.tearsPerSecond = 30 / (state.finalTearDelay + 1);
  state.finalDPS = calculateDPS(state);
  
  // Rating
  state.rating = calculateRating(state.finalDPS);
  
  return state;
}

/**
 * Aplica efectos de transformaciones
 */
function applyTransformationEffects(state) {
  if (state.transformations.includes('guppy')) {
    state.onHitEffects.push({ type: 'spawn_fly', chance: 0.5 });
    state.canFly = true;
  }
  
  if (state.transformations.includes('leviathan')) {
    state.damage += 2;
    state.canFly = true;
    state.hasBlackHearts = 2;
  }
  
  if (state.transformations.includes('conjoined')) {
    state.tearCount = Math.max(state.tearCount, 3);
  }
  
  if (state.transformations.includes('beelzebub')) {
    state.canFly = true;
    state.onHitEffects.push({ type: 'spawn_fly', chance: 0.2 });
  }
  
  if (state.transformations.includes('spun')) {
    state.damage += 2;
    state.speed += 0.15;
  }
  
  if (state.transformations.includes('seraphim')) {
    state.canFly = true;
    if (!state.tearFlags.includes('homing')) {
      state.tearFlags.push('homing');
    }
  }
  
  if (state.transformations.includes('bookworm')) {
    state.tearCount = Math.max(state.tearCount, 2);
  }
  
  if (state.transformations.includes('mom')) {
    state.damage += 1;
    state.range += 2;
    state.onHitEffects.push({ type: 'contact_damage', value: 1 });
  }
}

/**
 * Calcula DPS aproximado
 */
function calculateDPS(state) {
  const finalDamage = state.finalDamage;
  const tearsPerSecond = state.tearsPerSecond;
  const tearMult = TEAR_TYPE_MULTIPLIERS[state.tearType] || 1;
  
  return finalDamage * tearsPerSecond * state.tearCount * tearMult;
}

/**
 * Calcula rating de la build
 */
function calculateRating(dps) {
  if (dps > 500) {
    return { 
      tier: 'S', 
      color: '#FFD700',
      label: 'Build Rota',
      description: 'Puedes ganar con los ojos cerrados',
      confidence: 95
    };
  }
  if (dps > 200) {
    return {
      tier: 'A',
      color: '#22C55E',
      label: 'Build Fuerte',
      description: 'Victoria casi asegurada',
      confidence: 85
    };
  }
  if (dps > 100) {
    return {
      tier: 'B',
      color: '#3B82F6',
      label: 'Build Sólida',
      description: 'Deberías ganar jugando bien',
      confidence: 70
    };
  }
  if (dps > 50) {
    return {
      tier: 'C',
      color: '#EAB308',
      label: 'Build Aceptable',
      description: 'Victoria posible pero no garantizada',
      confidence: 50
    };
  }
  return {
    tier: 'D',
    color: '#EF4444',
    label: 'Build Débil',
    description: 'Necesitas más items o mucha skill',
    confidence: 30
  };
}

/**
 * Compara dos items y devuelve diferencias
 */
export function compareItems(itemA, itemB, currentBuild = []) {
  // Build con item A
  const buildWithA = calculateBuildState([...currentBuild, itemA]);
  // Build con item B
  const buildWithB = calculateBuildState([...currentBuild, itemB]);
  // Build sin ninguno
  const baseBuild = calculateBuildState(currentBuild);
  
  return {
    itemA: {
      ...itemA,
      impact: {
        damage: buildWithA.finalDamage - baseBuild.finalDamage,
        dps: buildWithA.finalDPS - baseBuild.finalDPS,
        tearsPerSecond: buildWithA.tearsPerSecond - baseBuild.tearsPerSecond,
        transformations: buildWithA.transformationProgress.filter(t => 
          !baseBuild.transformationProgress.find(bt => bt.tag === t.tag && bt.complete)
          && t.current > (baseBuild.transformationProgress.find(bt => bt.tag === t.tag)?.current || 0)
        ),
      },
      fullState: buildWithA,
    },
    itemB: {
      ...itemB,
      impact: {
        damage: buildWithB.finalDamage - baseBuild.finalDamage,
        dps: buildWithB.finalDPS - baseBuild.finalDPS,
        tearsPerSecond: buildWithB.tearsPerSecond - baseBuild.tearsPerSecond,
        transformations: buildWithB.transformationProgress.filter(t => 
          !baseBuild.transformationProgress.find(bt => bt.tag === t.tag && bt.complete)
          && t.current > (baseBuild.transformationProgress.find(bt => bt.tag === t.tag)?.current || 0)
        ),
      },
      fullState: buildWithB,
    },
    winner: buildWithA.finalDPS > buildWithB.finalDPS ? 'A' : 'B',
    dpsDifference: Math.abs(buildWithA.finalDPS - buildWithB.finalDPS),
  };
}

/**
 * Calcula el impacto de añadir un item a la build actual
 */
export function calculateItemImpact(item, currentBuild = []) {
  const before = calculateBuildState(currentBuild);
  const after = calculateBuildState([...currentBuild, item]);
  
  return {
    damage: {
      before: before.finalDamage,
      after: after.finalDamage,
      delta: after.finalDamage - before.finalDamage,
      percent: before.finalDamage > 0 
        ? ((after.finalDamage - before.finalDamage) / before.finalDamage * 100) 
        : 0,
    },
    dps: {
      before: before.finalDPS,
      after: after.finalDPS,
      delta: after.finalDPS - before.finalDPS,
      percent: before.finalDPS > 0 
        ? ((after.finalDPS - before.finalDPS) / before.finalDPS * 100) 
        : 0,
    },
    fireRate: {
      before: before.tearsPerSecond,
      after: after.tearsPerSecond,
      delta: after.tearsPerSecond - before.tearsPerSecond,
    },
    tearType: {
      before: before.tearType,
      after: after.tearType,
      changed: before.tearType !== after.tearType,
    },
    newFlags: after.tearFlags.filter(f => !before.tearFlags.includes(f)),
    newTransformations: after.transformations.filter(t => !before.transformations.includes(t)),
    transformationProgress: after.transformationProgress.map(tp => ({
      ...tp,
      added: tp.current - (before.transformationProgress.find(b => b.tag === tp.tag)?.current || 0),
    })).filter(tp => tp.added > 0),
    ratingChange: {
      before: before.rating,
      after: after.rating,
      improved: after.rating.confidence > before.rating.confidence,
    }
  };
}
