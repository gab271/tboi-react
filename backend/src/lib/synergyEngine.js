/**
 * SYNERGY ENGINE
 * 
 * Filosofía: No hay "combos definidos"
 * El motor SIMULA el estado final aplicando efectos por prioridad
 * Las sinergias son CONSECUENCIAS, no datos
 */

// Estado base del personaje
const BASE_STATE = {
  damage: 3.5,
  tears: 2.73, // tear delay base
  range: 6.5,
  speed: 1.0,
  shotSpeed: 1.0,
  luck: 0,
  
  tearType: 'normal',
  tearFlags: new Set(),
  tearCount: 1,
  tearPattern: null,
  
  damageMultiplier: 1.0,
  tearDelayMultiplier: 1.0,
  tearDelayCap: 5, // fire rate cap normal
  
  onHitEffects: [],
  transformations: new Set(),
  activeOverrides: new Set(),
};

// Umbrales de transformación
const TRANSFORMATION_THRESHOLDS = {
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

// Multiplicadores de DPS por tipo de lágrima
const TEAR_TYPE_MULTIPLIERS = {
  normal: 1,
  brimstone: 10, // 10 ticks por láser
  laser: 1,
  knife: 2, // ida y vuelta
  techx: 8, // anillo de daño
  ludovico: 0.5, // daño constante
  epic: 20, // misiles
  dr_fetus: 5, // bombas
  spirit: 1.5,
};

/**
 * Calcula el estado final de una build
 * @param {Array} items - Lista de ítems con sus efectos
 * @param {Object} character - Personaje base (opcional)
 * @returns {Object} Estado final calculado
 */
function calculateBuildState(items, character = null) {
  // 1. Clonar estado base
  let state = JSON.parse(JSON.stringify(BASE_STATE));
  state.tearFlags = new Set();
  state.transformations = new Set();
  state.onHitEffects = [];
  state.activeOverrides = new Set();
  
  // 2. Aplicar modificadores del personaje
  if (character?.baseStats) {
    Object.keys(character.baseStats).forEach(key => {
      if (state[key] !== undefined) {
        state[key] = character.baseStats[key];
      }
    });
  }
  
  // 3. Ordenar ítems por prioridad (mayor primero)
  const sortedItems = [...items].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  // 4. Primera pasada: recolectar overrides y transformaciones
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
  
  // 5. Detectar transformaciones completas
  for (const [tag, count] of Object.entries(transformationCounts)) {
    if (count >= (TRANSFORMATION_THRESHOLDS[tag] || 3)) {
      state.transformations.add(tag);
    }
  }
  
  // 6. Segunda pasada: aplicar efectos
  for (const item of sortedItems) {
    state = applyItemEffects(state, item, overrides);
  }
  
  // 7. Aplicar efectos de transformaciones
  state = applyTransformationEffects(state);
  
  // 8. Calcular DPS final
  state.finalDPS = calculateDPS(state);
  
  // 9. Convertir Sets a Arrays para serialización
  state.tearFlags = Array.from(state.tearFlags);
  state.transformations = Array.from(state.transformations);
  
  return state;
}

/**
 * Aplica los efectos de un ítem al estado
 */
function applyItemEffects(state, item, globalOverrides) {
  const effects = item.effects || {};
  
  // Verificar si este ítem está overrideado
  if (effects.overriddenBy) {
    const isOverridden = effects.overriddenBy.some(o => globalOverrides.has(o));
    if (isOverridden) {
      return state;
    }
  }
  
  // === TEAR TYPE ===
  if (effects.tearType && !globalOverrides.has('tearType')) {
    if (!state.tearTypePriority || (item.priority || 0) >= state.tearTypePriority) {
      state.tearType = effects.tearType;
      state.tearTypePriority = item.priority || 0;
    }
  }
  
  // === TEAR FLAGS (acumulativos) ===
  if (effects.tearFlags) {
    effects.tearFlags.forEach(flag => state.tearFlags.add(flag));
  }
  
  // === DAMAGE ===
  if (effects.flatDamage) {
    state.damage += effects.flatDamage;
  }
  if (effects.damageMultiplier) {
    state.damageMultiplier *= effects.damageMultiplier;
  }
  
  // === TEAR DELAY ===
  if (effects.flatTearDelay) {
    state.tears += effects.flatTearDelay;
  }
  if (effects.tearDelayMultiplier) {
    state.tearDelayMultiplier *= effects.tearDelayMultiplier;
  }
  if (effects.tearDelayCap !== undefined) {
    state.tearDelayCap = effects.tearDelayCap;
  }
  
  // === STATS ===
  if (effects.stats) {
    for (const [stat, value] of Object.entries(effects.stats)) {
      if (typeof state[stat] === 'number') {
        state[stat] += value;
      }
    }
  }
  
  // === TEAR COUNT ===
  if (effects.tearCount) {
    if (effects.tearCount === 'double') {
      state.tearCount *= 2;
    } else if (effects.tearCount === 'triple') {
      state.tearCount *= 3;
    } else if (typeof effects.tearCount === 'number') {
      state.tearCount = effects.tearCount;
    }
  }
  
  // === ON-HIT EFFECTS ===
  if (effects.onHit) {
    state.onHitEffects.push(...effects.onHit);
  }
  
  return state;
}

/**
 * Aplica efectos de transformaciones completas
 */
function applyTransformationEffects(state) {
  if (state.transformations.has('guppy')) {
    state.onHitEffects.push({ type: 'spawn_fly', chance: 0.5 });
    state.canFly = true;
  }
  
  if (state.transformations.has('leviathan')) {
    state.damage += 2;
    state.canFly = true;
    state.hasBlackHearts = 2;
  }
  
  if (state.transformations.has('conjoined')) {
    state.tearCount = Math.max(state.tearCount, 3);
  }
  
  if (state.transformations.has('beelzebub')) {
    state.canFly = true;
    state.onHitEffects.push({ type: 'spawn_fly', chance: 0.2 });
  }
  
  if (state.transformations.has('spun')) {
    state.damage += 2;
    state.speed += 0.15;
  }
  
  if (state.transformations.has('seraphim')) {
    state.canFly = true;
    state.tearFlags.add('homing');
  }
  
  if (state.transformations.has('bookworm')) {
    state.tearCount = Math.max(state.tearCount, 2);
  }
  
  if (state.transformations.has('mom')) {
    state.damage += 1;
    state.range += 2;
    state.onHitEffects.push({ type: 'contact_damage', value: 1 });
  }
  
  return state;
}

/**
 * Calcula DPS aproximado
 */
function calculateDPS(state) {
  const finalDamage = state.damage * state.damageMultiplier;
  
  // Calcular fire rate
  let tearDelay = state.tears * state.tearDelayMultiplier;
  if (state.tearDelayCap !== null) {
    tearDelay = Math.max(tearDelay, state.tearDelayCap);
  }
  
  const tearsPerSecond = 30 / (tearDelay + 1);
  const tearMult = TEAR_TYPE_MULTIPLIERS[state.tearType] || 1;
  
  return finalDamage * tearsPerSecond * state.tearCount * tearMult;
}

/**
 * Genera explicación humana de por qué una build funciona
 */
function generateExplanation(items, finalState) {
  const interactions = [];
  const explanations = [];
  
  const itemNames = items.map(i => i.name);
  
  // Detectar sinergias conocidas
  if (itemNames.includes('Brimstone') && itemNames.includes('Soy Milk')) {
    interactions.push({
      type: 'positive',
      title: 'Láser Ametralladora',
      items: ['Brimstone', 'Soy Milk'],
      explanation: 'Soy Milk elimina el cap de fire rate. Brimstone ignora la penalización de daño. Resultado: láser Ultra rápido con daño casi completo.',
      dpsImpact: '+340% DPS respecto a Brimstone solo'
    });
  }
  
  if (itemNames.includes('Tech X') && itemNames.includes('Brimstone')) {
    interactions.push({
      type: 'positive',
      title: 'Anillo de Brimstone',
      items: ['Tech X', 'Brimstone'],
      explanation: 'Los anillos de Tech X se convierten en anillos de Brimstone con daño combinado.',
      dpsImpact: '+200% DPS'
    });
  }
  
  if (itemNames.includes("Mom's Knife") && itemNames.includes('Brimstone')) {
    interactions.push({
      type: 'override',
      title: 'El Cuchillo Gana',
      items: ["Mom's Knife", 'Brimstone'],
      explanation: "Mom's Knife tiene prioridad superior y anula Brimstone visualmente, pero conservas los stats de daño.",
      note: 'Visualmente es cuchillo, mecánicamente tiene bonus de daño'
    });
  }
  
  if (itemNames.includes('Polyphemus') && itemNames.includes('Brimstone')) {
    interactions.push({
      type: 'positive',
      title: 'Láser Titánico',
      items: ['Polyphemus', 'Brimstone'],
      explanation: 'El multiplicador de daño de Polyphemus se aplica completamente al láser de Brimstone.',
      dpsImpact: '+100% daño por tick'
    });
  }
  
  if (itemNames.includes('Sacred Heart') && itemNames.includes('Brimstone')) {
    interactions.push({
      type: 'positive',
      title: 'Láser Divino',
      items: ['Sacred Heart', 'Brimstone'],
      explanation: 'Sacred Heart añade homing al láser y multiplica su daño x2.3.',
      dpsImpact: '+130% DPS + homing'
    });
  }
  
  if (itemNames.includes('Cricket\'s Body') || itemNames.includes('Compound Fracture')) {
    const splitItem = itemNames.includes('Cricket\'s Body') ? 'Cricket\'s Body' : 'Compound Fracture';
    if (itemNames.includes('Brimstone') || itemNames.includes("Mom's Knife")) {
      interactions.push({
        type: 'negative',
        title: 'Split perdido',
        items: [splitItem, itemNames.includes('Brimstone') ? 'Brimstone' : "Mom's Knife"],
        explanation: 'El efecto de split no funciona con láser o cuchillo.',
        note: 'Solo conservas el bonus de stats'
      });
    }
  }
  
  // Transformaciones
  if (finalState.transformations.length > 0) {
    explanations.push({
      type: 'transformation',
      title: 'Transformaciones Activas',
      transformations: finalState.transformations.map(t => ({
        name: t.charAt(0).toUpperCase() + t.slice(1),
        effect: getTransformationEffect(t)
      }))
    });
  }
  
  // Stats summary
  explanations.push({
    type: 'stats',
    title: 'Estado Final',
    stats: {
      damage: (finalState.damage * finalState.damageMultiplier).toFixed(2),
      tearType: finalState.tearType,
      flags: finalState.tearFlags.join(', ') || 'ninguno',
      dps: `~${finalState.finalDPS.toFixed(0)} DPS`,
      transformations: finalState.transformations.join(', ') || 'ninguna',
    }
  });
  
  // Veredicto
  const verdict = calculateVerdict(finalState);
  explanations.push({
    type: 'verdict',
    ...verdict
  });
  
  return { interactions, explanations };
}

function getTransformationEffect(transformation) {
  const effects = {
    guppy: 'Vuelo + Spawn moscas al golpear',
    leviathan: '+2 daño + Vuelo + 2 corazones negros',
    conjoined: 'Dispara 3 lágrimas',
    beelzebub: 'Vuelo + Moscas aliadas',
    spun: '+2 daño + Velocidad',
    seraphim: 'Vuelo + Lágrimas homing',
    bookworm: 'Triple disparo ocasional',
    mom: '+1 daño + Rango + Daño de contacto',
  };
  return effects[transformation] || 'Efecto especial';
}

function calculateVerdict(state) {
  const rating = state.finalDPS;
  
  if (rating > 500) {
    return { 
      rating: 'S', 
      color: 'gold',
      text: 'Build rota. Puedes ganar con los ojos cerrados.',
      confidence: 95
    };
  }
  if (rating > 200) {
    return {
      rating: 'A',
      color: 'green',
      text: 'Build muy fuerte. Victoria casi asegurada.',
      confidence: 85
    };
  }
  if (rating > 100) {
    return {
      rating: 'B',
      color: 'blue',
      text: 'Build sólida. Deberías ganar si juegas bien.',
      confidence: 70
    };
  }
  if (rating > 50) {
    return {
      rating: 'C',
      color: 'yellow',
      text: 'Build aceptable. Victoria posible pero no garantizada.',
      confidence: 50
    };
  }
  return {
    rating: 'D',
    color: 'red',
    text: 'Build débil. Necesitas más ítems o mucha skill.',
    confidence: 30
  };
}

module.exports = {
  calculateBuildState,
  generateExplanation,
  BASE_STATE,
  TRANSFORMATION_THRESHOLDS,
};
