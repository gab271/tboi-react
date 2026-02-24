import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaHeart, FaGamepad, FaCoins, FaBomb, FaKey, FaLightbulb, FaStar } from 'react-icons/fa';
import { CompletionMarksGrid } from './CompletionMarksGrid';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { StatsPanel } from './StatBar';
import { HeartDisplay } from './HeartDisplay';
import { StartingItemsGrid } from './StartingItemCard';
import { getCharacterFullData } from '../data/characterStats';
import { useCompletionMarks } from '../hooks/useCompletionMarks';
import { useAuth } from '../../../hooks/useAuth';

export function CharacterModal({ character, onClose, _isTainted }) {
  const { t } = useTranslation();
  const [showConflictModal, setShowConflictModal] = useState(false);
  const { user } = useAuth();
  
  const {
    marks,
    completion,
    isLoading,
    pendingConflict,
    toggleMark,
    saveMarks,
    resolveConflict,
  } = useCompletionMarks(character?.id, user?.id);
  
  if (!character) return null;

  // Obtener datos completos del personaje (stats reales del juego)
  const characterData = getCharacterFullData(character.id) || {};
  const { baseStats: stats, startingHealth: health, startingItems: items, playstyle, epithet: baseEpithet } = characterData;
  const epithet = baseEpithet || (character.isTainted ? '"The Twisted One"' : '"The Child"');

  const handleSaveMarks = async (marksData) => {
    // CompletionMarksGrid passes { characterId, marks, source, lastUpdated, saveFileHash }
    await saveMarks(marksData);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Paper */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, rotate: -1 }}
            className="relative w-full max-w-4xl bg-bg-paper text-text-ink paper-shadow rounded-sm max-h-[90vh] overflow-y-auto mx-2"
        >
            {/* Close Button Doodle */}
           <button 
                className="absolute top-3 right-3 sm:top-4 sm:right-5 z-20 font-handwriting font-bold text-xl sm:text-2xl hover:text-accent-blood transition-colors"
                onClick={onClose}
            >
                X
            </button>

            <div className="p-4 sm:p-8 md:p-12 flex flex-col md:flex-row gap-6 sm:gap-8">
                
                {/* Left: Polaroid-style Portrait */}
                <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col items-center">
                    <div className="bg-[#fdfbf7] p-3 pb-8 shadow-md -rotate-2 w-full max-w-[250px] border border-gray-200">
                        <div className={`w-full aspect-square flex items-center justify-center overflow-hidden border border-gray-100 ${character.isTainted ? 'bg-[#2a2a2a]' : 'bg-[#1a1a1a]'}`}>
                            <img 
                                src={character.image} 
                                alt={character.name} 
                                className={`w-3/4 h-3/4 object-contain drop-shadow-lg ${character.isTainted ? 'sepia hue-rotate-15' : ''}`}
                            />
                        </div>
                        <div className="text-center mt-3 font-handwriting text-text-ink text-xl font-bold">
                            {character.name}
                        </div>
                    </div>

                    {/* Completion Marks Grid - Nuevo Sistema */}
                    <div className="mt-8 w-full max-w-[280px]">
                        <CompletionMarksGrid
                          characterId={character.id}
                          characterName={character.name}
                          isTainted={character.isTainted}
                          initialMarks={marks}
                          source={marks?.source}
                          editable={!!user}
                          onSave={handleSaveMarks}
                        />
                    </div>
                </div>

                {/* Right: Character Details */}
                <div className="flex-1 space-y-5 overflow-y-auto">
                    {/* Header: Name & Epithet */}
                    <div>
                        <h2 className={`text-4xl sm:text-5xl font-heading mb-1 ${character.isTainted ? 'text-purple-900' : 'text-text-heading'}`}>
                            {character.name}
                        </h2>
                        <p className="font-handwriting text-xl sm:text-2xl text-text-dim italic">
                            {epithet}
                        </p>
                    </div>

                    {/* Stats Panel - Real game stats */}
                    {stats && (
                      <div className="bg-white/50 p-4 rounded-lg border border-text-ink/10">
                        <h3 className="font-heading text-sm mb-3 flex items-center gap-2">
                          <FaGamepad className="text-accent-gold" /> Base Stats
                        </h3>
                        <StatsPanel stats={stats} isEden={character.id === 'eden' || character.id === 'tainted_eden'} />
                      </div>
                    )}

                    {/* Health Display */}
                    {health && (
                      <div className="bg-white/40 p-4 rounded-lg border border-text-ink/10">
                        <h3 className="font-heading text-sm mb-3 flex items-center gap-2">
                          <FaHeart className="text-accent-blood" /> Starting Health
                        </h3>
                        <HeartDisplay health={health} />
                      </div>
                    )}

                    {/* Starting Items */}
                    {items && items.length > 0 && (
                      <div className="bg-white/40 p-4 rounded-lg border border-text-ink/10 -rotate-1">
                        <h3 className="font-heading text-sm mb-3 flex items-center gap-2">
                          <FaStar className="text-yellow-500" /> Starting Items
                        </h3>
                        <StartingItemsGrid items={items} />
                      </div>
                    )}

                    {/* Pickups (coins, bombs, keys) */}
                    <div className="bg-white/40 p-3 rounded-lg border border-text-ink/10">
                        <h3 className="font-heading text-xs mb-2 text-text-dim">{t('characters.pickups')}</h3>
                        <div className="flex justify-around font-mono text-base">
                             <div className="flex flex-col items-center gap-1">
                                <FaCoins className="text-yellow-600" />
                                <span>{character.starting_stats?.coins || 0}</span>
                             </div>
                             <div className="flex flex-col items-center gap-1">
                                <FaBomb className="text-gray-600" />
                                <span>{character.starting_stats?.bombs || 0}</span>
                             </div>
                             <div className="flex flex-col items-center gap-1">
                                <FaKey className="text-gray-400" />
                                <span>{character.starting_stats?.keys || 0}</span>
                             </div>
                        </div>
                    </div>

                    {/* Playstyle Tips */}
                    {playstyle && (
                      <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/50">
                        <h3 className="font-heading text-sm mb-3 flex items-center gap-2">
                          <FaLightbulb className="text-amber-500" /> Playstyle
                          {playstyle.difficultyLabel && (
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                              playstyle.difficulty === 1 ? 'bg-green-100 text-green-700' :
                              playstyle.difficulty === 2 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {playstyle.difficultyLabel}
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-text-dim mb-3">{playstyle.summary}</p>
                        
                        {playstyle.bullets?.length > 0 && (
                          <ul className="space-y-1 mb-3">
                            {playstyle.bullets.map((bullet, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {playstyle.tip && (
                          <div className="mt-3 p-2 bg-amber-100/50 rounded text-xs text-amber-800 flex items-start gap-2">
                            <span className="text-amber-600">💡</span>
                            <span>{playstyle.tip}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description fallback */}
                    {character.description && !playstyle && (
                      <div className="pt-2 text-sm font-serif text-text-dim leading-relaxed">
                        <p>{character.description}</p>
                      </div>
                    )}
                </div>
            </div>
        </motion.div>
        
        {/* Conflict Resolution Modal */}
        <ConflictResolutionModal
          isOpen={showConflictModal || !!pendingConflict}
          onClose={() => setShowConflictModal(false)}
          conflict={pendingConflict}
          onResolve={resolveConflict}
        />
      </div>
    </AnimatePresence>,
    document.body
  );
}
