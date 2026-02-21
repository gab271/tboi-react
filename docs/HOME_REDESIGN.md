# HOME HÍBRIDA — DOCUMENTO DE PRODUCTO
> Isaac Companion → Dead God Tracker + Hub de Comunidad

---

## RESUMEN EJECUTIVO

### Cambio principal
De **"Home minimalista de 1 función"** a **"Home híbrida: Landing + Hub + Portal"**

### Tipos de usuario que atiende:
| Usuario | Necesidad | Cómo la home lo resuelve |
|---------|-----------|--------------------------|
| Nuevo | "¿Qué es esto?" | Hero con propuesta clara |
| Curioso | "¿Funciona?" | Preview de resultado |
| Escéptico | "¿Lo usa alguien?" | Live activity + stats |
| Explorador | "¿Qué más hay?" | Ecosystem tools |
| Convencido | "Quiero cuenta" | Final CTA |

### Métrica objetivo
| Métrica | Minimalista | Híbrida Target |
|---------|-------------|----------------|
| Conversión home→registro | ~8% | 15%+ |
| Time on page | 15s | 90s+ |
| Scroll depth | 20% | 80%+ |
| Percepción de valor | "1 tool" | "Ecosistema completo" |

---

## ESTRUCTURA COMPLETA (6 SECCIONES)

```
1. NewHero
   ├── Badge: "Dead God Tracker"
   ├── H1: "¿Cuánto te falta para Dead God?"
   ├── Subtitle: "3.247 jugadores ya saben. Tú aún no."
   ├── Upload Zone (drag & drop)
   ├── Microcopy: "Gratis · Privado · Sin registro"
   └── Help link: "¿Dónde está mi save?"

2. MinimalFooter
   └── Solo lo legal
```

### Lo que se ELIMINÓ:
| Sección | Razón | Nueva ubicación |
|---------|-------|-----------------|
| ItemAnalyzerBar | Distrae del objetivo principal | /analyzer |
| BenefitsSection | Redundante | Eliminado |
| ActivityFeed | Muestra progreso de otros, no del usuario | /community |
| PremiumTeaser | Muy pronto, sin valor demostrado | /settings |
| NavigationCards | Múltiples destinos = ninguno | Eliminado |

---

## FLUJO DE USUARIO

### Estado: Sin cuenta

```
PANTALLA 1: Landing
└── Ve hero + upload zone

PANTALLA 2: Upload (sin registro)
└── Arrastra save file

PANTALLA 3: Loading
└── "Analizando 637 ítems..."

PANTALLA 4: Resultado parcial
├── 67% (GRANDE, ANIMADO)
├── "Top 23% de jugadores"
├── "Tainted Lazarus te está costando 14 marks"
├── [BLUR] Stats de muertes
└── CTA: "Guardar mi progreso (gratis)"

PANTALLA 5: Registro
├── Email + password
├── O: Discord OAuth
└── Microcopy: "Guardaremos tu progreso automáticamente"

PANTALLA 6: Dashboard
├── Stats completas
├── Meta semanal asignada
└── Confetti si >50%
```

---

## MOMENTO WOW (POST-UPLOAD)

### Orden de elementos (optimizado para adicción):

| # | Elemento | Razón psicológica |
|---|----------|-------------------|
| 1 | % completado | Dopamina inmediata + ancla |
| 2 | Comparativa social | Ego + competencia |
| 3 | Personaje bloqueador | Frustración → Meta |
| 4 | Muerte más común | Dato memorable, compartible |
| 5 | Horas restantes | Objetivo alcanzable |
| 6 | Próximo objetivo | Acción clara |
| 7 | Racha | Solo si hay historial |

### Qué mostrar vs blurear:

| Visible (sin cuenta) | Blur (requiere cuenta) |
|---------------------|------------------------|
| % completado | Historial de progreso |
| Top X% | Comparar con amigos |
| Personaje bloqueador | Recomendaciones IA |
| Próximo objetivo | Stats detalladas |

---

## COPY ALTERNATIVO (PARA A/B TEST)

### VERSIÓN 1 — DIRECTO AL DATO
```
H1: "67% camino a Dead God"
Subtitle: "Sube tu save. Te digo exactamente qué te falta."
CTA: "Analizar mi progreso"
Microcopy: "No necesitas cuenta · Resultado en 3 segundos"
```

### VERSIÓN 2 — EMOCIONAL ISAAC (ACTUAL)
```
H1: "¿Cuánto te falta para Dead God?"
Subtitle: "3.247 jugadores ya saben. Tú aún no."
CTA: "Subir mi save file"
Microcopy: "Gratis · Privado · rep_save.dat"
```

### VERSIÓN 3 — COMPETENCIA SOCIAL
```
H1: "El 12% de jugadores tiene Dead God"
Subtitle: "¿Estás arriba o debajo del promedio?"
CTA: "Descubrir mi %"
Microcopy: "Tu progreso vs 10.000 jugadores"
```

