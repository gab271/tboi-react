# THE COLLECTION LAB - Documentación Técnica

## Arquitectura del Sistema

### Visión General

EL **Collection Lab** es una transformación completa de la página "THE COLLECTION" en un Laboratorio Estratégico Premium para The Binding of Isaac. Permite a los usuarios:

1. **Explorar** - Navegar la colección con filtros inteligentes
2. **Experimentar** - Construir builds con cálculo acumulativo de stats
3. **Comparar** - Analizar items side-by-side (PRO)
4. **Analizar** - Ver estadísticas globales de la comunidad (PRO)

---

## Estructura de Archivos

```
frontend/src/features/collection-lab/
├── index.js                    # Exportaciones públicas
├── CollectionLab.jsx           # Página principal
├── context/
│   └── BuildLabContext.jsx     # Estado global del Build Lab
├── hooks/
│   ├── useBuildLab.js          # Hook principal con cálculos
│   ├── useInfiniteItems.js     # Paginación infinita
│   ├── useItemEffects.js       # Efectos de items
│   └── useUserItemProgress.js  # Progreso del usuario
├── components/
│   ├── BuildLabBar.jsx         # Barra de items seleccionados
│   ├── BuildStatsPanel.jsx     # Panel de stats calculadas
│   ├── BuildItemSlot.jsx       # Slot individual de item
│   ├── LabItemCard.jsx         # Tarjeta de item con hover
│   ├── LabItemGrid.jsx         # Grid responsive
│   ├── ItemHoverCard.jsx       # Hover card premium
│   ├── ItemProgressOverlay.jsx # Overlay de progreso
│   ├── AdvancedFilters.jsx     # Sidebar de filtros
│   ├── SmartFilterBar.jsx      # Barra de filtros rápidos
│   ├── ItemCompareModal.jsx    # Modal de comparación
│   └── GlobalStatsPanel.jsx    # Panel de stats globales
├── lib/
│   ├── effectCalculator.js     # Motor de cálculo de efectos
│   └── filterEngine.js         # Motor de filtros inteligentes
├── api/
│   └── collectionLabApi.js     # Funciones API
└── styles/
    └── lab.css                 # Estilos y animaciones
```

---

## Motor de Cálculo Acumulativo

### Constantes Base

```javascript
const BASE_STATE = {
  damage: 3.5,          // Daño base de Isaac
  tears: 2.73,          // Lágrimas por segundo base
  range: 6.5,           // Rango en tiles
  shotSpeed: 1.0,       // Velocidad de disparo
  luck: 0,              // Suerte
  speed: 1.0,           // Velocidad de movimiento
  modifiers: {
    damageMultiplier: 1.0,
    tearsMultiplier: 1.0,
    critChance: 0,
    critDamage: 1.5,
    homingStrength: 0,
    piercing: false,
    spectral: false,
    explosiveTears: false,
    chargeTime: 0,
    orbitalDamage: 0,
    orbitalCount: 0,
    shieldStrength: 0
  },
  transformations: {},
  tearTypes: [],
  onHitEffects: [],
  specialEffects: []
};
```

### Fórmula de DPS

```javascript
function calculateDPS(state) {
  const baseDamage = state.damage * state.modifiers.damageMultiplier;
  const tearRate = state.tears * state.modifiers.tearsMultiplier;
  
  // Factor de efecto especial
  let effectMultiplier = 1.0;
  if (state.modifiers.piercing) effectMultiplier *= 1.15;
  if (state.modifiers.spectral) effectMultiplier *= 1.05;
  if (state.modifiers.homingStrength > 0) effectMultiplier *= (1 + state.modifiers.homingStrength * 0.2);
  if (state.modifiers.explosiveTears) effectMultiplier *= 1.25;
  
  // Críticos
  const critFactor = 1 + (state.modifiers.critChance * (state.modifiers.critDamage - 1));
  
  // Orbitales
  const orbitalDPS = state.modifiers.orbitalCount * state.modifiers.orbitalDamage * 2;
  
  return ((baseDamage * tearRate * effectMultiplier * critFactor) + orbitalDPS);
}
```

