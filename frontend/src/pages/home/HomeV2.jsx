// Home.jsx - Hybrid Home: Landing + Hub + Portal
// Combina conversión, contenido vivo y ecosistema de herramientas

import { HybridHome } from '../../components/home/HybridHome';

export function Home() {
  return <HybridHome />;
}

// =====================================================
// ESTRUCTURA DE LA HOME HÍBRIDA
// =====================================================
// 
// FLUJO PSICOLÓGICO:
// Curiosidad → Valor personal → Confianza → Exploración → Registro → Hábito
//
// SECCIONES (ORDEN):
// 1. HERO + UPLOAD (85vh) - "Esto es para MÍ"
// 2. PREVIEW RESULT (60vh) - "Quiero ver mis datos así"
// 3. LIVE ACTIVITY (50vh) - "La gente lo usa de verdad"
// 4. ECOSYSTEM TOOLS (70vh) - "Hay mucho más aquí"
// 5. FINAL CTA (50vh) - "Necesito registrarme"
// 6. MINI FOOTER (20vh) - "Es serio y confiable"
//
// ALTURA TOTAL: ~365vh (home larga intencional)
//
// =====================================================
// ERRORES EVITADOS
// =====================================================
// ❌ Minimalismo excesivo → ✅ Home larga con secciones
// ❌ Demasiados protagonistas → ✅ 1 CTA principal claro
// ❌ Fin falso de página → ✅ Scroll hints visuales
// ❌ Doble footer → ✅ Un solo footer
// ❌ Features sin contexto → ✅ Beneficios claros
// ❌ Sin actividad → ✅ Ticker + timestamps
//
// =====================================================