### VERSIÓN 4 — DOLOR ESPECÍFICO
```
H1: "Tainted Lost te está costando Dead God"
Subtitle: "O quizás es Jacob & Esau. Sube tu save y lo descubrimos."
CTA: "Ver qué me frena"
Microcopy: "Análisis completo en 3 segundos"
```

### VERSIÓN 5 — MINIMALISTA
```
H1: "Dead God Tracker"
Subtitle: "Sube. Analiza. Conquista."
CTA: "Subir save file →"
Microcopy: "rep_save.dat · Caves · Documents/My Games/..."
```

---

## SISTEMA DE HÁBITO

### Notificaciones (Discord/Email):

| Tipo | Cuándo | Contenido |
|------|--------|-----------|
| Weekly Digest | Domingo 18:00 | "Esta semana completaste 3 marks. Te faltan 12 para Dead God." |
| Achievement Alert | Al detectar completion mark | "🎉 Desbloqueaste Golden Razor con T. Keeper" |
| Racha en peligro | 23:00 si no subió save | "Tu racha de 5 días está en riesgo" |

### Metas semanales:
```javascript
const WEEKLY_GOALS = [
  { type: 'marks', target: 3, reward: 'Badge Semanal' },
  { type: 'characters', target: 1, reward: '50 XP' },
  { type: 'streak', target: 7, reward: 'Título especial' },
];
```

### Eventos recurrentes:
- **Lunes:** "Mark Monday" — 2x XP
- **Viernes:** "Death Stats Friday" — Stats comunidad
- **Mensual:** "Dead God Race" — Leaderboard especial

---

## MODELO PREMIUM

### Gratis SIEMPRE:
- Upload save
- Ver % actual
- Próximo objetivo
- Comparativa social básica
- Metas semanales
- Racha de días

### Premium ONLY:
- Historial completo (>30 días)
- Exportar stats a imagen
- Comparar con amigos específicos
- Notificaciones personalizadas
- Overlay para streaming
- Estimación IA de próximos runs

### Cuándo mostrar premium:
| Momento | ✅/❌ |
|---------|------|
| En home | ❌ |
| Después de 3ª visita | ✅ |
| Al intentar exportar | ✅ |
| En settings | ✅ |

---

## MVP 2 SEMANAS

### Features prioritarias:

| # | Feature | Días | Impacto |
|---|---------|------|---------|
| 1 | Nuevo Hero con copy | 1 | Claridad |
| 2 | Upload Zone en hero | 2 | Fricción |
| 3 | Preview resultado | 2 | Momento wow |
| 4 | Registro post-valor | 1 | Conversión |
| 5 | Dashboard básico | 3 | Retención |
| 6 | Email semanal | 1 | Hábito |

**Total: 10 días + 4 buffer**

### NO hacer en MVP:
- Sistema de metas
- Comparativa social
- Discord notifications
- Premium
- Historial completo

---

## MÉTRICAS Y EVENTOS

### Tracking obligatorio:

| Event | Cuándo | Mide |
|-------|--------|------|
| `home_viewed` | Pageview | Tráfico |
| `upload_zone_viewed` | Viewport | Engagement |
| `upload_started` | File drag | Intent |
| `upload_completed` | Procesado | Conversión p1 |
| `result_viewed` | Ve % | Momento wow |
| `registration_prompted` | Modal | Funnel |
| `registration_started` | Click | Intent |
| `registration_completed` | Creada | Conversión |
| `dashboard_viewed` | Dashboard | D0 |
| `save_uploaded_repeat` | 2º+ | Retención |
| `premium_cta_viewed` | Teaser | Revenue |

### Funnels:

```
FUNNEL 1: Adquisición
home_viewed → upload_started → registration_completed
Target: 15%

FUNNEL 2: Activación
registration_completed → dashboard_viewed → save_uploaded_repeat
Target: 60% D1

FUNNEL 3: Monetización
premium_cta_viewed → premium_trial_started → premium_converted
Target: 3%
```

---

## ARCHIVOS CREADOS

1. `frontend/src/components/home/NewHero.jsx` — Nuevo hero con upload zone
2. `frontend/src/pages/home/HomeV2.jsx` — Nueva home simplificada

### Para activar:
```javascript
// En tu router, cambia:
// import { Home } from './pages/home/Home';
// Por:
import { Home } from './pages/home/HomeV2';
```

### Dependencia necesaria:
```bash
cd frontend && npm install react-dropzone
```

---

## PRÓXIMOS PASOS

1. [ ] Instalar dependencias: `npm install`
2. [ ] Activar HomeV2 en router
3. [ ] Implementar backend real para análisis de save
4. [ ] Configurar analytics (Amplitude/Mixpanel)
5. [ ] A/B test de copy (5 versiones)
6. [ ] Implementar dashboard básico
7. [ ] Configurar email semanal

---

*Documento generado: Febrero 2026*
*Diseño: Product Team*
