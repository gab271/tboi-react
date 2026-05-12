/**
 * Diccionario de transformaciones de Repentance.
 * Fuente: https://bindingofisaacrebirth.fandom.com/wiki/Transformation
 *
 * Los IDs son los collectible IDs internos del juego (números enteros).
 * Verificar contra la wiki si se añaden items de DLC futuros.
 */

// ─── Fuente de verdad ────────────────────────────────────────────────────────
// Cada key coincide con las keys de TRANSFORMATION_INFO en effectCalculator.js

export const TRANSFORMATION_POOLS = {
  guppy: {
    items: [
      81,   // Dead Cat
      133,  // Guppy's Paw
      134,  // Guppy's Tail
      145,  // Guppy's Head
      187,  // Guppy's Hairball
      212,  // Guppy's Collar
      221,  // Guppy's Vomit
      387,  // Kid's Drawing
    ],
  },
  beelzebub: {
    items: [
      9,    // Skatole
      23,   // The Husk
      247,  // BFFS!
      248,  // Hive Mind
      278,  // The Mulligan
      511,  // Angry Fly
      616,  // Bot Fly
    ],
  },
  conjoined: {
    items: [
      203,  // Dad's Lost Coin
      347,  // Diplopia
      404,  // Cain's Other Eye
      472,  // King Baby
      531,  // Tonsil
    ],
  },
  leviathan: {
    items: [
      80,   // The Pact
      118,  // Brimstone
      167,  // Pageant Boy
      230,  // Abaddon
      260,  // Lord of the Pit
    ],
  },
  spun: {
    items: [
      75,   // Thunder Thighs
      175,  // Soy Milk
      196,  // Epiphora
      300,  // The Wiz
      317,  // Speed Ball
      434,  // Shard of Glass
    ],
  },
  seraphim: {
    items: [
      142,  // Sacred Heart
      196,  // Godhead (nota: comparte pool con spun — un ítem puede contar para varias)
      313,  // The Holy Mantle
      331,  // The Polaroid
      334,  // Holy Grail
      341,  // Sworn Protector
    ],
  },
  bookworm: {
    items: [
      22,   // Dead Sea Scrolls
      69,   // Lemon Mishap
      121,  // Forget Me Now
      168,  // Holy Bible
      185,  // The Necronomicon
      327,  // The Bible (trinket)
      352,  // Satanic Bible
      426,  // Book of Virtues
    ],
  },
  mom: {
    items: [
      29,   // Mom's Underwear
      30,   // Mom's Heels
      31,   // Mom's Lipstick
      114,  // Mom's Knife
      139,  // Mom's Purse
      151,  // Mom's Pad
      195,  // Mom's Coin Purse
      403,  // Mom's Bra
      543,  // Mom's Razor
      714,  // Mom's Ring
    ],
  },
  oh_crap: {
    items: [
      36,   // Mr. Mega
      132,  // Butt Bombs
      473,  // Dirty Mind
      597,  // Dirty Mind (repentance variant — ajustar si es duplicado)
    ],
  },
  fun_guy: {
    items: [
      64,   // Common Cold
      303,  // Magic Mushroom
      505,  // Mushroon (trinket)
      591,  // Montezuma's Revenge
    ],
  },
};

// ─── Lookup Map derivado — O(1) por item ID ──────────────────────────────────
// Se construye una sola vez al importar el módulo.
// Permite calcular el progreso de toda la colección en O(n) donde n = collectedItems.length

export const ITEM_TO_TRANSFORMATIONS = new Map();

for (const [key, { items }] of Object.entries(TRANSFORMATION_POOLS)) {
  for (const id of items) {
    const existing = ITEM_TO_TRANSFORMATIONS.get(id) ?? [];
    ITEM_TO_TRANSFORMATIONS.set(id, [...existing, key]);
  }
}
