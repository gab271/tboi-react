# Character Modal - Especificación Técnica Completa
## The Binding of Isaac Companion App

**Fecha:** 2026-02-23  
**Versión:** 1.0  
**Equipo:** Product Design + UX Writer + Frontend + Data + QA

---

## SECCIÓN A — ESTRUCTURA DEL MODAL (WIREFRAME TEXTUAL)

### Layout Final (Desktop 1024px+)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [X] Close                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐   ┌─────────────────────────────────────────────────┐  │
│  │                 │   │ ISAAC                                            │  │
│  │   [POLAROID]    │   │ "The Basement Boy"                              │  │
│  │   Character     │   │                                                  │  │
│  │   Portrait      │   │ ╔═══════════════════════════════════════════╗   │  │
│  │                 │   │ ║ STARTING HEALTH                           ║   │  │
│  │                 │   │ ║ ❤️❤️❤️                                     ║   │  │
│  │   "Isaac"       │   │ ╚═══════════════════════════════════════════╝   │  │
│  └─────────────────┘   │                                                  │  │
│                        │ ┌─────────────────────────────────────────────┐  │  │
│  ┌─────────────────┐   │ │ BASE STATS                                 │  │  │
│  │ COMPLETION      │   │ │ Damage   ████████░░░░░░ 3.50               │  │  │
│  │ MARKS           │   │ │ Tears    ████░░░░░░░░░░ 2.73               │  │  │
│  │                 │   │ │ Speed    █████████░░░░░ 1.00               │  │  │
│  │ [Normal ▼]      │   │ │ Range    ██████████░░░░ 6.50               │  │  │
│  │                 │   │ │ Shot Spd █████████░░░░░ 1.00               │  │  │
│  │ 8/12 completadas│   │ │ Luck     ███████░░░░░░░ 0                  │  │  │
│  │ ▓▓▓▓▓▓▓▓░░░░    │   │ └─────────────────────────────────────────────┘  │  │
│  │                 │   │                                                  │  │
│  │ ┌──┬──┬──┬──┐   │   │ ┌─────────────────────────────────────────────┐  │  │
│  │ │♥ │👼│? │☠ │   │   │ │ STARTING ITEMS                             │  │  │
│  │ ├──┼──┼──┼──┤   │   │ │ ┌───────────────────────────────────────┐  │  │  │
│  │ │🐑│⏱ │🤫│☠☠│   │   │ │ │ [D6 Icon] The D6                      │  │  │  │
│  │ ├──┼──┼──┼──┤   │   │ │ │ Active · 6 charges                    │  │  │  │
│  │ │🌀│👁 │🐉│💰│   │   │ │ │ "Reroll item pedestals"               │  │  │  │
│  │ └──┴──┴──┴──┘   │   │ │ └───────────────────────────────────────┘  │  │  │
│  │                 │   │ └─────────────────────────────────────────────┘  │  │
│  │ [Editar] [💾]   │   │                                                  │  │
│  │ 📁 Manual entry │   │ ┌─────────────────────────────────────────────┐  │  │
│  └─────────────────┘   │ │ PLAYSTYLE                                  │  │  │
│                        │ │ ⚖ Difficulty: ★☆☆ (Easy)                  │  │  │
│                        │ │                                             │  │  │
│                        │ │ • Balanced starter, good for learning      │  │  │
│                        │ │ • D6 lets you reroll bad items             │  │  │
│                        │ │ • Focus on finding item rooms              │  │  │
│                        │ │                                             │  │  │
│                        │ │ 💡 Tip: Save D6 charges for Treasure Rooms │  │  │
│                        │ │                                             │  │  │
│                        │ │ 🔓 Unlock: Disponible desde el inicio      │  │  │
│                        │ └─────────────────────────────────────────────┘  │  │
│                        └─────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Jerarquía Visual (Z-Score de atención)

| Elemento | Prioridad | Tamaño | Por qué |
|----------|-----------|--------|---------|
| Nombre personaje | 1 | 40-48px heading | Identificación inmediata |
| Portrait/Polaroid | 2 | 200-250px ancho | Reconocimiento visual |
| Starting Health | 3 | Iconos 24x24px | Información crítica de gameplay |
| Completion Marks | 4 | 280px panel | Principal interacción usuario |
| Base Stats | 5 | Barras + números | Referencia técnica |
| Starting Items | 6 | Cards pequeñas | Contexto adicional |
| Playstyle | 7 | Texto bullets | Info complementaria |

### Espaciado por Bloque

| Bloque | Altura aprox. | Padding interno |
|--------|---------------|-----------------|
| Header (nombre + subtitle) | 80px | 16px bottom |
| Health icons | 48px | 12px vertical |
| Stats panel | 180px | 16px all |
| Starting Items | 100-150px | 12px all |
| Completion Marks | 320px | 16px all |
| Playstyle | 160px | 16px all |

### Ubicación del Selector NORMAL/HARD

**Posición:** Dentro del panel de Completion Marks, justo debajo del título "Completion Marks" y antes del contador.

**Razón:** 
1. Contexto inmediato: el usuario ve qué afecta el selector
2. No añade altura al modal
3. Feedback visual directo al cambiar

```
┌─────────────────────────────┐
│ Completion Marks            │
│ [Normal ▼] ← SELECTOR AQUÍ  │
│ 8/12 completadas            │
│ ▓▓▓▓▓▓▓▓░░░░                │
└─────────────────────────────┘
```

### Componentes UI Sugeridos

| Componente | Uso | Librería/Custom |
|------------|-----|-----------------|
| `<StatBar>` | Mostrar Damage, Tears, etc. | Custom (pixel style) |
| `<HeartDisplay>` | Vida inicial con iconos | Custom |
| `<ItemCard>` | Starting items | Custom + tooltip |
| `<MarkCell>` | Cada completion mark | Ya existe, mejorar |
| `<SegmentedControl>` | Normal/Hard selector | Custom o Headless UI |
| `<Tooltip>` | Info contextual | Radix UI / custom |

---

## SECCIÓN B — COPY EXACTO (ES/EN)

### Títulos y Subtítulos

| Clave | ES | EN |
|-------|----|----|
| `modal.health.title` | Vida Inicial | Starting Health |
| `modal.stats.title` | Stats Base | Base Stats |
| `modal.items.title` | Objetos Iniciales | Starting Items |
| `modal.marks.title` | Completion Marks | Completion Marks |
| `modal.playstyle.title` | Playstyle | Playstyle |
| `modal.unlock.title` | Desbloqueo | Unlock |

### Labels de Stats

| Stat | ES | EN | Tooltip ES | Tooltip EN |
|------|----|----|------------|------------|
| `damage` | Daño | Damage | Daño base por lágrima | Base damage per tear |
| `tears` | Lágrimas | Tears | Cadencia de disparo (menor = más rápido) | Fire rate (lower delay = faster) |
| `speed` | Velocidad | Speed | Velocidad de movimiento | Movement speed |
| `range` | Alcance | Range | Distancia que viajan las lágrimas | How far tears travel |
| `shotSpeed` | Vel. Disparo | Shot Speed | Velocidad de las lágrimas en el aire | How fast tears move |
| `luck` | Suerte | Luck | Afecta drops, efectos especiales y más | Affects drops, procs, and more |

### Tooltips de Marks (Bosses)

| Mark | Label ES | Label EN | Tooltip ES | Tooltip EN |
|------|----------|----------|------------|------------|
| `heart` | Mom's Heart | Mom's Heart | Derrota a Mom's Heart / It Lives | Defeat Mom's Heart / It Lives |
| `isaac` | Isaac | Isaac | Derrota a Isaac en Cathedral | Defeat Isaac in the Cathedral |
| `bluebaby` | ??? | ??? | Derrota a ??? en The Chest | Defeat ??? in The Chest |
| `satan` | Satan | Satan | Derrota a Satan en Sheol | Defeat Satan in Sheol |
| `lamb` | The Lamb | The Lamb | Derrota a The Lamb en Dark Room | Defeat The Lamb in Dark Room |
| `bossrush` | Boss Rush | Boss Rush | Completa Boss Rush (llega antes de 20 min) | Complete Boss Rush (reach before 20 min) |
| `hush` | Hush | Hush | Derrota a Hush en Blue Womb | Defeat Hush in Blue Womb |
| `megasatan` | Mega Satan | Mega Satan | Derrota a Mega Satan (necesitas ambas llaves) | Defeat Mega Satan (need both keys) |
| `delirium` | Delirium | Delirium | Derrota a Delirium en The Void | Defeat Delirium in The Void |
| `mother` | Mother | Mother | Derrota a Mother en Corpse II | Defeat Mother in Corpse II |
| `beast` | The Beast | The Beast | Derrota a The Beast en Home | Defeat The Beast in Home |
| `greedier` | Greedier | Greedier | Completa Greedier Mode | Complete Greedier Mode |

### Selector Normal/Hard

| Opción | ES | EN |
|--------|----|----|
| Normal | Normal | Normal |
| Hard | Hard | Hard |
| Greed | Greed | Greed |
| Greedier | Greedier | Greedier |

### Textos de Edición

| Clave | ES | EN |
|-------|----|----|
| `marks.edit` | Editar | Edit |
| `marks.save` | Guardar | Save |
| `marks.cancel` | Cancelar | Cancel |
| `marks.editing` | Editando... | Editing... |
| `marks.source.manual` | Entrada manual | Manual entry |
| `marks.source.save` | Importado del save | Imported from save |
| `marks.source.merged` | Manual + Save | Manual + Save |

### Estados Vacíos y Errores

| Clave | ES | EN |
|-------|----|----|
| `marks.empty` | Sin progreso registrado | No progress recorded |
| `marks.empty.hint` | Edita manualmente o importa tu save | Edit manually or import your save |
| `import.error.invalid` | Archivo no válido. Asegúrate de subir un .dat de Repentance. | Invalid file. Make sure to upload a Repentance .dat file. |
| `import.error.corrupt` | No pudimos leer tu save. El archivo puede estar corrupto. | Couldn't read your save. The file may be corrupted. |
| `import.error.empty` | El save está vacío o es de una partida nueva. | Save is empty or from a new game. |
| `import.error.version` | Save no compatible. Asegúrate de usar Repentance+. | Incompatible save. Make sure you're using Repentance+. |

### Conflicto de Datos

| Clave | ES | EN |
|-------|----|----|
| `conflict.title` | Conflicto de datos | Data Conflict |
| `conflict.body` | Ya tienes marks guardadas manualmente. ¿Qué quieres hacer con los datos del save? | You already have manually saved marks. What do you want to do with the save data? |
| `conflict.replace` | Reemplazar todo | Replace all |
| `conflict.replace.desc` | Usa solo los datos del save | Use only save data |
| `conflict.keep` | Mantener manual | Keep manual |
| `conflict.keep.desc` | Ignora el save, conserva tu progreso manual | Ignore save, keep your manual progress |
| `conflict.merge` | Mezclar (completar faltantes) | Merge (fill gaps) |
| `conflict.merge.desc` | Añade marks del save que no tenías | Add marks from save you didn't have |

