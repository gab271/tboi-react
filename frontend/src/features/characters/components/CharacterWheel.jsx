import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CharacterCard } from './CharacterCard';
import { cn } from '../../../lib/utils';

// Vecinos visibles a cada lado del personaje central
const RANGE_DESKTOP = 2;
const RANGE_MOBILE  = 1;

// Separación en píxeles entre posiciones (sin perspective distortion)
// Debe superar la mitad del ancho de la tarjeta central (~160px) para que
// offset ±1 quede fuera del card y sea visiblemente el vecino inmediato.
const SPACING_DESKTOP = 250;
const SPACING_MOBILE  = 140;

export const CharacterWheel = ({ characters, isTainted, onSelect }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0); // -1 = prev, +1 = next

    useEffect(() => {
        setActiveIndex(0);
        setDirection(0);
    }, [isTainted, characters.length]);

    const handleNext = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % characters.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + characters.length) % characters.length);
    };

    const getVisibleItems = () => {
        const len = characters.length;
        if (len === 0) return [];
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const range   = isMobile ? RANGE_MOBILE : RANGE_DESKTOP;
        const spacing = isMobile ? SPACING_MOBILE : SPACING_DESKTOP;

        const items = [];
        for (let i = -range; i <= range; i++) {
            const index = (activeIndex + i + len) % len;
            items.push({ index, offset: i, spacing });
        }
        return items;
    };

    const visibleItems = getVisibleItems();

    return (
        <div className="relative w-full h-[60vh] min-h-[320px] max-h-[620px] flex items-center justify-center overflow-visible">

            {/* Glow de fondo */}
            <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "w-[300px] h-[300px] md:w-[700px] md:h-[700px]",
                "rounded-full blur-[80px] -z-10 transition-colors duration-1000",
                isTainted ? "bg-red-900/30" : "bg-amber-100/10"
            )} />

            {/* Contenedor interno con flechas dentro — max-w-4xl acota el espacio */}
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center overflow-visible">

                {/* Flecha izquierda — próxima al card */}
                <button
                    onClick={handlePrev}
                    className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-[60] text-3xl md:text-5xl text-white/40 hover:text-white hover:scale-110 transition-all drop-shadow-md p-3"
                    aria-label="Previous character"
                >
                    <FaChevronLeft />
                </button>

                {/* Flecha derecha */}
                <button
                    onClick={handleNext}
                    className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-[60] text-3xl md:text-5xl text-white/40 hover:text-white hover:scale-110 transition-all drop-shadow-md p-3"
                    aria-label="Next character"
                >
                    <FaChevronRight />
                </button>

                {/* Personajes del carrusel */}
                <AnimatePresence mode="popLayout" custom={direction}>
                    {visibleItems.map(({ index, offset, spacing }) => {
                        const char = characters[index];
                        if (!char) return null;

                        const isCenter = offset === 0;

                        // Sin translateZ profundo: evita el foreshortening de perspectiva
                        // que ocultaba el personaje en offset ±1 detrás del card central.
                        const xPos    = offset * spacing;
                        const yPos    = isCenter ? 0 : Math.abs(offset) * 12;
                        const scale   = isCenter ? 1 : Math.max(0.38, 0.55 - Math.abs(offset) * 0.08);
                        const opacity = isCenter ? 1 : Math.max(0.25, 0.65 - Math.abs(offset) * 0.15);

                        return (
                            <motion.div
                                key={`${isTainted ? 't' : 'n'}-${char.id}`}
                                custom={direction}
                                // Nuevos elementos entran desde el lado correcto
                                initial={{
                                    opacity: 0,
                                    scale: 0.3,
                                    x: direction >= 0 ? 350 : -350,
                                }}
                                animate={{
                                    x: xPos,
                                    y: yPos,
                                    scale,
                                    opacity,
                                    filter: isCenter
                                        ? 'grayscale(0%) brightness(1)'
                                        : 'grayscale(85%) brightness(0.45)',
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.3,
                                    x: direction >= 0 ? -350 : 350,
                                }}
                                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                                // transformTemplate preserva translate(-50%,-50%) sin
                                // conflicto con los transforms animados de Framer Motion
                                transformTemplate={(_, generated) =>
                                    `translate(-50%, -50%) ${generated}`
                                }
                                className="absolute origin-center"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    zIndex: isCenter ? 50 : 50 - Math.abs(offset),
                                    cursor: isCenter ? 'default' : 'pointer',
                                }}
                                onClick={() => {
                                    if (!isCenter) {
                                        if (offset > 0) handleNext();
                                        else handlePrev();
                                    }
                                }}
                            >
                                {isCenter ? (
                                    <CharacterCard
                                        character={char}
                                        isActive
                                        isTainted={isTainted}
                                        onSelect={() => onSelect && onSelect(char)}
                                    />
                                ) : (
                                    <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center drop-shadow-xl">
                                        {char.image ? (
                                            <img
                                                src={char.image}
                                                alt={char.name}
                                                className="w-full h-full object-contain pixelated"
                                            />
                                        ) : (
                                            <span className="text-4xl text-white/50">?</span>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};