### Transformaciones

```javascript
const TRANSFORMATION_THRESHOLDS = {
  guppy: { required: 3, name: "Guppy", effect: "Spawns flies on hit" },
  beelzebub: { required: 3, name: "Beelzebub", effect: "Flight + fly allies" },
  spunky: { required: 3, name: "Spunky", effect: "+2 damage" },
  funguy: { required: 3, name: "Fun Guy", effect: "+HP" },
  seeingDouble: { required: 3, name: "Seraphim", effect: "Flight + holy light" },
  bobsTransformation: { required: 3, name: "Bob's Transformation", effect: "Poison immunity" },
  leviathan: { required: 3, name: "Leviathan", effect: "+2 black hearts" },
  ohCrap: { required: 3, name: "Oh Crap!", effect: "Poop healing" },
  bookworm: { required: 3, name: "Bookworm", effect: "Triple shot chance" },
  adulthood: { required: 3, name: "Stompy", effect: "Destroy rocks on walk" },
  superBum: { required: 3, name: "Super Bum", effect: "Mega bum familiar" },
  conjoined: { required: 3, name: "Conjoined", effect: "Triple shot" },
  leanbean: { required: 3, name: "Leanbean", effect: "Fart cloud trail" }
};
```

---

## Sistema de Filtros Inteligentes

### Categorías de Filtros

| Categoría | Filtros |
|-----------|---------|
| **Damage** | `high_damage` (+2), `shotspeed_synergy`, `multiplier` |
| **Tears** | `tears_up`, `multishot`, `brimstone_synergy` |
| **Effects** | `homing`, `spectral`, `piercing`, `explosive` |
| **Transformation** | `guppy_item`, `fly_item`, `angel_item`, `devil_item` |
| **Stats** | `all_stats`, `speed`, `range`, `luck` |
| **Phase** | `early_game`, `late_game`, `boss_killer` |
| **Risk** | `safe`, `risky`, `health_cost` |

### Ejemplo de Filtro

```javascript
const SMART_FILTERS = {
  high_damage: {
    id: 'high_damage',
    label: 'High Damage',
    description: 'Items that give +2 or more damage',
    category: 'damage',
    evaluate: (item) => {
      const dmg = item.effects?.find(e => e.stat === 'damage');
      return dmg && dmg.value >= 2;
    },
    priority: 10
  }
};
```

---

## Estados UI

### Estados de ItemCard

| Estado | Visual | Trigger |
|--------|--------|---------|
| `default` | Normal | Ninguno |
| `selected` | Borde verde, icono ✓ | Click en Build Lab mode |
| `compare` | Borde azul, badge A/B | Click en Compare mode |
| `frequent` | Glow dorado sutil | `usageCount > 5` |
| `locked` | Opacidad reducida, candado | Item no desbloqueado |
| `god-tier` | Shimmer border | `quality === 4` |

### Estados de Build

| Rating | Rango DPS | Color |
|--------|-----------|-------|
| D | < 15 | Gris |
| C | 15-30 | Blanco |
| B | 30-50 | Azul |
| A | 50-80 | Púrpura |
| S | > 80 | Dorado |

---

## Modelo de Monetización

### FREE Tier

```javascript
features: [
  'collection_lab_view',      // Ver colección
  'build_lab_basic',          // Build Lab con límites
  'smart_filters_basic',      // Filtros básicos
  'hover_card_basic'          // Hover card simplificado
],
limits: {
  buildLabItems: 5            // Máximo 5 items por build
}
```

### PRO Tier

```javascript
features: [
  'build_lab_unlimited',      // Sin límite de items
  'item_compare',             // Comparar 2 items
  'smart_filters_full',       // Todos los filtros
  'global_stats',             // Stats de la comunidad
  'hover_card_full',          // Hover card completo
  'item_recommendations'      // Recomendaciones AI
],
limits: {
  buildLabItems: Infinity
}
```

### SUPPORTER Tier

```javascript
features: [
  ...PRO_FEATURES,
  'early_features',           // Features beta
  'supporter_badge',          // Badge especial
  'priority_support'          // Soporte prioritario
]
```