---

## SECCIÓN C — STATS REALES DEL PERSONAJE

### Base Stats System (Repentance Values)

Las stats en Isaac se miden así:
- **Damage:** Daño base por lágrima (rango típico: 2.5 - 4.5)
- **Tears:** Delay entre disparos (30 / (delay + 1) = lágrimas/segundo)
- **Speed:** Velocidad de movimiento (rango: 0.85 - 1.5)
- **Range:** Altura de lágrima (afecta distancia, rango: 2.5 - 10)
- **Shot Speed:** Velocidad del proyectil (rango: 0.75 - 1.2)
- **Luck:** Afecta RNG de efectos (rango: -2 a +5)

### Datos Reales por Personaje (Base, sin items)

```javascript
export const CHARACTER_BASE_STATS = {
  // === VANILLA CHARACTERS ===
  isaac: {
    damage: 3.50,
    tears: 0,      // 0 delay = base fire rate
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  magdalene: {
    damage: 3.50,
    tears: 0,
    speed: 0.85,   // Más lenta
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  cain: {
    damage: 3.50,
    tears: 0,
    speed: 1.30,   // Más rápido
    range: 6.50,
    shotSpeed: 1.00,
    luck: 1        // Lucky Foot bonus
  },
  judas: {
    damage: 3.50,  // +2.0 con Book of Belial activo
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  blue_baby: {
    damage: 3.50,
    tears: 1,      // +1 delay = más lento
    speed: 1.10,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  eve: {
    damage: 3.50,  // +0.5 con Whore of Babylon activo
    tears: 0,
    speed: 1.20,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -1
  },
  samson: {
    damage: 3.50,  // +0.2 por cada hit (Bloody Lust)
    tears: 1,      // Más lento
    speed: 1.10,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  azazel: {
    damage: 3.50,  // +1.5 multiplicador Brimstone
    tears: 0,
    speed: 1.25,
    range: 2.50,   // CORTO - Mini Brimstone
    shotSpeed: 1.00,
    luck: 0
  },
  lazarus: {
    damage: 3.50,  // +0.5 tras revivir
    tears: 0,
    speed: 1.00,   // +0.25 tras revivir
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  eden: {
    damage: null,  // Random 2.50-4.50
    tears: null,   // Random -1 a +2
    speed: null,   // Random 0.85-1.35
    range: null,   // Random 4.50-8.50
    shotSpeed: null, // Random 0.85-1.15
    luck: null     // Random -1 a +1
  },
  the_lost: {
    damage: 3.50,
    tears: -1,     // MÁS RÁPIDO
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: -1
  },
  lilith: {
    damage: 3.50,
    tears: 1,      // Más lento (usa Incubus)
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  keeper: {
    damage: 3.50,
    tears: -2,     // MUY LENTO (triple shot compensa)
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
    damage: 3.50,  // Cuerpo a cuerpo = 3x
    tears: -1,     // Swing rápido
    speed: 1.00,   // Soul = 1.25
    range: 0,      // MELEE (Soul = 6.50)
    shotSpeed: 1.00,
    luck: 0
  },
  bethany: {
    damage: 3.50,
    tears: 1,      // Más lento
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
  },
  jacob_esau: {
    // Jacob
    damage: 3.50,
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0,
    // Esau (secondary)
    esau: {
      damage: 3.50,
      tears: -1,   // Más rápido
      speed: 1.10,
      range: 6.50,
      shotSpeed: 1.00,
      luck: 0
    }
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
    damage: 3.50,  // Ataques melee extra
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
    range: 2.50,   // Thin Brimstone
    shotSpeed: 1.00,
    luck: 0
  },
  tainted_lazarus: {
    damage: 3.50,  // Form A
    tears: 0,
    speed: 1.00,
    range: 6.50,
    shotSpeed: 1.00,
    luck: 0
    // Form B tiene stats similares
  },
  tainted_eden: {
    damage: null,  // Cambia cada hit
    tears: null,
    speed: null,
    range: null,
    shotSpeed: null,
    luck: null
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
    tears: 0,      // Whip attack
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
    speed: 1.00,   // Soul controla
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
```

### Componente `<StatBar>` - Diseño

```jsx
/**
 * StatBar - Barra de estadística estilo pixel
 * 
 * Props:
 * - label: string - Nombre de la stat
 * - value: number | null - Valor numérico (null = random)
 * - min: number - Valor mínimo del rango (para calcular %)
 * - max: number - Valor máximo del rango
 * - icon: ReactNode - Icono opcional
 * - tooltip: string - Texto del tooltip
 * - isRandom: boolean - Si es aleatorio (Eden)
 */

// Configuración de rangos por stat
const STAT_RANGES = {
  damage: { min: 2.0, max: 5.0, format: (v) => v.toFixed(2) },
  tears: { min: -2, max: 3, format: (v) => v > 0 ? `+${v}` : v.toString() },
  speed: { min: 0.5, max: 1.5, format: (v) => v.toFixed(2) },
  range: { min: 0, max: 10, format: (v) => v.toFixed(1) },
  shotSpeed: { min: 0.5, max: 1.5, format: (v) => v.toFixed(2) },
  luck: { min: -3, max: 5, format: (v) => v > 0 ? `+${v}` : v.toString() }
};

// Estados visuales
const STAT_STATES = {
  low: 'text-red-600 bg-red-100',      // < 25%
  normal: 'text-text-ink bg-amber-100', // 25-75%
  high: 'text-green-700 bg-green-100',  // > 75%
  random: 'text-purple-600 bg-purple-100 animate-pulse' // Eden
};
```

### Wireframe StatBar

```
┌─────────────────────────────────────────────────────┐
│ [⚔] Damage   ████████████░░░░░░░░░░░░░░   3.50    │
│ [💧] Tears    ██████████░░░░░░░░░░░░░░░░   0       │
│ [👟] Speed    ████████████████░░░░░░░░░░   1.00    │
│ [📏] Range    █████████████████████░░░░░   6.50    │
│ [🎯] Shot Spd █████████████░░░░░░░░░░░░░   1.00    │
│ [🍀] Luck     ████████████░░░░░░░░░░░░░░   0       │
└─────────────────────────────────────────────────────┘

Eden (random):
┌─────────────────────────────────────────────────────┐
│ [⚔] Damage   ░░░░░░░?░░░░░░░░░░░░░░░░░░   ???     │
│              ^^^^^^^^ animación pulse
└─────────────────────────────────────────────────────┘
```

---

## SECCIÓN D — VIDA INICIAL (CORAZONES) + RECURSOS

### Sistema de Corazones en Isaac

| Tipo | Sprite | Valor | Descripción |
|------|--------|-------|-------------|
| Red Heart Container | `Red Heart.png` | 1 container | Puede llenarse/vaciarse |
| Half Red Heart | `Half Red Heart.png` | 0.5 | Medio corazón rojo |
| Soul Heart | `Soul Heart.png` | 0.5 | Corazón temporal, no container |
| Half Soul Heart | `Half Soul Heart.png` | 0.25 | Medio soul |
| Black Heart | `Black Heart.png` | 0.5 | Soul que daña al perderlo |
| Bone Heart | `Bone Heart.png` | 1 container | Puede llenarse con rojos |
| Eternal Heart | `Eternal Heart.png` | 0.5 | Se convierte en container al terminar piso |
| Rotten Heart | `Rotten Heart.png` | 0.5 | Genera moscas al perderlo |
| Gold Heart | `Gold Heart.png` | Overlay | Genera monedas al perderlo |

### Modelo de Datos para Health

```javascript
/**
 * @typedef {Object} HealthConfig
 * @property {number} redContainers - Contenedores rojos (max 12)
 * @property {number} redFilled - Corazones rojos llenos (0-redContainers*2)
 * @property {number} soulHearts - Corazones de alma (en medios)
 * @property {number} blackHearts - Corazones negros (en medios)
 * @property {number} boneHearts - Contenedores de hueso
 * @property {number} boneFilled - Rojos dentro de bone hearts
 * @property {number} eternalHeart - 0 o 1 (máximo 1)
 * @property {number} rottenHearts - Corazones podridos
 * @property {boolean} hasGoldHeart - Overlay dorado en último corazón
 * @property {boolean} canHaveRedHealth - Si puede tener vida roja
 */

export const CHARACTER_STARTING_HEALTH = {
  isaac: {
    redContainers: 3,
    redFilled: 6,        // 3 corazones llenos
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  magdalene: {
    redContainers: 4,
    redFilled: 8,        // 4 corazones llenos
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
    soulHearts: 6,       // 3 soul hearts (6 medios)
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false  // !!!
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
    soulHearts: 2,       // 1 soul heart
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true
  },
  azazel: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 6,      // 3 black hearts
    boneHearts: 0,
    canHaveRedHealth: true  // Puede ganar rojos
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
    // RANDOM - Decidido al iniciar run
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
    hasHolyMantle: true,   // Escudo de 1 hit
    hasSpectralTears: true,
    hasFlight: true
  },
  lilith: {
    redContainers: 1,
    redFilled: 2,
    soulHearts: 0,
    blackHearts: 4,      // 2 black hearts
    boneHearts: 0,
    canHaveRedHealth: true
  },
  keeper: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    coinHearts: 2,       // Sistema especial de monedas
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
    boneHearts: 2,       // 2 bone hearts
    boneFilled: 4,       // Llenos de rojo
    canHaveRedHealth: true,
    hasSoulForm: true
  },
  bethany: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    soulCharges: 4,      // 4 cargas de alma (no corazones)
    canHaveRedHealth: true
  },
  jacob_esau: {
    // Jacob
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    esau: {
      redContainers: 1,
      redFilled: 2,
      soulHearts: 2      // 1 soul heart
    },
    canHaveRedHealth: true
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
    redFilled: 4,        // Solo 2 corazones LLENOS (de 4 containers)
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true,
    healthDrain: true    // Pierde vida constantemente
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
    blackHearts: 4,      // 2 black hearts
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
    blackHearts: 6,      // 3 black hearts
    boneHearts: 0,
    canHaveRedHealth: true
  },
  tainted_lazarus: {
    // Form Alive
    redContainers: 2,
    redFilled: 2,        // Solo 1 corazón lleno de 2
    soulHearts: 0,
    // Form Dead usa soul hearts compartidos
    sharedHealth: true,
    canHaveRedHealth: true
  },
  tainted_eden: {
    redContainers: null,
    redFilled: null,
    soulHearts: null,
    blackHearts: null,
    isRandom: true,
    rerollsOnHit: true,
    canHaveRedHealth: true
  },
  tainted_lost: {
    redContainers: 0,
    redFilled: 0,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false,
    hasHolyMantle: false,  // NO TIENE Holy Mantle
    hasSpectralTears: true,
    hasFlight: true,
    betterItems: true
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
    soulHearts: 6,       // 3 soul hearts (solo el alma)
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: false,  // El cuerpo es invencible
    bodyInvincible: true
  },
  tainted_bethany: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    bloodCharges: 6,     // Cargas de sangre en vez de alma
    canHaveRedHealth: true
  },
  tainted_jacob: {
    redContainers: 3,
    redFilled: 6,
    soulHearts: 0,
    blackHearts: 0,
    boneHearts: 0,
    canHaveRedHealth: true,
    hasDarkEsau: true    // Persigue al jugador
  }
};
```

