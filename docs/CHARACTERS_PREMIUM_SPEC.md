# Characters Page Premium Spec — De 8/10 a 10/10

> Blueprint completo para elevar la experiencia del carrusel y modal de personajes

---

## PARTE 1 — CARRUSEL CON PROFUNDIDAD REAL

### 1.1 Sistema de Escalado (Depth Scaling)

```
Posición     | Scale  | Blur   | Opacity | Z-Index
-------------|--------|--------|---------|--------
Centro       | 1.0    | 0      | 1.0     | 30
±1 (lateral) | 0.75   | 1px    | 0.85    | 20
±2           | 0.55   | 2px    | 0.6     | 10
±3+          | 0.4    | 3px    | 0.35    | 5
```

### 1.2 Sistema de Profundidad (Pseudo-3D)

```css
/* Simular translateZ con perspective */
.carousel-container {
  perspective: 1000px;
  perspective-origin: 50% 50%;
}

.carousel-item {
  transform-style: preserve-3d;
}

/* Personaje central */
.carousel-item--active {
  transform: translateZ(50px) scale(1);
  box-shadow: 
    0 20px 40px rgba(0,0,0,0.4),
    0 0 60px rgba(139,0,0,0.15); /* tinte blood sutil */
}

/* Laterales: rotación sutil hacia el centro */
.carousel-item--left-1 {
  transform: translateZ(0) scale(0.75) rotateY(8deg);
}
.carousel-item--right-1 {
  transform: translateZ(0) scale(0.75) rotateY(-8deg);
}
```

**Sombra dinámica según posición:**
```javascript
const getShadow = (offset) => {
  const blur = 15 + Math.abs(offset) * 5;
  const spread = Math.max(0, 10 - Math.abs(offset) * 3);
  const opacity = 0.4 - Math.abs(offset) * 0.1;
  return `0 ${blur}px ${blur * 2}px rgba(0,0,0,${opacity})`;
};
```

### 1.3 Animación al Cambiar Personaje

```javascript
const carouselTransition = {
  duration: 280, // ms - snappy, no lento
  easing: [0.33, 1, 0.68, 1], // custom ease-out-quart
  // Alternativa CSS: cubic-bezier(0.33, 1, 0.68, 1)
};

// Paper bounce al entrar al centro
const centerAnimation = {
  scale: [0.95, 1.02, 1],
  rotate: [-1, 0.5, 0],
  transition: {
    duration: 0.3,
    times: [0, 0.6, 1],
  }
};
```

**QUÉ NO HACER:**
- ❌ Duración > 400ms (se siente laggy)
- ❌ ease-in-out (demasiado "Apple", no tiene punch)
- ❌ Bounce exagerado (más de ±2deg de rotación)
- ❌ Spring con mucho rebote (damping < 15)

### 1.4 Fondo Dinámico

```javascript
// Gradiente sutil basado en personaje
const CHARACTER_AURAS = {
  isaac: { hue: 45, saturation: 20 },      // dorado cálido
  azazel: { hue: 0, saturation: 30 },      // rojo
  tainted_lost: { hue: 270, saturation: 25 }, // púrpura
  // etc...
};

// Aplicar con muy baja intensidad
const auraStyle = {
  background: `radial-gradient(
    ellipse 60% 40% at 50% 60%,
    hsla(${hue}, ${saturation}%, 50%, 0.08) 0%,
    transparent 70%
  )`,
  transition: 'background 0.5s ease-out',
};
```

**Reglas de intensidad:**
- Opacity máxima del aura: 0.08-0.12
- Nunca debe competir con el personaje
- Transición lenta (500ms) para evitar parpadeos

### 1.5 Indicador de Progreso en Carrusel

```jsx
// Debajo del nombre del personaje
<div className="carousel-progress">
  <span className="progress-percent">{percentage}%</span>
  <div className="progress-bar">
    <div 
      className="progress-fill"
      style={{ width: `${percentage}%` }}
    />
  </div>
  <span className="progress-marks">{completed}/12</span>
</div>
```

```css
.carousel-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.progress-bar {
  width: 60px;
  height: 4px; /* exactamente 4px, no más */
  background: rgba(0,0,0,0.15);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b0000, #a00);
  border-radius: 2px;
  transition: width 0.4s cubic-bezier(0.33, 1, 0.68, 1);
}

.progress-percent {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  min-width: 28px;
}
```

### 1.6 Navegación

**Flechas:**
```jsx
// Flechas visibles pero sutiles, aparecen más al hover
<button 
  className="carousel-arrow carousel-arrow--left"
  aria-label="Previous character"
>
  <ChevronLeft />
</button>
```

