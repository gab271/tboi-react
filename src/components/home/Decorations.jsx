// --- ANIMATIONS ---
const styles = `
@keyframes fly-move {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, -15px) rotate(45deg); }
  50% { transform: translate(-5px, 10px) rotate(90deg); }
  75% { transform: translate(15px, 5px) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}
`;

// --- COMPONENTS ---

export const Fly = ({ className, _delay = 0 }) => (
    <>
        <style>{styles}</style>
        <div 
            className={`absolute pointer-events-none drop-shadow-sm opacity-80 z-20 ${className}`}
            style={{ 
                animation: `fly-move ${2 + Math.random()}s infinite ease-in-out alternate`
            }}
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8C3 8 1 10 1 12C1 14 3 16 5 16C7 16 9 14 9 12C9 10 7 8 5 8ZM19 8C17 8 15 10 15 12C15 14 17 16 19 16C21 16 23 14 23 12C23 10 21 8 19 8Z" opacity="0.5"/>
                <circle cx="12" cy="12" r="5" fill="black"/>
                <path d="M10 4L12 8L14 4" stroke="black" strokeWidth="2"/>
                <path d="M8 18L12 14L16 18" stroke="black" strokeWidth="2"/>
            </svg>
        </div>
    </>
);

export const DoodleArrow = ({ className, text = "LOOK OUT!" }) => (
    <div className={`absolute pointer-events-none z-10 flex flex-col items-center group ${className}`}>
        <span className="font-handwriting font-bold text-red-800 -rotate-12 transform translate-y-2 text-sm whitespace-nowrap animate-pulse">
            {text}
        </span>
        <svg width="60" height="60" viewBox="0 0 100 100" className="text-black transform rotate-12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <path d="M20 20 Q 50 10 80 50" />
             <path d="M80 50 L 60 45" />
             <path d="M80 50 L 70 30" />
        </svg>
    </div>
);

export const FloorItem = ({ type = "penny", className }) => {
    if (type === "rock") {
        return (
            <div className={`absolute pointer-events-none z-0 opacity-80 ${className}`}>
                 <svg width="40" height="30" viewBox="0 0 40 30" fill="#5a5a5a" stroke="black" strokeWidth="2">
                     <path d="M5 20 Q 10 5 20 10 Q 35 5 35 20 Q 20 30 5 20 Z" />
                     {/* Cracks */}
                     <path d="M15 15 L 20 20 L 25 12" stroke="black" strokeWidth="1" fill="none" />
                 </svg>
            </div>
        )
    }
    // Default Penny
    return (
        <div className={`absolute pointer-events-none z-0 ${className}`}>
             <svg width="32" height="32" viewBox="0 0 32 32" className="drop-shadow-md">
                 <circle cx="16" cy="16" r="15" fill="#cd7f32" stroke="black" strokeWidth="2"/>
                 <circle cx="16" cy="16" r="10" fill="none" stroke="#b87333" strokeWidth="1"/>
                 <text x="16" y="21" fontSize="16" textAnchor="middle" fill="#5c4033" fontFamily="serif" fontWeight="bold">1¢</text>
             </svg>
        </div>
    )
}

export const ConnectorLine = ({ className }) => (
    <div className={`absolute pointer-events-none z-0 w-full top-0 left-0 h-full overflow-visible ${className}`}>
         <svg className="w-full h-full" preserveAspectRatio="none">
             {/* A Bezier curve connecting top to bottom implies explicit height handling, usually best placed in context.
                 For simplicity, we draw a generic meandering path. */}
            <path 
                d="M 50% 0 C 40% 100, 60% 200, 50% 300" 
                stroke="black" 
                strokeWidth="2" 
                strokeDasharray="5, 5" 
                fill="none" 
                opacity="0.1" 
                vectorEffect="non-scaling-stroke"
            />
         </svg>
    </div>
)