### Componente `<HeartDisplay>` - Diseño

```jsx
/**
 * HeartDisplay - Muestra la vida inicial de un personaje
 * 
 * Props:
 * - health: HealthConfig
 * - size: 'sm' | 'md' | 'lg' (16/24/32px)
 * - showLabel: boolean
 * - className: string
 */

// Orden de renderizado (igual que el juego)
// 1. Red containers (llenos primero, vacíos después)
// 2. Soul/Black hearts
// 3. Bone hearts (con contenido)
// 4. Especiales (eternal, rotten)

// Sprite paths
const HEART_SPRITES = {
  redFull: '/sprites/6_Environment/Hearts/Red Heart.png',
  redHalf: '/sprites/6_Environment/Hearts/Half Red Heart.png',
  redEmpty: '/sprites/6_Environment/Hearts/Double Heart.png', // Container vacío
  soulFull: '/sprites/6_Environment/Hearts/Soul Heart.png',
  soulHalf: '/sprites/6_Environment/Hearts/Half Soul Heart.png',
  blackFull: '/sprites/6_Environment/Hearts/Black Heart.png',
  boneFull: '/sprites/6_Environment/Hearts/Bone Heart.png',
  eternal: '/sprites/6_Environment/Hearts/Eternal Heart.png',
  rotten: '/sprites/6_Environment/Hearts/Rotten Heart.png',
  gold: '/sprites/6_Environment/Hearts/Gold Heart.png',
  // Keeper coins
  coinFull: '/sprites/6_Environment/Coins/Penny.png',
  coinEmpty: '/sprites/6_Environment/Coins/Penny_Empty.png'
};
```

### Ejemplos Visuales

```
Isaac (3 red):
❤️❤️❤️

Magdalene (4 red):
❤️❤️❤️❤️

Blue Baby (3 soul):
💙💙💙

Azazel (3 black):
🖤🖤🖤

The Forgotten (2 bone filled):
🦴🦴 (con ❤️ adentro)

The Lost (sin vida):
✨ Holy Mantle Shield

Keeper (2 coins):
🪙🪙

Lilith (1 red + 2 black):
❤️🖤🖤

Eden (random):
❓ Aleatorio

T. Magdalene (4 containers, 2 filled):
❤️❤️💔💔 (corazones rotos = vacíos)

Jacob & Esau:
Jacob: ❤️❤️❤️
Esau:  ❤️💙
```

---

## SECCIÓN E — OBJETOS INICIALES (STARTING ITEMS)

### Datos Reales - Starting Items

```javascript
export const CHARACTER_STARTING_ITEMS = {
  isaac: [{
    id: 'd6',
    name: 'The D6',
    type: 'active',
    charges: 6,
    description: 'Rerollea los items en pedestales',
    icon: '/sprites/2_Active Items/D6.png',
    unlockRequired: 'Completa Cathedral con ???'
  }],
  
  magdalene: [{
    id: 'yum_heart',
    name: 'Yum Heart',
    type: 'active',
    charges: 4,
    description: 'Restaura 1 corazón rojo',
    icon: '/sprites/2_Active Items/Yum Heart.png',
    unlockRequired: null
  }],
  
  cain: [{
    id: 'lucky_foot',
    name: 'Lucky Foot',
    type: 'passive',
    description: '+1 Suerte, mejor drop de monedas de máquinas',
    icon: '/sprites/1_Passive Items/Lucky Foot.png',
    unlockRequired: null
  }],
  
  judas: [{
    id: 'book_of_belial',
    name: 'Book of Belial',
    type: 'active',
    charges: 3,
    description: '+2 Daño por habitación, aumenta chance de Devil Deal',
    icon: '/sprites/2_Active Items/Book of Belial.png',
    unlockRequired: null
  }],
  
  blue_baby: [{
    id: 'the_poop',
    name: 'The Poop',
    type: 'active',
    charges: 1,
    description: 'Crea una caca que bloquea proyectiles',
    icon: '/sprites/2_Active Items/Poop.png',
    unlockRequired: null
  }],
  
  eve: [
    {
      id: 'whore_of_babylon',
      name: 'Whore of Babylon',
      type: 'passive',
      description: '+1.5 daño y +0.3 speed cuando HP < 1 corazón',
      icon: '/sprites/1_Passive Items/Whore of Babylon.png',
      unlockRequired: null
    },
    {
      id: 'dead_bird',
      name: 'Dead Bird',
      type: 'passive',
      description: 'Aparece un pájaro que ataca cuando recibes daño',
      icon: '/sprites/1_Passive Items/Dead Bird.png',
      unlockRequired: null
    }
  ],
  
  samson: [{
    id: 'bloody_lust',
    name: 'Bloody Lust',
    type: 'passive',
    description: '+0.2 daño por cada hit recibido (hasta +1.4)',
    icon: '/sprites/1_Passive Items/Bloody Lust.png',
    unlockRequired: null
  }],
  
  azazel: [{
    id: 'mini_brimstone',
    name: 'Mini Brimstone',
    type: 'innate',
    description: 'Disparo corto de Brimstone',
    icon: '/sprites/1_Passive Items/Brimstone.png',
    unlockRequired: null,
    innate: true
  }],
  
  lazarus: [{
    id: 'lazarus_rags',
    name: "Lazarus' Rags",
    type: 'passive',
    description: 'Revive una vez con +0.5 daño y Anemic',
    icon: '/sprites/1_Passive Items/Lazarus Rags.png',
    unlockRequired: null,
    innate: true
  }],
  
  eden: [{
    id: 'random_active',
    name: '??? (Random Active)',
    type: 'active',
    description: 'Item activo aleatorio',
    icon: null,
    isRandom: true
  }, {
    id: 'random_passive',
    name: '??? (Random Passive)',
    type: 'passive',
    description: 'Item pasivo aleatorio',
    icon: null,
    isRandom: true
  }],
  
  the_lost: [
    {
      id: 'eternal_d6',
      name: 'Eternal D6',
      type: 'active',
      charges: 2,
      description: 'Rerollea items, pero puede desaparecer',
      icon: '/sprites/2_Active Items/Eternal D6.png',
      unlockRequired: null
    },
    {
      id: 'holy_mantle',
      name: 'Holy Mantle',
      type: 'passive',
      description: 'Bloquea 1 hit por habitación',
      icon: '/sprites/1_Passive Items/Holy Mantle.png',
      unlockRequired: 'Dona 879 monedas a Greed Machine',
      innate: true
    }
  ],
  
  lilith: [
    {
      id: 'box_of_friends',
      name: 'Box of Friends',
      type: 'active',
      charges: 4,
      description: 'Duplica familiares por 1 habitación',
      icon: '/sprites/2_Active Items/Box of Friends.png',
      unlockRequired: null
    },
    {
      id: 'incubus',
      name: 'Incubus',
      type: 'passive',
      description: 'Familiar que dispara lágrimas (Lilith no dispara)',
      icon: '/sprites/1_Passive Items/Incubus.png',
      unlockRequired: null,
      innate: true
    },
    {
      id: 'cambion_conception',
      name: 'Cambion Conception',
      type: 'passive',
      description: 'Genera familiares al recibir daño',
      icon: '/sprites/1_Passive Items/Cambion Conception.png',
      unlockRequired: null
    }
  ],
  
  keeper: [
    {
      id: 'wooden_nickel',
      name: 'Wooden Nickel',
      type: 'active',
      charges: 1,
      description: '50% de soltar moneda al usar',
      icon: '/sprites/2_Active Items/Wooden Nickel.png',
      unlockRequired: null
    },
    {
      id: 'store_key',
      name: 'Store Key',
      type: 'trinket',
      description: 'Abre shops gratis',
      icon: '/sprites/3_Trinkets/Store Key.png',
      unlockRequired: null
    },
    {
      id: 'triple_shot',
      name: 'Triple Shot',
      type: 'innate',
      description: 'Dispara 3 lágrimas',
      icon: '/sprites/1_Passive Items/Triple Shot.png',
      unlockRequired: null,
      innate: true
    }
  ],
  
  apollyon: [{
    id: 'void',
    name: 'Void',
    type: 'active',
    charges: 6,
    description: 'Absorbe items: pasivos dan stats, activos dan efecto',
    icon: '/sprites/2_Active Items/Void.png',
    unlockRequired: null
  }],
  
  the_forgotten: [
    {
      id: 'bone_club',
      name: 'Bone Club',
      type: 'innate',
      description: 'Ataque melee con hueso (Skeleton form)',
      icon: '/sprites/1_Passive Items/Bone Club.png',
      unlockRequired: null,
      innate: true
    },
    {
      id: 'the_soul',
      name: 'The Soul',
      type: 'innate',
      description: 'Forma alma con lágrimas espectrales',
      icon: null,
      unlockRequired: null,
      innate: true
    }
  ],
  
  bethany: [{
    id: 'book_of_virtues',
    name: 'Book of Virtues',
    type: 'active',
    charges: 4,
    description: 'Crea wisps orbitales. Soul hearts se convierten en cargas.',
    icon: '/sprites/2_Active Items/Book of Virtues.png',
    unlockRequired: null
  }],
  
  jacob_esau: [],  // Sin items iniciales especiales
  
  // === TAINTED ===
  tainted_isaac: [{
    id: 'item_limit',
    name: 'Item Limit',
    type: 'innate',
    description: 'Máximo 8 items pasivos. Los items alternan entre 2 opciones.',
    icon: null,
    innate: true
  }],
  
  tainted_magdalene: [{
    id: 'tainted_yum',
    name: 'Yum Heart',
    type: 'active',
    charges: 2,
    description: 'Versión más débil del Yum Heart',
    icon: '/sprites/2_Active Items/Yum Heart.png'
  }],
  
  tainted_cain: [{
    id: 'bag_of_crafting',
    name: 'Bag of Crafting',
    type: 'active',
    charges: 0,
    description: 'Recoge pickups para craftear items',
    icon: '/sprites/2_Active Items/Bag of Crafting.png'
  }],
  
  tainted_judas: [{
    id: 'dark_arts',
    name: 'Dark Arts',
    type: 'active',
    charges: 2,
    description: 'Tiempo bala + dash que daña',
    icon: '/sprites/2_Active Items/Dark Arts.png'
  }],
  
  tainted_blue_baby: [{
    id: 'hold',
    name: 'Hold',
    type: 'active',
    charges: 0,
    description: 'Guarda caca para lanzar o usar como bomba',
    icon: '/sprites/2_Active Items/Hold.png'
  }],
  
  tainted_eve: [{
    id: 'sumptorium',
    name: 'Sumptorium',
    type: 'active',
    charges: 0,
    description: 'Drena vida para crear coágulos familiares',
    icon: '/sprites/2_Active Items/Sumptorium.png'
  }],
  
  tainted_samson: [{
    id: 'berserk',
    name: 'Berserk!',
    type: 'active',
    charges: 3,
    description: 'Modo furia temporal con hueso melee',
    icon: '/sprites/2_Active Items/Berserk.png'
  }],
  
  tainted_azazel: [{
    id: 'thin_brimstone',
    name: 'Thin Brimstone',
    type: 'innate',
    description: 'Brimstone fino infinito + estornudo daño',
    icon: '/sprites/1_Passive Items/Brimstone.png',
    innate: true
  }],
  
  tainted_lazarus: [{
    id: 'flip',
    name: 'Flip',
    type: 'active',
    charges: 0,
    description: 'Cambia entre formas (comparten items)',
    icon: '/sprites/2_Active Items/Flip.png'
  }],
  
  tainted_eden: [{
    id: 'random_all',
    name: '??? (Random)',
    type: 'innate',
    description: 'TODO es aleatorio. Se rerrollea al recibir daño.',
    icon: null,
    isRandom: true
  }],
  
  tainted_lost: [{
    id: 'holy_card',
    name: 'Holy Card',
    type: 'card',
    description: 'Carta que da Holy Mantle temporal',
    icon: '/sprites/Cards/Holy Card.png'
  }],
  
  tainted_lilith: [{
    id: 'c_section',
    name: 'C Section (Innate)',
    type: 'innate',
    description: 'Feto como látigo de ataque',
    icon: '/sprites/1_Passive Items/C Section.png',
    innate: true
  }],
  
  tainted_keeper: [{
    id: 'coin_health',
    name: 'Coin Health',
    type: 'innate',
    description: 'Vida como monedas. Enemigos DROP monedas.',
    icon: null,
    innate: true
  }],
  
  tainted_apollyon: [{
    id: 'abyss',
    name: 'Abyss',
    type: 'active',
    charges: 0,
    description: 'Absorbe items y crea moscas rojas de ataque',
    icon: '/sprites/2_Active Items/Abyss.png'
  }],
  
  tainted_forgotten: [{
    id: 'throwing_skeleton',
    name: 'Throwing Skeleton',
    type: 'innate',
    description: 'Alma controla, cuerpo es invulnerable y se lanza',
    icon: null,
    innate: true
  }],
  
  tainted_bethany: [{
    id: 'lemegeton',
    name: 'Lemegeton',
    type: 'active',
    charges: 0,
    description: 'Usa cargas de sangre para orbitar items temporales',
    icon: '/sprites/2_Active Items/Lemegeton.png'
  }],
  
  tainted_jacob: [{
    id: 'anima_sola',
    name: 'Anima Sola',
    type: 'active',
    charges: 0,
    description: 'Encadena a Dark Esau temporalmente',
    icon: '/sprites/2_Active Items/Anima Sola.png'
  }]
};
```

