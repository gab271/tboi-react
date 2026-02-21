import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export const Checkbox = ({ checked, onChange, label, className }) => {
  return (
    <label className={cn("group flex items-center gap-3 cursor-pointer select-none", className)}>
      <div 
        className="relative w-6 h-6 flex-shrink-0"
        onClick={() => onChange(!checked)}
      >
        {/* Hand-drawn box - created with SVG for irregular look */}
        <svg 
            viewBox="0 0 24 24" 
            className={cn(
                "w-full h-full text-black stroke-2 fill-transparent transition-all duration-300",
                checked ? "stroke-black" : "stroke-black/70 group-hover:stroke-black"
            )}
            style={{
                filter: "drop-shadow(1px 1px 0px rgba(0,0,0,0.1))"
            }}
        >
            {/* Irregular rectangle path */}
            <path d="M 2 2 L 22 3 L 23 22 L 3 21 Z" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* The Mark (X or Scribble) */}
        <motion.div
            initial={false}
            animate={checked ? "checked" : "unchecked"}
            variants={{
                checked: { opacity: 1, scale: 1 },
                unchecked: { opacity: 0, scale: 0.5 }
            }}
            transition={{ duration: 0.1, type: "spring", stiffness: 300 }}
            className="absolute inset-0 flex items-center justify-center text-accent-blood pointer-events-none"
        >
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current stroke-[3] fill-none stroke-linecap-round">
                 <path d="M 5 5 L 19 19 M 19 5 L 5 19" />
            </svg>
        </motion.div>
      </div>

      {label && (
        <span className={cn(
            "font-handwriting text-xl text-black transition-all duration-200",
            checked ? "font-bold text-accent-blood" : "group-hover:text-black/70 group-hover:line-through decoration-2 decoration-black/30"
        )}>
            {label}
        </span>
      )}
    </label>
  );
};
