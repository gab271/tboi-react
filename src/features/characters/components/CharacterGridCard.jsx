import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { FaUser, FaGhost } from 'react-icons/fa';
import FavoriteButton from '../../../components/ui/FavoriteButton';

export function CharacterGridCard({ character, onClick }) {
  const rotation = character.isTainted ? 2 : -2;

  return (
    <div 
        onClick={() => onClick(character)}
        className={cn(
            "group relative flex flex-col items-center bg-[#fdfbf7] p-3 pb-8 cursor-pointer transition-all duration-300 ease-out border border-gray-200",
            character.isTainted ? "rotate-1 hover:-rotate-1" : "-rotate-1 hover:rotate-1",
            "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.2)] hover:scale-105 hover:z-10"
        )}
    >
        {/* Favorite Button */}
        <div 
            className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
        >
             <FavoriteButton entityType="character" entityId={character.id} />
        </div>

        {/* Photo Frame */}
        <div className={cn(
            "w-full aspect-[4/5] flex items-center justify-center relative mb-4 overflow-hidden border-4 border-white shadow-inner",
            character.isTainted ? "bg-[#2a2a2a]" : "bg-[#1a1a1a]"
        )}>
            {/* Glow */}
            <div className={cn(
                "absolute inset-0 blur-2xl rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-500",
                character.isTainted ? "bg-red-600" : "bg-yellow-500"
            )} />
            
            <img 
                src={character.image} 
                alt={character.name}
                loading="lazy"
                className={cn(
                    "w-3/4 h-3/4 object-contain drop-shadow-2xl z-10 filter transition-transform duration-500 group-hover:scale-110",
                    character.isTainted && "sepia-[.3]" 
                )}
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://placehold.co/100x100/1a1614/e6dcc8?text=?'; 
                }}
            />
        </div>

        {/* Name Label */}
        <div className="text-center w-full relative z-20">
            <h3 className={cn(
                "font-bold font-handwriting text-3xl mb-0 transition-colors",
                character.isTainted ? "text-text-heading group-hover:text-red-800" : "text-text-heading group-hover:text-accent-gold"
            )}>
                {character.name}
            </h3>
            <p className="font-handwriting text-text-dim text-sm">
                {character.isTainted ? "The Twisted" : "The Child"}
            </p>
        </div>
    </div>
  );
}
