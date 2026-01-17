// Similar to ItemModal but for bosses
import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSkull, FaHeart, FaMapMarkerAlt, FaExclamationTriangle, FaCrosshairs, FaGift } from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';
import { Chip } from '../../../components/ui/Chip';

export function BossModal({ boss, onClose }) {
  if (!boss) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
         className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
         onClick={onClose} 
      />
      
      <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.9, y: 20 }}
         className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-bg-0 border border-border rounded-2xl shadow-2xl flex flex-col md:flex-row"
      >
         <Button 
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 hover:bg-black/80 text-white" 
            size="icon" 
            variant="ghost" 
            onClick={onClose}
         >
            <FaTimes />
         </Button>

         {/* Left: Image & Quick Stats */}
         <div className="w-full md:w-1/3 bg-bg-1 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-border relative overflow-hidden">
            {/* Background ambiance */}
            <div className="absolute inset-0 bg-blood/5 pointer-events-none" />
            
            <div className="w-56 h-56 relative mb-8 group z-10">
               <div className="absolute inset-0 bg-blood/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
               {boss.image ? (
                 <img src={boss.image} alt={boss.name} className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
               ) : (
                 <FaSkull className="w-24 h-24 text-fg/10" />
               )}
            </div>

            <div className="w-full space-y-4 z-10 bg-surface/50 p-4 rounded-xl border border-border">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                   <span className="text-muted text-xs uppercase tracking-wider flex items-center gap-2">
                     <FaHeart className="text-blood" /> Health
                   </span>
                   <span className="font-mono font-bold text-fg">{boss.health}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="text-muted text-xs uppercase tracking-wider flex items-center gap-2">
                     <FaExclamationTriangle className="text-gold" /> Difficulty
                   </span>
                   <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                         <div key={i} className={`w-2 h-2 rounded-full ${i < (boss.difficulty || 0) ? 'bg-blood' : 'bg-bg-2'}`} />
                      ))}
                   </div>
                </div>
            </div>
         </div>

         {/* Right: Content */}
         <div className="flex-1 p-8 overflow-y-auto">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-3xl md:text-4xl font-serif font-black text-fg">{boss.name}</h2>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <Chip className="bg-bg-2 border-border text-muted-foreground flex items-center gap-1 font-semibold">
                        <FaMapMarkerAlt className="text-xs" /> {boss.location || 'Unknown Location'}
                    </Chip>
                </div>
            </div>

            <div className="space-y-8">
                {/* Description */}
                <div>
                   <div className="text-lg text-fg/90 leading-relaxed font-serif italic border-l-2 border-blood/20 pl-4">
                      "{boss.description || "No description available."}"
                   </div>
                </div>

                {/* Attack Patterns */}
                {boss.attack_patterns && boss.attack_patterns.length > 0 && (
                    <div className="bg-bg-1 p-5 rounded-xl border border-border">
                       <h3 className="text-sm font-bold text-fg uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FaCrosshairs className="text-blood" /> Attack Patterns
                       </h3>
                       <ul className="space-y-2">
                          {boss.attack_patterns.map((pattern, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="mt-1.5 w-1 h-1 rounded-full bg-blood shrink-0" />
                                  <span>{pattern}</span>
                              </li>
                          ))}
                       </ul>
                    </div>
                )}

                {/* Drops */}
                {boss.drops && boss.drops.length > 0 && (
                    <div className="bg-bg-1 p-5 rounded-xl border border-border">
                       <h3 className="text-sm font-bold text-fg uppercase tracking-wider mb-3 flex items-center gap-2">
                          <FaGift className="text-gold" /> Drops / Rewards
                       </h3>
                       <div className="flex flex-wrap gap-2">
                          {boss.drops.map((drop, i) => (
                              <Chip key={i} className="bg-surface border-border text-xs py-1">
                                  {drop}
                              </Chip>
                          ))}
                       </div>
                    </div>
                )}
            </div>
         </div>
      </motion.div>
    </div>
  );
}
