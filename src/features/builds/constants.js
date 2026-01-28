/**
 * Builds Constants
 * Shared constants for the builds system
 */

export const GAME_VERSIONS = [
  { value: 'repentance_plus', label: 'Repentance+' },
  { value: 'repentance', label: 'Repentance' },
  { value: 'afterbirth_plus', label: 'Afterbirth+' },
  { value: 'afterbirth', label: 'Afterbirth' },
  { value: 'rebirth', label: 'Rebirth' },
];

export const DIFFICULTIES = [
  { value: 'normal', label: 'Normal', icon: '😊' },
  { value: 'hard', label: 'Hard', icon: '💀' },
  { value: 'greed', label: 'Greed', icon: '💰' },
  { value: 'greedier', label: 'Greedier', icon: '🤑' },
];

export const BUILD_TYPES = [
  { value: 'damage', label: 'Damage', icon: '⚔️', color: 'text-red-500' },
  { value: 'survival', label: 'Survival', icon: '🛡️', color: 'text-blue-500' },
  { value: 'synergy', label: 'Synergy', icon: '✨', color: 'text-purple-500' },
  { value: 'fun_meme', label: 'Fun/Meme', icon: '🎭', color: 'text-yellow-500' },
  { value: 'challenge', label: 'Challenge', icon: '🏆', color: 'text-green-500' },
  { value: 'speedrun', label: 'Speedrun', icon: '⚡', color: 'text-orange-500' },
];

export const SORT_OPTIONS = [
  { value: 'new', label: 'New', icon: '🆕' },
  { value: 'top', label: 'Top', icon: '🔥' },
  { value: 'hot', label: 'Hot', icon: '⭐' },
];

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'duplicate', label: 'Duplicate content' },
  { value: 'other', label: 'Other' },
];

// Characters list (partial - extend as needed from your data)
export const CHARACTERS = [
  { slug: 'isaac', name: 'Isaac', tainted: false },
  { slug: 'magdalene', name: 'Magdalene', tainted: false },
  { slug: 'cain', name: 'Cain', tainted: false },
  { slug: 'judas', name: 'Judas', tainted: false },
  { slug: 'blue-baby', name: 'Blue Baby', tainted: false },
  { slug: 'eve', name: 'Eve', tainted: false },
  { slug: 'samson', name: 'Samson', tainted: false },
  { slug: 'azazel', name: 'Azazel', tainted: false },
  { slug: 'lazarus', name: 'Lazarus', tainted: false },
  { slug: 'eden', name: 'Eden', tainted: false },
  { slug: 'the-lost', name: 'The Lost', tainted: false },
  { slug: 'lilith', name: 'Lilith', tainted: false },
  { slug: 'keeper', name: 'Keeper', tainted: false },
  { slug: 'apollyon', name: 'Apollyon', tainted: false },
  { slug: 'the-forgotten', name: 'The Forgotten', tainted: false },
  { slug: 'bethany', name: 'Bethany', tainted: false },
  { slug: 'jacob-esau', name: 'Jacob & Esau', tainted: false },
  // Tainted characters
  { slug: 'tainted-isaac', name: 'Tainted Isaac', tainted: true },
  { slug: 'tainted-magdalene', name: 'Tainted Magdalene', tainted: true },
  { slug: 'tainted-cain', name: 'Tainted Cain', tainted: true },
  { slug: 'tainted-judas', name: 'Tainted Judas', tainted: true },
  { slug: 'tainted-blue-baby', name: 'Tainted Blue Baby', tainted: true },
  { slug: 'tainted-eve', name: 'Tainted Eve', tainted: true },
  { slug: 'tainted-samson', name: 'Tainted Samson', tainted: true },
  { slug: 'tainted-azazel', name: 'Tainted Azazel', tainted: true },
  { slug: 'tainted-lazarus', name: 'Tainted Lazarus', tainted: true },
  { slug: 'tainted-eden', name: 'Tainted Eden', tainted: true },
  { slug: 'tainted-lost', name: 'Tainted Lost', tainted: true },
  { slug: 'tainted-lilith', name: 'Tainted Lilith', tainted: true },
  { slug: 'tainted-keeper', name: 'Tainted Keeper', tainted: true },
  { slug: 'tainted-apollyon', name: 'Tainted Apollyon', tainted: true },
  { slug: 'tainted-forgotten', name: 'Tainted Forgotten', tainted: true },
  { slug: 'tainted-bethany', name: 'Tainted Bethany', tainted: true },
  { slug: 'tainted-jacob', name: 'Tainted Jacob', tainted: true },
];

// Validation constants
export const VALIDATION = {
  title: {
    min: 3,
    max: 60,
  },
  description: {
    min: 10,
    max: 5000,
  },
  howToExecute: {
    min: 10,
    max: 3000,
  },
  notes: {
    max: 2000,
  },
  seed: {
    pattern: /^[A-Z0-9]{8}$/,
  },
  tags: {
    min: 2,
    max: 8,
    tagMinLength: 2,
    tagMaxLength: 30,
  },
  items: {
    min: 1,
    max: 50,
  },
  media: {
    max: 3,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
  comment: {
    min: 1,
    max: 2000,
  },
  report: {
    min: 10,
    max: 500,
  },
};

// Popular tags suggestions
export const SUGGESTED_TAGS = [
  'broken',
  'infinite-damage',
  'flying',
  'brimstone',
  'tech-x',
  'mom-knife',
  'epic-fetus',
  'holy-mantle',
  'godhead',
  'sacred-heart',
  'd6',
  'd20',
  'battery',
  'soul-hearts',
  'black-hearts',
  'devil-deals',
  'angel-rooms',
  'boss-rush',
  'hush',
  'delirium',
  'mother',
  'mega-satan',
  'beast',
  'greed-mode',
  'no-damage',
  'daily-run',
  'seeded',
  'transformation',
  'familiar',
  'orbital',
];

// Utility functions
export const getCharacterBySlug = (slug) => 
  CHARACTERS.find(c => c.slug === slug);

export const getGameVersionLabel = (value) =>
  GAME_VERSIONS.find(v => v.value === value)?.label || value;

export const getDifficultyLabel = (value) =>
  DIFFICULTIES.find(d => d.value === value)?.label || value;

export const getBuildTypeInfo = (value) =>
  BUILD_TYPES.find(t => t.value === value) || { label: value, icon: '❓', color: 'text-gray-500' };