### Componente `<ItemCard>` - Diseño

```jsx
/**
 * ItemCard - Muestra un item inicial
 * 
 * Props:
 * - item: ItemData
 * - size: 'sm' | 'md' | 'lg'
 * - showDescription: boolean
 * - linkToItem: boolean (link a página del item)
 * - className: string
 */

// Type badges
const ITEM_TYPE_BADGES = {
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
  passive: { label: 'Passive', color: 'bg-green-100 text-green-700' },
  trinket: { label: 'Trinket', color: 'bg-amber-100 text-amber-700' },
  innate: { label: 'Innate', color: 'bg-purple-100 text-purple-700' },
  card: { label: 'Card', color: 'bg-pink-100 text-pink-700' }
};
```

### Layout Starting Items

```
┌────────────────────────────────────────────────┐
│ Starting Items                                 │
├────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │
│ │ [Icon] The D6                            │   │
│ │ Active · 6 charges                       │   │
│ │ "Rerollea los items en pedestales"       │   │
│ │ 🔓 Unlock: Completar Cathedral con ???   │   │
│ └──────────────────────────────────────────┘   │
│                                                │
│ (Si hay más items, se muestran en fila)       │
└────────────────────────────────────────────────┘

Sin items (Jacob & Esau):
┌────────────────────────────────────────────────┐
│ Starting Items                                 │
├────────────────────────────────────────────────┤
│ Este personaje no empieza con items extra.    │
│ Solo cuenta con sus stats base.               │
└────────────────────────────────────────────────┘
```

---

## SECCIÓN F — DESCRIPCIÓN MEJORADA + PLAYSTYLE

### Datos de Playstyle por Personaje

