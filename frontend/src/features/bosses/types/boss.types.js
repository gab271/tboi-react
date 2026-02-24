/**
 * Boss Types and Enums for The Bounty Board
 * Premium Companion App Data Structures
 */

// Defeat status levels
export const DEFEAT_STATUS = {
  NOT_DEFEATED: 'not_defeated',
  NORMAL: 'normal',
  HARD: 'hard',
  MASTERED: 'mastered' // All characters completed
};

// Danger levels for attack patterns
export const DANGER_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  EXTREME: 'extreme'
};

// Boss types
export const BOSS_TYPE = {
  NORMAL: 'normal',
  CHAMPION: 'champion',
  MINI: 'mini',
  FINAL: 'final',
  ALTERNATE: 'alternate'
};

// Floor categories for filtering
export const FLOORS = {
  BASEMENT: { id: 'basement', name: 'Basement', altName: 'Cellar', order: 1 },
  CAVES: { id: 'caves', name: 'Caves', altName: 'Catacombs', order: 2 },
  DEPTHS: { id: 'depths', name: 'Depths', altName: 'Necropolis', order: 3 },
  WOMB: { id: 'womb', name: 'Womb', altName: 'Utero', order: 4 },
  SHEOL: { id: 'sheol', name: 'Sheol', order: 5 },
  CATHEDRAL: { id: 'cathedral', name: 'Cathedral', order: 6 },
  DARK_ROOM: { id: 'dark-room', name: 'Dark Room', order: 7 },
  CHEST: { id: 'chest', name: 'Chest', order: 8 },
  VOID: { id: 'void', name: 'Void', order: 9 },
  HOME: { id: 'home', name: 'Home', order: 10 },
  HUSH: { id: 'hush', name: 'Blue Womb', order: 11 },
  CORPSE: { id: 'corpse', name: 'Corpse', order: 12 }
};

// All floor IDs as array for iteration
export const ALL_FLOORS = Object.values(FLOORS).sort((a, b) => a.order - b.order);

// Characters for tracking defeats
export const ALL_CHARACTERS = [
  'Isaac', 'Magdalene', 'Cain', 'Judas', 'Blue Baby', 'Eve', 'Samson',
  'Azazel', 'Lazarus', 'Eden', 'The Lost', 'Lilith', 'Keeper',
  'Apollyon', 'The Forgotten', 'Bethany', 'Jacob & Esau',
  'Tainted Isaac', 'Tainted Magdalene', 'Tainted Cain', 'Tainted Judas',
  'Tainted Blue Baby', 'Tainted Eve', 'Tainted Samson', 'Tainted Azazel',
  'Tainted Lazarus', 'Tainted Eden', 'Tainted Lost', 'Tainted Lilith',
  'Tainted Keeper', 'Tainted Apollyon', 'Tainted Forgotten',
  'Tainted Bethany', 'Tainted Jacob'
];

// Filter options
export const FILTER_OPTIONS = {
  STATUS: [
    { id: 'all', label: 'All Bosses' },
    { id: 'not_defeated', label: 'Not Defeated' },
    { id: 'normal', label: 'Normal Only' },
    { id: 'hard', label: 'Hard Mode' },
    { id: 'mastered', label: 'Mastered' }
  ],
  SORT: [
    { id: 'default', label: 'Default' },
    { id: 'difficulty_asc', label: 'Easiest First' },
    { id: 'difficulty_desc', label: 'Hardest First' },
    { id: 'lethal', label: 'Most Lethal' },
    { id: 'community', label: 'Most Defeated' },
    { id: 'unlock_priority', label: 'Best Unlocks' }
  ]
};

/**
 * @typedef {Object} AttackPattern
 * @property {string} name - Pattern name
 * @property {string} description - How the attack works
 * @property {string} dangerLevel - LOW, MEDIUM, HIGH, EXTREME
 * @property {string} [tip] - Optional dodge/counter tip
 */

/**
 * @typedef {Object} UnlockReward
 * @property {string} id - Unique identifier
 * @property {string} name - Item/achievement name
 * @property {string} type - 'item' | 'achievement' | 'character' | 'challenge'
 * @property {string} [character] - Which character unlocks this
 * @property {string} [condition] - Unlock condition
 */

/**
 * @typedef {Object} BossStats
 * @property {number} deathRate - % of players who die here
 * @property {number} completionRate - % who have defeated
 * @property {number} hardModeRate - % completed in hard
 * @property {number} avgAttempts - Average attempts to defeat
 */

/**
 * @typedef {Object} Boss
 * @property {string} id - Unique identifier
 * @property {string} name - Boss name
 * @property {string} image - Sprite URL
 * @property {number} health - HP
 * @property {string} location - Primary floor
 * @property {string[]} [altLocations] - Alternative spawn floors
 * @property {number} difficulty - 1-5 rating
 * @property {string} type - BOSS_TYPE enum
 * @property {number} phases - Number of phases
 * @property {string} description - Lore/description
 * @property {AttackPattern[]} attackPatterns - Attack info
 * @property {UnlockReward[]} [unlocks] - What this boss unlocks
 * @property {string[]} drops - Item drops
 * @property {string[]} [recommendedItems] - Good items against this boss
 * @property {string[]} [recommendedCharacters] - Best characters
 * @property {string} [strategy] - Strategy overview
 * @property {BossStats} [stats] - Community stats (PRO)
 */

/**
 * @typedef {Object} UserBossProgress
 * @property {string} bossId - Boss ID
 * @property {boolean} normalComplete - Defeated in normal
 * @property {boolean} hardComplete - Defeated in hard
 * @property {string[]} charactersDefeated - Characters used to defeat
 * @property {Date} [firstDefeatDate] - When first defeated
 * @property {number} [attempts] - Manual attempt counter
 */

/**
 * @typedef {Object} FloorProgress
 * @property {string} floorId - Floor ID
 * @property {number} total - Total bosses on floor
 * @property {number} defeated - Bosses defeated
 * @property {number} hardComplete - Hard mode completions
 * @property {number} percentage - Completion percentage
 */

export default {
  DEFEAT_STATUS,
  DANGER_LEVEL,
  BOSS_TYPE,
  FLOORS,
  ALL_FLOORS,
  ALL_CHARACTERS,
  FILTER_OPTIONS
};
