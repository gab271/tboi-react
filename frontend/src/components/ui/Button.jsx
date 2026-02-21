import React from 'react';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "relative inline-flex items-center justify-center font-pixel text-lg uppercase tracking-wider transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 group overflow-visible",
  {
    variants: {
      variant: {
        primary: "text-text-heading hover:text-accent-blood",
        secondary: "bg-bg-paper-dark text-text-heading hover:bg-bg-paper border border-text-ink",
        ghost: "hover:bg-bg-paper-dark/20 text-text-dim hover:text-text-ink",
        outline: "border-2 border-text-ink text-text-heading hover:border-accent-blood hover:text-accent-blood",
        gold: "bg-accent-gold text-white border-black shadow-[4px_4px_0px_#000]",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-16 px-10 text-xl",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

// SVG for the sketchy circle
const SketchyCircle = () => (
    <svg 
        className="absolute inset-0 w-full h-full pointer-events-none text-accent-blood opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        viewBox="0 0 100 40" 
        preserveAspectRatio="none"
        style={{ transform: 'scale(1.2) rotate(-2deg)' }}
    >
        <path 
            d="M5,20 Q25,5 50,10 T95,20 Q80,35 50,30 T5,20" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeDasharray="200"
            strokeDashoffset="0"
        >
             <animate 
                attributeName="stroke-dashoffset" 
                from="200" 
                to="0" 
                dur="0.4s" 
                begin="mouseenter" 
                fill="freeze" 
             />
        </path>
    </svg>
);

const Button = React.forwardRef(({ className, variant, size, children, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {/* Absolute positioned sketch overlay for Primary/Outline variants */}
      {(variant === 'primary' || variant === 'outline' || variant === 'ghost') && <SketchyCircle />}
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
