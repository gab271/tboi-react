const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedItems() {
  console.log('🌱 Starting item seeding...\n');

  // Read items from seed file
  const itemsPath = path.join(__dirname, '..', 'data', 'items.seed.json');
  const itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

  console.log(`📦 Found ${itemsData.length} items to seed\n`);

  // Process in batches of 100
  const batchSize = 100;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < itemsData.length; i += batchSize) {
    const batch = itemsData.slice(i, i + batchSize);
    
    // Upsert batch - only include columns that exist in the database
    // Real columns: id, name, slug, description, item_type, tags, sprite_url, source, 
    // created_at, updated_at, external_id, quality, pickup_quote, notes, image_full_path,
    // image_thumb_path, image_blurhash, introduced_in, is_published, search_tsv, description_long, item_id, stats, pools
    const { data, error } = await supabase
      .from('codex_items')
      .upsert(batch.map(item => ({
        item_id: item.item_id,
        name: item.name,
        slug: item.slug,
        item_type: item.item_type,
        pickup_quote: item.pickup_quote,
        description: item.description,
        description_long: item.notes || null,
        quality: item.quality,
        stats: item.stats,
        pools: item.pool_tags,
        notes: item.notes
      })), {
        onConflict: 'slug',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
      errors += batch.length;
    } else {
      updated += batch.length;
      process.stdout.write(`\r✅ Processed ${updated}/${itemsData.length} items...`);
    }
  }

  console.log('\n');
  console.log('========================================');
  console.log(`✅ Items updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('========================================\n');
}

async function runMigration() {
  console.log('🔄 Running quality fixes migration...\n');

  // First, set all trinkets to null quality
  const { error: trinketError } = await supabase
    .from('codex_items')
    .update({ quality: null })
    .eq('item_type', 'trinket');

  if (trinketError) {
    console.error('❌ Error updating trinket qualities:', trinketError.message);
  } else {
    console.log('✅ All trinkets set to quality: null');
  }

  // Quality corrections based on official wiki
  const qualityFixes = [
    // Quality 4 items (run winners)
    { quality: 4, slugs: ['brimstone', 'moms-knife', 'sacred-heart', 'godhead', 'tech-x', 'crickets-head', 'magic-mushroom', 'polyphemus', 'holy-mantle', 'incubus', 'd6', 'revelation', 'psy-fly', 'epic-fetus', 'spindown-dice', 'death-certificate', 'r-key', 'glitched-crown', 'sacred-orb', 'c-section', 'd-infinity', 'mega-blast', 'twisted-pair', 'dr-fetus', 'ipecac', 'haemolacria'] },
    
    // Quality 3 items
    { quality: 3, slugs: ['blood-of-the-martyr', 'pyro', 'squeezy', 'rubber-cement', 'abaddon', 'goat-head', 'ceremonial-robes', 'deaths-touch', 'theres-options', 'proptosis', 'scorpio', 'sagittarius', 'eves-mascara', 'judas-shadow', 'mysterious-liquid', 'the-mind', 'the-body', 'the-soul', 'torn-photo', 'blue-cap', 'synthoil', 'toxic-shock', 'car-battery', '8-inch-nails', 'mr-dolly', 'dead-eye', 'holy-light', 'host-hat', 'edens-blessing', 'rune-bag', 'seraphim', 'tractor-beam', 'maw-of-the-void', 'purity', 'athame', 'lusty-blood', 'more-options', 'succubus', 'sack-head', 'binky', 'lead-pencil', 'compound-fracture', 'sinus-infection', 'parasitoid', 'eye-of-belial', 'ghost-pepper', 'euthanasia', 'camo-undies', 'eucharist', 'little-horn', 'backstabber', 'broken-modem', 'jumper-cables', 'technology-zero', 'angelic-prism', 'lachryphagy', 'trisagion', 'schoolbag', 'divorce-papers', 'brittle-bones', 'mucormycosis', 'paschal-candle', 'immaculate-heart', 'spirit-sword', 'the-stairway', 'luna', 'terra', 'uranus', 'neptunus', 'pluto', 'eye-drops', 'act-of-contrition', 'lil-dumpy', 'birds-eye', 'birthright', 'bot-fly', 'dogma', 'star-of-bethlehem', 'sausage', 'worm-friend', 'belly-jelly', 'heartbreak', 'salvation', 'stapler', 'keepers-sack', 'glass-eye', 'moms-ring', 'pentagram', 'growth-hormones', 'the-mark', 'dead-cat', 'cat-o-nine-tails', 'crickets-body', 'bffs', 'jacobs-ladder', 'black-candle'] },
    
    // Quality 2 items
    { quality: 2, slugs: ['my-reflection', 'odd-mushroom-thin', 'odd-mushroom-large', 'whore-of-babylon', '3-dollar-bill', 'iron-bar', 'sharp-plug', 'lost-contact', 'moms-wig', 'placenta', 'old-bandage', 'sad-bombs', 'gimpy', 'monstros-lung', 'ball-of-tar', 'contract-from-below', 'infamy', 'trinity-shield', 'hive-mind', 'magic-scab', 'blood-clot', 'screw', 'leech', 'mystery-sack', 'aries', 'aquarius', 'pisces', 'soy-milk', 'the-polaroid', 'the-negative', 'moms-pearls', 'fates-reward', 'lil-chest', 'sworn-protector', 'lost-fly', 'continuum', 'charged-baby', 'restock', 'pupula-duplex', 'pay-to-play', 'censer', 'fruit-cake', 'circle-of-protection', 'multidimensional-baby', 'glitter-bombs', 'eye-of-greed', 'tarot-cloth', 'cone-head', 'belly-button', 'sulfuric-acid', 'glyph-of-balance', 'analog-stick', 'contagion', 'lil-monstro', 'buddy-in-a-box', 'empty-vessel', 'evil-eye', '7-seals', 'blanket', 'flat-stone', 'dads-ring', 'dream-catcher', 'playdough-cookie', 'orphan-socks', 'the-intruder', 'sol', 'mercurius', 'venus', 'jupiter', 'saturnus', 'voodoo-head', 'ocular-rift', 'freezer-baby', 'blood-bombs', 'lodestone', 'rotten-tomato', 'red-stew', 'knockout-drops', 'brimstone-bombs', '45-volt', 'quints', 'tooth-and-nail', 'guppys-eye', 'redemption', 'bone-spurs', 'hungry-soul', 'inner-child', 'the-swarm', 'bloody-gust', 'azazels-rage', 'isaacs-tomb', 'hypercoagulation', 'halo-of-flies', 'lil-brimstone', 'eye-of-the-occult'] },
    
    // Quality 1 items
    { quality: 1, slugs: ['number-one', 'magneto', 'treasure-map', 'little-gish', 'the-common-cold', 'guardian-angel', 'bobby-bomb', 'ball-of-bandages', 'headless-baby', 'anti-gravity', 'smart-fly', 'robo-baby-20', 'leo', 'libra', 'the-ludovico-technique', 'lazarus-rags', 'broken-watch', 'safety-pin', 'latch-key', 'match-book', 'a-snack', 'friend-zone', 'scatter-bombs', 'sticky-bombs', 'epiphora', 'bursting-sack', 'lil-gurdy', 'bumbo', 'betrayal', 'zodiac', 'gods-flesh', 'spear-of-destiny', 'spider-mod', 'farting-baby', 'gb-bug', 'cambion-conception', 'immaculate-conception', 'night-light', 'papa-fly', 'lil-loki', 'dark-princes-crown', 'dead-tooth', 'shard-of-glass', 'metal-plate', 'dads-lost-coin', 'midnight-snack', 'glaucoma', 'depression', 'king-baby', 'big-chubby', 'adrenaline', 'duality', 'large-zit', 'moms-razor', 'bloodshot-eye', 'angry-fly', 'fast-bombs', 'lil-delirium', 'deaths-list', 'marrow', 'slipped-rib', 'hallowed-ground', 'pointy-rib', 'jaw-bone', '2spooky', 'eye-sore', 'it-hurts', 'nancy-bombs', 'blood-puppy', 'divine-intervention', 'blood-oath', 'dirty-mind', 'monstrance', 'boiled-baby', 'booster-pack', 'evil-charm', 'purgatory', 'consolation-prize', 'tinytoma', 'fruity-plum', 'cube-baby', 'vasculitis', 'giant-cell', 'tropicamide', 'candy-heart', 'spirit-shackles', 'cracked-orb', 'empty-heart', 'astral-projection', 'sanguine-bond', 'vanishing-twin', 'vengeful-spirit', 'supper'] },
    
    // Quality 0 items (bad)
    { quality: 0, slugs: ['skatole', 'dead-bird', 'guillotine', 'box', 'spiderbaby', 'tiny-planet', 'bobs-brain', 'best-bud', 'clicker', 'brown-nugget'] }
  ];

  for (const fix of qualityFixes) {
    for (const slug of fix.slugs) {
      const { error } = await supabase
        .from('codex_items')
        .update({ quality: fix.quality })
        .eq('slug', slug);
      
      if (error) {
        console.error(`❌ Error updating ${slug}:`, error.message);
      }
    }
  }

  console.log('✅ Quality fixes applied\n');
}

async function main() {
  try {
    // First seed all items from the JSON file
    await seedItems();
    
    // Then run quality fixes migration
    await runMigration();
    
    console.log('🎉 Database update complete!\n');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