```javascript
export const CHARACTER_PLAYSTYLE = {
  isaac: {
    difficulty: 1,  // 1-3
    difficultyLabel: 'Fácil',
    summary: 'El personaje equilibrado por excelencia.',
    bullets: [
      'Stats completamente balanceadas, sin debilidades',
      'D6 permite rerollear items malos',
      'Ideal para aprender mecánicas del juego',
      'Puede adaptarse a cualquier build'
    ],
    tip: 'Guarda cargas de D6 para Treasure Rooms. No desperdicies rerolls en items "ok".',
    unlock: null,  // Desbloqueado inicio
    unlockDescription: null
  },
  
  magdalene: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Tanque con vida extra y regeneración.',
    bullets: [
      'Más vida inicial que cualquier otro personaje',
      'Yum Heart permite curarse sin pickups',
      'Ideal para principiantes',
      'Velocidad baja puede ser problemática late-game'
    ],
    tip: 'Busca speed ups para compensar tu velocidad base.',
    unlock: 'Tener 7+ contenedores de corazón rojo en una partida',
    unlockDescription: '7 red heart containers'
  },
  
  cain: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Rápido y con suerte extra.',
    bullets: [
      'Mayor velocidad base',
      '+1 Luck mejora drops y procs',
      'Empieza con llave (acceso a Treasure Room garantizado)',
      'Menos vida que Isaac'
    ],
    tip: 'Usa tu Lucky Foot para farmear máquinas de tragamonedas.',
    unlock: 'Tener 55+ monedas en una partida',
    unlockDescription: '55 coins at once'
  },
  
  judas: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Cañón de cristal - mucho daño, poca vida.',
    bullets: [
      'Solo 1 corazón rojo inicial',
      'Book of Belial da +2 daño temporal',
      'Mayor potencial de daño temprano',
      'Requiere jugar sin recibir hits'
    ],
    tip: 'Book of Belial antes de Boss Rooms. Prioriza soul hearts sobre red hearts.',
    unlock: 'Derrotar a Satan por primera vez',
    unlockDescription: 'Beat Satan'
  },
  
  blue_baby: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'No puede tener vida roja, solo soul hearts.',
    bullets: [
      'Inmune a Devil Deal de vida roja',
      'Soul hearts no se curan con pickups rojos',
      'The Poop es útil para bloquear proyectiles',
      'Devil Deals cuestan soul hearts'
    ],
    tip: 'Busca items que generen soul hearts (Book of Revelations, Dead Dove)',
    unlock: 'Derrotar Mom\'s Heart 10 veces',
    unlockDescription: '10 Mom\'s Heart kills'
  },
  
  eve: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Más poderosa cuando está al límite.',
    bullets: [
      'Whore of Babylon se activa a <1 corazón rojo',
      '+1.5 daño y +0.3 speed en modo "demonio"',
      'Dead Bird ayuda como familiar',
      'Requiere gestión de vida cuidadosa'
    ],
    tip: 'Mantente en 0.5 corazones rojos para maximizar daño. Soul hearts no afectan Whore.',
    unlock: 'Completar 2 pisos sin recoger corazones',
    unlockDescription: '2 floors no hearts'
  },
  
  samson: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Gana daño al recibir golpes.',
    bullets: [
      'Bloody Lust: +0.2 daño por hit (max +1.4)',
      'El daño extra se resetea cada piso',
      'Buenas stats generales',
      'No requiere estrategia especial'
    ],
    tip: 'Si te van a pegar de todas formas, aprovecha para maximizar Bloody Lust antes del boss.',
    unlock: 'Completar 2 pisos sin recibir daño',
    unlockDescription: '2 floors no damage'
  },
  
  azazel: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Modo fácil - vuelo y Brimstone desde el inicio.',
    bullets: [
      'Mini Brimstone de alto daño',
      'Vuelo permite ignorar obstáculos',
      'Solo black hearts (inmune a devil deals)',
      'Rango muy corto requiere acercarse'
    ],
    tip: 'Acércate a los enemigos para maximizar daño. Busca range ups.',
    unlock: 'Hacer 3 Devil Deals en una partida',
    unlockDescription: '3 Devil Deals'
  },
  
  lazarus: {
    difficulty: 1,
    difficultyLabel: 'Fácil',
    summary: 'Revive una vez con stats mejoradas.',
    bullets: [
      'Una vida extra incorporada',
      'Tras revivir: +0.5 daño, +0.25 speed',
      'Anemic deja rastro de sangre',
      'Stats base mediocres antes de morir'
    ],
    tip: 'No desperdicies tu muerte. Muere intencionalmente antes de un boss difícil si tienes vida extra.',
    unlock: 'Tener 4+ soul/black hearts a la vez',
    unlockDescription: '4 soul/black hearts'
  },
  
  eden: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Todo aleatorio - runs nunca repetidos.',
    bullets: [
      'Stats, items y vida completamente random',
      'Cada run requiere adaptación',
      'Cuesta 1 Eden Token por intento',
      'Algunos seeds son imposibles'
    ],
    tip: 'Si empiezas con stats horribles, reinicia (no pierdes token si mueres rápido).',
    unlock: 'Completar el capítulo Womb',
    unlockDescription: 'Complete Womb'
  },
  
  the_lost: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Sin vida - muere de un golpe.',
    bullets: [
      'Vuelo y lágrimas espectrales gratis',
      'Holy Mantle bloquea 1 hit por sala',
      'Devil Deals gratis (no tienes vida que dar)',
      'Eternal D6 para rerolls arriesgados'
    ],
    tip: 'Prioriza damage ups y familiares. Un error = run perdido.',
    unlock: 'Morir en Sacrifice Room con Missing Poster',
    unlockDescription: 'Die in Sacrifice Room with Missing Poster'
  },
  
  lilith: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'No dispara - usa su familiar Incubus.',
    bullets: [
      'Incubus dispara por ti con tus stats',
      'Box of Friends duplica familiares',
      'Cambion Conception genera más familiares',
      'Difícil apuntar sin disparo propio'
    ],
    tip: 'Usa Box of Friends antes de boss rooms. Los familiares duplicados duran toda la sala.',
    unlock: 'Derrotar Ultra Greed con Azazel',
    unlockDescription: 'Beat Ultra Greed as Azazel'
  },
  
  keeper: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Usa monedas como vida - muy difícil.',
    bullets: [
      'Máximo 3 coin hearts (sin upgrades)',
      'Triple shot compensa fire rate bajo',
      'Wooden Nickel genera monedas para curarte',
      'Devil Deals cuestan monedas (vida)'
    ],
    tip: 'Nunca entres a Devil Rooms sin monedas extra. Store Key abre shops gratis.',
    unlock: 'Donar 1000 monedas a Greed Donation Machine',
    unlockDescription: '1000 to Greed Machine'
  },
  
  apollyon: {
    difficulty: 2,
    difficultyLabel: 'Normal', 
    summary: 'Absorbe items para stats o efectos.',
    bullets: [
      'Void absorbe items en pedestales',
      'Pasivos dan stats permanentes',
      'Activos dan su efecto activable',
      'Requiere decisiones sobre qué absorber'
    ],
    tip: 'Absorbe items de stats bajas (polyphemus) antes de tomar items de calidad. Los activos absorbidos se activan al usar Void.',
    unlock: 'Derrotar Mega Satan por primera vez',
    unlockDescription: 'Beat Mega Satan'
  },

  the_forgotten: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Dos personajes en uno - esqueleto y alma.',
    bullets: [
      'Skeleton: melee con hueso (3x daño)',
      'Soul: lágrimas espectrales, más velocidad',
      'Cambio instantáneo entre formas',
      'Bone hearts son difíciles de curar'
    ],
    tip: 'Usa Soul para rooms grandes, Skeleton para Boss fights. El hueso tiene knockback.',
    unlock: 'Completar puzzle de Mom\'s Shovel en Dark Room',
    unlockDescription: 'Shovel puzzle'
  },
  
  bethany: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Soul hearts son cargas de item activo.',
    bullets: [
      'Book of Virtues crea wisps orbitales',
      'Soul hearts se convierten en 4 cargas',
      'Los wisps atacan y bloquean proyectiles',
      'Muy poderosa con items activos combinables'
    ],
    tip: 'Cada item activo genera un wisp único. Busca sinergias con activos.',
    unlock: 'Derrotar Mom\'s Heart en Hard con Lazarus sin morir',
    unlockDescription: 'Hard as Lazarus, no deaths'
  },
  
  jacob_esau: {
    difficulty: 3,
    difficultyLabel: 'Difícil',
    summary: 'Dos personajes con control simultáneo.',
    bullets: [
      'Doble poder de fuego',
      'Doble hitbox (doble riesgo)',
      'Items se recogen individualmente',
      'Gestión de vida separada'
    ],
    tip: 'Mantén a los dos en línea vertical para facilitar esquivar. Da items de damage a uno, health al otro.',
    unlock: 'Derrotar Mother por primera vez',
    unlockDescription: 'Beat Mother'
  },

  // === TAINTED (ejemplos clave) ===
  tainted_lost: {
    difficulty: 3,
    difficultyLabel: 'Muy Difícil',
    summary: 'Lost sin Holy Mantle - un hit = muerte.',
    bullets: [
      'SIN Holy Mantle protector',
      'Better items en item pools',
      'Holy Cards dan mantle temporal',
      'Máxima dificultad del juego'
    ],
    tip: 'Guarda Holy Cards para boss rooms. Literal skill issue.',
    unlock: 'Red Key en Home como The Lost',
    unlockDescription: 'Red Key Home'
  },
  
  tainted_keeper: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Keeper pero enemigos dropean monedas.',
    bullets: [
      'Monedas = vida y economía',
      'Todos los items cuestan monedas',
      'Matar rápido = curarse rápido',
      'Más fácil que Keeper original'
    ],
    tip: 'High DPS = high survivability. Prioriza damage sobre todo.',
    unlock: 'Red Key en Home como Keeper',
    unlockDescription: 'Red Key Home'
  },
  
  tainted_cain: {
    difficulty: 2,
    difficultyLabel: 'Normal',
    summary: 'Craftea cualquier item del juego.',
    bullets: [
      'No puede recoger items normalmente',
      'Bag of Crafting convierte pickups en items',
      'Cualquier item es crafteable',
      'Requiere conocer recetas'
    ],
    tip: 'Usa una calculadora de recetas externa. Puedes romper el juego fácilmente.',
    unlock: 'Red Key en Home como Cain',
    unlockDescription: 'Red Key Home'
  }
};
```

### Componente `<PlaystyleCard>` - Diseño

```jsx
/**
 * PlaystyleCard - Sección de playstyle del personaje
 * 
 * Props:
 * - playstyle: PlaystyleData
 * - characterId: string
 * - isTainted: boolean
 * - className: string
 */

// Indicador de dificultad
const DIFFICULTY_INDICATORS = {
  1: { stars: '★☆☆', label: 'Easy', color: 'text-green-600' },
  2: { stars: '★★☆', label: 'Normal', color: 'text-amber-600' },
  3: { stars: '★★★', label: 'Hard', color: 'text-red-600' }
};
```

### Layout Playstyle

```
┌────────────────────────────────────────────────────────┐
│ Playstyle                                              │
├────────────────────────────────────────────────────────┤
│ ⚖ Dificultad: ★★☆ Normal                              │
│                                                        │
│ Cañón de cristal - mucho daño, poca vida.             │
│                                                        │
│ • Solo 1 corazón rojo inicial                         │
│ • Book of Belial da +2 daño temporal                  │
│ • Mayor potencial de daño temprano                    │
│ • Requiere jugar sin recibir hits                     │
│                                                        │
│ 💡 Book of Belial antes de Boss Rooms. Prioriza      │
│    soul hearts sobre red hearts.                      │
│                                                        │
│ 🔓 Desbloqueo: Derrotar a Satan por primera vez       │
└────────────────────────────────────────────────────────┘
```

---

## SECCIÓN G — COMPLETION MARKS + SELECTOR NORMAL/HARD

### Completion Marks Reales del Juego (12 total)

```javascript
export const COMPLETION_MARKS_CONFIG = {
  // Grid 4x3 exacto del juego
  marks: [
    // Fila 1
    { 
      id: 'heart', 
      bossName: "Mom's Heart", 
      altBossName: 'It Lives',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Moms Heart.png',
      altIcon: '/sprites/4_Bosses/0_Completion Mark Bosses/It Lives.png',
      gridPosition: [0, 0],
      route: 'Depths II',
      tooltipNormal: "Defeat Mom's Heart / It Lives",
      tooltipHard: "Defeat Mom's Heart / It Lives on Hard Mode",
    },
    { 
      id: 'isaac', 
      bossName: 'Isaac',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Isaac.png',
      gridPosition: [0, 1],
      route: 'Cathedral → Isaac',
      tooltipNormal: "Defeat Isaac in the Cathedral",
      tooltipHard: "Defeat Isaac in the Cathedral on Hard Mode",
    },
    { 
      id: 'bluebaby', 
      bossName: '???',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Blue Baby.png',
      gridPosition: [0, 2],
      route: 'The Chest → ???',
      tooltipNormal: "Defeat ??? (Blue Baby) in The Chest",
      tooltipHard: "Defeat ??? (Blue Baby) in The Chest on Hard Mode",
    },
    { 
      id: 'satan', 
      bossName: 'Satan',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Satan.png',
      gridPosition: [0, 3],
      route: 'Sheol → Satan',
      tooltipNormal: "Defeat Satan in Sheol",
      tooltipHard: "Defeat Satan in Sheol on Hard Mode",
    },
    
    // Fila 2
    { 
      id: 'lamb', 
      bossName: 'The Lamb',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/The Lamb.png',
      gridPosition: [1, 0],
      route: 'Dark Room → The Lamb',
      tooltipNormal: "Defeat The Lamb in the Dark Room",
      tooltipHard: "Defeat The Lamb in the Dark Room on Hard Mode",
    },
    { 
      id: 'bossrush', 
      bossName: 'Boss Rush',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Boss Rush.png',
      gridPosition: [1, 1],
      route: 'Depths II (< 20 min)',
      tooltipNormal: "Complete Boss Rush",
      tooltipHard: "Complete Boss Rush on Hard Mode",
    },
    { 
      id: 'hush', 
      bossName: 'Hush',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Hush.png',
      gridPosition: [1, 2],
      route: 'Blue Womb (< 30 min)',
      tooltipNormal: "Defeat Hush in the Blue Womb",
      tooltipHard: "Defeat Hush in the Blue Womb on Hard Mode",
    },
    { 
      id: 'megasatan', 
      bossName: 'Mega Satan',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Mega Satan.png',
      gridPosition: [1, 3],
      route: 'Chest/Dark Room (2 keys)',
      tooltipNormal: "Defeat Mega Satan",
      tooltipHard: "Defeat Mega Satan on Hard Mode",
    },
    
    // Fila 3
    { 
      id: 'delirium', 
      bossName: 'Delirium',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Delirium.png',
      gridPosition: [2, 0],
      route: 'The Void',
      tooltipNormal: "Defeat Delirium in The Void",
      tooltipHard: "Defeat Delirium in The Void on Hard Mode",
    },
    { 
      id: 'mother', 
      bossName: 'Mother',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Mother.png',
      gridPosition: [2, 1],
      route: 'Corpse II (Alt path)',
      tooltipNormal: "Defeat Mother in Corpse II",
      tooltipHard: "Defeat Mother in Corpse II on Hard Mode",
    },
    { 
      id: 'beast', 
      bossName: 'The Beast',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/The Beast.png',
      gridPosition: [2, 2],
      route: 'Home (Ascent)',
      tooltipNormal: "Defeat The Beast in Home",
      tooltipHard: "Defeat The Beast in Home on Hard Mode",
    },
    { 
      id: 'greedier', 
      bossName: 'Greedier',
      altBossName: 'Greed',
      icon: '/sprites/4_Bosses/0_Completion Mark Bosses/Ultra Greedier.png',
      altIcon: '/sprites/4_Bosses/0_Completion Mark Bosses/Ultra Greed.png',
      gridPosition: [2, 3],
      route: 'Greed Mode',
      tooltipNormal: "Complete Greed Mode",  // Greed normal
      tooltipHard: "Complete Greedier Mode", // Greedier (hard greed)
      isGreedMark: true // Marca especial
    },
  ],
  
  // Estados de las marks en el save
  markStatus: {
    NONE: 0,      // No completado
    NORMAL: 1,    // Completado en Normal
    HARD: 2,      // Completado en Hard (marca roja/post-it rojo)
  },
  
  // Modo del selector
  displayModes: ['normal', 'hard', 'greed', 'greedier'],
};
```

