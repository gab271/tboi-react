/**
 * Item Effects Data
 * Ítems con efectos modelados para el motor de sinergias
 * 
 * Prioridad: 0-1000 (mayor = se aplica primero, gana en conflictos)
 */

const ITEMS_WITH_EFFECTS = [
  // === TIER S - ITEMS QUE DEFINEN LA BUILD ===
  {
    id: 118,
    name: 'Brimstone',
    priority: 900,
    effects: {
      tearType: 'brimstone',
      tearFlags: ['piercing', 'spectral'],
      flatTearDelay: 30,
      overrides: ['tearType', 'tearVariant'],
      overriddenBy: ['mom_knife_override']
    },
    transformationTags: ['leviathan'],
  },
  {
    id: 114,
    name: "Mom's Knife",
    priority: 950,
    effects: {
      tearType: 'knife',
      damageMultiplier: 2,
      tearFlags: ['piercing'],
      overrides: ['tearType', 'tearVariant', 'mom_knife_override'],
    },
    transformationTags: ['mom'],
  },
  {
    id: 149,
    name: 'Ipecac',
    priority: 800,
    effects: {
      flatDamage: 40,
      tearFlags: ['explosive', 'poison'],
      flatTearDelay: 15,
    },
  },
  {
    id: 168,
    name: 'Epic Fetus',
    priority: 920,
    effects: {
      tearType: 'epic',
      flatDamage: 20,
      overrides: ['tearType'],
    },
  },
  {
    id: 395,
    name: 'Tech X',
    priority: 880,
    effects: {
      tearType: 'techx',
      tearFlags: ['piercing'],
      damageMultiplier: 0.65,
    },
  },
  {
    id: 329,
    name: 'Godhead',
    priority: 500,
    effects: {
      flatDamage: 0.5,
      tearFlags: ['homing'],
      onHit: [{ type: 'aura_damage', value: 2 }],
    },
    transformationTags: ['seraphim'],
  },
  {
    id: 182,
    name: 'Sacred Heart',
    priority: 600,
    effects: {
      damageMultiplier: 2.3,
      tearFlags: ['homing'],
      stats: { speed: -0.4 }
    },
    transformationTags: ['seraphim'],
  },

  // === TIER A - MULTIPLICADORES DE DAÑO ===
  {
    id: 169,
    name: 'Polyphemus',
    priority: 700,
    effects: {
      damageMultiplier: 2,
      flatTearDelay: 4,
      tearCount: 1, // fuerza una lágrima
    },
  },
  {
    id: 3,
    name: "Cricket's Head",
    priority: 400,
    effects: {
      damageMultiplier: 1.5,
    },
  },
  {
    id: 276,
    name: 'Proptosis',
    priority: 500,
    effects: {
      damageMultiplier: 2,
      // daño decrece con distancia (no modelado aquí)
    },
  },
  {
    id: 531,
    name: 'Haemolacria',
    priority: 750,
    effects: {
      damageMultiplier: 1.5,
      flatTearDelay: 5,
      tearFlags: ['split'],
    },
  },

  // === MODIFIERS DE FIRE RATE ===
  {
    id: 330,
    name: 'Soy Milk',
    priority: 100,
    effects: {
      damageMultiplier: 0.2,
      tearDelayMultiplier: 0.2,
      tearDelayCap: null, // sin cap
      stats: { tears: 5.5 }
    },
  },
  {
    id: 561,
    name: 'Almond Milk',
    priority: 100,
    effects: {
      damageMultiplier: 0.3,
      tearDelayMultiplier: 0.25,
      tearFlags: ['random_direction'],
    },
  },
  {
    id: 245,
    name: "20/20",
    priority: 300,
    effects: {
      tearCount: 'double',
    },
  },
  {
    id: 153,
    name: 'Mutant Spider',
    priority: 350,
    effects: {
      tearCount: 4,
      flatTearDelay: 4,
    },
  },
  {
    id: 2,
    name: 'The Inner Eye',
    priority: 340,
    effects: {
      tearCount: 3,
      flatTearDelay: 3,
    },
  },

  // === TECHNOLOGY LINE ===
  {
    id: 68,
    name: 'Technology',
    priority: 800,
    effects: {
      tearType: 'laser',
      tearFlags: ['piercing'],
    },
  },
  {
    id: 152,
    name: 'Technology 2',
    priority: 600,
    effects: {
      // láser secundario continuo
      onHit: [{ type: 'secondary_laser', dps: 3.5 }],
    },
  },

  // === TEAR EFFECTS ===
  {
    id: 4,
    name: 'Cricket\'s Body',
    priority: 200,
    effects: {
      tearFlags: ['split'],
      stats: { tears: 0.5, range: -10 }
    },
  },
  {
    id: 448,
    name: 'Compound Fracture',
    priority: 200,
    effects: {
      tearFlags: ['split', 'bone'],
      stats: { damage: 0.5, range: 3 }
    },
  },
  {
    id: 229,
    name: 'Monstro\'s Lung',
    priority: 700,
    effects: {
      tearCount: 14,
      flatTearDelay: 23,
    },
  },
  {
    id: 275,
    name: 'Ludo',
    priority: 850,
    effects: {
      tearType: 'ludovico',
      tearFlags: ['controllable'],
      overrides: ['tearType'],
    },
  },
  {
    id: 132,
    name: 'Brimstone (Azazel)',
    priority: 850,
    effects: {
      tearType: 'mini_brimstone',
      tearFlags: ['piercing', 'spectral', 'short_range'],
      damageMultiplier: 1.5,
    },
  },

  // === DEFENSIVE / UTILITY ===
  {
    id: 184,
    name: 'Holy Mantle',
    priority: 50,
    effects: {
      onDamage: [{ type: 'shield', uses: 1 }],
    },
  },
  {
    id: 310,
    name: 'Eve\'s Mascara',
    priority: 400,
    effects: {
      damageMultiplier: 2,
      tearDelayMultiplier: 2,
      stats: { shotSpeed: -0.5 }
    },
  },
  {
    id: 224,
    name: 'Crickets Body',
    priority: 200,
    effects: {
      tearFlags: ['split'],
      stats: { range: -10 }
    },
  },

  // === GUPPY ITEMS ===
  {
    id: 145,
    name: 'Guppy\'s Head',
    priority: 50,
    transformationTags: ['guppy'],
  },
  {
    id: 187,
    name: 'Guppy\'s Tail',
    priority: 50,
    transformationTags: ['guppy'],
  },
  {
    id: 186,
    name: 'Guppy\'s Collar',
    priority: 50,
    effects: {
      onDeath: [{ type: 'revive', chance: 0.5 }],
    },
    transformationTags: ['guppy'],
  },
  {
    id: 134,
    name: 'Guppy\'s Paw',
    priority: 50,
    transformationTags: ['guppy'],
  },
  {
    id: 133,
    name: 'Guppy\'s Hairball',
    priority: 50,
    transformationTags: ['guppy'],
  },
  {
    id: 112,
    name: 'Dead Cat',
    priority: 100,
    effects: {
      onDeath: [{ type: 'revive', uses: 9 }],
    },
    transformationTags: ['guppy'],
  },

  // === FLY ITEMS (Beelzebub) ===
  {
    id: 279,
    name: 'Big Fan',
    priority: 50,
    transformationTags: ['beelzebub'],
  },
  {
    id: 128,
    name: 'Halo of Flies',
    priority: 50,
    transformationTags: ['beelzebub'],
  },
  {
    id: 174,
    name: 'Hive Mind',
    priority: 100,
    effects: {
      // doble daño de moscas
      damageMultiplier: 1, // solo para moscas
    },
    transformationTags: ['beelzebub'],
  },
  {
    id: 3,
    name: 'Distant Admiration',
    priority: 50,
    transformationTags: ['beelzebub'],
  },

  // === SERAPHIM ===
  {
    id: 313,
    name: 'Holy Light',
    priority: 300,
    effects: {
      tearFlags: ['holy'],
      onHit: [{ type: 'light_beam', chance: 0.1 }],
    },
    transformationTags: ['seraphim'],
  },
  {
    id: 331,
    name: 'Godhead',
    priority: 500,
    effects: {
      flatDamage: 0.5,
      tearFlags: ['homing'],
      onHit: [{ type: 'aura_damage', value: 2 }],
    },
    transformationTags: ['seraphim'],
  },

  // === SPUN (SYRINGE) ===
  {
    id: 13,
    name: 'The Virus',
    priority: 50,
    effects: {
      tearFlags: ['poison'],
    },
    transformationTags: ['spun'],
  },
  {
    id: 143,
    name: 'Roid Rage',
    priority: 50,
    effects: {
      stats: { speed: 0.6, range: 5.25 }
    },
    transformationTags: ['spun'],
  },
  {
    id: 223,
    name: 'Speed Ball',
    priority: 50,
    effects: {
      stats: { speed: 0.3, shotSpeed: 0.2 }
    },
    transformationTags: ['spun'],
  },
  {
    id: 344,
    name: 'Match Book',
    priority: 50,
    transformationTags: ['spun'],
  },

  // === COMMON SYNERGY ITEMS ===
  {
    id: 233,
    name: 'Tiny Planet',
    priority: 400,
    effects: {
      tearFlags: ['orbit'],
      stats: { range: 6.5 }
    },
  },
  {
    id: 362,
    name: 'Lost Contact',
    priority: 300,
    effects: {
      tearFlags: ['shield'],
      stats: { shotSpeed: -0.15 }
    },
  },
  {
    id: 5,
    name: 'My Reflection',
    priority: 300,
    effects: {
      tearFlags: ['boomerang'],
      stats: { range: 1.5, shotSpeed: -0.4 }
    },
  },
  {
    id: 114,
    name: 'Mom\'s Knife',
    priority: 950,
    effects: {
      tearType: 'knife',
      damageMultiplier: 2,
      overrides: ['tearType'],
    },
    transformationTags: ['mom'],
  },
  {
    id: 528,
    name: 'C Section',
    priority: 870,
    effects: {
      tearType: 'fetus',
      damageMultiplier: 0.75,
      tearFlags: ['homing'],
      overrides: ['tearType'],
    },
  }
];

/**
 * Obtiene ítem por ID
 */
function getItemById(id) {
  return ITEMS_WITH_EFFECTS.find(item => item.id === id);
}

/**
 * Obtiene ítems por nombre (búsqueda parcial)
 */
function searchItemsByName(query) {
  const lower = query.toLowerCase();
  return ITEMS_WITH_EFFECTS.filter(item => 
    item.name.toLowerCase().includes(lower)
  );
}

/**
 * Obtiene todos los ítems de una transformación
 */
function getTransformationItems(transformation) {
  return ITEMS_WITH_EFFECTS.filter(item =>
    item.transformationTags?.includes(transformation)
  );
}

module.exports = {
  ITEMS_WITH_EFFECTS,
  getItemById,
  searchItemsByName,
  getTransformationItems,
};
