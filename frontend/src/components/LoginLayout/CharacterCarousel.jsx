import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Characters with real sprites
const CHARACTERS = [
  { id: 'isaac', name: 'Isaac', sprite: '/sprites/0_Characters/0_Vanilla/Isaac.png' },
  { id: 'magdalene', name: 'Magdalene', sprite: '/sprites/0_Characters/0_Vanilla/Magdalene.png' },
  { id: 'cain', name: 'Cain', sprite: '/sprites/0_Characters/0_Vanilla/Cain.png' },
  { id: 'judas', name: 'Judas', sprite: '/sprites/0_Characters/0_Vanilla/Judas.png' },
  { id: 'bluebaby', name: '???', sprite: '/sprites/0_Characters/0_Vanilla/Blue Baby.png' },
  { id: 'eve', name: 'Eve', sprite: '/sprites/0_Characters/0_Vanilla/Eve.png' },
  { id: 'samson', name: 'Samson', sprite: '/sprites/0_Characters/0_Vanilla/Samson.png' },
  { id: 'azazel', name: 'Azazel', sprite: '/sprites/0_Characters/0_Vanilla/Azazel.png' },
  { id: 'lazarus', name: 'Lazarus', sprite: '/sprites/0_Characters/0_Vanilla/Lazarus.png' },
  { id: 'eden', name: 'Eden', sprite: '/sprites/0_Characters/0_Vanilla/Eden.png' },
  { id: 'lost', name: 'The Lost', sprite: '/sprites/0_Characters/0_Vanilla/The Lost.png' },
  { id: 'lilith', name: 'Lilith', sprite: '/sprites/0_Characters/0_Vanilla/Lilith.png' },
  { id: 'keeper', name: 'Keeper', sprite: '/sprites/0_Characters/0_Vanilla/Keeper.png' },
  { id: 'apollyon', name: 'Apollyon', sprite: '/sprites/0_Characters/0_Vanilla/Apollyon.png' },
  {
    id: 'forgotten',
    name: 'The Forgotten',
    sprite: '/sprites/0_Characters/0_Vanilla/The Forgotten.png',
  },
  { id: 'bethany', name: 'Bethany', sprite: '/sprites/0_Characters/0_Vanilla/Bethany.png' },
];

export const CharacterCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();

  // Auto-rotate suave; se detiene si el usuario prefiere menos movimiento
  useEffect(() => {
    if (reduceMotion) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reduceMotion]);

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % CHARACTERS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + CHARACTERS.length) % CHARACTERS.length);
  };

  const prevIndex = (activeIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
  const nextIndex = (activeIndex + 1) % CHARACTERS.length;

  const getChar = (idx) => CHARACTERS[idx];
  const currentChar = getChar(activeIndex);

  return (
    <div className="relative flex w-full select-none flex-col items-center justify-center">
      {/* Who am I? Label */}
      <div className="font-handwriting mb-2 text-sm italic text-[#5c4a32]/60">
        {t('auth.whoAmI')}
      </div>

      {/* Carousel Container */}
      <div className="relative flex h-28 w-full items-center justify-center">
        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label={t('auth.prevChar')}
          className="absolute left-4 z-20 p-2 text-[#5c4a32]/40 transition-all hover:scale-125 hover:text-[#8a1c1c] focus-visible:text-[#8a1c1c] focus-visible:outline-none"
        >
          <FaChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label={t('auth.nextChar')}
          className="absolute right-4 z-20 p-2 text-[#5c4a32]/40 transition-all hover:scale-125 hover:text-[#8a1c1c] focus-visible:text-[#8a1c1c] focus-visible:outline-none"
        >
          <FaChevronRight size={20} />
        </button>

        {/* Characters Display */}
        <div className="relative flex items-center justify-center gap-6">
          {/* Previous Character */}
          <div
            onClick={handlePrev}
            className="flex h-14 w-14 cursor-pointer items-center justify-center opacity-30 grayscale transition-all hover:opacity-50"
          >
            <img
              src={getChar(prevIndex).sprite}
              alt={getChar(prevIndex).name}
              className="pixelated h-full w-full object-contain"
            />
          </div>

          {/* Active Character with Red Circle */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentChar.id}
                initial={{ opacity: 0, scale: 0.8, y: direction > 0 ? 20 : -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: direction > 0 ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 flex h-20 w-20 items-center justify-center"
              >
                <motion.img
                  src={currentChar.sprite}
                  alt={currentChar.name}
                  className="pixelated h-full w-full object-contain drop-shadow-lg"
                  animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Hand-drawn Red Selection Circle */}
            <svg
              className="pointer-events-none absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)]"
              viewBox="0 0 100 100"
            >
              <ellipse
                cx="50"
                cy="50"
                rx="42"
                ry="44"
                fill="none"
                stroke="#b91c1c"
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  filter: 'drop-shadow(0 0 3px rgba(185, 28, 28, 0.4))',
                }}
                strokeDasharray="8 4"
              />
              <ellipse
                cx="50"
                cy="50"
                rx="44"
                ry="42"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>

          {/* Next Character */}
          <div
            onClick={handleNext}
            className="flex h-14 w-14 cursor-pointer items-center justify-center opacity-30 grayscale transition-all hover:opacity-50"
          >
            <img
              src={getChar(nextIndex).sprite}
              alt={getChar(nextIndex).name}
              className="pixelated h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Character Name */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentChar.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="font-pixel mt-2 text-sm uppercase tracking-widest text-[#1a1a1a]"
        >
          {currentChar.name}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
