// HybridHome.jsx - Home híbrida: landing + hub + portal
// Combina conversión, contenido vivo y ecosistema de herramientas

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from './HeroSection';
import { PreviewSection } from './PreviewSection';
import { LiveActivitySection } from './LiveActivitySection';
import { EcosystemSection } from './EcosystemSection';
import { FinalCTASection } from './FinalCTASection';
import { MinimalFooter } from '../MinimalFooter';
import { MobileStickyCTA } from '../MobileStickyCTA';
import { ResultModal } from './ResultModal';

export function HybridHome() {
    const navigate = useNavigate();
    const [uploadResult, setUploadResult] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);

    const handleUploadSuccess = (result) => {
        setUploadResult(result);
        setShowResultModal(true);
    };

    const handlePreviewCTA = () => {
        // Scroll to hero upload zone
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <div className="flex flex-col relative">
            
            {/* 1. HERO + UPLOAD (85vh)
                Objetivo: Valor personal inmediato
                Usuario siente: "Esto es para MÍ" */}
            <HeroSection onUploadSuccess={handleUploadSuccess} />

            {/* 2. PREVIEW RESULT (60vh)
                Objetivo: Anticipación de recompensa
                Usuario siente: "Quiero ver mis datos así" */}
            <PreviewSection onCTAClick={handlePreviewCTA} />

            {/* 3. LIVE ACTIVITY (50vh)
                Objetivo: Prueba social + comunidad viva
                Usuario siente: "La gente lo usa de verdad" */}
            <LiveActivitySection />

            {/* 4. ECOSYSTEM TOOLS (70vh)
                Objetivo: Percepción de profundidad
                Usuario siente: "Hay mucho más aquí" */}
            <EcosystemSection />

            {/* 5. FINAL CTA (50vh)
                Objetivo: Urgencia + cierre
                Usuario siente: "Necesito registrarme" */}
            <FinalCTASection />

            {/* 6. MINI FOOTER (20vh)
                Objetivo: Profesionalismo
                Usuario siente: "Es serio y confiable" */}
            <MinimalFooter />

            {/* Mobile Sticky CTA - Solo móvil después de scroll */}
            <MobileStickyCTA />

            {/* Result Modal - Aparece después del upload */}
            <AnimatePresence>
                {showResultModal && uploadResult && (
                    <ResultModal 
                        result={uploadResult}
                        onClose={() => setShowResultModal(false)}
                        onRegister={handleRegister}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/*
=====================================================
ESTRUCTURA DE LA HOME HÍBRIDA
=====================================================

FLUJO PSICOLÓGICO:
Curiosidad → Valor personal → Confianza → Exploración → Registro → Hábito

SECCIONES:
┌─────────────────────────────────────┐
│ 1. HERO + UPLOAD          (85vh)   │
│    - Badge "Dead God Tracker"       │
│    - H1 con pregunta directa        │
│    - Upload zone prominente         │
│    - Scroll hint para más contenido│
├─────────────────────────────────────┤
│ 2. PREVIEW RESULT         (60vh)   │
│    - Ejemplo de resultado           │
│    - 67% barra animada              │
│    - Stats grid                     │
│    - CTA "Ver MI progreso"          │
├─────────────────────────────────────┤
│ 3. LIVE ACTIVITY          (50vh)   │
│    - Ticker en tiempo real          │
│    - Builds populares               │
│    - Logros del día                 │
├─────────────────────────────────────┤
│ 4. ECOSYSTEM TOOLS        (70vh)   │
│    - 4 herramientas con beneficios  │
│    - Stats globales                 │
├─────────────────────────────────────┤
│ 5. FINAL CTA              (50vh)   │
│    - Copy emocional + lógico        │
│    - Botones de registro            │
├─────────────────────────────────────┤
│ 6. MINI FOOTER            (20vh)   │
│    - Links legales                  │
└─────────────────────────────────────┘

ALTURA TOTAL: ~365vh (home larga intencional)

=====================================================
POR QUÉ ESTE DISEÑO
=====================================================

1. HERO ENFOCADO + SCROLL HINT
   - Un solo CTA principal (upload)
   - Pero sugiere que hay más abajo
   - Soluciona: "parece app de 1 función"

2. PREVIEW ANTES DE PEDIR
   - Muestra output antes de input
   - Genera deseo del dato personal
   - Aumenta conversión del upload

3. LIVE ACTIVITY
   - Prueba social con timestamps reales
   - Builds con votos y autores
   - "Esto está vivo"

4. ECOSYSTEM
   - Muestra profundidad del producto
   - Beneficios, no features
   - "Hay más herramientas"

5. CTA FINAL
   - Para el usuario que scrolleó todo
   - Copy emocional + lógico
   - Último empujón

=====================================================
ERRORES EVITADOS
=====================================================

❌ Minimalismo excesivo → ✅ Home larga con secciones
❌ Demasiados protagonistas → ✅ 1 CTA principal claro
❌ Fin falso de página → ✅ Scroll hints visuales
❌ Doble footer → ✅ Un solo footer
❌ Features sin contexto → ✅ Beneficios claros
❌ Sin actividad → ✅ Ticker + timestamps

=====================================================
*/