```css
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.4;
  transition: opacity 0.2s, transform 0.2s;
  cursor: pointer;
  padding: 12px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(4px);
  border-radius: 50%;
}

.carousel-arrow:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow--left { left: 20px; }
.carousel-arrow--right { right: 20px; }
```

**Hover lateral (zones):**
```jsx
// Zonas invisibles para navegar con hover
<div 
  className="carousel-hover-zone carousel-hover-zone--left"
  onMouseEnter={() => setHoverNav('left')}
  onMouseLeave={() => setHoverNav(null)}
/>
```

**Teclado:**
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    switch(e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeChar) openModal(activeChar);
        break;
      case 'Escape':
        if (isModalOpen) closeModal();
        break;
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [activeIndex, isModalOpen]);
```

**Accesibilidad:**
```jsx
<div 
  role="listbox"
  aria-label="Character selector"
  aria-activedescendant={`char-${activeChar.id}`}
  tabIndex={0}
>
  {characters.map((char, i) => (
    <div
      key={char.id}
      id={`char-${char.id}`}
      role="option"
      aria-selected={i === activeIndex}
      aria-label={`${char.name}, ${char.percentage}% complete`}
    />
  ))}
</div>
```

---

## PARTE 2 — MODAL DE PERSONAJE (DETALLE PREMIUM)

### 2.1 Bloque "Starting Stats" Mejorado

**Opción A: Mini Cards Pixel**
```jsx
<div className="stats-grid">
  {[
    { icon: <HeartIcon />, label: "HP", value: character.health },
    { icon: <CoinIcon />, label: "Coins", value: character.coins },
    { icon: <BombIcon />, label: "Bombs", value: character.bombs },
    { icon: <KeyIcon />, label: "Keys", value: character.keys },
  ].map(stat => (
    <div key={stat.label} className="stat-card">
      <div className="stat-icon">{stat.icon}</div>
      <div className="stat-value">{stat.value}</div>
      <div className="stat-label">{stat.label}</div>
    </div>
  ))}
</div>
```

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: rgba(0,0,0,0.03);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 4px;
  transition: transform 0.15s, box-shadow 0.15s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 6px;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-ink);
}

.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}
```

### 2.2 Completion Marks Realistas

**Estados visuales:**
```css
/* Locked (no completado) */
.mark-cell--locked {
  filter: grayscale(1) brightness(0.4);
  opacity: 0.5;
}

/* Unlocked Normal */
.mark-cell--normal {
  filter: none;
  opacity: 1;
}

/* Unlocked Hard - efecto tinta roja */
.mark-cell--hard {
  filter: none;
  opacity: 1;
  box-shadow: 
    inset 0 0 0 2px rgba(139, 0, 0, 0.6),
    0 0 8px rgba(139, 0, 0, 0.3);
}

/* Hover (todos) */
.mark-cell:hover:not(:disabled) {
  transform: scale(1.08);
  z-index: 10;
}

/* Edit mode indicator */
.mark-cell--editing {
  animation: pulse-edit 1.5s ease-in-out infinite;
}

@keyframes pulse-edit {
  0%, 100% { box-shadow: 0 0 0 2px rgba(218, 165, 32, 0.3); }
  50% { box-shadow: 0 0 0 4px rgba(218, 165, 32, 0.5); }
}
```

**Animación "stamp" al desbloquear:**
```javascript
const stampAnimation = {
  initial: { scale: 2, opacity: 0, rotate: -15 },
  animate: { 
    scale: [2, 0.9, 1],
    opacity: [0, 1, 1],
    rotate: [-15, 3, 0],
  },
  transition: {
    duration: 0.4,
    times: [0, 0.6, 1],
    ease: [0.34, 1.56, 0.64, 1], // bounce
  }
};
```

**Tooltip con info del boss:**
```jsx
<Tooltip 
  content={
    <div className="mark-tooltip">
      <img src={mark.icon} alt="" className="tooltip-icon" />
      <div className="tooltip-info">
        <strong>{mark.label}</strong>
        <span>{mark.description}</span>
        {mark.status === MARK_STATUS.HARD && (
          <span className="tooltip-mode">✓ Hard Mode</span>
        )}
      </div>
    </div>
  }
>
  {/* mark cell */}
</Tooltip>
```

**Header con contador y barra:**
```jsx
<div className="marks-header">
  <h4>Completion Marks</h4>
  <div className="marks-counter">
    <span className="counter-value">{completed}</span>
    <span className="counter-separator">/</span>
    <span className="counter-total">{total}</span>
  </div>
</div>
<div className="marks-progress-bar">
  <div 
    className="marks-progress-fill"
    style={{ width: `${percentage}%` }}
  />
</div>
```

