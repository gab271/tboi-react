-- Migration: Fix item quality values
-- 1. Remove quality from all trinkets (they don't have quality in the game)
-- 2. Fix specific items with incorrect quality values

-- Remove quality from all trinkets
UPDATE codex_items 
SET quality = NULL 
WHERE item_type = 'trinket';

-- Fix specific items with incorrect quality values
-- Based on official TBOI: Repentance wiki

-- Quality corrections (common items)
UPDATE codex_items SET quality = 0 WHERE slug = 'my-reflection';
UPDATE codex_items SET quality = 1 WHERE slug = 'number-one';
UPDATE codex_items SET quality = 2 WHERE slug = 'blood-of-the-martyr';
UPDATE codex_items SET quality = 1 WHERE slug = 'skatole';
UPDATE codex_items SET quality = 2 WHERE slug = 'moms-lipstick';
UPDATE codex_items SET quality = 1 WHERE slug = 'the-poop';
UPDATE codex_items SET quality = 1 WHERE slug = 'dead-bird';
UPDATE codex_items SET quality = 2 WHERE slug = 'magic-8-ball';
UPDATE codex_items SET quality = 2 WHERE slug = 'jesus-juice';
UPDATE codex_items SET quality = 2 WHERE slug = 'guillotine';
UPDATE codex_items SET quality = 1 WHERE slug = 'guppys-collar';
UPDATE codex_items SET quality = 3 WHERE slug = 'crickets-body';
UPDATE codex_items SET quality = 2 WHERE slug = 'moms-perfume';
UPDATE codex_items SET quality = 3 WHERE slug = 'monstros-lung';
UPDATE codex_items SET quality = 1 WHERE slug = 'tiny-planet';
UPDATE codex_items SET quality = 0 WHERE slug = 'key-piece-1';
UPDATE codex_items SET quality = 0 WHERE slug = 'experimental-treatment';
UPDATE codex_items SET quality = 3 WHERE slug = 'bffs';
UPDATE codex_items SET quality = 4 WHERE slug = 'proptosis';
UPDATE codex_items SET quality = 1 WHERE slug = 'rotten-baby';
UPDATE codex_items SET quality = 0 WHERE slug = 'headless-baby';
UPDATE codex_items SET quality = 2 WHERE slug = 'lil-haunt';
UPDATE codex_items SET quality = 1 WHERE slug = 'big-fan';
UPDATE codex_items SET quality = 1 WHERE slug = 'sissy-longlegs';

-- Zodiac items
UPDATE codex_items SET quality = 1 WHERE slug = 'taurus';
UPDATE codex_items SET quality = 1 WHERE slug = 'aries';
UPDATE codex_items SET quality = 2 WHERE slug = 'leo';
UPDATE codex_items SET quality = 2 WHERE slug = 'scorpio';
UPDATE codex_items SET quality = 2 WHERE slug = 'sagittarius';
UPDATE codex_items SET quality = 3 WHERE slug = 'capricorn';
UPDATE codex_items SET quality = 1 WHERE slug = 'aquarius';
UPDATE codex_items SET quality = 1 WHERE slug = 'pisces';
UPDATE codex_items SET quality = 1 WHERE slug = 'gemini';

-- Quality 0 items (bad)
UPDATE codex_items SET quality = 0 WHERE slug = 'isaacs-tears';
UPDATE codex_items SET quality = 0 WHERE slug = 'breath-of-life';
UPDATE codex_items SET quality = 0 WHERE slug = 'cursed-eye';
UPDATE codex_items SET quality = 0 WHERE slug = 'marked';
UPDATE codex_items SET quality = 0 WHERE slug = 'missing-no';
UPDATE codex_items SET quality = 0 WHERE slug = 'dataminer';
UPDATE codex_items SET quality = 0 WHERE slug = 'plan-c';

-- Quality 1 items
UPDATE codex_items SET quality = 1 WHERE slug = 'soy-milk';
UPDATE codex_items SET quality = 1 WHERE slug = 'almond-milk';
UPDATE codex_items SET quality = 1 WHERE slug = 'clicker';
UPDATE codex_items SET quality = 1 WHERE slug = 'brown-nugget';
UPDATE codex_items SET quality = 1 WHERE slug = 'mystery-gift';
UPDATE codex_items SET quality = 1 WHERE slug = 'buddy-in-a-box';
UPDATE codex_items SET quality = 1 WHERE slug = 'dead-cat';
UPDATE codex_items SET quality = 1 WHERE slug = 'guppys-tail';
UPDATE codex_items SET quality = 1 WHERE slug = 'halo-of-flies';
UPDATE codex_items SET quality = 1 WHERE slug = 'distant-admiration';

-- Quality 2 items
UPDATE codex_items SET quality = 2 WHERE slug = 'torn-photo';
UPDATE codex_items SET quality = 2 WHERE slug = 'synthoil';
UPDATE codex_items SET quality = 2 WHERE slug = 'dog-tooth';
UPDATE codex_items SET quality = 2 WHERE slug = 'black-hole';
UPDATE codex_items SET quality = 2 WHERE slug = 'lil-delirium';
UPDATE codex_items SET quality = 2 WHERE slug = 'bag-of-crafting';
UPDATE codex_items SET quality = 2 WHERE slug = 'pentagram';
UPDATE codex_items SET quality = 2 WHERE slug = 'growth-hormones';
UPDATE codex_items SET quality = 2 WHERE slug = 'the-mark';
UPDATE codex_items SET quality = 2 WHERE slug = 'cat-o-nine-tails';
UPDATE codex_items SET quality = 2 WHERE slug = 'guppys-paw';
UPDATE codex_items SET quality = 2 WHERE slug = 'guppys-head';

-- Quality 3 items (good)
UPDATE codex_items SET quality = 3 WHERE slug = 'jacobs-ladder';
UPDATE codex_items SET quality = 3 WHERE slug = 'haemolacria';
UPDATE codex_items SET quality = 3 WHERE slug = 'dr-fetus';
UPDATE codex_items SET quality = 3 WHERE slug = 'ipecac';

-- Quality 4 items (run winners)
UPDATE codex_items SET quality = 4 WHERE slug = 'dead-eye';
UPDATE codex_items SET quality = 4 WHERE slug = 'crown-of-light';
UPDATE codex_items SET quality = 4 WHERE slug = 'void';
UPDATE codex_items SET quality = 4 WHERE slug = 'eye-of-the-occult';
UPDATE codex_items SET quality = 4 WHERE slug = 'brimstone';
UPDATE codex_items SET quality = 4 WHERE slug = 'moms-knife';
UPDATE codex_items SET quality = 4 WHERE slug = 'sacred-heart';
UPDATE codex_items SET quality = 4 WHERE slug = 'godhead';
UPDATE codex_items SET quality = 4 WHERE slug = 'tech-x';
UPDATE codex_items SET quality = 4 WHERE slug = 'crickets-head';
UPDATE codex_items SET quality = 4 WHERE slug = 'magic-mushroom';
UPDATE codex_items SET quality = 4 WHERE slug = 'polyphemus';
UPDATE codex_items SET quality = 4 WHERE slug = 'holy-mantle';
UPDATE codex_items SET quality = 4 WHERE slug = 'incubus';
UPDATE codex_items SET quality = 4 WHERE slug = 'd6';
UPDATE codex_items SET quality = 4 WHERE slug = 'revelation';
UPDATE codex_items SET quality = 4 WHERE slug = 'psy-fly';
UPDATE codex_items SET quality = 4 WHERE slug = 'epic-fetus';
UPDATE codex_items SET quality = 4 WHERE slug = 'spindown-dice';
UPDATE codex_items SET quality = 4 WHERE slug = 'death-certificate';
UPDATE codex_items SET quality = 4 WHERE slug = 'r-key';
UPDATE codex_items SET quality = 4 WHERE slug = 'glitched-crown';
UPDATE codex_items SET quality = 4 WHERE slug = 'sacred-orb';
UPDATE codex_items SET quality = 4 WHERE slug = 'c-section';
UPDATE codex_items SET quality = 4 WHERE slug = 'd-infinity';
UPDATE codex_items SET quality = 4 WHERE slug = 'mega-blast';
UPDATE codex_items SET quality = 4 WHERE slug = 'twisted-pair';
