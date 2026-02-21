import { cn } from '../../../lib/utils';
import { characterCompletionMarks } from '../data/completionMarks';

// CSS para simular el post-it de marcas.
// En una app real de producción, podríamos usar una imagen SVG exacta del juego, 
// pero aquí lo recreamos con CSS Grid para ser dinámicos.
const MarksGrid = ({ marks, size = "md" }) => {
  // Matriz de posicionamiento basada en el juego (3x3 grid approx + extras)
  // Hard Mode = borde rojo + símbolo lleno de sangre
  // Normal Mode = borde gris + símbolo negro
  
  // Layout oficial del post-it:
  // Mom's Heart (top-left) | Isaac (top) | Boss Rush (top-right)
  // Satan (left)           | ??? (center)| Hush (right)
  // Lamb (bottom-left)     | Mega Satan (bottom) | Delirium (bottom-right edge generally torn)
  // Mother & Beast & Greedier added in Repentance updates usually to the side or scrolling
  
  // Para simplificar la visualización estilo "Post-it"
  const isSm = size === 'sm';
  
  return (
    <div className={cn(
       "grid grid-cols-3 gap-1 p-2 bg-[#e6dcc8] shadow-sm transform rotate-1",
       isSm ? "w-full max-w-[120px] text-[10px]" : "w-48 text-sm",
       "border border-[#d4c5a9]"
    )}>
       {characterCompletionMarks.slice(0, 9).map((mark) => { // Mostrar solo las clásicas en la grid principal
          const status = marks[mark.id]; // 'none', 'normal', 'hard'
          const isActive = status && status !== 'none';
          const isHard = status === 'hard';

          return (
             <div 
               key={mark.id} 
               className={cn(
                 "flex items-center justify-center aspect-square transition-all",
                 isActive ? (isHard ? "text-red-700 font-bold drop-shadow-sm" : "text-black/80") : "opacity-10 grayscale brightness-150"
               )}
               title={`${mark.label} (${status || 'Locked'})`}
             >
                {/* Symbol Placeholder - In real usage, replace with specific SVGs */}
                {mark.icon}
             </div>
          )
       })}
       
       {/* Repentance Marks (Mother, Beast, etc) often appear on a separate tacked paper in-game UI */}
    </div>
  );
};

export const CharacterMarks = ({ marks, size = "md" }) => {
   return (
     <div className="flex flex-col items-center gap-1">
        <MarksGrid marks={marks} size={size} />
        {/* Greedier Badge */}
        {marks.greedier && marks.greedier !== 'none' && (
           <div className="mt-[-5px] z-10 bg-yellow-100 border border-yellow-300 px-1 py-0.5 text-[10px] shadow-sm rotate-[-3deg] text-yellow-800 font-bold uppercase">
              {marks.greedier === 'hard' ? 'Greedier!' : 'Greed'}
           </div>
        )}
     </div>
   );
}
