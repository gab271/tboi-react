# The Bounty Board - Premium Companion App Architecture

## Overview
Transformación completa de "The Bounty Board" de una wiki visual a una companion app premium real con gamificación, progreso personal, y herramientas de estrategia.

---

## 📁 Arquitectura de Archivos

```
frontend/src/features/bosses/
├── components/
│   ├── index.js                    # Exports centralizados
│   ├── BossCardEnhanced.jsx        # ⭐ Tarjeta con estados de derrota
│   ├── BossDetailModal.jsx         # ⭐ Modal premium con tabs
│   ├── ProgressHeader.jsx          # ⭐ Barra de progreso del usuario
│   ├── FloorProgressSidebar.jsx    # ⭐ Sidebar con progreso por piso
│   ├── AdvancedFilterBar.jsx       # ⭐ Filtros avanzados + sorting
│   ├── ProFeatures.jsx             # ⭐ Componentes PRO (badges, locks)
│   ├── BossCard.jsx                # Legacy (mantener compatibilidad)
│   ├── BossModal.jsx               # Legacy
│   └── LocationSidebar.jsx         # Legacy
├── context/
│   └── BossProgressContext.jsx     # ⭐ Estado global de progreso
├── hooks/
│   └── useAnimations.js            # ⭐ Animaciones y sonidos
├── types/
│   └── boss.types.js               # ⭐ Tipos y enums
└── data/
    └── bossesData.js               # Datos estáticos (legacy)

frontend/src/pages/bosses/
├── BossesList.jsx                  # Re-export a BossesListPremium
└── BossesListPremium.jsx           # ⭐ Página principal nueva
```

---

## 🎮 Estados de UI Definidos

### Estado de Derrota (DEFEAT_STATUS)
```javascript
NOT_DEFEATED  → Póster limpio, saturado normal
NORMAL        → Sello rojo "DEFEATED"
HARD          → Sello negro "HARD MODE"  
MASTERED      → Póster envejecido + pin dorado
```

### Estados de Carga
```javascript
isLoading     → Spinner skull rotando
hasSaveLoaded → true/false (determina features disponibles)
```

### Estados de Filtro
```javascript
filters: {
  status: 'all' | 'not_defeated' | 'normal' | 'hard' | 'mastered'
  floor: 'all' | 'basement' | 'caves' | ...
}
sortBy: 'default' | 'difficulty_asc' | 'difficulty_desc' | ...
```

---

## 📊 Estructura de Datos

### Boss (Enriquecido)
```typescript
interface Boss {
  id: string;
  name: string;
  image: string;
  health: number;
  location: string;
  altLocations?: string[];
  difficulty: number;          // 1-5
  type: BossType;              // normal | champion | mini | final
  phases: number;
  description: string;
  attack_patterns: AttackPattern[];
  unlocks?: UnlockReward[];
  drops: string[];
  recommendedItems?: string[];
  recommendedCharacters?: string[];
  strategy?: string;
  stats?: BossStats;           // PRO: community data
}

interface AttackPattern {
  name: string;
  description: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  tip?: string;
}

interface BossStats {           // PRO feature
  deathRate: number;           // % jugadores que mueren
  completionRate: number;      // % que han derrotado
  hardModeRate: number;        // % en hard mode
  avgAttempts: number;         // Intentos promedio
}
```

### UserBossProgress
```typescript
interface UserBossProgress {
  bossId: string;
  normalComplete: boolean;
  hardComplete: boolean;
  charactersDefeated: string[];
  firstDefeatDate?: Date;
  attempts?: number;
}
```

### FloorProgress
```typescript
interface FloorProgress {
  floorId: string;
  name: string;
  total: number;
  defeated: number;
  hardComplete: number;
  percentage: number;
}
```

---

## 🎨 Cambios Visuales Detallados

### Header (25% más pequeño)
- Reducido padding vertical
- Título de 6xl → 5xl en desktop
- Subtítulo más compacto

### BossCard Estados
| Estado | Saturación | Efecto Visual |
|--------|-----------|---------------|
| NOT_DEFEATED | 100% | Normal, pin rojo |
| NORMAL | 85% | Sello rojo "DEFEATED" |
| HARD | 85% | Sello negro "HARD MODE" |
| MASTERED | 70% | Envejecido + pin dorado + manchas |

### Progress Header
- Placa de madera con textura
- Barra de progreso estilo papel rasgado
- Skulls como marcadores de hitos (25%, 50%, 75%)
- Goteo de sangre animado

