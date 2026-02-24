/**
 * Character Base Stats - The Binding of Isaac: Repentance
 * 
 * Stats reales del juego (fuente: wiki oficial)
 * - Damage: Daño base por lágrima (típico: 2.5-4.5)
 * - Tears: Delay entre disparos (negativo = más rápido)
 * - Speed: Velocidad de movimiento (0.85-1.5)
 * - Range: Distancia que viajan las lágrimas (2.5-10)
 * - ShotSpeed: Velocidad de proyectiles (0.75-1.2)
 * - Luck: Afecta RNG y drops (-2 a +5)
 */

// Rangos para calcular porcentaje en barras
export const STAT_RANGES = {
  damage: { min: 2.0, max: 5.0, label: 'Damage', icon: '⚔️', tooltip: 'Daño base por lágrima' },
  tears: { min: -2, max: 3, label: 'Tears', icon: '💧', tooltip: 'Cadencia de disparo (menor = más rápido)' },
  speed: { min: 0.5, max: 1.5, label: 'Speed', icon: '👟', tooltip: 'Velocidad de movimiento' },
  range: { min: 0, max: 10, label: 'Range', icon: '📏', tooltip: 'Distancia que viajan las lágrimas' },
  shotSpeed: { min: 0.5, max: 1.5, label: 'Shot Spd', icon: '🎯', tooltip: 'Velocidad de las lágrimas' },
  luck: { min: -3, max: 5, label: 'Luck', icon: '🍀', tooltip: 'Afecta drops, efectos especiales y más' }
};

