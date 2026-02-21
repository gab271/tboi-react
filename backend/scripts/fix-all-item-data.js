/**
 * Fix all item qualities and trinket data based on official TBOI:Repentance wiki
 * Source: https://bindingofisaacrebirth.fandom.com/wiki/Items
 * 
 * Run with: node backend/scripts/fix-all-item-data.js
 */

const fs = require('fs');
const path = require('path');

// Official quality data from the TBOI wiki
// Format: slug -> quality (0-4)
const officialQualities = {
  // ============== Quality 0 (Bad) ==============
  'skatole': 0,
  'boom': 0,
  'ankh': 0,
  'best-bud': 0,
  'bob-s-brain': 0,
  'bobs-brain': 0,
  'bbf': 0,
  'the-black-bean': 0,
  'missing-page-2': 0,
  'tiny-planet': 0,
  'cursed-eye': 0,
  'strange-attractor': 0,
  'curse-of-the-tower': 0,
  'black-powder': 0,
  'key-bum': 0,
  'obsessed-fan': 0,
  'marked': 0,
  'the-wiz': 0,
  'linger-bean': 0,
  'varicose-veins': 0,
  'shade': 0,
  'hushy': 0,
  'isaacs-heart': 0,
  'isaac-s-heart': 0,
  'missing-no': 0,
  'dead-bird': 0,
  'spiderbaby': 0,
  'spider-baby': 0,
  'gnawed-leaf': 1, // Actually quality 1
  'infestation': 0,
  'pageant-boy': 0,
  'abel': 0,
  'e-coli': 0,
  'key-piece-1': 0,
  'key-piece-2': 0,
  'dataminer': 0,
  'plan-c': 0,
  'clicker': 0,
  'compost': 0,
  'brown-nugget': 0,
  'leprosy': 0,
  'mystery-egg': 0,
  'mars': 0,
  'battery-pack': 0,
  'knife-piece-1': 0,
  'knife-piece-2': 0,
  'dad-s-note': 0,
  'dads-note': 0,
  'tmtrainer': 0,
  'ibs': 0,
  'a-pound-of-flesh': 0,
  'lil-portal': 0,
  'little-baggy': 0,
  'a-quarter': 0,
  'moms-coin-purse': 0,
  'box': 0,
  'guillotine': 0, // Was incorrectly listed, actually 0
  
  // ============== Quality 1 (Decent) ==============
  'the-sad-onion': 3, // Actually quality 3
  'brother-bobby': 1,
  'the-compass': 1,
  'lunch': 1,
  'dinner': 1,
  'dessert': 1,
  'breakfast': 1,
  'rotten-meat': 1,
  'wooden-spoon': 1,
  'the-belt': 1,
  'moms-underwear': 1,
  'moms-heels': 1,
  'moms-lipstick': 1,
  'magneto': 1,
  'treasure-map': 1,
  'moms-eye': 1,
  'the-ladder': 1,
  'sister-maggy': 1,
  'cube-of-meat': 1,
  'lokis-horns': 1,
  'little-chubby': 1,
  'sack-of-pennies': 1,
  'robo-baby': 1,
  'little-gish': 1,
  'the-common-cold': 1,
  'celtic-cross': 1,
  'ghost-baby': 1,
  'harlequin-baby': 1,
  'bobby-bomb': 1,
  'forever-alone': 1,
  'bucket-of-lard': 1,
  'bomb-bag': 1,
  'bobs-curse': 1,
  'bum-friend': 1,
  'anti-gravity': 1,
  'headless-baby': 1,
  'smart-fly': 1,
  'robo-baby-20': 1,
  'robo-baby-2-0': 1,
  'ball-of-bandages': 1,
  'butt-bombs': 1,
  'guppys-collar': 1,
  'anemic': 1,
  'rainbow-baby': 1,
  'stem-cells': 1,
  'guppys-hairball': 1,
  'lazarus-rags': 1,
  'broken-watch': 1,
  'safety-pin': 1,
  'caffeine-pill': 1,
  'latch-key': 1,
  'match-book': 1,
  'a-snack': 1,
  'friend-zone': 1,
  'scatter-bombs': 1,
  'sticky-bombs': 1,
  'epiphora': 1,
  'bursting-sack': 1,
  'night-light': 1,
  'papa-fly': 1,
  'milk': 1,
  'lil-gurdy': 1,
  'bumbo': 1,
  'lil-loki': 1,
  'dark-princes-crown': 1,
  'dead-tooth': 1,
  'shard-of-glass': 1,
  'metal-plate': 1,
  'dads-lost-coin': 1,
  'midnight-snack': 1,
  'glaucoma': 1,
  'finger': 1,
  'depression': 1,
  'king-baby': 1,
  'big-chubby': 1,
  'adrenaline': 1,
  'large-zit': 1,
  'lil-delirium': 1,
  'marrow': 1,
  'slipped-rib': 1,
  'hallowed-ground': 1,
  'pointy-rib': 1,
  'jaw-bone': 1,
  '2spooky': 1,
  'eye-sore': 1,
  'it-hurts': 1,
  'almond-milk': 1,
  'nancy-bombs': 1,
  'blood-puppy': 1,
  'divine-intervention': 1,
  'blood-oath': 1,
  'monstrance': 1,
  'dirty-mind': 1,
  'boiled-baby': 1,
  'evil-charm': 1,
  'purgatory': 1,
  'akeldama': 1,
  'consolation-prize': 1,
  'tinytoma': 1,
  'fruity-plum': 1,
  'cube-baby': 1,
  'vasculitis': 1,
  'giant-cell': 1,
  'tropicamide': 1,
  'booster-pack': 1,
  'candy-heart': 1,
  'spirit-shackles': 1,
  'cracked-orb': 1,
  'empty-heart': 1,
  'astral-projection': 1,
  'sanguine-bond': 1,
  'vanishing-twin': 1,
  'vengeful-spirit': 1,
  'supper': 1,
  'taurus': 1,
  'aries': 2, // Aries is quality 2 in Repentance
  'leo': 1,
  'libra': 1,
  'gemini': 1,
  'aquarius': 2, // quality 2 in Repentance
  'pisces': 2, // quality 2 in Repentance
  'zodiac': 1,
  'the-ludovico-technique': 1,
  'duality': 1,
  'gods-flesh': 1,
  'spear-of-destiny': 1,
  'cambion-conception': 1,
  'immaculate-conception': 1,
  'spider-mod': 1,
  'farting-baby': 1,
  'gb-bug': 1,
  'betrayal': 1,
  'deaths-list': 1,
  'pop': 1,
  'lil-spewer': 1,
  'moms-razor': 1,
  'bloodshot-eye': 1,
  'angry-fly': 1,
  'fast-bombs': 1,
  'guardian-angel': 1,
  'demon-baby': 1,
  
  // ============== Quality 2 (Good) ==============
  'the-inner-eye': 3, // Actually quality 3
  'spoon-bender': 3, // Actually quality 3
  'my-reflection': 2,
  'number-one': 2,
  'halo-of-flies': 2,
  '1up': 2,
  'one-up': 2,
  'the-virus': 2,
  'roid-rage': 2,
  'heart': 2,
  'raw-liver': 2,
  'skeleton-key': 2,
  'the-battery': 2,
  'steam-sale': 2,
  'spelunker-hat': 2,
  'super-bandage': 2,
  'phd': 2,
  'x-ray-vision': 2,
  'spider-bite': 2,
  'odd-mushroom-thin': 2,
  'odd-mushroom-large': 2,
  'whore-of-babylon': 2,
  'stigmata': 2,
  'moms-purse': 2,
  'speed-ball': 2,
  'scapular': 2,
  'chemical-peel': 2,
  'the-peeper': 2,
  'habit': 2,
  'bloody-lust': 2,
  'gimpy': 2,
  'black-lotus': 2,
  'sad-bombs': 2,
  'ball-of-tar': 2,
  'contract-from-below': 2,
  'infamy': 2,
  'trinity-shield': 2,
  'bffs': 2,
  'hive-mind': 2,
  'starter-deck': 2,
  'magic-scab': 2,
  'blood-clot': 2,
  'screw': 2,
  'fire-mind': 2,
  'lil-brimstone': 2,
  'lost-contact': 2,
  'juicy-sack': 2,
  'mystery-sack': 2,
  'leech': 2,
  'the-polaroid': 2,
  'the-negative': 2,
  'soy-milk': 2,
  '3-dollar-bill': 2,
  'meat': 2,
  'jesus-juice': 2,
  'iron-bar': 2,
  'sharp-plug': 2,
  'placenta': 2,
  'old-bandage': 2,
  'moms-wig': 2,
  'technology-2': 2,
  'continuum': 2,
  'charged-baby': 2,
  'sworn-protector': 2,
  'lost-fly': 2,
  'fates-reward': 2,
  'lil-chest': 2,
  'deep-pockets': 2,
  'restock': 2,
  'number-two': 2,
  'pupula-duplex': 2,
  'pay-to-play': 2,
  'circle-of-protection': 2,
  'empty-vessel': 2,
  'evil-eye': 2,
  'multidimensional-baby': 2,
  'glitter-bombs': 2,
  'censer': 2,
  '7-seals': 2,
  'tarot-cloth': 2,
  'eye-of-greed': 2,
  'polydactyly': 2,
  'cone-head': 2,
  'belly-button': 2,
  'sulfuric-acid': 2,
  'glyph-of-balance': 2,
  'analog-stick': 2,
  'contagion': 2,
  'acid-baby': 2,
  'yo-listen': 2,
  'lil-monstro': 2,
  'buddy-in-a-box': 2,
  'flat-stone': 2,
  'dads-ring': 2,
  'monstros-lung': 2,
  'dream-catcher': 2,
  'playdough-cookie': 2,
  'orphan-socks': 2,
  'the-intruder': 2,
  'freezer-baby': 2,
  'blood-bombs': 2,
  'lodestone': 2,
  'rotten-tomato': 2,
  'red-stew': 2,
  'brimstone-bombs': 2,
  '45-volt': 2,
  '4-5-volt': 2,
  'quints': 2,
  'tooth-and-nail': 2,
  'guppys-eye': 2,
  'options': 2,
  'member-card': 2,
  'ocular-rift': 2,
  'false-phd': 2,
  'knockout-drops': 2,
  'issacs-tomb': 2,
  'isaacs-tomb': 2,
  'the-swarm': 2,
  'bloody-gust': 2,
  'azazels-rage': 2,
  'sol': 2,
  'mercurius': 2,
  'venus': 2,
  'jupiter': 2,
  'saturnus': 2,
  'voodoo-head': 2,
  'redemption': 2,
  'inner-child': 2,
  'bone-spurs': 2,
  'hungry-soul': 2,
  'hypercoagulation': 2,
  
  // ============== Quality 3 (Great) ==============
  'the-sad-onion': 3,
  'the-inner-eye': 3,
  'spoon-bender': 3,
  'blood-of-the-martyr': 3,
  'wire-coat-hanger': 3,
  'a-dollar': 3,
  'steven': 3,
  'pentagram': 3,
  'growth-hormones': 3,
  'technology': 3,
  'chocolate-milk': 3,
  'the-relic': 3,
  'the-halo': 3,
  'the-parasite': 3,
  'the-small-rock': 3,
  'the-wafer': 4, // Actually quality 4
  'money-equals-power': 3,
  'moms-contacts': 3,
  'lord-of-the-pit': 3,
  'the-pact': 3,
  'dead-cat': 3,
  'the-mark': 3,
  'a-lump-of-coal': 3,
  'spirit-of-the-night': 3,
  'cat-o-nine-tails': 3,
  'rubber-cement': 3,
  'crickets-body': 3,
  'dark-matter': 3,
  'black-candle': 3,
  'proptosis': 3,
  'tech-5': 3,
  'theres-options': 3,
  'mitre': 3,
  'goat-head': 3,
  'ceremonial-robes': 3,
  'abaddon': 3,
  'judas-shadow': 3,
  'infestation-2': 3,
  'deaths-touch': 3,
  'dark-bum': 3,
  'cancer': 3,
  'scorpio': 3,
  'sagittarius': 3,
  'capricorn': 3,
  'eves-mascara': 3,
  'mysterious-liquid': 3,
  'humbleing-bundle': 3,
  'champion-belt': 3,
  'toxic-shock': 3,
  '8-inch-nails': 3,
  'moms-pearls': 2, // Actually quality 2
  'car-battery': 3,
  'mr-dolly': 3,
  'dead-eye': 3,
  'holy-light': 3,
  'host-hat': 3,
  'rune-bag': 3,
  'seraphim': 3,
  'purity': 3,
  'athame': 3,
  'lusty-blood': 3,
  'more-options': 3,
  'succubus': 3,
  'fruit-cake': 2, // Actually quality 2
  'sack-head': 3,
  'apple': 3,
  'lead-pencil': 3,
  'compound-fracture': 3,
  'sinus-infection': 3,
  'parasitoid': 3,
  'eye-of-belial': 3,
  'jacobs-ladder': 3,
  'ghost-pepper': 3,
  'euthanasia': 3,
  'camo-undies': 3,
  'eucharist': 3,
  'little-horn': 3,
  'backstabber': 3,
  'jumper-cables': 3,
  'technology-zero': 3,
  'angelic-prism': 3,
  'haemolacria': 4, // Actually quality 4
  'lachryphagy': 3,
  'trisagion': 3,
  'schoolbag': 3,
  'blanket': 2, // Actually quality 2
  'divorce-papers': 3,
  'brittle-bones': 3,
  'mucormycosis': 3,
  'paschal-candle': 3,
  'eye-of-the-occult': 3,
  'immaculate-heart': 3,
  'spirit-sword': 3,
  'the-stairway': 3,
  'luna': 3,
  'terra': 3,
  'uranus': 3,
  'neptunus': 3,
  'pluto': 3,
  'eye-drops': 3,
  'act-of-contrition': 3,
  'bot-fly': 3,
  'dogma': 3,
  'birthright': 3,
  'card-reading': 3,
  'star-of-bethlehem': 3,
  'lil-dumpy': 3,
  'birds-eye': 3,
  'worm-friend': 3,
  'glass-eye': 3,
  'moms-ring': 3,
  'stapler': 3,
  'keepers-sack': 3,
  'heartbreak': 3,
  'salvation': 3,
  'sausage': 3,
  'echo-chamber': 3,
  'belly-jelly': 3,
  'edens-blessing': 3,
  'binky': 3,
  'broken-modem': 3,
  'torn-photo': 3,
  'blue-cap': 3,
  'synthoil': 3,
  'tough-love': 3,
  'the-mulligan': 3,
  'mutant-spider': 3,
  'fate': 3,
  'holy-water': 3,
  'tooth-picks': 3,
  'holy-grail': 3,
  'dead-dove': 3,
  'smb-super-fan': 3,
  'pyro': 3,
  'squeezy': 3,
  'moms-key': 3,
  'the-mind': 3,
  'the-body': 3,
  'the-soul': 3,
  
  // ============== Quality 4 (God Tier) ==============
  'crickets-head': 4,
  'magic-mushroom': 4,
  'dr-fetus': 4,
  'the-wafer': 4,
  'moms-knife': 4,
  'brimstone': 4,
  'ipecac': 4,
  'epic-fetus': 4,
  'polyphemus': 4,
  'sacred-heart': 4,
  '20-20': 4,
  'twenty-twenty': 4,
  'stop-watch': 4,
  'pyromaniac': 4,
  'godhead': 4,
  'incubus': 4,
  'crown-of-light': 4,
  'tech-x': 4,
  'tractor-beam': 3, // Actually quality 3
  'd6': 4,
  'the-d6': 4,
  'd-infinity': 4,
  'mega-blast': 4,
  'holy-mantle': 4,
  'maw-of-the-void': 3, // Actually quality 3
  'haemolacria': 4,
  'rock-bottom': 4,
  'psy-fly': 4,
  'revelation': 4,
  'c-section': 4,
  'glitched-crown': 4,
  'sacred-orb': 4,
  'twisted-pair': 4,
  'binge-eater': 4,
  'r-key': 4,
  'death-certificate': 4,
  'spindown-dice': 4,
  'mega-mush': 4,
  'moms-shovel': 4,
  'broken-shovel': 4,
  'flip': 4,
};