---

## API Endpoints

### Existentes

- `GET /api/items` - Lista paginada de items
- `GET /api/items/:id` - Detalle de item
- `POST /api/synergies/analyze` - Análisis de sinergias

### Nuevos (a implementar)

```javascript
// Estadísticas globales de un item
GET /api/items/:id/stats
Response: {
  pickRate: 0.23,
  winRate: 0.67,
  avgFloorPicked: 3.2,
  topSynergies: [...],
  communityRating: 4.2
}

// Progreso del usuario
GET /api/users/:id/item-progress
Response: {
  unlocked: ["item_1", "item_2", ...],
  usageCounts: { item_1: 15, item_2: 3 },
  favorites: ["item_5", "item_10"]
}

// Comparación server-side (PRO)
POST /api/synergies/compare
Body: { itemA: "item_1", itemB: "item_2", currentBuild: [...] }
Response: {
  itemA: { impact: {...}, score: 85 },
  itemB: { impact: {...}, score: 72 },
  recommendation: "itemA"
}
```

---

## Animaciones

### CSS Keyframes

| Animación | Duración | Uso |
|-----------|----------|-----|
| `itemAdded` | 0.4s | Item añadido al Build Lab |
| `itemRemoved` | 0.3s | Item eliminado del Build Lab |
| `statPulse` | 0.3s | Stat actualizada |
| `frequentGlow` | 3s infinite | Items frecuentes |
| `transformComplete` | 0.6s | Transformación completada |
| `ratingUpgrade` | 0.4s | Rating mejorado |
| `shimmer` | 2s infinite | Items quality 4 |

### Framer Motion Variants

```javascript
// Grid items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } }
};

// Build Lab bar items
const slotVariants = {
  initial: { scale: 0, rotate: -10 },
  animate: { scale: 1, rotate: 0 },
  exit: { scale: 0, rotate: 10 }
};
```

---

## Performance

### Optimizaciones Implementadas

1. **Infinite Scroll** - Carga bajo demanda con `useInfiniteQuery`
2. **Memoización** - `useMemo` para cálculos pesados
3. **Debounce** - Búsqueda con debounce de 300ms
4. **Virtual DOM** - Solo renderiza items visibles
5. **Image Lazy Loading** - Sprites cargados con `loading="lazy"`

### Métricas Target

| Métrica | Objetivo |
|---------|----------|
| First Paint | < 1.5s |
| Time to Interactive | < 3s |
| Build Recalculation | < 50ms |
| Filter Application | < 100ms |

---

## Testing

### Unit Tests Requeridos

```javascript
// effectCalculator.test.js
describe('calculateBuildState', () => {
  test('should apply damage flat bonuses');
  test('should apply damage multipliers');
  test('should track transformations');
  test('should calculate DPS correctly');
});

// filterEngine.test.js
describe('applySmartFilters', () => {
  test('should filter by damage');
  test('should filter by transformation');
  test('should combine multiple filters');
});
```

### Integration Tests

```javascript
// CollectionLab.test.jsx
describe('CollectionLab', () => {
  test('should render in collection mode by default');
  test('should switch to build lab mode');
  test('should add items to build');
  test('should show PRO features only for subscribers');
});
```

---

## Migración

### Desde ItemsList.jsx

El componente `CollectionLab` reemplaza completamente a `ItemsList`:

```jsx
// Antes (App.jsx)
<Route path="items" element={<ItemsList />} />

// Después (App.jsx)
<Route path="items" element={<CollectionLab />} />
```

### Fallback

En caso de problemas, revertir a:

```jsx
import { ItemsList } from './pages/items/ItemsList'
<Route path="items" element={<ItemsList />} />
```

---

## Próximos Pasos

1. **Backend Endpoints** - Implementar endpoints de stats y progreso
2. **Real Data** - Conectar con backend real de items
3. **A/B Testing** - Medir conversión Free → PRO
4. **Mobile Optimization** - Mejorar UX en dispositivos móviles
5. **Offline Support** - Cache de datos para offline