// Stats base por personaje
export const CHARACTER_BASE_STATS = {
  // === VANILLA CHARACTERS ===
  isaac: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  magdalene: {
    damage: 3.50,
    tears: 0,
    speed: 0.85,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  cain: {
    damage: 3.50,
    tears: 0,
    speed: 1.30,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 1
  },
  judas: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  blue_baby: {
    damage: 3.50,
    tears: 1,
    speed: 1.10,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  eve: {
    damage: 3.50,
    tears: 0,
    speed: 1.20,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -1
  },
  samson: {
    damage: 3.50,
    tears: 1,
    speed: 1.10,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  azazel: {
    damage: 3.50,
    tears: 0,
    speed: 1.25,
    range: 2.50,
    shotSpeed: 1.00,
    luck: 0
  },
  lazarus: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  eden: {
    damage: null,
    tears: null,
    speed: null,
    range: null,
    shotSpeed: null,
    luck: null,
    isRandom: true
  },
  the_lost: {
    damage: 3.50,
    tears: -1,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -1
  },
  lilith: {
    damage: 3.50,
    tears: 1,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  keeper: {
    damage: 3.50,
    tears: -2,
    speed: 0.85,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -2
  },
  apollyon: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  the_forgotten: {
    damage: 3.50,
    tears: -1,
    speed: 1.00,
    range: 0,
    shotSpeed: 1.00,
    luck: 0,
    isMelee: true
  },
  bethany: {
    damage: 3.50,
    tears: 1,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  jacob_esau: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },

  // === TAINTED CHARACTERS ===
  tainted_isaac: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_magdalene: {
    damage: 3.50,
    tears: 0,
    speed: 0.85,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_cain: {
    damage: 3.50,
    tears: 0,
    speed: 1.30,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 1
  },
  tainted_judas: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_blue_baby: {
    damage: 3.50,
    tears: 1,
    speed: 1.10,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_eve: {
    damage: 3.50,
    tears: 0,
    speed: 1.20,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -1
  },
  tainted_samson: {
    damage: 3.50,
    tears: 1,
    speed: 1.10,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_azazel: {
    damage: 3.50,
    tears: 0,
    speed: 1.25,
    range: 2.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_lazarus: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_eden: {
    damage: null,
    tears: null,
    speed: null,
    range: null,
    shotSpeed: null,
    luck: null,
    isRandom: true,
    rerollsOnHit: true
  },
  tainted_lost: {
    damage: 3.50,
    tears: -1,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -1
  },
  tainted_lilith: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_keeper: {
    damage: 3.50,
    tears: -2,
    speed: 0.85,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -2
  },
  tainted_apollyon: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_forgotten: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_bethany: {
    damage: 3.50,
    tears: 1,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_jacob: {
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  }
};

// Vida inicial por personaje
export const CHARACTER_STARTING_HEALTH = {
  isaac: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  magdalene: {
    redContainers: 4,
    redFilled: 8,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  cain: {
    redContainers: 2,
    redFilled: 4,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  judas: {
    redContainers: 1,
    redFilled: 2,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  blue_baby: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 6,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false
  },
  eve: {
    redContainers: 2,
    redFilled: 4,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  samson: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 2,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  azazel: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 6,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  lazarus: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  eden: {
    redContainers: null,
    redFilled: null,
    soulHearts: null,
    blackHearts: null,
    boneHearts: null,
    canHaveRedHealth: true,
    isRandom: true
  },
  the_lost: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false,
    hasHolyMantle: true,
    hasFlight: true
  },
  lilith: {
    redContainers: 1,
    redFilled: 2,
    soulHearts: 0,
    blackHearts: 4,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  keeper: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    coinHearts: 2,
    canHaveRedHealth: false,
    healthType: 'coin'
  },
  apollyon: {
    redContainers: 2,
    redFilled: 4,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  the_forgotten: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 2,
    boneFilled: 4,
    canHaveRedHealth: true
  },
  bethany: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    soulCharges: 4,
    canHaveRedHealth: true
  },
  jacob_esau: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true,
    esau: {
      redContainers: 1,
      redFilled: 2,
      soulHearts: 2
    }
  },
  
  // === TAINTED ===
  tainted_isaac: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_magdalene: {
    redContainers: 4,
    redFilled: 4,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true,
    healthDrain: true
  },
  tainted_cain: {
    redContainers: 2,
    redFilled: 4,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_judas: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 4,
    boneHearts: 0,
    canHaveRedHealth: false
  },
  tainted_blue_baby: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 6,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false
  },
  tainted_eve: {
    redContainers: 2,
    redFilled: 4,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_samson: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_azazel: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 6,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_lazarus: {
    redContainers: 2,
    redFilled: 2,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true,
    sharedHealth: true
  },
  tainted_eden: {
    redContainers: null,
    redFilled: null,
    soulHearts: null,
    blackHearts: null,
    boneHearts: null,
    canHaveRedHealth: true,
    isRandom: true,
    rerollsOnHit: true
  },
  tainted_lost: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false,
    hasHolyMantle: false,
    hasFlight: true
  },
  tainted_lilith: {
    redContainers: 1,
    redFilled: 2,
    soulHearts: 0,
    blackHearts: 4,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_keeper: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    coinHearts: 2,
    canHaveRedHealth: false,
    healthType: 'coin'
  },
  tainted_apollyon: {
    redContainers: 2,
    redFilled: 4,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_forgotten: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 6,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false,
    bodyInvincible: true
  },
  tainted_bethany: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    bloodCharges: 6,
    canHaveRedHealth: true
  },
  tainted_jacob: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true,
    hasDarkEsau: true
  }
};

// Items iniciales por personaje
export const CHARACTER_STARTING_ITEMS = {
  isaac: [
    {
      id: 'd6',
      name: 'The D6',
      type: 'active',
      charges: 6,
      description: 'Rerollea los items en pedestales',
      icon: '/sprites/2_Active Items/D6.png',
      unlockRequired: 'Completa Cathedral con ???'
    }
  ],
  magdalene: [
    {
      id: 'yum_heart',
      name: 'Yum Heart',
      type: 'active',
      charges: 4,
      description: 'Restaura 1 corazón rojo',
      icon: '/sprites/2_Active Items/Yum Heart.png'
    }
  ],
  cain: [
    {
      id: 'lucky_foot',
      name: 'Lucky Foot',
      type: 'passive',
      description: '+1 Suerte, mejor drop de máquinas',
      icon: '/sprites/1_Passive Items/Lucky Foot.png'
    }
  ],
  judas: [
    {
      id: 'book_of_belial',
      name: 'Book of Belial',
      type: 'active',
      charges: 3,
      description: '+2 Daño por habitación',
      icon: '/sprites/2_Active Items/Book of Belial.png'
    }
  ],
  blue_baby: [
    {
      id: 'the_poop',
      name: 'The Poop',
      type: 'active',
      charges: 1,
      description: 'Crea una caca que bloquea proyectiles',
      icon: '/sprites/2_Active Items/Poop.png'
    }
  ],
  eve: [
    {
      id: 'whore_of_babylon',
      name: 'Whore of Babylon',
      type: 'passive',
      description: '+1.5 daño cuando HP < 1 corazón',
      icon: '/sprites/1_Passive Items/Whore of Babylon.png'
    },
    {
      id: 'dead_bird',
      name: 'Dead Bird',
      type: 'passive',
      description: 'Pájaro ataca al recibir daño',
      icon: '/sprites/1_Passive Items/Dead Bird.png'
    }
  ],
  samson: [
    {
      id: 'bloody_lust',
      name: 'Bloody Lust',
      type: 'passive',
      description: '+0.2 daño por hit recibido',
      icon: '/sprites/1_Passive Items/Bloody Lust.png'
    }
  ],
  azazel: [
    {
      id: 'mini_brimstone',
      name: 'Mini Brimstone',
      type: 'innate',
      description: 'Disparo corto de Brimstone',
      icon: '/sprites/1_Passive Items/Brimstone.png',
      innate: true
    }
  ],
  lazarus: [
    {
      id: 'lazarus_rags',
      name: "Lazarus' Rags",
      type: 'passive',
      description: 'Revive con +0.5 daño',
      icon: '/sprites/1_Passive Items/Lazarus Rags.png',
      innate: true
    }
  ],
  eden: [
    {
      id: 'random_items',
      name: '??? (Random)',
      type: 'random',
      description: 'Items aleatorios',
      icon: null,
      isRandom: true
    }
  ],
  the_lost: [
    {
      id: 'eternal_d6',
      name: 'Eternal D6',
      type: 'active',
      charges: 2,
      description: 'Rerollea, puede desaparecer',
      icon: '/sprites/2_Active Items/Eternal D6.png'
    },
    {
      id: 'holy_mantle',
      name: 'Holy Mantle',
      type: 'passive',
      description: 'Bloquea 1 hit por sala',
      icon: '/sprites/1_Passive Items/Holy Mantle.png',
      innate: true
    }
  ],
  lilith: [
    {
      id: 'box_of_friends',
      name: 'Box of Friends',
      type: 'active',
      charges: 4,
      description: 'Duplica familiares',
      icon: '/sprites/2_Active Items/Box of Friends.png'
    },
    {
      id: 'incubus',
      name: 'Incubus',
      type: 'passive',
      description: 'Familiar que dispara por ti',
      icon: '/sprites/1_Passive Items/Incubus.png',
      innate: true
    }
  ],
  keeper: [
    {
      id: 'wooden_nickel',
      name: 'Wooden Nickel',
      type: 'active',
      charges: 1,
      description: '50% de soltar moneda',
      icon: '/sprites/2_Active Items/Wooden Nickel.png'
    },
    {
      id: 'store_key',
      name: 'Store Key',
      type: 'trinket',
      description: 'Abre shops gratis',
      icon: '/sprites/3_Trinkets/Store Key.png'
    }
  ],
  apollyon: [
    {
      id: 'void',
      name: 'Void',
      type: 'active',
      charges: 6,
      description: 'Absorbe items para stats',
      icon: '/sprites/2_Active Items/Void.png'
    }
  ],
  the_forgotten: [
    {
      id: 'bone_club',
      name: 'Bone Club',
      type: 'innate',
      description: 'Ataque melee',
      icon: '/sprites/1_Passive Items/Bone Club.png',
      innate: true
    }
  ],
  bethany: [
    {
      id: 'book_of_virtues',
      name: 'Book of Virtues',
      type: 'active',
      charges: 4,
      description: 'Crea wisps orbitales',
      icon: '/sprites/2_Active Items/Book of Virtues.png'
    }
  ],
  jacob_esau: [],
  
  // === TAINTED ===
  tainted_isaac: [],
  tainted_magdalene: [
    {
      id: 'yum_heart',
      name: 'Yum Heart',
      type: 'active',
      charges: 2,
      description: 'Versión débil',
      icon: '/sprites/2_Active Items/Yum Heart.png'
    }
  ],
  tainted_cain: [
    {
      id: 'bag_of_crafting',
      name: 'Bag of Crafting',
      type: 'active',
      description: 'Craftea items con pickups',
      icon: '/sprites/2_Active Items/Bag of Crafting.png'
    }
  ],
  tainted_judas: [
    {
      id: 'dark_arts',
      name: 'Dark Arts',
      type: 'active',
      charges: 2,
      description: 'Tiempo bala + dash',
      icon: '/sprites/2_Active Items/Dark Arts.png'
    }
  ],
  tainted_blue_baby: [
    {
      id: 'hold',
      name: 'Hold',
      type: 'active',
      description: 'Guarda caca para lanzar',
      icon: '/sprites/2_Active Items/Hold.png'
    }
  ],
  tainted_eve: [
    {
      id: 'sumptorium',
      name: 'Sumptorium',
      type: 'active',
      description: 'Drena vida para crear coágulos',
      icon: '/sprites/2_Active Items/Sumptorium.png'
    }
  ],
  tainted_samson: [
    {
      id: 'berserk',
      name: 'Berserk!',
      type: 'active',
      charges: 3,
      description: 'Modo furia con hueso',
      icon: '/sprites/2_Active Items/Berserk.png'
    }
  ],
  tainted_azazel: [],
  tainted_lazarus: [
    {
      id: 'flip',
      name: 'Flip',
      type: 'active',
      description: 'Cambia entre formas',
      icon: '/sprites/2_Active Items/Flip.png'
    }
  ],
  tainted_eden: [],
  tainted_lost: [
    {
      id: 'holy_card',
      name: 'Holy Card',
      type: 'card',
      description: 'Da Holy Mantle temporal',
      icon: '/sprites/Cards/Holy Card.png'
    }
  ],
  tainted_lilith: [],
  tainted_keeper: [],
  tainted_apollyon: [
    {
      id: 'abyss',
      name: 'Abyss',
      type: 'active',
      description: 'Absorbe items para moscas',
      icon: '/sprites/2_Active Items/Abyss.png'
    }
  ],
  tainted_forgotten: [],
  tainted_bethany: [
    {
      id: 'lemegeton',
      name: 'Lemegeton',
      type: 'active',
      description: 'Crea items orbitales',
      icon: '/sprites/2_Active Items/Lemegeton.png'
    }
  ],
  tainted_jacob: [
    {
      id: 'anima_sola',
      name: 'Anima Sola',
      type: 'active',
      description: 'Encadena a Dark Esau',
      icon: '/sprites/2_Active Items/Anima Sola.png'
    }
  ]
};

// Playstyle y tips por personaje
export const CHARACTER_PLAYSTYLE = {
  isaac: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'El personaje equilibrado por excelencia.',
    bullets: [
      'Stats balanceadas sin debilidades',
      'D6 permite rerollear items malos',
      'Ideal para aprender el juego',
      'Puede adaptarse a cualquier build'
    ],
    tip: 'Guarda cargas de D6 para Treasure Rooms.',
    unlock: null
  },
  magdalene: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Tanque con vida extra y regeneración.',
    bullets: [
      'Más vida inicial del juego',
      'Yum Heart permite curarse',
      'Ideal para principiantes',
      'Velocidad baja'
    ],
    tip: 'Busca speed ups para compensar tu lentitud.',
    unlock: 'Tener 7+ corazones rojos'
  },
  cain: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Rápido y con suerte extra.',
    bullets: [
      'Mayor velocidad base',
      '+1 Luck para mejores drops',
      'Empieza con llave',
      'Menos vida que Isaac'
    ],
    tip: 'Aprovecha Lucky Foot en máquinas.',
    unlock: 'Tener 55+ monedas'
  },
  judas: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Cañón de cristal - mucho daño, poca vida.',
    bullets: [
      'Solo 1 corazón rojo inicial',
      'Book of Belial da +2 daño',
      'Mayor potencial de daño temprano',
      'Requiere no recibir hits'
    ],
    tip: 'Usa Book of Belial antes de Boss Rooms.',
    unlock: 'Derrotar a Satan'
  },
  blue_baby: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'No puede tener vida roja.',
    bullets: [
      'Solo soul hearts',
      'Inmune a Devil Deals de vida',
      'The Poop bloquea proyectiles',
      'Devil Deals cuestan soul hearts'
    ],
    tip: 'Busca items que generen soul hearts.',
    unlock: 'Derrotar Mom\'s Heart 10 veces'
  },
  eve: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Más poderosa al límite.',
    bullets: [
      'Whore of Babylon a <1 corazón',
      '+1.5 daño en modo demonio',
      'Dead Bird ayuda como familiar',
      'Requiere gestión de vida'
    ],
    tip: 'Mantente en 0.5 corazones rojos.',
    unlock: '2 pisos sin recoger corazones'
  },
  samson: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Gana daño al recibir golpes.',
    bullets: [
      'Bloody Lust: +0.2 daño por hit',
      'Se resetea cada piso',
      'Buenas stats generales',
      'Fácil de jugar'
    ],
    tip: 'Maximiza Bloody Lust antes del boss.',
    unlock: '2 pisos sin daño'
  },
  azazel: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Modo fácil - vuelo y Brimstone.',
    bullets: [
      'Mini Brimstone de alto daño',
      'Vuelo desde el inicio',
      'Solo black hearts',
      'Rango muy corto'
    ],
    tip: 'Acércate para maximizar daño.',
    unlock: '3 Devil Deals en 1 partida'
  },
  lazarus: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Revive con stats mejoradas.',
    bullets: [
      'Una vida extra',
      '+0.5 daño tras revivir',
      'Anemic por revivir',
      'Stats base mediocres'
    ],
    tip: 'Muere antes de bosses difíciles.',
    unlock: '4+ soul/black hearts'
  },
  eden: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Todo aleatorio.',
    bullets: [
      'Stats random',
      'Items random',
      'Cuesta 1 Eden Token',
      'Cada run es única'
    ],
    tip: 'Reinicia si empiezas muy mal.',
    unlock: 'Completar Womb'
  },
  the_lost: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Sin vida - muere de un golpe.',
    bullets: [
      'Vuelo y lágrimas espectrales',
      'Holy Mantle bloquea 1 hit/sala',
      'Devil Deals gratis',
      'Eternal D6 para rerolls'
    ],
    tip: 'Prioriza damage ups.',
    unlock: 'Sacrifice Room con Missing Poster'
  },
  lilith: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'No dispara - usa Incubus.',
    bullets: [
      'Incubus dispara por ti',
      'Box of Friends duplica familiares',
      'Cambion Conception genera familiares',
      'Difícil apuntar'
    ],
    tip: 'Box of Friends antes de bosses.',
    unlock: 'Ultra Greed con Azazel'
  },
  keeper: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Monedas como vida.',
    bullets: [
      'Máximo 3 coin hearts',
      'Triple shot',
      'Wooden Nickel genera monedas',
      'Muy difícil'
    ],
    tip: 'Nunca entres a Devil Rooms sin monedas.',
    unlock: '1000 monedas donadas a Greed'
  },
  apollyon: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Absorbe items con Void.',
    bullets: [
      'Void absorbe items',
      'Pasivos dan stats',
      'Activos dan efecto',
      'Decisiones estratégicas'
    ],
    tip: 'Absorbe items de stats bajas primero.',
    unlock: 'Derrotar Mega Satan'
  },
  the_forgotten: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Dos personajes en uno.',
    bullets: [
      'Skeleton: melee 3x daño',
      'Soul: lágrimas espectrales',
      'Cambio instantáneo',
      'Bone hearts difíciles'
    ],
    tip: 'Soul para salas, Skeleton para bosses.',
    unlock: 'Puzzle de Mom\'s Shovel'
  },
  bethany: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Soul hearts son cargas.',
    bullets: [
      'Book of Virtues crea wisps',
      'Soul hearts = 4 cargas',
      'Wisps atacan y bloquean',
      'Poderosa con activos'
    ],
    tip: 'Cada item activo genera wisps únicos.',
    unlock: 'Hard con Lazarus sin morir'
  },
  jacob_esau: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Control simultáneo de dos.',
    bullets: [
      'Doble poder de fuego',
      'Doble hitbox',
      'Items separados',
      'Gestión de vida separada'
    ],
    tip: 'Da damage a uno, health al otro.',
    unlock: 'Derrotar Mother'
  },
  
  // TAINTED
  tainted_isaac: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Máximo 8 items.',
    bullets: [
      'Límite de 8 items pasivos',
      'Items alternan opciones',
      'Decisiones importantes',
      'Conocer items ayuda'
    ],
    tip: 'Prioriza items de calidad 4.',
    unlock: 'Red Key en Home'
  },
  tainted_lost: {
    difficulty: 3,
    difficultyLabel: 'Muy Difícil',
    summary: 'Lost SIN Holy Mantle.',
    bullets: [
      'SIN Holy Mantle',
      'Mejores items garantizados',
      'Holy Cards temporales',
      'Máxima dificultad'
    ],
    tip: 'Guarda Holy Cards para bosses.',
    unlock: 'Red Key en Home'
  },
  tainted_keeper: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Enemigos drop monedas.',
    bullets: [
      'Matar = curarse',
      'Items cuestan monedas',
      'Más fácil que Keeper',
      'High DPS necesario'
    ],
    tip: 'Prioriza damage sobre todo.',
    unlock: 'Red Key en Home'
  }
};