### Modal Premium (5 Tabs)
1. **Overview** - HP, fases, dificultad, descripción
2. **Attacks** - Patrones con nivel de peligro
3. **Stats** - 🔒 PRO: estadísticas de comunidad
4. **Strategy** - 🔒 PRO: builds y personajes recomendados
5. **My Status** - Estado personal + marcar manual

---

## ✨ Animaciones Detalladas

### CSS Keyframes
```css
@keyframes pinned-drop     - Caída con rotación 3D
@keyframes stamp-press     - Estampado con bounce
@keyframes drip            - Goteo de sangre
@keyframes paper-rustle    - Movimiento sutil de papel
@keyframes glow-pulse      - Pulso de glow
```

### Framer Motion Variants
- `pinnedDrop` - Entrada de tarjetas
- `stamp` - Animación de sello al marcar
- `paperSlide` - Deslizar elementos
- `hoverLift` - Elevación en hover
- `pinVibrate` - Vibración del pin

### Interacciones
| Acción | Animación |
|--------|-----------|
| Hover en tarjeta | Elevación + sombra + pin vibra |
| Click en derrotar | Sello estampado |
| Cambio de filtro | Fade suave |
| Abrir modal | Scale + rotate entrada |

---

## 💎 Diferenciación Free vs PRO

### Gratis (Free Tier)
- ✅ Lista completa de bosses
- ✅ Filtros básicos (estado, piso)
- ✅ Ordenar por dificultad/nombre
- ✅ Modal con Overview y Attacks
- ✅ Estado de derrotado (via save o manual)
- ✅ Progreso por piso (sidebar)

### PRO Features
- 🔒 Estadísticas globales (death rate, completion %)
- 🔒 Estrategias recomendadas
- 🔒 Builds óptimos contra cada boss
- 🔒 Ordenar por lethality/community
- 🔒 Predicción de dificultad personalizada
- 🔒 Orden por eficiencia de desbloqueo

### UI de PRO
- Badge "PRO" pequeño, no intrusivo
- Lock icon en secciones bloqueadas
- Preview borroso del contenido PRO
- Banner sutil al final de la página
- Sin paywalls agresivos

---

## 🔧 Componentes a Modificar

### Nuevos (Creados)
1. `BossProgressContext.jsx` - Estado global
2. `ProgressHeader.jsx` - Barra de progreso
3. `BossCardEnhanced.jsx` - Tarjetas mejoradas
4. `AdvancedFilterBar.jsx` - Filtros avanzados
5. `BossDetailModal.jsx` - Modal premium
6. `FloorProgressSidebar.jsx` - Sidebar con progreso
7. `ProFeatures.jsx` - Componentes PRO
8. `useAnimations.js` - Hook de animaciones
9. `boss.types.js` - Tipos y enums
10. `BossesListPremium.jsx` - Página principal

### Modificados
1. `BossesList.jsx` - Re-export a versión premium
2. `en.json` / `es.json` - Traducciones

### Mantenidos (Compatibilidad)
- `BossCard.jsx` - Legacy
- `BossModal.jsx` - Legacy
- `LocationSidebar.jsx` - Legacy

---

## 📱 Responsividad

### Grid de Bosses
| Breakpoint | Columnas |
|------------|----------|
| Mobile (<640px) | 1 |
| Tablet (640-1024px) | 2 |
| Desktop (1024-1280px) | 3 |
| Large (>1280px) | 4 |

### Sidebar
- Desktop: Sticky, siempre visible
- Mobile/Tablet: Drawer desde la derecha

### Hero
- Desktop: 6rem padding
- Mobile: 4rem padding

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│                   BossProgressProvider               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Save Data   │  │ Manual Marks│  │ Combined    │ │
│  │ (API/Save)  │ +│ (localStorage)│ =│ Progress   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   ProgressHeader  BossCardEnhanced  FloorSidebar
   (Overall %)     (Defeat Status)   (Per-floor %)
```

---

## 🚀 Próximos Pasos Sugeridos

1. **Backend**: Endpoint `/api/save/progress` para datos de save parseado
2. **Backend**: Tabla `user_boss_progress` en Supabase
3. **Analytics**: Tracking de boss kills para stats de comunidad
4. **Sonidos**: Agregar archivos de audio en `/public/sounds/`
5. **Testing**: Tests para BossProgressContext
6. **A11y**: Asegurar accesibilidad completa

---

## 📝 Notas de Implementación

- El contexto `BossProgressContext` combina datos del save (API) con marcas manuales
- Las marcas manuales persisten en localStorage para usuarios no logueados
- Los filtros de estado requieren `hasSaveLoaded` para funcionar
- Las animaciones de sonido están deshabilitadas por defecto (toggleable)
- El modal usa `createPortal` para evitar problemas de z-index
- Las traducciones están en inglés y español