### Estructura del Selector

```jsx
/**
 * MarksDisplayMode - Selector de modo de visualización
 * 
 * Modos disponibles:
 * - normal: Muestra marks completadas en Normal (cualquier)
 * - hard: Muestra solo marks Hard (marca roja)
 * - greed: Filtra a Greed Mode (solo marca greed)
 * - greedier: Filtra a Greedier Mode (solo marca greedier)
 * 
 * La marca "greedier" tiene dos estados:
 * - value 1 = Greed completado
 * - value 2 = Greedier completado
 */

const DISPLAY_MODE_OPTIONS = [
  { 
    value: 'normal', 
    label: 'Normal', 
    description: 'Marks completadas (Normal o Hard)'
  },
  { 
    value: 'hard', 
    label: 'Hard', 
    description: 'Solo marks en Hard Mode'
  },
];

// Opción adicional para Greed si se soporta
const GREED_OPTIONS = [
  { 
    value: 'greed', 
    label: 'Greed', 
    description: 'Greed Mode completado'
  },
  { 
    value: 'greedier', 
    label: 'Greedier', 
    description: 'Greedier Mode completado'
  },
];
```

### Lógica de Filtrado por Modo

```javascript
/**
 * Calcula qué marks mostrar según el modo seleccionado
 * 
 * @param {Object} marksData - Datos de marks del personaje
 * @param {string} displayMode - 'normal' | 'hard' | 'greed' | 'greedier'
 * @returns {Object} - Marks filtradas y contador
 */
export function filterMarksByMode(marksData, displayMode) {
  const filtered = {};
  let completed = 0;
  let total = 0;
  
  COMPLETION_MARKS_CONFIG.marks.forEach(mark => {
    const markData = marksData?.marks?.[mark.id];
    const status = markData?.status || 0;
    
    // Caso especial: Greed/Greedier
    if (mark.isGreedMark) {
      if (displayMode === 'greed') {
        // En modo "Greed", status >= 1 cuenta como completado
        filtered[mark.id] = {
          ...markData,
          isCompleted: status >= 1,
          displayStatus: status >= 1 ? 'completed' : 'locked'
        };
        if (status >= 1) completed++;
        total = 1; // Solo 1 mark en este modo
      } else if (displayMode === 'greedier') {
        // En modo "Greedier", solo status 2 cuenta
        filtered[mark.id] = {
          ...markData,
          isCompleted: status === 2,
          displayStatus: status === 2 ? 'completed' : 'locked'
        };
        if (status === 2) completed++;
        total = 1;
      } else {
        // En Normal/Hard, ignorar marca de Greed
        return;
      }
    } else {
      // Marks normales (11)
      if (displayMode === 'greed' || displayMode === 'greedier') {
        // En modos Greed, no mostrar marks normales
        return;
      }
      
      total++;
      
      if (displayMode === 'hard') {
        // Solo contar si status es HARD (2)
        filtered[mark.id] = {
          ...markData,
          isCompleted: status === 2,
          displayStatus: status === 2 ? 'hard' : (status === 1 ? 'normal-only' : 'locked')
        };
        if (status === 2) completed++;
      } else {
        // Normal: contar cualquier completado
        filtered[mark.id] = {
          ...markData,
          isCompleted: status >= 1,
          displayStatus: status === 2 ? 'hard' : (status === 1 ? 'normal' : 'locked')
        };
        if (status >= 1) completed++;
      }
    }
  });
  
  return {
    marks: filtered,
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}
```

### Estados Visuales de Marks

```css
/* Estados de una mark individual */
.mark-locked {
  filter: grayscale(100%) brightness(50%);
  opacity: 0.4;
}

.mark-normal {
  filter: grayscale(30%) brightness(90%);
  opacity: 0.85;
}

.mark-hard {
  filter: none;
  opacity: 1;
  /* Borde dorado/rojo según si es tainted */
}

/* Hover en modo edición */
.mark-editable:hover {
  transform: scale(1.08);
  box-shadow: 0 0 8px var(--color-gold);
}

/* Animación de stamp al marcar */
@keyframes stamp {
  0% { transform: scale(0) rotate(-15deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

.mark-just-completed {
  animation: stamp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Ciclo de Toggle en Edición

```javascript
/**
 * Al hacer click en una mark durante edición:
 * 
 * Ciclo: NONE → HARD → NONE
 * (Simplificado: no hay "solo normal" manual)
 * 
 * Razón: El usuario típicamente quiere marcar "completado Hard"
 * ya que Hard incluye Normal implícitamente en el juego.
 */
function handleMarkToggle(markId) {
  setMarks(prev => {
    const current = prev[markId]?.status || MARK_STATUS.NONE;
    const nextStatus = current === MARK_STATUS.NONE 
      ? MARK_STATUS.HARD 
      : MARK_STATUS.NONE;
    
    return {
      ...prev,
      [markId]: {
        status: nextStatus,
        source: 'manual',
        updatedAt: new Date().toISOString()
      }
    };
  });
}
```

### Componente Actualizado

```jsx
/**
 * CompletionMarksGrid v2 - Con selector de modo
 * 
 * Nuevos props:
 * - displayMode: 'normal' | 'hard' | 'greed' | 'greedier'
 * - onDisplayModeChange: (mode) => void
 * - showGreedModes: boolean (habilitar modos greed)
 */

// Header del panel
<div className="flex items-center justify-between mb-3">
  <div>
    <h4 className="font-heading text-sm">Completion Marks</h4>
    
    {/* NUEVO: Selector de modo */}
    <div className="flex items-center gap-2 mt-1">
      <select 
        value={displayMode}
        onChange={(e) => onDisplayModeChange(e.target.value)}
        className="text-xs bg-transparent border border-border rounded px-2 py-1"
        aria-label="Display mode"
      >
        <option value="normal">Normal</option>
        <option value="hard">Hard</option>
        {showGreedModes && (
          <>
            <option value="greed">Greed</option>
            <option value="greedier">Greedier</option>
          </>
        )}
      </select>
    </div>
  </div>
  
  {/* Contador actualizado según modo */}
  <div className="text-right">
    <span className="text-sm font-bold">
      {filteredData.completed}/{filteredData.total}
    </span>
    <span className="text-xs text-text-dim ml-1">
      {displayMode === 'hard' ? 'hard' : 'completadas'}
    </span>
  </div>
</div>
```

### Indicador de Origen

```
┌────────────────────────────────────┐
│ Completion Marks                   │
│ [Normal ▼]                         │
│ 8/11 completadas                   │
│ ▓▓▓▓▓▓▓▓░░░                        │
│                                    │
│ ┌──┬──┬──┬──┐                      │
│ │♥ │👼│? │☠ │  <- Grid 4x3        │
│ ├──┼──┼──┼──┤                      │
│ │🐑│⏱ │🤫│☠☠│                      │
│ ├──┼──┼──┼──┤                      │
│ │🌀│👁 │🐉│--│  <- Greed hidden   │
│ └──┴──┴──┴──┘                      │
│                                    │
│ [✏ Editar] [💾]                    │
│ 📄 Entrada manual                  │
│    └── o "📥 Importado del save"  │
└────────────────────────────────────┘
```

---

## SECCIÓN H — MODELO DE DATOS (JSON/DB)

### Esquema de Personaje (Contenido Estático)

```typescript
// types/character.ts

interface CharacterBaseStats {
  damage: number | null;      // null = random (Eden)
  tears: number | null;       // Delay value (-2 to +3)
  speed: number | null;
  range: number | null;
  shotSpeed: number | null;
  luck: number | null;
}

interface CharacterHealth {
  redContainers: number;
  redFilled: number;          // In half-hearts
  soulHearts: number;         // In half-hearts
  blackHearts: number;
  boneHearts: number;
  boneFilled?: number;
  coinHearts?: number;        // Keeper
  canHaveRedHealth: boolean;
  isRandom?: boolean;         // Eden
  specialFlags?: {
    hasHolyMantle?: boolean;
    hasFlight?: boolean;
    hasSpectralTears?: boolean;
    healthDrain?: boolean;
    rerollsOnHit?: boolean;
  };
}

interface StartingItem {
  id: string;
  name: string;
  type: 'active' | 'passive' | 'trinket' | 'innate' | 'card';
  charges?: number;           // For actives
  description: string;
  icon: string | null;
  unlockRequired?: string;
  isRandom?: boolean;
  innate?: boolean;           // Can't be lost
}

interface CharacterPlaystyle {
  difficulty: 1 | 2 | 3;
  difficultyLabel: string;
  summary: string;
  bullets: string[];
  tip: string;
  unlock: string | null;
  unlockDescription: string | null;
}

interface Character {
  id: string;                 // 'isaac', 'tainted_isaac'
  name: string;
  isTainted: boolean;
  image: string;              // Sprite path
  
  // Datos de gameplay
  baseStats: CharacterBaseStats;
  startingHealth: CharacterHealth;
  startingItems: StartingItem[];
  
  // Contenido descriptivo
  description: string;        // Short description
  playstyle: CharacterPlaystyle;
  
  // Metadata
  unlockMethod: string;
  order: number;              // Orden en selector
  vanillaCounterpart?: string; // Para tainted, ref al vanilla
}
```

### Esquema de Progreso (Dinámico)

```typescript
// types/userProgress.ts

type MarkStatus = 0 | 1 | 2;  // NONE | NORMAL | HARD

interface MarkData {
  status: MarkStatus;
  source: 'manual' | 'save' | 'merged';
  updatedAt: string;          // ISO timestamp
}

interface CharacterMarks {
  // Mark IDs como keys
  heart: MarkData;
  isaac: MarkData;
  bluebaby: MarkData;
  satan: MarkData;
  lamb: MarkData;
  bossrush: MarkData;
  hush: MarkData;
  megasatan: MarkData;
  delirium: MarkData;
  mother: MarkData;
  beast: MarkData;
  greedier: MarkData;         // status 1 = Greed, 2 = Greedier
}