// Subtítulo/epiteto de cada personaje
export const CHARACTER_EPITHETS = {
  isaac: '"The Basement Boy"',
  magdalene: '"The Pure"',
  cain: '"The Lucky"',
  judas: '"The Traitor"',
  blue_baby: '"The Dead"',
  eve: '"The Tempted"',
  samson: '"The Strong"',
  azazel: '"The Demon"',
  lazarus: '"The Risen"',
  eden: '"The Random"',
  the_lost: '"The Forsaken"',
  lilith: '"The Mother"',
  keeper: '"The Greedy"',
  apollyon: '"The Destroyer"',
  the_forgotten: '"The Bound"',
  bethany: '"The Faithful"',
  jacob_esau: '"The Brothers"',
  
  // Tainted
  tainted_isaac: '"The Limited"',
  tainted_magdalene: '"The Draining"',
  tainted_cain: '"The Crafter"',
  tainted_judas: '"The Shadow"',
  tainted_blue_baby: '"The Filthy"',
  tainted_eve: '"The Bloody"',
  tainted_samson: '"The Berserker"',
  tainted_azazel: '"The Thin"',
  tainted_lazarus: '"The Shifting"',
  tainted_eden: '"The Chaotic"',
  tainted_lost: '"The Glass Cannon"',
  tainted_lilith: '"The Whip"',
  tainted_keeper: '"The Merchant"',
  tainted_apollyon: '"The Abyss"',
  tainted_forgotten: '"The Ragdoll"',
  tainted_bethany: '"The Blood Witch"',
  tainted_jacob: '"The Hunted"'
};

/**
 * Obtiene todos los datos de un personaje
 */
export function getCharacterFullData(characterId) {
  return {
    baseStats: CHARACTER_BASE_STATS[characterId] || CHARACTER_BASE_STATS.isaac,
    startingHealth: CHARACTER_STARTING_HEALTH[characterId] || CHARACTER_STARTING_HEALTH.isaac,
    startingItems: CHARACTER_STARTING_ITEMS[characterId] || [],
    playstyle: CHARACTER_PLAYSTYLE[characterId] || CHARACTER_PLAYSTYLE.isaac,
    epithet: CHARACTER_EPITHETS[characterId] || '"The Unknown"'
  };
}
