import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUnlock, FaHeart, FaGamepad, FaCoins, FaBomb, FaKey } from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';

export function CharacterModal({ character, isOpen, onClose }) {
  if (!isOpen || !character) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-bg-1 border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
            {/* Header / Banner */}
            <div className="relative h-32 bg-bg-2 flex items-center justify-center border-b border-border overflow-hidden">
                 <div className="absolute inset-0 bg-contain bg-center opacity-5" style={{ backgroundImage: `url(${character.image})` }} />
                 <div className="z-10 flex flex-col items-center">
                    <img 
                        src={character.image} 
                        alt={character.name} 
                        className="w-24 h-24 object-contain filter drop-shadow-lg"
                    />
                 </div>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose}
                    className="absolute top-4 right-4 hover:bg-black/20"
                >
                    <FaTimes />
                </Button>
            </div>

            <div className="p-8 space-y-8">
                {/* Title & Stats */}
                <div className="text-center space-y-4">
                    <h2 className={`text-4xl font-serif font-bold ${character.isTainted ? 'text-purple-400' : 'text-fg'}`}>
                        {character.name}
                    </h2>
                    
                    <div className="flex flex-wrap justify-center gap-2">
                        <Chip className="bg-bg-0 border-border text-muted-foreground font-semibold">
                            <FaHeart className="text-blood mr-1" /> {character.health_type}
                        </Chip>
                        <Chip className="bg-bg-0 border-border text-muted-foreground font-semibold">
                            <FaGamepad className="text-gold mr-1" /> Dif: {character.difficulty}/3
                        </Chip>
                    </div>
                </div>

                {/* Starting Stats (Consumables) */}
                <div className="bg-bg-2/50 p-4 rounded-xl border border-border flex justify-around">
                     <div className="flex flex-col items-center gap-1">
                        <FaCoins className="text-yellow-500 text-xl" />
                        <span className="font-mono text-lg">{character.starting_stats.coins}</span>
                        <span className="text-xs text-muted uppercase">Coins</span>
                     </div>
                     <div className="flex flex-col items-center gap-1">
                        <FaBomb className="text-gray-400 text-xl" />
                        <span className="font-mono text-lg">{character.starting_stats.bombs}</span>
                        <span className="text-xs text-muted uppercase">Bombs</span>
                     </div>
                     <div className="flex flex-col items-center gap-1">
                        <FaKey className="text-gray-300 text-xl" />
                        <span className="font-mono text-lg">{character.starting_stats.keys}</span>
                        <span className="text-xs text-muted uppercase">Keys</span>
                     </div>
                </div>

                {/* Description */}
                <div>
                   <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2">Mecánicas / Descripción</h3>
                   <p className="text-lg text-fg/90 leading-relaxed font-serif italic border-l-4 border-gold/20 pl-4 py-1">
                      "{character.description}"
                   </p>
                </div>

                 {/* Unlock Method */}
                 <div className="bg-bg-0 p-4 rounded-xl border border-dashed border-border flex gap-4 items-start">
                    <div className="p-3 bg-bg-2 rounded-full border border-border">
                        <FaUnlock className="text-gold/80" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-fg uppercase tracking-wider mb-1">Cómo Desbloquear</h3>
                        <p className="text-muted-foreground text-sm">
                            {character.unlock_method}
                        </p>
                    </div>
                 </div>

                {/* Starting Items */}
                {character.starting_items && character.starting_items.length > 0 && (
                    <div>
                       <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-3">Items Iniciales</h3>
                       <div className="flex flex-wrap gap-2">
                          {character.starting_items.map((item, i) => (
                              <Chip key={i} className="bg-surface border-border py-1 px-3">
                                  {item}
                              </Chip>
                          ))}
                       </div>
                    </div>
                )}
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