interface UserCharacterProgress {
  characterId: string;
  marks: CharacterMarks;
  source: 'manual' | 'save' | 'merged';
  lastUpdated: string;
  saveFileHash?: string;      // Hash del save si importado
}

// Schema DB (Supabase)
interface CompletionMarksRow {
  id: string;                 // UUID
  user_id: string;            // FK → auth.users
  character_id: string;       // 'isaac', 'tainted_isaac', etc.
  marks_data: CharacterMarks; // JSONB
  source: 'manual' | 'save' | 'merged';
  save_hash: string | null;
  created_at: string;
  updated_at: string;
}
```

### Ejemplo JSON: Isaac Normal

```json
{
  "id": "isaac",
  "name": "Isaac",
  "isTainted": false,
  "image": "/sprites/0_Characters/0_Vanilla/Isaac.png",
  
  "baseStats": {
    "damage": 3.50,
    "tears": 0,
    "speed": 1.00,
    "range": 6.50,
    "shotSpeed": 1.00,
    "luck": 0
  },
  
  "startingHealth": {
    "redContainers": 3,
    "redFilled": 6,
    "soulHearts": 0,
    "blackHearts": 0,
    "boneHearts": 0,
    "canHaveRedHealth": true
  },
  
  "startingItems": [
    {
      "id": "d6",
      "name": "The D6",
      "type": "active",
      "charges": 6,
      "description": "Rerollea los items en pedestales",
      "icon": "/sprites/2_Active Items/D6.png",
      "unlockRequired": "Completa Cathedral con ???"
    }
  ],
  
  "description": "El personaje base. Estadísticas equilibradas y puede desbloquear el D6.",
  
  "playstyle": {
    "difficulty": 1,
    "difficultyLabel": "Fácil",
    "summary": "El personaje equilibrado por excelencia.",
    "bullets": [
      "Stats completamente balanceadas, sin debilidades",
      "D6 permite rerollear items malos",
      "Ideal para aprender mecánicas del juego",
      "Puede adaptarse a cualquier build"
    ],
    "tip": "Guarda cargas de D6 para Treasure Rooms. No desperdicies rerolls en items 'ok'.",
    "unlock": null,
    "unlockDescription": null
  },
  
  "unlockMethod": "Desbloqueado desde el inicio.",
  "order": 0
}
```

### Ejemplo JSON: Tainted Isaac

```json
{
  "id": "tainted_isaac",
  "name": "Tainted Isaac",
  "isTainted": true,
  "image": "/sprites/0_Characters/1_Tainted/Tainted Isaac.png",
  "vanillaCounterpart": "isaac",
  
  "baseStats": {
    "damage": 3.50,
    "tears": 0,
    "speed": 1.00,
    "range": 6.50,
    "shotSpeed": 1.00,
    "luck": 0
  },
  
  "startingHealth": {
    "redContainers": 3,
    "redFilled": 6,
    "soulHearts": 0,
    "blackHearts": 0,
    "boneHearts": 0,
    "canHaveRedHealth": true
  },
  
  "startingItems": [
    {
      "id": "item_limit",
      "name": "8-Item Limit",
      "type": "innate",
      "description": "Máximo 8 items. Los items alternan entre 2 opciones.",
      "icon": null,
      "innate": true
    }
  ],
  
  "description": "Inventario limitado a 8 items, pero los items alternan entre dos opciones.",
  
  "playstyle": {
    "difficulty": 2,
    "difficultyLabel": "Normal",
    "summary": "Gestión de inventario estratégica.",
    "bullets": [
      "Solo puedes tener 8 items pasivos",
      "Al tomar un 9no, debes soltar uno",
      "Los items en pedestal alternan entre 2 opciones",
      "Requiere conocer qué items valen más"
    ],
    "tip": "Prioriza items de calidad 4. Suelta items de stats bajas por efectos únicos.",
    "unlock": "Usa la Red Key en Home como Isaac",
    "unlockDescription": "Red Key in Home"
  },
  
  "unlockMethod": "Usa la Red Key en el armario de Home jugando como Isaac.",
  "order": 17
}
```

### Ejemplo JSON: Usuario con Marks Mezcladas

```json
{
  "characterId": "isaac",
  "marks": {
    "heart": { "status": 2, "source": "save", "updatedAt": "2026-02-20T10:30:00Z" },
    "isaac": { "status": 2, "source": "save", "updatedAt": "2026-02-20T10:30:00Z" },
    "bluebaby": { "status": 2, "source": "manual", "updatedAt": "2026-02-21T15:45:00Z" },
    "satan": { "status": 2, "source": "save", "updatedAt": "2026-02-20T10:30:00Z" },
    "lamb": { "status": 2, "source": "save", "updatedAt": "2026-02-20T10:30:00Z" },
    "bossrush": { "status": 1, "source": "manual", "updatedAt": "2026-02-22T09:00:00Z" },
    "hush": { "status": 2, "source": "merged", "updatedAt": "2026-02-22T12:00:00Z" },
    "megasatan": { "status": 0, "source": null, "updatedAt": null },
    "delirium": { "status": 2, "source": "save", "updatedAt": "2026-02-20T10:30:00Z" },
    "mother": { "status": 2, "source": "save", "updatedAt": "2026-02-20T10:30:00Z" },
    "beast": { "status": 0, "source": null, "updatedAt": null },
    "greedier": { "status": 1, "source": "manual", "updatedAt": "2026-02-21T18:00:00Z" }
  },
  "source": "merged",
  "lastUpdated": "2026-02-22T12:00:00Z",
  "saveFileHash": "a1b2c3d4e5f6..."
}
```

---

## SECCIÓN I — API CONTRACTS

### Endpoint 1: Importar Save File

```
POST /api/users/:userId/marks/import
```

**Request:**
```http
POST /api/users/uuid-123/marks/import HTTP/1.1
Content-Type: multipart/form-data
Authorization: Bearer <token>
Cache-Control: no-cache

------WebKitFormBoundary
Content-Disposition: form-data; name="saveFile"; filename="rep_persistentgamedata1.dat"
Content-Type: application/octet-stream

<binary data>
------WebKitFormBoundary
Content-Disposition: form-data; name="slot"

1
------WebKitFormBoundary--
```

**Response Success (200):**
```json
{
  "ok": true,
  "source": "save",
  "data": {
    "slot": 1,
    "version": "repentance_plus",
    "fileHash": "sha256-abc123...",
    "parsedAt": "2026-02-23T10:00:00Z",
    "overview": {
      "achievementsUnlocked": 542,
      "totalAchievements": 637,
      "completionPercentage": 85.1
    },
    "characters": {
      "isaac": {
        "marks": {
          "heart": { "status": 2 },
          "isaac": { "status": 2 },
          "bluebaby": { "status": 2 },
          "satan": { "status": 2 },
          "lamb": { "status": 2 },
          "bossrush": { "status": 2 },
          "hush": { "status": 2 },
          "megasatan": { "status": 2 },
          "delirium": { "status": 2 },
          "mother": { "status": 2 },
          "beast": { "status": 2 },
          "greedier": { "status": 2 }
        },
        "completed": 12,
        "hardCompleted": 12,
        "total": 12
      },
      "magdalene": { /* ... */ },
      // ... resto de personajes
    },
    "conflicts": [
      {
        "characterId": "eve",
        "existingSource": "manual",
        "existingMarks": { /* ... */ },
        "saveMarks": { /* ... */ },
        "hasDifferences": true
      }
    ]
  }
}
```

**Response Error - Invalid File (400):**
```json
{
  "ok": false,
  "error_code": "INVALID_FILE",
  "error_message": "El archivo no es un save válido de Isaac Repentance.",
  "details": {
    "expectedFormat": ".dat (rep_persistentgamedata)",
    "receivedSize": 1024,
    "minExpectedSize": 15000
  }
}
```

**Response Error - Parse Failed (422):**
```json
{
  "ok": false,
  "error_code": "PARSE_ERROR",
  "error_message": "No pudimos leer tu save. El archivo puede estar corrupto.",
  "details": {
    "parseStep": "achievements",
    "reason": "Unexpected offset values"
  }
}
```

**Response Error - Empty Save (422):**
```json
{
  "ok": false,
  "error_code": "EMPTY_SAVE",
  "error_message": "El save está vacío o es de una partida nueva.",
  "details": {
    "achievementsFound": 0,
    "completionMarksFound": 0
  }
}
```

**Response Headers:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
X-Parse-Duration-Ms: 45
```

### Endpoint 2: Actualizar Marks Manuales

```
PUT /api/users/:userId/marks/:characterId
```

**Request:**
```http
PUT /api/users/uuid-123/marks/isaac HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "marks": {
    "heart": { "status": 2 },
    "isaac": { "status": 2 },
    "bluebaby": { "status": 2 },
    "satan": { "status": 2 },
    "lamb": { "status": 2 },
    "bossrush": { "status": 0 },
    "hush": { "status": 2 },
    "megasatan": { "status": 0 },
    "delirium": { "status": 1 },
    "mother": { "status": 2 },
    "beast": { "status": 0 },
    "greedier": { "status": 1 }
  },
  "source": "manual"
}
```

**Response Success (200):**
```json
{
  "ok": true,
  "characterId": "isaac",
  "marks": {
    "heart": { "status": 2, "source": "manual", "updatedAt": "2026-02-23T10:05:00Z" },
    "isaac": { "status": 2, "source": "manual", "updatedAt": "2026-02-23T10:05:00Z" },
    /* ... resto */
  },
  "source": "manual",
  "lastUpdated": "2026-02-23T10:05:00Z",
  "completion": {
    "completed": 8,
    "hardCompleted": 6,
    "total": 12,
    "percentage": 67
  }
}
```

**Response Error - Validation (400):**
```json
{
  "ok": false,
  "error_code": "VALIDATION_ERROR",
  "error_message": "Datos de marks inválidos.",
  "details": {
    "invalidFields": ["marks.heart.status"],
    "reason": "Status must be 0, 1, or 2"
  }
}
```

### Endpoint 3: Resolver Conflicto

```
POST /api/users/:userId/marks/:characterId/resolve
```

**Request:**
```http
POST /api/users/uuid-123/marks/eve/resolve HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "resolution": "merge",
  "saveData": { /* marks from save */ },
  "manualData": { /* existing marks */ }
}
```

**resolution options:**
- `"replace"`: Usar solo datos del save, borrar manual
- `"keep"`: Ignorar save, mantener manual
- `"merge"`: Completar faltantes con save, mantener manual si hay conflicto

