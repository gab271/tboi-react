import React from 'react';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-serif text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-blood text-white shadow hover:bg-blood/90 border border-blood",
        secondary: "bg-bg-1 text-fg shadow-sm hover:bg-bg-2 border border-border hover:border-gold/30 hover:text-gold",
        ghost: "hover:bg-bg-2 hover:text-fg text-muted",
        link: "text-gold underline-offset-4 hover:underline",
        outline: "border border-border bg-transparent shadow-sm hover:bg-bg-1 hover:text-fg",
        gold: "bg-gold text-bg-0 hover:bg-gold/90 font-bold",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