```css
.marks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.marks-progress-bar {
  height: 3px;
  background: rgba(0,0,0,0.1);
  border-radius: 2px;
  margin-bottom: 12px;
  overflow: hidden;
}

.marks-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b0000, #b00);
  transition: width 0.4s ease-out;
}
```

### 2.3 Modo Edición Manual

```jsx
const [isEditing, setIsEditing] = useState(false);

// Toggle button
<button 
  className={cn("edit-toggle", isEditing && "edit-toggle--active")}
  onClick={() => setIsEditing(!isEditing)}
>
  {isEditing ? (
    <>
      <FaSave /> Save
    </>
  ) : (
    <>
      <FaPencilAlt /> Edit
    </>
  )}
</button>

// Source indicator
{source === 'save' && (
  <div className="source-badge" title="Imported from save file">
    <FaUpload /> From Save
  </div>
)}
{source === 'manual' && (
  <div className="source-badge source-badge--manual">
    <FaHand /> Manual
  </div>
)}
```

### 2.4 Microinteracciones

**Hover sobre iconos:**
```css
.mark-cell {
  transition: transform 0.15s, filter 0.15s, box-shadow 0.15s;
}

.mark-cell:hover {
  transform: scale(1.1) translateY(-2px);
}
```

**Click feedback:**
```javascript
// Haptic-like visual feedback
const handleClick = (markId) => {
  // Micro-shake
  const el = document.getElementById(`mark-${markId}`);
  el.classList.add('mark-clicked');
  setTimeout(() => el.classList.remove('mark-clicked'), 150);
  
  // Then toggle
  toggleMark(markId);
};
```

```css
.mark-clicked {
  animation: mark-tap 0.15s ease-out;
}

@keyframes mark-tap {
  0% { transform: scale(1); }
  50% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
```

**Sonido opcional:**
```javascript
// Usar Web Audio API para sonidos cortos
const playSound = (type) => {
  if (!userPrefersSound) return;
  
  const sounds = {
    toggle: '/sounds/mark-toggle.mp3',
    unlock: '/sounds/stamp.mp3',
  };
  
  const audio = new Audio(sounds[type]);
  audio.volume = 0.3;
  audio.play();
};
```

**Límites de animación:**
- Hover: máximo 150ms
- Click: máximo 150ms
- Stamp: máximo 400ms
- Transitions: máximo 300ms

---

## PARTE 3 — DATOS DE PROGRESO EN CARRUSEL

### 3.1 Estructura JSON

```typescript
interface CharacterProgress {
  id: string;                    // "isaac" | "tainted_isaac" | etc
  marksCompleted: number;        // 0-12
  totalMarks: number;            // 12 (constante)
  percentage: number;            // 0-100
  marks: Record<MarkId, MarkData>; // detalle por mark
  source: 'manual' | 'save' | 'merged';
  updatedAt: string;             // ISO timestamp
}

interface MarkData {
  status: 0 | 1 | 2;  // none | normal | hard
  source: 'manual' | 'save';
  updatedAt: string;
}
```

### 3.2 Cálculo de Progreso

```javascript
const calculateProgress = (marks) => {
  const total = 12;
  const completed = Object.values(marks).filter(m => m.status > 0).length;
  const hardCompleted = Object.values(marks).filter(m => m.status === 2).length;
  
  return {
    completed,
    total,
    hardCompleted,
    percentage: Math.round((completed / total) * 100),
    isFullyComplete: completed === total,
    isFullyHard: hardCompleted === total,
  };
};
```

### 3.3 Renderizado Eficiente

```jsx
// Memoizar datos procesados
const characterProgressMap = useMemo(() => {
  return characters.reduce((acc, char) => {
    const marks = allMarks[char.id] || createEmptyMarks(char.id);
    acc[char.id] = calculateProgress(marks.marks);
    return acc;
  }, {});
}, [characters, allMarks]);

// Solo re-renderizar item visible
const CarouselItem = memo(({ character, progress, isActive }) => {
  // ...
}, (prev, next) => {
  return prev.character.id === next.character.id &&
         prev.progress.percentage === next.progress.percentage &&
         prev.isActive === next.isActive;
});
```

### 3.4 Evitar Re-renders

