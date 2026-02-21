/**
 * Script to fix item quality values in items.seed.json
 * 
 * Rules:
 * 1. Trinkets should NOT have quality (set to null)
 * 2. Other items should have correct quality based on official TBOI wiki
 * 
 * Official quality tiers (0-4):
 * 0 - Tier 0: Bad items or items with significant drawbacks
 * 1 - Tier 1: Below average items
 * 2 - Tier 2: Average items
 * 3 - Tier 3: Good items
 * 4 - Tier 4: Great items, can carry a run
 */

const fs = require('fs');
const path = require('path');

// Load current items
const itemsPath = path.join(__dirname, '../data/items.seed.json');
const items = require(itemsPath);

// Official quality values for specific items that are commonly misclassified
// Based on the official Binding of Isaac: Repentance wiki
const qualityCorrections = {
  // Items user mentioned as wrong
  'aries': 1,          // Aries is quality 1, not 4
  'big-fan': 1,        // Big Fan is quality 1, not 4
  
  // Common passive items - based on wiki
  'the-sad-onion': 3,
  'spoon-bender': 3,
  'my-reflection': 0,  // Actually not great
  'number-one': 1,
  'blood-of-the-martyr': 2,
  'brother-bobby': 1,
  'skatole': 1,
  'roid-rage': 2,
  'skeleton-key': 2,
  'boom': 0,
  
  // Zodiac items (often quality 1-2)
  'taurus': 1,
  'cancer': 2,
  'leo': 2,
  'virgo': 2,
  'libra': 0,
  'scorpio': 2,
  'sagittarius': 2,
  'capricorn': 3,
  'aquarius': 1,
  'pisces': 1,
  'gemini': 1,
  
  // Common misclassified items
  'sissy-longlegs': 1,
  'lil-haunt': 2,
  'dark-bum': 3,
  'rotten-baby': 1,
  'headless-baby': 0,
  'dead-bird': 1,
  'halo-of-flies': 1,
  'distant-admiration': 1,
  'forever-alone': 1,
  'key-piece-1': 0,
  'key-piece-2': 0,
  
  // Quality 4 items (run winners)
  'brimstone': 4,
  'moms-knife': 4,
  'sacred-heart': 4,
  'godhead': 4,
  'tech-x': 4,
  'crickets-head': 4,
  'magic-mushroom': 4,
  'polyphemus': 4,
  'proptosis': 4,
  'dead-eye': 4,
  'twisted-pair': 4,
  'crown-of-light': 4,
  'holy-mantle': 4,
  'incubus': 4,
  'mega-blast': 4,
  'd6': 4,
  'd-infinity': 4,
  'void': 4,
  'death-certificate': 4,
  'r-key': 4,
  'glitched-crown': 4,
  'sacred-orb': 4,
  'c-section': 4,
  'eye-of-the-occult': 4,
  'revelation': 4,
  'psy-fly': 4,
  
  // Quality 3 items (good)
  '20-20': 3,
  'bffs': 3,
  'tech-5': 3,
  'ipecac': 3,
  'dr-fetus': 3,
  'epic-fetus': 4,
  'ludovico-technique': 3,
  'monstros-lung': 3,
  'the-parasite': 3,
  'crickets-body': 3,
  'haemolacria': 3,
  'jacobs-ladder': 3,
  'tiny-planet': 2,
  'lump-of-coal': 3,
  'soy-milk': 1,
  'almond-milk': 1,
  'chocolate-milk': 3,
  
  // Quality 2 items (average)
  'pentagram': 2,
  'the-mark': 2,
  'stigmata': 2,
  'toothpicks': 2,
  'torn-photo': 2,
  'growth-hormones': 2,
  'jesus-juice': 2,
  'meat': 2,
  'magic-8-ball': 2,
  'cat-o-nine-tails': 2,
  'dog-tooth': 2,
  'synthoil': 2,
  
  // Quality 1 items (below average)
  'the-poop': 1,
  'dead-cat': 1, // Despite 9 lives, quality 1 due to health loss
  'guppys-tail': 1,
  'guppys-hairball': 1,
  'guppys-paw': 2,
  'guppys-head': 2,
  'guppys-collar': 1,
  'moms-pad': 0,
  'moms-bra': 0,
  'moms-heels': 1,
  'moms-lipstick': 2,
  'moms-underwear': 1,
  'moms-perfume': 2,
  'moms-eyeshadow': 2,
  'moms-wig': 1,
  
  // Quality 0 items (bad)
  'isaacs-heart': 0,
  'strange-attractor': 0,
  'cursed-eye': 0,
  'the-wiz': 0,
  'shard-of-glass': 0,
  'tiny-planet': 1,
  'guillotine': 2,
  'experimental-treatment': 0,
  'missing-no': 0,
  'the-bloat': 0,
  'butter-bean': 0,
  'isaacs-tears': 0,
  'breath-of-life': 0,
  'marked': 0,
  'lemon-mishap': 0,
  'dataminer': 0,
  'my-shadow': 0,
  'betrayal': 0,
  'clicker': 1,
  'd10': 1,
  'plan-c': 0,
  'black-hole': 2,
  'brown-nugget': 1,
  'mystery-gift': 1,
  'sprinkler': 1,
  'angry-fly': 0,
  'buddy-in-a-box': 1,
  'lil-delirium': 2,
  'abyss': 3,
  'bag-of-crafting': 2,
  'lemegeton': 3,
  'spindown-dice': 4,
};

let trinketsFixed = 0;
let qualitiesFixed = 0;

// Process each item
const fixedItems = items.map(item => {
  // Make a copy
  const fixedItem = { ...item };
  
  // Rule 1: Trinkets should not have quality
  if (item.item_type === 'trinket') {
    if (item.quality !== null && item.quality !== undefined) {
      fixedItem.quality = null;
      trinketsFixed++;
    }
    return fixedItem;
  }
  
  // Rule 2: Check for quality corrections
  if (qualityCorrections[item.slug] !== undefined) {
    if (item.quality !== qualityCorrections[item.slug]) {
      console.log(`Fixing ${item.name}: quality ${item.quality} -> ${qualityCorrections[item.slug]}`);
      fixedItem.quality = qualityCorrections[item.slug];
      qualitiesFixed++;
    }
  }
  
  return fixedItem;
});

// Write back
fs.writeFileSync(itemsPath, JSON.stringify(fixedItems, null, 2));

console.log('\n=== Fix Complete ===');
console.log(`Trinkets fixed (quality removed): ${trinketsFixed}`);
console.log(`Item qualities corrected: ${qualitiesFixed}`);
console.log(`Total items processed: ${items.length}`);
