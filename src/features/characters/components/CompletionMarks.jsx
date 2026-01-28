import { cn } from '../../../lib/utils';

// Symbol mapping for completion marks
// In a real TBoI app, these would be specific SVGs (Delirium wrinkled page, etc.)
// For now, we use available icons + rotation to simulate stamps.

const Symbol = ({ type, _color }) => {
    // Randomize rotation slightly for stamp effect
    const rot = Math.random() * 20 - 10;
    
    const style = {
        transform: `rotate(${rot}deg)`,
        filter: 'contrast(1.2) drop-shadow(0px 0px 1px rgba(0,0,0,0.2))'
    };

    switch(type) {
        case 'heart': return <span style={style} className="text-xl">❤</span>; // Mom's Heart
        case 'cross': return <span style={style} className="text-xl">✚</span>; // Isaac
        case 'star': return <span style={style} className="text-xl">★</span>; // Boss Rush
        case 'inverted-cross': return <span style={style} className="text-xl rotate-180">†</span>; // Satan
        case 'photo': return <span style={style} className="text-sm font-bold border-2 border-current px-1 h-5 flex items-center">P</span>; // Polaroid/Negative (Chest/Dark Room)
        case 'brimstone': return <span style={style} className="text-xl">∞</span>; // Mega Satan (approx)
        case 'delirium': return <span style={style} className="text-xl grayscale blur-[0.5px]">?</span>; // Delirium
        default: return null;
    }
};

export const CompletionMarks = ({ _marks = {}, isTainted = false }) => {
    // Marks Grid Layout (3x3 approx)
    // Row 1: Mom's Heart, Isaac, Boss Rush
    // Row 2: Satan, ???, Hush
    // Row 3: The Lamb, Mega Satan, Ultra Greed

    // Color logic: 
    // If Tainted: Usually marks are just Red
    // If Normal: Hard mode = Red, Normal = Black.
    // We will assume 'hard' for red and 'normal' for black for visual variety.
    
    // Hardcoded demo marks if none provided
    const demoMarks = [
        { id: 'heart', icon: 'heart', status: 'hard' },
        { id: 'isaac', icon: 'cross', status: 'hard' },
        { id: 'bossrush', icon: 'star', status: 'normal' },
        { id: 'satan', icon: 'inverted-cross', status: 'hard' },
        { id: 'bluebaby', icon: 'photo', status: 'hard' }, // ???
        { id: 'hush', icon: 'delirium', status: 'none' },
        { id: 'lamb', icon: 'inverted-cross', status: 'hard' },
        { id: 'megasatan', icon: 'brimstone', status: 'normal' },
        { id: 'greed', icon: 'star', status: 'hard' },
    ];
    
    const _inkColor = isTainted ? 'text-red-900' : 'text-black';
    const _stampColorVal = isTainted ? '#8b0000' : '#000';

    return (
        <div className={cn(
            "relative w-32 h-32 bg-[#e6dcc8] shadow-[2px_3px_5px_rgba(0,0,0,0.3)] transform rotate-2",
            "flex flex-col items-center justify-center p-1",
            "transition-all duration-300"
        )}>
            {/* Paper Texture / Crinkle */}
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none mix-blend-multiply"></div>
            
            {/* Top Tape (optional visuals) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-100/40 rotate-1 shadow-sm blur-[0.5px]"></div>

            <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1 border border-dashed border-[#d4c5a9]/50 p-1">
                {demoMarks.map((mark, i) => (
                    <div key={i} className="flex items-center justify-center w-full h-full relative">
                        {/* Grid lines helper (subtle) */}
                        <div className="absolute inset-0 border-[0.5px] border-[#d4c5a9]/30 pointer-events-none"></div>
                        
                        {/* Stamp */}
                        {mark.status !== 'none' && (
                            <div className={cn(
                                "animate-in fade-in zoom-in duration-500",
                                mark.status === 'hard' ? "text-[#a80000]" : "text-black"
                            )}>
                                <Symbol type={mark.icon} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Torn Corner */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-transparent shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.1)] rotate-45 transform bg-[#e6dcc8]" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'}}></div>
        </div>
    );
};