// Trinket descriptions from the wiki
const trinketDescriptions = {
  'wiggle-worm': {
    pickup_quote: '+0.4 Tears',
    description: 'Isaac\'s tears travel in waves. Grants +0.4 tears.',
    notes: 'Tears move in a sinusoidal wave pattern, making them harder to aim but covering more area.'
  },
  'ring-worm': {
    pickup_quote: '+0.47 Tears',
    description: 'Isaac\'s tears travel in large circles. Grants +0.47 tears.',
    notes: 'Tears spiral outward in a circular pattern, useful for hitting enemies at different ranges.'
  },
  'lucky-rock': {
    pickup_quote: 'There\'s something shiny stuck in there...',
    description: 'Destroying rocks has a 33% chance to spawn a coin.',
    notes: 'Very useful for generating money throughout the run.'
  },
  'butt-penny': {
    pickup_quote: 'Wealth of gas',
    description: '20% higher chance for coins to spawn from poop. Picking up coins makes Isaac fart.',
    notes: 'The fart poisons and knocks back enemies and projectiles.'
  },
  'hook-worm': {
    pickup_quote: 'Worm friend',
    description: 'Tears move in angular patterns. +1.5 range.',
    notes: 'Tears travel in a zig-zag pattern.'
  },
  'liberty-cap': {
    pickup_quote: 'Touch fuzzy, get dizzy',
    description: '25% chance for a random mushroom effect per room.',
    notes: 'Can grant effects like Mini Mush, Odd Mushroom, or other mushroom items temporarily.'
  },
  'bible-tract': {
    pickup_quote: 'Faith up',
    description: 'Eternal Hearts have a higher chance to spawn from enemies and room rewards.',
    notes: 'Increases Eternal Heart drop rate by about 3x.'
  },
  'paper-clip': {
    pickup_quote: 'Golden chests for free!',
    description: 'Golden Chests can be opened without using keys.',
    notes: 'Does not affect other locked objects.'
  },
  'store-credit': {
    pickup_quote: 'Yes!',
    description: 'One-time use. Makes one item in a shop free when picked up.',
    notes: 'Consumed on use.'
  },
  'a-a-a-battery': {
    pickup_quote: 'Trickle charge',
    description: 'Activated items recharge slightly faster when clearing rooms.',
    notes: 'Adds a small amount of charge per room clear.'
  },
  'swallowed-penny': {
    pickup_quote: 'Gulp!',
    description: 'Isaac drops a penny when taking damage.',
    notes: 'Very useful early game for generating coins.'
  },
  'petrified-poop': {
    pickup_quote: 'It\'s petrified',
    description: 'Greatly increases the chance of poop dropping pickups.',
    notes: 'Increases drop chance from about 14% to about 50%.'
  },
  'flat-penny': {
    pickup_quote: 'Squished for your luck',
    description: 'Picking up a coin has a chance to spawn a key.',
    notes: 'About 20% chance to spawn a key on coin pickup.'
  },
  'counterfeit-penny': {
    pickup_quote: 'Wealth of wealth',
    description: 'Picking up a coin has a 50% chance to spawn another coin.',
    notes: 'Can chain for multiple coins with luck.'
  },
  'tick': {
    pickup_quote: 'Attached forever',
    description: 'Restores 1 Red Heart when entering a boss room. Cannot be removed.',
    notes: 'Can only be removed with Smelter, Match Stick, or picking up another trinket slot.'
  },
  'isaacs-head': {
    pickup_quote: 'Dead friend',
    description: 'Spawns a familiar that copies Isaac\'s tears.',
    notes: 'Fires spectral tears that deal 3.5 damage.'
  },
  'the-left-hand': {
    pickup_quote: 'It\'s not right...',
    description: 'Replaces all non-special chests with Red Chests.',
    notes: 'Red Chests can contain soul hearts, items, pills, or teleport you to the Devil Room.'
  },
  'fish-head': {
    pickup_quote: 'Pfft',
    description: 'Taking damage spawns a Blue Fly.',
    notes: 'Useful for maintaining a swarm of flies for damage.'
  },
  'push-pin': {
    pickup_quote: 'Piercing shots',
    description: '10% chance to fire a piercing and spectral tear.',
    notes: 'Chance is affected by luck.'
  },
  'cursed-skull': {
    pickup_quote: 'Cursed?',
    description: 'When Isaac takes damage that would kill him, teleports him to the previous room.',
    notes: 'Can be a lifesaver or a curse depending on the situation.'
  },
  'safety-cap': {
    pickup_quote: 'Don\'t swallow it',
    description: 'Increases pill drop rate from fires, chests, and slot machines.',
    notes: 'Pills appear more frequently in general drops.'
  },
  'ace-of-spades': {
    pickup_quote: 'Luck of the draw',
    description: 'Increases card drop rate from fires, chests, and slot machines.',
    notes: 'Cards appear more frequently in general drops.'
  },
  'moms-pearl': {
    pickup_quote: 'It\'s special',
    description: '10% chance for a spawned Heart to be a Soul Heart instead.',
    notes: 'Affected by luck stat.'
  },
};