**Response Success (200):**
```json
{
  "ok": true,
  "characterId": "eve",
  "resolution": "merge",
  "finalMarks": { /* resultado final */ },
  "source": "merged",
  "changes": {
    "updated": ["hush", "delirium"],
    "kept": ["heart", "isaac"],
    "ignored": []
  }
}
```

### Validaciones Backend

```javascript
// Validación de archivo
const FILE_VALIDATIONS = {
  maxSize: 50 * 1024,           // 50KB
  minSize: 15 * 1024,           // 15KB
  allowedExtensions: ['.dat'],
  allowedMimeTypes: ['application/octet-stream'],
};

// Validación de marks
const MARKS_VALIDATIONS = {
  validStatuses: [0, 1, 2],
  validSources: ['manual', 'save', 'merged'],
  requiredMarkIds: [
    'heart', 'isaac', 'bluebaby', 'satan', 'lamb',
    'bossrush', 'hush', 'megasatan', 'delirium',
    'mother', 'beast', 'greedier'
  ],
};

// Validación de character IDs
const VALID_CHARACTER_IDS = [
  'isaac', 'magdalene', 'cain', 'judas', 'blue_baby',
  'eve', 'samson', 'azazel', 'lazarus', 'eden',
  'the_lost', 'lilith', 'keeper', 'apollyon',
  'the_forgotten', 'bethany', 'jacob_esau',
  // Tainted
  'tainted_isaac', 'tainted_magdalene', 'tainted_cain',
  'tainted_judas', 'tainted_blue_baby', 'tainted_eve',
  'tainted_samson', 'tainted_azazel', 'tainted_lazarus',
  'tainted_eden', 'tainted_lost', 'tainted_lilith',
  'tainted_keeper', 'tainted_apollyon', 'tainted_forgotten',
  'tainted_bethany', 'tainted_jacob'
];
```

---

## SECCIÓN J — ESTADOS DE UI + QA

### Estados del Modal

| Estado | Trigger | UI | Acciones disponibles |
|--------|---------|----|--------------------|
| `loading` | Abrir modal sin datos cacheados | Skeleton loader | Ninguna |
| `loaded` | Datos cargados | Modal completo | Ver, cambiar modo |
| `editing` | Click en "Editar" | Marks clickeables, botones Save/Cancel | Toggle marks, guardar, cancelar |
| `saving` | Click en "Guardar" | Spinner en botón, marks deshabilitadas | Ninguna (esperar) |
| `error` | Error de fetch/save | Toast de error | Reintentar, cerrar |

### Estados del Selector de Modo

| Estado | UI |
|--------|-----|
| `closed` | Muestra modo actual como texto/chip |
| `open` | Dropdown con opciones |
| `changing` | Transición suave del grid (150ms) |

### Estados del Import

| Estado | Trigger | UI |
|--------|---------|-----|
| `idle` | Default | Botón "Importar save" |
| `selecting` | Click botón | Input file activo |
| `uploading` | Archivo seleccionado | Progress bar |
| `parsing` | Upload completo | "Leyendo save..." |
| `conflict` | Conflicto detectado | Modal de conflicto |
| `success` | Parse + save OK | Toast éxito, grid actualizado |
| `error` | Error en proceso | Toast error con mensaje |

### Matriz de QA

| Caso | Pasos | Resultado esperado | Prioridad |
|------|-------|-------------------|-----------|
| Cambiar Normal → Hard | Abrir modal, click dropdown, seleccionar Hard | Grid actualiza, contador cambia, scroll NO salta | P0 |
| Editar y guardar | Click Editar, toggle 3 marks, click Guardar | Marks persisten tras cerrar/abrir modal | P0 |
| Editar y cancelar | Click Editar, toggle marks, click Cancelar | Marks vuelven a estado original | P0 |
| Import save nuevo usuario | Usuario sin marks, importar save | Marks se llenan del save, source = "save" | P0 |
| Import con conflicto | Usuario con marks, importar save diferente | Modal conflicto aparece con 3 opciones | P0 |
| Resolver: Reemplazar | En modal conflicto, click Reemplazar | Marks = save data, manual perdido | P1 |
| Resolver: Mantener | En modal conflicto, click Mantener | Marks = manual data, save ignorado | P1 |
| Resolver: Mezclar | En modal conflicto, click Mezclar | Marks = manual + faltantes de save | P1 |
| Error de import | Subir archivo no .dat | Error toast "Archivo no válido" | P1 |
| Navegación teclado | Tab por marks en modo edición | Focus visible en cada mark | P1 |
| ARIA | Lector de pantalla en marks | Lee estado de cada mark correctamente | P2 |
| Responsive móvil | Modal en 375px width | Layout adaptado, dropdown funcional | P1 |
| Rate limit | Guardar 10 veces en 1 segundo | Throttle apropiado, no errores | P2 |

### Accessibility Checklist

- [ ] `role="grid"` en contenedor de marks
- [ ] `role="gridcell"` en cada mark
- [ ] `aria-pressed` en marks (boolean)
- [ ] `aria-label` descriptivo en cada mark
- [ ] `aria-expanded` en dropdown
- [ ] `aria-haspopup="listbox"` en dropdown trigger
- [ ] Focus visible en todos los elementos interactivos
- [ ] Tab order lógico (selector → marks → botones)
- [ ] Escape cierra dropdown y modal
- [ ] Enter/Space activa marks en modo edición

---

## SECCIÓN K — PLAN MVP (1-2 semanas)

### Sprint 1: Stats + Items + Health (3-4 días)

| Tarea | Descripción | Impacto | Dificultad | Estimación |
|-------|-------------|---------|------------|------------|
| K1.1 | Crear `charactersDataComplete.js` con todos los stats reales | Alto | Media | 4h |
| K1.2 | Componente `<StatBar>` con barras pixel | Alto | Baja | 3h |
| K1.3 | Componente `<HeartDisplay>` con sprites | Alto | Media | 4h |
| K1.4 | Componente `<ItemCard>` para starting items | Medio | Baja | 2h |
| K1.5 | Integrar StatBar, HeartDisplay, ItemCard en modal | Alto | Media | 4h |
| K1.6 | Añadir tooltips a stats y items | Medio | Baja | 2h |
| K1.7 | Testing visual + responsive | Alto | Baja | 3h |

**Entregable Sprint 1:** Modal muestra stats reales, vida con iconos, items con descripciones.

### Sprint 2: Completion Marks + Selector (3-4 días)

| Tarea | Descripción | Impacto | Dificultad | Estimación |
|-------|-------------|---------|------------|------------|
| K2.1 | Refactorizar `CompletionMarksGrid` con selector | Alto | Media | 4h |
| K2.2 | Implementar lógica `filterMarksByMode()` | Alto | Media | 3h |
| K2.3 | Añadir iconos reales de bosses | Alto | Baja | 2h |
| K2.4 | Estados visuales locked/normal/hard | Alto | Media | 3h |
| K2.5 | Edición manual con ciclo toggle | Alto | Baja | 2h |
| K2.6 | Animación "stamp" al marcar | Bajo | Baja | 1h |
| K2.7 | Persistencia local (localStorage) | Alto | Baja | 2h |
| K2.8 | Testing QA casos borde | Alto | Media | 3h |

**Entregable Sprint 2:** Selector Normal/Hard funcional, edición manual persiste.

### Sprint 3: Import Save + Conflictos (4-5 días)

| Tarea | Descripción | Impacto | Dificultad | Estimación |
|-------|-------------|---------|------------|------------|
| K3.1 | Endpoint `/marks/import` completo | Alto | Alta | 6h |
| K3.2 | UI de upload con progress | Medio | Media | 3h |
| K3.3 | `ConflictResolutionModal` mejorado | Alto | Media | 4h |
| K3.4 | Lógica de merge en frontend | Alto | Alta | 4h |
| K3.5 | Endpoint `/marks/:charId/resolve` | Alto | Media | 3h |
| K3.6 | Sync con servidor (autenticado) | Alto | Media | 4h |
| K3.7 | Manejo de errores y toasts | Medio | Baja | 2h |
| K3.8 | Testing end-to-end | Alto | Alta | 4h |

**Entregable Sprint 3:** Import save funcional, conflictos se resuelven correctamente.

### Resumen de Impacto

| Funcionalidad | Impacto Usuario | Esfuerzo Dev | Prioridad |
|---------------|-----------------|--------------|-----------|
| Stats reales en UI | ★★★★★ | ★★☆☆☆ | P0 |
| Selector Normal/Hard | ★★★★★ | ★★★☆☆ | P0 |
| Edición manual marks | ★★★★☆ | ★★☆☆☆ | P0 |
| Import save | ★★★★★ | ★★★★☆ | P1 |
| Resolución conflictos | ★★★☆☆ | ★★★★☆ | P1 |
| Modos Greed/Greedier | ★★☆☆☆ | ★★☆☆☆ | P2 |

### Dependencias y Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Iconos de bosses faltan | Media | Medio | Usar fallback texto |
| Parser de save falla en versiones | Media | Alto | Validación estricta + mensaje claro |
| Performance con muchos personajes | Baja | Medio | Lazy loading de datos |
| Accesibilidad compleja en grid | Media | Bajo | Implementar básico primero |

---

## Anexo: Recursos de Sprites

### Paths de Sprites Requeridos

```
/sprites/
├── 0_Characters/
│   ├── 0_Vanilla/
│   │   ├── Isaac.png
│   │   ├── Magdalene.png
│   │   └── ... (17 total)
│   └── 1_Tainted/
│       ├── Tainted Isaac.png
│       └── ... (17 total)
├── 1_Passive Items/
│   ├── D6.png
│   ├── Lucky Foot.png
│   └── ... (733 total)
├── 2_Active Items/
│   ├── D6.png
│   ├── Yum Heart.png
│   └── ...
├── 3_Trinkets/
│   ├── Store Key.png
│   └── ...
├── 4_Bosses/
│   └── 0_Completion Mark Bosses/
│       ├── Moms Heart.png
│       ├── It Lives.png
│       ├── Isaac.png
│       ├── Blue Baby.png
│       ├── Satan.png
│       ├── The Lamb.png
│       ├── Boss Rush.png
│       ├── Hush.png
│       ├── Mega Satan.png
│       ├── Delirium.png
│       ├── Mother.png
│       ├── The Beast.png
│       ├── Ultra Greed.png
│       └── Ultra Greedier.png
└── 6_Environment/
    └── Hearts/
        ├── Red Heart.png
        ├── Half Red Heart.png
        ├── Soul Heart.png
        ├── Half Soul Heart.png
        ├── Black Heart.png
        ├── Bone Heart.png
        ├── Eternal Heart.png
        ├── Rotten Heart.png
        └── Gold Heart.png
```

---

**Fin del documento de especificación.**

*Versión 1.0 - 2026-02-23*
*Para implementación por el equipo de desarrollo.*
