import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaGamepad, FaCoins, FaBomb, FaKey } from 'react-icons/fa';

// Symbols for marks to display (read-only in modal)
const COMPLETION_MARKS = [
  { id: 'heart', name: "Mom's Heart", symbol: "❤️" },
  { id: 'isaac', name: "Isaac", symbol: "✝" },
  { id: 'boss_rush', name: "Boss Rush", symbol: "★" },
  { id: 'satan', name: "Satan", symbol: "⛧" },
  { id: 'blue_baby', name: "??? (Blue Baby)", symbol: "P" },
  { id: 'lamb', name: "The Lamb", symbol: "N" },
  { id: 'mega_satan', name: "Mega Satan", symbol: "∞" },
  { id: 'greed', name: "Greed Mode", symbol: "¢" }, 
  { id: 'hush', name: "Hush", symbol: "H" },
  { id: 'delirium', name: "Delirium", symbol: "D" },
  { id: 'mother', name: "Mother", symbol: "M" },
  { id: 'beast', name: "The beast", symbol: "B" }
];

export function CharacterModal({ character, onClose, _isTainted }) {
  if (!character) return null;

  // Retrieve progress from localStorage just for display
  const savedProgress = localStorage.getItem(`tboi_tracker_${character.id}`);
  const progress = savedProgress ? JSON.parse(savedProgress) : {};

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

                    {/* Completion Marks Grid (New Addition) */}
                    <div className="mt-8 w-full max-w-[280px]">
                        <h4 className="font-handwriting text-center text-lg mb-2 font-bold underline decoration-wavy decoration-red-500/30">Completion Marks</h4>
                        <div className="grid grid-cols-4 gap-2 p-2 bg-white/50 border border-black/10 rounded-sm">
                            {COMPLETION_MARKS.map(mark => {
                                const isCompleted = !!progress[mark.id];
                                return (
                                    <div 
                                        key={mark.id} 
                                        className={`
                                            aspect-square flex items-center justify-center text-lg font-bold border rounded-sm transition-all
                                            ${isCompleted 
                                                ? 'border-red-800 text-red-700 bg-red-100/20 shadow-sm' 
                                                : 'border-black/10 text-black/20 bg-black/5 grayscale opacity-50'
                                            }
                                        `}
                                        title={mark.name}
                                    >
                                        {/* Use sprite if available or symbol */}
                                        {isCompleted ? (
                                             <span className="drop-shadow-sm">{mark.symbol}</span>
                                        ) : (
                                            <span className="text-xs">{mark.symbol}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Handwritten Stats */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h2 className={`text-5xl font-heading mb-2 ${character.isTainted ? 'text-purple-900' : 'text-text-heading'}`}>
                            {character.name}
                        </h2>
                        <p className="font-handwriting text-2xl text-text-dim italic">
                            {character.isTainted ? '"The Twisted One"' : '"The Child"'}
                        </p>
                    </div>

                    <div className="border-t-2 border-dashed border-text-ink/20 pt-4 space-y-3 font-handwriting text-xl">
                        <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-2"><FaHeart className="text-accent-blood text-sm" /> Type:</span>
                            <span>{character.health_type || 'Standard'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-2"><FaGamepad className="text-accent-gold text-sm" /> Difficulty:</span>
                            <span>{character.difficulty}/3</span>
                        </div>
                    </div>

                    {/* Starting Items sketched box */}
                    <div className="bg-white/40 p-4 border-2 border-text-ink/10 rounded-lg -rotate-1 mt-4">
                        <h3 className="font-heading text-sm mb-3 underline decoration-wavy decoration-accent-blood">Starting Stats:</h3>
                        <div className="flex justify-around font-mono text-lg">
                             <div className="flex flex-col items-center">
                                <FaCoins className="text-yellow-600 mb-1" />
                                <span>{character.starting_stats?.coins || 0}</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <FaBomb className="text-gray-600 mb-1" />
                                <span>{character.starting_stats?.bombs || 0}</span>
                             </div>
                             <div className="flex flex-col items-center">
                                <FaKey className="text-gray-400 mb-1" />
                                <span>{character.starting_stats?.keys || 0}</span>
                             </div>
                        </div>
                    </div>

                    <div className="pt-4 text-sm font-serif text-text-dim leading-relaxed">
                        <p>
                           {character.description || "No specific notes found for this character."}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