// Load the current items
const itemsPath = path.join(__dirname, '../data/items.seed.json');
let items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

let qualitiesFixed = 0;
let descriptionsFixed = 0;

items = items.map(item => {
  const slug = item.slug;
  const isTrinket = item.item_type === 'trinket';
  
  // Fix quality for non-trinkets
  if (!isTrinket && officialQualities[slug] !== undefined) {
    if (item.quality !== officialQualities[slug]) {
      console.log(`Quality fix: ${item.name} (${slug}): ${item.quality} -> ${officialQualities[slug]}`);
      item.quality = officialQualities[slug];
      qualitiesFixed++;
    }
  }
  
  // Ensure trinkets have null quality
  if (isTrinket && item.quality !== null) {
    console.log(`Trinket quality fix: ${item.name} -> null`);
    item.quality = null;
    qualitiesFixed++;
  }
  
  // Add trinket descriptions
  if (isTrinket && trinketDescriptions[slug]) {
    const desc = trinketDescriptions[slug];
    if (desc.pickup_quote && (item.pickup_quote?.includes('Grants') || item.pickup_quote?.includes('Generated'))) {
      item.pickup_quote = desc.pickup_quote;
    }
    if (desc.description && (item.description?.includes('Generated') || item.description?.includes('Up:'))) {
      item.description = desc.description;
      descriptionsFixed++;
    }
    if (desc.notes && item.notes?.includes('Generated')) {
      item.notes = desc.notes;
    }
  }
  
  return item;
});

// Write back
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), 'utf8');

console.log('\\n========================================');
console.log(`Item qualities fixed: ${qualitiesFixed}`);
console.log(`Trinket descriptions improved: ${descriptionsFixed}`);
console.log(`Total items processed: ${items.length}`);
console.log('========================================\\n');
