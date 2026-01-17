import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSkull, FaHeart, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from '../../../components/ui/Button';

export function BossModal({ boss, onClose }) {
  if (!boss) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
         className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
         onClick={onClose} 
      />
      
      {/* Modal - Paper Look */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
         animate={{ opacity: 1, scale: 1, rotate: 0 }}
         exit={{ opacity: 0, scale: 0.9, rotate: 1 }}
         className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-bg-paper text-text-ink paper-shadow flex flex-col md:flex-row p-6 md:p-10 -rotate-1"
      >
         {/* Close "X" doodle */}
         <button 
            className="absolute top-4 right-5 z-20 font-handwriting font-bold text-2xl hover:text-accent-blood transition-colors"
            onClick={onClose}
         >
            X
         </button>

         {/* Left: Image (Stapled Photo) */}
         <div className="w-full md:w-1/3 flex flex-col items-center mb-6 md:mb-0 md:mr-8">
            <div className="bg-[#fdfbf7] p-2 pb-6 shadow-md rotate-2 transition-transform hover:-rotate-1 duration-500 w-full max-w-[280px]">
               <div className="w-full aspect-square bg-bg-floor flex items-center justify-center overflow-hidden border border-gray-200">
                  {boss.image ? (
                     <img src={boss.image} alt={boss.name} className="w-4/5 h-4/5 object-contain drop-shadow-lg" />
                  ) : (
                     <FaSkull className="w-16 h-16 text-white/20" />
                  )}
               </div>
               <div className="text-center mt-2 font-handwriting text-text-ink/50 text-sm">
                  Fig. A: {boss.name}
               </div>
            </div>

            {/* Stats sketched below */}
            <div className="mt-6 w-full space-y-3 font-handwriting text-lg text-text-ink">
                <div className="flex justify-between border-b border-text-ink/20 border-dashed pb-1">
                   <span className="font-bold flex items-center gap-2"><FaHeart className="text-accent-blood text-sm" /> Health:</span>
                   <span>{boss.health || '??'}</span>
                </div>
                <div className="flex justify-between border-b border-text-ink/20 border-dashed pb-1">
                   <span className="font-bold flex items-center gap-2"><FaExclamationTriangle className="text-accent-gold text-sm" /> Difficulty:</span>
                   <span>{boss.difficulty ? `${boss.difficulty}/5` : '?'}</span>
                </div>
            </div>
         </div>

         {/* Right: Content (Written notes) */}
         <div className="flex-1 overflow-y-auto relative">
            <h2 className="text-4xl md:text-5xl font-heading text-text-heading mb-4 border-b-2 border-text-ink pb-2 uppercase tracking-tight">
               {boss.name}
            </h2>

            <div className="mb-6 flex flex-wrap gap-2">
                {boss.location && (
                    <span className="font-handwriting text-xl px-3 py-1 border-2 border-text-ink rounded-full rotate-1 inline-block">
                        <FaMapMarkerAlt className="inline mr-1 text-accent-blood" /> 
                        {boss.location}
                    </span>
                 )}
            </div>

            <div className="prose prose-stone max-w-none font-handwriting text-xl leading-relaxed">
               <p className="first-letter:text-4xl first-letter:font-heading first-letter:mr-1 first-letter:float-left">
                  {boss.description || "No info recorded about this monstrosity..."}
               </p>
               
               {boss.strategy && (
                  <div className="mt-8 bg-white/30 p-4 -rotate-1 shadow-sm border border-text-ink/10">
                     <h4 className="font-heading text-lg mb-2 text-accent-blood">Strategy:</h4>
                     <p>{boss.strategy}</p>
                  </div>
               )}
            </div>
         </div>
      </motion.div>
    </div>
  );
}