```javascript
// 1. Usar React.memo en items individuales
// 2. Extraer callbacks fuera del render
// 3. Usar useCallback para handlers
// 4. Context separado para marks vs UI state

// ❌ MAL
<CarouselItem onClick={() => handleSelect(char)} />

// ✅ BIEN
const handleSelect = useCallback((charId) => {
  setSelected(charId);
}, []);

<CarouselItem onClick={handleSelect} charId={char.id} />
```

### 3.5 Animar Porcentaje

```jsx
// Usar spring para animar número
import { useSpring, animated } from '@react-spring/web';

const AnimatedPercent = ({ value }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    config: { tension: 120, friction: 14 },
  });
  
  return (
    <animated.span>
      {number.to(n => Math.round(n))}%
    </animated.span>
  );
};
```

---

## PARTE 4 — DETALLES 10/10

### 5 Micro Detalles Premium

1. **Sombra de tinta en marks completados**
   ```css
   .mark-cell--hard::after {
     content: '';
     position: absolute;
     inset: -2px;
     background: radial-gradient(
       circle at 70% 30%,
       rgba(139, 0, 0, 0.15) 0%,
       transparent 60%
     );
     pointer-events: none;
   }
   ```

2. **Micro-rotación en cards al hover**
   ```css
   .stat-card:hover {
     transform: translateY(-2px) rotate(0.5deg);
   }
   ```

3. **Número animado con overshoot**
   ```javascript
   config: { tension: 180, friction: 12 } // slight overshoot
   ```

4. **Efecto "paper lift" en personaje activo**
   ```css
   .carousel-item--active {
     box-shadow: 
       0 1px 1px rgba(0,0,0,0.08),
       0 2px 2px rgba(0,0,0,0.08),
       0 4px 4px rgba(0,0,0,0.08),
       0 8px 8px rgba(0,0,0,0.08),
       0 16px 16px rgba(0,0,0,0.08);
   }
   ```

5. **Subtle grain texture overlay**
   ```css
   .modal-paper::before {
     content: '';
     position: absolute;
     inset: 0;
     background-image: url('/textures/paper-grain.png');
     opacity: 0.03;
     pointer-events: none;
     mix-blend-mode: multiply;
   }
   ```

### Animaciones a EVITAR

- ❌ Bounce excesivo (damping < 10)
- ❌ Duración > 500ms en cualquier micro-interacción
- ❌ Rotaciones > 5deg
- ❌ Escala > 1.15x
- ❌ Delays sin propósito
- ❌ Animaciones en cadena sin control del usuario

### Errores Amateur a Evitar

- ❌ Todos los elementos animados al mismo tiempo
- ❌ Inconsistencia en timings (unos 200ms, otros 500ms)
- ❌ Hover effects demasiado agresivos
- ❌ Feedback visual tardío (> 100ms después del click)
- ❌ Animaciones que bloquean interacción
- ❌ Transiciones que no respetan prefers-reduced-motion

### Coherencia con el Resto

```css
/* Usar variables globales existentes */
--font-heading: 'Your-Isaac-Font';
--font-handwriting: 'Your-Handwriting-Font';
--text-ink: #1a1a1a;
--bg-paper: #f5f0e1;
--accent-blood: #8b0000;
--accent-gold: #daa520;

/* Mismos easing curves en toda la app */
--ease-out-quart: cubic-bezier(0.33, 1, 0.68, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## PARTE 5 — CHECKLIST FINAL

### Carrusel ✓

- [ ] Escalado 5 niveles definido
- [ ] Sombra dinámica por posición
- [ ] Animación 280ms ease-out-quart
- [ ] Paper bounce en centro
- [ ] Fondo dinámico opacity < 0.12
- [ ] Progress bar altura 4px exactos
- [ ] Flechas con fade-in al hover
- [ ] Soporte ←→ Enter Esc
- [ ] ARIA roles correctos
- [ ] No re-renders innecesarios

### Modal ✓

- [ ] Stats en mini cards 4 columnas
- [ ] Marks con 3 estados visuales
- [ ] Stamp animation al unlock
- [ ] Tooltips con info boss
- [ ] Header contador + barra 3px
- [ ] Toggle edit mode claro
- [ ] Source badge visible
- [ ] Click feedback < 150ms
- [ ] Sonido opcional toggle

### Performance ✓

- [ ] React.memo en carousel items
- [ ] useCallback en handlers
- [ ] useMemo en cálculos
- [ ] No animaciones en mount
- [ ] prefers-reduced-motion respetado

### Calidad 10/10 ✓

- [ ] 5 micro-detalles implementados
- [ ] Sin animaciones > 500ms
- [ ] Coherencia con design system
- [ ] Accesibilidad completa
- [ ] Mobile responsive
- [ ] Sin errores en console
